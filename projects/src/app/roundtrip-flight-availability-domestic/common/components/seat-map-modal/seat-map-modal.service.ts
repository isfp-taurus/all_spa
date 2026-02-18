import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { SeatMapModalComponent } from './seat-map-modal.component';
import {
  RoundtripFppItemAirBoundsDataType,
  RoundtripFppItemBoundDetailsDataType,
  RoundtripFppItemFareFamilyDataTypeInner,
} from '../../sdk';
import { AirBounDisplayType, SeatMapInfo } from '../../interfaces';

/**
 * 運賃別シートマップ表示Service
 */
@Injectable()
export class SeatMapModalService {
  constructor(private _overlay: Overlay) {}

  /**
   * 運賃別シートマップ表示モーダルを開く
   * @param seatMapInfo シートマップ情報
   * @param fareFamilies FF情報
   * @param boundDetails Travel Solution情報
   * @returns
   */
  public open(
    isAllUnableFareFamilyCodes?: Array<string>,
    seatMapInfo?: SeatMapInfo,
    fareFamilies?: Array<RoundtripFppItemFareFamilyDataTypeInner>,
    boundDetails?: RoundtripFppItemBoundDetailsDataType,
    fareFamily?: RoundtripFppItemFareFamilyDataTypeInner,
    airBound?: Array<AirBounDisplayType> | null
  ) {
    const overlayRef = this._overlay.create({
      hasBackdrop: true,
      scrollStrategy: this._overlay.scrollStrategies.block(),
    });
    const dialogPortal = new ComponentPortal(SeatMapModalComponent);
    const dialogRef = overlayRef.attach(dialogPortal);
    overlayRef.backdropClick().subscribe(() => {
      dialogRef.instance.baseModal.close();
    });
    dialogRef.instance.overlayRef = overlayRef;
    dialogRef.instance.isAllUnableFareFamilyCodes = isAllUnableFareFamilyCodes;
    dialogRef.instance.seatMapInfo = seatMapInfo;
    dialogRef.instance.fareFamilies = fareFamilies;
    dialogRef.instance.fareFamily = fareFamily;
    dialogRef.instance.focusElement = document.activeElement;
    dialogRef.instance.boundDetails = boundDetails;
    dialogRef.instance.airBound = airBound;
    return {
      seatMap$: dialogRef.instance.seatMap$,
    };
  }
}
