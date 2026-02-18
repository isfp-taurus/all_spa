import { PreviousScreenHandoverInformation } from '@app/payment-input';
import { ShareholderCouponsType } from '@common/interfaces';
import { AnabizCreditCardInformation, AnaBizPassengerInfo } from '../container/anabiz-payment-input-cont.state';
import { ApiErrorMap } from '@common/interfaces';
import { ErrorCodeConstants } from '@conf/app.constants';

/**
 * 発券要求処理に必要なパラメータ
 */
export interface AnabizPaymentInputTicketingRequestParam {
  approverId: string;
  anabizPassengerInfoList?: Array<AnaBizPassengerInfo>;
  isCreditCardPayment: boolean;
  isWaitlisted: boolean;
  prevScreenInfo: PreviousScreenHandoverInformation;
  ticketingComment?: string;
}

/**
 * 購入発券処理に必要なパラメータ
 */
export interface AnabizPaymentInputPaymentParam {
  deviceId: string;
  anabizPassengerInfoList?: Array<AnaBizPassengerInfo>;
  creditCardInfo?: AnabizCreditCardInformation;
  prevScreenInfo: PreviousScreenHandoverInformation;
  isCreditCardPayment: boolean;
  isWaitlisted: boolean;
  isReserveOnly: boolean;
  _is3DSPayment: boolean;
  shareholderCoupons?: Array<ShareholderCouponsType>;
  isCardless: boolean;
}

/**
 * 株主優待リクエスト情報インターフェース
 */
export interface OrdersAnaBizTicketingRequestRequestshareholderCouponsInner {
  flights: Array<OrdersAnaBizTicketingRequestRequestshareholderCouponsInnerFlight>;
}

export interface OrdersAnaBizTicketingRequestRequestshareholderCouponsInnerFlight {
  flightId: string;
  travelers: Array<OrdersAnaBizTicketingRequestRequestshareholderCouponsInnerFlightTravelers>;
}

export interface OrdersAnaBizTicketingRequestRequestshareholderCouponsInnerFlightTravelers {
  travelerId: string;
  number: string;
  pin: string;
}

/**
 * クレジットカードPAN情報取得APIのエラーレスポンスに対するエラーマップ
 */
export const InvokeGetCreditPanInformationApiErrorMap: ApiErrorMap = {
  [ErrorCodeConstants.ERROR_CODES.EAGA000001]: {
    isRetryableError: false,
    errorMsgId: 'EA001', // 企業IDが連携されなかった場合
  },
  [ErrorCodeConstants.ERROR_CODES.EAGA000002]: {
    isRetryableError: false,
    errorMsgId: 'EA001', // 企業IDが半角英数以外で連携された場合
  },
  [ErrorCodeConstants.ERROR_CODES.EAGA000003]: {
    isRetryableError: false,
    errorMsgId: 'EA001', // 企業IDが指定以上の桁数で連携された場合
  },
  [ErrorCodeConstants.ERROR_CODES.EAGA000004]: {
    isRetryableError: false,
    errorMsgId: 'EA001', // ログインユーザーIDが連携されなかった場合
  },
  [ErrorCodeConstants.ERROR_CODES.EAGA000005]: {
    isRetryableError: false,
    errorMsgId: 'EA001', // ログインユーザーIDが半角数字以外で連携された場合
  },
  [ErrorCodeConstants.ERROR_CODES.EAGA000006]: {
    isRetryableError: false,
    errorMsgId: 'EA001', // ログインユーザーIDが指定以上の桁数で連携された場合
  },
  [ErrorCodeConstants.ERROR_CODES.EAGA000007]: {
    isRetryableError: false,
    errorMsgId: 'EA001', // 連携された項目で情報が取得できなかった場合
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000001]: {
    isRetryableError: false,
    errorMsgId: 'EA005', // 認証失敗（本番運用時は400で返却される）
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000002]: {
    isRetryableError: false,
    errorMsgId: 'EA005', // 必須パラメータの会員IDが指定されていない
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000003]: {
    isRetryableError: false,
    errorMsgId: 'EA005', // リクエストボディのJSONが不正
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000004]: {
    isRetryableError: false,
    errorMsgId: 'EA005', // 不正アクセス
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000005]: {
    isRetryableError: false,
    errorMsgId: 'EA005', // 認証項目(MID)が未指定
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000006]: {
    isRetryableError: false,
    errorMsgId: 'EA005', // 認証項目(リクエストID)が未指定
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000007]: {
    isRetryableError: false,
    errorMsgId: 'EA005', // 認証項目(リクエストタイムスタンプ)が未指定
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000008]: {
    isRetryableError: false,
    errorMsgId: 'EA005', // 認証項目(HMAC)が未指定
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000009]: {
    isRetryableError: false,
    errorMsgId: 'EA005', // マーチャントが未登録
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000010]: {
    isRetryableError: false,
    errorMsgId: 'EA005', // リクエストボディがない
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000011]: {
    isRetryableError: false,
    errorMsgId: 'EA005', // クライアントIPアドレス認証失敗
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000012]: {
    isRetryableError: false,
    errorMsgId: 'EA005', // HMAC認証失敗
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000013]: {
    isRetryableError: false,
    errorMsgId: 'EA005', // 航空会社コードが不正
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000014]: {
    isRetryableError: false,
    errorMsgId: 'EA005', // 会員が未登録
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000015]: {
    isRetryableError: false,
    errorMsgId: 'EA005', // カードが未登録
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000016]: {
    isRetryableError: false,
    errorMsgId: 'EA005', // リクエストされたメソッドか不正
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000017]: {
    isRetryableError: false,
    errorMsgId: 'EA005', // Content-Typeがapplication/jsonではない
  },
  [ErrorCodeConstants.ERROR_CODES.FDGA000001]: {
    isRetryableError: false,
    errorMsgId: 'EA005', // DGFT接続エラー(想定外エラー)
  },
  [ErrorCodeConstants.ERROR_CODES.FAGA000001]: {
    isRetryableError: false,
    errorMsgId: 'EA001', // Aegis接続エラー(想定外エラー)
  },
};
