import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { PassengerForServicingSeatmapScreen } from '@common/interfaces/reservation/current-seatmap/passenger-for-seatmap-screen';
import { SupportComponent } from '@lib/components/support-class';
import { AswMasterService, CommonLibService, ErrorsHandlerService } from '@lib/services';
import { Subject, combineLatest, filter } from 'rxjs';
import { SeatmapHelperService } from '@common/services/seatmap/seatmap-helper.service';
import { PageType } from '@lib/interfaces';

@Component({
  selector: 'asw-servicing-seatmap-open-child-seat-selection-modal-button',
  templateUrl: './servicing-seatmap-open-child-seat-selection-modal-button.component.html',
  styleUrls: ['./servicing-seatmap-open-child-seat-selection-modal-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicingSeatmapOpenChildSeatSelectionModalButtonComponent extends SupportComponent {
  /** Informative かどうか */
  @Input() isInformative: boolean = false;

  /** 選択中搭乗者ID */
  @Input() selectingPassengerId?: string;

  /** 搭乗者マップ */
  @Input()
  set travelersMap(value: Map<string, PassengerForServicingSeatmapScreen>) {
    if (value) {
      this._existsChdOrInsPassengerCalc(value);
      this._travelersMap = value;
      this._changeDetector.markForCheck();
    }
  }
  get travelersMap(): Map<string, PassengerForServicingSeatmapScreen> {
    return this._travelersMap ?? new Map();
  }
  private _travelersMap?: Map<string, PassengerForServicingSeatmapScreen>;

  /** チャイルドシート申込数 */
  @Input() numberOfChildSeats?: number;

  /** チャイルドシート選択モーダルを開くクリックイベント */
  @Output() clickBringChildSeat = new EventEmitter<void>();

  /** チャイルドシート選択の対象の搭乗者が存在するか */
  existsChdOrInsPassenger?: boolean;

  constructor(
    private _common: CommonLibService,
    private _masterService: AswMasterService,
    private _errorHandlerService: ErrorsHandlerService,
    private _seatmapHelperService: SeatmapHelperService,
    private _changeDetector: ChangeDetectorRef
  ) {
    super(_common);
  }

  init(): void {}
  reload(): void {}
  destroy(): void {}

  private _existsChdOrInsPassengerCalc(travelersMap: Map<string, PassengerForServicingSeatmapScreen>) {
    // チャイルドシートの選択対象となる搭乗者情報が存在するか
    // 搭乗者種別が小児、席あり幼児、または搭乗者種別不明(搭乗者種別が大人、かつ幼児情報不明)の搭乗者が存在する場合
    travelersMap?.forEach((passenger) => {
      if (!this.existsChdOrInsPassenger) {
        this.existsChdOrInsPassenger =
          passenger.passengerTypeCode === 'CHD' ||
          passenger.passengerTypeCode === 'INS' ||
          (passenger.passengerTypeCode === 'ADT' && !!passenger.hasNamelessInfant);
      }
    });
  }

  /**
   * チャイルドシート選択モーダルを開くクリックイベントハンドラ
   */
  public onClickBringChildSeat() {
    // NHグループ便名NHグループ運航便以外のセグメントを含むか判定
    if (
      this._seatmapHelperService
        .createAllSegmentList()
        ?.find((segment) => !(segment.isNhGroupOperated && segment.isNhGroupMarketing))
    ) {
      this._errorHandlerService.setRetryableError(PageType.PAGE, { errorMsgId: 'E1326' });
      return;
    }

    // 制限されている機材およびキャビンクラスを含むか判定
    const restrictACVCabinList: string | undefined = this._masterService.getMPropertyByKey(
      'seatMap',
      'aircraftAndCabinRestrictsChildSeat'
    );
    if (
      this._seatmapHelperService
        .createAllSegmentList()
        ?.find((segment) => restrictACVCabinList?.includes(segment.aircraftConfigurationVersion + ':' + segment.cabin))
    ) {
      this._errorHandlerService.setRetryableError(PageType.PAGE, { errorMsgId: 'E1327' });
      return;
    }

    this.clickBringChildSeat.emit();
  }
}
