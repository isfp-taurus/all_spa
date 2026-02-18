import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService } from '@lib/services';
import { PaymentDetailData, PaymentDetailInput } from './payment-detail.state';

/** 搭乗者種別毎支払総額のデータ */
export type DetailPassengerType = {
  /** 搭乗者種別 */
  passengerType: string;
  /** 支払総額 */
  totalPrice: number;
  /** 航空運賃 */
  farePrice: number;
  /** 税金 */
  tax: number;
};

export type Traveler = {
  /** 大人人数 */
  adult?: number;
  /** ヤングアダルト人数 */
  youngAdult?: number;
  /** 小児人数 */
  child?: number;
  /** 幼児人数 */
  infant?: number;
};

/**
 * 金額内訳モーダル
 * サービスクラスを経由してモーダルとして呼び出し
 */
@Component({
  selector: 'asw-payment-detail-modal',
  templateUrl: './payment-detail-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDetailModalComponent extends SupportModalBlockComponent {
  /** メイン画面から値の引き継ぎ */
  public override payload!: PaymentDetailInput;

  /** 画面表示用データ */
  public paymentDetailData!: PaymentDetailData;
  /** 画面表示用 : 搭乗者種別毎支払総額のデータ */
  public detailPassengerTypeList: DetailPassengerType[] = [];

  public accrualMilesUndefined: boolean = false;

  public price: number = 0;

  /** 搭乗者人数 */
  public traveler: Traveler = {};

  /** 搭乗者人数ラベル */
  public travelersLabel: string = '';

  constructor(private common: CommonLibService, private _staticMsg: StaticMsgPipe) {
    super(common);
  }

  reload(): void {}

  init(): void {
    this.paymentDetailData = this.payload.data;

    this.paymentDetailData.unitPriceList!.forEach((paymentDetail) => {
      this.detailPassengerTypeList.push({
        passengerType: paymentDetail.passengerTypeCode,
        totalPrice: paymentDetail.totalPrice,
        farePrice: paymentDetail.basePrice,
        tax: paymentDetail.tax,
      });
    });

    // 積算マイル
    if (this.paymentDetailData.accrualMiles === undefined) {
      this.accrualMilesUndefined = true;
    }

    this.price = Number(this.paymentDetailData.price);
    this.traveler.adult = this.paymentDetailData.passengerCount.adt;
    this.traveler.youngAdult = this.paymentDetailData.passengerCount.b15;
    this.traveler.child = this.paymentDetailData.passengerCount.chd;
    this.traveler.infant = this.paymentDetailData.passengerCount.inf;

    this.updateTravelersLabel();
  }

  destroy(): void {}

  /** 搭乗者人数のラベル更新 */
  private updateTravelersLabel() {
    const travelerList = [];

    if (this.traveler.adult && this.traveler.adult > 0) {
      const text = this._staticMsg.transform('label.passengerAdult', { '0': this.traveler.adult.toString() });
      travelerList.push(text);
    }
    if (this.traveler.youngAdult && this.traveler.youngAdult > 0) {
      const text = this._staticMsg.transform('label.passengerYoungAdult', { '0': this.traveler.youngAdult.toString() });
      travelerList.push(text);
    }
    if (this.traveler.child && this.traveler.child > 0) {
      const text = this._staticMsg.transform('label.passengerChild', { '0': this.traveler.child.toString() });
      travelerList.push(text);
    }
    if (this.traveler.infant && this.traveler.infant > 0) {
      const text = this._staticMsg.transform('label.passengerInfant', { '0': this.traveler.infant.toString() });
      travelerList.push(text);
    }

    this.travelersLabel = travelerList.join(`${this._staticMsg.transform('label.paxNumberDelimiter')} `);
  }

  /**
   * 1.1.52	閉じるボタン押下時処理※金額内訳モーダル画面
   */
  public closeModal() {
    this.close();
  }
}
