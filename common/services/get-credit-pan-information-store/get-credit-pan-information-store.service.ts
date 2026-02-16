import { Injectable } from '@angular/core';
import {
  GetCreditPanInformationState,
  GetCreditPanInformationStore,
  selectGetCreditPanInformationState,
  setGetCreditPanInformationFromApi,
} from '@common/store';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { CreditApiService } from 'src/sdk-credit';
import { ApiErrorResponseService } from '@lib/services';
import { filter, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetCreditPanInformationStoreService extends SupportClass {
  // API呼び出し結果の通知用Observable
  private _getCreditPanInformation$: Observable<GetCreditPanInformationState>;
  override destroy(): void {}
  constructor(
    private _store: Store<GetCreditPanInformationStore>,
    private _api: CreditApiService,
    private _apiErr: ApiErrorResponseService
  ) {
    super();
    // APIの結果をselectして内容が参照できるようにする
    // 参照内容が存在することを担保できるようにフィルタもしておく
    this._getCreditPanInformation$ = this._store.pipe(
      select(selectGetCreditPanInformationState),
      filter((data) => !!data)
    );
  }

  /**
   * API呼び出し結果の通知用Observableの取得
   * @returns API呼び出し結果の通知用Observable
   */
  public getCreditPanInformation$() {
    return this._getCreditPanInformation$;
  }

  /**
   * API呼び出し
   */
  public callApi() {
    //　エラーを事前にクリア
    this._apiErr.clearApiErrorResponse();
    // API呼び出しアクションをdispatch
    this._store.dispatch(
      setGetCreditPanInformationFromApi({
        call: this._api.getCreditPanInformationPost(),
      })
    );
  }
}
