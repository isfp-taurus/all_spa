import { MSpecialMeal, MListData, MPreorderMeal } from '@common/interfaces';

/**
 * 更新サービス情報
 * segment バウンド情報
 */
export interface ServiceApplicationModalBoundInformation {
  bounds: Array<ServiceApplicationModalBoundInformationItem>;
}
export interface ServiceApplicationModalBoundInformationItem extends ServiceApplicationModalSegmentInformation {
  boundId: string;
  isBoundUpdate: boolean;
}

/**
 * 更新サービス情報
 * @param segment セグメント情報
 */
export interface ServiceApplicationModalSegmentInformation {
  segment: Array<ServiceApplicationModalSegmentInformationSegment>; // セグメント情報
}

/**
 * 更新サービス情報
 * @param segmentInfo セグメント情報
 */
export interface ServiceApplicationModalSegmentInformationReturn {
  segmentInfo: ServiceApplicationModalSegmentInformation;
}

/**
 * 更新サービス情報.segment
 * @param segmentId セグメントID
 * @param airportCode 出発地の空港コード
 * @param locationName 出発地の空港名
 * @param airportCodeTo　到着地の空港コード　手荷物、機内食のみで使う
 * @param locationNameTo　到着地の空港名　手荷物、機内食のみで使う
 * @param updateSegmentFlag セグメントの更新フラグ
 * @param passengerInformation 搭乗者情報
 */
export interface ServiceApplicationModalSegmentInformationSegment {
  segmentId: string;
  airportCode: string;
  locationName: string;
  airportCodeTo?: string;
  locationNameTo?: string;
  updateSegmentFlag: boolean;
  passengerInformation: Array<ServiceApplicationModalSegmentInformationPassengerInformation>;
  isJapanFlightSeg?: boolean;
  isAvailable?: boolean;
}
/**
 * 更新サービス情報.segment.passengerInformation
 * @param id 搭乗者ID
 * @param isWaived: 有効フラグ ラウンジのみで使う
 * @param PassengerType　搭乗者種別
 * @param travelers 搭乗者リスト
 * @param ssr SSR情報
 * @param updateType 更新種別 ラウンジ、手荷物のみで使う
 */
export interface ServiceApplicationModalSegmentInformationPassengerInformation {
  id: string;
  isWaived: boolean;
  PassengerType: string;
  travelers: Array<Array<ServiceApplicationModalSegmentInformationPassengerInformationTravelers>>;
  ssr: ServiceApplicationModalSegmentInformationPassengerInformationSsr;
  updateType: string;
}
/**
 * 更新サービス情報.segment.passengerInformation.travelers
 * @param id 搭乗者ID
 * @param name 搭乗者表示氏名
 * @param type 搭乗者種別
 */
export interface ServiceApplicationModalSegmentInformationPassengerInformationTravelers {
  id: string;
  name: string;
  type: string;
}
/**
 * 更新サービス情報.segment.passengerInformation.ssr
 * @param code SSRコード
 * @param prevCode 変更前SSRコード
 * @param meal 選択状態　機内食
 * @param selectedList 選択状態 ラウンジ、手荷物のみで使う
 */
export interface ServiceApplicationModalSegmentInformationPassengerInformationSsr {
  code: string;
  prevCode: string;
  meal: Array<ServiceApplicationModalSegmentInformationPassengerInformationSsrMeal>;
  selectedList: Array<ServiceApplicationModalSegmentInformationPassengerInformationSsrSelectedList>;
}

/**
 * 更新サービス情報.segment.passengerInformation.ssr.selectedList
 * @param quota 在庫
 * @param catalogCode カタログSSRコード
 * @param dispName 表示名
 * @param isSelected 選択状態
 * @param isTotalDisp 金額表示フラグ
 * @param total 金額
 * @param currencyCode 通貨コード
 * @param status 更新種別
 */
export interface ServiceApplicationModalSegmentInformationPassengerInformationSsrSelectedList {
  quota: string;
  catalogCode: string;
  dispName: string;
  isSelected: boolean;
  isTotalDisp: boolean;
  total: number;
  currencyCode: string;
  status?: string;
}

/**
 * 更新サービス情報.segment.passengerInformation.ssr.meal   機内食のみで使う
 * @param isWithinApplicationDeadline　期限切れフラグ
 * @param type 機内食種別
 * @param code: 機内食コード（SSRコード）
 * @param prevCode: 変更前機内食コード
 * @param prevMessageId:事前オーダーメッセージID
 * @param total 金額
 * @param currencyCode 通貨コード
 * @param isBabySelected ベビーミールフラグ
 * @param updateType 更新種別
 */
export interface ServiceApplicationModalSegmentInformationPassengerInformationSsrMeal {
  isWithinApplicationDeadline: boolean;
  type: string;
  code: string;
  prevCode: string;
  prevMessageId: string;
  total: number;
  currencyCode: string;
  isBabySelected: boolean;
  updateType: string;
}
/**
 * 機内食種別マップ
 * @param code　コード
 * @param value 値
 */
export interface MealApplicationPassengerMealInfo {
  code: string;
  value: string;
}

/**
 * サービス申し込み画面で使用する空港情報
 * @param airportCode 出発地 空港コード
 * @param locationName 出発地 空港名
 * @param airportCodeTo 到着地　空港コード
 * @param locationNameTo 到着地 空港名
 */
export interface ServiceApplicationAirportInfo {
  airportCode: string;
  locationName: string;
  airportCodeTo: string;
  locationNameTo: string;
}

/**
 * 機内食申込画面 (R01-M053)の表示用の保持データ
 * @param travelerId　搭乗者ID
 * @param passengerTypeCode 搭乗者種別コード　ADT,B15...
 * @param travelers: 搭乗者名情報
 * @param segment: セグメント
 */
export interface MealApplicationPassengerMapInfo {
  travelerId: string;
  passengerTypeCode: string;
  travelers: ServiceApplicationModalSegmentInformationPassengerInformationTravelers & { isInf: boolean };
  segment: Array<MealApplicationPassengerMapInfoSegment>;
}
/**
 * 機内食申込画面 (R01-M053)の表示用の保持データ.segement
 * @param segmentId　セグメントID
 * @param airportCode 出発地の空港コード
 * @param locationName: 出発地の空港名
 * @param irportCodeTo: 到着地の空港コード
 * @param locationNameTo: 到着地の空港名
 * @param meals: 機内食情報リスト
 * @param mealDisabled: 機内食選択可否
 */
export interface MealApplicationPassengerMapInfoSegment {
  segmentId: string;
  airportCode: string;
  locationName: string;
  airportCodeTo: string;
  locationNameTo: string;
  meals: Array<MealApplicationPassengerMapInfoSegmentMeal>;
  buttonDisabled: boolean;
}
/**
 * 機内食申込画面 (R01-M053)の表示用の保持データ.segement.meals
 * @param mealType　機内食種別
 * @param mealTypeLabel　機内食種別
 * @param isTypeDisp 機内食種別表示フラグ
 * @param isSelected 選択状態
 * @param isDelete 取消除可能フラグ
 * @param prevMealCode: 変更前機内食コード(SSRコード)
 * @param mealCode 機内食コード(SSRコード)
 * @param total 料金
 * @param currencyCode 通貨コード
 * @param dispName 表示名
 * @param isWithinApplicationDeadline　期限切れフラグ
 * @param bbmlChkDisabled ベビーミール選択チェックボックス表示判定
 */
export interface MealApplicationPassengerMapInfoSegmentMeal {
  mealType: string;
  mealTypeLabel: string;
  isTypeDisp: boolean;
  isSelected: boolean;
  isDelete: boolean;
  prevMealCode: string;
  mealCode: string;
  total: number;
  currencyCode: string;
  dispName: string;
  isWithinApplicationDeadline: boolean;
  bbmlChkShow: boolean;
}

/**
 * 機内食申込画面 (R01-M053)で使用するcacheデータ群
 * @param air 言語別空港名マスタ
 * @param specialMeal 特別機内食マスタ
 * @param listDataSsr　機内食リストデータ
 * @param listDataCategory 機内食カテゴリリストデータ
 */
export interface MealApplicationMastarData {
  air: { [key: string]: string };
  specialMeal: Array<MSpecialMeal>;
  listDataSsr: Array<MListData>;
  listDataCategory: Array<MListData>;
}

export function initialMealApplicationMastarData(): MealApplicationMastarData {
  return {
    air: {},
    specialMeal: [],
    listDataSsr: [],
    listDataCategory: [],
  };
}

/**
 * 機内食種別 画面用
 *
 * @param SPECIAL 特別機機内食
 * @param CHARGEABLE 有料機内食
 * @param PREORDER 事前オーダー
 * @param UNKNOWN 不明
 *
 */
export type MealApplicationSelectMealType =
  (typeof MealApplicationSelectMealType)[keyof typeof MealApplicationSelectMealType];
export const MealApplicationSelectMealType = {
  SPECIAL: 'specialMeal',
  CHARGEABLE: 'chargeableMeal',
  PREORDER: 'preorderMeal',
  UNKNOWN: '',
} as const;

/**
 * 固定文言
 */
export const SERVICE_APPLICATION_STATUS_REQUEST = 'request';
export const SERVICE_APPLICATION_STATUS_CANCEL = 'cancel';
export const SERVICE_APPLICATION_STATUS_REQUESTED = 'requested';
export const SERVICE_APPLICATION_LOUG_CODE = 'LOUG';
export const SERVICE_APPLICATION_MYLG_CODE = 'MYLG';
export const SERVICE_APPLICATION_FBAG_CODE = 'FBAG';
export const SERVICE_APPLICATION_BABY_MEAL_CODE = 'BBML';
export const SERVICE_APPLICATION_CHILD_MEAL_CODE = 'CHML';

/**
 * メッセージID
 */
export const SERVICE_APPLICATION_LOUG_ID = 'label.loungeName.ssrLoug2';
export const SERVICE_APPLICATION_MYLG_ID = 'label.loungeName.ssrMylg';
export const SERVICE_APPLICATION_CANCEL_MESSAGE_ID = 'm_dynamic_message-MSG0524';
export const SERVICE_APPLICATION_SUBMIT_MESSAGE_ID = 'm_dynamic_message-MSG1011';
export const SERVICE_APPLICATION_SUBMIT_SECOND_MESSAGE_ID = 'm_dynamic_message-MSG0459';
export const SERVICE_APPLICATION_SAME_MEAL_MESSAGE_ID = 'm_dynamic_message-MSG1012';

export const SERVICE_APPLICATION_FREE_APPLICATION_ID = 'label.useFree';
export const SERVICE_APPLICATION_NON_STOCK_ID = 'label.soldOut';
export const SERVICE_APPLICATION_NORMAL_MEAL_ID = 'label.normalMeal';
export const SERVICE_APPLICATION_NOT_PREORDER_MEAL_ID = 'label.chooseOnBoard';
export const SERVICE_APPLICATION_UNKOWN_MEAL_ID = 'label.unknownMenu';
export const SERVICE_APPLICATION_UNAVALIABLE_ID = 'label.unavailable';

export const SERVICE_LIGHTMEAL_ID = 'label.lightMeal';
export const SERVICE_MEAL_ID = 'label.meal';
export const SERVICE_REFRESHMENTS_ID = 'label.refreshments';
