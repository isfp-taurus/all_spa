import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BaseUIComponent } from '../base-ui.component';

/**
 * [BaseUI] ボタン
 *
 * @extends {BaseUIComponent}
 */
@Component({
  selector: 'asw-button',
  templateUrl: './button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent extends BaseUIComponent {
  /**
   * ボタンのタイプ
   * - デフォルト：primary
   */
  @Input()
  public type: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'warn' | 'warn-secondary' = 'primary';
  /**
   * ボタンのサイズ
   * - 通常サイズの場合は指定しない
   */
  @Input()
  public size?: 's' | 's-min-w100' | 'xs';
  /**
   * ボタン内のアイコン
   * - next: 矢印アイコン付き
   * - external: 別窓アイコン付き
   */
  @Input()
  // TODO: コンパイルエラーが出るため、UIUXs2からfilterを取り込み。templateに実装されなければ後に削除する。
  public icon?: 'next' | 'external' | 'filter';
  /**
   * ボタンのラベル
   * - 翻訳済みの文言を指定
   */
  @Input()
  public label?: string;
  /**
   * ボタンの読み上げ文言
   * - 翻訳済みの文言を指定
   */
  @Input()
  public ariaLabel?: string;

  private _disabled = false;
  /** ボタンの`disabled`属性 */
  @Input()
  public get disabled(): boolean {
    return this._disabled;
  }
  public set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }

  private _throttleClick = false;
  /** 多重リクエスト防止要否（多重リクエスト防止Directive実行要否） */
  @Input()
  public get throttleClick(): boolean {
    return this._throttleClick;
  }
  public set throttleClick(value: BooleanInput) {
    this._throttleClick = coerceBooleanProperty(value);
  }

  /** 多重リクエスト防止待機期間（ミリ秒単位で指定）※デフォルト値：500ms  */
  @Input()
  public throttleTime = 500;

  /** `@Output`イベント */
  @Output()
  public click$: EventEmitter<this> = new EventEmitter<this>();

  /**
   * ボタンの`class`属性値取得
   * - `@Input`の指定によって`class`属性の値を決める
   */
  public get buttonClass(): string {
    const buttonBase = `c-btn-${this.type}`;
    let buttonClass = buttonBase;
    if (this.size === 's-min-w100') {
      buttonClass = `${buttonClass} ${buttonBase}--s ${buttonBase}--min-w100`;
    } else if (this.size) {
      buttonClass = `${buttonClass} ${buttonBase}--${this.size}`;
    }
    if (this.icon) {
      buttonClass = `${buttonClass} ${buttonBase}--${this.icon}`;
    }
    return buttonClass;
  }

  /**
   * `click`イベント
   *
   * @param event
   */
  public onClickEvent(event: Event) {
    this.click$.emit(this);
    event.preventDefault();
    event.stopPropagation();
  }
}
