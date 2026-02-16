/**
 * 履歴登録API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import {} from '@lib/store';
import { HistoryPostRequest } from 'src/sdk-search';
import { HistoryState, HistoryStore, resetHistory, selectHistoryState, setHistoryFromApi } from '@common/store/history';
import { SearchApiService } from 'src/sdk-search/api/search-api.service';

/**
 * 履歴登録API store サービス
 *
 * store情報
 * @param HistoryData @see HistoryStatusGetState
 */
@Injectable()
export class HistoryService extends SupportClass {
  private _history$: Observable<HistoryState>;
  private _historyData!: HistoryState;
  get historyData() {
    return this._historyData;
  }

  constructor(private _store: Store<HistoryStore>, private _api: SearchApiService) {
    super();
    this._history$ = this._store.pipe(
      select(selectHistoryState),
      filter((data) => !!data)
    );
    this.subscribeService('HistoryService', this._history$, (data) => {
      this._historyData = data;
    });
  }

  destroy() {}

  public getHistoryObservable() {
    return this._history$;
  }

  public resetHistory() {
    this._store.dispatch(resetHistory());
  }

  public setHistoryFromApi(request: HistoryPostRequest) {
    this._store.dispatch(setHistoryFromApi({ call: this._api.historyPost(request) }));
  }
}
