import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { EventEmitter, Inject, Injectable } from '@angular/core';
import { DialogComponent } from '../../components';
import { DialogInfo } from '../../interfaces';

/** ダイアログ開く際の戻り値の型 */
type DialogEventEmitter = {
  buttonClick$: EventEmitter<DialogComponent>;
};

/**
 * 確認ダイアログ表示用Service
 */
@Injectable()
export class DialogDisplayService {
  constructor(@Inject(DOCUMENT) private _document: Document, private _overlay: Overlay) {}

  /**
   * ダイアログを開く
   *
   * @param dialogInfo ダイアログの情報 {@link DialogInfo}
   * @returns
   */
  public openDialog(dialogInfo: DialogInfo): DialogEventEmitter {
    const positionStrategy = this._overlay.position().global().centerHorizontally().centerVertically();
    const overlayRef = this._overlay.create({
      positionStrategy: positionStrategy,
      hasBackdrop: true,
      scrollStrategy: this._overlay.scrollStrategies.block(),
      backdropClass: 'asw-dialog-cdk',
    });
    const dialogPortal = new ComponentPortal(DialogComponent);
    const dialogRef = overlayRef.attach(dialogPortal);

    dialogInfo.type && (dialogRef.instance.type = dialogInfo.type);
    dialogInfo.size && (dialogRef.instance.size = dialogInfo.size);
    dialogInfo.message && (dialogRef.instance.message = dialogInfo.message);
    dialogInfo.messageParams && (dialogRef.instance.messageParams = dialogInfo.messageParams);
    dialogRef.instance.focusElement = this._document.activeElement;
    dialogInfo.confirmBtnLabel && (dialogRef.instance.confirmBtnLabel = dialogInfo.confirmBtnLabel);
    dialogInfo.closeBtnLabel && (dialogRef.instance.closeBtnLabel = dialogInfo.closeBtnLabel);
    dialogRef.instance.overlayRef = overlayRef;

    return <DialogEventEmitter>{
      buttonClick$: dialogRef.instance.buttonClick$,
    };
  }
}
