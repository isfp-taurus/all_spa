/**
 * サブヘッダー
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonLibService, PageLoadingService } from '@lib/services';
import { SupportComponent } from '@lib/components/support-class';
import { Router } from '@angular/router';
import { RoutesResRoutes } from '@conf/routes.config';
import { SearchFlightAgainModalService } from '@common/components';
import { RoundtripFlightAvailabilityInternationalState } from '@common/store/roundtripFlightAvailabilityInternational';
import { RoundtripFlightAvailabilityInternationalService } from '@common/services/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.service';
import { isPC, isSP, isTB } from '@lib/helpers';

/**
 * 往復空席照会結果(国際)画面(R01-P030) サブヘッダー
 */
@Component({
  selector: 'asw-roundtrip-flight-availability-international-sub-header',
  templateUrl: './roundtrip-flight-availability-international-sub-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundtripFlightAvailabilityInternationalSubHeaderComponent extends SupportComponent {
  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _SearchFlightAgainModalService: SearchFlightAgainModalService,
    private _roundtripFlightAvailabilityInternationalService: RoundtripFlightAvailabilityInternationalService,
    private _pageLoadingService: PageLoadingService
  ) {
    super(_common);
  }

  /** ログインステータスが変更されたときに実行される */
  reload(): void {}

  /** 初期処理。constructorの後に実行される */
  init(): void {}

  /** 画面と閉じたり、別画面に遷移したときに実行される */
  destroy(): void {}

  /** ブレッドクラムのステップ数保持のための変数 */
  public stepNum = 5;
  public currentStepNum = 1;

  /** デバイス判定のための変数 */
  public isPC = isPC(); // PCかどうか
  public isTB = isTB(); // タブレットかどうか
  public isSP = isSP(); // スマホかどうか

  /**
   * 戻るボタン押下時処理
   */
  public clickBack(event: Event) {
    this._pageLoadingService.startLoading();
    event.preventDefault();
    this._router.navigate([RoutesResRoutes.FLIGHT_SEARCH]);
  }

  /**
   * 1.1.3	再検索モーダル表示ボタン押下時処理(サブヘッダー)
   */
  public openReSearchModal() {
    // ※表示状態をstoreで管理し、表示にする旨を通知する
    const setData: RoundtripFlightAvailabilityInternationalState = {};
    setData.isShowSearchagain = true;
    // 検索条件に、リクエスト用検索条件
    this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(setData);

    // 再検索モーダルの表示
    this._SearchFlightAgainModalService.openModal();
  }
}
