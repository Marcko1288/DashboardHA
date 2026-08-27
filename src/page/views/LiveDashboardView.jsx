import { useEffect, useMemo, useState } from 'react';
import { FiActivity, FiHome, FiMonitor, FiRefreshCw, FiZap } from 'react-icons/fi';
import { initialRooms } from '../../element/room';
import { icons } from '../../element/icons';
import { groups } from '../../element/groups';
import {
  applyHomeAssistantState,
  applyHomeAssistantStates,
  callEntityService,
  connectHomeAssistantEvents,
  fetchStates,
  getHomeAssistantConfig,
  saveHomeAssistantConfig,
} from '../../services/homeAssistant';
import { themeCss, nightCss, weatherCss, mobileHeaderCss, sensorCss, modalCss, css } from '../style/DashboardCss';

const canControl = (device) => ['light', 'switch', 'vacuum'].includes(device.entityId?.split('.')[0]);

export default function LiveDashboardView() {
  const [rooms, setRooms] = useState(initialRooms);
  const [status, setStatus] = useState(getHomeAssistantConfig().token ? 'connecting' : 'setup');
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('homehub-theme') || 'blue');
  const [layout, setLayout] = useState(() => localStorage.getItem('homehub-layout') || 'default');
  const initialConfig = getHomeAssistantConfig();
  const [baseUrl, setBaseUrl] = useState(initialConfig.baseUrl);
  const [token, setToken] = useState(initialConfig.token);

  const appliedLayout = layout === 'default'
    ? (new Date().getHours() >= 7 && new Date().getHours() < 20 ? 'light' : 'night')
    : layout;

  const active = useMemo(() => rooms.flatMap((room) => room.devices)
    .filter((device) => device.active && canControl(device)).length, [rooms]);

  async function refresh({ silent = false } = {}) {
    try {
      if (!silent) setStatus((current) => current === 'connected' ? current : 'connecting');
      setError('');
      const states = await fetchStates();
      setRooms((current) => applyHomeAssistantStates(current, states));
      setStatus('connected');
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  }

  useEffect(() => {
    if (!getHomeAssistantConfig().token) {
      setStatus('setup');
      return undefined;
    }

    refresh();

    const disconnect = connectHomeAssistantEvents({
      onConnected: () => {
        setStatus('connected');
        setError('');
      },
      onDisconnected: () => setStatus('connecting'),
      onError: (err) => setError(err.message),
      onStateChanged: ({ new_state: newState }) => {
        if (newState) setRooms((current) => applyHomeAssistantState(current, newState));
      },
    });

    return disconnect;
  }, []);

  useEffect(() => localStorage.setItem('homehub-theme', theme), [theme]);
  useEffect(() => localStorage.setItem('homehub-layout', layout), [layout]);

  async function toggle(device) {
    if (!canControl(device)) return;

    const previousActive = device.active;
    setRooms((current) => current.map((room) => ({
      ...room,
      devices: room.devices.map((item) => item.id === device.id
        ? { ...item, active: !previousActive }
        : item),
    })));

    try {
      await callEntityService(device.entityId);
    } catch (err) {
      setRooms((current) => current.map((room) => ({
        ...room,
        devices: room.devices.map((item) => item.id === device.id
          ? { ...item, active: previousActive }
          : item),
      })));
      setError(err.message);
      setStatus('error');
    }
  }

  function saveConnection(event) {
    event.preventDefault();
    saveHomeAssistantConfig(baseUrl, token.trim());
    window.location.reload();
  }

  const showConnectionCard = status === 'setup' || status === 'error';
  const statusLabel = status === 'connected' ? 'Online' : status === 'connecting' ? 'Connessione…' : 'Da configurare';

  return <main data-theme={theme} data-layout={appliedLayout}>
    <style>{css + themeCss + nightCss + mobileHeaderCss + weatherCss + sensorCss + modalCss}</style>
    <aside>
      <div className="brand">HOME<span>HUB</span>
        <small className="live desktop-live"><i />{status === 'connected' ? 'Home Assistant connesso' : statusLabel}</small>
      </div>
      <nav className="open">
        <button className="selected"><FiHome />Panoramica</button>
        <button onClick={() => refresh()}><FiRefreshCw />Aggiorna</button>
        <p className="live desktop-live"><i />{status === 'connected' ? 'Sistema connesso' : statusLabel}</p>
      </nav>
    </aside>

    <section className="content">
      <header><p>Home Assistant</p><h1>La tua casa, sotto controllo.</h1></header>

      <section className="stats">
        <button><FiZap /><span>Dispositivi attivi<b>{active}</b></span></button>
        <button><FiActivity /><span>Stato HA<b>{statusLabel}</b></span></button>
        <button><FiMonitor /><span>Server<b>{baseUrl.replace(/^https?:\/\//, '')}</b></span></button>
      </section>

      {showConnectionCard && <section className="settings">
        <article>
          <h2>Collegamento Home Assistant</h2>
          <p>Inserisci l'indirizzo locale e un Long-Lived Access Token. Il token resta nel localStorage di questo browser e non va committato nel repository.</p>
          <form onSubmit={saveConnection} style={{display:'grid', gap:12}}>
            <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="http://192.168.1.37" />
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Long-Lived Access Token" />
            <button type="submit">Salva e collega</button>
          </form>
          {error && <p>{error}</p>}
        </article>
      </section>}

      <section className="rooms">
        {rooms.map((room) => {
          const RoomIcon = room.icon;
          const sections = room.devices.reduce((all, device) => {
            const title = device.type === 'sensor' ? 'Sensori' : (groups[device.type] || 'Dispositivi');
            all[title] = (all[title] || []).concat(device);
            return all;
          }, {});
          return <article className="room" key={room.name}>
            <div className="room-head"><div className="room-title"><i><RoomIcon /></i><span><b>{room.name}</b></span></div></div>
            {Object.entries(sections).map(([title, devices]) => <section className="area" key={title}>
              <header><h3>{title}</h3></header>
              <div className="devices">
                {devices.map((device) => {
                  const Icon = icons[device.type] || FiActivity;
                  const controllable = canControl(device);
                  return <button
                    className={'device ' + (device.active ? 'on' : '')}
                    key={device.id}
                    disabled={!controllable || device.available === false}
                    onClick={() => toggle(device)}
                    title={device.entityId}
                  >
                    <i><Icon /></i><span><b>{device.name}</b>{device.type === 'sensor' && <small>{device.value}</small>}</span>
                  </button>;
                })}
              </div>
            </section>)}
          </article>;
        })}
      </section>

      <section className="settings"><article>
        <h2>Aspetto</h2>
        <div className="choices">
          {['light', 'night', 'default'].map((item) => <button key={item} className={layout === item ? 'selected' : ''} onClick={() => setLayout(item)}>{item}</button>)}
        </div>
        <div className="colors">
          {['blue', 'green', 'purple', 'gray', 'black', 'yellow', 'red', 'teal'].map((item) => <button key={item} data-color={item} className={theme === item ? 'selected' : ''} onClick={() => setTheme(item)} />)}
        </div>
      </article></section>
    </section>
  </main>;
}
