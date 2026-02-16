/**
 * 搭乗者情報ヘッダクローズ データ
 * @param str
 */
export interface PassengerInformationRequestPassengerCloseHeaderData {
  str: string;
  isError: boolean;
}
export function initialPassengerInformationRequestPassengerCloseHeaderData(): PassengerInformationRequestPassengerCloseHeaderData {
  const ret: PassengerInformationRequestPassengerCloseHeaderData = {
    str: '',
    isError: false,
  };
  return ret;
}
/**
 * 搭乗者情報ヘッダクローズ  設定値
 * @param passengerNameHeader 搭乗者名
 * @param passengerTypeLabel 頂上車種別ラベル
 * @param registrarionLabel 登録状況ラベル
 */
export interface PassengerInformationRequestPassengerCloseHeaderParts {
  passengerNameHeader: string;
  passengerTypeLabel: string;
  registrarionLabel: string;
}
export function initialPassengerInformationRequestPassengerCloseHeaderParts(): PassengerInformationRequestPassengerCloseHeaderParts {
  const ret: PassengerInformationRequestPassengerCloseHeaderParts = {
    passengerNameHeader: '',
    passengerTypeLabel: '',
    registrarionLabel: '',
  };
  return ret;
}
