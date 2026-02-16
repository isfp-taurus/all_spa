import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import {
  FindMoreFlightsState,
  FindMoreFlightsStore,
  selectFindMoreFlightsState,
  resetFindMoreFlights,
  setFindMoreFlights,
  updateFindMoreFlights,
} from '@common/store';
import { SupportClass } from '@lib/components/support-class';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';

/**
 * Find-More-Flights画面(R01-P034) store サービス
 */
@Injectable()
export class FindMoreFlightsStoreService extends SupportClass {
  private _FindMoreFlights$: Observable<FindMoreFlightsState>;
  private _FindMoreFlightsData!: FindMoreFlightsState;
  get FindMoreFlightsData() {
    return this._FindMoreFlightsData;
  }

  constructor(private store: Store<FindMoreFlightsStore>) {
    super();
    //StoreからObservableの取得 画面間受け渡し情報
    this._FindMoreFlights$ = this.store.pipe(
      select(selectFindMoreFlightsState),
      filter((data) => !!data)
    );

    //Storeの値変更時の処理を定義
    this.subscribeService('FindMoreFlightsStoreService', this._FindMoreFlights$, (data) => {
      this._FindMoreFlightsData = data;
    });
  }

  destroy() {
    this.deleteSubscription('FindMoreFlightsStoreService');
  }

  public getFindMoreFlights$() {
    return this._FindMoreFlights$;
  }

  public resetFindMoreFlights() {
    this.store.dispatch(resetFindMoreFlights());
  }

  public setFindMoreFlights(value: FindMoreFlightsState) {
    this.store.dispatch(setFindMoreFlights(value));
  }

  public updateFindMoreFlights(value: FindMoreFlightsState) {
    this.store.dispatch(updateFindMoreFlights(value));
  }
}
