import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { RoundtripFppItemBoundDetailsDataType } from '../../sdk';
import { FlightDetailsModalComponent } from './flight-details-modal.component';
import { AirBounDisplayType } from '../../interfaces';

/**
 * フライト詳細モーダル表示Service
 */
@Injectable()
export class FlightDetailsModalService {
  constructor(private _overlay: Overlay) {}

  /**
   * フライト詳細モーダルを開く
   * @param bound Travel Solution情報
   * @param acvCabinClass ACVに設定されたキャビンクラス
   * @returns
   */
  public open(
    airBoundInfo: Array<AirBounDisplayType>,
    bound: RoundtripFppItemBoundDetailsDataType,
    acvCabinClass?: string
  ) {
    const overlayRef = this._overlay.create({
      hasBackdrop: true,
      scrollStrategy: this._overlay.scrollStrategies.block(),
    });
    const dialogPortal = new ComponentPortal(FlightDetailsModalComponent);
    const dialogRef = overlayRef.attach(dialogPortal);
    overlayRef.backdropClick().subscribe(() => {
      dialogRef.instance.baseModal.close();
    });
    dialogRef.instance.overlayRef = overlayRef;
    dialogRef.instance.focusElement = document.activeElement;
    dialogRef.instance.airBoundInfo = airBoundInfo;
    dialogRef.instance.bound = bound;
    dialogRef.instance.acvCabinClass = acvCabinClass;
    return {
      applyButtonClick$: dialogRef.instance.buttonClick$,
    };
  }
}
