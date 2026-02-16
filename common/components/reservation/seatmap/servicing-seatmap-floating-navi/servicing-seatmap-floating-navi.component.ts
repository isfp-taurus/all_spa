import { AnaSkyCoinInfo } from './../../../../../app/payment-input/container/payment-input-cont.state';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { AswMasterService, CommonLibService } from '@lib/services';
import { isSP } from '@lib/helpers';
import { Type1 } from 'src/sdk-servicing';
import { PassengerForServicingSeatmapScreen } from '@common/interfaces/reservation/current-seatmap/passenger-for-seatmap-screen';
import { SeatmapHelperService } from '../../../../services/seatmap/seatmap-helper.service';
import { MasterStoreKey } from '@conf/asw-master.config';
import { take, zip } from 'rxjs';
import { AppConstants } from '@conf/app.constants';

@Component({
  selector: 'asw-servicing-seatmap-floating-navi',
  templateUrl: './servicing-seatmap-floating-navi.component.html',
  styleUrls: ['./servicing-seatmap-floating-navi.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicingSeatmapFloatingNaviComponent extends SupportComponent {
  /** セグメント表示対象ID */
  @Input() displayTargetSegmentId?: string;

  /** Informative かどうか */
  @Input() isInformative?: boolean = false;

  /** ツアーサイト かどうか(参照時に使用) */
  @Input() isTourSite?: boolean = false;

  /** ACV が返却されているかどうか(参照時に使用) */
  @Input() isAcv?: boolean = true;

  /** 搭乗者マップ */
  @Input() travelersMap: Map<string, PassengerForServicingSeatmapScreen> = new Map();

  /** 全セグメント情報 */
  @Input() allSegmentInfo?: Array<Type1>;

  /** チャイルドシート申込数 */
  @Input() numberOfChildSeats?: number;

  /** 選択中搭乗者ID */
  @Input() selectingPassengerId?: string;

  /** 普通席画像が存在するか */
  @Input() normalSeatImageExist?: boolean;

  /** チャイルドシート選択モーダルを開くクリックイベント */
  @Output() clickBringChildSeat = new EventEmitter<void>();

  /** シートマップレイアウト詳細モーダルを開くクリックイベント */
  @Output() clickLayoutDetail = new EventEmitter<void>();

  /** シートプロダクト情報モーダルを開くクリックイベント */
  @Output() clickSeatType = new EventEmitter<void>();

  /** 凡例モーダルを開くクリックイベント */
  @Output() clickLegend = new EventEmitter<void>();

  /** 画像ファイルパス定数用 */
  public appConstants = AppConstants;

  /** 表示可能キャビンがあるかどうか */
  private isCabin: boolean = false;

  /** キャビン別機材情報マスタ */
  private mAircraftCabin?: any;

  /** 機材マスタ */
  private equipment?: any;

  constructor(
    private _commonService: CommonLibService,
    private _seatmapHelperService: SeatmapHelperService,
    private _masterService: AswMasterService
  ) {
    super(_commonService);
  }

  reload(): void {}

  init(): void {
    this.setFloatingNavigationPadding();

    this.subscribeService(
      'ServicingSeatmapFloatingNaviComponent_init',
      zip(
        this._masterService.getAswMasterByKey$(MasterStoreKey.AIRCRAFT_CABIN_I18N_JOIN_ACV_AND_CABIN).pipe(take(1)),
        this._masterService.getAswMasterByKey$(MasterStoreKey.EQUIPMENT_I18N_JOIN_BY_ACV).pipe(take(1))
      ),
      ([mAircraftCabin, equipment]) => {
        // キャビン別機材情報マスタから対象のレコードを取得
        let displayTargetSegment =
          this.allSegmentInfo && this.allSegmentInfo.find((seg) => seg.id === this.displayTargetSegmentId);
        const targetCabinRecord =
          displayTargetSegment &&
          displayTargetSegment.aircraftConfigurationVersion &&
          displayTargetSegment.cabin &&
          mAircraftCabin[displayTargetSegment.aircraftConfigurationVersion]?.[displayTargetSegment.cabin]?.[0];

        const aircraft_type_url =
          displayTargetSegment?.aircraftConfigurationVersion &&
          equipment?.[displayTargetSegment.aircraftConfigurationVersion]?.[0]?.aircraft_type_url;

        // レイアウト画像または、機種URLが取得できた場合、表示可能キャビンがあるかどうか に true を設定する
        this.isCabin = !!targetCabinRecord?.layout_image || !!aircraft_type_url;

        this.mAircraftCabin = mAircraftCabin;
        this.equipment = equipment;
      }
    );
  }

  destroy(): void {
    this.deleteSubscription('SeatmapFloatingNaviResize');
  }

  /**
   *  チャイルドシート選択モーダルを開くクリックイベントハンドラ
   */
  public onClickBringChildSeat() {
    this.clickBringChildSeat.emit();
  }

  /**
   * シートマップレイアウト詳細モーダルを開くクリックイベントハンドラ
   */
  public onClickLayoutDetail() {
    this.clickLayoutDetail.emit();
  }

  /**
   * シートプロダクト情報モーダルを開くクリックイベントハンドラ
   */
  public onClickSeatType() {
    this.clickSeatType.emit();
  }

  /**
   * 凡例モーダルを開くクリックイベントハンドラ
   */
  public onClickLegend() {
    this.clickLegend.emit();
  }

  /**
   * bottomのスタイル追加処理
   * "登録する"ボタンのフローティングナビ分の高さ分 (SP版のとき62px、それ以外のとき70px)、このコンポーネントのbottomを調整する
   */
  private setFloatingNavigationPadding() {
    let element = document.getElementsByClassName('l-core-contents-float') as HTMLCollectionOf<HTMLElement>;
    if (isSP()) {
      element[0].style.bottom = '62px';
    } else {
      element[0].style.bottom = '70px';
    }
  }

  /**
   * ACVを返却数関数
   * @returns ACV
   */
  private getAircraftConfigurationVersion(): string | undefined {
    return this._seatmapHelperService.getCurrentSelectedSegment()?.aircraftConfigurationVersion;
  }

  /**
   * 座席イメージモーダル表示判定
   * @returns 判定結果
   */
  public isSeatProductDisplay(): boolean {
    return this.isLayoutDetailDisplay() && !!this.normalSeatImageExist;
  }

  /**
   * シートマップレイアウト詳細モーダル表示判定
   * @returns 判定結果
   */
  public isLayoutDetailDisplay(): boolean {
    if (this.isInformative) {
      // 参照の場合
      // シートマップ取得APIよりACVが返却される、かつ、ツアーサイトからの遷移でない場合、表示する。
      return !!this.isAcv && !this.isTourSite && this._isCabinInformative();
    } else {
      // 参照以外の場合
      // PNR情報よりACVが返却される、かつ当該セグメントが他社運航でない場合、表示する。
      return (
        !!this.getAircraftConfigurationVersion() &&
        !!this._seatmapHelperService.getCurrentSelectedSegment()?.isNhGroupOperated &&
        this.isCabin
      );
    }
  }

  /**
   * 表示可能キャビンがあるかどうか(参照でのみ使用)
   *
   * @returns true: 存在する、false: それ以外
   */
  private _isCabinInformative() {
    let segInfo = this.allSegmentInfo?.[0];
    const layoutImage =
      segInfo?.aircraftConfigurationVersion &&
      segInfo?.cabin &&
      this.mAircraftCabin?.[segInfo.aircraftConfigurationVersion]?.[segInfo.cabin]?.[0]?.layout_image;

    const aircraftTypeUrl =
      segInfo?.aircraftConfigurationVersion &&
      this.equipment?.[segInfo.aircraftConfigurationVersion]?.[0]?.aircraft_type_url;

    // レイアウト画像または、機種URLが取得できた場合、表示可能キャビンがあるかどうか に true を設定する
    return !!layoutImage || !!aircraftTypeUrl;
  }
}
