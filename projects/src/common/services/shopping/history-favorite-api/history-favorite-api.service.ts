import { Injectable } from '@angular/core';
import {
  resetHistoryFavoriteGetResponse,
  selectHistoryFavoriteGetResponseIsFailureStatus,
  selectHistoryFavoriteGetResponseState,
  setHistoryFavoriteGetResponseFromApi,
} from '@common/store/shopping/api/history-favorite-get-response';
import { SupportClass } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { select, Store } from '@ngrx/store';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { HistoryFavoriteGetResponse } from 'src/sdk-search';
import { Subject } from 'rxjs/internal/Subject';
import { ApiErrorResponseModel } from '@lib/interfaces/api-error-response';
import { ErrorType } from '@lib/interfaces/errors';
import { SearchApiService } from 'src/sdk-search/api/search-api.service';

/**
 * 【エクスペリエンスAPI】R01_履歴・お気に入り情報API
 * DynamoDBから履歴・お気に入りを返却するAPIを実行、結果をストアに格納、取り出しを行うサービス
 */
@Injectable()
export class HistoryFavoriteApiService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _api: SearchApiService,
    private _store: Store<HistoryFavoriteGetResponse>
  ) {
    super();
    /** 値が通知されるObservableを取得 */
    this.response$ = this._store.pipe(
      select(selectHistoryFavoriteGetResponseState),
      map((data) => data.model),
      filter((data): data is HistoryFavoriteGetResponse => !!data)
    );
    /** APIからエラーのHTTPステータスコードが回答された場合に通知する */
    this.isFailure$ = this._store.pipe(
      select(selectHistoryFavoriteGetResponseIsFailureStatus),
      filter((isFailure) => isFailure)
    );
    this.apiErrorRes$ = this._common.apiErrorResponseService.getApiErrorResponse$().pipe(filter((data) => !!data));
  }

  destroy(): void {}

  /** 通知を受け取る変数 */
  private response$: Observable<HistoryFavoriteGetResponse>;
  /** API呼び出し失敗判定フラグ */
  private isFailure$: Observable<boolean>;
  /** APIエラーレスポンス */
  private apiErrorRes$: Observable<ApiErrorResponseModel | null>;
  /** ストアを受け取るオブジェクトからデータを抜き出した変数 */
  private data!: HistoryFavoriteGetResponse;
  /** APIの実行が終了した場合に通知するSubject true:正常終了 false:エラー*/
  private apiProgressSubject: Subject<boolean> = new Subject<boolean>();

  /** データの取得 */
  public getData(): HistoryFavoriteGetResponse {
    return this.data;
  }
  /** APIの実行が終了したことを通知するObservableを返す */
  public getApiProgressObservable() {
    return this.apiProgressSubject.asObservable();
  }

  /** 結果の初期化 */
  public resetData(): void {
    this._store.dispatch(resetHistoryFavoriteGetResponse());
  }

  /** APIの実行と結果の格納 */
  public setDataFromApi(): void {
    const call = this._api.historyFavoriteGet();
    this._store.dispatch(setHistoryFavoriteGetResponseFromApi({ call: call }));
    /** 値が通知された時の処理 */
    this.subscribeService('HistoryFavoriteApiService-getResponse', this.response$, (data) => {
      /** 通知されたデータを格納する */
      this.data = data;
      this.apiProgressSubject.next(true);
    });
    // APIが失敗した時の処理
    this.subscribeService('isFailure', this.isFailure$, (error) => {
      this.apiProgressSubject.next(!error);
    });
    // APIがエラーを返した時の処理
    this.subscribeService('apiErrorRes', this.apiErrorRes$, (error) => {
      // APIからエラーのHTTPステータスコードが返却された場合、NotRetryableErrorStoreに以下の情報を設定する。
      this._common.errorsHandlerService.setNotRetryableError({
        errorType: ErrorType.SYSTEM,
        apiErrorCode: error?.['errorCode'],
      });
      this.apiProgressSubject.next(false);
    });
  }
}
