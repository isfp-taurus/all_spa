import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import {
  SearchFlightConditionForRequestState,
  SearchFlightConditionForRequestStore,
  selectSearchFlightConditionForRequestState,
  setSearchFlightConditionForRequest,
  updateSearchFlightConditionForRequest,
} from '@common/store/search-flight-condition-for-request';
import { SupportClass } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

/**
 * ショッピング 検索条件マージ前情報 store サービス
 */
@Injectable()
export class SearchFlightConditionForRequestService extends SupportClass {
  /** セッションストレージのキー */
  private readonly SESSION_STORAGE_KEY = 'flightSearchCondtionMerged';

  /** セッションストレージの開始状態 */
  private isEnableSessionStorage: boolean;

  /** フライト検索画面 検索処理実行用検索条件Obeservable */
  private searchFlightMerged$: Observable<SearchFlightConditionForRequestState>;
  /** フライト検索画面 Storeに格納する検索処理実行用検索条件State*/
  private searchFlightMergedData!: SearchFlightConditionForRequestState;

  constructor(protected _common: CommonLibService, private _store: Store<SearchFlightConditionForRequestStore>) {
    super();
    //StoreからObservableの取得 検索処理実行用検索条件
    this.searchFlightMerged$ = this._store.pipe(
      select(selectSearchFlightConditionForRequestState),
      filter((data) => !!data)
    );

    //セッションストレージにストアが存在する場合、画面間引継が有効とする
    if (this.loadSessionStorage()) {
      this.isEnableSessionStorage = true;
    } else {
      this.isEnableSessionStorage = false;
    }

    //Storeの値変更時の処理を定義
    this.subscribeService('SearchFlightConditionForRequestService', this.searchFlightMerged$, (data) => {
      this.searchFlightMergedData = data;
      if (this.isEnableSessionStorage) {
        this.saveSessionStorage();
      }
    });
  }

  destroy(): void {}

  /** セッションストレージからストアの読み込み */
  private loadSessionStorage(): boolean {
    const dataFromSession = this._common.loadSessionStorage(this.SESSION_STORAGE_KEY, true);
    if (dataFromSession != null && JSON.stringify(dataFromSession) === '{}') {
      this._store.dispatch(setSearchFlightConditionForRequest(dataFromSession));
      return true;
    } else {
      return false;
    }
  }
  /** ストアの情報をセッションストレージに書き込み */
  private saveSessionStorage(): boolean {
    this._common.saveSessionStorage(this.searchFlightMergedData ?? {}, this.SESSION_STORAGE_KEY, true);
    const dataFromSession = this._common.loadSessionStorage(this.SESSION_STORAGE_KEY, true);
    if (dataFromSession != null && JSON.stringify(dataFromSession) === '{}') {
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
    return this.searchFlightMergedData;
  }

  /** 検索条件の更新 */
  public updateStore(value: SearchFlightConditionForRequestState) {
    this._store.dispatch(updateSearchFlightConditionForRequest(value));
  }
}
