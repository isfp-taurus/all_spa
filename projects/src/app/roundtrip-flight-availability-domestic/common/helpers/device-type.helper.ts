import { DeviceType } from '../interfaces';
import { isPC, isTB } from '@lib/helpers';

/**
 * 現在デバイス種別かどうかの判定
 * @param device デバイス種別
 * @returns
 */
export function isCurrentDeviceType(device: DeviceType): boolean {
  let deviceType;
  if (isPC()) {
    deviceType = 'pc';
  } else if (isTB()) {
    deviceType = 'tb';
  } else {
    deviceType = 'sp';
  }
  let isCurrentDeviceType = true;
  switch (device) {
    case 'pc':
      isCurrentDeviceType = deviceType === 'pc' || deviceType === 'notSp' || deviceType === 'notTb';
      break;
    case 'sp':
      isCurrentDeviceType = deviceType === 'sp' || deviceType === 'notPc' || deviceType === 'notTb';
      break;
    case 'tb':
      isCurrentDeviceType = deviceType === 'tb' || deviceType === 'notSp' || deviceType === 'notPc';
      break;
    case 'notPc':
      isCurrentDeviceType = deviceType === 'notPc' || deviceType === 'sp' || deviceType === 'tb';
      break;
    case 'notTb':
      isCurrentDeviceType = deviceType === 'notTb' || deviceType === 'pc' || deviceType === 'sp';
      break;
    case 'notSp':
      isCurrentDeviceType = deviceType === 'notSp' || deviceType === 'pc' || deviceType === 'tb';
      break;
    default:
      break;
  }
  return isCurrentDeviceType;
}
