import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import {
  ComplexFlightCalendarState,
  ComplexFlightCalendarStore,
  selectComplexFlightCalendarState,
  resetComplexFlightCalendar,
  setComplexFlightCalendar,
  updateComplexFlightCalendar,
} from '@common/store';
import { SupportClass } from '@lib/components/support-class';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';

/**
 * 複雑カレンダー画面(R01-P032) store サービス
 */
@Injectable()
export class ComplexFlightCalendarStoreService extends SupportClass {
  private _ComplexFlightCalendar$: Observable<ComplexFlightCalendarState>;
  private _ComplexFlightCalendarData!: ComplexFlightCalendarState;
  get ComplexFlightCalendarData() {
    return this._ComplexFlightCalendarData;
  }

  constructor(private store: Store<ComplexFlightCalendarStore>) {
    super();
    //StoreからObservableの取得 画面間受け渡し情報
    this._ComplexFlightCalendar$ = this.store.pipe(
      select(selectComplexFlightCalendarState),
      filter((data) => !!data)
    );

    //Storeの値変更時の処理を定義
    this.subscribeService('ComplexFlightCalendarStoreService', this._ComplexFlightCalendar$, (data) => {
      this._ComplexFlightCalendarData = data;
    });
  }

  destroy() {
    this.deleteSubscription('ComplexFlightCalendarStoreService');
  }

  public getComplexFlightCalendar$() {
    return this._ComplexFlightCalendar$;
  }

  public resetComplexFlightCalendar() {
    this.store.dispatch(resetComplexFlightCalendar());
  }

  public setComplexFlightCalendar(value: ComplexFlightCalendarState) {
    this.store.dispatch(setComplexFlightCalendar(value));
  }

  public updateComplexFlightCalendar(value: ComplexFlightCalendarState) {
    this.store.dispatch(updateComplexFlightCalendar(value));
  }
}
