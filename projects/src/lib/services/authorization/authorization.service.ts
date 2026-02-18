/**
 * 認証系APIサービス
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '../../components/support-class';
import { AMCMemberModel, AswContextModel, AswContextType, LoginStatusType } from '../../interfaces';

import {
  AswbeAuthorizationRequest,
  AswbeAuthorizationResponse,
  AuthorizationApiService,
  InitializeGoshokaiNetRequest,
  InitializeGoshokaiNetResponse,
  LogoutResponse,
  RefreshAmcmemberBalanceResponse,
} from 'src/sdk-authorization';
import { CommonLibService } from '../common-lib/common-lib.service';
import { HttpResponse } from '@angular/common/http';
import { take } from 'rxjs/operators';

/**
 * 認証系APIサービス
 */
@Injectable()
export class AuthorizationService extends SupportClass {
  constructor(private _common: CommonLibService, private _api: AuthorizationApiService) {
    super();
  }
  destroy(): void {}

  /**
   * BE用認可API/authorization_002_ログイン
   * @param request リクエストパラメータ
   * @returns レスポンスパラメータまたはエラー情報を内包したHttpResponse
   */
  async authorization(
    request: AswbeAuthorizationRequest
  ): Promise<HttpResponse<AswbeAuthorizationResponse> | HttpResponse<object>> {
    this._common.apiErrorResponseService.clearApiErrorResponse();
    const promiseEvent = () =>
      new Promise<HttpResponse<AswbeAuthorizationResponse> | HttpResponse<object>>((resolve, reject) => {
        this.subscribeService(
          'AuthorizationService_aswbeAuthorizationPost',
          this._api.aswbeAuthorizationPost(request, 'response').pipe(take(1)),
          (state: HttpResponse<AswbeAuthorizationResponse>) => {
            if (state.body && state.body.data) {
              if (state.body.data.aswContext && state.body.data.aswContext.loginStatus) {
                this._common.aswContextStoreService.updateAswContext({
                  [AswContextType.LOGIN_STATUS as LoginStatusType]: state.body.data.aswContext.loginStatus,
                });
              }
              if (state.body.data.memberInfo) {
                this._common.amcMemberStoreService.updateAMCMember({
                  ...state.body.data.memberInfo,
                } as Partial<AMCMemberModel>);
              }
            }
            resolve(state);
          },
          (error: HttpResponse<object>) => {
            resolve(error);
          }
        );
      });
    return await promiseEvent();
  }

  /**
   * BE用認可API/authorization_003_ログアウト
   * @returns レスポンスパラメータまたはエラー情報を内包したHttpResponse
   */
  async logout(): Promise<HttpResponse<AswbeAuthorizationResponse> | HttpResponse<object>> {
    this._common.apiErrorResponseService.clearApiErrorResponse();
    const promiseEvent = () =>
      new Promise<HttpResponse<AswbeAuthorizationResponse> | HttpResponse<object>>((resolve, reject) => {
        this.subscribeService(
          'AuthorizationService_logoutPost',
          this._api.logoutPost({}, 'response').pipe(take(1)),
          (state: HttpResponse<LogoutResponse>) => {
            resolve(state);
          },
          (error: HttpResponse<object>) => {
            resolve(error);
          }
        );
      });
    return await promiseEvent();
  }

  /**
   * 会員情報残高更新API/authorization_005_会員情報残高更新
   * @returns レスポンスパラメータまたはエラー情報を内包したHttpResponse
   */
  async refreshAmcmemberBalance(): Promise<HttpResponse<RefreshAmcmemberBalanceResponse> | HttpResponse<object>> {
    this._common.apiErrorResponseService.clearApiErrorResponse();
    const promiseEvent = () =>
      new Promise<HttpResponse<RefreshAmcmemberBalanceResponse> | HttpResponse<object>>((resolve, reject) => {
        this.subscribeService(
          'AuthorizationService_refreshAmcmemberBalancePost',
          this._api.refreshAmcmemberBalancePost({}, 'response').pipe(take(1)),
          (state: HttpResponse<RefreshAmcmemberBalanceResponse>) => {
            if (state.body && state.body.data) {
              this._common.amcMemberStoreService.updateAMCMember({ ...state.body.data } as Partial<AMCMemberModel>);
            }
            resolve(state);
          },
          (error: HttpResponse<object>) => {
            resolve(error);
          }
        );
      });
    return await promiseEvent();
  }

  /**
   * ログイン・ログアウト・SSO：ご紹介ねっと流入API
   * @param request リクエストパラメータ
   * @returns レスポンスパラメータまたはエラー情報を内包したHttpResponse
   */
  async initializeGoshokaiNet(
    request: InitializeGoshokaiNetRequest
  ): Promise<HttpResponse<InitializeGoshokaiNetResponse> | HttpResponse<object>> {
    this._common.apiErrorResponseService.clearApiErrorResponse();
    const promiseEvent = () =>
      new Promise<HttpResponse<InitializeGoshokaiNetResponse> | HttpResponse<object>>((resolve, reject) => {
        this.subscribeService(
          'AuthorizationService_initializeGoshokaiNetPost',
          this._api.initializeGoshokaiNetPost(request, 'response').pipe(take(1)),
          (state: HttpResponse<InitializeGoshokaiNetResponse>) => {
            if (state.body && state.body.data) {
              if (state.body.data.aswContext && state.body.data.aswContext.loginStatus) {
                this._common.aswContextStoreService.updateAswContext({
                  ...state.body.data.aswContext,
                } as Partial<AswContextModel>);
              }
            }
            resolve(state);
          },
          (error: HttpResponse<object>) => {
            resolve(error);
          }
        );
      });
    return await promiseEvent();
  }
}
