import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonLibService } from '@lib/services';
import { SupportComponent } from '@lib/components/support-class';
import { StaticMsgPipe } from '@lib/pipes';
import {
  MealApplicationSelectModalDisplayDataBase,
  MealApplicationSelectModalDisplayDataSpecialMeal,
} from '../meal-application-select-modal.state';

/**
 * 機内食申込画面 (R01-M053)　機内食メニュー選択モーダル　特別機内食
 */
@Component({
  selector: 'asw-meal-application-select-special',
  templateUrl: './meal-application-select-special.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../meal-application-select-modal.scss'],
})
export class MealApplicationSelectSpecialComponent extends SupportComponent {
  constructor(private _common: CommonLibService, private _staticMsg: StaticMsgPipe, public change: ChangeDetectorRef) {
    super(_common);
  }
  reload(): void {}
  init(): void {}
  destroy(): void {}

  @Input()
  public useBorder = false;

  /**
   * 特別機内食リスト
   */
  @Input()
  set data(value: Array<MealApplicationSelectModalDisplayDataSpecialMeal>) {
    this._data = value;
    this.change.markForCheck();
  }
  get data(): Array<MealApplicationSelectModalDisplayDataSpecialMeal> {
    return this._data;
  }
  public _data: Array<MealApplicationSelectModalDisplayDataSpecialMeal> = [];
  @Output()
  dataChange = new EventEmitter<Array<MealApplicationSelectModalDisplayDataSpecialMeal>>();
  /**
   * 選択時の処理
   */
  @Output()
  public applyItem = new EventEmitter<MealApplicationSelectModalDisplayDataBase>();

  /**
   * リフレッシュ処理
   */
  public refresh() {
    this.change.markForCheck();
  }
  /**
   * 更新処理
   */
  public update() {
    this.dataChange.emit(this._data);
  }

  /**
   * ボタン押下イベント
   */
  clickItem(item: MealApplicationSelectModalDisplayDataBase) {
    this.applyItem.emit(item);
  }
}
