import { ApiErrorMap } from '@common/interfaces';
import { ErrorType } from '@lib/interfaces';
import { ErrorCodeConstants } from '@conf/app.constants';

/**
 * prebookAPIのエラーレスポンスに対するエラーマップ
 */
export const SelectNextPageModalApiErrorMap: ApiErrorMap = {
  [ErrorCodeConstants.ERROR_CODES.EBAA000031]: {
    isRetryableError: true,
    errorMsgId: 'EA058',
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000299]: {
    isRetryableError: true,
    errorMsgId: 'E0758',
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000427]: {
    isRetryableError: true,
    errorMsgId: 'E0457',
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000308]: {
    isRetryableError: true,
    errorMsgId: 'E0467',
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000545]: {
    isRetryableError: true,
    errorMsgId: 'E0852',
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000546]: {
    isRetryableError: true,
    errorMsgId: 'E0854',
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000547]: {
    isRetryableError: true,
    errorMsgId: 'E0855',
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000549]: {
    isRetryableError: true,
    errorMsgId: 'E0856',
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000548]: {
    isRetryableError: true,
    errorMsgId: 'E0857',
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000428]: {
    isRetryableError: true,
    errorMsgId: 'E0456',
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000265]: {
    isRetryableError: true,
    errorMsgId: 'E0707',
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000429]: {
    isRetryableError: true,
    errorMsgId: 'E0708',
    replaceParams: {
      key: '0',
      value: 'label.advancedLounge',
    },
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000412]: {
    isRetryableError: true,
    errorMsgId: 'E0455',
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000479]: {
    isRetryableError: true,
    errorMsgId: 'E0451',
  },

  [ErrorCodeConstants.ERROR_CODES.EBAZ000431]: {
    isRetryableError: true,
    errorMsgId: 'E0452',
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000432]: {
    isRetryableError: true,
    errorMsgId: 'E0452',
  },
  //'EBAZ000479':{
  // isRetryableError:true,
  // errorMsgId:'E0448',
  //},
  [ErrorCodeConstants.ERROR_CODES.EBAZ000551]: {
    isRetryableError: true,
    errorMsgId: 'E0859',
  },
  //FY25 追加分計 変更管理No.52 駅探BTM「BTOnline」
  [ErrorCodeConstants.ERROR_CODES.EBAZ000529]: {
    isRetryableError: true,
    errorMsgId: 'E0916',
  },
  //FY25 追加分計 変更管理No.52 駅探BTM「BTOnline」
  [ErrorCodeConstants.ERROR_CODES.EBAZ000530]: {
    isRetryableError: true,
    errorMsgId: 'E0917',
  },
  //FY25 追加分計 変更管理No.73 INFのQuota管理 INF制限数対応
  [ErrorCodeConstants.ERROR_CODES.EBAZ000695]: {
    isRetryableError: true,
    errorMsgId: 'E0918',
  },
  //障がい者割引運賃」かつ「障害者手帳情報-搭乗者選択情報」が未入力の場合
  [ErrorCodeConstants.ERROR_CODES.EBAZ000559]: {
    isRetryableError: true,
    errorMsgId: 'E1820',
  },
  //ANAUIUXS2_NH_DEV-4404 大人＋幼児のPNR上の搭乗者情報が59文字を超えた場合のDxAPIエラーの対応
  [ErrorCodeConstants.ERROR_CODES.EBAZ000430]: {
    isRetryableError: true,
    errorMsgId: 'E1771',
  },
  //道民割運賃エラー
  [ErrorCodeConstants.ERROR_CODES.EBAA000016]: {
    isRetryableError: true,
    errorMsgId: 'EA032',
  },
  // 空席照会条件入力画面でジュニアパイロットの申し込みを選択、かつ空席照会結果画面で空席待ちを選択した場合
  [ErrorCodeConstants.ERROR_CODES.EBAA100036]: {
    isRetryableError: true,
    errorMsgId: 'EA059',
  },
  //継続不可エラー
  [ErrorCodeConstants.ERROR_CODES.EBAZ000278]: {
    isRetryableError: false,
    errorMsgId: 'E0333',
    errorType: ErrorType.BUSINESS_LOGIC,
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000422]: {
    isRetryableError: false,
    errorMsgId: 'E0449',
    errorType: ErrorType.BUSINESS_LOGIC,
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000543]: {
    isRetryableError: false,
    errorMsgId: 'E1317',
    errorType: ErrorType.BUSINESS_LOGIC,
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000842]: {
    isRetryableError: false,
    errorMsgId: '',
    errorType: ErrorType.SYSTEM,
  },
  [ErrorCodeConstants.ERROR_CODES.EBAA000018]: {
    isRetryableError: false,
    errorMsgId: 'EA040',
    errorType: ErrorType.BUSINESS_LOGIC,
  },
  [ErrorCodeConstants.ERROR_CODES.EBAA000023]: {
    isRetryableError: true,
    errorMsgId: 'EA057',
  },
  //運賃種別が就活支援割引運賃、かつ搭乗者の証憑情報が登録されていない
  [ErrorCodeConstants.ERROR_CODES.EBAA000032]: {
    isRetryableError: true,
    errorMsgId: 'E0852',
  },
};
