import { MListData } from '@common/interfaces/master/m_listdata';
import { MOffice } from '@lib/interfaces';

/**
 * 規約で使用するマスターデータ定義
 * @param office　オフィスマスタ
 * @param pd065 言語情報
 */
export interface AgreementMasterData {
  office: Array<MOffice>;
  pd065: Array<MListData>;
}

export function initialAgreementMasterData(): AgreementMasterData {
  return {
    office: [],
    pd065: [],
  };
}
