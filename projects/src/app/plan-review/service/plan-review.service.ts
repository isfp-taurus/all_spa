import { Injectable } from '@angular/core';
import { selectNextPageModalPayloadParts } from '@app/id-modal/passenger-information-request/modal/select-next-page-modal/select-next-page-modal-payload.state';
import { apiEventAll, defaultApiErrorEvent } from '@common/helper';
import { OrdersReservationAvailabilityStoreService } from '@common/services';
import { CurrentCartState } from '@common/store';
import { SupportClass } from '@lib/components/support-class';
import { CommonLibService, ModalService } from '@lib/services';
import { ReservationAvailabilityRequest } from 'src/sdk-member';
import { GetOrdersReservationAvailabilityApiErrorMap } from '../container/plan-review-cont.component.state';
import { PageType } from '@lib/interfaces';
import { MLangCodeConvert } from '@common/interfaces';
import { PlanReviewPresMasterData } from '../presenter/plan-review-pres.component.state';

/**
 * プラン確認画面 サービス
 */
@Injectable({
  providedIn: 'root',
})
export class PlanReviewService extends SupportClass {
  constructor(
    private _ordersReservationAvailabilityStoreService: OrdersReservationAvailabilityStoreService,
    private _modalService: ModalService,
    private _common: CommonLibService
  ) {
    super();
  }
  destroy(): void {}

  /**
   * 予約可否判断APIを呼び出す処理
   * @param currentCartId
   * @param res
   */
  public setReservationAvailabilityFromApi(
    currentCartId: ReservationAvailabilityRequest,
    res?: CurrentCartState,
    masterData?: PlanReviewPresMasterData | undefined
  ): void {
    apiEventAll(
      () => this._ordersReservationAvailabilityStoreService.callApi(currentCartId),
      this._ordersReservationAvailabilityStoreService.getOrdersReservationAvailability$(),
      (response) => {
        // API実行後、会員情報取得APIを呼び出し、Storeを更新する
        this.subscribeService(
          'GetMemberInformationApi_planReviewService',
          this._common.amcMemberStoreService.saveMemberInformationToAMCMember$(),
          (result) => {}
        );

        // プラン保存押下時に最新のカートAPIレスポンスを受け取った場合、遷移先分岐モーダル表示
        if (res) {
          this._openSelectNextPageModalWithMasterData(masterData);
        }
      },
      (error) => {
        // 異常時、エラー処理をコールバック
        // apiErrorが非同期で設定されるのを待つ
        this._common.apiErrorResponseService.getApiErrorResponse$().subscribe((apiError) => {
          if (apiError) {
            // apiErrorがnullでない場合にエラーコードを取得
            const errorCode = apiError.errors?.[0]?.code ?? '';
            // エラー処理
            defaultApiErrorEvent(
              errorCode,
              GetOrdersReservationAvailabilityApiErrorMap,
              (retryable) => {
                this._common.errorsHandlerService.setRetryableError(PageType.PAGE, retryable);
                window.scroll({
                  top: 0,
                } as ScrollToOptions);
              },
              (notRetryable) => {
                this._common.errorsHandlerService.setNotRetryableError(notRetryable);
              }
            );
          }
        });
      }
    );
  }

  /**
   *  遷移先分岐モーダル表示処理
   */
  public _openSelectNextPageModalWithMasterData(masterData: PlanReviewPresMasterData | undefined): void {
    const parts = selectNextPageModalPayloadParts(true);
    //現在の言語の言語変換マスタ
    const langCodeConvert: MLangCodeConvert | undefined = masterData?.langCodeConvert.find(
      (langcon) => langcon.lang === this._common.aswContextStoreService.aswContextData.lang
    );
    parts.payload = {
      order: langCodeConvert?.traveler_input_order_type ?? '0',
    };
    this._modalService.showSubModal(parts);
  }
}
