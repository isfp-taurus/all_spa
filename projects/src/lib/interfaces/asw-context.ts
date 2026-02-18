import { AnaBizLoginStatusType } from './ana-biz-login-status';
import { BookingType } from './booking-type';
import { BrowserType } from './browser-type';
import { DeviceType } from './device-type';
import { LoginStatusType } from './login-status';
import { MobileDeviceType } from './mobile-device';
import { InitializationResponseDataAswContext } from 'src/sdk-initialization';
import { CamelToSnake } from './camel-to-snake';
import { SnakeToCamelCase } from './snake-to-camel';

/**
 * ユーザー共通情報
 */
export interface AswContextModel
  extends Omit<
    InitializationResponseDataAswContext,
    | 'bookingType'
    | 'deviceType'
    | 'browserType'
    | 'mobileDeviceType'
    | 'loginStatus'
    | 'isViaGoshokaiNet'
    | 'isAnaApl'
    | 'anaBizLoginStatus'
    | 'isDummyOffice'
    | 'returnUrl'
  > {
  bookingType: BookingType;
  deviceType: DeviceType;
  browserType: BrowserType;
  mobileDeviceType: MobileDeviceType;
  loginStatus: LoginStatusType;
  isViaGoshokaiNet: boolean;
  isAnaApl: boolean;
  anaBizLoginStatus: AnaBizLoginStatusType;
  isDummyOffice: boolean;
  returnUrl: string;
}
/**
 * キーリスト @see {@link AswContextModel}
 * インターフェイスのキー かつ キー = valueの定義
 */
export type AswContextType = (typeof AswContextType)[keyof typeof AswContextType];
export const AswContextType: {
  [key in Uppercase<keyof Required<CamelToSnake<AswContextModel>>>]: SnakeToCamelCase<Lowercase<key>> &
    keyof AswContextModel;
} = {
  LANG: 'lang',
  BOOKING_TYPE: 'bookingType',
  DEVICE_TYPE: 'deviceType',
  BROWSER_TYPE: 'browserType',
  MOBILE_DEVICE_TYPE: 'mobileDeviceType',
  LOGIN_STATUS: 'loginStatus',
  IS_VIA_GOSHOKAI_NET: 'isViaGoshokaiNet',
  IS_ANA_APL: 'isAnaApl',
  IS_DUMMY_OFFICE: 'isDummyOffice',
  META_CONNECTION_KIND: 'metaConnectionKind',
  META_LANG: 'metaLang',
  POINT_OF_SALE_ID: 'pointOfSaleId',
  CURRENCY_CODE: 'currencyCode',
  POS_COUNTRY_CODE: 'posCountryCode',
  APF_CODE: 'apfCode',
  INTRODUCE_NUMBER: 'introduceNumber',
  INTRODUCER_LAST_NAME: 'introducerLastName',
  INTRODUCER_FIRST_NAME: 'introducerFirstName',
  OS_VERSION: 'osVersion',
  ANA_BIZ_LOGIN_STATUS: 'anaBizLoginStatus',
  RETURN_URL: 'returnUrl',
};
