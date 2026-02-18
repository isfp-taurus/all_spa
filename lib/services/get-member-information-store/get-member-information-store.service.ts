import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { ApiErrorResponseService } from '@lib/services';
import {
  GetMemberInformationState,
  GetMemberInformationStore,
  resetGetMemberInformation,
  selectGetMemberInformationState,
  setGetMemberInformationFromApi,
} from '@lib/store';
import { select, Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import { MemberApiService } from 'src/sdk-member';

@Injectable({
  providedIn: 'root',
})
export class GetMemberInformationStoreService extends SupportClass {
  // API呼び出し結果の通知用Observable
  private _GetMemberInformation$: Observable<GetMemberInformationState>;

  constructor(
    private _store: Store<GetMemberInformationStore>,
    private _api: MemberApiService,
    private _apiErr: ApiErrorResponseService
  ) {
    super();

    // APIの結果をselectして内容が参照できるようにする
    // 参照内容が存在することを担保できるようにフィルタもしておく
    this._GetMemberInformation$ = this._store.pipe(
      select(selectGetMemberInformationState),
      filter((data) => !!data)
    );
  }

  /**
   * API呼び出し
   * @param req リクエストパラメータ
   */
  public callApi(req?: object) {
    // エラーを事前クリア
    this._apiErr.clearApiErrorResponse();

    // API呼び出しアクションをdispatch
    this._store.dispatch(
      setGetMemberInformationFromApi({
        call: this._api.getMemberInformationPost(req),
      })
    );
  }

  /**
   * API呼び出し結果の通知用Observableの取得
   * @returns API呼び出し結果の通知用Observable
   */
  public getGetMemberInformation$() {
    return this._GetMemberInformation$;
  }

  public resetGetMemberInformation() {
    this._store.dispatch(resetGetMemberInformation());
  }

  override destroy() {
    throw new Error('Method not implemented.');
  }
}
