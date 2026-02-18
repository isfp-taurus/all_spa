import { Injectable } from '@angular/core';
import { SeatmapPresService } from '@app/seatmap/presenter/seatmap-pres.service';
import { CurrentSeatmapService } from '@common/services';
import { SeatmapHelperService } from '@common/services/seatmap/seatmap-helper.service';
import { SupportClass } from '@lib/components/support-class';

@Injectable()
export class PaidSeatDetailConfirmationService extends SupportClass {
  constructor(private _currentSeatmapService: CurrentSeatmapService, private _seatmapPresService: SeatmapPresService) {
    super();
  }

  init() {}
  destroy(): void {}

  /**
   * 指定を確定した際ストア更新処理
   * @param specifyAmount 座席指定金額
   * @param applyingPassenger 指定した搭乗者IDリスト
   */
  public updateStore(isCouchSeat?: boolean, specifyAmount?: number, applyingPassenger?: string[]) {
    const seatNumber = this._currentSeatmapService.CurrentSeatmapData.selectingSeatNumber;
    if (isCouchSeat) {
      this._seatmapPresService.updateCurrentSeatmapCouchSeat(applyingPassenger, specifyAmount, seatNumber ?? '');
      if (applyingPassenger?.length) {
        this._currentSeatmapService.updateCurrentSeatmap({ isOperationOnProgress: true });
      }
    } else {
      if (this._currentSeatmapService.CurrentSeatmapData.selectingPassengerId) {
        this._seatmapPresService.updateCurrentSeatmapNormalSeat(
          this._currentSeatmapService.CurrentSeatmapData.selectingPassengerId,
          seatNumber ?? '',
          specifyAmount
        );
        this._currentSeatmapService.updateCurrentSeatmap({ isOperationOnProgress: true });
      }
    }
    this._currentSeatmapService.updateCurrentSeatmap({
      selectingSeatNumber: '',
    });
  }
}
