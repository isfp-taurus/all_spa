/**
 * 往復指定日空席照会(OWD)API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import {} from '@lib/store';
import { RoundtripOwdRequest } from '@common/interfaces/shopping/roundtrip-owd';
import { SearchApiService } from 'src/sdk-search';
import {
  RoundtripOwdState,
  RoundtripOwdStore,
  resetRoundtripOwd,
  selectRoundtripOwdState,
  setRoundtripOwdFromApi,
} from '@common/store/roundtrip-owd';

/**
 * 往復指定日空席照会(OWD)API store サービス
 *
 * store情報
 * @param RoundtripOwdData @see RoundtripOwdStatusGetState
 */
@Injectable()
export class RoundtripOwdService extends SupportClass {
  private _roundtripOwd$: Observable<RoundtripOwdState>;
  private _roundtripOwdData!: RoundtripOwdState;
  get roundtripOwdData() {
    return this._roundtripOwdData;
  }

  constructor(private _store: Store<RoundtripOwdStore>, private _api: SearchApiService) {
    super();
    this._roundtripOwd$ = this._store.pipe(
      select(selectRoundtripOwdState),
      filter((data) => !!data)
    );
    this.subscribeService('RoundtripOwdService', this._roundtripOwd$, (data) => {
      this._roundtripOwdData = data;
    });
  }

  destroy() {}

  public getRoundtripOwdObservable() {
    return this._roundtripOwd$;
  }

  public resetRoundtripOwd() {
    this._store.dispatch(resetRoundtripOwd());
  }

  /**
   * 往復指定日空席照会(OWD)APIを実行してStoreに保存
   * @param request リクエスト
   */
  public setRoundtripOwdFromApi(request: RoundtripOwdRequest) {
    this._store.dispatch(setRoundtripOwdFromApi({ call: this._api.roundtripOwdPost(request) }));
  }

  /**
   * 往復指定日空席照会(OWD)APIを実行してレスポンスを返す<br>
   *   レスポンスはストアに保存しない
   * @param request リクエスト
   * @returns 往復指定日空席照会(OWD)APIレスポンス
   */
  public getRoundtripOwdFromApi(request: RoundtripOwdRequest) {
    return this._api.roundtripOwdPost(request);
  }
}
