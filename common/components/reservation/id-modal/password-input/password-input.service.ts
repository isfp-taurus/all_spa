/**
 * AMCパスワード入力画面のサービスクラス
 */
import { Injectable } from '@angular/core';
import { apiEventAll, isStringEmpty } from '@common/helper';
import {
  PasswordInputAuthLoginStoreService,
  GetCreditPanInformationStoreService,
} from '../../../../../common/services';
import { AuthLoginState } from '../../../../../lib/store/auth-login';
import { GetCreditPanInformationState } from '../../../../../common/store';
import { SupportClass } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services/common-lib/common-lib.service';
import { AuthLoginRequest } from 'src/sdk-member';
import { CommonConstants } from '@conf/app.constants';

@Injectable()
export class PasswordInputService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    public _passwordInputAuthLoginService: PasswordInputAuthLoginStoreService,
    public _getCreditPanInformationService: GetCreditPanInformationStoreService
  ) {
    super();
  }
  /**
   * パスワード必須チェック
   * @param password パスワード
   * @returns 判定結果 true 失敗
   */
  checkPassword(password: string): boolean {
    //　エラーハンドリングを処理せず、ブール値のみを返す
    return isStringEmpty(password);
  }

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
    }
    return true;
  }

  /**
   * ログイン認証API呼び出し
   * @param req
   * @param successEvent
   * @param errorEvent
   */
  public invokeAuthLoginApi(
    req: AuthLoginRequest,
    successEvent: (response: AuthLoginState) => void,
    errorEvent: (error: AuthLoginState) => void
  ) {
    apiEventAll(
      () => {
        this._passwordInputAuthLoginService.callApi(req);
      },
      this._passwordInputAuthLoginService.getAuthLogin$(),
      (response) => {
        successEvent(response);
      },
      (error) => {
        errorEvent(error);
      }
    );
  }

  /**
   * クレジットカードPAN情報取得API呼び出し
   * @param successEvent
   * @param errorEvent
   */
  public invokeGetCreditPanInformationApi(
    successEvent: (response: GetCreditPanInformationState) => void,
    errorEvent: (error: GetCreditPanInformationState) => void
  ) {
    apiEventAll(
      () => {
        this._getCreditPanInformationService.callApi();
      },
      this._getCreditPanInformationService.getCreditPanInformation$(),
      (response) => {
        successEvent(response);
      },
      (error) => {
        errorEvent(error);
      }
    );
  }

  destroy() {}
}
