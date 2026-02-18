import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { SupportInformationInputWheelchairsModel } from '@common/interfaces';
import { SupportComponent } from '@lib/components/support-class';
import { ValidationErrorInfo } from '@lib/interfaces';
import { CommonLibService } from '@lib/services';

/**
 * サポート情報入力モーダル
 */
@Component({
  selector: 'asw-support-information-input-wheelchairs',
  templateUrl: './support-information-input-wheelchairs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportInformationInputWheelchairsComponent extends SupportComponent {
  constructor(private _common: CommonLibService, public changeDetectorRef: ChangeDetectorRef) {
    super(_common);
  }

  @Input()
  set data(value: SupportInformationInputWheelchairsModel) {
    this._data = value;
    this.changeDetectorRef.markForCheck();
  }
  get data(): SupportInformationInputWheelchairsModel {
    return this._data;
  }
  private _data: SupportInformationInputWheelchairsModel = {
    willBeCheckedIn: false,
  };
  @Output()
  dataChange = new EventEmitter<SupportInformationInputWheelchairsModel>();

  public willBeCheckedIn?: boolean;

  /**
   * 初期表示処理
   */

  init(): void {
    this.refresh();
  }

  reload(): void {}

  destroy(): void {
    this.apply();
  }

  public selectError: ValidationErrorInfo | null = null;
  // 車いす持ち込み
  public wheelchairsSelectList = [
    { value: true, label: 'label.willBeCheckedIn' },
    { value: false, label: 'label.willNotBeCheckedIn' },
  ];

  public isError() {
    if (this.willBeCheckedIn === undefined) {
      this.selectError = {
        errorMsgId: 'E0002',
        params: {
          key: 0,
          value: 'label.useWheelchair',
        },
      };
      return true;
    }
    return false;
  }

  apply() {
    const value: SupportInformationInputWheelchairsModel = {
      willBeCheckedIn: this.willBeCheckedIn,
    };
    this.data = value;
    this.dataChange.emit(value);
  }

  refresh() {
    this.willBeCheckedIn = this.data.willBeCheckedIn;
    this.changeDetectorRef.markForCheck();
  }

  /**
   * 車いす持ち込みフラグ変更処理
   * @param value 変更値
   */
  changeWillBeCheckedIn(value: boolean) {
    this.willBeCheckedIn = value;
    this.apply();
    this.changeDetectorRef.markForCheck();
  }
}
