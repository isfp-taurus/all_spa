import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { SearchFlightAgainModalService } from '@common/components';
import { RoutesResRoutes } from '@conf/routes.config';
import { RoundtripFlightAvailabilityInternationalService } from '@common/services/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.service';
import { RoundtripFlightAvailabilityInternationalState } from '@common/store/roundtripFlightAvailabilityInternational';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

@Component({
  selector: 'asw-roundtrip-flight-availability-domestic-sub-header',
  templateUrl: './roundtrip-flight-availability-domestic-sub-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundtripFlightAvailabilityDomesticSubHeaderComponent extends SupportComponent {
  constructor(
    private _common: CommonLibService,
    private _location: Location,
    private _router: Router,
    private _SearchFlightAgainModalService: SearchFlightAgainModalService,
    private _roundtripFlightAvailabilityInternationalService: RoundtripFlightAvailabilityInternationalService
  ) {
    super(_common);
  }

  /** ログインステータスが変更されたときに実行される */
  reload(): void {}

  /** 初期処理。constructorの後に実行される */
  init(): void {}

  /** 画面と閉じたり、別画面に遷移したときに実行される */
  destroy(): void {}

  /**
   * 戻るボタン押下時処理
   * @param event エレメントのイベント情報
   */
  public clickBack(event: Event) {
    if (event) {
      event.preventDefault();
      this._router.navigate([RoutesResRoutes.FLIGHT_SEARCH]);
    }
  }

  /**
   * 再検索モーダル表示ボタン押下時処理(サブヘッダー)
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
