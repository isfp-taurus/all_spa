import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { SupportModalIdSubComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

/**
 * R01P043 規約 フッター
 */
@Component({
  selector: 'asw-agreement-footer',
  templateUrl: './agreement-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgreementFooterComponent extends SupportModalIdSubComponent {
  constructor(private _common: CommonLibService, public change: ChangeDetectorRef) {
    super(_common);
  }

  reload(): void {}
  destroy(): void {}
  init() {}

  /**
   * 続けるボタンの活性フラグ
   */
  set isDisableContinue(value: boolean) {
    this._isDisableContinue = value;
    this.change.markForCheck();
  }
  get isDisableContinue() {
    return this._isDisableContinue;
  }
  private _isDisableContinue: boolean = true;

  public continueEventExe: () => void = () => {};
  public cancelEventExe: () => void = () => {};

  /**
   * 続けるボタン押下
   */
  continueEvent() {
    this.continueEventExe();
  }
  /**
   * 戻るボタン押下
   */
  cancelEvent() {
    this.cancelEventExe();
  }
}
