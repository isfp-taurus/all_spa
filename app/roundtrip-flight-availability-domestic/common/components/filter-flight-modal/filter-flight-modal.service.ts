import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { FilterFlightModalComponent } from './filter-flight-modal.component';
import { FilterOpenParam } from '../../interfaces';

/**
 * フィルタ条件モーダル表示Service
 */
@Injectable()
export class FilterFlightModalService {
  constructor(private _overlay: Overlay) {}

  /**
   * フィルタ条件モーダルを開く
   * @param openParam フィルタ条件モーダル表示用情報
   * @returns
   */
  public open(openParam: FilterOpenParam) {
    const overlayRef = this._overlay.create({
      hasBackdrop: true,
      scrollStrategy: this._overlay.scrollStrategies.block(),
    });
    const dialogPortal = new ComponentPortal(FilterFlightModalComponent);
    const dialogRef = overlayRef.attach(dialogPortal);
    overlayRef.backdropClick().subscribe(() => {
      dialogRef.instance.baseModal.close();
    });
    dialogRef.instance.overlayRef = overlayRef;
    dialogRef.instance.focusElement = document.activeElement;
    dialogRef.instance.filterCondition = openParam.filterCondition;
    dialogRef.instance.filterConditionInitData = openParam.filterConditionInitData;
    dialogRef.instance.isPromotionVisible = openParam.isPromotionVisible;
    dialogRef.instance.isReturnVisible = openParam.isReturnVisible;
    return {
      applyButtonClick$: dialogRef.instance.buttonClick$,
      close: dialogRef.instance.close.bind(dialogRef.instance),
    };
  }
}
