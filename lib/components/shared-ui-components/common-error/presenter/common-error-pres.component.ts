import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MasterJsonKeyPrefix } from '@conf';
import { NotRetryableErrorModel } from '../../../../interfaces';

/**
 * [SharedUI] 共通エラー画面 (presenter)
 */
@Component({
  selector: 'asw-common-error-pres',
  templateUrl: './common-error-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommonErrorPresComponent {
  /** エラー情報 (containerより) */
  @Input()
  public errorInfo?: NotRetryableErrorModel | null;

  /** 表示用エラー文言ID体系 (containerより) */
  @Input()
  public displayErrorKey?: string | null;

  /** 固定のエラー文言キー (containerより) */
  @Input()
  public fixedErrorMsgKey?: string;

  /** ボタンラベルの文言キー (containerより)  */
  @Input()
  public buttonLabelMsgKey: string = '';

  /** popup画面の場合の閉じるボタン表示制御 (containerより) */
  @Input()
  public showCloseBtn = false;

  @Output()
  public confirm$: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  public close$: EventEmitter<void> = new EventEmitter<void>();

  /** エラー文言キーのprefix */
  public errorMsgKeyPrefix = MasterJsonKeyPrefix.ERROR;

  public buttonClick(showCloseBtn: boolean) {
    if (showCloseBtn) {
      this.close$.emit();
    } else {
      this.confirm$.emit();
    }
  }
}
