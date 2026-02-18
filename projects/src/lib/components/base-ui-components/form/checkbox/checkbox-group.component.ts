import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { AfterContentInit, ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import { Parent } from '../../base-ui.component';
import { BaseInputComponent } from '../base-input.component';
import { CheckboxComponent } from './checkbox.component';

/**
 * [BaseUI] checkbox-group
 *
 * @extends {BaseInputComponent}
 * @implements {AfterContentInit}
 */
@Component({
  selector: 'asw-checkbox-group',
  templateUrl: './checkbox-group.component.html',
  providers: [
    {
      provide: Parent,
      useExisting: forwardRef(() => CheckboxGroupComponent),
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxGroupComponent extends BaseInputComponent implements AfterContentInit {
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
   * group内のデータ設定
   */
  @Input()
  public set groupData(value: boolean[]) {
    this.data = value;
    this.markForCheck();
  }
  /**
   * htmlの`disabled`属性 / controlのdisable制御
   */
  @Input()
  public override get disabled(): boolean {
    return this._disabled;
  }
  public override set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
    // group全体のdisabledを、group内全てのcheckboxのdisabledに設定する
    this.checkboxGroup.forEach((checkbox) => {
      checkbox.disableForParent = this.disabled;
    });
    this.markForCheck();
  }

  public override writeValue(obj: boolean[]) {
    this.data = obj;
    this._triggerChildEvent();
  }

  /**
   * 外部コンテンツが初期化された後に処理
   */
  public ngAfterContentInit() {
    this._triggerChildEvent();
  }

  /**
   * group内の全てのcheckbox
   */
  public get checkboxGroup(): CheckboxComponent[] {
    return <Array<CheckboxComponent>>this.children;
  }

  /**
   * `class`の設定
   */
  public get checkboxGroupClass(): string {
    let checkboxGroupClass = 'c-checkbox-list';
    if (this.direction !== 'horizontal') {
      checkboxGroupClass = `${checkboxGroupClass} ${checkboxGroupClass}--${this.direction}`;
    }
    return checkboxGroupClass;
  }

  /**
   * `change`イベント
   *
   * @param event
   */
  public onChangeHandle(event?: Event) {
    const data: boolean[] = [];
    this.checkboxGroup.forEach((checkbox) => {
      data.push(checkbox.checked || false);
    });
    this.data = data;
    this.onChange(event);
  }

  /**
   * `blur`イベント
   *
   * @param event
   */
  public onBlurHandle(event?: Event) {
    this.onBlur(event);
  }

  private _triggerChildEvent() {
    if (
      this.checkboxGroup &&
      this.checkboxGroup.length > 0 &&
      this.data &&
      this.checkboxGroup.length === this.data.length
    ) {
      this.checkboxGroup.forEach((checkbox, index) => {
        checkbox.checked = this.data[index];
        checkbox.disableForParent = this.disabled;
      });
    }
  }
}
