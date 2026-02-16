/**
 * デバイス種別
 */
export type DeviceType = 'pc' | 'sp' | 'tb' | 'notPc' | 'notSp' | 'notTb';
export const DeviceType = {
  PC: 'pc' as DeviceType,
  SP: 'sp' as DeviceType,
  TB: 'tb' as DeviceType,
  NOT_PC: 'notPc' as DeviceType,
  NOT_SP: 'notSp' as DeviceType,
  NOT_TB: 'notTb' as DeviceType,
};

/**
 * デバイスCSS種別
 */
export type DeviceCssType = {
  [key in DeviceType]?: string;
};
