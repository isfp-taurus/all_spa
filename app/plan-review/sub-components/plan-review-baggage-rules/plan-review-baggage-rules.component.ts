import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { baggageApplicationModalPayloadParts } from '@app/id-modal/service-application';
import { MybookingBaggageRulesInput } from '@common/components/servicing/mybooking/mybooking-baggage-rules/mybooking-baggage-rules.state';
import { CurrentCartStoreService, PlanReviewStoreService } from '@common/services';
import { FareConditionsState } from '@common/store';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService, ModalService } from '@lib/services';
import { CreateCartResponseData } from 'src/sdk-reservation';
import { GetOrderResponseData } from 'src/sdk-servicing';
import { PageLoadingService } from '@lib/services/page-loading/page-loading.service';

/**
 * 手荷物ルール (プラン確認画面)
 */
@Component({
  selector: 'asw-plan-review-baggage-rules',
  templateUrl: './plan-review-baggage-rules.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewBaggageRulesComponent extends SupportComponent {
  /** プラン有効判定 */
  @Input() isPlanValid = false;

  /** 運賃ルール・手荷物情報取得APIレスポンス */
  @Input()
  set fareCondsRes(value: FareConditionsState | undefined) {
    this._fareCondsRes = value;
    this.refresh();
  }
  get fareCondsRes(): FareConditionsState | undefined {
    return this._fareCondsRes;
  }
  private _fareCondsRes?: FareConditionsState;

  /** MyBookingBaggageRulesに渡すデータ */
  public mybookingBaggageRulesData?: MybookingBaggageRulesInput;

  constructor(
    private _common: CommonLibService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _modalService: ModalService,
    private _planReviewStoreService: PlanReviewStoreService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _loadingSvc: PageLoadingService
  ) {
    super(_common);
  }

  refresh(): void {
    const order = {
      requestIds: [],
      data: this.convertCartToPnr(this._currentCartStoreService.CurrentCartData.data ?? {}),
    };
    this.mybookingBaggageRulesData = this.fareCondsRes
      ? {
          fareConditions: this.fareCondsRes,
          getOrder: order,
        }
      : undefined;
    this._changeDetectorRef.detectChanges();
  }

  reload(): void {}
  init(): void {}
  destroy(): void {}

  /**
   * 手荷物申込モーダル表示ボタン押下時処理
   */
  clickLinkEvent(): void {
    //PageInitService.endInitを使用しているため、endLoadingは入れない。
    this._loadingSvc.startLoading();
    const fBagParts = baggageApplicationModalPayloadParts();
    fBagParts.closeEvent = () => this.refreshPlan();
    this._modalService.showSubPageModal(fBagParts);
  }

  /**
   * プラン確認画面更新処理を呼ぶ
   */
  refreshPlan(): void {
    this._planReviewStoreService.updatePlanReview({ isNeedRefresh: true });
  }

  /**
   * カート情報をPNR情報の構造に変換する処理
   * ※手荷物ルール表示に必要な項目のみ対応
   * @param cartData
   * @returns
   */
  convertCartToPnr(cartData: CreateCartResponseData): GetOrderResponseData {
    const cartPlan = this.isPlanValid ? cartData.plan : cartData.previousPlan;
    return {
      air: {
        tripType: cartPlan?.airOffer?.tripType,
        bounds:
          cartPlan?.airOffer?.bounds?.map((bound) => {
            return {
              airBoundId: bound?.airBoundId,
              flights:
                bound?.flights?.map((flight) => {
                  return {
                    id: flight.id,
                  };
                }) ?? [],
            };
          }) ?? [],
      },
      services: cartPlan?.services,
      travelers: cartPlan?.travelers,
      orderEligibilities: {
        firstBaggage: {
          isEligible: Object.values(cartPlan?.services?.baggage?.firstBaggage ?? {}).some((bound) => bound.isAvailable),
          isEligibleToForward: Object.values(cartPlan?.services?.baggage?.firstBaggage ?? {}).some(
            (bound) => bound.isAvailable
          ),
        },
      },
    };
  }
}
