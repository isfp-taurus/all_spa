/**
 * Find-More-Flights取得API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import {
  FindMoreFlightsPostInitialState,
  FindMoreFlightsPostState,
  FindMoreFlightsPostStore,
  resetFindMoreFlightsPost,
  selectFindMoreFlightsPostState,
  setFindMoreFlightsPostFromApi,
} from '@common/store/find-more-flights-post';
import { FindMoreFlightsRequest, SearchApiService } from 'src/sdk-search';

/**
 * Find-More-Flights取得API store サービス
 *
 * store情報
 * @param FindMoreFlightsPostData @see FindMoreFlightsPostState
 */
@Injectable()
export class FindMoreFlightsPostStoreService extends SupportClass {
  private _FindMoreFlightsPost$: Observable<FindMoreFlightsPostState>;
  private _FindMoreFlightsPostData: FindMoreFlightsPostState = FindMoreFlightsPostInitialState;
  get FindMoreFlightsPostData() {
    return this._FindMoreFlightsPostData;
  }

  constructor(private _store: Store<FindMoreFlightsPostStore>, private _api: SearchApiService) {
    super();
    this._FindMoreFlightsPost$ = this._store.pipe(
      select(selectFindMoreFlightsPostState),
      filter((data) => !!data)
    );
    this.subscribeService(
      'FindMoreFlightsPostStoreService FindMoreFlightsPostObservable',
      this._FindMoreFlightsPost$,
      (data) => {
        this._FindMoreFlightsPostData = data;
      }
    );
  }

  destroy() {}

  public getFindMoreFlightsPost$() {
    return this._FindMoreFlightsPost$;
  }

  public resetFindMoreFlightsPost() {
    this._store.dispatch(resetFindMoreFlightsPost());
  }

  public setFindMoreFlightsPostFromApi(request: FindMoreFlightsRequest | undefined) {
    this._store.dispatch(setFindMoreFlightsPostFromApi({ call: this._api.findMoreFlightsPost(request) }));
  }
}
