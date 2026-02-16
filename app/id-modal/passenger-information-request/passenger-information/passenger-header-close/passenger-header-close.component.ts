import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import { RegistrationLabelType } from '@common/interfaces';
import { CommonLibService } from '@lib/services';
import {
  PassengerInformationRequestPassengerCloseHeaderData,
  PassengerInformationRequestPassengerCloseHeaderParts,
  initialPassengerInformationRequestPassengerCloseHeaderData,
  initialPassengerInformationRequestPassengerCloseHeaderParts,
} from './passenger-header-close.state';

/**
 * 搭乗者情報ヘッダ クローズ時
 */
@Component({
  selector: 'asw-passenger-information-request-passenger-header-close',
  templateUrl: './passenger-header-close.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../passenger-information-request.scss'],
})
export class PassengerInformationRequestPassengerCloseHeaderComponent extends SubComponentModelComponent<
  PassengerInformationRequestPassengerCloseHeaderData,
  PassengerInformationRequestPassengerCloseHeaderParts
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

  // 登録状況が未登録か
  public isNotRegistered = false;

  constructor(public change: ChangeDetectorRef, protected _common: CommonLibService) {
    super(change, _common);
  }

  reload() {}
  init() {}
  destroy() {}
  public refresh() {
    switch (this.parts.registrarionLabel) {
      case RegistrationLabelType.REGISTERED:
        this.registrarionClass = 'p-booking-info-mdl__open-state--registered';
        break;
      case RegistrationLabelType.NOT_REGISTERED:
        this.registrarionClass = 'p-booking-info-mdl__open-state--not-registered u-after-image-none';
        break;
      case RegistrationLabelType.EDITTING:
        this.clickOpenPassengerShutter();
        this.registrarionClass = 'p-booking-info-mdl__open-state--editing';
        break;
      default:
        this.registrarionClass = '';
        break;
    }
    this.isNotRegistered = this.parts.registrarionLabel === RegistrationLabelType.NOT_REGISTERED;
    this.change.markForCheck();
  }
  public update() {}
  _data = initialPassengerInformationRequestPassengerCloseHeaderData();
  _parts = initialPassengerInformationRequestPassengerCloseHeaderParts();
  setDataEvent(): void {}
  setPartsEvent(): void {
    this.refresh();
  }

  public registrarionClass = '';

  /**
   * 搭乗者のシャッター開く処理発火
   * */
  public clickOpenPassengerShutter() {
    if (this.parts.registrarionLabel !== RegistrationLabelType.NOT_REGISTERED) {
      this.isOpen = true;
      this.isOpenChange.emit(this.isOpen);
    }
  }
}
