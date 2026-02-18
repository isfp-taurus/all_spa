/**
 * 手荷物申込画面 (R01-M052)
 *
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { AswMasterService, CommonLibService, PageInitService } from '@lib/services';
import { SupportModalIdComponent } from '@lib/components/support-class/support-modal-id-component';
import { BaggageApplicationModalService } from './baggage-application-modal.service';
import { Router } from '@angular/router';
import {
  ServiceApplicationModalBoundInformation,
  ServiceApplicationModalSegmentInformationPassengerInformation,
  SERVICE_APPLICATION_FBAG_CODE,
} from '../service-application-modal.state';
import { BaggageApplicationModalFooterComponent } from './baggage-application-modal-footer.component';
import { BaggageApplicationModalHeaderComponent } from './baggage-application-modal-header.component';
import { BaggageApplicationModalPayload } from '../service-application-modal-payload.state';
import { ReservationFunctionIdType, ReservationPageIdType } from '@common/interfaces';
import { CurrentCartStoreService } from '@common/services';
import { ReplaySubject, Subject } from 'rxjs';
import {
  BaggageApplicationDynamicParams,
  defaultBaggageApplicationDynamicParams,
} from './baggage-application-modal.state';
import { AswCommonState } from '@lib/store';
import { AswCommonType } from '@lib/interfaces';

@Component({
  selector: 'asw-baggage-application-modal',
  templateUrl: './baggage-application-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaggageApplicationModalComponent extends SupportModalIdComponent {
  override autoInitEnd = false;
  private dynamicSubject = new ReplaySubject<BaggageApplicationDynamicParams>();

  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _pageInitService: PageInitService,
    private _master: AswMasterService,
    public service: BaggageApplicationModalService,
    public change: ChangeDetectorRef,
    private _currentcartStoreService: CurrentCartStoreService
  ) {
    super(_common, _pageInitService);

    const updateValue: Partial<AswCommonState> = {
      [AswCommonType.SUB_PAGE_ID]: this.subPageId,
      [AswCommonType.SUB_FUNCTION_ID]: this.subFunctionId,
    };
    this._common.aswCommonStoreService.updateAswCommon(updateValue);

    this.params = this.dynamicSubject.asObservable();
    //1.1.1	初期表示処理
    const info = this.service.initilizeBoundsInfo();
    //セグメント情報が取れたらマスターの取得
    if (info) {
      const langPrefix = '/' + this._common.aswContextStoreService.aswContextData.lang;
      this.subscribeService(
        'getAirportAllMaster',
        this._master.load([{ key: 'm_airport_i18n', fileName: 'm_airport_i18n' + langPrefix }], true),
        ([data]) => {
          const airPrefix = 'm_airport_i18n_';
          info.bounds.forEach((bound) =>
            bound.segment.forEach((seg) => {
              if (data[airPrefix + seg.airportCode]) {
                seg.locationName = data[airPrefix + seg.airportCode];
              }
              if (data[airPrefix + seg.airportCodeTo]) {
                seg.locationNameTo = data[airPrefix + seg.airportCodeTo];
              }
            })
          );
          this.service.setUpdateInfo(info);
          this.dynamicSubject.next(
            defaultBaggageApplicationDynamicParams(this._currentcartStoreService.CurrentCartData)
          );
          this._pageInitService.endInit(null);

          this.change.markForCheck();
          this.closeWithUrlChange(this._router);
        }
      );
    }
  }
  init() {}
  destroy() {}
  reload() {}

  subPageId: string = ReservationPageIdType.BAGGAGE_REQUEST;
  subFunctionId: string = ReservationFunctionIdType.PRIME_BOOKING;

  public override payload: BaggageApplicationModalPayload | null = {};
  override headerRef: BaggageApplicationModalHeaderComponent | null = null; //ヘッダー画面
  override footerRef: BaggageApplicationModalFooterComponent | null = null; //フッター画面

  /**
   * チェックボックス押下イベント
   * @param val  チェック状態
   * @param code SSRコード
   * @param passenger 対象の搭乗者情報
   */
  clickSsrCode(val: boolean, code: string, passenger: ServiceApplicationModalSegmentInformationPassengerInformation) {
    if (val) {
      passenger.ssr.code = SERVICE_APPLICATION_FBAG_CODE;
    } else {
      passenger.ssr.code = '';
    }
    this.updateSsrAndDisp(this.service.updateInfo);
  }

  /**
   * 更新サービス情報を更新する
   * @param segmentInfo  更新サービス情報
   */
  public updateSsrAndDisp(boundInfo: ServiceApplicationModalBoundInformation) {
    boundInfo.bounds.forEach((segmentInfo) => {
      this.service.updateSsrParam(segmentInfo);
      segmentInfo.isBoundUpdate = segmentInfo.segment.some((seg) => seg.updateSegmentFlag);
    });
    this.service.setUpdateInfo(boundInfo);
    this.change.markForCheck();
  }
}
