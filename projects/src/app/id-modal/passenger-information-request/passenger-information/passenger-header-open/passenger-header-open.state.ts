/**
 * 搭乗者情報ヘッダオープン データ
 * @param str
 */
export interface PassengerInformationRequestPassengerOpenHeaderData {
  str: string;
  isError: boolean;
}
export function initialPassengerInformationRequestPassengerOpenHeaderData(): PassengerInformationRequestPassengerOpenHeaderData {
  const ret: PassengerInformationRequestPassengerOpenHeaderData = {
    str: '',
    isError: false,
  };
  return ret;
}
/**
 * 搭乗者情報ヘッダオープン 設定値
 * @param passengerNameHeader 搭乗者名
 * @param passengerTypeLabel 頂上車種別ラベル
 * @param registrarionLabel 登録状況ラベル
 */
export interface PassengerInformationRequestPassengerOpenHeaderParts {
  passengerNameHeader: string;
  passengerTypeLabel: string;
  registrarionLabel: string;
}
export function initialPassengerInformationRequestPassengerOpenHeaderParts(): PassengerInformationRequestPassengerOpenHeaderParts {
  const ret: PassengerInformationRequestPassengerOpenHeaderParts = {
    passengerNameHeader: '',
    passengerTypeLabel: '',
    registrarionLabel: '',
  };
  return ret;
}
