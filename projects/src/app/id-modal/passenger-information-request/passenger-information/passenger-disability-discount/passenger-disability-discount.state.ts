import { ReplaceParam } from '@lib/interfaces';

/**
 * 搭乗者情報入力　障がい割旅客種別　データ
 * @param disabilityType 障がい者種別
 * @param careReceiverTravelerId 被介助者搭乗者ID
 */
export interface PassengerInformationRequestDisabilityDiscountData {
  disabilityType: string;
  careReceiverTravelerId: string;
  isError: boolean;
}
export function initialPassengerDisabilityDiscountData(): PassengerInformationRequestDisabilityDiscountData {
  const ret: PassengerInformationRequestDisabilityDiscountData = {
    disabilityType: '',
    careReceiverTravelerId: '',
    isError: false,
  };
  return ret;
}
/**
 * 搭乗者情報入力　障がい割旅客種別　パーツ
 * @param disabilityTypeMap 障害種別の選択肢
 */
export interface PassengerInformationRequestDisabilityDiscountParts {
  disabilityTypeMap: Array<PassengerInformationRequestDisabilityDiscountDisabilityTypeMapParam>;
}
export function initialPassengerDisabilityDiscountParts(): PassengerInformationRequestDisabilityDiscountParts {
  const ret: PassengerInformationRequestDisabilityDiscountParts = {
    disabilityTypeMap: [],
  };
  return ret;
}

/**
 * 選択肢データの構造
 * @param value 値
 * @param disp 表示名
 * @param id 搭乗者ID
 */
export interface PassengerInformationRequestDisabilityDiscountDisabilityTypeMapParam {
  value: string;
  disp: string;
  id?: string;
}

/**
 * エラーメッセージ用のパラメータ
 */
export const PassengerInformationRequestDisabilityDiscountReplaceParamMap = {
  disabilityType: {
    key: 0,
    value: 'label.passengerType',
  } as ReplaceParam,
};
