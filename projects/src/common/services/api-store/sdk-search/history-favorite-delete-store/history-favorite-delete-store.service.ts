/**
 * お気に入り・履歴削除API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import {} from '@lib/store';
import {
  HistoryFavoriteDeleteState,
  HistoryFavoriteDeleteStore,
  resetHistoryFavoriteDelete,
  selectHistoryFavoriteDeleteState,
  setHistoryFavoriteDeleteFromApi,
} from '@common/store/history-favorite-delete';
import { HistoryFavoriteDeleteRequest } from 'src/sdk-search';
import { SearchApiService } from 'src/sdk-search/api/search-api.service';

/**
 * お気に入り・履歴削除API store サービス
 */
@Injectable()
export class HistoryFavoriteDeleteStoreService extends SupportClass {
  private _DeleteHistoryFavorite$: Observable<HistoryFavoriteDeleteState>;
  private _DeleteHistoryFavoriteData!: HistoryFavoriteDeleteState;
  get DeleteHistoryFavoriteData() {
    return this._DeleteHistoryFavoriteData;
  }

  constructor(private _store: Store<HistoryFavoriteDeleteStore>, private _api: SearchApiService) {
    super();
    this._DeleteHistoryFavorite$ = this._store.pipe(
      select(selectHistoryFavoriteDeleteState),
      filter((data) => !!data)
    );
    this.subscribeService('HistoryFavoriteDeleteStoreService', this._DeleteHistoryFavorite$, (data) => {
      this._DeleteHistoryFavoriteData = data;
    });
  }

  destroy() {}

  public getDeleteHistoryFavorite() {
    return this._DeleteHistoryFavorite$;
  }

  public resetDeleteHistoryFavorite() {
    this._store.dispatch(resetHistoryFavoriteDelete());
  }

  public setHistoryFavoriteDeleteFromApi(request: HistoryFavoriteDeleteRequest) {
    this._store.dispatch(setHistoryFavoriteDeleteFromApi({ call: this._api.historyFavoriteDeletePost(request) }));
  }
}
