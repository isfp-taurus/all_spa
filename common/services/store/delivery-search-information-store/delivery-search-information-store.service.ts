import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import {
  deliverySearchInformationInitialState,
  DeliverySearchInformationState,
  DeliverySearchInformationStore,
  resetDeliverySearchInformation,
  selectDeliverySearchInformationState,
  updateDeliverySearchInformation,
} from '@common/store/delivery-search-information';
import { SupportClass } from '@lib/components/support-class';
import { RetryableError } from '@lib/interfaces';

/**
 * 画面間受け渡し情報 store サービス
 */
@Injectable()
export class DeliverySearchInformationStoreService extends SupportClass {
  /** 画面間受け渡し情報Obeservable */
  private _deliverySearchInformation$: Observable<DeliverySearchInformationState>;
  /** Storeに格納する画面間受け渡し情報State*/
  private _deliverySearchInformationData: DeliverySearchInformationState = deliverySearchInformationInitialState;
  /** 画面間受け渡し情報の取得 */
  get deliverySearchInformationData() {
    return this._deliverySearchInformationData;
  }

  constructor(private store: Store<DeliverySearchInformationStore>) {
    super();
    //StoreからObservableの取得 画面間受け渡し情報
    this._deliverySearchInformation$ = this.store.pipe(
      select(selectDeliverySearchInformationState),
      filter((data) => !!data)
    );

    //Storeの値変更時の処理を定義
    this.subscribeService('DeliverySearchInformationStoreService', this._deliverySearchInformation$, (data) => {
      this._deliverySearchInformationData = data;
    });
  }

  destroy() {}

  public getDeliverySearchInformation$() {
    return this._deliverySearchInformation$;
  }

  public resetDeliverySearchInformation() {
    this.store.dispatch(resetDeliverySearchInformation());
  }

  /**
   * 画面間受け渡し情報の更新
   * 更新データ以外も残す
   * @param value 更新データ
   */
  public updateDeliverySearchInformation(value: Partial<DeliverySearchInformationState>) {
    this.store.dispatch(updateDeliverySearchInformation(value));
  }

  /**
   * 継続可能エラーを画面に表示する
   * @return RetryableError エラー情報
   */
  public GetAndReSetDeliverySearchInformation(): RetryableError | undefined {
    const errorInfo = this._deliverySearchInformationData.errorInfo;
    if (errorInfo.errorMsgId !== undefined && errorInfo.errorMsgId !== '') {
      // 表示後、ストアをリセット
      this.resetDeliverySearchInformation();
      return errorInfo;
    } else {
      return undefined;
    }
  }
}
