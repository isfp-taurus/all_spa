import { Injectable } from '@angular/core';
import {
  HistoryFavoriteGetState,
  HistoryFavoriteGetStore,
  resetHistoryFavoriteGet,
  selectHistoryFavoriteGetState,
  setHistoryFavoriteGetFromApi,
} from '@common/store/history-favorite-get';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { filter } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { SearchApiService } from 'src/sdk-search/api/search-api.service';
import {
  resetHistoryFavoriteGetShow,
  selectHistoryFavoriteGetShowState,
  setHistoryFavoriteGetShowFromApi,
} from '@common/store/history-favorite-get-show';

/**
 * 【エクスペリエンスAPI】R01_履歴・お気に入り情報API
 * DynamoDBから履歴・お気に入りを返却するAPIを実行、結果をストアに格納、取り出しを行うサービス
 */
@Injectable()
export class HistoryFavoriteStoreService extends SupportClass {
  private _GetHistoryFavorite$: Observable<HistoryFavoriteGetState>;
  private _HistoryFavoriteGetData!: HistoryFavoriteGetState;
  get HistoryFavoriteGetData() {
    return this._HistoryFavoriteGetData;
  }

  private _GetHistoryFavoriteShow$: Observable<HistoryFavoriteGetState>;
  private _HistoryFavoriteGetShowData!: HistoryFavoriteGetState;
  get HistoryFavoriteGetShowData() {
    return this._HistoryFavoriteGetShowData;
  }

  constructor(private _store: Store<HistoryFavoriteGetStore>, private _api: SearchApiService) {
    super();
    this._GetHistoryFavorite$ = this._store.pipe(
      select(selectHistoryFavoriteGetState),
      filter((data) => !!data)
    );
    this.subscribeService('HistoryFavoriteStoreService', this._GetHistoryFavorite$, (data) => {
      this._HistoryFavoriteGetData = data;
    });

    this._GetHistoryFavoriteShow$ = this._store.pipe(
      select(selectHistoryFavoriteGetShowState),
      filter((data) => !!data)
    );
    this.subscribeService('HistoryFavoriteShowStoreService', this._GetHistoryFavoriteShow$, (data) => {
      this._HistoryFavoriteGetShowData = data;
    });
  }

  destroy() {}

  public getGetHistoryFavorite() {
    return this._GetHistoryFavorite$;
  }

  public resetGetHistoryFavorite() {
    this._store.dispatch(resetHistoryFavoriteGet());
  }

  public setHistoryFavoriteGetFromApi(generated?: object): void {
    this._store.dispatch(setHistoryFavoriteGetFromApi({ call: this._api.historyFavoriteGet(generated) }));
  }

  public getGetHistoryFavoriteShow() {
    return this._GetHistoryFavoriteShow$;
  }

  public resetGetHistoryFavoriteShow() {
    this._store.dispatch(resetHistoryFavoriteGetShow());
  }

  public setHistoryFavoriteGetShowFromApi(generated?: object): void {
    this._store.dispatch(setHistoryFavoriteGetShowFromApi({ call: this._api.historyFavoriteGet(generated) }));
  }
}
