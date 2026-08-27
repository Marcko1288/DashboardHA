const DEFAULT_BASE_URL = 'http://192.168.1.37:8123';
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

export function applyHomeAssistantStates(rooms, states) {
  const byId = new Map(states.map((state) => [state.entity_id, state]));

  return rooms.map((room) => ({
    ...room,
    devices: room.devices.map((device) => {
      if (!device.entityId) return device;
      const state = byId.get(device.entityId);
      if (!state) return { ...device, available: false };

      const unit = state.attributes?.unit_of_measurement;
      const rawValue = state.state;
      const value = device.type === 'sensor'
        ? `${rawValue}${unit ? ` ${unit}` : ''}`
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
