import { MListData } from '@common/interfaces';

/**
 * 1.2.1.8	サポート情報表示 データ
 * @param walk 歩行障がい
 * @param blind 視覚障がい
 * @param deaf 聴覚障がい
 * @param isPregnant 妊婦
 * @param walkLevel? 歩行の程度
 * @param walkLevelDisplayValue 表示用歩行の程度
 * @param bringWheelchair 車いす持ち込み有無
 * @param bringWheelchairDisplayValue 表示用車いす持ち込み有無
 * @param wheelchairFoldable 折りたたみ可否
 * @param wheelchairFoldableDisplayValue 折りたたみ可否
 * @param wheelchairType 車いす種類
 * @param wheelchairTypeDisplayValue 表示用車いす種類
 * @param wheelchairBatteryType 表示用バッテリータイプ
 * @param wheelchairBatteryTypeDisplayValue バッテリータイプ
 * @param wheelchairDepth　車いす高さ
 * @param wheelchairWidth　車いす横幅
 * @param wheelchairHeight　車いす縦幅
 * @param wheelchairWeight　車いす重さ
 * @param doctorName 妊婦情報 医師の名前
 * @param doctorCountryPhoneExtension 妊婦情報 医師の電話番号国
 * @param doctorPhoneNumber 妊婦情報 医師の電話番号
 * @param pregnantDueDate 妊婦情報 出産予定日
 * @param pregnantCondition　妊婦情報　現在の状況
 */
export interface PassengerInformationRequestPassengerSupportData {
  walk: boolean;
  blind: boolean;
  deaf: boolean;
  isPregnant: boolean;
  walkLevel: string;
  walkLevelDisplayValue: string;
  bringWheelchair?: boolean;
  bringWheelchairDisplayValue: string;
  wheelchairFoldable?: boolean;
  wheelchairFoldableDisplayValue: string;
  wheelchairType: string;
  wheelchairTypeDisplayValue: string;
  wheelchairBatteryType: string;
  wheelchairBatteryTypeDisplayValue: string;
  wheelchairDepth: number;
  wheelchairWidth: number;
  wheelchairHeight: number;
  wheelchairWeight: number;
  doctorName: string;
  doctorCountryPhoneExtension: string;
  doctorPhoneNumber: string;
  pregnantDueDate?: Date;
  pregnantCondition: string;
  pregnantConditionDisplayValue: string;
  isError: boolean;
}
export function initialPassengerInformationRequestPassengerSupportData(): PassengerInformationRequestPassengerSupportData {
  const ret: PassengerInformationRequestPassengerSupportData = {
    isError: false,
    walk: false,
    blind: false,
    deaf: false,
    isPregnant: false,
    walkLevel: '',
    walkLevelDisplayValue: '',
    bringWheelchair: false,
    bringWheelchairDisplayValue: '',
    wheelchairFoldable: false,
    wheelchairFoldableDisplayValue: '',
    wheelchairType: '',
    wheelchairTypeDisplayValue: '',
    wheelchairBatteryType: '',
    wheelchairBatteryTypeDisplayValue: '',
    wheelchairDepth: 0,
    wheelchairWidth: 0,
    wheelchairHeight: 0,
    wheelchairWeight: 0,
    doctorName: '',
    doctorCountryPhoneExtension: '',
    doctorPhoneNumber: '',
    pregnantDueDate: undefined,
    pregnantCondition: '',
    pregnantConditionDisplayValue: '',
  };
  return ret;
}
/**
 * 1.2.1.8	サポート情報表示パーツ
 * @param pd006 リストデータPD_006 サポート情報の説明
 * @param pd020 リストデータPD_020 サポート情報　妊婦の現在の状態
 * @param pd960 リストデータPD_960 バッテリータイプの表示名称
 */
export interface PassengerInformationRequestPassengerSupportParts {
  pd006: Array<MListData>;
  pd020: Array<MListData>;
  pd960: Array<MListData>;
}
export function initialPassengerInformationRequestPassengerSupportParts(): PassengerInformationRequestPassengerSupportParts {
  const ret: PassengerInformationRequestPassengerSupportParts = {
    pd006: [],
    pd020: [],
    pd960: [],
  };
  return ret;
}
