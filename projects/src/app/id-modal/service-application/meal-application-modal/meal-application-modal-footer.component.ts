/**
 * 機内食申込画面 (R01-M053) フッター
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonLibService, DialogDisplayService, PageLoadingService } from '@lib/services';
import { MealApplicationModalService } from './meal-application-modal.service';
import { SupportModalIdSubComponent } from '@lib/components/support-class/support-modal-id-sub-component';
import { MealApplicationModalPayload } from '../service-application-modal-payload.state';
import { CancelPrebookService, DeliveryInformationStoreService } from '@common/services';
import {
  ServiceApplicationModalSegmentInformation,
  ServiceApplicationModalSegmentInformationPassengerInformation,
  SERVICE_APPLICATION_STATUS_CANCEL,
  SERVICE_APPLICATION_STATUS_REQUEST,
  SERVICE_APPLICATION_SUBMIT_MESSAGE_ID,
  SERVICE_APPLICATION_SUBMIT_SECOND_MESSAGE_ID,
  SERVICE_APPLICATION_CHILD_MEAL_CODE,
} from '../service-application-modal.state';
import { Subscription, take } from 'rxjs';
import { DialogClickType, ErrorType } from '@lib/interfaces';
import { CartsUpdateServicesRequest, CartsUpdateServicesRequestServicesInnerSegmentsInner } from 'src/sdk-reservation';
import { CartsUpdateServicesStoreService } from '@common/services/api-store/sdk-reservation/carts-update-services-store/carts-update-services-store.service';
import { CurrentCartStoreService } from '@common/services/store/common/current-cart-store/current-cart-store.service';
import { apiEventAll } from '@common/helper';
import { PassengerType } from '@common/interfaces';
import { ErrorCodeConstants } from '@conf/app.constants';

@Component({
  selector: 'asw-meal-application-modal-footer',
  templateUrl: './meal-application-modal-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealApplicationModalFooterComponent extends SupportModalIdSubComponent {
  /**
   * ngOnDestroyにunsubscribeを実行
   */
  private _subscriptions: Subscription = new Subscription();
  reload() {}
  init() {
    this.service.updateInfoSource$.subscribe((data) => {
      this.isSubmitEnable = data.segment.some((seg) => seg.updateSegmentFlag);
      this.change.markForCheck();
    });
  }
  destroy() {
    this._subscriptions.unsubscribe();
  }
  constructor(
    private _common: CommonLibService,
    public service: MealApplicationModalService,
    private _dialogService: DialogDisplayService,
    public change: ChangeDetectorRef,
    private _cancelPrebookService: CancelPrebookService,
    private _cartUpdate: CartsUpdateServicesStoreService,
    private _currentcartStoreService: CurrentCartStoreService,
    private _deliveryInformationStoreService: DeliveryInformationStoreService,
    private _pageLoadingService: PageLoadingService
  ) {
    super(_common);
  }

  public override payload: MealApplicationModalPayload | null = {};
  public isSubmitEnable = false;
  public errorCode = '';

  /**
   * 申込ボタン押下処理
   */
  clickSubmit() {
    const submitDialog = () => {
      const secondDialogResult = this._dialogService.openDialog({
        message: SERVICE_APPLICATION_SUBMIT_MESSAGE_ID,
      });
      this.subscribeService(
        'secondDialogClick',
        secondDialogResult.buttonClick$.pipe(take(1)),
        async (secondResult) => {
          if (secondResult.clickType === DialogClickType.CONFIRM) {
            const isSuccess = await this._cancelPrebookService.cancelPrebook();
            if (isSuccess) {
              this.serviceUpdate();
            }
          }
        }
      );
    };
    if (this._isADTAndCHMLHasINF) {
      this._subscriptions.add(
        this._dialogService
          .openDialog({ message: SERVICE_APPLICATION_SUBMIT_SECOND_MESSAGE_ID })
          .buttonClick$.subscribe((result) => {
            if (result.clickType === DialogClickType.CONFIRM) {
              submitDialog();
            }
          })
      );
    } else {
      submitDialog();
    }
  }

  /**
   * サービス更新API送信処理
   */
  serviceUpdate() {
    const cart = this._currentcartStoreService.CurrentCartData;
    const info = this.getRequestSegment(this.service.updateInfo);
    const req: CartsUpdateServicesRequest = {
      cartId: cart.data?.cartId ?? '',
      services: info.segment
        .filter((seg) => seg.passengerInformation.length !== 0)
        .map((seg) => {
          const id =
            cart.data?.plan?.airOffer?.bounds?.find((bound) =>
              bound.flights?.some((flight) => flight.id === seg.segmentId)
            )?.airBoundId ?? '';
          if (seg.segmentId === '') {
            return {
              airBoundId: id,
              segments: [],
            };
          } else {
            return {
              airBoundId: id,
              segments: [
                {
                  segmentId: seg.segmentId,
                  travelers: this.getRequestTravelers(seg.passengerInformation),
                } as CartsUpdateServicesRequestServicesInnerSegmentsInner,
              ],
            };
          }
        }),
    };
    this.serviceUpdateResponce(req);
  }

  /**
   * サービス更新APIへ送るセグメント情報をフィルタ
   * @param info 更新サービス情報
   * @return フィルタ済みの更新サービス情報
   */
  getRequestSegment(info: ServiceApplicationModalSegmentInformation) {
    const travelers = this._currentcartStoreService.CurrentCartData.data?.plan?.travelers ?? [];
    info.segment.forEach((seg) => {
      // 幼児同伴者のSSR情報に幼児のSSR情報を追加
      seg.passengerInformation
        .filter((pass) => pass.PassengerType === PassengerType.INF)
        .forEach((inf) => {
          const accompanyingTravelerId = travelers.find((traveler) => traveler.id === inf.id)?.accompanyingTravelerId;
          let accompanyingTraveler = seg.passengerInformation.find(
            (traveler) => traveler.id === accompanyingTravelerId
          );
          if (accompanyingTraveler) {
            accompanyingTraveler.ssr.meal.push(...inf.ssr.meal);
          }
        });
      //幼児の情報を削除
      seg.passengerInformation = seg.passengerInformation.filter((pass) => pass.PassengerType !== PassengerType.INF);
      // 更新のない搭乗者毎申込情報を削除
      seg.passengerInformation = seg.passengerInformation.reduce((acc, pass) => {
        const validMeals = pass.ssr.meal.filter((meal) => meal.updateType !== '');
        if (validMeals.length > 0) {
          acc.push({
            ...pass,
            ssr: {
              ...pass.ssr,
              meal: validMeals,
            },
          });
        }
        return acc;
      }, [] as typeof seg.passengerInformation);
    });
    info.segment = info.segment.filter((seg) => seg.passengerInformation.length !== 0);
    return info;
  }

  /**
   * サービス更新APIへ送る搭乗者情報の作成
   * @param passengerInformation
   * @returns
   */
  getRequestTravelers(passengerInformation: Array<ServiceApplicationModalSegmentInformationPassengerInformation>) {
    return passengerInformation.map((passenger) => {
      return {
        travelerId: passenger.id,
        specialServiceRequests: passenger.ssr.meal.map((meal) => {
          return {
            code: meal.updateType === SERVICE_APPLICATION_STATUS_REQUEST ? meal.code : meal.prevCode,
            operation:
              meal.updateType === SERVICE_APPLICATION_STATUS_REQUEST
                ? SERVICE_APPLICATION_STATUS_REQUEST
                : SERVICE_APPLICATION_STATUS_CANCEL,
          };
        }),
      };
    });
  }

  /**
   * サービス更新API受信処理]
   *  @param request サービス更新APIのリクエストボディ
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
          code = 'E0378';
          break;
        case ErrorCodeConstants.ERROR_CODES.EBAZ000372:
          code = 'E0380';
          break;
        case ErrorCodeConstants.ERROR_CODES.EBAZ000378:
          code = 'E0380';
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

  /**
   * 大人のお食事としてお子様向けのお食事(CHML)が選択かどうかをチェック
   */
  private get _isADTAndCHMLHasINF(): boolean {
    return !!this.service.updateInfo.segment.find((segmentInfo) => {
      const hasADTCHML = segmentInfo.passengerInformation.find(
        (info) =>
          info.PassengerType === PassengerType.ADT &&
          info.ssr.meal.find((mealInfo) => mealInfo.code === SERVICE_APPLICATION_CHILD_MEAL_CODE)
      );
      const hasINF = segmentInfo.passengerInformation.find((info) => info.PassengerType === PassengerType.INF);
      return hasADTCHML && hasINF;
    });
  }
}
