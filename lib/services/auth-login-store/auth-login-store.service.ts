import { Injectable } from '@angular/core';
import { AuthLoginState, AuthLoginStore, selectAuthLoginState, setAuthLoginFromApi } from '@lib/store';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { filter, Observable, take } from 'rxjs';
import { AuthLoginRequest, AuthLoginResponse, GetMemberInformationResponse, MemberApiService } from 'src/sdk-member';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ApiErrorResponseService, CommonLibService, GetMemberInformationStoreService } from '@lib/services';
import {
  AMCMemberModel,
  AMCMemberType,
  AswContextModel,
  AswContextType,
  IFlyAddressType,
  IFlyGenderType,
  IFlyPhoneNumberType,
  LoginStatusType,
} from '@lib/interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthLoginStoreService extends SupportClass {
  // API呼び出し結果の通知用Observable
  private _AuthLogin$: Observable<AuthLoginState>;

  constructor(
    private _store: Store<AuthLoginStore>,
    private _api: MemberApiService,
    private _apiErr: ApiErrorResponseService,
    private _common: CommonLibService,
    private _getMemberInformationStoreService: GetMemberInformationStoreService
  ) {
    super();

    // APIの結果をselectして内容が参照できるようにする
    // 参照内容が存在することを担保できるようにフィルタもしておく
    this._AuthLogin$ = this._store.pipe(
      select(selectAuthLoginState),
      filter((data) => !!data && !!data.model)
    );
  }

  destroy(): void {}

  /**
   * API呼び出し
   * @param req リクエストパラメータ
   */
  async callAuthLoginApi(request: AuthLoginRequest): Promise<HttpResponse<AuthLoginResponse> | HttpResponse<object>> {
    // エラーを事前クリア
    this._common.apiErrorResponseService.clearApiErrorResponse();
    const promiseEvent = () =>
      new Promise<HttpResponse<AuthLoginResponse> | HttpResponse<object>>((resolve, reject) => {
        this.subscribeService(
          'MemberApiService_authLoginPost',
          this._api.authLoginPost(request, 'response').pipe(take(1)),
          (state: HttpResponse<AuthLoginResponse>) => {
            // 4	ログインAPIから受け取ったユーザ共通情報、会員情報で、共通storeのユーザ共通情報、会員情報の同項目を更新する。
            if (state.body?.data) {
              // auth-login後会員情報取得APIを呼び出し、amcmemberストアに保存
              this.subscribeService(
                'GetMemberInformationApi',
                this._common.amcMemberStoreService.saveMemberInformationToAMCMember$(),
                (result) => {
                  if (result.isFailure) {
                    const errorResponse = this._common.apiError;

                    const apiError: HttpResponse<object> = new HttpResponse({
                      status: errorResponse?.['status'],
                      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
                      body: errorResponse?.errors,
                    });
                    resolve(apiError);
                  } else {
                    if (state?.body?.data?.aswContext?.loginStatus) {
                      this._common.aswContextStoreService.updateAswContext({
                        [AswContextType.LOGIN_STATUS as LoginStatusType]:
                          state?.body?.data?.aswContext?.loginStatus ?? false,
                      });
                    }
                    resolve(state);
                  }
                }
              );
            }
          },
          (error: HttpResponse<object>) => {
            resolve(error);
          }
        );
      });
    return await promiseEvent();
  }

  /**
   * API呼び出し結果の通知用Observableの取得
   * @returns API呼び出し結果の通知用Observable
   */
  public getAuthLogin$() {
    return this._AuthLogin$;
  }
}
