/**
 * 手荷物申込画面 (R01-M052)　フッター
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonLibService, DialogDisplayService, PageLoadingService } from '@lib/services';
import { BaggageApplicationModalService } from './baggage-application-modal.service';
import { SupportModalIdSubComponent } from '@lib/components/support-class/support-modal-id-sub-component';
import {
  ServiceApplicationModalBoundInformationItem,
  ServiceApplicationModalSegmentInformationSegment,
  SERVICE_APPLICATION_STATUS_CANCEL,
  SERVICE_APPLICATION_STATUS_REQUEST,
  SERVICE_APPLICATION_SUBMIT_MESSAGE_ID,
} from '../service-application-modal.state';
import { CancelPrebookService, DeliveryInformationStoreService } from '@common/services';
import { DialogClickType, ErrorType } from '@lib/interfaces';
import { take } from 'rxjs';
import { CartsUpdateServicesRequest, CartsUpdateServicesRequestServicesInner } from 'src/sdk-reservation';
import { BaggageApplicationModalPayload } from '../service-application-modal-payload.state';
import { CartsUpdateServicesStoreService } from '@common/services/api-store/sdk-reservation/carts-update-services-store/carts-update-services-store.service';
import { CurrentCartStoreService } from '@common/services/store/common/current-cart-store/current-cart-store.service';
import { apiEventAll } from '@common/helper';
import { ErrorCodeConstants } from '@conf/app.constants';
@Component({
  selector: 'asw-baggage-application-modal-footer',
  templateUrl: './baggage-application-modal-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaggageApplicationModalFooterComponent extends SupportModalIdSubComponent {
  reload() {}
  init() {
    this.service.updateInfoSource$.subscribe((data) => {
      this.isSubmitEnable = data.bounds.some((bound) => bound.isBoundUpdate);
      this.change.markForCheck();
    });
  }
  destroy() {}
  constructor(
    private _common: CommonLibService,
    public service: BaggageApplicationModalService,
    private _dialogService: DialogDisplayService,
    private _cancelPrebookService: CancelPrebookService,
    private _cartUpdate: CartsUpdateServicesStoreService,
    private _currentcartStoreService: CurrentCartStoreService,
    private _deliveryInformationStoreService: DeliveryInformationStoreService,
    public change: ChangeDetectorRef,
    private _pageLoadingService: PageLoadingService
  ) {
    super(_common);
  }
  public override payload: BaggageApplicationModalPayload | null = {};
  public isSubmitEnable = false;
  public errorCode = '';

  /**
   * 申込ボタン押下処理
   */
  clickSubmit() {
    const ret = this._dialogService.openDialog({ message: SERVICE_APPLICATION_SUBMIT_MESSAGE_ID });
    this.subscribeService('confirmDialogClick', ret.buttonClick$.pipe(take(1)), async (result) => {
      if (result.clickType === DialogClickType.CONFIRM) {
        const isSuccess = await this._cancelPrebookService.cancelPrebook();
        if (isSuccess) {
          this.serviceUpdate();
        }
      }
    });
  }

  /**
   * サービス更新API送信処理
   */
  serviceUpdate() {
    const cart = this._currentcartStoreService.CurrentCartData;
    const req: CartsUpdateServicesRequest = {
      cartId: cart.data?.cartId ?? '',
      services: this.service.updateInfo.bounds
        .filter((bound) => bound.isBoundUpdate)
        .map((bound) => this.getRequestSegments(bound)),
    };
    this.serviceUpdateResponce(req);
  }

  /**
   * サービス更新APIへ送るセグメント情報の作成
   * @param bound 対象バウンド情報
   * @returns セグメント情報
   */
  getRequestSegments(bound: ServiceApplicationModalBoundInformationItem): CartsUpdateServicesRequestServicesInner {
    return {
      airBoundId: bound.boundId,
      segments: bound.segment
        .filter((seg) => seg.updateSegmentFlag)
        .map((seg) => {
          return {
            segmentId: seg.segmentId,
            travelers: seg.passengerInformation
              .filter((passenger) => passenger.updateType !== '')
              .map((passenger) => {
                return {
                  travelerId: passenger.id,
                  specialServiceRequests: [
                    {
                      code:
                        passenger.updateType === SERVICE_APPLICATION_STATUS_REQUEST
                          ? passenger.ssr.code
                          : passenger.ssr.prevCode,
                      operation:
                        passenger.updateType === SERVICE_APPLICATION_STATUS_REQUEST
                          ? SERVICE_APPLICATION_STATUS_REQUEST
                          : SERVICE_APPLICATION_STATUS_CANCEL,
                    },
                  ],
                };
              }),
          };
        }),
    };
  }

  /**
   * サービス更新API受信処理
   * @param request サービス更新APIのリクエストボディ
   */
  serviceUpdateResponce(request: CartsUpdateServicesRequest) {
    this._pageLoadingService.startLoading();
    this.errorCode = '';
    apiEventAll(
      () => {
        this._cartUpdate.setCartsUpdateServicesFromApi(request);
      },
      this._cartUpdate.cartsUpdateServices$(),
      (res) => {
        this._pageLoadingService.endLoading();
        this._deliveryInformationStoreService.updateDeliveryInformation({ serviceApplication: { errorInfo: [] } });
        this.closeModalEvent(true);
      },
      (error) => {
        this._pageLoadingService.endLoading();
        this.serviceUpdateResponceFailed((isUpdate?) => this.closeModalEvent(isUpdate));
      }
    );
  }

  /**
   * モーダルを閉じる処理
   * @param isUpdate モーダル閉じ後の画面更新を行う場合、trueを指定
   */
  closeModalEvent(isUpdate?: boolean) {
    this.service.setUpdateInfo({
      bounds: [],
    });
    this.close(isUpdate);
  }

  /**
   * サービス更新API 失敗時の処理
   * @param closeModalEvent モーダル閉じ処理（引数：閉じ後の画面更新を行う場合、true）
   */
  serviceUpdateResponceFailed(closeModalEvent: (isUpdate?: boolean) => void) {
    const err = this._common.apiError;
    if (err?.errors?.[0]?.code === ErrorCodeConstants.ERROR_CODES.EBAZ000278) {
      this._common.errorsHandlerService.setNotRetryableError({
        errorType: ErrorType.BUSINESS_LOGIC,
        apiErrorCode: err.errors[0].code,
        errorMsgId: 'E0333',
      });
      closeModalEvent();
    } else {
      let code = '';
      const apiCode = err?.errors?.[0]?.code ?? '';
      switch (apiCode) {
        case ErrorCodeConstants.ERROR_CODES.EBAZ000371:
          code = 'E0376';
          break;
        default:
          code = 'E0381';
          break;
      }
      this.errorCode = code;
      this._common.errorsHandlerService.setRetryableError('page', { errorMsgId: code, apiErrorCode: apiCode });
      this._deliveryInformationStoreService.updateDeliveryInformation({
        serviceApplication: { errorInfo: [{ errorMsgId: code, apiErrorCode: apiCode }] },
      });
      closeModalEvent(true);
    }
  }
}
