/**
 * お気に入り登録API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import {} from '@lib/store';
import { FavoritePostRequest } from 'src/sdk-search';
import {
  FavoriteState,
  FavoriteStore,
  resetFavorite,
  selectFavoriteState,
  setFavoriteFromApi,
} from '@common/store/favorite';
import { SearchApiService } from 'src/sdk-search/api/search-api.service';

/**
 * お気に入り登録API store サービス
 *
 * store情報
 * @param FavoriteData @see FavoriteStatusGetState
 */
@Injectable()
export class FavoriteService extends SupportClass {
  private _favorite$: Observable<FavoriteState>;
  private _favoriteData!: FavoriteState;
  get favoriteData() {
    return this._favoriteData;
  }

  constructor(private _store: Store<FavoriteStore>, private api: SearchApiService) {
    super();
    this._favorite$ = this._store.pipe(
      select(selectFavoriteState),
      filter((data) => !!data)
    );
    this.subscribeService('favorite-post-store.service', this._favorite$, (data) => {
      this._favoriteData = data;
    });
  }

  destroy() {}

  public getFavoriteObservable() {
    return this._favorite$;
  }

  public resetFavorite() {
    this._store.dispatch(resetFavorite());
  }

  public setFavoriteFromApi(request: FavoritePostRequest) {
    this._store.dispatch(setFavoriteFromApi({ call: this.api.favoritePost(request) }));
  }
}
