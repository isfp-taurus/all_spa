import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { ModalBlockParts, ModalService } from '@lib/services';
import { Subject } from 'rxjs/internal/Subject';
import { FareTypeSelectorModalComponent } from './fare-type-selector-modal.component';
import { FareTypeModalInput, FareTypeModalOutput, FareTypeOption } from './fare-type-selector.state';
import { ShoppingLibService } from '@common/services/shopping/shopping-lib/shopping-lib.service';
import { SearchFlightStoreService } from '@common/services/store/search-flight/search-flight-store/search-flight-store.service';

@Injectable()
export class FareTypeSelectorModalService extends SupportClass {
  constructor(
    private _modalService: ModalService,
    private _shoppingLibService: ShoppingLibService,
    private _searchFlightStoreService: SearchFlightStoreService
  ) {
    super();
    this._modalBlockParts = this._modalService.defaultBlockPart(FareTypeSelectorModalComponent);
    this._modalBlockParts.closeBackEnable = true;
    this._selectedFareTypeSubject = new Subject<FareTypeModalOutput>();
  }

  destroy(): void {
    this._selectedFareTypeSubject.unsubscribe();
  }

  private _modalBlockParts: ModalBlockParts;

  private _selectedFareTypeSubject: Subject<FareTypeModalOutput>;

  /** キャビンクラスを基に選択可能な運賃オプションリストを生成する */
  public createFareTypeOptionList(cabinClass: string | null, isDomesticFlag: boolean): FareTypeOption[] {
    const searchFlightData = this._searchFlightStoreService.getData();
    const awardOption = searchFlightData.fare.awardOption || 'priced';
    const commercialFareFamily = this._shoppingLibService.getCommercialFareFamily(searchFlightData, awardOption);
    if (cabinClass) {
      return this._shoppingLibService.getCabinFareTypeListMap(commercialFareFamily).get(cabinClass) ?? [];
    } else {
      const firstKey = this._shoppingLibService.getCabinFareTypeListMap(commercialFareFamily).keys().next().value;
      // データ型: FareTypeOption[]
      return this._shoppingLibService.getCabinFareTypeListMap(commercialFareFamily).get(firstKey) ?? [];
    }
  }

  public createFareTypeOptionListByAwardOption(awardOption: string | null): FareTypeOption[] {
    const searchFlightData = this._searchFlightStoreService.getData();
    const commercialFareFamily = this._shoppingLibService.getCommercialFareFamily(searchFlightData, awardOption);

    const firstKey = this._shoppingLibService.getCabinFareTypeListMap(commercialFareFamily).keys().next().value;
    // データ型: FareTypeOption[]
    return this._shoppingLibService.getCabinFareTypeListMap(commercialFareFamily).get(firstKey) ?? [];
  }

  public asObservableSubject() {
    return this._selectedFareTypeSubject.asObservable();
  }

  public openModal(fareType: string | null, cabinClass: string | null, isDomesticFlag: boolean) {
    const param: FareTypeModalInput = {
      selectedFareType: fareType,
      selectedCabinClass: cabinClass,
      fareTypeOptionList: this.createFareTypeOptionList(cabinClass, isDomesticFlag),
      subject: this._selectedFareTypeSubject,
    };
    this._modalBlockParts.payload = param;
    this._modalService.showSubModal(this._modalBlockParts);
  }
}
