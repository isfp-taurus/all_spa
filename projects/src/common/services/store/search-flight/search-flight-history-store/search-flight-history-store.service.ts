import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import { SupportClass } from '@lib/components/support-class';
import { CommonLibService, ErrorsHandlerService } from '@lib/services';
import {
  SearchFlightHistoryStore,
  SearchFlightHistoryState,
  selectSearchFlightHistoryState,
  updateSearchFlightHistory,
  resetSearchFlightHistory,
} from '@common/store/search-flight-history';
import { HistoryFavoriteStoreService } from '../../../api-store/sdk-search/history-favorite-store/history-favorite-store.service';
import { PageType } from '@lib/interfaces/page';
import { AlertMessageItem, AlertType } from '@lib/interfaces';
import {
  resetSearchFlightHistoryModal,
  SearchFlightHistoryModalState,
  selectSearchFlightHistoryModalState,
  updateSearchFlightHistoryModal,
} from '@common/store/search-flight-history-modal';

/**
 * SearchFlightHistory
 * 履歴・お気に入り取得APIから返されるデータをストアとして保持する
 * API実行後に履歴・お気に入りの編集が可能で、履歴⇔お気に入りの状態を同期する必要があるため
 * 個別ストアで管理する
 */
@Injectable()
export class SearchFlightHistoryStoreService extends SupportClass {
  /** 履歴・お気に入りのストア */
  public SearchFlightHistory$: Observable<SearchFlightHistoryState>;
  /** 履歴・お気に入りを保持する変数 */
  public SearchFlightHistoryData: SearchFlightHistoryState = {
    apiRequestState: 'complete',
  };

  /** 履歴・お気に入りのストア -Modalのみ*/
  public SearchFlightHistoryModal$: Observable<SearchFlightHistoryModalState>;

  constructor(
    protected _common: CommonLibService,
    private _store: Store<SearchFlightHistoryStore>,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _historyFavoriteStoreService: HistoryFavoriteStoreService
  ) {
    super();
    this.SearchFlightHistory$ = this._store.pipe(
      select(selectSearchFlightHistoryState),
      filter((data) => !!data)
    );
    this.SearchFlightHistoryModal$ = this._store.pipe(
      select(selectSearchFlightHistoryModalState),
      filter((data) => !!data)
    );
    this.subscribeService('SearchFlightHistoryData', this.SearchFlightHistory$, (data) => {
      this.SearchFlightHistoryData = data;
    });
  }

  destroy(): void {}

  /**
   *  APIのリクエスト 履歴・お気に入り情報の取得
   *
   */
  public requestHistoryFavoriteGet(isViweWarning: boolean) {
    // APIの実行
    // 呼び出し時、エラーハンドリング回避フラグ(commonIgnoreErrorFlg)としてtureを指定する。
    const hstFvrRequestBody = { commonIgnoreErrorFlg: true };

    if (isViweWarning) {
      //状態を初期化する
      this.resetModalStore();
      //呼び出し状態とする
      this._store.dispatch(updateSearchFlightHistoryModal({ apiRequestState: 'calling' }));

      this._historyFavoriteStoreService.setHistoryFavoriteGetShowFromApi(hstFvrRequestBody);
      // APIの実行が開始後、実行状態・結果を監視する
      this.subscribeService(
        'SearchFlightHistoryStoreService_getGetHistoryFavoriteShow',
        this._historyFavoriteStoreService.getGetHistoryFavoriteShow(),
        (data) => {
          if (!data.isPending) {
            this.deleteSubscription('SearchFlightHistoryStoreService_getGetHistoryFavoriteShow');
            if (!data.isFailure) {
              const state: SearchFlightHistoryState = {
                ...data,
                apiRequestState: 'complete',
              };
              this.updateModalStore(state);
            } else {
              const AlertMessageData: AlertMessageItem = {
                contentHtml: 'm_error_message-W0735',
                isCloseEnable: true,
                errorMessageId: 'W0735',
                alertType: AlertType.WARNING,
              };
              this._common.alertMessageStoreService.setAlertWarningMessage(AlertMessageData);
              const state: SearchFlightHistoryState = {
                apiRequestState: 'failed',
              };
              this.updateModalStore(state);
            }
          }
        }
      );
    } else {
      //状態を初期化する
      this.resetStore();
      //呼び出し状態とする
      this._store.dispatch(updateSearchFlightHistory({ apiRequestState: 'calling' }));

      this._historyFavoriteStoreService.setHistoryFavoriteGetFromApi(hstFvrRequestBody);
      // APIの実行が開始後、実行状態・結果を監視する
      this.subscribeService(
        'SearchFlightHistoryStoreService_getGetHistoryFavorite',
        this._historyFavoriteStoreService.getGetHistoryFavorite(),
        (data) => {
          if (!data.isPending) {
            this.deleteSubscription('SearchFlightHistoryStoreService_getGetHistoryFavorite');
            if (!data.isFailure) {
              const state: SearchFlightHistoryState = {
                ...data,
                apiRequestState: 'complete',
              };
              this.updateStore(state);
            }
          }
        }
      );
    }
  }

  public getRoundtripFlightAvailabilityInternationalObservable() {
    return this.SearchFlightHistory$;
  }

  /** 履歴・お気に入りの取得 */
  public getData() {
    return this.SearchFlightHistoryData;
  }

  /** 履歴・お気に入りの更新 */
  public updateStore(value: SearchFlightHistoryState) {
    this._store.dispatch(updateSearchFlightHistory(value));
  }

  /** 初期化 */
  public resetStore() {
    this._store.dispatch(resetSearchFlightHistory());
  }

  /** 履歴・お気に入りの更新-Modalのみ */
  public updateModalStore(value: SearchFlightHistoryState) {
    this._store.dispatch(updateSearchFlightHistoryModal(value));
  }

  /** 初期化-Modalのみ */
  public resetModalStore() {
    this._store.dispatch(resetSearchFlightHistoryModal());
  }
}
