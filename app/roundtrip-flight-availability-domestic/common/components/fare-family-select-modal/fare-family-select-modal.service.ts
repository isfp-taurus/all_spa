import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { FareFamilySelectModalComponent } from './fare-family-select-modal.component';
import {
  RoundtripFppItemAirBoundsDataType,
  RoundtripFppItemBoundDetailsDataType,
  RoundtripFppItemFareFamilyDataTypeInner,
  RoundtripFppRequestItinerariesInner,
} from '../../sdk';

/**
 * FF選択モーダル表示Service
 */
@Injectable()
export class FareFamilySelectModalService {
  constructor(private _overlay: Overlay) {}

  /**
   * FF選択モーダルを開く
   * @param boundDetails Travel Solution情報
   * @param airBoundInfo Air Bound情報
   * @param itinerary バウンド情報
   * @param selectedAirBound 選択したAir Bound情報
   * @param boundInfo 区間毎のバウンド情報
   * @param cabinClass キャビンクラス
   * @param isAllUnableFareFamilyCodes 全Air Bound情報フィルタ後選択不可
   * @returns
   */
  public open(
    boundDetails?: RoundtripFppItemBoundDetailsDataType,
    airBoundInfo?: Array<RoundtripFppItemAirBoundsDataType | any>,
    itinerary?: RoundtripFppRequestItinerariesInner,
    selectedAirBound?: RoundtripFppItemAirBoundsDataType | null,
    boundInfo?: RoundtripFppRequestItinerariesInner[],
    fareFamilies?: Array<RoundtripFppItemFareFamilyDataTypeInner>,
    cabinClass?: string,
    isAllUnableFareFamilyCodes?: Array<string>
  ) {
    const overlayRef = this._overlay.create({
      hasBackdrop: true,
      scrollStrategy: this._overlay.scrollStrategies.block(),
    });
    const dialogPortal = new ComponentPortal(FareFamilySelectModalComponent);
    const dialogRef = overlayRef.attach(dialogPortal);
    overlayRef.backdropClick().subscribe(() => {
      dialogRef.instance.baseModal.close();
    });
    dialogRef.instance.overlayRef = overlayRef;
    dialogRef.instance.boundDetails = boundDetails;
    dialogRef.instance.airBoundInfo = airBoundInfo;
    dialogRef.instance.itinerary = itinerary;
    dialogRef.instance.selectedAirBound = selectedAirBound;
    dialogRef.instance.boundInfo = boundInfo;
    dialogRef.instance.fareFamilies = fareFamilies;
    dialogRef.instance.cabinClass = cabinClass;
    dialogRef.instance.focusElement = document.activeElement;
    dialogRef.instance.isAllUnableFareFamilyCodes = isAllUnableFareFamilyCodes;
    return {
      buttonClick$: dialogRef.instance.buttonClick$,
    };
  }
}
