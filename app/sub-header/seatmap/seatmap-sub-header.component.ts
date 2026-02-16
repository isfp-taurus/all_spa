import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonLibService, DialogDisplayService, ModalService } from '@lib/services';
import { SupportComponent } from '@lib/components/support-class';
import { isSP } from '@lib/helpers';
import { ChangeDetectionStrategy } from '@angular/core';
import { combineLatest, fromEvent, throttleTime } from 'rxjs';
import { AswCommonStoreService } from '@lib/services';
import { ReservationPageIdType } from '@common/interfaces/common/reservation-page-id';
import { CurrentSeatmapService } from '@common/services/store/current-seatmap/current-seatmap-store.service';
import { SegmentPosInfo } from '@app/seatmap/container/seatmap-cont.state';
import { DialogClickType, DialogSize, DialogType } from '@lib/interfaces';
import { MasterJsonKeyPrefix, MasterStoreKey, MASTER_TABLE } from '@conf/asw-master.config';
import { SeatmapHelperService } from '@common/services/seatmap/seatmap-helper.service';
import { designatedSituationDetailsPnrModalPayloadParts } from '@common/components';
import { AirlineI18nJoinByAirlineCode } from '@common/interfaces/master/airline-i18n-join-by-airline-code';
import { GetOrderResponseData, Type1 } from 'src/sdk-servicing';
import { GetOrderStoreService } from '@common/services';
import { ServicingSeatmapService } from '@common/services/seatmap/servicing-seatmap.service';

/**
 * シートマップ/座席属性指定共通サブヘッダ
 */
@Component({
  selector: 'asw-seatmap-sub-header',
  templateUrl: './seatmap-sub-header.component.html',
  styleUrls: ['./seatmap-sub-header.component.scss'],
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeatmapSubHeaderComponent extends SupportComponent {
  public title: string = '';

  constructor(
    private _router: Router,
    private _common: CommonLibService,
    public changeDetector: ChangeDetectorRef,
    private _currentSeatmapService: CurrentSeatmapService,
    private _getOrderStoreService: GetOrderStoreService,
    private _servicingSeatmapService: ServicingSeatmapService,
    private _seatmapHelperService: SeatmapHelperService,
    private _commonStoreService: AswCommonStoreService,
    private _modalService: ModalService
  ) {
    super(_common);
  }

  isDisabledConfirm = true;

  reload(): void {}
  init(): void {
    this.subscribeService('SubHeaderResize', fromEvent(window, 'resize').pipe(throttleTime(500)), this.resizeEvent);
    this.subscribeService('GetPageID', this._commonStoreService.getPageId$(), (pageID) =>
      pageID === ReservationPageIdType.SEAT_ATTRIBUTE_REQUEST
        ? (this.title = 'label.flightAndSeatAttributeInformation')
        : (this.title = 'label.seatMap')
    );
    this.subscribeService('CurrentSeatmap', this._currentSeatmapService.getCurrentSeatmap$(), (servicingSeatmap) => {
      // 変更されているセグメントが存在する場合、確認ボタン非活性判定に false を設定する。
      if (!!servicingSeatmap) {
        this.isDisabledConfirm = !this._servicingSeatmapService.isSegmentChange(
          servicingSeatmap,
          this._seatmapHelperService.createAllSegmentList(),
          servicingSeatmap.selectedSeatInfoList,
          this._getOrderStoreService.getOrderData.data
        );
        this.changeDetector.markForCheck();
      }
    });
  }
  destroy(): void {}

  public isSpPre = isSP();
  public isSp = isSP();
  private resizeEvent = () => {
    this.isSpPre = this.isSp;
    this.isSp = isSP();
    if (this.isSp !== this.isSpPre) {
      this.changeDetector.markForCheck();
    }
  };

  /**
   * 戻るボタン押下時処理
   */
  backEvent(): void {
    this._currentSeatmapService.resetCurrentSeatmap();
    this._router.navigateByUrl('/plan-review');
  }

  /**
   * 指定状況詳細(PNR)モーダル表示ボタン押下時処理
   */
  confirmEvent(): void {
    this._currentSeatmapService.updateCurrentSeatmap({ isConfirmClick: true });
    const part = designatedSituationDetailsPnrModalPayloadParts();
    this._modalService.showSubModal(part);
  }
}
