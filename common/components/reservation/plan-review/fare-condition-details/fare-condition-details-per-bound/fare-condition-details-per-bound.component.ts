import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { OutputFareConditionsPerBound } from '@common/interfaces';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

@Component({
  selector: 'asw-fare-condition-details-per-bound',
  templateUrl: './fare-condition-details-per-bound.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FareConditionDetailsPerBoundComponent extends SupportComponent {
  /** バウンドインデックス */
  @Input() boundIndex: number = 0;

  @Input()
  set data(value: OutputFareConditionsPerBound) {
    this._data = value;
    this.refresh();
  }
  get data(): OutputFareConditionsPerBound {
    return this._data;
  }
  private _data: OutputFareConditionsPerBound = {
    depLoc: '',
    arrLoc: '',
    condsPerPtc: [],
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
