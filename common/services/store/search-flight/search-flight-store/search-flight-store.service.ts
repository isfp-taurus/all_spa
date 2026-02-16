import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import {
  selectSearchFlightState,
  TripType,
  SearchFlightState,
  SearchFlightStore,
  updateSearchFlight,
  setSearchFlight,
} from '@common/store/search-flight';
import { SupportClass } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { convertStringToDate } from '@lib/helpers';

/**
 * ショッピング 検索条件マージ前情報 store サービス
 */
@Injectable()
export class SearchFlightStoreService extends SupportClass {
  constructor(protected _common: CommonLibService, private _store: Store<SearchFlightStore>) {
    super();
    //StoreからObservableの取得
    this.searchFlight$ = this._store.pipe(
      select(selectSearchFlightState),
      filter((data) => !!data)
    );
    //セッションストレージにストアが存在する場合、画面間引継が有効とする
    if (this.loadSessionStorage()) {
      this.isEnableSessionStorage = true;
    } else {
      this.isEnableSessionStorage = false;
    }

    //Storeの値変更時の処理を定義
    this.subscribeService('SearchFlightStoreService-getData', this.searchFlight$, (data) => {
      this.searchFlightData = data;
      if (this.isEnableSessionStorage) {
        this.saveSessionStorage();
      }
    });
  }

  destroy(): void {}

  /** フライト検索画面 検索条件Obeservable */
  public searchFlight$: Observable<SearchFlightState>;

  /** セッションストレージのキー */
  private readonly SESSION_STORAGE_KEY = 'flightSearchCondtion';

  /** セッションストレージの開始状態 */
  private isEnableSessionStorage: boolean;

  /** フライト検索画面 Storeに格納する検索条件State */
  private searchFlightData!: SearchFlightState;

  /** セッションストレージからストアの読み込み */
  private loadSessionStorage(): boolean {
    const dataFromSession: SearchFlightState = this._common.loadSessionStorage(this.SESSION_STORAGE_KEY, true);
    if (dataFromSession != null && JSON.stringify(dataFromSession) !== '{}') {
      if (dataFromSession.tripType === TripType.ROUND_TRIP) {
        if (dataFromSession.roundTrip.departureDate && typeof dataFromSession.roundTrip.departureDate === 'string') {
          dataFromSession.roundTrip.departureDate = convertStringToDate(dataFromSession.roundTrip.departureDate);
        }
        if (dataFromSession.roundTrip.returnDate && typeof dataFromSession.roundTrip.returnDate === 'string') {
          dataFromSession.roundTrip.returnDate = convertStringToDate(dataFromSession.roundTrip.returnDate);
        }
      } else if (dataFromSession.tripType === TripType.ONEWAY_OR_MULTI_CITY) {
        for (let i = 0; i <= dataFromSession.onewayOrMultiCity.length - 1; i++) {
          let departureDate = dataFromSession.onewayOrMultiCity[i].departureDate;
          if (departureDate && typeof departureDate === 'string') {
            dataFromSession.onewayOrMultiCity[i].departureDate = convertStringToDate(departureDate);
          }
        }
      }
      this._store.dispatch(setSearchFlight(dataFromSession));
      return true;
    } else {
      return false;
    }
  }

  /** ストアの情報をセッションストレージに書き込み */
  private saveSessionStorage(): boolean {
    this._common.saveSessionStorage(this.searchFlightData ?? {}, this.SESSION_STORAGE_KEY, true);
    const dataFromSession = this._common.loadSessionStorage(this.SESSION_STORAGE_KEY, true);
    if (dataFromSession != null && JSON.stringify(dataFromSession) !== '{}') {
      return true;
    } else {
      return false;
    }
  }

  /** セッションストレージからストアの情報を削除 */
  private removeSessionStorage(): boolean {
    const session = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
    if (session) {
      sessionStorage.removeItem(this.SESSION_STORAGE_KEY);
      return true;
    }
    return false;
  }

  /** セッションストレージによるストアの画面間引継の開始 */
  public startSessionStorage(): boolean {
    if (this.saveSessionStorage()) {
      this.isEnableSessionStorage = true;
      return true;
    }
    return false;
  }

  /** セッションストレージによるストアの画面間引継の終了 */
  public destroySessionStorage() {
    if (this.removeSessionStorage()) {
      this.isEnableSessionStorage = false;
      return true;
    }
    return false;
  }

  /** 検索条件の取得 */
  public getData() {
    return this.searchFlightData;
  }

  /** 検索条件の更新 */
  public updateStore(value: SearchFlightState) {
    this._store.dispatch(updateSearchFlight(value));
  }
}
