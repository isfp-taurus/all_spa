import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonLibService } from '@lib/services';
import { SupportComponent } from '@lib/components/support-class';
/**
 * サブコンポーネントのベースクラス
 * データの受け渡し機能を持ったサブコンポーネント
 *
 * @param T 受け渡しするデータ構造体情報　@input @Output　で受け渡すことができる
 * @param U 渡すデータ構造体情報　@input　で渡すことができる
 *
 * TにはInput、ラジオボックスなど親も受け取りたい入力するデータ
 * Uには表示フラグなど親から渡すだけのデータ
 *
 **/
@Component({
  template: '',
})
export abstract class SubComponentModelComponent<T, U> extends SupportComponent {
  constructor(private __change: ChangeDetectorRef, protected ___common: CommonLibService) {
    super(___common);
  }

  @Input()
  public id = this.constructor.name;

  @Input()
  set data(value: T) {
    this._data = value;
    this.__change.markForCheck();
    if (this.setDataEvent) {
      this.setDataEvent();
    }
  }
  get data(): T {
    return this._data;
  }
  protected abstract _data: T;
  @Output()
  dataChange = new EventEmitter<T>();

  @Input()
  set parts(value: U) {
    this._parts = value;
    this.__change.markForCheck();
    if (this.setPartsEvent) {
      this.setPartsEvent();
    }
  }
  get parts(): U {
    return this._parts;
  }
  protected abstract _parts: U;

  /**
   * 外部から入出力データをセットされた際に発生するイベント
   */
  abstract setDataEvent(): void;
  /**
   * 外部から入力データをセットされた際に発生するイベント
   */
  abstract setPartsEvent(): void;
}
