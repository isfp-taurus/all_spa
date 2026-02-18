/**
 * 同意文言エリア
 *
 * */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonLibService } from '../../../services/common-lib/common-lib.service';
import { SupportComponent } from '../../../components/support-class';
import { AgreementAreaParts } from './agreement-area.state';
import { DynamicContentType } from '../../../interfaces';
import { CheckboxComponent } from '../../../components/base-ui-components/form/checkbox/checkbox.component';
import { MasterJsonKeyPrefix } from '@conf';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StaticMsgPipe } from '@lib/pipes';

/**
 * 同意文言エリア
 *
 * @param id HTMLに設定するID
 * @param agreementAreaParts 組み込み元からの設定 @see AgreementAreaParts
 * @param cancelEvent 取消時実行処理
 * @param submitEvent 確定時実行処理
 *
 * */
@Component({
  selector: 'asw-agreement-area',
  templateUrl: './agreement-area.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgreementAreaComponent extends SupportComponent {
  constructor(
    public common: CommonLibService,
    private _changeDetector: ChangeDetectorRef,
    private _staticMsgPipe: StaticMsgPipe,
    private _domSanitizer: DomSanitizer
  ) {
    super(common);
  }

  init(): void {
    this.subscribeService(
      'AgreementAreaComponent_getDynamicContent',
      this.common.dynamicContentService.getDynamicContent$(this.agreementAreaParts.isModal),
      (content) => {
        if (content) {
          this.dynamicMessage = content[DynamicContentType.AGREEMENT] ? content[DynamicContentType.AGREEMENT] : [];
        } else {
          this.dynamicMessage = [];
        }
        if (this.dynamicMessage.length === 0) {
          this.dispEnable = false;
        } else {
          this.dispEnable = true;
        }
        this._changeDetector.markForCheck();
      }
    );
  }
  destroy(): void {}
  reload(): void {}

  @Input()
  public id: string = 'AgreementAreaComponent';
  public _agreementAreaParts: AgreementAreaParts = {
    isModal: false,
  };
  get agreementAreaParts() {
    return this._agreementAreaParts;
  }
  @Input()
  set agreementAreaParts(data: AgreementAreaParts) {
    this._agreementAreaParts = data;
    this.refresh(data); // 設定された場合内部で使用するリストを作成
  }

  @Output()
  public cancelEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output()
  public submitEvent: EventEmitter<void> = new EventEmitter<void>();

  public dynamicMessage: string[] = [];
  public isCancel = false;
  public isSubmit = false;
  public isCancelStyle = '';
  public dispEnable = true;

  private _agreeStatus = false;
  @Output()
  public get agreeStatus() {
    return this._agreeStatus;
  }
  @Output()
  public agreeStatusChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  // 静的文言
  public staticMessage = {
    confirmTitle: 'heading.agreementGuidance',
    consent: 'message.agreementRules',
  };

  /** 動的文言キーのprefix */
  public dynamicMsgKeyPrefix = MasterJsonKeyPrefix.DYNAMIC;

  /**
   * 静的文言/動的文言のサニタイズ対策 \
   * Angularのセキュリティ上、innerHTMLにid属性をバインドする際にフィルターがかかり消える
   * @param {string} message 静的文言or動的文言
   * @returns {SafeHtml} HTML
   */
  public sanitizeHtml(message: string): SafeHtml {
    const htmlString = this._staticMsgPipe.transform(message);
    return this._domSanitizer.bypassSecurityTrustHtml(htmlString);
  }

  refresh(data: AgreementAreaParts) {
    if (data.cancelText) {
      this.isCancelStyle = 'justify-content:space-between';
      this.isCancel = true;
    } else {
      this.isCancel = false;
    }
    if (data.submitText) {
      this.isSubmit = true;
    } else {
      this.isSubmit = false;
    }
  }

  onClickAgreeChecked(checkbox: CheckboxComponent) {
    this._agreeStatus = checkbox.checked;
    this.agreeStatusChange.emit(checkbox.checked);
  }

  cancelEventClick() {
    this.cancelEvent.emit();
  }

  submitEventClick() {
    this.submitEvent.emit();
  }
}
