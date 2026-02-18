import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { checkFormListValidate } from '@common/helper';
import { SupportInformationInputFoldingTypeModel } from '@common/interfaces';
import { SupportComponent } from '@lib/components/support-class';
import { AswValidators } from '@lib/helpers';
import { ValidationErrorInfo } from '@lib/interfaces';
import { CommonLibService } from '@lib/services';

/**
 * サポート情報入力モーダル
 */
@Component({
  selector: 'asw-support-information-input-folding-type',
  templateUrl: './support-information-input-folding-type.component.html',
  styleUrls: ['support-information-input-folding-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportInformationInputFoldingTypeComponent extends SupportComponent {
  constructor(private _common: CommonLibService, public changeDetectorRef: ChangeDetectorRef) {
    super(_common);
  }

  @Input()
  set data(value: SupportInformationInputFoldingTypeModel) {
    this._data = value;
    this.enableChair();
  }
  get data(): SupportInformationInputFoldingTypeModel {
    return this._data;
  }
  private _data: SupportInformationInputFoldingTypeModel = {
    isFolding: false,
    depth: 0,
    width: 0,
    height: 0,
    weight: 0,
  };
  @Output()
  dataChange = new EventEmitter<SupportInformationInputFoldingTypeModel>();

  public formGroup = new FormGroup({
    depth: new FormControl<number | null>(null, this.getFormControl('label.depth')),
    width: new FormControl<number | null>(null, this.getFormControl('label.width')),
    height: new FormControl<number | null>(null, this.getFormControl('label.height')),
    weight: new FormControl<number | null>(null, this.getFormControl('label.weight')),
  });

  public enableValid = false;
  public isFoldable?: boolean;
  public selectError: ValidationErrorInfo | null = null;
  public focus = {
    width: false,
    height: false,
    depth: false,
    weight: false,
  };

  /**
   * フォームコントロールのフォーカス
   * @param key フォームコントロールキー
   */
  focusInput(key: 'width' | 'height' | 'depth' | 'weight') {
    this.focus[key] = true;
  }
  /**
   * フォームコントロールのフォーカスアウト
   * @param key フォームコントロールキー
   */
  blurInput(key: 'width' | 'height' | 'depth' | 'weight') {
    this.focus[key] = false;
    this.changeDetectorRef.markForCheck();
  }
  /**
   * フォームコントロールのクリア
   * @param formControl フォームコントロール
   */
  clearInput(formControl?: FormControl) {
    if (formControl) {
      formControl.setValue(null);
    }
  }

  /**
   * 折り畳み種別変更処理
   * @param value 折り畳み種別
   */
  public changeFoldable(value: boolean) {
    this.isFoldable = value;
    this.enableChair();
  }

  /**
   * 車いすサイズ入力可否処理
   */
  enableChair() {
    if (this.isFoldable === true || this.isFoldable === undefined) {
      this.formGroup.disable();
    } else {
      this.formGroup.enable();
    }
  }

  /**
   * 入力フォームコントロールの作成
   * @param label フォームの表示ラベル
   * @returns フォームコントロール
   */
  getFormControl(label: string) {
    return [
      AswValidators.required({
        errorMsgId: 'E0001',
        params: {
          key: 0,
          value: label,
        },
      }),
      AswValidators.numeric({
        errorMsgId: 'E0003',
        params: {
          key: 0,
          value: label,
        },
      }),
      AswValidators.numericRange({
        min: 1,
        max: 999,
        errorMsgId: 'E0014',
        params: [
          { key: 0, value: label },
          { key: 1, value: 1 },
          { key: 2, value: 999 },
        ],
      }),
    ];
  }

  /**
   * 初期表示処理
   */

  init(): void {
    this.isFoldable = this.data.isFolding;
    this.formGroup.controls.depth.setValue(this.data.depth !== 0 ? this.data.depth : null);
    this.formGroup.controls.height.setValue(this.data.depth !== 0 ? this.data.height : null);
    this.formGroup.controls.width.setValue(this.data.depth !== 0 ? this.data.width : null);
    this.formGroup.controls.weight.setValue(this.data.depth !== 0 ? this.data.weight : null);
    this.enableChair();
  }

  /**
   * エラー判定開始処理
   */
  public enableValidOn() {
    this.enableValid = true;
    this.changeDetectorRef.markForCheck();
  }

  /**
   * エラー判定
   * @returns 判定結果
   */
  public isError() {
    if (this.isFoldable === undefined) {
      this.selectError = {
        errorMsgId: 'E0002',
        params: {
          key: 0,
          value: 'label.foldingWheelchair',
        },
      };
      this.changeDetectorRef.markForCheck();
      return true;
    } else if (
      //折りたたみ可否が入力されている場合、エラー表記を消す
      this.isFoldable !== undefined
    ) {
      this.selectError = null;
    }

    if (this.isFoldable) {
      return false;
    }
    return checkFormListValidate(Object.values(this.formGroup.controls), true);
  }

  reload(): void {}

  destroy(): void {
    this.apply();
  }

  refresh() {}

  apply() {
    if (!this.isError()) {
      const value: SupportInformationInputFoldingTypeModel = {
        isFolding: this.isFoldable,
        depth: this.isFoldable ? 0 : this.stringToValue(this.formGroup.controls.depth.value),
        width: this.isFoldable ? 0 : this.stringToValue(this.formGroup.controls.width.value),
        height: this.isFoldable ? 0 : this.stringToValue(this.formGroup.controls.height.value),
        weight: this.isFoldable ? 0 : this.stringToValue(this.formGroup.controls.weight.value),
      };
      this.data = value;
      this.dataChange.emit(value);
    }
  }

  /**
   * フォームコントロール情報をフィックス
   * @param value 入力値
   * @returns 数値
   */
  stringToValue(value?: string | null | number): number {
    if (value === undefined || value === null) {
      return 0;
    }
    const val = Number(value);
    if (isNaN(val)) {
      return 0;
    }
    return val;
  }

  /**
   * エラー取得
   * @param data フォームコントロール
   * @returns エラー内容
   */
  getError(data: FormControl): ValidationErrorInfo | undefined {
    if (this.isFoldable === true || this.isFoldable === undefined || (data.value === null && !this.enableValid)) {
      return undefined;
    }
    if (data.errors) {
      const ret = Object.values(data.errors)[0] as ValidationErrorInfo;
      return ret;
    }
    return undefined;
  }
}
