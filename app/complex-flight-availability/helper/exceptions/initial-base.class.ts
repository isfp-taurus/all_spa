import { ComplexFlightAvailabilityContComponent } from '../container/complex-flight-availability-cont.component';
import { RakuFlow, AutoInject } from './raku-flow';
import { ErrorType, PageType, RetryableError } from '@lib/interfaces';
import { ErrorsHandlerService } from '@lib/services';
import { DeliverySearchInformationStoreService } from '@common/services/store/delivery-search-information-store/delivery-search-information-store.service';

/**
 * 初期処理の基本的なクラス
 *
 */
export abstract class InitialBase {
  // エラー処理のサービス
  @AutoInject()
  protected _errorsHandlerService?: ErrorsHandlerService;

  @AutoInject()
  protected _deliverySearchInformationStoreService?: DeliverySearchInformationStoreService;

  private _isNext = true;

  constructor() {}

  /**
   * 非同期ハンドル関数
   * @returns {Promise<void>}
   */
  abstract handle(): Promise<void>;

  /**
   * RakuFlow<T, K>のpoinerをbindする
   * @param {RakuFlow<T, K>} flow pointer
   * @returns {RakuFlow<T, K>}
   */
  abstract bindFlow(
    flow: RakuFlow<InitialBase, ComplexFlightAvailabilityContComponent>
  ): RakuFlow<InitialBase, ComplexFlightAvailabilityContComponent>;

  /**
   * RakuFlowのインスタンス
   * @var {RakuFlow<InitialBase, ComplexFlightAvailabilityContComponent>}
   */
  abstract flow?: RakuFlow<InitialBase, ComplexFlightAvailabilityContComponent>;

  // 次の処理に行くか
  public isNext() {
    return this._isNext;
  }

  // 処理を終了する
  protected endFlow() {
    this._isNext = false;
  }

  /**
   * エラー情報設定
   * @param errorType エラー種別
   * @param errorMsgId エラーメッセージID
   * @param apiErrorCode APIより返却されたエラーコード
   */
  protected setErrorInfo(errorType: ErrorType, errorMsgId?: string, apiErrorCode?: string) {
    this._errorsHandlerService?.setNotRetryableError({
      errorType: errorType, // エラータイプ
      errorMsgId: errorMsgId, // メッセージID
      apiErrorCode: apiErrorCode, // APIエラーレスポンス情報
    });
  }

  // エラー情報設定
  protected setRetryableErrorInfo(pageType: PageType, errorInfo?: RetryableError) {
    this._errorsHandlerService?.setRetryableError(pageType, errorInfo);
  }

  // 継続可能かつフライト検索で表示するためのエラー情報設定
  protected setRetryAbleErrorInfoToFlightSearch(errorInfo?: RetryableError) {
    this._deliverySearchInformationStoreService?.updateDeliverySearchInformation({ errorInfo });
  }
}
