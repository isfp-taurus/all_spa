import { FlightAvailabilityAppInfoType } from '../flight-availability';

/**
 * アプリケーション情報Model
 */
export interface AppInfoModel {
  /**
   * 空席照会結果(国際)画面情報
   */
  flightAvailabilityDomesticAppInfo?: FlightAvailabilityAppInfoType;
}

/**
 * アプリケーション情報
 */
export type AppInfoType = (typeof AppInfoType)[keyof typeof AppInfoType];
export const AppInfoType: { [key in keyof Required<AppInfoModel>]: key } = {
  flightAvailabilityDomesticAppInfo: 'flightAvailabilityDomesticAppInfo',
};
