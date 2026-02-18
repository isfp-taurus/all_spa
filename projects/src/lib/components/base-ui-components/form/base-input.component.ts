import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  ChangeDetectorRef,
  Directive,
  DoCheck,
  EventEmitter,
  Input,
  Optional,
  Output,
  Self,
  SkipSelf,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { BaseUIComponent, Parent } from '../base-ui.component';

/**
 * [BaseUI] input関連のベースとなるComponent
 *
 * @abstract
 */
@Directive()
export abstract class BaseInputComponent extends BaseUIComponent implements ControlValueAccessor, DoCheck {
  /** htmlの`name`属性 */
  @Input()
  public name?: string;
  /**
   * htmlの`label`属性
   * - 翻訳済みの文言を指定
   */
  @Input()
  public label?: string;

  protected _disabled = false;
  /** htmlの`disabled`属性 / controlのdisable制御 */
  @Input()
  public get disabled(): boolean {
    return this._disabled;
  }
  public set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
    this.markForCheck();
  }

  private _required = false;
  /** htmlの`required`属性 */
  @Input()
  public get required(): boolean {
    return this._required;
  }
  public set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
    this.markForCheck();
  }

  /** `@Output`イベント（blur） */
  @Output()
  public blur$: EventEmitter<this> = new EventEmitter<this>();

  /** `@Output`イベント（change） */
  @Output()
  public change$: EventEmitter<this> = new EventEmitter<this>();

  protected _data!: any;
  /** Componentの値 */
  public get data(): any {
    return this._data;
  }
  public set data(value: any) {
    this._data = value;
    this.markForCheck();
  }

  /** changeイベント時処理 */
  public onChangeFn = (_: any) => {
    // do nothing
  };

  /** touchedイベント時処理 */
  public onTouchedFn = () => {
    // do nothing
  };

  constructor(
    @Optional() @SkipSelf() parent: Parent,
    @Self() @Optional() public control: NgControl,
    protected changeDetectorRef: ChangeDetectorRef
  ) {
    super(parent);
    this.control && (this.control.valueAccessor = this);
  }

  /**
   * controlを`data`に同期
   *
   * @see {@link ControlValueAccessor.writeValue}
   * @param {*} obj
   */
  public writeValue(obj: any) {
    this.data = <any>obj;
  }

  /**
   * changeイベント登録
   *
   * @see {@link ControlValueAccessor.registerOnChange}
   * @param {*} fn
   */
  public registerOnChange(fn: any) {
    this.onChangeFn = fn;
  }

  /**
   * touchedイベント登録
   *
   * @see {@link ControlValueAccessor.registerOnTouched}
   * @param {*} fn
   */
  public registerOnTouched(fn: any) {
    this.onTouchedFn = fn;
  }

  /**
   * controlのdisabled制御
   *
   * @see {@link ControlValueAccessor.setDisabledState}
   * @param {boolean} isDisabled
   */
  public setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  /**
   * `blur`イベント
   *
   * @param {?Event} [event]
   */
  public onBlur(event?: Event) {
    this.onTouchedFn();
    this.blurEvent(event);
  }
  public blurEvent(event?: Event) {
    event && event.stopPropagation && event.stopPropagation();
    this.blur$.emit(this);
  }

  /**
   * `change`イベント
   *
   * @param {?Event} [event]
   */
  public onChange(event?: Event) {
    this.onChangeFn(this.data);
    this.changeEvent(event);
  }
  public changeEvent(event?: Event) {
    event && event.stopPropagation && event.stopPropagation();
    this.change$.emit(this);
  }

  /**
   * エラー表示判定
   * - controlがinvalid（チェックエラー）かつフォーカスが外された場合に表示
   */
  public get showError(): boolean {
    if (!this.control || !this.control.errors) {
      return false;
    }
    const { dirty, touched } = this.control;
    const error = this.invalid ? !!(dirty || touched) : false;
    return error;
  }

  /**
   * controlのinvalid（チェックエラー）状態
   */
  public get invalid(): boolean {
    return this.control ? !!this.control.invalid : false;
  }

  /**
   * controlよりエラー情報取得
   */
  public get errors(): Array<string> {
    if (!this.control || !this.control.errors) {
      return [];
    }
    const { errors } = this.control;
    return Object.values(errors);
  }

  public ngDoCheck(): void {
    if (this.control && this.control.touched) {
      this.markForCheck();
    }
  }

  public markForCheck() {
    this.changeDetectorRef.markForCheck();
  }
}
