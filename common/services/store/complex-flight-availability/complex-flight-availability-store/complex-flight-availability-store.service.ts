import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import {
  ComplexFlightAvailabilityState,
  ComplexFlightAvailabilityStore,
  selectComplexFlightAvailabilityState,
  resetComplexFlightAvailability,
  setComplexFlightAvailability,
  updateComplexFlightAvailability,
} from '@common/store';
import { SupportClass } from '@lib/components/support-class';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';

/**
 * 複雑空席照会画面(R01-P033) store サービス
 */
@Injectable()
export class ComplexFlightAvailabilityPageStoreService extends SupportClass {
  private _ComplexFlightAvailability$: Observable<ComplexFlightAvailabilityState>;
  private _ComplexFlightAvailabilityData!: ComplexFlightAvailabilityState;
  get ComplexFlightAvailabilityData() {
    return this._ComplexFlightAvailabilityData;
  }

  constructor(private store: Store<ComplexFlightAvailabilityStore>) {
    super();
    //StoreからObservableの取得 画面間受け渡し情報
    this._ComplexFlightAvailability$ = this.store.pipe(
      select(selectComplexFlightAvailabilityState),
      filter((data) => !!data)
    );

    //Storeの値変更時の処理を定義
    this.subscribeService('ComplexFlightAvailabilityPageStoreService', this._ComplexFlightAvailability$, (data) => {
      this._ComplexFlightAvailabilityData = data;
    });
  }

  destroy() {
    this.deleteSubscription('ComplexFlightAvailabilityPageStoreService');
  }

  public getComplexFlightAvailability$() {
    return this._ComplexFlightAvailability$;
  }

  public resetComplexFlightAvailability() {
    this.store.dispatch(resetComplexFlightAvailability());
  }

  public setComplexFlightAvailability(value: ComplexFlightAvailabilityState) {
    this.store.dispatch(setComplexFlightAvailability(value));
  }

  public updateComplexFlightAvailability(value: ComplexFlightAvailabilityState) {
    this.store.dispatch(updateComplexFlightAvailability(value));
  }
}
