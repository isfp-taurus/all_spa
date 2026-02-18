import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { EventEmitter, Inject, Injectable } from '@angular/core';
import { DialogConfirmComponent } from './dialog-confirm.component';

/** ダイアログ開く際の戻り値の型 */
type DialogEventEmitter = {
  buttonClick$: EventEmitter<DialogConfirmComponent>;
};

/**
 * 確認ダイアログ表示用Service
 */
@Injectable()
export class DialogConfirmService {
  constructor(@Inject(DOCUMENT) private _document: Document, private _overlay: Overlay) {}

  /**
   * ダイアログを開く
   *
   * @param dialogInfo ダイアログの情報 {@link DialogInfo}
   * @returns
   */
  public open() {
    const positionStrategy = this._overlay.position().global().centerHorizontally().centerVertically();
    const overlayRef = this._overlay.create({
      positionStrategy: positionStrategy,
      hasBackdrop: true,
      scrollStrategy: this._overlay.scrollStrategies.block(),
      backdropClass: 'asw-dialog-cdk',
    });
    const dialogPortal = new ComponentPortal(DialogConfirmComponent);
    const dialogRef = overlayRef.attach(dialogPortal);
    dialogRef.instance.focusElement = this._document.activeElement;
    dialogRef.instance.overlayRef = overlayRef;
    return <DialogEventEmitter>{
      buttonClick$: dialogRef.instance.buttonClick$,
    };
  }
}
