import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { PassengerForServicingSeatmapScreen } from '@common/interfaces/reservation/current-seatmap/passenger-for-seatmap-screen';
import { SeatmapHelperService } from '@common/services/seatmap/seatmap-helper.service';
import { CannotSelectChildSeatPassenger } from '@common/interfaces/reservation/current-seatmap/cannot-select-child-seat-passenger';
import { CurrentSeatmapService } from '@common/services';

@Component({
  selector: 'asw-servicing-seatmap-child-seat-not-selectable-confirmation-modal',
  templateUrl: './servicing-seatmap-child-seat-not-selectable-confirmation-modal.component.html',
  styleUrls: ['./servicing-seatmap-child-seat-not-selectable-confirmation-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicingSeatmapChildSeatNotSelectableConfirmationModalComponent extends SupportModalBlockComponent {
  /** チャイルドシート選択不可搭乗者IDリストを取得するためのObservable */
  cannotSelectChildSeatPassengerList?: Map<string, CannotSelectChildSeatPassenger>;

  /** 搭乗者情報 */
  travelersMap?: Map<string, PassengerForServicingSeatmapScreen>;

  /** 搭乗者IDリスト */
  passengerIdList: string[] = [];

  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _currentSeatmapService: CurrentSeatmapService
  ) {
    super(_common);
  }

  init(): void {
    this.cannotSelectChildSeatPassengerList =
      this._currentSeatmapService.CurrentSeatmapData.notSelectableChildSeatInfoMap;
    this.travelersMap = this._currentSeatmapService.CurrentSeatmapData.passengers;
    this.cannotSelectChildSeatPassengerList?.forEach((value, key) => {
      if (key !== undefined) {
        this.passengerIdList.push(key);
      }
    });
    // URLの変更時にモーダルが閉じられるよう設定する
    this.closeWithUrlChange(this._router);
  }

  destroy(): void {}

  reload(): void {}
}
