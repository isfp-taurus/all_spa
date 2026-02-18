/**
 * 注意喚起エリア 表示部品
 *
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { MasterJsonKeyPrefix } from '@conf';
import { AlertMessageItem, AlertType } from '../../../../interfaces';

/**
 * 注意喚起エリア 表示部品
 *
 * @param item 表示内容 @see AlertMessageItem
 *
 */
@Component({
  selector: 'asw-alert-message',
  templateUrl: './alert-message.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertMessageComponent {
  constructor(private _changeDetector: ChangeDetectorRef) {}

  public isWarning = false;
  public isError = false;

  /** ワーニング文言キーのprefix */
  public warningMsgKeyPrefix = MasterJsonKeyPrefix.ERROR;

  /** 動的文言キーのprefix */
  public dynamicMsgKeyPrefix = MasterJsonKeyPrefix.DYNAMIC;

  /** Fix済みの表示用メッセージキー */
  public dispContent = '';

  public _item!: AlertMessageItem;
  @Input()
  set item(value: AlertMessageItem) {
    this._item = value;
    this.isError = this.item.alertType === AlertType.ERROR;
    this.isWarning = this.item.alertType === AlertType.WARNING;
    // prefixがなければ付与する
    if (this.item.contentHtml.startsWith('m_')) {
      this.dispContent = this.item.contentHtml;
    } else {
      this.dispContent = this.isWarning
        ? this.warningMsgKeyPrefix + this.item.contentHtml
        : this.dynamicMsgKeyPrefix + this.item.contentHtml;
    }
    this._changeDetector.markForCheck();
  }

  get item() {
    return this._item;
  }

  @Output()
  closeEvent = new EventEmitter<string>();

  public clickClose() {
    if (this._item.contentId) {
      this.closeEvent.emit(this._item.contentId);
    }
  }
}
