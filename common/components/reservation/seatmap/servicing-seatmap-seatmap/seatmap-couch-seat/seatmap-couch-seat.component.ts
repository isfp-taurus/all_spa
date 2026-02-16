import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { SeatInfo } from '@common/interfaces/reservation/current-seatmap/seat-info';
import { GetSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInnerColumnsInner } from 'src/sdk-servicing';
import { CommonLibService } from '@lib/services';
import { ServicingSeatmapSeatmapService } from '../servicing-seatmap-seatmap.service';
import { CurrentSeatmapService } from '@common/services';

@Component({
  selector: 'asw-seatmap-couch-seat',
  templateUrl: './seatmap-couch-seat.component.html',
  styleUrls: ['./seatmap-couch-seat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeatmapCouchSeatComponent extends SupportComponent {
  /** ３列カウチシートか（falseの場合は4列カウチシートとして扱う） */
  @Input() isThreeColumnCouchSeat?: boolean;

  /** 座席番号 */
  @Input() seatNumber?: string;

  /** 搭乗者IDリスト */
  @Input() passengerIdList?: string[];

  /** 選択中座席情報リスト */
  @Input() selectedSeatInfoList?: SeatInfo[];

  /** 表示対象セグメントID */
  @Input() displayTargetSegmentId?: string;

  /** 座席変更不可かどうか */
  @Input() isChangeRestrictedAllSeat: boolean = false;

  /** 選択中の搭乗者のID */
  @Input() selectingPassengerId?: string;

  /** 座席のステータス */
  @Input()
  seatAvailabilityStatus?: GetSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInnerColumnsInner.SeatAvailabilityStatusEnum;

  /* 左側か */
  @Input() isLeftSide?: boolean;

  /** 座席のクリックイベント */
  @Output() clickSeat = new EventEmitter<string>();

  constructor(
    private _common: CommonLibService,
    private _seatmapSeatmapService: ServicingSeatmapSeatmapService,
    private _currentSeatmapService: CurrentSeatmapService
  ) {
    super(_common);
  }

  reload(): void {}
  init(): void {}
  destroy(): void {}

  /**
   * 選択中の座席かどうか
   * @param seatNumber 座席番号
   * @returns 判定結果
   */
  public isSelected(seatNumber?: string): boolean {
    return this._seatmapSeatmapService.isSelected(seatNumber);
  }

  /**
   * 搭乗者が座席を選択しているかどうか
   * @param passengerId 搭乗者ID
   * @returns 判定結果
   */
  public isSelectedByPassenger(passengerId: string): boolean {
    const targetSeatNumber = this.selectedSeatInfoList
      ?.find((s) => s.segmentId === this.displayTargetSegmentId!)
      ?.passengerList.find((p) => p.id === passengerId)?.seatNumber
      ? this.selectedSeatInfoList
          ?.find((s) => s.segmentId === this.displayTargetSegmentId!)
          ?.passengerList.find((p) => p.id === passengerId)?.seatNumber
      : undefined;
    if (!!targetSeatNumber && !!this.seatNumber && targetSeatNumber === this.seatNumber) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 押下不可の座席であるかどうか
   * @return 判定結果
   */
  public isNotClickable(): boolean {
    return false;
  }

  /**
   * 選択不可の座席かどうか
   * @returns 判定結果
   */
  public isUnavailable(seatNumber?: string): boolean {
    return this._seatmapSeatmapService.isUnavailable(seatNumber) ?? false;
  }

  /**
   * 変更前の座席かどうか
   * @param seatNumber 座席番号
   * @returns 判定結果
   */
  public isBeforeChange(seatNumber?: string): boolean {
    return this._seatmapSeatmapService.isBeforeChange(seatNumber);
  }

  /**
   * 搭乗者ごと座席が変更前かどうか
   * @param seatNumber 座席番号
   * @param passengerId 搭乗者ID
   * @returns 判定結果
   */
  public isBeforeChangeByPassenger(seatNumber?: string, passengerId?: string): boolean {
    const isOriginallySelected: boolean =
      !!this._currentSeatmapService
        .findSeatInfoFromSeatNumber(seatNumber ?? '')
        ?.find((seatInfo) => seatInfo.registedPassengerID === passengerId) ?? false;
    return isOriginallySelected && !this.isSelected(seatNumber);
  }

  /**
   * 指定済みの変更不可席か
   * @param seatNumber 座席番号
   * @return 判定結果
   */
  public isChangeRestricted(seatNumber?: string): boolean {
    if (!!seatNumber) {
      const travelers = this.selectedSeatInfoList?.find(
        (s) => s.segmentId === this.displayTargetSegmentId
      )?.passengerList;
      if (!!travelers) {
        for (let traveler of travelers) {
          if (!!traveler.seatNumber) {
            if (traveler.seatNumber === seatNumber) {
              return this.isChangeRestrictedAllSeat;
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * 搭乗者IDを搭乗者番号に変換する関数
   * @param passengerId 搭乗者ID
   * @returns 搭乗者番号
   */
  public getPassengerIndex(passengerId?: string): number | undefined {
    return passengerId && this.displayTargetSegmentId
      ? this._currentSeatmapService.getPassengerIndex(passengerId, this.displayTargetSegmentId)
      : undefined;
  }

  /**
   * 座席のクリックイベントハンドラ
   * @param seatNumber 席番号
   */
  public onClickSeat(seatNumber?: string) {
    if (!!seatNumber) {
      this.clickSeat.emit(seatNumber);
    }
  }
}
