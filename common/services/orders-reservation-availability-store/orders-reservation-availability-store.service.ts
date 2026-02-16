import { Injectable } from '@angular/core';
import { ordersReservationAvailabilityInitialState } from '@common/store';
import {
  OrdersReservationAvailabilityState,
  OrdersReservationAvailabilityStore,
  selectOrdersReservationAvailabilityState,
  setOrdersReservationAvailabilityFromApi,
} from '@common/store/orders-reservation-availability';
import { SupportClass } from '@lib/components/support-class';
import { ApiErrorResponseService } from '@lib/services';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, filter, Observable, tap } from 'rxjs';
import { MemberApiService, ReservationAvailabilityRequest } from 'src/sdk-member';

@Injectable({
  providedIn: 'root',
})
export class OrdersReservationAvailabilityStoreService extends SupportClass {
  // API呼び出し結果の通知用Observable
  private _OrdersReservationAvailability$: Observable<OrdersReservationAvailabilityState>;
  private _OrdersReservationAvailabilityData: OrdersReservationAvailabilityState =
    ordersReservationAvailabilityInitialState;

  private dataReadySubject = new BehaviorSubject<boolean>(false);

  get ordersReservationAvailabilityData() {
    return this._OrdersReservationAvailabilityData;
  }

  constructor(
    private _store: Store<OrdersReservationAvailabilityStore>,
    private _api: MemberApiService,
    private _apiErr: ApiErrorResponseService
  ) {
    super();

    // APIの結果をselectして内容が参照できるようにする
    // 参照内容が存在することを担保できるようにフィルタもしておく
    this._OrdersReservationAvailability$ = this._store.pipe(
      select(selectOrdersReservationAvailabilityState),
      filter((data) => !!data),
      tap(() => {
        this.dataReadySubject.next(true);
      })
    );
    this.subscribeService(
      'OrdersReservationAvailabilityStoreService ordersReservationAvailabilityObservable',
      this._OrdersReservationAvailability$,
      (data) => {
        this._OrdersReservationAvailabilityData = data;
      }
    );
  }

  isDataReady$(): Observable<boolean> {
    return this.dataReadySubject.asObservable();
  }

  /**
   * API呼び出し
   * @param req リクエストパラメータ
   */
  public callApi(req: ReservationAvailabilityRequest) {
    // エラーを事前クリア
    this._apiErr.clearApiErrorResponse();

    // API呼び出しアクションをdispatch
    this._store.dispatch(
      setOrdersReservationAvailabilityFromApi({
        call: this._api.ordersReservationAvailabilityPost(req),
      })
    );
  }

  /**
   * API呼び出し結果の通知用Observableの取得
   * @returns API呼び出し結果の通知用Observable
   */
  public getOrdersReservationAvailability$() {
    return this._OrdersReservationAvailability$;
  }

  /**
   * Observableデータの存在チェック
   */
  public hasValidData(): boolean {
    const data = this.ordersReservationAvailabilityData;
    return !!data && !!data.model && Object.keys(data.model).length > 0;
  }

  override destroy() {
    throw new Error('Method not implemented.');
  }
}
