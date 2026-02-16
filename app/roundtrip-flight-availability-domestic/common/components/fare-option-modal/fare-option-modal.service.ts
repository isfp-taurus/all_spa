import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { FareOptionModalComponent } from './fare-option-modal.component';

/**
 * 運賃オプションモーダル表示Service
 */
@Injectable()
export class FareOptionModalService {
  constructor(private _overlay: Overlay) {}

  /**
   * 運賃オプションモーダルを開く
   * @param currentFareOption 現在運賃オプション
   * @returns
   */
  public open(currentFareOption: string) {
    const overlayRef = this._overlay.create({
      hasBackdrop: true,
      scrollStrategy: this._overlay.scrollStrategies.block(),
    });
    const dialogPortal = new ComponentPortal(FareOptionModalComponent);
    const dialogRef = overlayRef.attach(dialogPortal);
    overlayRef.backdropClick().subscribe(() => {
      dialogRef.instance.baseModal.close();
    });
    dialogRef.instance.overlayRef = overlayRef;
    dialogRef.instance.focusElement = document.activeElement;
    dialogRef.instance.currentFareoption = currentFareOption;
    return {
      applyButtonClick$: dialogRef.instance.buttonClick$,
      close: dialogRef.instance.close.bind(dialogRef.instance),
    };
  }
}
