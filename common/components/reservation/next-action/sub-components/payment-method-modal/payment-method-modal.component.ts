import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ServicingFunctionIdType } from '@common/interfaces/servicing-function-id';
import { ServicingPageIdType } from '@common/interfaces/servicing-page-id';
import { SupportModalBlockComponent } from '@lib/components/support-class/support-modal-block-component';
import { CommonLibService } from '@lib/services/common-lib/common-lib.service';
import { Bound, GetOrderResponseData } from 'src/sdk-servicing';
import { PaymentMethodPayload } from './payment-method-modal.state';
import { StaticMsgPipe } from '@lib/pipes';

@Component({
  selector: 'asw-payment-method-modal',
  templateUrl: './payment-method-modal.component.html',
  styleUrls: ['./payment-method-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodModalComponent extends SupportModalBlockComponent {
  subPageId: string = ServicingPageIdType.MY_BOOKING;
  subFunctionId: string = ServicingFunctionIdType.BOOKING_CONFIRMATION;
  isHideSevenEleven = false;

  public override payload: PaymentMethodPayload = { pnr: {} };
  constructor(private _common: CommonLibService, private _router: Router, private _staticMsg: StaticMsgPipe) {
    super(_common);
    this.closeWithUrlChange(this._router);
  }
  reload(): void {}
  init(): void {
    this.isHideSevenEleven = this.getIsHideEleven(this.payload.pnr);
  }
  destroy(): void {}

  getDepartureDate(bounds: Bound[] = []) {
    // PNR情報取得API応答.data.air.bounds.flightsの中に、 最初のisOpenSegment=falseであるflight.departure.dateTimeを取得し、出発日とする。
    for (const bound of bounds) {
      const flights = bound?.flights ?? [];
      for (const flight of flights) {
        if (flight?.isOpenSegment === false) {
          return flight?.departure?.dateTime;
        }
      }
    }
    return null;
  }

  setHoursMinsSecsZero(date: Date) {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    return date;
  }

  getIsHideEleven(pnr: GetOrderResponseData = {}) {
    const departureDateStr = this.getDepartureDate(pnr.air?.bounds);
    // 1.取得した出発日 = ""(空欄)の場合、ボタンを表示する。
    // ※PNR情報取得API応答.data.nextActions.offlinePaymentDetails.Deadlineが存在しない場合、ボタンを表示する。
    if (!departureDateStr || !pnr.nextActions?.offlinePaymentDetails?.deadline) {
      return false;
    }
    // 2.上記以外の場合、以下の処理を行う。
    else {
      // Compare year, month, date only
      const departureDate = this.setHoursMinsSecsZero(new Date(departureDateStr)).getTime();
      const deadlineDate = this.setHoursMinsSecsZero(
        new Date(pnr.nextActions.offlinePaymentDetails.deadline)
      ).getTime();
      // 2.1.PNR情報取得API応答.data.nextActions.offlinePaymentDetails.Deadline < 出発日の場合、
      // コンビニエンスストア払込方法（セブンイレブン）のコンテンツリンクをボタンとして表示する。
      // 2.2.上記以外の場合、ボタンを表示しない。
      return deadlineDate >= departureDate;
    }
  }

  /** (9) セブンイレブンボタン押下処理 */
  clickSevenEleven() {
    // 1.	以下の条件でASWDBの「プロパティ」テーブルからプロパティ.valueを取得して、ウェルネット(外部サイト)のURLとして保持する。
    const destinationURL = this._common.aswMasterService.getMPropertyByKey(
      'servicing',
      'url.wellnet.paymentGuide.convenienceStores'
    );
    // 2.	以下の支払情報をリクエストパラメータにセットし、ウェルネット(外部サイト)を別タブでする。
    const params = new URLSearchParams({
      dkno: this.payload.pnr.nextActions?.offlinePaymentDetails?.encryptedPaymentNumber ?? '',
      rkbn: '2',
      skbn: '6',
    }).toString();
    window.open(`${destinationURL}?${params}`, '_blank');
  }

  /** (10) ローソン、ミニストップ、ファミリーマート、セイコーマートボタン押下処理 */
  clickConvinience() {
    // 1. コンビニ支払いに関するコンテンツページ（url.totalPayment.convenience.dailyYamazaki）を別タブで表示する。
    const convinienceUrl = this._staticMsg.transform('url.totalPayment.convenience.dailyYamazaki');
    window.open(convinienceUrl, '_blank');
  }

  /** (11) デイリーヤマザキ、ヤマザキデイリーストアボタン押下処理 */
  clickDailyYamazaki() {
    // 1.	以下の条件でASWDBの「プロパティ」テーブルからプロパティ.valueを取得して、ウェルネット(外部サイト)のURLとして保持する。
    const destinationURL = this._common.aswMasterService.getMPropertyByKey(
      'servicing',
      'url.wellnet.paymentGuide.convenienceStores'
    );
    // 2.	以下の支払情報をリクエストパラメータにセットし、ウェルネット(外部サイト)を別タブでする。
    const params = new URLSearchParams({
      dkno: this.payload.pnr.nextActions?.offlinePaymentDetails?.encryptedPaymentNumber ?? '',
      rkbn: '2',
      skbn: '2',
    }).toString();
    window.open(`${destinationURL}?${params}`, '_blank');
  }

  closePaymentModal() {
    this.close();
  }
}
