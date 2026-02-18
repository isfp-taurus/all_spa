import { ReplaceParam } from '@lib/interfaces';

/**
 * パスポート番号データ
 * @param passportNumber パスポート番号
 */
export interface PassengerInformationRequestPassengerPassportData {
  passportNumber: string;
  isError: boolean;
}
export function initialPassengerInformationRequestPassengerPassportData(): PassengerInformationRequestPassengerPassportData {
  const ret: PassengerInformationRequestPassengerPassportData = {
    passportNumber: '',
    isError: false,
  };
  return ret;
}
/**
 * パーツ
 */
export interface PassengerInformationRequestPassengerPassportParts {}
export function initialPassengerInformationRequestPassengerPassportParts(): PassengerInformationRequestPassengerPassportParts {
  const ret: PassengerInformationRequestPassengerPassportParts = {};
  return ret;
}
export const PassengerInformationRequestPassengerPassportParams: ReplaceParam = {
  key: 0,
  value: 'label.passportNumber',
};
