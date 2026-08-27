const DEFAULT_BASE_URL = 'http://192.168.1.37';
const URL_KEY = 'homehub-ha-url';
const TOKEN_KEY = 'homehub-ha-token';

export function getHomeAssistantConfig() {
  return {
    baseUrl: (localStorage.getItem(URL_KEY) || DEFAULT_BASE_URL).replace(/\/$/, ''),
    token: localStorage.getItem(TOKEN_KEY) || '',
  };
}

export function saveHomeAssistantConfig(baseUrl, token) {
  localStorage.setItem(URL_KEY, (baseUrl || DEFAULT_BASE_URL).replace(/\/$/, ''));
  localStorage.setItem(TOKEN_KEY, token || '');
}

async function request(path, options = {}) {
  const { baseUrl, token } = getHomeAssistantConfig();
  if (!token) throw new Error('Token Home Assistant non configurato');

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Home Assistant ${response.status}: ${body || response.statusText}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function fetchStates() {
  return request('/api/states');
}

export async function callEntityService(entityId, action = 'toggle') {
  const [domain] = entityId.split('.');
  let service = action;

  if (domain === 'vacuum') service = action === 'toggle' ? 'start' : action;
  if (!['light', 'switch', 'vacuum'].includes(domain)) {
    throw new Error(`Dominio non ancora controllabile dalla dashboard: ${domain}`);
  }

  return request(`/api/services/${domain}/${service}`, {
    method: 'POST',
    body: JSON.stringify({ entity_id: entityId }),
  });
}

function websocketUrl(baseUrl) {
  const url = new URL(baseUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/api/websocket';
  url.search = '';
  url.hash = '';
  return url.toString();
}

export function connectHomeAssistantEvents({ onStateChanged, onConnected, onDisconnected, onError }) {
  const { baseUrl, token } = getHomeAssistantConfig();
  if (!token) throw new Error('Token Home Assistant non configurato');

  let closedByClient = false;
  let socket;

  const connect = () => {
    socket = new WebSocket(websocketUrl(baseUrl));

    socket.onmessage = (message) => {
      let payload;
      try {
        payload = JSON.parse(message.data);
      } catch {
        return;
      }

      if (payload.type === 'auth_required') {
        socket.send(JSON.stringify({ type: 'auth', access_token: token }));
        return;
      }

      if (payload.type === 'auth_ok') {
        socket.send(JSON.stringify({ id: 1, type: 'subscribe_events', event_type: 'state_changed' }));
        onConnected?.();
        return;
      }

      if (payload.type === 'auth_invalid') {
        onError?.(new Error(payload.message || 'Autenticazione WebSocket non valida'));
        return;
      }

      if (payload.type === 'event' && payload.event?.event_type === 'state_changed') {
        onStateChanged?.(payload.event.data);
      }
    };

    socket.onerror = () => onError?.(new Error('Errore connessione WebSocket Home Assistant'));

    socket.onclose = () => {
      onDisconnected?.();
      if (!closedByClient) setTimeout(connect, 2000);
    };
  };

  connect();

  return () => {
    closedByClient = true;
    if (socket && socket.readyState <= WebSocket.OPEN) socket.close();
  };
}

export function applyHomeAssistantState(rooms, state) {
  return rooms.map((room) => ({
    ...room,
    devices: room.devices.map((device) => {
      if (!device.entityId || device.entityId !== state.entity_id) return device;

      const unit = state.attributes?.unit_of_measurement;
      const value = device.type === 'sensor'
        ? `${state.state}${unit ? ` ${unit}` : ''}`
        : device.value;

      return {
        ...device,
        available: state.state !== 'unavailable' && state.state !== 'unknown',
        active: ['on', 'playing', 'cleaning', 'returning', 'paused'].includes(state.state),
        value,
        haState: state.state,
      };
    }),
  }));
}

export function applyHomeAssistantStates(rooms, states) {
  return states.reduce((current, state) => applyHomeAssistantState(current, state), rooms);
}
