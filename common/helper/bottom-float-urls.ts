/**
 * フローティングナビを配置する画面のURL
 */
export const BOTTOM_FLOAT_URLS: BottomFloatUrlType[] = [];

export interface BottomFloatUrlType {
  url: string;
  float_height_pc: number;
  float_height_tb: number;
  float_height_sp: number;
}
