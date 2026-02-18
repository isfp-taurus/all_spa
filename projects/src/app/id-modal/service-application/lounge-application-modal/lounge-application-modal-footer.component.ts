/**
 * ラウンジ申込画面 (R01-M051) フッター
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonLibService, DialogDisplayService, PageLoadingService } from '@lib/services';
import { LoungeApplicationModalService } from './lounge-application-modal.service';
import { SupportModalIdSubComponent } from '@lib/components/support-class/support-modal-id-sub-component';
import {
  ServiceApplicationModalSegmentInformationSegment,
  SERVICE_APPLICATION_STATUS_CANCEL,
  SERVICE_APPLICATION_STATUS_REQUEST,
  SERVICE_APPLICATION_SUBMIT_MESSAGE_ID,
} from '../service-application-modal.state';
import { DialogClickType, ErrorType, ReplaceParam } from '@lib/interfaces';
import { CartsUpdateServicesRequest, CartsUpdateServicesRequestServicesInner } from 'src/sdk-reservation';
import { take } from 'rxjs/operators';
import { CancelPrebookService } from '@common/services/cancel-prebook/cancel-prebook.service';
import { LoungeApplicationModalPayload } from '../service-application-modal-payload.state';
import { CartsUpdateServicesStoreService } from '@common/services/api-store/sdk-reservation/carts-update-services-store/carts-update-services-store.service';
import { CurrentCartStoreService } from '@common/services/store/common/current-cart-store/current-cart-store.service';
import { apiEventAll } from '@common/helper';
import { DeliveryInformationStoreService } from '@common/services';
import { ErrorCodeConstants } from '@conf/app.constants';

@Component({
  selector: 'asw-lounge-application-modal-footer',
  templateUrl: './lounge-application-modal-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoungeApplicationModalFooterComponent extends SupportModalIdSubComponent {
  reload() {}
  init() {
    this.service.updateInfoSource$.subscribe((data) => {
      this.isSubmitEnable = data.segment.some((seg) => seg.updateSegmentFlag);
      this.change.markForCheck();
    });
  }
  destroy() {}
  constructor(
    private _common: CommonLibService,
    public service: LoungeApplicationModalService,
    private _dialogService: DialogDisplayService,
    private _cancelPrebookService: CancelPrebookService,
    private _cartUpdate: CartsUpdateServicesStoreService,
    private _currentcartStoreService: CurrentCartStoreService,
    private _deliveryInformationStoreService: DeliveryInformationStoreService,
    public change: ChangeDetectorRef,
    private _pageloadingService: PageLoadingService
  ) {
    super(_common);
  }
  public override payload: LoungeApplicationModalPayload | null = {};
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
      services: this.service.updateInfo.segment
        .filter((seg) => seg.updateSegmentFlag)
        .map((seg) => {
          let id =
            cart.data?.plan?.airOffer?.bounds?.find((bound) =>
              bound.flights?.some((flight) => flight.id === seg.segmentId)
            )?.airBoundId ?? '';
          if (seg.segmentId === '') {
            return {
              airBoundId: id,
              segments: [],
            };
          } else {
            return this.getRequestSegments(id, seg);
          }
        }),
    };
    this.serviceUpdateResponce(req);
  }

  /**
   * サービス更新APIへ送るセグメント情報の作成
   * @param airBoundId バウンドID
   * @param seg　対象セグメント情報
   * @returns セグメント情報
   */
  getRequestSegments(
    airBoundId: string,
    seg: ServiceApplicationModalSegmentInformationSegment
  ): CartsUpdateServicesRequestServicesInner {
    return {
      airBoundId: airBoundId,
      segments: [
        {
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
        },
      ],
    };
  }

  /**
   * サービス更新API受信処理
   * @param request サービス更新APIのリクエストボディ
   */
  serviceUpdateResponce(request: CartsUpdateServicesRequest) {
    this._pageloadingService.startLoading();
    this.errorCode = '';
    apiEventAll(
      () => {
        this._cartUpdate.setCartsUpdateServicesFromApi(request);
      },
      this._cartUpdate.cartsUpdateServices$(),
      (res) => {
        this._pageloadingService.endLoading();
        this._deliveryInformationStoreService.updateDeliveryInformation({ serviceApplication: { errorInfo: [] } });
        this.closeModalEvent(true);
      },
      (error) => {
        this._pageloadingService.endLoading();
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
      segment: [],
    });
    this.close(isUpdate);
  }

  /**
   * サービス更新API 失敗時の処理
   * @param closeModalEvent モーダル閉じ処理（引数：閉じ後の画面更新を行う場合、true）
   */
  serviceUpdateResponceFailed(closeModalEvent: (isUpdate?: boolean) => void) {
    const err = this._common.apiError;
    const params: Array<ReplaceParam> = [];
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
          code = 'E0377';
          break;
        case ErrorCodeConstants.ERROR_CODES.EBAZ000372:
          code = 'E0379';
          break;
        default:
          code = 'E0381';
          break;
      }
      this.errorCode = code;
      this._common.errorsHandlerService.setRetryableError('page', {
        errorMsgId: code,
        apiErrorCode: apiCode,
        params: params,
      });
      this._deliveryInformationStoreService.updateDeliveryInformation({
        serviceApplication: { errorInfo: [{ errorMsgId: code, apiErrorCode: apiCode, params: params }] },
      });
      closeModalEvent(true);
    }
  }
}
