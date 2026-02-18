import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import { checkFormListValidate } from '@common/helper';
import { AswValidators } from '@lib/helpers';
import { CommonLibService } from '@lib/services';
import {
  PassengerInformationRequestPassengerFFPData,
  PassengerInformationRequestPassengerFFPParts,
  initialPassengerInformationRequestPassengerFFPData,
  initialPassengerInformationRequestPassengerFFPParts,
  PassengerInformationRequestPassengerFFPParams,
} from './passenger-ffp.state';

/**
 * passenger-information-request
 * FFP情報
 */

@Component({
  selector: 'asw-passenger-information-request-passenger-ffp',
  templateUrl: './passenger-ffp.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassengerInformationRequestPassengerFFPComponent extends SubComponentModelComponent<
  PassengerInformationRequestPassengerFFPData,
  PassengerInformationRequestPassengerFFPParts
> {
  constructor(public change: ChangeDetectorRef, protected _common: CommonLibService) {
    super(change, _common);
  }

  reload() {}
  init() {}
  destroy() {}
  public refresh() {
    this.mileageProgramNameFc.setValue(this.data.mileageProgramName);
    this.FFPNumberFc.setValue(this.data.FFPNumber);
    this.change.markForCheck();
  }
  public update(isTached: boolean = false) {
    this._data.mileageProgramName = this.mileageProgramNameFc.value;
    this._data.FFPNumber = this.FFPNumberFc.value ?? '';
    this._data.isError = checkFormListValidate([this.mileageProgramNameFc, this.FFPNumberFc], isTached);
    this.dataChange.emit(this._data);
  }
  _data = initialPassengerInformationRequestPassengerFFPData();
  _parts = initialPassengerInformationRequestPassengerFFPParts();
  setDataEvent(): void {
    this.refresh();
  }
  setPartsEvent(): void {
    this.refresh();
  }

  public mileageProgramNameFc = new FormControl();
  public FFPNumberFc = new FormControl('', [
    AswValidators.alphaNumeric({ params: PassengerInformationRequestPassengerFFPParams }),
    AswValidators.lengths({
      fixed: 10,
      params: [PassengerInformationRequestPassengerFFPParams, { key: '1', value: 10 }],
    }),
  ]);
}
