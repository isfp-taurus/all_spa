import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { PassengerForServicingSeatmapScreen } from '@common/interfaces/reservation/current-seatmap/passenger-for-seatmap-screen';
import { SeatForServicingSeatmapScreen } from '@common/interfaces/reservation/current-seatmap/seatmap-for-seatmap-screen';
import { SeatInfo } from '@common/interfaces/reservation/current-seatmap/seat-info';
import { isSP } from '@lib/helpers';
import { CommonLibService } from '@lib/services';
import { CurrentSeatmapService } from '@common/services';
import { SeatmapHelperService } from '@common/services/seatmap/seatmap-helper.service';

@Component({
  selector: 'asw-servicing-seatmap-assignment-status',
  templateUrl: './servicing-seatmap-assignment-status.component.html',
  styleUrls: ['./servicing-seatmap-assignment-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicingSeatmapAssignmentStatusComponent extends SupportComponent {
  /** 搭乗者マップ */
  @Input() travelersMap?: Map<string, PassengerForServicingSeatmapScreen>;

  /** 搭乗者IDリスト */
  @Input() set passengerIdList(value: string[] | undefined) {
    this._passengerIdList = value?.filter((passengerId) =>
      this._currentSeatmapService.CurrentSeatmapData.passengers?.get(passengerId)
    );
  }
  get passengerIdList(): string[] | undefined {
    return this._passengerIdList;
  }
  private _passengerIdList?: string[];

  /** 選択中の搭乗者のID */
  @Input() set selectingPassengerId(value: string | undefined) {
    this._selectingPassengerId = value;
    if (!!this._selectingPassengerId) {
      this.selectingPassenger = this.travelersMap?.get(this._selectingPassengerId!);
    }
    this.currentSelectingPassengerIndex =
      this._currentSeatmapService.getPassengerIndex(
        this._selectingPassengerId ?? '',
        this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? ''
      ) ?? -1;
  }
  get selectingPassengerId(): string | undefined {
    return this._selectingPassengerId;
  }
  private _selectingPassengerId?: string;

  /** 選択中の座席番号 */
  @Input() selectingSeatNumber?: string;

  /** 表示対象セグメントID */
  @Input() displayTargetSegmentId?: string;

  /** 選択中座席情報リスト */
  @Input() selectedSeatInfoList?: SeatInfo[];

  /** 座席変更不可かどうか */
  @Input() isChangeRestrictedAllSeat: boolean = false;

  /** 座席情報マップ */
  @Input() seatInformationMap?: Map<string, SeatForServicingSeatmapScreen>;

  /** 搭乗者欄のクリックイベント */
  @Output() clickPassenger = new EventEmitter<string>();

  /** 選択中の搭乗者 (表示用) */
  selectingPassenger?: PassengerForServicingSeatmapScreen;

  /** SP版のアコーディオン表示の場合の開閉状態 */
  isOpen: boolean = false;

  /** 搭乗者情報リストまたは選択中の搭乗者のIDの値が更新された */
  isChanged = false;

  /** 選択中搭乗者インデックス */
  currentSelectingPassengerIndex: number = -1;

  constructor(
    private _commonService: CommonLibService,
    private _currentSeatmapService: CurrentSeatmapService,
    private _seatmapHelperService: SeatmapHelperService
  ) {
    super(_commonService);
  }

  reload(): void {}
  init(): void {}
  destroy(): void {}

  /**
   * 搭乗者欄のクリックイベントハンドラ
   *
   * 座席選択中の搭乗者を切り替える
   */
  public onClickPassenger(id: string) {
    this.selectingPassengerId = id;
    this.selectingPassenger = this.travelersMap?.get(id) as PassengerForServicingSeatmapScreen;
    this.clickPassenger.emit(id);
    if (isSP()) {
      this.onClickAccordionHead();
    }
  }

  /**
   * SP版のアコーディオン表示の場合、アコーディオン開閉のクリックイベントハンドラ
   */
  public onClickAccordionHead() {
    this.isOpen = !this.isOpen;
  }

  /**
   * 選択中の搭乗者かどうか
   * @return 選択中の搭乗者かどうか
   */
  public isCurrent(id: string): boolean {
    return id === this.selectingPassengerId;
  }

  /**
   * 座席指定済みの搭乗者かどうか
   * @return 座席指定済みの搭乗者かどうか
   */
  public isSelected(passengerId: string): boolean {
    return !!this._currentSeatmapService
      .findSegmentSeatInfo(this._seatmapHelperService.getCurrentSelectedSegment()?.id)
      ?.find((passenger) => passenger.id === passengerId)?.seatNumber;
  }

  /**
   * 搭乗者毎に該当するボタンの読み上げ文言を取得。
   * @param id 搭乗者id
   * @returns 該当する静的文言キー
   */
  public getButtonReaderStaticMsgKey(id: string): string {
    if (this.isChangeRestrictedAllSeat) {
      return 'reader.noSeatSelectionPassenger';
    } else if (this.isCurrent(id)) {
      return 'reader.selectingSeatsPassenger';
    } else if (this.isSelected(id)) {
      return 'reader.seatSelectedPassenger';
    } else {
      return 'reader.noSeatSelectedPassenger';
    }
  }

  /**
   * 特定の搭乗者が選択している座席の座席番号を返却する関数
   * @param passengerId 搭乗者ID
   * @returns 座席番号
   */
  public getSeatNumber(passengerId: string): string | undefined {
    return this._currentSeatmapService.findSegmentPassengerSeatInfo(
      this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? '',
      passengerId
    )?.seatNumber;
  }

  /**
   * 席なし幼児の搭乗者IDからその名前を返却する関数
   * @param passengerId 搭乗者ID
   * @returns 席なし幼児の名前
   */
  public getInfantName(passengerId?: string): string {
    return this._currentSeatmapService.getInfantName(passengerId) ?? '';
  }

  /**
   * 画面デザイン判定：SPかどうか
   * @returns true：SP、false：SP以外
   */
  isSpDesign() {
    return isSP();
  }
}
