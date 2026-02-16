import { ApiErrorMap } from '@common/interfaces';
import { LModalContentsWidthType, ModalType } from '@lib/components';
import { ModalIdParts } from '@lib/services';
import { PasswordInputHeaderComponent } from './password-input-header.component';
import { PasswordInputComponent } from './password-input.component';
import { ErrorCodeConstants } from '@conf/app.constants';

/**
 * パスワード入力モーダルを開く際のパラメータ
 */
export function passwordInputPayloadParts(): ModalIdParts {
  return {
    id: 'passwordInputComponent',
    content: PasswordInputComponent,
    header: PasswordInputHeaderComponent,
    closeBackEnable: false,
    type: ModalType.TYPE1,
    modalWidth: LModalContentsWidthType.MODAL_TAB_W384,
  };
}

/**
 * DGFT_クレジットカードPAN情報取得APIのエラーレスポンスに対するエラーマップ
 */
export const GetCreditPanInformationApiErrorMap: ApiErrorMap = {
  [ErrorCodeConstants.ERROR_CODES.EDGA000001]: {
    isRetryableError: true,
    errorMsgId: 'EA003', // 認証失敗（本番運用時は400で返却される）
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000002]: {
    isRetryableError: true,
    errorMsgId: 'EA003', // 必須パラメータの会員IDが指定されていない
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000003]: {
    isRetryableError: true,
    errorMsgId: 'EA003', // リクエストボディのJSONが不正
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000004]: {
    isRetryableError: true,
    errorMsgId: 'EA003', // 不正アクセス
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000005]: {
    isRetryableError: true,
    errorMsgId: 'EA003', // 認証項目(MID)が未指定
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000006]: {
    isRetryableError: true,
    errorMsgId: 'EA003', // 認証項目(リクエストID)が未指定
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000007]: {
    isRetryableError: true,
    errorMsgId: 'EA003', // 認証項目(リクエストタイムスタンプ)が未指定
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000008]: {
    isRetryableError: true,
    errorMsgId: 'EA003', // 認証項目(HMAC)が未指定
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000009]: {
    isRetryableError: true,
    errorMsgId: 'EA003', // マーチャントが未登録
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000010]: {
    isRetryableError: true,
    errorMsgId: 'EA003', // リクエストボディがない
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000011]: {
    isRetryableError: true,
    errorMsgId: 'EA003', // クライアントIPアドレス認証失敗
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000012]: {
    isRetryableError: true,
    errorMsgId: 'EA003', // HMAC認証失敗
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000013]: {
    isRetryableError: true,
    errorMsgId: 'EA003', // 航空会社コードが不正
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000014]: {
    isRetryableError: true,
    errorMsgId: 'EA003', // 会員が未登録
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000015]: {
    isRetryableError: true,
    errorMsgId: 'EA003', // カードが未登録
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000016]: {
    isRetryableError: true,
    errorMsgId: 'EA003', // リクエストされたメソッドか不正
  },
  [ErrorCodeConstants.ERROR_CODES.EDGA000017]: {
    isRetryableError: true,
    errorMsgId: 'EA003', // Content-Typeがapplication/jsonではない
  },
  [ErrorCodeConstants.ERROR_CODES.FDGA000001]: {
    isRetryableError: false,
    errorMsgId: 'EA003', // DGFT接続エラー(想定外エラー)
  },
  [ErrorCodeConstants.ERROR_CODES.FAGA000001]: {
    isRetryableError: false,
    errorMsgId: 'EA001', // Aegis接続エラー(想定外エラー)
  },
};
