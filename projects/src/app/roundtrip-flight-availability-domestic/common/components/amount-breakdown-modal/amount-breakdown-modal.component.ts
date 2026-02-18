import { OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ModalType, BaseModalComponent } from '../base-modal/base-modal.component';
import {
  NumberOfTravelers,
  RoundtripFppItemAirBoundsDataType,
  RoundtripFppItemAirBoundsDataTypeAirBoundPricesUnitPrices,
} from '../../sdk';
import { StaticMsgPipe } from '@lib/pipes';

/** 静的文言鍵 */
const TRANSLATE_KEY = {
  SORT_DISPLAY_TITLE: 'label.paymentBreakdown.title',
  ADT: 'label.passengerAdult',
  B15: 'label.passengerYoungAdult',
  CHD: 'label.passengerChild',
  INF: 'label.passengerInfant',
  INS: 'label.passengerIns',
};

/** モーダル種別 */
const MODAL_TYPE = '03';

/**
 * 金額内訳モーダルComponent
 */
@Component({
  selector: 'asw-amount-breakdown-modal',
  templateUrl: './amount-breakdown-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmountBreakdownModalComponent {
  /**
   * overlayRef
   */
  public overlayRef?: OverlayRef;

  /**
   * focus要素
   */
  public focusElement?: any;

  /**
   * タイトル
   */
  public title = TRANSLATE_KEY.SORT_DISPLAY_TITLE;

  /**
   * モーダル種別
   */
  public modalType: ModalType = MODAL_TYPE;

  @ViewChild(BaseModalComponent)
  public baseModal!: BaseModalComponent;

  /**
   * 選択済往路Air Bound情報
   */
  public outAirBoundInfo?: RoundtripFppItemAirBoundsDataType;

  /**
   * 選択済復路Air Bound情報
   */
  public returnAirBoundInfo?: RoundtripFppItemAirBoundsDataType;

  /** 搭乗者数 */
  public travelers?: NumberOfTravelers;

  /** コンストラクタ */
  constructor(public staticMsg: StaticMsgPipe) {}

  /**
   * 総金額取得
   * @returns
   */
  public get totalPrice() {
    let total = 0;
    if (this.outAirBoundInfo?.airBound?.prices?.totalPrice.price) {
      total = total + this.outAirBoundInfo?.airBound?.prices?.totalPrice.price.total;
    }
    if (this.returnAirBoundInfo?.airBound?.prices?.totalPrice.price) {
      total = total + this.returnAirBoundInfo?.airBound?.prices?.totalPrice.price.total;
    }
    return total;
  }

  /**
   * 総金額通貨コード取得
   * @returns
   */
  public get currencyCode() {
    if (this.outAirBoundInfo?.airBound?.prices?.totalPrice.price.currencyCode) {
      return this.outAirBoundInfo?.airBound?.prices?.totalPrice.price.currencyCode;
    }
    if (this.outAirBoundInfo?.airBound?.prices?.totalPrice.price.currencyCode) {
      return this.returnAirBoundInfo?.airBound?.prices?.totalPrice.price.currencyCode;
    }
    return '';
  }

  /**
   * プロモーション適用前支払総額
   */
  public get originalTotal() {
    let total = 0;
    if (this.outAirBoundInfo?.airBound?.prices?.totalPrice.discount) {
      total = total + this.outAirBoundInfo?.airBound?.prices?.totalPrice.discount.originalTotal;
    }
    if (this.returnAirBoundInfo?.airBound?.prices?.totalPrice.discount) {
      total = total + this.returnAirBoundInfo?.airBound?.prices?.totalPrice.discount.originalTotal;
    }
    return total;
  }

  /**
   * プロモーション適用済案内
   */
  public get promotionApplied() {
    return (
      !!(
        this.outAirBoundInfo?.airBound?.prices?.totalPrice.discount ||
        this.returnAirBoundInfo?.airBound?.prices?.totalPrice.discount
      ) || false
    );
  }

  /**
   * 搭乗者種別毎支払総額
   * @param airBoundInfo Air Bound情報
   * @returns
   */
  public get unitPrices() {
    if (
      !(this.outAirBoundInfo?.airBound?.prices?.unitPrices || this.returnAirBoundInfo?.airBound?.prices?.unitPrices)
    ) {
      return undefined;
    }
    let prices: RoundtripFppItemAirBoundsDataTypeAirBoundPricesUnitPrices = {
      ADT: {
        base: 0,
        totalTaxes: 0,
        currencyCode: '',
      },
      CHD: {
        base: 0,
        totalTaxes: 0,
        currencyCode: '',
      },
    };

    if (this.outAirBoundInfo?.airBound?.prices?.unitPrices) {
      for (const [key, value] of Object.entries(this.outAirBoundInfo?.airBound?.prices?.unitPrices)) {
        prices[key as keyof RoundtripFppItemAirBoundsDataTypeAirBoundPricesUnitPrices].base =
          this.outAirBoundInfo?.airBound?.prices?.unitPrices[key as keyof typeof prices].base;
        prices[key as keyof RoundtripFppItemAirBoundsDataTypeAirBoundPricesUnitPrices].totalTaxes =
          this.outAirBoundInfo?.airBound?.prices?.unitPrices[
            key as keyof RoundtripFppItemAirBoundsDataTypeAirBoundPricesUnitPrices
          ].totalTaxes;
        prices[key as keyof RoundtripFppItemAirBoundsDataTypeAirBoundPricesUnitPrices].currencyCode =
          this.outAirBoundInfo?.airBound?.prices?.unitPrices[
            key as keyof RoundtripFppItemAirBoundsDataTypeAirBoundPricesUnitPrices
          ].currencyCode;
      }
    }
    if (this.returnAirBoundInfo?.airBound?.prices?.unitPrices) {
      for (const [key, value] of Object.entries(this.returnAirBoundInfo?.airBound?.prices?.unitPrices)) {
        prices[key as keyof RoundtripFppItemAirBoundsDataTypeAirBoundPricesUnitPrices].base =
          prices[key as keyof RoundtripFppItemAirBoundsDataTypeAirBoundPricesUnitPrices].base +
          this.returnAirBoundInfo?.airBound?.prices?.unitPrices[
            key as keyof RoundtripFppItemAirBoundsDataTypeAirBoundPricesUnitPrices
          ].base;
        prices[key as keyof RoundtripFppItemAirBoundsDataTypeAirBoundPricesUnitPrices].totalTaxes =
          prices[key as keyof RoundtripFppItemAirBoundsDataTypeAirBoundPricesUnitPrices].totalTaxes +
          this.returnAirBoundInfo?.airBound?.prices?.unitPrices[
            key as keyof RoundtripFppItemAirBoundsDataTypeAirBoundPricesUnitPrices
          ].totalTaxes;
        prices[key as keyof RoundtripFppItemAirBoundsDataTypeAirBoundPricesUnitPrices].currencyCode =
          this.returnAirBoundInfo?.airBound?.prices?.unitPrices[
            key as keyof RoundtripFppItemAirBoundsDataTypeAirBoundPricesUnitPrices
          ].currencyCode;
      }
    }
    for (const [key, value] of Object.entries(prices)) {
      if (
        !(
          this.outAirBoundInfo?.airBound?.prices?.unitPrices[
            key as keyof RoundtripFppItemAirBoundsDataTypeAirBoundPricesUnitPrices
          ] ||
          this.returnAirBoundInfo?.airBound?.prices?.unitPrices[
            key as keyof RoundtripFppItemAirBoundsDataTypeAirBoundPricesUnitPrices
          ]
        )
      ) {
        delete prices[key as keyof RoundtripFppItemAirBoundsDataTypeAirBoundPricesUnitPrices];
      }
    }
    return prices;
  }

  /**
   * 積算マイル取得
   * @param airBoundInfo Air Bound情報
   * @returns
   */
  public get accrualMiles() {
    let miles = 0;
    if (this.outAirBoundInfo?.accrualMiles) {
      miles = miles + this.outAirBoundInfo?.accrualMiles;
    }
    if (this.returnAirBoundInfo?.accrualMiles) {
      miles = miles + this.returnAirBoundInfo?.accrualMiles;
    }
    return miles;
  }

  /**
   * 予約ヘッダに表示する搭乗者文字列取得
   * @param travelers PNR情報取得レスポンスの搭乗者情報
   * @returns 表示文字列
   */
  getTravelerNumText(travelers: NumberOfTravelers) {
    const passengers = this._getNumberOfPassengersByPassengerTypeArray(travelers);
    let str = '';
    str = passengers
      .map((passenger) => {
        return `${this.staticMsg.transform(passenger.key, { '0': passenger.number })}`;
      })
      .join(this.staticMsg.transform('label.paxNumberDelimiter'));
    return str;
  }

  /**
   * 旅客種別ごとの人数リストを取得する
   * @param travelerNumbers 搭乗者人数リスト
   * @returns
   */
  private _getNumberOfPassengersByPassengerTypeArray(
    travelerNumbers?: NumberOfTravelers
  ): { number: number; key: string }[] {
    const numberOfPassengersByPassengerType = [];
    const ADT = (travelerNumbers && travelerNumbers.ADT) || 0;
    const CHD = (travelerNumbers && travelerNumbers.CHD) || 0;
    const INF = (travelerNumbers && travelerNumbers.INF) || 0;
    if (ADT > 0) {
      numberOfPassengersByPassengerType.push({
        number: ADT,
        key: TRANSLATE_KEY.ADT,
      });
    }
    if (CHD > 0) {
      numberOfPassengersByPassengerType.push({
        number: CHD,
        key: TRANSLATE_KEY.CHD,
      });
    }
    if (INF > 0) {
      numberOfPassengersByPassengerType.push({
        number: INF,
        key: TRANSLATE_KEY.INF,
      });
    }
    return numberOfPassengersByPassengerType;
  }

  /**
   * モーダルを閉じる
   */
  public close() {
    this.baseModal.close();
  }
}
