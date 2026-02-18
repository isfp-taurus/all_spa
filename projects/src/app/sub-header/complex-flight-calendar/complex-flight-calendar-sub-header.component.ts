import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonLibService, PageLoadingService } from '@lib/services';
import { SupportComponent } from '@lib/components/support-class';
import { Router } from '@angular/router';
import { SearchFlightAgainModalService } from '@common/components/shopping/search-flight-again/search-flight-again-modal.service';
import { ComplexFlightCalendarStoreService } from '@common/services';
import { isPC, isSP, isTB } from 'src/lib/helpers';
import { RoutesResRoutes } from '@conf/routes.config';
/**
 * 複雑カレンダー画面(R01-P032) サブヘッダー
 */
@Component({
  selector: 'asw-complex-flight-calendar-sub-header',
  templateUrl: './complex-flight-calendar-sub-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplexFlightCalendarSubHeaderComponent extends SupportComponent {
  /** 遷移元画面 */
  private previousId?: string;

  /** 画面タイトル */
  public displayTitle: string = '';

  /** ブレッドクラム表示判定 */
  public isBreadcrumbDisplay: boolean = true;

  /** デバイス判定のための変数 */
  public isPC = false; // PCかどうか
  public isTB = false; // タブレットかどうか
  public isSP = false; // スマホかどうか

  /** ブレッドクラムのステップ数保持のための変数 */
  public stepNum: number = 5;
  public currentStepNum: number = 1;

  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _SearchFlightAgainModalService: SearchFlightAgainModalService,
    private _complexFlightCalendarStoreService: ComplexFlightCalendarStoreService,
    private _pageLoadingService: PageLoadingService
  ) {
    super(_common);
  }
  /** ログインステータスが変更されたときに実行される */
  reload(): void {}
  /** 初期処理。constructorの後に実行される */
  init(): void {
    this.subscribeService(
      'ComplexFlightCalendar',
      this._complexFlightCalendarStoreService.getComplexFlightCalendar$(),
      (data) => {
        this.previousId = data.previousId;
      }
    );
    // 該当する端末にtrueを設定する
    this.isPC = isPC();
    this.isTB = isTB();
    this.isSP = isSP();
  }

  /** 画面を閉じたり、別画面に遷移したときに実行される */
  destroy(): void {}

  /**
   * 戻るボタン押下時処理
   */
  public clickBack() {
    this._pageLoadingService.startLoading();
    // R01P010(フライト検索)を設定し、画面遷移を行う。
    this._router.navigate([RoutesResRoutes.FLIGHT_SEARCH]);
  }

  // Modify押下時処理
  clickModify() {
    // 再検索モーダルの表示(往復空席照会結果(国際)画面(R01-P030)と同様)
    this._SearchFlightAgainModalService.openModal();
  }
}
