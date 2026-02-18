import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonLibService } from '@lib/services';
import { SupportComponent } from '@lib/components/support-class';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { throttleTime } from 'rxjs/operators';
import { isPC, isSP, isTB } from '@lib/helpers/common';
import { Router } from '@angular/router';
import { FindMoreFlightsStoreService } from '@common/services';
import { RoutesResRoutes } from '@conf/routes.config';

@Component({
  selector: 'asw-find-more-flights-sub-header',
  templateUrl: './find-more-flights-sub-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FindMoreFlightsSubHeaderComponent extends SupportComponent {
  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _findMoreFlightsStoreService: FindMoreFlightsStoreService
  ) {
    super(_common);
  }

  /** ブレッドクラムのステップ数保持のための変数 */
  public stepNum = 5;
  public currentStepNum = 1;

  /** 画面サイズ判定(PC) */
  public isPc = isPC();
  public isTB = isTB(); // タブレットかどうか
  public isSP = isSP(); // スマホかどうか

  /** 画面サイズ比較用変数(PC) */
  public isPcPre = this.isPc;

  /** 画面サイズチェック用関数 */
  private _resizeEvent = () => {
    this.isPcPre = this.isPc;
    this.isPc = isPC();
    if (this.isPcPre !== this.isPc) {
      this._changeDetectorRef.markForCheck();
    }
  };

  reload(): void {}
  init(): void {
    // 画面サイズチェック開始
    this.subscribeService('SubHeaderResize', fromEvent(window, 'resize').pipe(throttleTime(500)), this._resizeEvent);
    this.refresh();
  }
  destroy(): void {
    this.deleteSubscription('SubHeaderResize');
  }

  refresh(): void {}

  back(event: Event): void {
    event.preventDefault();
    const previousId = this._findMoreFlightsStoreService.FindMoreFlightsData.previousId;
    if (previousId === 'R01P033') {
      this._router.navigateByUrl(RoutesResRoutes.COMPLEX_FLIGHT_AVAILABILITY);
    } else this._router.navigateByUrl(RoutesResRoutes.PLAN_REVIEW);
  }
}
