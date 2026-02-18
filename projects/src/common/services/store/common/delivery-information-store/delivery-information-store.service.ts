import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import {
  deliveryInformationInitialState,
  DeliveryInformationState,
  DeliveryInformationStore,
  resetDeliveryInformation,
  selectDeliveryInformationState,
  setDeliveryInformation,
  updateDeliveryInformation,
} from '@common/store/delivery-information';
import { SupportClass } from '@lib/components/support-class';

/**
 * 画面間受け渡し情報 store サービス
 */
@Injectable()
export class DeliveryInformationStoreService extends SupportClass {
  /** 画面間受け渡し情報Obeservable */
  private _deliveryInformation$: Observable<DeliveryInformationState>;
  /** Storeに格納する画面間受け渡し情報State*/
  private _deliveryInformationData: DeliveryInformationState = deliveryInformationInitialState;
  /** 画面間受け渡し情報の取得 */
  get deliveryInformationData() {
    return this._deliveryInformationData;
  }

  constructor(private store: Store<DeliveryInformationStore>) {
    super();
    //StoreからObservableの取得 画面間受け渡し情報
    this._deliveryInformation$ = this.store.pipe(
      select(selectDeliveryInformationState),
      filter((data) => !!data)
    );

    //Storeの値変更時の処理を定義
    this.subscribeService('DeliveryInformationStoreService', this._deliveryInformation$, (data) => {
      this._deliveryInformationData = data;
    });
  }

  destroy() {}

  public getDeliveryInformation$() {
    return this._deliveryInformation$;
  }

  public resetDeliveryInformation() {
    this.store.dispatch(resetDeliveryInformation());
  }

  /**
   * 画面間受け渡し情報の更新
   * 更新データ以外削除
   * @param value 更新データ
   */
  public setDeliveryInformation(value: DeliveryInformationState) {
    this.store.dispatch(setDeliveryInformation(value));
  }

  /**
   * 画面間受け渡し情報の更新
   * 更新データ以外の削除条件なし項目削除
   * @param value 更新データ
   */
  public setDefaultDeliveryInformation(value: DeliveryInformationState) {
    this.store.dispatch(setDeliveryInformation({ ...this.getReserveData(), ...value }));
  }

  /**
   * 画面間受け渡し情報の更新
   * 更新データ以外も残す
   * @param value 更新データ
   */
  public updateDeliveryInformation(value: Partial<DeliveryInformationState>) {
    this.store.dispatch(updateDeliveryInformation(value));
  }

  /**
   * キーを指定しての画面間受け渡し情報更新
   * @param key1
   * @param key2
   * @param value
   */
  public setDeliveryInformationByKey(key1: keyof DeliveryInformationState, key2: string, value: any): void {
    this.store.dispatch(
      updateDeliveryInformation({
        [key1]: { ...this.deliveryInformationData[key1], [key2]: value },
      })
    );
  }

  /**
   * 残すデータを返す
   * @returns 削除対象外データ
   */
  private getReserveData() {
    return Object.fromEntries(
      Object.entries(this._deliveryInformationData).filter(([key, value]) => value?.isReserveDeliveryData === true)
    );
  }
}
