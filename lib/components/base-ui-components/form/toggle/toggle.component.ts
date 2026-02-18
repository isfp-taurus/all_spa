import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
/**
 * [BaseUI] toggle switch
 * 設計書との内容に齟齬が出てしまうのでBaseInputComponentは継承しません
 *
 * @param id HTMLに設定するID
 * @param text トグルに表示する文言
 * @param altMessage 読み上げ用文言
 * @param isEnable トグルを無効にするフラグ
 * @param changeEvent 変更時イベント
 * @param checked チェック状態
 *
 */
@Component({
  selector: 'asw-toggle',
  templateUrl: './toggle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleComponent {
  @Input()
  public id: string = 'ToggleComponent';
  @Input()
  public text: string = '';
  @Input()
  public altMessage: string = '';
  @Input()
  public isEnable: boolean = true;
  @Output()
  public changeEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input()
  public checked = false;
  @Output()
  public checkedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  changeSwitchEvent(value: Event) {
    if (this.changeEvent) {
      this.changeEvent.emit(this.checked);
    }
    this.checkedChange.emit(this.checked);
  }
}
