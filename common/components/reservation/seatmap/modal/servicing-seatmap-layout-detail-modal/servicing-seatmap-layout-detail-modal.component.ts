import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  createLegendListForSeatmapLayout,
  getClassNameByCabinCodeByDynamic,
} from '@common/helper/common/seatmap.helper';
import { SeatmapHelperService } from '@common/services/seatmap/seatmap-helper.service';
import { ServicingSeatmapService } from '@common/services/seatmap/servicing-seatmap.service';
import { MasterStoreKey } from '@conf/asw-master.config';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { StaticMsgPipe } from '@lib/pipes';
import { AswMasterService, CommonLibService } from '@lib/services';
import { fromEvent, take, throttleTime, zip } from 'rxjs';
import { SeatLegendDisplayInformation } from '@common/interfaces/servicing-seatmap';
import { ServicingSeatmapLayoutDetailModal } from './servicing-seatmap-layout-detail-modal.state';
import { isSP } from '@lib/helpers';

@Component({
  selector: 'asw-servicing-seatmap-layout-detail-modal',
  templateUrl: './servicing-seatmap-layout-detail-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicingSeatmapLayoutDetailModalComponent extends SupportModalBlockComponent {
  /** レイアウトイメージ */
  layoutImage?: string;

  /** 「さらに詳しく」ボタン押下時に開くURL */
  productUrl?: string;

  /** 凡例リスト */
  legendList?: SeatLegendDisplayInformation[];

  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _staticMsgPipe: StaticMsgPipe,
    private _masterService: AswMasterService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _seatmapService: ServicingSeatmapService,
    private _seatmapHelperService: SeatmapHelperService
  ) {
    super(_common);
  }

  init(): void {
    // URLの変更時にモーダルが閉じられるよう設定する
    this.closeWithUrlChange(this._router);

    // 表示対象のセグメント
    const targetFlight: ServicingSeatmapLayoutDetailModal = this.payload;

    this.subscribeService(
      'ServicingSeatmapLayoutDetailModalComponent_init',
      zip(
        this._masterService.getAswMasterByKey$(MasterStoreKey.AIRCRAFT_CABIN_I18N_JOIN_ACV_AND_CABIN).pipe(take(1)),
        this._masterService.getAswMasterByKey$(MasterStoreKey.EQUIPMENT_I18N_JOIN_BY_ACV).pipe(take(1))
      ),
      ([mAircraftCabin, equipment]) => {
        // キャビン別機材情報マスタから対象のレコードを取得
        const version = targetFlight.displayTargetSegment?.aircraftConfigurationVersion;
        const cabinName = targetFlight.displayTargetSegment?.cabin
          ? targetFlight.displayTargetSegment?.cabin
          : undefined;
        const contentsServerUrl = this._masterService.getMPropertyByKey('seatMap', 'contents.server.url');
        if (!!version && !!cabinName) {
          const targetCabinRecord = mAircraftCabin?.[version]?.[cabinName]?.[0];

          // マスタからレイアウト画像を取得
          if (targetCabinRecord?.layout_image) {
            this.layoutImage = `${contentsServerUrl}${targetCabinRecord.layout_image}.png`;
          }
          // 機種マスタからURLを取得
          if (!!version && !!equipment?.[version]?.[0]?.aircraft_type_url) {
            this.productUrl = equipment?.[version]?.[0]?.aircraft_type_url;
          }
        }

        this.legendList = createLegendListForSeatmapLayout();

        this._changeDetectorRef.markForCheck();
      }
    );

    this.subscribeService(
      'ServicingSeatmapLayoutDetailModalComponent_Resize',
      fromEvent(window, 'resize').pipe(throttleTime(500)),
      this.resizeEvent
    );
  }

  destroy(): void {}

  reload(): void {}

  // 端末認識処理
  public isSp = isSP();
  public isSpPre = isSP();
  /**
   * 画面サイズの変更検知
   */
  private resizeEvent = () => {
    this.isSpPre = this.isSp;
    this.isSp = isSP();
    if (this.isSpPre !== this.isSp) {
      this._changeDetectorRef.markForCheck();
    }
  };

  /**
   * 詳細表示ボタン押下
   */
  public onClickSeatmapDetail() {
    window.open(this.productUrl, '_blank');
  }

  /**
   * キャビンコードからキャビンクラスの名称 (ex. エコノミークラス)を取得する。
   * @returns キャビンクラスの名称
   */
  public getClassNameByCabinCode() {
    // isNeededToSupplementBookingClassをfalse, bookingClassを””(空欄)にしたオブジェクトを用意する。
    let displayTargetSegment = {
      ...this.payload.displayTargetSegment,
      isNeededToSupplementBookingClass: false,
      bookingClass: '',
    };

    return getClassNameByCabinCodeByDynamic(
      this._staticMsgPipe,
      this.payload.isInformative,
      displayTargetSegment,
      this.payload.cabinClasses,
      this.payload.displayTargetSegment.bookingClass
    );
  }
}
