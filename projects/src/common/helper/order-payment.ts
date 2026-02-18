import { ErrorCodeConstants } from '@conf/app.constants';
/**
 * ANABiz購入発券エラー取得
 * @returns 購入発券エラー時に画面に出力するエラーコード
 */
export function getAnabizPaymentRecordsErrorCode(apiErr: string): { errMsg: string; isRetryable: boolean } {
  let errMsg: string = '';
  let isRetryable: boolean = true;
  switch (apiErr) {
    case ErrorCodeConstants.ERROR_CODES.EBAZ000207: // クレジットカードの不正利用検知
      errMsg = 'E0563';
      break;
    case ErrorCodeConstants.ERROR_CODES.EBAZ000534: // 法人カードのクレジットカード番号範囲エラー
      errMsg = 'E0934';
      break;
    case ErrorCodeConstants.ERROR_CODES.EBAZ000535: // 株主優待券情報が存在しないエラーの場合
      errMsg = 'E0935';
      break;
    case ErrorCodeConstants.ERROR_CODES.EBAZ000536: // 株主優待券有効期間外エラー
      errMsg = 'E0936';
      break;
    case ErrorCodeConstants.ERROR_CODES.EBAZ000537: // 株主優待券有効期間混在エラー
      errMsg = 'E0937';
      break;
    case ErrorCodeConstants.ERROR_CODES.EBAZ000552: // 株主優待券適用失敗エラー
      errMsg = 'E0938';
      break;
    case ErrorCodeConstants.ERROR_CODES.EBAZ000528: // 最新の企業情報が発券不可エラー
      errMsg = 'E0939';
      break;
    case ErrorCodeConstants.ERROR_CODES.EBAZ000531: // ANA Bizの権限エラーの場合
      errMsg = 'E0943';
      break;
    case ErrorCodeConstants.ERROR_CODES.EBAZ000508: // ANA Bizの予約時1PAX限定エラー
      errMsg = 'E1014';
      break;
    case ErrorCodeConstants.ERROR_CODES.EBAZ000509: // ANA BizのAMC会員限定エラー
      errMsg = 'E1015';
      break;
    case ErrorCodeConstants.ERROR_CODES.EBAZ000493: // R01-P090_予約・購入完了にてAMOP決済エラー(Alipay、銀聯))
      errMsg = 'E1787';
      break;
    case ErrorCodeConstants.ERROR_CODES.EBAZ000212: // 購入/発券時PNR変更発生エラー
      isRetryable = false;
      errMsg = 'E0100';
      break;
    case ErrorCodeConstants.ERROR_CODES.EBAZ000213: // 購入時スケジュールチェンジエラー
      isRetryable = false;
      errMsg = 'E0566';
      break;
    case ErrorCodeConstants.ERROR_CODES.EBAZ000201: // 発券期限切れエラー
      isRetryable = false;
      errMsg = 'E0564';
      break;
    case ErrorCodeConstants.ERROR_CODES.EBAZ000202: // 購入不可PNRエラー
      isRetryable = false;
      errMsg = '';
      break;
    default:
      isRetryable = false;
      break;
  }
  return { errMsg, isRetryable };
}
