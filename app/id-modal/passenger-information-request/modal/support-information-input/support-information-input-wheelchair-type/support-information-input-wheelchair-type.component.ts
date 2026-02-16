import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { isStringEmpty } from '@common/helper';
import { SupportInformationInputWheelchairTypeModel } from '@common/interfaces';
import { SupportComponent } from '@lib/components/support-class';
import { ValidationErrorInfo } from '@lib/interfaces';
import { CommonLibService } from '@lib/services';
import { WHEEL_CHAIR_BATTERY_CODE, WHEEL_CHAIR_MANUAL_CODE } from '../support-information-input.state';

/**
 * サポート情報入力モーダル
 */
@Component({
  selector: 'asw-support-information-input-wheelchair-type',
  templateUrl: './support-information-input-wheelchair-type.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportInformationInputWheelchairTypeComponent extends SupportComponent {
  constructor(private _common: CommonLibService, public changeDetectorRef: ChangeDetectorRef) {
    super(_common);
  }

  @Input()
  set data(value: SupportInformationInputWheelchairTypeModel) {
    this._data = value;
  }
  get data(): SupportInformationInputWheelchairTypeModel {
    return this._data;
  }
  private _data: SupportInformationInputWheelchairTypeModel = {
    type: '',
    batteryType: '',
  };
  @Output()
  dataChange = new EventEmitter<SupportInformationInputWheelchairTypeModel>();

  @Input()
  set master(value: Array<{ code: string; name: string }>) {
    this._master = value;
  }
  get master(): Array<{ code: string; name: string }> {
    return this._master;
  }
  private _master: Array<{ code: string; name: string }> = [];

  public type: string = '';
  public batteryType: string = '';
  public selectError: ValidationErrorInfo | null = null;
  public selectBatteryError: ValidationErrorInfo | null = null;

  // 車いす種別選択肢　手動、電動
  public wheelchairTypeSelectList = [
    { value: WHEEL_CHAIR_MANUAL_CODE, label: 'label.manual' },
    { value: WHEEL_CHAIR_BATTERY_CODE, label: 'label.electric' },
  ];

  public WHEEL_CHAIR_MANUAL_CODE = WHEEL_CHAIR_MANUAL_CODE;
  public WHEEL_CHAIR_BATTERY_CODE = WHEEL_CHAIR_BATTERY_CODE;

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

  /**
   * エラー判定
   * @returns エラー判定結果
   */
  public isError() {
    let isError = false;
    if (isStringEmpty(this.type)) {
      this.selectError = {
        errorMsgId: 'E0002',
        params: {
          key: 0,
          value: 'label.wheelchairType',
        },
      };
      isError = true;
    }
    if (this.type === WHEEL_CHAIR_BATTERY_CODE && this.batteryType === '') {
      this.selectBatteryError = {
        errorMsgId: 'E0002',
        params: {
          key: 0,
          value: 'label.batteryType',
        },
      };
      isError = true;
    }
    return isError;
  }

  apply() {
    const value: SupportInformationInputWheelchairTypeModel = {
      type: this.type,
      batteryType: this.batteryType,
    };
    this.data = value;
    this.dataChange.emit(value);
  }

  refresh() {
    this.type = this.data.type;
    this.batteryType = this.data.batteryType;
  }

  /**
   * 車いす種別変更処理
   * @param type 車いす種別
   */
  typeChange(type: string) {
    this.type = type;
  }
}
