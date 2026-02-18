import { AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { OutputFareConditionsPerBound } from '@common/interfaces';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

/**
 * 運賃ルール詳細モーダル
 */
@Component({
  selector: 'asw-fare-condition-details',
  templateUrl: './fare-condition-details.component.html',
  styleUrls: ['./fare-condition-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FareConditionDetailsModalComponent extends SupportModalBlockComponent implements AfterViewChecked {
  @Input()
  set data(value: OutputFareConditionsPerBound[]) {
    this._data = value;
    this.refresh();
  }
  get data(): OutputFareConditionsPerBound[] {
    return this._data;
  }
  private _data: OutputFareConditionsPerBound[] = [];

  constructor(private _common: CommonLibService, private _changeDetectorRef: ChangeDetectorRef) {
    super(_common);
  }

  init(): void {
    this.data = this.payload.data;
  }

  refresh(): void {
    this._changeDetectorRef.markForCheck();
  }

  reload(): void {}

  destroy(): void {}

  ngAfterViewChecked(): void {
    this.resize();
    this._changeDetectorRef.markForCheck();
  }

  /** 閉じるボタン押下時処理 */
  clickClose() {
    this.close();
  }
}
