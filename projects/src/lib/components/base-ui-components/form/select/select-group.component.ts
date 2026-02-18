import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import { Parent } from '../../base-ui.component';
import { BaseInputComponent } from '../base-input.component';
import { SelectComponent } from './select.component';

/**
 * [BaseUI] select group
 *
 * @extends {BaseInputComponent}
 * @implements {AfterContentInit}
 */
@Component({
  selector: 'asw-select-group',
  templateUrl: './select-group.component.html',
  providers: [{ provide: Parent, useExisting: forwardRef(() => SelectGroupComponent) }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectGroupComponent extends BaseInputComponent {
  /**
   * htmlの`<legend>`要素（親要素である`<fieldset>`の内容のキャプション）
   * - 翻訳済みの文言を指定
   */
  @Input()
  public legend?: string;

  /** groupの`id` */
  @Input()
  public groupId = `select-g_${this.id}`;

  /** groupのデータ */
  @Input()
  public groupData: string[] = [];

  /**
   * group内の全てのselect
   */
  public get selects(): SelectComponent[] {
    return <Array<SelectComponent>>this.children;
  }

  public override writeValue(value: string): void {
    this.data = value;
    this.convertAndSetGroupData();
  }

  /**
   * `change`イベント
   *
   * @param event
   */
  public onChangeHandle(event?: Event) {
    let date = '';
    this.selects.forEach((select) => {
      select.isGroupInvalid = this.showError;
      date = date + select.selected;
    });
    this.data = date;
    this.onChange(event);
  }

  /**
   * `blur`イベント
   *
   * @param event
   */
  public onBlurHandle(event?: Event) {
    this.selects.forEach((select) => {
      select.isGroupInvalid = this.showError;
    });
    this.onBlur(event);
    this.triggerGroupValidState();
  }

  /**
   * groupエラーの状態表示をトリガーする
   */
  public triggerGroupValidState() {
    const hasError = this.showError;
    this.selects.forEach((select) => {
      select.isGroupInvalid = hasError;
    });
  }

  /**
   * データ変換
   */
  public convertData(value: any): any {
    return value;
  }

  /**
   * groupDataのデータ変換と値設定
   */
  public convertAndSetGroupData() {
    this.groupData = this.convertData(this.data);
    if (this.selects && this.selects.length > 0 && this.groupData && this.groupData.length > 0) {
      this.selects.forEach((select, index) => {
        select.selected = this.groupData[index];
      });
    }
  }
}
