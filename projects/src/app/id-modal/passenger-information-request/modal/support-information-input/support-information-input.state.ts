/**
 * サポート情報入力 項目種類
 *
 * @param SPECIAL_ASSISTANCE サポート
 * @param WALKING_ABILITY 歩行頻度
 * @param WHEELCHAIRS 車いす持ち込み有無
 * @param FOLDING_TYPE 折り畳み種別
 * @param WHEELCHAIR_TYPE 車いす種別
 * @param PREGNANT 妊婦情報
 * @param UNKNOWN 不明
 *
 */
export type SupportInformationInputType =
  (typeof SupportInformationInputType)[keyof typeof SupportInformationInputType];
export const SupportInformationInputType = {
  SPECIAL_ASSISTANCE: 'specialAssistance',
  WALKING_ABILITY: 'walkingAbility',
  WHEELCHAIRS: 'wheelchairs',
  FOLDING_TYPE: 'foldingType',
  WHEELCHAIR_TYPE: 'wheelchairType',
  PREGNANT: 'pregnant',
  UNKNOWN: '',
} as const;

//手動車椅子のコード
export const WHEEL_CHAIR_MANUAL_CODE = 'manual';
//電動車いすのコード
export const WHEEL_CHAIR_BATTERY_CODE = 'battery';
