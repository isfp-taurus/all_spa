/**
 * サブヘッダー
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonLibService, PageLoadingService } from '@lib/services';
import { SupportComponent } from '@lib/components/support-class';
import { Router } from '@angular/router';
import { RoutesResRoutes } from '@conf/routes.config';
import { SearchFlightAgainModalService } from '@common/components/shopping/search-flight-again/search-flight-again-modal.service';
import { ComplexFlightAvailabilityStoreService } from '@app/complex-flight-availability/service/store.service';
import { isPC, isTB, isSP } from '@lib/helpers';

/**
 * サブヘッダー
 */
@Component({
  selector: 'asw-complex-flight-availability-sub-header',
  templateUrl: './complex-flight-availability-sub-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplexFlightAvailabilityHeaderComponent extends SupportComponent {
  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _SearchFlightAgainModalService: SearchFlightAgainModalService,
    private _storeService: ComplexFlightAvailabilityStoreService,
    private _pageLoadingService: PageLoadingService
  ) {
    super(_common);
  }
  reload(): void {}
  init(): void {}
  destroy(): void {}

  /** ブレッドクラムのステップ数保持のための変数 */
  public stepNum = 5;
  public currentStepNum = 1;

  /** デバイス判定のための変数 */
  public isPC = isPC(); // PCかどうか
  public isTB = isTB(); // タブレットかどうか
  public isSP = isSP(); // スマホかどうか

  /**
   * 戻るボタン押下
   */
  public async onClickBack(event: Event) {
    this._pageLoadingService.startLoading();
    const P033State = await this._storeService.fetchComplexFlightAvailabilityState();
    event.preventDefault();
    // 複雑カレンダー経由かどうか=trueの場合、複雑カレンダー画面(R01-P032)へ遷移する。
    if (P033State.isFromComplexCalendar) {
      this._router.navigate([RoutesResRoutes.COMPLEX_FLIGHT_CALENDAR]);
    } else {
      // 上記以外の場合、フライト検索画面(R01-P010)へ遷移する。
      this._router.navigate([RoutesResRoutes.FLIGHT_SEARCH]);
    }
  }

  /**
   * 再検索モーダル表示ボタン押下
   */
  public openReSearchModal() {
    this._SearchFlightAgainModalService.openModal();
  }
}
