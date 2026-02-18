import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ListDataAllData } from '@common/interfaces/master/ListDataAllData';
import { PassengerForServicingSeatmapScreen } from '@common/interfaces';
import { ChildSeatRequestInfo } from '@common/interfaces';
import { CheckboxComponent } from '@lib/components';
import { childSeatModalSelectionStatus } from './servicing-seatmap-select-child-seat-modal-passenger.state';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { SeatmapHelperService } from '@common/services/seatmap/seatmap-helper.service';
import { FormControl } from '@angular/forms';
import { CurrentSeatmapService } from '@common/services';
import { ChildSeatTypeEnum } from '@common/interfaces/servicing-seatmap/child-seats-type';
@Component({
  selector: 'asw-servicing-seatmap-select-child-seat-modal-passenger',
  templateUrl: './servicing-seatmap-select-child-seat-modal-passenger.component.html',
  styleUrls: ['./servicing-seatmap-select-child-seat-modal-passenger.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicingSeatmapSelectChildSeatModalPassengerComponent extends SupportComponent {
  /** チャイルドシートリクエスト情報 */
  @Input() childSeatRequestInfo?: ChildSeatRequestInfo;

  /** チャイルドシート種類 */
  @Input() childSeatTypes?: Array<ListDataAllData>;

  /** 搭乗者ID */
  @Input() passengerId?: string;

  /** 座席番号 */
  @Input() seatNumber?: string;

  /** チャイルドシートチェックボックス状態 */
  public isOnApplyChildSeat = false;

  /** 選択中チャイルドシート種別 */
  public selectingChildSeatType: string = ChildSeatTypeEnum.Mlit;

  /** チャイルドシート種別フォームコントロール */
  public seatTypeControl = new FormControl<string>(ChildSeatTypeEnum.Mlit);

  /** 表示姓名 */
  public passengerName?: string;

  @Output() childSeatCheckboxChangeEvent = new EventEmitter<childSeatModalSelectionStatus>();
  @Output() childSeatSeatTypeChangeEvent = new EventEmitter<childSeatModalSelectionStatus>();

  constructor(
    private _common: CommonLibService,
    private _seatmapHelperService: SeatmapHelperService,
    private _currentSeatmapService: CurrentSeatmapService,
    private _changeDetector: ChangeDetectorRef
  ) {
    super(_common);
  }

  init() {
    if (!this.childSeatRequestInfo?.childSeatType) {
      this.isOnApplyChildSeat = false;
      this.selectingChildSeatType = ChildSeatTypeEnum.Mlit;
    } else {
      this.isOnApplyChildSeat =
        this._currentSeatmapService.CurrentSeatmapData.passengers?.get(this.passengerId ?? '')?.isRequestChildSeat ??
        false;
      this.selectingChildSeatType = this.childSeatRequestInfo.childSeatType;
    }
    this.passengerName = this._currentSeatmapService.CurrentSeatmapData.passengers?.get(this.passengerId ?? '')?.name;
    this.seatTypeControl.setValue(this.selectingChildSeatType);
    this._changeDetector.markForCheck();
  }

  destroy() {}
  reload() {}

  /**
   * チャイルドシートチェックボックス状態変更時時処理
   * @param value 選択状態
   */
  childSeatCheckboxChange(value: CheckboxComponent) {
    this.isOnApplyChildSeat = value.data;
    if (value.data) {
      this.childSeatCheckboxChangeEvent.emit({
        passengerId: this.passengerId ?? '',
        isChecked: value.data,
        seatType: this.selectingChildSeatType,
      });
    } else {
      this.childSeatCheckboxChangeEvent.emit({
        passengerId: this.passengerId ?? '',
        isChecked: value.data,
        seatType: '',
      });
    }
  }

  /**
   * チャイルドシート種別変更時処理
   */
  childSeatSeatTypeChange() {
    this.selectingChildSeatType = this.seatTypeControl.value ?? '';
    this.childSeatSeatTypeChangeEvent.emit({
      passengerId: this.passengerId ?? '',
      seatType: this.seatTypeControl.value ?? '',
    });
  }

  /**
   * 搭乗者番号を返却する関数
   * @param passengerId 搭乗者ID
   * @returns 搭乗者番号
   */
  getPassengerSequence(passengerId?: string): number | undefined {
    return this._currentSeatmapService.getPassengerIndex(
      passengerId ?? '',
      this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? ''
    );
  }
}
