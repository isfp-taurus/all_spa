import { MMileageProgram } from '@common/interfaces';
import { ReplaceParam } from '@lib/interfaces';

/**
 * FFP情報データ
 * @param mileageProgramName マイレージプログラム名
 * @param FFPNumber FFP番号
 */
export interface PassengerInformationRequestPassengerFFPData {
  mileageProgramName: string;
  FFPNumber: string;
  isError: boolean;
}
export function initialPassengerInformationRequestPassengerFFPData(): PassengerInformationRequestPassengerFFPData {
  const ret: PassengerInformationRequestPassengerFFPData = {
    mileageProgramName: '',
    FFPNumber: '',
    isError: false,
  };
  return ret;
}
/**
 * FFP情報パーツ
 * @param mileageProgramMap マイレージプログラムの言語別名称テーブル
 */
export interface PassengerInformationRequestPassengerFFPParts {
  mileageProgramMap: Array<MMileageProgram>;
}
export function initialPassengerInformationRequestPassengerFFPParts(): PassengerInformationRequestPassengerFFPParts {
  const ret: PassengerInformationRequestPassengerFFPParts = {
    mileageProgramMap: [],
  };
  return ret;
}

export const PassengerInformationRequestPassengerFFPParams: ReplaceParam = {
  key: 0,
  value: 'label.mileageNumber',
};
