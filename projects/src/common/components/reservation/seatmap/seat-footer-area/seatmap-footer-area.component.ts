import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonLibService, DialogDisplayService, ModalService } from '@lib/services';
import { SupportComponent } from '@lib/components/support-class';
import { DialogClickType, DialogType } from '@lib/interfaces';
import { GetSeatmapsStoreService } from '@common/services/api-store/sdk-servicing/get-seatmaps-store/get-seatmaps-store.service';
import { CurrentSeatmapService } from '@common/services/store/current-seatmap/current-seatmap-store.service';
import { SeatmapHelperService } from '@common/services/seatmap/seatmap-helper.service';
import { designatedSituationDetailsPnrModalPayloadParts } from '../modal/designated-situation-details-pnr-modal/designated-situation-details-pnr-modal.state';
import { MasterJsonKeyPrefix } from '@conf/asw-master.config';
import { FormControl } from '@angular/forms';
/**
 * seatmap-footer-area
 * シートマップ　フッターエリア
 */
@Component({
  selector: 'asw-seatmap-footer-area',
  templateUrl: './seatmap-footer-area.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeatmapFooterAreaComponent extends SupportComponent {
  /** 最後のセグメントを選択しているかどうか */
  public isSelectedLastSegment: boolean = true;

  @Input() seatAttribute: FormControl | null = null;

  @Output() screenReload: EventEmitter<null> = new EventEmitter();
  @Output() clickSaveAndExitHook: EventEmitter<null> = new EventEmitter();
  @Output() showNextSegment: EventEmitter<null> = new EventEmitter();

  constructor(
    private _common: CommonLibService,
    public changeDetector: ChangeDetectorRef,
    private _currentSeatmapService: CurrentSeatmapService,
    private _dialogSvc: DialogDisplayService,
    private _getSeatmapsStoreService: GetSeatmapsStoreService,
    private _seatmapHelperService: SeatmapHelperService,
    private _modalService: ModalService
  ) {
    super(_common);
  }

  /**
   * 初期処理
   */
  init(): void {
    this.subscribeService('seatmapFooterCurrentSeatmap', this._currentSeatmapService.getCurrentSeatmap$(), () => {
      this.isSelectedLastSegment = this._seatmapHelperService.isSelectedLastSegment();
      this.changeDetector.markForCheck();
    });
  }

  /**
   * 支払いに進むボタン押下処理
   */
  public clickSaveAndExit() {
    this.clickSaveAndExitHook.emit();
    if (this.seatAttribute?.invalid) {
      return;
    }
    if (this.mayBeUnableToReserve()) {
      this.showConfirmDialog(`MSG0624`, () => {
        if (this.hasUnreservedPassenger()) {
          this.showConfirmDialog(`MSG0482`, () => {
            this.openDesignatedSituationDetailsPnrModal();
          });
        } else {
          this.openDesignatedSituationDetailsPnrModal();
        }
      });
    } else {
      if (this.hasUnreservedPassenger()) {
        this.showConfirmDialog(`MSG0482`, () => {
          this.openDesignatedSituationDetailsPnrModal();
        });
      } else {
        this.openDesignatedSituationDetailsPnrModal();
      }
    }
  }

  /**
   * 次のフライトへボタン押下処理
   */
  public clickNextFlight() {
    if (this.mayBeUnableToReserve()) {
      this.showConfirmDialog(`MSG0624`, () => {
        if (this.hasUnreservedPassenger()) {
          this.showConfirmDialog(`MSG0482`, () => {
            this.showNextSegment.emit();
          });
        } else {
          this.showNextSegment.emit();
        }
      });
    } else {
      if (this.hasUnreservedPassenger()) {
        this.showConfirmDialog(`MSG0482`, () => {
          this.showNextSegment.emit();
        });
      } else {
        this.showNextSegment.emit();
      }
    }
  }

  /**
   * 指定状況詳細(PNR)モーダルを開く
   */
  private openDesignatedSituationDetailsPnrModal() {
    const part = designatedSituationDetailsPnrModalPayloadParts();
    this._modalService.showSubModal(part);
  }

  /**
   * 確認ダイアログを表示する
   * @param messageId ダイアログに表示するメッセージのID
   * @param callback ダイアログでOKクリック後に行う処理
   */
  private showConfirmDialog(messageId: string, callback: () => void) {
    this._dialogSvc
      .openDialog({
        type: DialogType.CHOICE,
        message: `${MasterJsonKeyPrefix.DYNAMIC}${messageId}`,
      })
      .buttonClick$.subscribe((result) => {
        if (result.clickType === DialogClickType.CLOSE) return;
        callback();
      });
  }

  /**
   * 座席確保不可の可能性があるか判定
   * @returns 座席確保不可の可能性がある: true, 左記以外: false
   */
  private mayBeUnableToReserve(): boolean {
    // 座席指定済みもしくは変更済み,、かつapiより座席確保不可の可能性
    return (
      (this._currentSeatmapService.CurrentSeatmapData.selectedSeatInfoList?.some((seatInfo) =>
        // 条件が指定済み
        seatInfo.passengerList.some((element) => !!element.seatNumber)
      ) ??
        false) &&
      (this._getSeatmapsStoreService.getSeatmapsData.data?.seatmapFlightProperty.isSeatProcuranceFailure ?? true)
    );
  }

  /**
   * 座席未指定の搭乗者が存在するか判定
   * @returns 未指定の搭乗者がいる場合: true, 未指定の搭乗者がいない場合: false
   */
  private hasUnreservedPassenger(): boolean {
    // 座席未指定の搭乗者がある、かつ選択可能な座席がある
    return (
      (this._currentSeatmapService
        .findSegmentSeatInfo(this._seatmapHelperService.getCurrentSelectedSegment()?.id)
        ?.filter((passenger) => !passenger.seatNumber).length ?? 0) > 0 &&
      (this._getSeatmapsStoreService?.getSeatmapsData.data?.seatmaps.numberOfAvailableSeats ?? 0) >=
        (this._currentSeatmapService.findSegmentSeatInfo(this._seatmapHelperService.getCurrentSelectedSegment()?.id)
          ?.length ?? 0)
    );
  }

  destroy(): void {}

  reload(): void {}
}
