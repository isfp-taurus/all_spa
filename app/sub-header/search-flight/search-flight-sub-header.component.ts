import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { isPC, isSP, isTB } from '@lib/helpers';
import { CommonLibService } from '@lib/services';
import { SupportComponent } from 'src/lib/components/support-class';
import { AswContextType, LoginStatusType } from '@lib/interfaces';
import { fromEvent } from 'rxjs';

/**
 * サブヘッダー
 * フライト検索 R01-P010で使用する
 */
@Component({
  selector: 'asw-search-flight-sub-header',
  templateUrl: './search-flight-sub-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFlightSubHeaderComponent extends SupportComponent {
  constructor(private _common: CommonLibService, private changeDetector: ChangeDetectorRef) {
    super(_common);
  }

  /** デバイス判定のための変数 */
  public isPc = isPC(); // PCかどうか
  public isTb = isTB(); // タブレットかどうか
  public isSp = isSP(); // スマホかどうか
  public isSpPre = isSP();
  public isTbPre = isTB();
  public isPcPre = isPC();
  private resizeEvent = () => {
    this.isSpPre = this.isSp;
    this.isTbPre = this.isTb;
    this.isPcPre = this.isPc;
    this.isSp = isSP();
    this.isTb = isTB();
    this.isPc = isPC();
    if (this.isSpPre !== this.isSp || this.isTbPre !== this.isTb || this.isPcPre !== this.isPc) {
      this.changeDetector.markForCheck();
    }
  };

  /** ブレッドクラムのステップ数保持のための変数 */
  public stepNum: number = 5;
  public currentStepNum: number = 1;
  public loginStatus = false;

  reload(): void {}
  init(): void {
    this.subscribeService('searchFlightSubHeaderComponentResize', fromEvent(window, 'resize'), this.resizeEvent);
    this.subscribeService(
      'watch-login-status',
      this._common.aswContextStoreService.getAswContextByKey$(AswContextType.LOGIN_STATUS),
      (loginStatus: LoginStatusType) => {
        this.loginStatus = loginStatus === 'NOT_LOGIN';
      }
    );
  }
  destroy(): void {
    this.deleteSubscription('watch-login-status');
  }
}
