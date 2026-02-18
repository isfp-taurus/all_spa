import { ReplaceParam } from '@lib/interfaces';

/**
 * 離島カード番号 データ
 * @param number 離島カード番号
 */
export interface PassengerInformationRequestIslandCardData {
  number: string;
  isError: boolean;
}
export function initialPassengerInformationRequestIslandCardData(): PassengerInformationRequestIslandCardData {
  const ret: PassengerInformationRequestIslandCardData = {
    number: '',
    isError: false,
  };
  return ret;
}
/**
 * 離島カード番号 パーツ
 */
export interface PassengerInformationRequestIslandCardParts {}
export function initialPassengerInformationRequestIslandCardParts(): PassengerInformationRequestIslandCardParts {
  const ret: PassengerInformationRequestIslandCardParts = {};
  return ret;
}

/**
 * エラーメッセージ用のパラメータ
 */
export const PassengerInformationRequestIslandCardReplaceParamMap = {
  number: {
    key: 0,
    value: 'label.programNumber',
  } as ReplaceParam,
};
