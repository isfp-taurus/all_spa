/**
 * ANA BIZ認証系APIサービス
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { AnaBizContextModel, AnaBizLoginStatusType, AswContextType } from '@lib/interfaces';

import {
  AnaBizLogoutResponse,
  AuthorizationApiService,
  AuthorizationRequest,
  AuthorizationResponse,
  GetAnaBizContextResponse,
  GetCompanyAccountsResponse,
  SelectCompanyAccountRequest,
  SelectCompanyAccountResponse,
} from 'src/sdk-authorization';
import { CommonLibService } from '@lib/services';
import { HttpResponse } from '@angular/common/http';
import { take } from 'rxjs/operators';

/**
 * ANA BIZ認証系APIサービス
 */
@Injectable()
export class AnabizAuthorizationService extends SupportClass {
  constructor(private _common: CommonLibService, private _api: AuthorizationApiService) {
    super();
  }
  destroy(): void {}

  /**
   * ANABizログインAPI
   * @param request リクエストパラメータ
   * @returns レスポンスパラメータまたはエラー情報を内包したHttpResponse
   */
  async anaBizAuthorizationNet(
    request: AuthorizationRequest
  ): Promise<HttpResponse<AuthorizationResponse> | HttpResponse<object>> {
    this._common.apiErrorResponseService.clearApiErrorResponse();
    const promiseEvent = () =>
      new Promise<HttpResponse<AuthorizationResponse> | HttpResponse<object>>((resolve, reject) => {
        this.anaBizAuthorizationNetNext(
          request,
          (state) => resolve(state),
          (error) => resolve(error)
        );
      });
    return await promiseEvent();
  }

  /**
   * ANABizログインAPI オブザーバブル版
   * @param request リクエストパラメータ
   * @param nextEvent 成功時処理
   * @param errorEvent 失敗時処理
   */
  anaBizAuthorizationNetNext(
    request: AuthorizationRequest,
    nextEvent: (data: HttpResponse<AuthorizationResponse>) => void,
    errorEvent?: (data: HttpResponse<object>) => void
  ) {
    this.subscribeService(
      'AuthorizationService_anaBizAuthorizationPost',
      this._api.anaBizAuthorizationPost(request, 'response').pipe(take(1)),
      (state: HttpResponse<AuthorizationResponse>) => {
        if (state.body && state.body.data) {
          if (state.body.data.aswContext?.anaBizLoginStatus) {
            this._common.aswContextStoreService.updateAswContext({
              [AswContextType.ANA_BIZ_LOGIN_STATUS as AnaBizLoginStatusType]:
                state.body.data.aswContext.anaBizLoginStatus,
            });
          }
          if (state.body.data.anaBizContext) {
            this._common.anaBizContextStoreService.updateAnaBizContext({
              ...state.body.data.anaBizContext,
            } as Partial<AnaBizContextModel>);
          }
        }
        nextEvent(state);
      },
      (error: HttpResponse<object>) => {
        if (errorEvent) {
          errorEvent(error);
        }
      }
    );
  }

  /**
   * ANA Bizログイン情報を取得する
   * @returns レスポンスパラメータまたはエラー情報を内包したHttpResponse
   */
  async getAnaBizContext(): Promise<HttpResponse<GetAnaBizContextResponse> | HttpResponse<object>> {
    this._common.apiErrorResponseService.clearApiErrorResponse();
    const promiseEvent = () =>
      new Promise<HttpResponse<GetAnaBizContextResponse> | HttpResponse<object>>((resolve, reject) => {
        this.getAnaBizContextNext(
          (state) => resolve(state),
          (error) => resolve(error)
        );
      });
    return await promiseEvent();
  }

  /**
   * ANA Bizログイン情報を取得する オブザーバブル版
   * @param nextEvent 成功時処理
   * @param errorEvent 失敗時処理
   */
  getAnaBizContextNext(
    nextEvent: (data: HttpResponse<GetAnaBizContextResponse>) => void,
    errorEvent?: (data: HttpResponse<object>) => void
  ) {
    this.subscribeService(
      'AuthorizationService_anaBizGetAnaBizContextGet',
      this._api.anaBizGetAnaBizContextGet('response').pipe(take(1)),
      (state: HttpResponse<GetAnaBizContextResponse>) => {
        nextEvent(state);
      },
      (error: HttpResponse<object>) => {
        if (errorEvent) {
          errorEvent(error);
        }
      }
    );
  }

  /**
   * ANA Biz組織リストを取得する
   * @returns レスポンスパラメータまたはエラー情報を内包したHttpResponse
   */
  async getCompanyAccounts(): Promise<HttpResponse<GetCompanyAccountsResponse> | HttpResponse<object>> {
    this._common.apiErrorResponseService.clearApiErrorResponse();
    const promiseEvent = () =>
      new Promise<HttpResponse<AuthorizationResponse> | HttpResponse<object>>((resolve, reject) => {
        this.getCompanyAccountsNext(
          (state) => resolve(state),
          (error) => resolve(error)
        );
      });
    return await promiseEvent();
  }

  /**
   * ANA Biz組織リストを取得する オブザーバブル版
   * @param nextEvent 成功時処理
   * @param errorEvent 失敗時処理
   */
  getCompanyAccountsNext(
    nextEvent: (data: HttpResponse<GetCompanyAccountsResponse>) => void,
    errorEvent?: (data: HttpResponse<object>) => void
  ) {
    this.subscribeService(
      'AuthorizationService_anaBizGetCompanyAccountsPost',
      this._api.anaBizGetCompanyAccountsPost('response').pipe(take(1)),
      (state: HttpResponse<GetCompanyAccountsResponse>) => {
        nextEvent(state);
      },
      (error: HttpResponse<object>) => {
        if (errorEvent) {
          errorEvent(error);
        }
      }
    );
  }

  /**
   * ANA Bizログアウトを行う
   * @param request リクエストパラメータ
   * @returns レスポンスパラメータまたはエラー情報を内包したHttpResponse
   */
  async anaBizLogout(request: object): Promise<HttpResponse<AnaBizLogoutResponse> | HttpResponse<object>> {
    this._common.apiErrorResponseService.clearApiErrorResponse();
    const promiseEvent = () =>
      new Promise<HttpResponse<AnaBizLogoutResponse> | HttpResponse<object>>((resolve, reject) => {
        this.anaBizLogoutNext(
          request,
          (state) => resolve(state),
          (error) => resolve(error)
        );
      });
    return await promiseEvent();
  }

  /**
   * ANA Bizログアウトを行う オブザーバブル版
   * @param request リクエストパラメータ
   * @param nextEvent 成功時処理
   * @param errorEvent 失敗時処理
   */
  anaBizLogoutNext(
    request: object,
    nextEvent: (data: HttpResponse<AnaBizLogoutResponse>) => void,
    errorEvent?: (data: HttpResponse<object>) => void
  ) {
    this.subscribeService(
      'AuthorizationService_anaBizLogoutPost',
      this._api.anaBizLogoutPost(request, 'response').pipe(take(1)),
      (state: HttpResponse<AnaBizLogoutResponse>) => {
        this._common.aswContextStoreService.updateAswContext({
          [AswContextType.ANA_BIZ_LOGIN_STATUS as AnaBizLoginStatusType]: AnaBizLoginStatusType.NOT_LOGIN,
        });
        this._common.anaBizContextStoreService.resetAnaBizContext();
        nextEvent(state);
      },
      (error: HttpResponse<object>) => {
        if (errorEvent) {
          errorEvent(error);
        }
      }
    );
  }

  /**
   * ANA Biz組織選択を行う
   * @param request リクエストパラメータ
   * @returns レスポンスパラメータまたはエラー情報を内包したHttpResponse
   */
  async selectCompanyAccountPost(
    request: SelectCompanyAccountRequest
  ): Promise<HttpResponse<SelectCompanyAccountResponse> | HttpResponse<object>> {
    this._common.apiErrorResponseService.clearApiErrorResponse();
    const promiseEvent = () =>
      new Promise<HttpResponse<SelectCompanyAccountResponse> | HttpResponse<object>>((resolve, reject) => {
        this.selectCompanyAccountPostNext(
          request,
          (state) => resolve(state),
          (error) => resolve(error)
        );
      });
    return await promiseEvent();
  }

  /**
   * ANA Biz組織選択を行う
   * @param request リクエストパラメータ
   * @param nextEvent 成功時処理
   * @param errorEvent 失敗時処理
   */
  selectCompanyAccountPostNext(
    request: SelectCompanyAccountRequest,
    nextEvent: (data: HttpResponse<SelectCompanyAccountResponse>) => void,
    errorEvent?: (data: HttpResponse<object>) => void
  ) {
    this.subscribeService(
      'AuthorizationService_anaBizSelectCompanyAccountPost',
      this._api.anaBizSelectCompanyAccountPost(request, 'response').pipe(take(1)),
      (state: HttpResponse<SelectCompanyAccountResponse>) => {
        if (state.body?.data.aswContext?.anaBizLoginStatus) {
          this._common.aswContextStoreService.updateAswContext({
            [AswContextType.ANA_BIZ_LOGIN_STATUS as AnaBizLoginStatusType]:
              state.body.data.aswContext.anaBizLoginStatus,
          });
        }
        if (state.body?.data.anaBizContext) {
          this._common.anaBizContextStoreService.updateAnaBizContext({
            ...state.body.data.anaBizContext,
          } as Partial<AnaBizContextModel>);
        }
        nextEvent(state);
      },
      (error: HttpResponse<object>) => {
        if (errorEvent) {
          errorEvent(error);
        }
      }
    );
  }
}
