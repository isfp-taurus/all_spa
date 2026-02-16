import { PassengerType } from '../interfaces/passenger-type';
/**
 * 搭乗者種別のラベルを取得
 * @param code 搭乗者種別コード
 * @param notFind 見つからなかったときのラベル
 * @return 搭乗者種別のラベル
 */
export function getPassengerLabel(code: string, notFind: string = 'label.adult') {
  switch (code) {
    case PassengerType.ADT:
      return 'label.adult';
    case PassengerType.B15:
      return 'label.youngAdult';
    case PassengerType.CHD:
      return 'label.child';
    case PassengerType.INF:
      return 'label.infant';
    case PassengerType.INS:
      return 'label.infant';
  }
  return notFind;
}

/**
 * 搭乗者種別のラベルを取得 搭乗者入力などで使用　文言がオリジナルのため作成
 * @param code 搭乗者種別コード
 * @param isdomestic 国内旅程かどうか
 * @return 搭乗者種別のラベル
 */
export function getPassengerLabel2(code: string, isdomestic: boolean = false) {
  // 搭乗者種別
  switch (code) {
    case PassengerType.ADT:
      return 'label.adult';
    case PassengerType.B15:
      return 'label.youngAdult';
    case PassengerType.CHD:
      return isdomestic ? 'label.child3To11' : 'label.child2To11';
    case PassengerType.INF:
      return isdomestic ? 'label.infant0To2' : 'label.infant0To1';
  }
  return 'label.adult';
}
