import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import { Parent } from '../../base-ui.component';
import { BaseInputComponent } from '../base-input.component';
import { RadiobuttonComponent } from './radio-button.component';

/**
 * [BaseUI] radio-button group
 *
 * @extends {BaseInputComponent}
 */
@Component({
  selector: 'asw-radio-group',
  templateUrl: './radio-group.component.html',
  providers: [
    {
      provide: Parent,
      useExisting: forwardRef(() => RadioGroupComponent),
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupComponent extends BaseInputComponent {
  /**
   * htmlの`<legend>`要素（親要素である`<fieldset>`の内容のキャプション）
   * - 翻訳済みの文言を指定
   */
  @Input()
  public legend?: string;
  /**
   * 並び方向
   *
   * - horizontal: 横並びリスト（デフォルト）
   * - vertical: 縦並びリスト
   * - sp-vertical: 横並びリスト（SPのみ縦並び）
   */
  @Input()
  public direction: 'horizontal' | 'vertical' | 'sp-vertical' = 'horizontal';
  /**
   * 現在の選択値
   */
  @Input()
  public set selected(value: string) {
    this.data = value;
    this.markForCheck();
  }

  @Input()
  public override get disabled(): boolean {
    return this._disabled;
  }
  public override set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
    // group全体のdisabledを、group内全てのradiobuttonのdisabledに設定する
    this.radioGroup.forEach((radio) => {
      radio.disableForParent = this.disabled;
    });
    this.markForCheck();
  }

  public override get data(): any {
    return this._data;
  }
  public override set data(value: any) {
    this._data = value;
    this.radioGroup.forEach((radio) => {
      radio.doCheck();
    });
  }

  /**
   * group内の全てのradio-button
   */
  public get radioGroup(): RadiobuttonComponent[] {
    return <Array<RadiobuttonComponent>>this.children;
  }

  /**
   * `class`の設定
   */
  public get radioGroupClass(): string {
    let radioGroupClass = 'c-radio-list';
    if (this.direction !== 'horizontal') {
      radioGroupClass = `${radioGroupClass} ${radioGroupClass}--${this.direction}`;
    }
    return radioGroupClass;
  }
}
