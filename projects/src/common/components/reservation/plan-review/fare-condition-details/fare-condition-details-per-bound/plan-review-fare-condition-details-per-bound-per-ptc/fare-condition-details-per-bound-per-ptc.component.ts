import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { OutputFareConditionsPerBoundPerPtc } from '@common/interfaces';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

@Component({
  selector: 'asw-fare-condition-details-per-bound-per-ptc',
  templateUrl: './fare-condition-details-per-bound-per-ptc.component.html',
  styleUrls: ['./fare-condition-details-per-bound-per-ptc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FareConditionDetailsPerBoundPerPtcComponent extends SupportComponent {
  /** バウンドインデックス */
  @Input() boundIndex: number = 0;

  /** 表示順 */
  @Input() ptcIndex = 0;

  @Input()
  set data(value: OutputFareConditionsPerBoundPerPtc) {
    this._data = value;
    this.refresh();
  }
  get data(): OutputFareConditionsPerBoundPerPtc {
    return this._data;
  }
  private _data: OutputFareConditionsPerBoundPerPtc = {
    ptc: '',
    fareFamilyName: '',
    fareBasis: '',
    promo: undefined,
    changeConditions: {},
    refundConditions: {},
    minStays: '',
    maxStays: '',
  };

  constructor(private _common: CommonLibService, private _changeDetectorRef: ChangeDetectorRef) {
    super(_common);
  }

  refresh(): void {
    this._changeDetectorRef.markForCheck();
  }

  reload(): void {}
  init(): void {}
  destroy(): void {}
}
