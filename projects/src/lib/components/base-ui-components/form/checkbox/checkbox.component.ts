import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import { Child } from '../../base-ui.component';
import { BaseInputComponent } from '../base-input.component';
import { CheckboxGroupComponent } from './checkbox-group.component';

/**
 * [BaseUI] checkbox
 *
 * @extends {BaseInputComponent}
 */
@Component({
  selector: 'asw-checkbox',
  templateUrl: './checkbox.component.html',
  providers: [
    {
      provide: Child,
      useExisting: forwardRef(() => CheckboxComponent),
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent extends BaseInputComponent {
  /** checked（選択）状態 */
  @Input()
  public get checked(): boolean {
    return this.data;
  }
  public set checked(value: BooleanInput) {
    this.data = coerceBooleanProperty(value);
    this.markForCheck();
  }

  private _isHidden = false;
  /** ラベル非表示判定フラグ（ラベルを非表示にする場合のみ`true`を指定） */
  @Input()
  public get isHidden(): boolean {
    return this._isHidden;
  }
  public set isHidden(value: BooleanInput) {
    this._isHidden = coerceBooleanProperty(value);
    this.markForCheck();
  }

  private _disableForParent = false;
  /** ラベル非表示判定フラグ（親Component側でのコントロール） */
  public get disableForParent(): boolean {
    return this._disableForParent;
  }
  public set disableForParent(value: BooleanInput) {
    this._disableForParent = coerceBooleanProperty(value);
    this.markForCheck();
  }

  /** 親Component指定 */
  public override parent!: CheckboxGroupComponent;

  /**
   * `change`イベント
   *
   * @param event
   */
  public onChangeHandle(event?: Event) {
    this.onChange(event);
    if (this.parent) {
      this.parent.onChangeHandle(event);
    }
  }

  /**
   * `blur`イベント
   *
   * @param event
   */
  public onBlurHandle($event: Event) {
    this.onBlur($event);
    if (this.parent) {
      this.parent.onBlurHandle($event);
    }
  }
}
