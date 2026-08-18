import {
  FiActivity,
  FiAlertTriangle,
  FiArrowLeft,
  FiCamera,
  FiChevronDown,
  FiCloud,
  FiDroplet,
  FiHome,
  FiLock,
  FiMenu,
  FiMonitor,
  FiMoon,
  FiPower,
  FiThermometer,
  FiX,
  FiZap
}
  from 'react-icons/fi';
import {
  MdBlinds,
  MdLightbulbOutline,
  MdLocalLaundryService,
  MdMicrowave
}
  from 'react-icons/md';
const data = [
    [
        'Corridoio Ingresso', 
        'Zona Giorno', 
        FiHome, 
        [
            ['Luce Ingresso', 'light', true], 
            ['Sensore Porta Ingresso', 'security', false], 
            ['Videocitofono', 'other', true], 
            ['Porta Ingresso', 'door', false]
        ]
    ], 
    [
        'Soggiorno', 
        'Zona Giorno', 
        FiMonitor, 
        [
            ['Luce Divano', 'light', true], 
            ['Luce Tavolo', 'light', false],
            ['Lampada', 'light', false], 
            ['Sensore Temperatura Soggiorno', 'sensor', true, '22,4 °C'], 
            ['Telecamera Soggiorno', 'security', true], 
            ['Tapparella Soggiorno', 'blind', false]
        ]
    ], 
    [
        'Cucina', 
        'Zona Giorno', 
        MdMicrowave, 
        [
            ['Luce Cucina', 'light', true], 
            ['Luce Penisola', 'light', false], 
            ['Sensore Temperatura Cucina', 'sensor', true, '23,1 °C'], 
            ['Telecamera Cucina', 'security', true], 
            ['Tapparella Cucina', 'blind', false], 
            ['Lavastoviglie', 'appliance', true, 'In corso']
        ]
    ], 
    [
        'Corridoio', 
        'Zona Notte', 
        FiActivity, 
        [
            ['Luce Corridoio', 'light', true], 
            ['Telecamera Corridoio', 'security', true]
        ]
    ], 
    [
        'Camera', 
        'Zona Notte', 
        FiMoon, 
        [
            ['Luce Camera', 'light', false], 
            ['Sensore Temperatura Camera', 'sensor', true, '21,6 °C'], 
            ['Tapparella Camera', 'blind', false]
        ]
    ], 
    [
        'Camera Matrimoniale', 
        'Zona Notte', 
        FiMoon, 
        [
            ['Luce Camera Matrimoniale', 'light', false], 
            ['Lampada', 'light', true], 
            ['Sensore Temperatura Camera Matrimoniale', 'sensor', true, '21,8 °C'], 
            ['Tapparella Camera Matrimoniale', 'blind', false]
        ]
    ], 
    [
        'Bagno Grande', 
        'Zona Notte', 
        FiActivity, 
        [
            ['Luce Bagno Grande', 'light', false], 
            ['Sensore Temperatura Bagno Grande', 'sensor', true, '23,5 °C'], 
            ['Termoarredo', 'other', true, '45 °C']
        ]
    ], 
    [
        'Bagno Piccolo', 
        'Zona Notte', 
        FiActivity, 
        [
            ['Luce Bagno Piccolo', 'light', false], 
            ['Sensore Temperatura Bagno Piccolo', 'sensor', true, '23,0 °C'], 
            ['Lavatrice', 'appliance', false]
        ]
    ],
];

export const initialRooms = data.map(function (row) {
  return {
    name: row[0], zone: row[1], icon: row[2], devices: row[3].map(function (device, index) {
      return {
        id: device[0] + '-' + index, name: device[0], type: device[1], active: device[2], value: device[3]
      }
    })
  }
});