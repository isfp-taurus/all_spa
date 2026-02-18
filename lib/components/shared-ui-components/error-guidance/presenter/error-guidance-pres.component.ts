import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MasterJsonKeyPrefix } from '@conf';
import { RetryableError } from '../../../../interfaces';

/**
 * [SharedUI] 注意喚起エリア（エラー） (presenter)
 */
@Component({
  selector: 'asw-error-guidance-pres',
  templateUrl: './error-guidance-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorGuidancePresComponent {
  /** エラー情報 (containerより) */
  @Input()
  public errorInfo?: RetryableError | null;

  /** 表示用エラー文言ID (containerより) */
  @Input()
  public displayErrorKey?: string | null;

  /** エラー文言キーのprefix */
  public msgKeyPrefix = MasterJsonKeyPrefix.ERROR;
}
