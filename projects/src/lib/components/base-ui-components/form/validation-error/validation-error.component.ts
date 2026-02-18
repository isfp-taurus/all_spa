import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { BaseUIComponent } from '../../base-ui.component';
import { ValidationErrorInfo } from '../../../../interfaces';
import { MasterJsonKeyPrefix } from '@conf';

/**
 * [BaseUI] 入力エラー案内
 *
 * @extends {BaseUIComponent}
 * @implements {OnChanges}
 */
@Component({
  selector: 'asw-validation-error',
  templateUrl: './validation-error.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidationErrorComponent extends BaseUIComponent implements OnChanges {
  /**
   * 入力エラー情報（入力チェックの結果）
   * - エラー文言に埋め込みパラメータがない場合、エラー文言IDを`string`型でも直接指定可能
   * @see {@link ValidationErrorInfo}
   */
  @Input()
  public errorMessage?: string | ValidationErrorInfo;

  /** 画面表示用エラー情報 */
  public message?: ValidationErrorInfo;

  /** エラー文言キーのprefix */
  public msgKeyPrefix = MasterJsonKeyPrefix.ERROR;

  /**
   * 入力エラー案内出力処理
   */
  public ngOnChanges() {
    if (typeof this.errorMessage === 'string') {
      this.message = { errorMsgId: this.errorMessage };
    } else {
      this.message = this.errorMessage;
    }
  }
}
