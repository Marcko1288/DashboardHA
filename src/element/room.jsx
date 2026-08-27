import { FiActivity, FiHome, FiMonitor, FiMoon } from 'react-icons/fi';
import { MdMicrowave } from 'react-icons/md';

const data = [
  ['Ingresso', 'Zona Giorno', FiHome, [
    ['Luce Ingresso', 'light', 'light.ingresso_luce_ingresso'],
    ['Palline', 'other', 'switch.palline_socket_1'],
  ]],
  ['Soggiorno', 'Zona Giorno', FiMonitor, [
    ['Luce Soggiorno', 'light', 'light.luce_soggiorno'],
    ['Lampada', 'light', 'light.lampada'],
    ['Libreria', 'light', 'light.libreria'],
    ['Luminaria', 'other', 'switch.luminaria_socket_1'],
    ['Potenza Luminaria', 'sensor', 'sensor.luminaria_potenza'],
  ]],
  ['Cucina', 'Zona Giorno', MdMicrowave, [
    ['Luce Cucina', 'light', 'light.luce_cucina'],
    ['Forno', 'appliance', 'switch.forno_socket_1'],
    ['Potenza Forno', 'sensor', 'sensor.forno_potenza'],
    ['Balcone', 'other', 'switch.balcone_socket_1'],
  ]],
  ['Camera da letto', 'Zona Notte', FiMoon, [
    ['Luce Camera', 'light', 'light.luce_camera'],
    ['Tino', 'appliance', 'vacuum.tino'],
    ['Batteria Tino', 'sensor', 'sensor.tino_batteria'],
  ]],
  ['Bagno', 'Zona Notte', FiActivity, [
    ['Luce Bagno', 'light', 'light.luce_bagno'],
  ]],
];

export const initialRooms = data.map((row) => ({
  name: row[0],
  zone: row[1],
  icon: row[2],
  devices: row[3].map((device) => ({
    id: device[2],
    entityId: device[2],
    name: device[0],
    type: device[1],
    active: false,
    available: true,
    value: device[1] === 'sensor' ? '—' : undefined,
  })),
}));
