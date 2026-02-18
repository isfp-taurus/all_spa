/**
 * AMCログイン画面のサービスクラス
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { ApiErrorResponseModel } from '@lib/interfaces/api-error-response';
import { AuthLoginStoreService } from '@lib/services/auth-login-store/auth-login-store.service';
import { AuthLoginRequest } from 'src/sdk-member';
import { CommonLibService } from '@lib/services/common-lib/common-lib.service';
import { CommonConstants, ErrorCodeConstants } from '@conf/app.constants';
import { ErrorType } from '@lib/interfaces';

@Injectable()
export class AmcLoginService extends SupportClass {
  constructor(private _common: CommonLibService, private _authLoginStoreService: AuthLoginStoreService) {
    super();
  }

  destroy() {}

  /**
   * 入力文字チェック
   * @param password パスワード
   * @returns 判定結果 true 失敗
   */
  isInvalidPassword(password: string): boolean {
    const passwordRules = CommonConstants.PASSWORD_RULES;
    // 桁数チェック
    if (passwordRules.minPwLength <= password.length && password.length <= passwordRules.maxPwLength) {
      return false;
    } else {
      this._common.errorsHandlerService.setRetryableError('subPage', { errorMsgId: 'E0327' });
      return true;
    }
  }

  /**
   * ログインAPI呼び出し
   * @param request リクエストパラメータ
   * @returns
   */
  async login(request: AuthLoginRequest) {
    return await this._authLoginStoreService.callAuthLoginApi(request);
  }

  /**
   * APIエラー時の処理
   * @param error エラー情報
   */
  apiError(error: ApiErrorResponseModel) {
    const apiErrorCode = error['errors']![0].code;
    const messageId = CommonConstants.LOGIN_API_ERROR_MAP[apiErrorCode] ?? 'E0327';

    if (apiErrorCode === ErrorCodeConstants.ERROR_CODES.FIFA000001) {
      this._common.errorsHandlerService.setNotRetryableError({
        errorType: ErrorType.BUSINESS_LOGIC,
        apiErrorCode: apiErrorCode,
        errorMsgId: messageId,
      });
    } else {
      this._common.errorsHandlerService.setRetryableError('subPage', {
        errorMsgId: messageId,
        apiErrorCode: apiErrorCode,
      });
    }
  }
}
