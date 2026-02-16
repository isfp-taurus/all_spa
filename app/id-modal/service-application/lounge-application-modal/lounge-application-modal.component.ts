/**
 * ラウンジ申込画面 (R01-M051)
 *
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Type } from '@angular/core';
import { AswMasterService, CommonLibService, PageInitService } from '@lib/services';
import { SupportModalIdComponent } from '@lib/components/support-class/support-modal-id-component';
import {
  ServiceApplicationModalSegmentInformation,
  ServiceApplicationModalSegmentInformationPassengerInformation,
} from '../service-application-modal.state';
import { LoungeApplicationModalService } from './lounge-application-modal.service';
import { Router } from '@angular/router';
import { LoungeApplicationModalHeaderComponent } from './lounge-application-modal-header.component';
import { LoungeApplicationModalFooterComponent } from './lounge-application-modal-footer.component';
import { LoungeApplicationModalPayload } from '../service-application-modal-payload.state';
import { CurrentCartStoreService } from '@common/services';
import { ReservationFunctionIdType, ReservationPageIdType } from '@common/interfaces';
import { ReplaySubject, Subject } from 'rxjs';
import {
  LoungeApplicationDynamicParams,
  defaultLoungeApplicationDynamicParams,
} from './lounge-application-modal.state';
import { AswCommonState } from '@lib/store';
import { AswCommonType } from '@lib/interfaces';
@Component({
  selector: 'asw-lounge-application-modal',
  templateUrl: './lounge-application-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoungeApplicationModalComponent extends SupportModalIdComponent {
  override autoInitEnd = false;
  private dynamicSubject = new ReplaySubject<LoungeApplicationDynamicParams>();

  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _pageInitService: PageInitService,
    private _currentcartStoreService: CurrentCartStoreService,
    private _master: AswMasterService,
    public service: LoungeApplicationModalService,
    public change: ChangeDetectorRef
  ) {
    super(_common, _pageInitService);

    const updateValue: Partial<AswCommonState> = {
      [AswCommonType.SUB_PAGE_ID]: this.subPageId,
      [AswCommonType.SUB_FUNCTION_ID]: this.subFunctionId,
    };
    this._common.aswCommonStoreService.updateAswCommon(updateValue);

    this.params = this.dynamicSubject.asObservable();

    //1.1.1	初期表示処理
    const segmentInfo = this.service.initilizeSegmentInfo();
    //セグメント情報が取れたらマスターの取得
    if (segmentInfo) {
      const langPrefix = '/' + this._common.aswContextStoreService.aswContextData.lang;
      this.subscribeService(
        'getAirportAllMaster',
        this._master.load([{ key: 'm_airport_i18n', fileName: 'm_airport_i18n' + langPrefix }], true),
        ([data]) => {
          const airPrefix = 'm_airport_i18n_';
          segmentInfo.segment.forEach((seg) => {
            if (data[airPrefix + seg.airportCode]) {
              seg.locationName = data[airPrefix + seg.airportCode];
            }
          });
          this.updateSsrAndDisp(segmentInfo, true);
          this.dynamicSubject.next(
            defaultLoungeApplicationDynamicParams(this._currentcartStoreService.CurrentCartData)
          );
          this._pageInitService.endInit(null);

          this.closeWithUrlChange(this._router);
        }
      );
    }
  }

  init() {}
  destroy() {}
  reload() {}

  subPageId: string = ReservationPageIdType.LOUNGE_SERVICE_REQUEST;
  subFunctionId: string = ReservationFunctionIdType.PRIME_BOOKING;
  public override payload: LoungeApplicationModalPayload | null = {};
  public isSubmitEnable = false;
  override headerRef: LoungeApplicationModalHeaderComponent | null = null; //ヘッダー画面
  override footerRef: LoungeApplicationModalFooterComponent | null = null; //フッター画面

  /**
   * 更新サービス情報を更新する
   * @param segmentInfo  更新サービス情報
   */
  public updateSsrAndDisp(segmentInfo: ServiceApplicationModalSegmentInformation, isStatus: boolean) {
    this.service.updateSsrParam(segmentInfo, isStatus);
    this.service.setUpdateInfo(segmentInfo);
    this.change.markForCheck();
  }

  /**
   * チェックボックス押下イベント
   * @param val  チェック状態
   * @param code SSRコード
   * @param passenger 対象の搭乗者情報
   */
  clickSsrCode(val: boolean, code: string, passenger: ServiceApplicationModalSegmentInformationPassengerInformation) {
    if (val) {
      passenger.ssr.code = code;
    } else {
      passenger.ssr.code = '';
    }
    this.updateSsrAndDisp(this.service.updateInfo, false);
  }
}
