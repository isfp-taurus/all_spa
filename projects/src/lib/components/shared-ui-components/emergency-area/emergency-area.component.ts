/**
 * 緊急案内エリア
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { SupportComponent } from '../../../components/support-class';
import { DynamicContentType } from '../../../interfaces';
import { CommonLibService } from '../../../services';
import { MasterJsonKeyPrefix } from '@conf';

/**
 * 緊急案内エリア
 *
 * @param isModal モーダルの場合trueに設定することでサブ画面ID,部品IDを使用して情報を取得する
 *
 */
@Component({
  selector: 'asw-emergency-area',
  templateUrl: './emergency-area.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmergencyAreaComponent extends SupportComponent {
  constructor(protected common: CommonLibService, private _changeDetector: ChangeDetectorRef) {
    super(common);
  }

  public emergencyMessages: Array<string> = [];
  public appealGuideMessages: Array<string> = [];

  public emergencyMessagesDispFirst: string | null = null;
  public appealGuideMessagesDispFirst: string | null = null;

  public emergencyOpen: boolean = false;
  public appealGuideOpen: boolean = false;

  public emergencyIsMulti: boolean = false;
  public appealGuideIsMulti: boolean = false;

  /** 動的文言キーのprefix */
  public dynamicMsgKeyPrefix = MasterJsonKeyPrefix.DYNAMIC;

  init() {
    this.dynamicContent();
  }
  destroy() {}
  reload() {}

  @Input()
  public isModal = false;

  clickEmergency() {
    this.emergencyOpen = !this.emergencyOpen;
  }

  clickAppealGuide() {
    this.appealGuideOpen = !this.appealGuideOpen;
  }

  /**
   * 動的文言取得処理
   */
  private dynamicContent() {
    this.subscribeService(
      'EmergencyAreaComponent_getDynamicContent',
      this.common.dynamicContentService.getDynamicContent$(this.isModal),
      (content) => {
        let _emergencyMessages: Array<string> = [];
        let _appealGuideMessages: Array<string> = [];
        if (content) {
          _emergencyMessages = content[DynamicContentType.EMERGENCY] ? [...content[DynamicContentType.EMERGENCY]] : [];
          _appealGuideMessages = content[DynamicContentType.APPEAL_GUIDE]
            ? [...content[DynamicContentType.APPEAL_GUIDE]]
            : [];
        }

        if (1 < _emergencyMessages.length) {
          this.emergencyMessagesDispFirst = _emergencyMessages.shift() ?? '';
        } else {
          this.emergencyMessagesDispFirst = _emergencyMessages[0] || null;
          _emergencyMessages = [];
        }

        if (1 < _appealGuideMessages.length) {
          this.appealGuideMessagesDispFirst = _appealGuideMessages.shift() ?? '';
        } else {
          this.appealGuideMessagesDispFirst = _appealGuideMessages[0] || null;
          _appealGuideMessages = [];
        }

        this.emergencyOpen = false;
        this.appealGuideOpen = false;

        this.emergencyMessages = _emergencyMessages;
        this.appealGuideMessages = _appealGuideMessages;

        this.emergencyIsMulti = this.emergencyMessages.length !== 0;
        this.appealGuideIsMulti = this.appealGuideMessages.length !== 0;

        this._changeDetector.markForCheck();
      }
    );
  }
}
