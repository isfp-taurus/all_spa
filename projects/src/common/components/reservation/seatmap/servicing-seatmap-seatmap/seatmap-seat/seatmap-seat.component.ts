import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SeatInfo } from '@common/interfaces/reservation/current-seatmap/seat-info';
import { CurrentSeatmapService } from '@common/services';
import { SeatmapHelperService } from '@common/services/seatmap/seatmap-helper.service';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { GetSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInnerColumnsInner } from 'src/sdk-servicing';
import { ServicingSeatmapSeatmapService } from '../servicing-seatmap-seatmap.service';
import { convertCouchSeatNumberToSeatNumberList } from '@common/helper/common/seatmap.helper';
import { AppConstants } from '@conf/app.constants';

@Component({
  selector: 'asw-seatmap-seat',
  templateUrl: './seatmap-seat.component.html',
  styleUrls: ['./seatmap-seat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeatmapSeatComponent extends SupportComponent {
  /** 座席番号 */
  @Input() seatNumber?: string;

  /** 座席種別 */
  @Input() seatCharacteristicsCodes?: Array<string>;

  /** 後向きシートを含むか */
  @Input() isContainedRearFacingSeat?: boolean;

  /** 座席のステータス */
  @Input()
  seatAvailabilityStatus?: GetSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInnerColumnsInner.SeatAvailabilityStatusEnum;

  /** 選択中の座席情報リスト */
  @Input() selectedSeatInfoList?: SeatInfo[];

  /** 表示対象セグメントID */
  @Input() displayTargetSegmentId?: string;

  /** Informativeかどうか */
  @Input() isInformative = false;

  /** 有料ASR席かどうか */
  @Input() isChargeableAsrSeat = false;

  /** 幼児が着席しているか */
  @Input() isInfantOnSeat?: boolean;

  /** 座席変更不可かどうか */
  @Input() isChangeRestrictedAllSeat: boolean = false;

  /** 座席のクリックイベント */
  @Output() clickSeat = new EventEmitter<string>();

  /** 画像ファイルパス定数用 */
  public appConstants = AppConstants;

  constructor(
    private _common: CommonLibService,
    private _seatmapHelperService: SeatmapHelperService,
    private _currentSeatmapService: CurrentSeatmapService,
    private _seatmapSeatmapService: ServicingSeatmapSeatmapService
  ) {
    super(_common);
  }

  reload(): void {}
  init(): void {}
  destroy(): void {}

  /**
   * 座席のクリックイベントハンドラ
   * @param seatNumber 座席番号
   */
  public onClickSeat(seatNumber?: string) {
    if (!!seatNumber) {
      this.clickSeat.emit(seatNumber);
    }
  }

  /**
   * 座席が変更前座席かどうか
   * @param seatNumber 座席番号
   * @returns 判定結果
   */
  public isBeforeChange(seatNumber?: string): boolean {
    return this._seatmapSeatmapService.isBeforeChange(seatNumber);
  }

  /**
   * 指定済みの変更不可席か
   * @param seatNumber 座席番号
   * @returns 判定結果
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
   * 座席が選択済み座席かどうか
   * @param seatNumber 座席番号
   * @returns 判定結果
   */
  public isSelected(seatNumber?: string): boolean {
    return this._seatmapSeatmapService.isSelected(seatNumber);
  }

  /**
   * 座席が選択不可座席かどうか
   * @param seatNumber 座席番号
   * @returns 判定結果
   */
  public isUnavailable(seatNumber?: string): boolean {
    return this._seatmapSeatmapService.isUnavailable(seatNumber) ?? false;
  }

  /**
   * 座席がバックシート（後向き）かどうか
   * @returns 判定結果
   */
  public isBackSeat(): boolean | undefined {
    return (
      this.isContainedRearFacingSeat &&
      !this.seatCharacteristicsCodes?.includes('1W') &&
      !this.seatCharacteristicsCodes?.includes('1D') &&
      !this.seatCharacteristicsCodes?.includes('E') &&
      !!this.seatCharacteristicsCodes?.includes('J')
    );
  }

  /**
   * 座席がフロントシートかどうか
   * @returns 判定結果
   */
  public isFrontSeat(): boolean | undefined {
    return (
      this.isContainedRearFacingSeat &&
      !this.seatCharacteristicsCodes?.includes('1W') &&
      !this.seatCharacteristicsCodes?.includes('1D') &&
      !this.seatCharacteristicsCodes?.includes('E') &&
      !this.seatCharacteristicsCodes?.includes('J')
    );
  }

  /**
   * 押下不可かどうか
   * @returns 判定結果
   */
  public isNotClickable(): boolean {
    if (this.isInformative) {
      // 参照の場合

      // 有料 かつ 非常口
      let isPaidExit = this.seatCharacteristicsCodes?.includes('CH') && this.seatCharacteristicsCodes?.includes('E');
      // 有料ASR席または有料 かつ 非常口の場合
      if (this.isChargeableAsrSeat || isPaidExit) {
        return false;
      }
      return true;
    } else {
      // 参照以外の場合
      return false;
    }
  }

  /**
   * 座席が非常口席かどうか
   * @param seatCharacteristicsCodes
   * @returns 判定結果
   */
  public isExitDoorSeat(seatCharacteristicsCodes?: string[]): boolean {
    return this._seatmapSeatmapService.isExitDoorSeat(seatCharacteristicsCodes);
  }

  /**
   * 座席が窓なし席：左かどうか
   * @param seatCharacteristicsCodes
   * @returns 判定結果
   */
  public isLeftNoWindowSeat(seatCharacteristicsCodes?: string[]): boolean {
    return this._seatmapSeatmapService.isLeftNoWindowSeat(seatCharacteristicsCodes);
  }

  /**
   * 座席が窓なし席：右かどうか
   * @param seatCharacteristicsCodes
   * @returns 判定結果
   */
  public isRightWindowSeat(seatCharacteristicsCodes?: string[]): boolean {
    return this._seatmapSeatmapService.isRightNoWindowSeat(seatCharacteristicsCodes);
  }

  /**
   * 座席がリクライニングしない席かどうか
   * @param seatCharacteristicsCodes
   * @returns 判定結果
   */
  public isNoReclineSeat(seatCharacteristicsCodes?: string[]): boolean {
    return this._seatmapSeatmapService.isNoReclineSeat(seatCharacteristicsCodes);
  }

  /**
   * 座席がバシネット席かどうか
   * @param seatCharacteristicsCodes
   * @returns 判定結果
   */
  public isBassinetSeat(seatCharacteristicsCodes?: string[]): boolean {
    return this._seatmapSeatmapService.isBassinetSeat(seatCharacteristicsCodes);
  }

  /**
   * 座席番号からその座席を選択している搭乗者の搭乗者番号を返す関数
   * @return 搭乗者番号
   */
  public getSelectingPassengerIndex(): number | undefined {
    return this._currentSeatmapService.getPassengerIndex(
      this._currentSeatmapService.findSeatInfoFromSeatNumber(this.seatNumber)?.[0].selectingPassengerID ?? '',
      this.displayTargetSegmentId ?? ''
    );
  }

  /**
   * 変更前座席番号から申込済み搭乗者の搭乗者番号を返す関数
   * @return 搭乗者番号
   */
  public getRegiseteredPassengerIndex(): number | undefined {
    return this._currentSeatmapService.getPassengerIndex(
      this._currentSeatmapService.findSeatInfoFromSeatNumber(this.seatNumber)?.[0].registedPassengerID ?? '',
      this.displayTargetSegmentId ?? ''
    );
  }
}
