/**
 * シートマップ取得API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import { ServicingApiService, GetSeatmapsRequest } from 'src/sdk-servicing';
import { GetOrderStore } from '@common/store/get-order';
import { resetSeatmaps, SeatmapsState, selectSeatmapsState, setSeatmapsFromApi } from '@common/store/get-seatmaps';

/**
 * シートマップ取得API store サービス
 *
 * store情報
 * @param getSeatmapsData @see SeatmapsState
 */
@Injectable()
export class GetSeatmapsStoreService extends SupportClass {
  private _getSeatmaps$: Observable<SeatmapsState>;
  private _getSeatmapsData!: SeatmapsState;
  get getSeatmapsData() {
    return this._getSeatmapsData;
  }

  constructor(private store: Store<GetOrderStore>, private api: ServicingApiService) {
    super();
    this._getSeatmaps$ = this.store.pipe(
      select(selectSeatmapsState),
      filter((data) => !!data)
    );
    this.subscribeService('GetSeatmapsStoreService', this._getSeatmaps$, (data) => {
      this._getSeatmapsData = data;
    });
  }

  destroy() {}

  public getGetSeatmapsObservable() {
    return this._getSeatmaps$;
  }

  public resetGetSeatmaps() {
    this.store.dispatch(resetSeatmaps());
  }

  public setGetSeatmapsFromApi(request: GetSeatmapsRequest) {
    this.store.dispatch(setSeatmapsFromApi({ call: this.api.getSeatmapsPost(request) }));
  }
}
