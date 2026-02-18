import { FareConditionsState, GetOrderState } from '@common/store';

/**
 * 外部から手荷物ルールに読み込ませるデータ
 * @param fareConditions 運賃ルール・手荷物情報取得APIレスポンス
 * @param getOrder PNR情報取得レスポンス
 */
export interface MybookingBaggageRulesInput {
  fareConditions: FareConditionsState;
  getOrder: GetOrderState;
}

/**
 * 外部から手荷物ルールに読み込ませるデータ
 * @param policyRegulations 手荷物ルール
 * @param info 手荷物ルール　表示用の中身
 */
export interface MybookingBaggageRulesDisp {
  policyRegulations: string;
  info: Array<MybookingBaggageRulesDispInfo>;
  isDomestic: boolean;
}

/**
 * 外部から手荷物ルールに読み込ませるデータ
 * @param departure 出発地名
 * @param arrival 到着地名
 * @param careerNameCheckedBaggage キャリア名称(預入)
 * @param careerNameCarryOn キャリア名称(機内持ち込み)
 * @param tripType 旅程種別
 * @param ruleLabelCheckedBaggage 手荷物ルール詳細に表示する文言(預入)
 * @param ruleLabelCarryOn 手荷物ルール詳細に表示する文言(機内持ち込み)
 * @param isAvailable 手荷物ルール　モーダル表示可否判定
 * @param isAvailableLabel 手荷物ルール　モーダル表示ボタン文字列
 * @param travelerRules 搭乗者毎情報
 */
export interface MybookingBaggageRulesDispInfo {
  departure: string;
  arrival: string;
  careerNameCheckedBaggage: string;
  careerNameCarryOn: string;
  tripType: string;
  ruleLabelCheckedBaggage: string;
  ruleLabelCarryOn: string;
  isAvailable: boolean;
  isAvailableLabel: string;
  travelerRules: Array<MybookingBaggageRulesDispInfoTravelerRules>;
}
/**
 * 搭乗者毎情報
 * @param name 搭乗者名
 * @param passengerTypeLabel 搭乗者ラベル
 * @param sectionRules USDOT　CADOT用データ
 */
export interface MybookingBaggageRulesDispInfoTravelerRules {
  name: string;
  passengerTypeLabel: string;
  sectionRules: MybookingBaggageRulesDispInfoTravelerRulesSection;
}
/**
 * 預入手荷物/機内持ち込み荷物情報
 * @param checkedBaggage 預入手荷物情報
 * @param carryOnBaggage 機内持ち込み荷物情報
 */
export interface MybookingBaggageRulesDispInfoTravelerRulesSection {
  checkedBaggage: Array<MybookingBaggageRulesDispInfoTravelerRulesSectionInfo>;
  carryOnBaggage: Array<MybookingBaggageRulesDispInfoTravelerRulesSectionInfo>;
}
/**
 * 手荷物情報
 * @param num 個数
 * @param label 表示種別
 * @param details 荷物詳細
 */
export interface MybookingBaggageRulesDispInfoTravelerRulesSectionInfo {
  num?: number;
  label: string;
  details?: Array<MybookingBaggageRulesDispInfoTravelerRulesSectionInfoDetails>;
}
/**
 * USDOT　CADOT用　荷物詳細データ
 * @param isDummy ダミーデータフラグ　表のレイアウトのための空表示用に埋め込んでいるデータの場合trueにする
 * @param isFree 無料利用可能フラグ
 * @param price 金額
 * @param currencyCode 通貨コード
 * @param weight 重さ
 * @param weightLabel 重さ表示文字列
 * @param descriptions フリーテキスト（API返却値）
 */
export interface MybookingBaggageRulesDispInfoTravelerRulesSectionInfoDetails {
  isDummy: boolean;
  isFree: boolean;
  price: number;
  currencyCode: string;
  weight?: number;
  weightLabel: string;
  descriptions: Array<string>;
}

/**
 * ダミー設定値
 */
export const dummyMybookingBaggageRulesDispInfoTravelerRulesSectionInfo: MybookingBaggageRulesDispInfoTravelerRulesSectionInfo =
  {
    label: '',
    details: [],
  };
/**
 * USDOT　CADOT用　荷物詳細データ　ダミー設定値
 */
export const dummyMybookingBaggageRulesDispInfoTravelerRulesSectionInfoDetails: MybookingBaggageRulesDispInfoTravelerRulesSectionInfoDetails =
  {
    isDummy: true,
    isFree: false,
    price: 0,
    currencyCode: '',
    weightLabel: '',
    descriptions: [],
  };
/**
 * 表示用データ　初期設定値
 */
export const initialMybookingBaggageRulesDisp = {
  policyRegulations: '',
  info: [],
  isDomestic: true,
};
/**
 * 手荷物ルール　使用cacheデータ定義
 * @param airport 言語別空港名ファイル
 * @param airline 言語別空港キャリア名ファイル
 */
export interface MybookingBaggageRulesMastarData {
  airport: { [key: string]: string };
  airline: { [key: string]: string };
}
/**
 * 手荷物ルール　使用cacheデータ初期値
 */
export function initialMybookingBaggageRulesMastarData(): MybookingBaggageRulesMastarData {
  return {
    airport: {},
    airline: {},
  };
}
