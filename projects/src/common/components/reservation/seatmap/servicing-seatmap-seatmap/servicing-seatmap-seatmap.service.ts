import { SupportClass } from '@lib/components/support-class';
import { Injectable } from '@angular/core';
import { CurrentSeatmapService } from '@common/services';

@Injectable()
export class ServicingSeatmapSeatmapService extends SupportClass {
  constructor(private _currentSeatmapService: CurrentSeatmapService) {
    super();
  }

  /**
   * 選択不可か
   * @param seatNumber シート番号
   * @returns
   */
  isUnavailable(seatNumber?: string): boolean | undefined {
    const seatInfoList = this._currentSeatmapService.findSeatInfoFromSeatNumber(seatNumber ?? '');
    return (
      seatInfoList?.find(
        (seatInfo) => seatInfo.seatAvailabilityStatus === 'occupied' || seatInfo.seatAvailabilityStatus === 'blocked'
      ) && !seatInfoList?.find((seatInfoList) => !!seatInfoList.registedPassengerID)
    );
  }

  /**
   * 変更前か
   * @param seatNumber シート番号
   * @returns
   */
  isBeforeChange(seatNumber?: string): boolean {
    const isOriginallySelected = this._currentSeatmapService
      .findSeatInfoFromSeatNumber(seatNumber ?? '')
      ?.find((seatInfoList) => !!seatInfoList.registedPassengerID);

    return !!isOriginallySelected && !this.isSelected(seatNumber);
  }

  /**
   * 選択済みか
   * @param seatNumber シート番号
   * @returns
   */
  isSelected(seatNumber?: string): boolean {
    return !!this._currentSeatmapService
      .findSeatInfoFromSeatNumber(seatNumber ?? '')
      ?.find((seatInfoList) => !!seatInfoList.selectingPassengerID);
  }

  /**
   * 選択可能か
   * @param seatNumber シート番号
   * @returns
   */
  isSelectable(seatNumber?: string): boolean {
    return !this.isSelected(seatNumber) && !this.isUnavailable(seatNumber);
  }

  /**
   * 非常口席か
   * @param seatCharacteristicsCodes
   * @returns
   */
  isExitDoorSeat(seatCharacteristicsCodes?: string[]): boolean {
    return seatCharacteristicsCodes?.includes('E') ?? false;
  }

  /**
   * 窓なし席：左か
   * @param seatCharacteristicsCodes
   * @returns
   */
  isLeftNoWindowSeat(seatCharacteristicsCodes?: string[]): boolean {
    return (seatCharacteristicsCodes?.includes('1W') && seatCharacteristicsCodes?.includes('LS')) ?? false;
  }

  /**
   * 窓なし席：右か
   * @param seatCharacteristicsCodes
   * @returns
   */
  isRightNoWindowSeat(seatCharacteristicsCodes?: string[]): boolean {
    return (seatCharacteristicsCodes?.includes('1W') && seatCharacteristicsCodes?.includes('RS')) ?? false;
  }

  /**
   * リクライニングしない席か
   * @param seatCharacteristicsCodes
   * @returns
   */
  isNoReclineSeat(seatCharacteristicsCodes?: string[]): boolean {
    return seatCharacteristicsCodes?.includes('1D') ?? false;
  }

  /**
   * バシネット席か
   * @param seatCharacteristicsCodes
   * @returns
   */
  isBassinetSeat(seatCharacteristicsCodes?: string[]): boolean {
    return (seatCharacteristicsCodes?.includes('B') || seatCharacteristicsCodes?.includes('I')) ?? false;
  }

  destroy(): void {}
}
