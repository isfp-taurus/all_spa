import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import { CommonLibService } from '@lib/services';
import {
  PassengerInformationRequestPassengerOpenHeaderData,
  PassengerInformationRequestPassengerOpenHeaderParts,
  initialPassengerInformationRequestPassengerOpenHeaderData,
  initialPassengerInformationRequestPassengerOpenHeaderParts,
} from './passenger-header-open.state';

/**
 * 搭乗者情報ヘッダ オープン時
 */
@Component({
  selector: 'asw-passenger-information-request-passenger-header-open',
  templateUrl: './passenger-header-open.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../passenger-information-request.scss'],
})
export class PassengerInformationRequestPassengerOpenHeaderComponent extends SubComponentModelComponent<
  PassengerInformationRequestPassengerOpenHeaderData,
  PassengerInformationRequestPassengerOpenHeaderParts
> {
  @Input()
  set isOpen(value: boolean) {
    this._isOpen = value;
    this.change.markForCheck();
  }
  get isOpen() {
    return this._isOpen;
  }
  public _isOpen: boolean = false;
  @Output()
  isOpenChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(public change: ChangeDetectorRef, protected _common: CommonLibService) {
    super(change, _common);
  }

  reload() {}
  init() {}
  destroy() {}
  public refresh() {
    this.change.markForCheck();
  }
  public update() {}
  _data = initialPassengerInformationRequestPassengerOpenHeaderData();
  _parts = initialPassengerInformationRequestPassengerOpenHeaderParts();
  setDataEvent(): void {}
  setPartsEvent(): void {
    this.refresh();
  }
}
