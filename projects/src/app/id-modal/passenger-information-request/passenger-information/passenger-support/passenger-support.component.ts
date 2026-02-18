import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import { CommonLibService } from '@lib/services';
import { PassengerInformationRequestPassengerSupportService } from './passenger-support.service';
import {
  PassengerInformationRequestPassengerSupportData,
  PassengerInformationRequestPassengerSupportParts,
  initialPassengerInformationRequestPassengerSupportData,
  initialPassengerInformationRequestPassengerSupportParts,
} from './passenger-support.state';

/**
 * 搭乗者情報入力 サポート情報
 * */
@Component({
  selector: 'asw-passenger-information-request-passenger-support',
  templateUrl: './passenger-support.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassengerInformationRequestPassengerSupportComponent extends SubComponentModelComponent<
  PassengerInformationRequestPassengerSupportData,
  PassengerInformationRequestPassengerSupportParts
> {
  public isOpen: boolean = false;

  constructor(
    public change: ChangeDetectorRef,
    protected _common: CommonLibService,
    private _service: PassengerInformationRequestPassengerSupportService
  ) {
    super(change, _common);
  }

  reload() {}
  init() {}
  destroy() {}
  public refresh() {
    this.isOpen = this.data.blind || this.data.walk || this.data.deaf || this.data.isPregnant;
    this.change.markForCheck();
  }
  public update() {
    this.dataChange.emit(this._data);
  }
  _data = initialPassengerInformationRequestPassengerSupportData();
  _parts = initialPassengerInformationRequestPassengerSupportParts();
  setDataEvent(): void {
    this.refresh();
  }
  setPartsEvent(): void {
    this.refresh();
  }

  /** サポート情報入力モーダル開く処理発火 */
  public showSupport() {
    this._service.editSupportInput(this.data, this.parts, (value) => {
      this.data = value;
      this.dataChange.emit(value);
      this.change.markForCheck();
    });
  }

  /**
   * サポート情報編集ボタン押下処理
   */
  editSupport() {
    this._service.editSupportInput(this.data, this.parts, (value) => {
      this.data = value;
      this.dataChange.emit(value);
      this.change.markForCheck();
    });
  }
}
