import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { SortModalComponent } from './sort-modal.component';
import { SortOrder } from '../../interfaces';

/**
 * ソート条件モーダル表示Service
 */
@Injectable()
export class SortModalService {
  constructor(private _overlay: Overlay) {}

  /**
   * ソート条件モーダルを開く
   * @param sortOrder ソート種別
   * @returns
   */
  public open(sortOrder: SortOrder) {
    const overlayRef = this._overlay.create({
      hasBackdrop: true,
      scrollStrategy: this._overlay.scrollStrategies.block(),
    });
    const dialogPortal = new ComponentPortal(SortModalComponent);
    const dialogRef = overlayRef.attach(dialogPortal);
    overlayRef.backdropClick().subscribe(() => {
      dialogRef.instance.baseModal.close();
    });
    dialogRef.instance.overlayRef = overlayRef;
    dialogRef.instance.focusElement = document.activeElement;
    dialogRef.instance.sortOrder = sortOrder;
    return {
      sortButtonClick$: dialogRef.instance.buttonClick$,
      close: dialogRef.instance.close.bind(dialogRef.instance),
    };
  }
}
