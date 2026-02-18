import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CurrentCartStoreService, OrdersRepriceOrderStoreService, PaymentInputStoreService } from '@common/services';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { AswServiceModel, DialogClickType, ErrorType, PageType } from '@lib/interfaces';
import { AswServiceStoreService, CommonLibService, DialogDisplayService, PageLoadingService } from '@lib/services';
import { AswValidators } from '@lib/helpers';
import { apiEventAll } from '@common/helper';
import { take } from 'rxjs';
import { UseCouponsService } from './use-coupons.service';
import { UseCouponsPayload } from './use-coupons-payload.state';

/**
 * AAMプロモーションコード入力モーダル
 *
 */
@Component({
  selector: 'asw-use-coupons',
  templateUrl: './use-coupons.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UseCouponsComponent extends SupportModalBlockComponent {
  // AMC会員番号
  public amcNumber: string = '';

  // プロモーションコードフォームグループ定義
  public couponFormGroup: FormGroup;

  public override payload: UseCouponsPayload | null = {
    orderId: '',
    credential: {
      firstName: '',
      lastName: '',
    },
  };

  constructor(
    private _common: CommonLibService,
    private _useCouponsService: UseCouponsService,
    private _aswServiceService: AswServiceStoreService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _ordersRepriceOrderStoreService: OrdersRepriceOrderStoreService,
    private _dialogService: DialogDisplayService,
    private _paymentInputStoreService: PaymentInputStoreService,
    private _pageLoadingService: PageLoadingService
  ) {
    super(_common);
    // プロモーションコードフォームグループ
    this.couponFormGroup = new FormGroup({
      // プロモーションコード
      couponCode: new FormControl('', [
        AswValidators.required({ params: { key: 0, value: 'label.promotionCode1' } }),
        AswValidators.alphaNumeric({ params: { key: 0, value: 'label.promotionCode1' } }),
      ]),
    });
  }

  init() {
    this.amcNumber = this._common.amcMemberStoreService.amcMemberData.iFlyMemberInfo?.membershipNumber ?? '';
  }

  destroy() {}

  reload() {}

  /**
   * AAMプロモーションコード入力の適用ボタン
   */
  clickApplyPromotionCode() {
    this.couponFormGroup.markAllAsTouched();
    if (this.couponFormGroup.valid) {
      // 確認ダイアログ
      this._dialogService
        .openDialog({ message: 'm_dynamic_message-MSG1492' })
        .buttonClick$.pipe(take(1))
        .subscribe((result) => {
          if (result.clickType === DialogClickType.CONFIRM) {
            // 確認が押された
            if (!this.couponFormGroup.controls['couponCode']?.errors) {
              // サービス共通情報取得(オーダID、お客様姓名)
              this.subscribeService(
                'useCoupons_serviceCommon',
                this._aswServiceService.getAswService$(),
                (response) => {
                  this.deleteSubscription('useCoupons_serviceCommon');
                  this.excuteRecieptOrderApi(response);
                }
              );
            }
          }
        });
    }
  }

  /**
   * 購入時運賃再計算API実行
   * @param response 前画面引継ぎ情報
   */
  excuteRecieptOrderApi(response: AswServiceModel) {
    this._pageLoadingService.startLoading();
    const paymentInputInfo = { ...this._paymentInputStoreService.paymentInputData };
    paymentInputInfo.promotionCodeErrorId = '';
    const cartId = this._currentCartStoreService.CurrentCartData.data?.cartId ?? '';
    const promotionCode = this.couponFormGroup.controls['couponCode']?.value;
    // 購入時運賃再計算API実行のためのパラメータを作成
    const ordersRepriceOrderRequestParam = this._useCouponsService.getRepriceOrderRequestParam(
      response,
      this.payload,
      cartId,
      promotionCode
    );
    // 購入時運賃再計算API実行
    apiEventAll(
      () => {
        this._ordersRepriceOrderStoreService.setOrdersRepriceOrderFromApi(ordersRepriceOrderRequestParam);
      },
      this._ordersRepriceOrderStoreService.getOrdersRepriceOrder$(),
      () => {
        this._pageLoadingService.endLoading();
        paymentInputInfo.isChangePromotionCode = true;
        this._paymentInputStoreService.updatePaymentInput(paymentInputInfo);
        this.close();
      },
      () => {
        this._pageLoadingService.endLoading();
        // APIレスポンスが不合格の場合継続不可能エラー
        const errorCode = this._common.apiError?.['errors']?.[0]?.code;
        let messageId = this._useCouponsService.convertErrorCodeToErrorMessageId(errorCode ?? '');
        if (messageId === 'E0232') {
          paymentInputInfo.promotionCodeErrorId = messageId;
          this._paymentInputStoreService.updatePaymentInput(paymentInputInfo);
          this._common.errorsHandlerService.setRetryableError(PageType.PAGE, {
            errorMsgId: messageId,
            apiErrorCode: errorCode,
          });
          this.close();
          return;
        }
        this._common.errorsHandlerService.setNotRetryableError({
          errorType: ErrorType.BUSINESS_LOGIC, // ビジネスロジックエラー
          errorMsgId: messageId, // エラーメッセージID
          apiErrorCode: errorCode, // APIエラーレスポンス情報
        });
        this.close();
      }
    );
  }

  /**
   * AAMプロモーションコード入力のキャンセルボタン
   */
  clickCancelPromotionCode() {
    this.close();
  }

  /**
   * モーダルを閉じるボタン押下処理
   */
  clickClose() {
    this.close(false);
  }
}
