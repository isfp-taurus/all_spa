import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { AmountBreakdownModalComponent } from './amount-breakdown-modal.component';
import { NumberOfTravelers, RoundtripFppItemAirBoundsDataType } from '../../sdk';

/**
 * 金額内訳モーダル表示Service
 */
@Injectable()
export class AmountBreakdownModalService {
  constructor(private _overlay: Overlay) {}

  /**
   * 金額内訳モーダルを開く
   * @param outAirBoundInfo 選択済往路Air Bound情報
   * @param returnAirBoundInfo 選択済復路Air Bound情報
   * @param travelers 履歴用検索条件.搭乗者数
   * @returns
   */
  public open(
    outAirBoundInfo?: RoundtripFppItemAirBoundsDataType,
    returnAirBoundInfo?: RoundtripFppItemAirBoundsDataType,
    travelers?: NumberOfTravelers
  ) {
    const overlayRef = this._overlay.create({
      hasBackdrop: true,
      scrollStrategy: this._overlay.scrollStrategies.block(),
    });
    const dialogPortal = new ComponentPortal(AmountBreakdownModalComponent);
    const dialogRef = overlayRef.attach(dialogPortal);
    overlayRef.backdropClick().subscribe(() => {
      dialogRef.instance.baseModal.close();
    });
    dialogRef.instance.overlayRef = overlayRef;
    dialogRef.instance.outAirBoundInfo = outAirBoundInfo;
    dialogRef.instance.focusElement = document.activeElement;
    dialogRef.instance.returnAirBoundInfo = returnAirBoundInfo;
    dialogRef.instance.travelers = travelers;
    return {
      close: dialogRef.instance.close.bind(dialogRef.instance),
    };
  }
}
