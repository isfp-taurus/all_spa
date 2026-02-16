import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { planReviewPlanManipulationMenuModalParts } from '@app/plan-review/sub-components/plan-review-plan-manipulation-menu/plan-review-plan-manipulation-menu-modal/plan-review-plan-manipulation-menu-modal.state';
import { isEmptyObject } from '@common/helper';
import {
  CurrentCartStoreService,
  CurrentPlanStoreService,
  PlanReviewStoreService,
  DeliveryInformationStoreService,
} from '@common/services';
import { RoutesResRoutes } from '@conf/routes.config';
import { SupportComponent } from '@lib/components/support-class';
import { isPC } from '@lib/helpers';
import { CommonLibService, ModalService } from '@lib/services';
import { fromEvent, throttleTime } from 'rxjs';

@Component({
  selector: 'asw-plan-review-sub-header',
  templateUrl: './plan-review-sub-header.component.html',
  styleUrls: ['./plan-review-sub-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewSubHeaderComponent extends SupportComponent implements DoCheck {
  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _modalService: ModalService,
    private _planReviewStoreService: PlanReviewStoreService,
    private _deliveryInfoStoreService: DeliveryInformationStoreService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _currentPlanStoreService: CurrentPlanStoreService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_common);
  }

  /** 遷移元画面情報 */
  public previousPage = '';

  /** ブレッドクラム表示判定 */
  public isBreadcrumbDisplay = true;

  /** ブレッドクラムのステップ数保持のための変数 */
  public stepNum = 5;
  public currentStepNum = 2;

  /** 画面サイズ判定(PC) */
  public isPc = isPC();

  /** 画面サイズ比較用変数(PC) */
  public isPcPre = this.isPc;

  /** プラン保存済み判定 */
  public isUnsaved = true;

  /** 画面サイズチェック用関数 */
  private _resizeEvent = () => {
    this.isPcPre = this.isPc;
    this.isPc = isPC();
    if (this.isPcPre !== this.isPc) {
      this._changeDetectorRef.markForCheck();
    }
  };

  init(): void {
    // プラン保存状態取得
    this.subscribeService('getSaveCondition', this._currentPlanStoreService.getCurrentPlan$(), (value) => {
      this.isUnsaved = value?.isUnsaved ?? true;
      this._changeDetectorRef.markForCheck();
    });
    // 画面サイズチェック開始
    this.subscribeService('SubHeaderResize', fromEvent(window, 'resize').pipe(throttleTime(500)), this._resizeEvent);
    this.refresh();
  }

  ngDoCheck(): void {
    this.refresh();
  }

  refresh(): void {
    this.previousPage = this._planReviewStoreService.PlanReviewData.previousPage ?? '';
  }

  reload(): void {}

  destroy(): void {
    this.deleteSubscription('SubHeaderResize');
  }

  /**
   * プラン操作メニュー表示ボタン押下時処理
   */
  openPlanManipulationMenuModal(): void {
    const parts = planReviewPlanManipulationMenuModalParts();
    parts.payload = {
      isUnsaved: this._currentPlanStoreService.CurrentPlanData.isUnsaved ?? true,
      isPlanValid: !isEmptyObject(this._currentCartStoreService.CurrentCartData.data?.plan ?? {}),
    };
    this._modalService.showSubModal(parts);
  }

  /**
   * 戻るボタン押下時処理
   */
  back(): void {
    switch (this.previousPage) {
      case 'R01P030':
        this._deliveryInfoStoreService.setDeliveryInformationByKey('planReviewInformation', 'isBackBtnClicked', true);
        this._router.navigateByUrl(RoutesResRoutes.ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL);
        break;
      case 'R01P031':
        this._deliveryInfoStoreService.setDeliveryInformationByKey('planReviewInformation', 'isBackBtnClicked', true);
        this._router.navigateByUrl(RoutesResRoutes.ROUNDTRIP_FLIGHT_AVAILABILITY_DOMESTIC);
        break;
      case 'R01P033':
        this._deliveryInfoStoreService.setDeliveryInformationByKey('planReviewInformation', 'isBackBtnClicked', true);
        this._router.navigateByUrl(RoutesResRoutes.COMPLEX_FLIGHT_AVAILABILITY);
        break;
      case 'R01P042':
        this._router.navigateByUrl(RoutesResRoutes.PLAN_LIST);
        break;
      default:
        break;
    }
  }
}
