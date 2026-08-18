import {
  FiCamera, 
  FiLock, 
  FiPower, 
  FiThermometer, 
}
  from 'react-icons/fi';
import {
  MdBlinds, 
  MdLightbulbOutline, 
  MdLocalLaundryService
}
  from 'react-icons/md';

export const icons = {
  light: MdLightbulbOutline,
  security: FiCamera,
  sensor: FiThermometer,
  blind: MdBlinds,
  appliance: MdLocalLaundryService,
  door: FiLock,
  other: FiPower
};