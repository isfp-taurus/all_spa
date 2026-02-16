import { Injectable } from '@angular/core';
import {
  MemberAvailabilityState,
  MemberAvailabilityStore,
  selectMemberAvailabilityState,
  setMemberAvailabilityFromApi,
} from '@common/store/member-availability';
import { SupportClass } from '@lib/components/support-class';
import { ApiErrorResponseService } from '@lib/services';
import { select, Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import { MemberApiService, MemberAvailabilityRequest } from 'src/sdk-member';

@Injectable({
  providedIn: 'root',
})
export class MemberAvailabilityStoreService extends SupportClass {
  // API呼び出し結果の通知用Observable
  private _MemberAvailability$: Observable<MemberAvailabilityState>;

  constructor(
    private _store: Store<MemberAvailabilityStore>,
    private _api: MemberApiService,
    private _apiErr: ApiErrorResponseService
  ) {
    super();

    // APIの結果をselectして内容が参照できるようにする
    // 参照内容が存在することを担保できるようにフィルタもしておく
    this._MemberAvailability$ = this._store.pipe(
      select(selectMemberAvailabilityState),
      filter((data) => !!data)
    );
  }

  /**
   * API呼び出し
   * @param req リクエストパラメータ
   */
  public callApi(req: MemberAvailabilityRequest) {
    // エラーを事前クリア
    this._apiErr.clearApiErrorResponse();

    // API呼び出しアクションをdispatch
    this._store.dispatch(
      setMemberAvailabilityFromApi({
        call: this._api.memberAvailabilityPost(req),
      })
    );
  }

  /**
   * API呼び出し結果の通知用Observableの取得
   * @returns API呼び出し結果の通知用Observable
   */
  public getMemberAvailability$() {
    return this._MemberAvailability$;
  }

  override destroy() {
    throw new Error('Method not implemented.');
  }
}
