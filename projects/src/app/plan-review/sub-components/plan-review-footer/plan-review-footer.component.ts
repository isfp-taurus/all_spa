import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService, ErrorsHandlerService, ModalService } from '@lib/services';
import { selectNextPageModalPayloadParts } from '@app/id-modal/passenger-information-request/modal/select-next-page-modal/select-next-page-modal-payload.state';
import { PassengerInformationRequestService } from '@app/id-modal/passenger-information-request/passenger-information-request.service';
import { CurrentCartStoreService, CurrentPlanStoreService } from '@common/services';
import { PlanReviewService } from '@app/plan-review/service/plan-review.service';
import { MLangCodeConvert, PassengerType } from '@common/interfaces';
import { PageType } from '@lib/interfaces';
import { PlanReviewPresMasterData } from '@app/plan-review/presenter/plan-review-pres.component.state';
import { BehaviorSubject } from 'rxjs';

/**
 * プラン確認画面フッタ（含：遷移先分岐モーダル表示ボタン）
 */
@Component({
  selector: 'asw-plan-review-footer',
  templateUrl: './plan-review-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewFooterComponent extends SupportComponent {
  /** 遷移先分岐モーダル表示ボタン活性フラグ */
  @Input() isAbleToGoToNextPage = false;

  /** 特典予約フラグ */
  @Input() isAwardBooking?: boolean = false;

  /** 取得したマスタデータ */
  @Input() set masterData(value: PlanReviewPresMasterData | undefined) {
    this._masterData = value;
    this._isMasterDataSetSbj.next(!!this._masterData);
  }
  get masterData(): PlanReviewPresMasterData | undefined {
    return this._masterData;
  }

  private _masterData?: PlanReviewPresMasterData;

  /** マスタデータset状況判定用Subject */
  private _isMasterDataSetSbj = new BehaviorSubject<boolean>(false);

  constructor(
    private _common: CommonLibService,
    private _modalService: ModalService,
    private _service: PassengerInformationRequestService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _currentPlanStoreService: CurrentPlanStoreService,
    private _planReviewService: PlanReviewService
  ) {
    super(_common);
  }

  init(): void {}

  reload(): void {}

  destroy(): void {}

  /**
   * 遷移先分岐モーダル表示処理
   */
  openSelectNextPageModal(): void {
    // マスクなしで取得した生年月日から年齢計算がされ、正しく年齢判定が行われるよう修正
    this._service.updateCart((response) => {
      this._currentCartStoreService.setCurrentCart(response);
      if (!this.isAwardBooking) {
        // アイきっぷ運賃かつ離島カード番号が登録されていない幼児以外の搭乗者が存在する場合エラー
        const isIslandTicket = response.data?.plan?.airOffer?.bounds?.some((bound) =>
          bound.flights?.some((segment) => segment.fareInfos?.fareType === 'islandTicket')
        );
        const isNotIslandCardRegistered = response.data?.plan?.travelers?.some(
          (traveler) => !traveler.islandCard?.number && traveler.passengerTypeCode !== PassengerType.INF
        );
        if (isIslandTicket && isNotIslandCardRegistered) {
          this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'E1848' });
        } else {
          this._planReviewService._openSelectNextPageModalWithMasterData(this._masterData);
        }

        return;
      }

      // 予約可否判断API呼び出し
      this._planReviewService.setReservationAvailabilityFromApi(
        {
          cartId: (this._currentCartStoreService.CurrentCartData.data?.cartId ||
            this._currentPlanStoreService.CurrentPlanData.cartId) as string,
        },
        response,
        this._masterData
      );
    });
  }
}
