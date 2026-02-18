import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import {
  MyBookingState,
  MyBookingStore,
  resetMyBooking,
  selectMyBookingState,
  setMyBooking,
  updateMyBooking,
} from '@common/store/mybooking';

/**
 * 予約情報取得 store サービス
 *
 * store情報
 * @param myBookingData @see MyBookingState
 */
@Injectable()
export class MyBookingStoreService extends SupportClass {
  private _myBooking$: Observable<MyBookingState>;
  private _myBookingData!: MyBookingState;
  get myBookingData() {
    console.log('**** update myBooking-store4 ****');
    return this._myBookingData;
  }

  constructor(private store: Store<MyBookingStore>) {
    super();
    console.log('**** update myBooking-store1 ****');
    this._myBooking$ = this.store.pipe(
      select(selectMyBookingState),
      filter((data) => !!data)
    );
    console.log('**** update myBooking-store2 ****');
    this.subscribeService('myBooking-store.service', this._myBooking$, (data) => {
      console.log('**** update myBooking-store ****');
      this._myBookingData = data;
    });
    console.log('**** update myBooking-store3 ****');
  }

  destroy() {}

  public getMyBookingObservable() {
    console.log('**** update myBooking-store5 ****');
    return this._myBooking$;
  }

  public updateMyBooking(value: Partial<MyBookingState>) {
    console.log('**** update myBooking-store6 ****');
    this.store.dispatch(updateMyBooking(value));
  }

  public setMyBooking(value: MyBookingState) {
    this.store.dispatch(setMyBooking(value));
  }

  public resetMyBooking() {
    this.store.dispatch(resetMyBooking());
  }
}
