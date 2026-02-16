import { LoadAswMasterInfo } from '@lib/interfaces';

/**
 * チェックイン系で読み込むマスター一覧
 */
type MasterKeys = 'FUNCTION_INELIGIBLE_REASON_PK' | 'BANK_ALL' | 'BANK_LANG';

/**
 * チェックイン系で読み込むマスターの一覧オブジェクト
 */
export const NEXT_ACTION_LOAD_MASTERS: Record<MasterKeys, LoadAswMasterInfo> = {
  FUNCTION_INELIGIBLE_REASON_PK: {
    key: 'FunctionIneligibleReason_ByPk',
    fileName: 'FunctionIneligibleReason_ByPk',
  },
  BANK_ALL: {
    key: 'Bank_All',
    fileName: 'Bank_All',
  },
  BANK_LANG: {
    key: 'Bank_Lang',
    fileName: 'Bank_Lang',
  },
};
