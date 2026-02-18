import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { SupportComponent } from '../../../../components/support-class';
import { ValidationErrorInfo } from '../../../../interfaces';
import { CommonLibService } from '../../../../services';

/**
 * [BaseUI] radiobutton-box
 *
 * 設計書との内容に齟齬が出てしまうのでBaseInputComponentは継承しません
 *
 * @param id HTMLにセットするID
 * @param legend ラジオボックスのタイトル
 * @param text 表示する文字列の配列
 * @param errorMessage エラーを表示する文字列
 * @param changeEvent 選択された時のイベント　引数は選択した文字列
 *
 */
@Component({
  selector: 'asw-radiobutton-box',
  templateUrl: './radiobutton-box.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadiobuttonBoxComponent extends SupportComponent {
  constructor(_common: CommonLibService, private _changeDetector: ChangeDetectorRef) {
    super(_common);
  }

  init(): void {}
  destroy(): void {}
  reload(): void {}

  @Input()
  public id: string = 'RadiobuttonBoxComponent';
  @Input()
  public legend: string = 'RadiobuttonBoxComponent';
  @Input()
  public text: string[] = [];
  @Input()
  public errorMessage: string | ValidationErrorInfo = '';
  @Output()
  public changeEvent: EventEmitter<string> = new EventEmitter<string>();

  //　外部読み取り用　選択している文字列
  @Input()
  set selectedItem(data: string) {
    this.changeSelect(data);
  }
  get selectedItem() {
    return this._selectedItem;
  }
  public _selectedItem: string = '';
  @Output()
  public selectedItemChange: EventEmitter<string> = new EventEmitter<string>();

  // 外部読み取り用　選択している番号 0スタート
  @Input()
  set value(data: number) {
    this.setSelect(data);
  }
  get value() {
    return this._value;
  }
  public _value = -1;
  @Output()
  public valueChange: EventEmitter<number> = new EventEmitter<number>();

  /**
   * `change`イベント
   *
   * @param item string 選択された項目のラベル
   */
  public changeSelect(item: string) {
    this._selectedItem = item;
    this._value = this.text.indexOf(item);
    if (this.changeEvent) {
      this.changeEvent.emit(this._selectedItem);
    }
    this.selectedItemChange.emit(this._selectedItem);
    this.valueChange.emit(this._value);
    this._changeDetector.markForCheck();
  }
  /**
   * 外部設定用
   *
   * @param number 選択した番号の文字列を設定 0スタート
   */
  public setSelect(number: number) {
    if (number < this.text.length) {
      this.changeSelect(this.text[number]);
    }
  }

  /**
   * キーボードキーが押された時のイベント処理を行う。
   *
   * @param event KeyboardEvent イベントの情報
   * @param item string 選択された項目のラベル
   */
  public keyDown(event: KeyboardEvent, item: string) {
    if (event.code === 'Space') {
      // スペースキー押下の場合、選択状態になるためクリックと同様の動作をする。
      this.changeSelect(item);
    }
  }
}
