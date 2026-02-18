import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupportComponent } from '@lib/components/support-class';
import { isSP } from '@lib/helpers';
import { CommonLibService } from '@lib/services';
import { fromEvent, throttleTime } from 'rxjs';

/**
 * plan-list-search-flight-info
 * フライト検索案内
 */
@Component({
  selector: 'asw-plan-list-search-flight-info',
  templateUrl: './plan-list-search-flight-info.component.html',
  styleUrls: ['plan-list-search-flight-info.component.scss'],
  providers: [],
})
export class PlanListSearchFlightInfoComponent extends SupportComponent {
  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_common);
  }

  /** 画面サイズ判定(SP) */
  public isSP = isSP();
  /** 画面サイズ比較用変数(SP) */
  public isSPPre = this.isSP;

  init(): void {
    // 画面サイズチェック開始
    this.subscribeService(
      'PlanReviewAccrualMilesResize',
      fromEvent(window, 'resize').pipe(throttleTime(500)),
      this._resizeEvent
    );
  }
  reload(): void {}
  destroy(): void {}

  /** 空席照会へボタン押下処理 */
  goToSearchFlight(): void {
    // フライト検索画面(R01-P010)へ遷移
    this._router.navigateByUrl('flight-search');
  }

  /** 画面サイズチェック用関数 */
  private _resizeEvent = () => {
    this.isSPPre = this.isSP;
    this.isSP = isSP();
    if (this.isSPPre !== this.isSP) {
      this._changeDetectorRef.markForCheck();
    }
  };
}
