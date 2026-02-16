import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import {
  BookingCompletedSubHeaderInformationState,
  BookingCompletedSubHeaderInformationStore,
  selectBookingCompletedSubHeaderInformationState,
  resetBookingCompletedSubHeaderInformation,
  setBookingCompletedSubHeaderInformation,
} from '@common/store/booking-completed-sub-header-information';
import { SupportClass } from '@lib/components/support-class';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';

/**
 * 予約購入完了画面(R01-P090) サブヘッダー情報受け渡しstore サービス
 */
@Injectable()
export class BookingCompletedSubHeaderInformationStoreService extends SupportClass {
  /** サブヘッダー情報Obeservable */
  private _bookingCompletedSubHeaderInformation$: Observable<BookingCompletedSubHeaderInformationState>;
  /** Storeに格納するサブヘッダー情報State*/
  private _bookingCompletedSubHeaderInformationData!: BookingCompletedSubHeaderInformationState;
  get bookingCompletedSubHeaderInformationData() {
    return this._bookingCompletedSubHeaderInformationData;
  }

  constructor(private store: Store<BookingCompletedSubHeaderInformationStore>) {
    super();
    //StoreからObservableの取得 画面間受け渡し情報
    this._bookingCompletedSubHeaderInformation$ = this.store.pipe(
      select(selectBookingCompletedSubHeaderInformationState),
      filter((data) => !!data)
    );

    //Storeの値変更時の処理を定義
    this.subscribeService(
      'BookingCompletedSubHeaderInformationStoreService',
      this._bookingCompletedSubHeaderInformation$,
      (data) => {
        this._bookingCompletedSubHeaderInformationData = data;
      }
    );
  }

  destroy() {}

  public getBookingCompletedSubHeaderInformation$() {
    return this._bookingCompletedSubHeaderInformation$;
  }

  public resetBookingCompletedSubHeaderInformation() {
    this.store.dispatch(resetBookingCompletedSubHeaderInformation());
  }

  /** サブヘッダー情報の更新 */
  public setBookingCompletedSubHeaderInformation(value: BookingCompletedSubHeaderInformationState) {
    this.store.dispatch(setBookingCompletedSubHeaderInformation(value));
  }
}
