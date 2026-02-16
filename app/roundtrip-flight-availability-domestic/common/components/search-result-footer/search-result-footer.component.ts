import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NumberOfTravelers, RoundtripFppItemAirBoundsDataType, RoundtripFppRequestItinerariesInner } from '../../sdk';
import { AmountBreakdownModalService } from '../amount-breakdown-modal';

/**
 * 検索結果フッタPresComponent
 */
@Component({
  selector: 'asw-search-result-footer',
  templateUrl: './search-result-footer.component.html',
})
export class SearchResultFooterComponent {
  /**
   * 区間毎の情報
   */
  @Input()
  public boundInfo?: RoundtripFppRequestItinerariesInner[];

  /**
   * 往路:選択した往路Air Bound情報
   */
  @Input()
  public outSelectedAirBound?: RoundtripFppItemAirBoundsDataType | null;

  /**
   * 復路:選択した復路Air Bound情報
   */
  @Input()
  public returnSelectedAirBound?: RoundtripFppItemAirBoundsDataType | null;

  /**
   * 履歴用検索条件.搭乗者数
   */
  @Input()
  travelers?: NumberOfTravelers;

  /**
   * 次へボタン
   */
  @Output()
  public continue$: EventEmitter<void> = new EventEmitter<void>();

  /**
   * AirOfferの総差額
   */
  public detailPrice?: number;

  /**
   * AirOfferの通貨コード
   */
  public detailPriceCurrencyCode?: string;

  /**
   * プロモーション適用前の総差額
   */
  public detailDelPrice?: number;

  constructor(private _amountBreakdownModalSvc: AmountBreakdownModalService) {}
  /**
   * 次へボタン押下処理
   */
  public continue() {
    this.continue$.emit();
  }

  /**
   * 検索結果フッタ表示判定
   * @returns
   */
  public get showSearchResultFooter() {
    if (this.boundInfo && this.boundInfo?.length === 1 && (this.outSelectedAirBound || this.returnSelectedAirBound)) {
      return true;
    } else if (this.boundInfo && this.boundInfo?.length === 2 && this.returnSelectedAirBound) {
      return true;
    }
    return false;
  }

  /**
   * プロモーション適用済アイコン 表示条件
   * @returns
   */
  public get showDetailPromotion(): boolean {
    if (
      this.outSelectedAirBound?.airBound?.prices?.totalPrice?.discount?.cat25DiscountName ||
      this.outSelectedAirBound?.airBound?.prices?.totalPrice?.discount?.aamDiscountCode
    ) {
      return true;
    } else if (
      this.returnSelectedAirBound?.airBound?.prices?.totalPrice?.discount?.cat25DiscountName ||
      this.returnSelectedAirBound?.airBound?.prices?.totalPrice?.discount?.aamDiscountCode
    ) {
      return true;
    }
    return false;
  }

  /**
   * AirOfferの支払総額 表示条件
   * @returns
   */
  public get showSearchResultDetailPrice() {
    if (this.boundInfo?.length === 1 && this.outSelectedAirBound) {
      this.detailPrice = this.outSelectedAirBound.airBound?.prices?.totalPrice?.price.total;
      this.detailPriceCurrencyCode = this.outSelectedAirBound.airBound?.prices?.totalPrice?.price.currencyCode;
      return true;
    } else if (this.boundInfo?.length === 1 && this.returnSelectedAirBound) {
      this.detailPrice = this.returnSelectedAirBound.airBound?.prices?.totalPrice?.price.total;
      this.detailPriceCurrencyCode = this.returnSelectedAirBound.airBound?.prices?.totalPrice?.price.currencyCode;
      return true;
    } else if (this.boundInfo?.length === 2 && this.outSelectedAirBound && this.returnSelectedAirBound) {
      this.detailPrice =
        (this.outSelectedAirBound.airBound?.prices.totalPrice.price.total || 0) +
        (this.returnSelectedAirBound.airBound?.prices?.totalPrice?.price.total || 0);
      this.detailPriceCurrencyCode = this.returnSelectedAirBound?.airBound?.prices?.totalPrice?.price.currencyCode;
      return true;
    }
    return false;
  }

  /**
   * プロモーション適用前の支払総額 表示条件
   * @returns
   */
  public get showSearchResultDelDetailPrice() {
    if (this.boundInfo?.length === 1 && this.outSelectedAirBound?.airBound?.prices?.totalPrice?.discount) {
      this.detailDelPrice = this.outSelectedAirBound?.airBound?.prices?.totalPrice?.discount.originalTotal;
      return true;
    } else if (this.boundInfo?.length === 1 && this.returnSelectedAirBound?.airBound?.prices?.totalPrice?.discount) {
      this.detailDelPrice = this.returnSelectedAirBound?.airBound?.prices?.totalPrice?.discount.originalTotal;
      return true;
    } else if (
      this.boundInfo?.length === 2 &&
      this.outSelectedAirBound?.airBound?.prices?.totalPrice?.discount &&
      this.returnSelectedAirBound?.airBound?.prices?.totalPrice?.discount
    ) {
      this.detailDelPrice =
        this.outSelectedAirBound?.airBound?.prices?.totalPrice?.discount.originalTotal +
        this.returnSelectedAirBound?.airBound?.prices?.totalPrice?.discount.originalTotal;
      return true;
    }
    return false;
  }

  /**
   * 積算マイル
   * @returns
   */
  public get accrualMiles(): number | null {
    if (this.boundInfo?.length === 1 && this.outSelectedAirBound?.accrualMiles) {
      return this.outSelectedAirBound?.accrualMiles;
    } else if (this.boundInfo?.length === 2 && this.returnSelectedAirBound?.accrualMiles) {
      return (this.outSelectedAirBound?.accrualMiles || 0) + (this.returnSelectedAirBound?.accrualMiles || 0);
    }
    return null;
  }

  /**
   * 金額内訳モーダルを開く
   * @returns
   */
  public openAmountModal() {
    this._amountBreakdownModalSvc.open(
      this.outSelectedAirBound || undefined,
      this.returnSelectedAirBound || undefined,
      this.travelers
    );
    return false;
  }
}
