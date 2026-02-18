import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import { Child } from '../../base-ui.component';
import { BaseInputComponent } from '../base-input.component';
import { RadioGroupComponent } from './radio-group.component';

/**
 * [BaseUI] radio-button
 *
 * @extends {BaseInputComponent}
 */
@Component({
  selector: 'asw-radio-button',
  templateUrl: './radio-button.component.html',
  providers: [
    {
      provide: Child,
      useExisting: forwardRef(() => RadiobuttonComponent),
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadiobuttonComponent extends BaseInputComponent {
  /** ラジオボタンの`value` */
  @Input()
  public value?: string;

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

  /** 親Component指定 */
  public override parent!: RadioGroupComponent;

  private _disableForParent = false;
  /** ラベル非表示判定フラグ（親Component側でのコントロール） */
  public get disableForParent(): boolean {
    return this._disableForParent;
  }
  public set disableForParent(value: BooleanInput) {
    this._disableForParent = coerceBooleanProperty(value);
    this.markForCheck();
  }

  /**
   * `change`イベント
   *
   * @param event
   */
  public onChangeHandle($event: Event) {
    this.parent.data = this.value;
    this.parent.onChange($event);
  }

  /**
   * `blur`イベント
   *
   * @param event
   */
  public onBlurHandle($event: Event) {
    this.parent.onBlur($event);
  }

  public doCheck(): void {
    this.markForCheck();
  }
}
