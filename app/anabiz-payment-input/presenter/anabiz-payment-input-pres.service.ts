import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import {
  CardinalResponse,
  PaymentInputSetupCompleteData,
  PreviousScreenHandoverInformation,
  SEARCH_METHOD_SELECTION,
} from '@app/payment-input';
import { apiEventAll, submitNavigate, transform } from '@common/helper';
import { getAnabizPaymentRecordsErrorCode } from '@common/helper/order-payment';
import { PaymentMethodsType } from '@common/interfaces/common/payment-methods';
import { SendBackTicketingRequestStoreService } from '@common/services/api-store/sdk-reservation/send-back-ticketing-request-store/send-back-ticketing-request-store.service';

import {
  CurrentCartStoreService,
  DeliveryInformationStoreService,
  GetOrderStoreService,
  OrdersPaymentRecordsStoreService,
  PaymentInputStoreService,
  PlanListService,
  GetCreditPanInformationStoreService,
} from '@common/services';
import { TicketingRequestStoreService } from '@common/services/api-store/sdk-reservation/ticketing-request/ticketing-request-store.service';
import { DeliveryInformationState, GetCreditPanInformationState, OrdersPaymentRecordsState } from '@common/store';
import { RoutesResRoutes } from '@conf/routes.config';
import { environment } from '@env/environment';
import { SupportClass } from '@lib/components/support-class';
import { AlertMessageItem, AlertType, ErrorType, LogType, PageType, SessionStorageName } from '@lib/interfaces';
import {
  AswMasterService,
  ErrorsHandlerService,
  LoadScriptService,
  LoggerDatadogService,
  ModalService,
  PageLoadingService,
} from '@lib/services';
import { CommonLibService } from '@lib/services/common-lib/common-lib.service';
import { timer } from 'rxjs';
import {
  OrdersAnaBizTicketingRequestRequest,
  OrdersPaymentRecordsRequest,
  PaymentRequestAuthorization,
  PaymentRequestAuthorizationPaymentRedirectionContext,
  PaymentRequestAuthorizationPaymentResumption,
  PaymentRequestPayerIdentification,
  PaymentRequestPayerIdentificationBrowser,
  PaymentRequestPayerIdentificationContact,
  PaymentRequestPaymentCard,
  PlansDeletePlansRequest,
} from 'src/sdk-reservation';
import { OrdersAnaBizSendBackTicketingRequestRequest } from 'src/sdk-reservation/model/ordersAnaBizSendBackTicketingRequestRequest';
import { TypeErrorsInnerSource } from 'src/sdk-servicing';
import { AnabizCreditCardInformation } from '../container/anabiz-payment-input-cont.state';
import { OrdersAnaBizTicketingRequestRequestshareholderCouponsInner } from './anabiz-payment-input-pres.state';
import {
  AnabizPaymentInputPaymentParam,
  AnabizPaymentInputTicketingRequestParam,
} from './anabiz-payment-input-pres.state';
import { ErrorCodeConstants } from '@conf/app.constants';

@Injectable({ providedIn: 'root' })
export class AnabizPaymentInputPresService extends SupportClass {
  destroy(): void {}
  constructor(
    private _common: CommonLibService,
    private _getOrderStoreService: GetOrderStoreService,
    private _deliveryInformationStoreService: DeliveryInformationStoreService,
    private _paymentInputStoreService: PaymentInputStoreService,
    private _router: Router,
    private _modalService: ModalService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _planListService: PlanListService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _ticketingRequestStoreService: TicketingRequestStoreService,
    private _aswMasterSvc: AswMasterService,
    private _ordersPaymentRecordsStoreService: OrdersPaymentRecordsStoreService,
    private _loadScriptSvc: LoadScriptService,
    private _loggerSvc: LoggerDatadogService,
    private _sendBackTicketingRequestStoreService: SendBackTicketingRequestStoreService,
    private _ngZone: NgZone,
    private _loggerService: LoggerDatadogService,
    private _pageLoadingService: PageLoadingService,
    private _getCreditPanInformationService: GetCreditPanInformationStoreService
  ) {
    super();
  }

  // クレジットカード決済対象判定
  private isCreditCardPayment: boolean = false;
  // 予約のみ識別子
  private isReserveOnly: boolean = false;
  // Cardinal決済判定
  private _is3DSPayment = false;
  // CardinalセッションID
  private _cardinalSeccionId: string = '';
  // 空席待ち予約識別子
  private isWaitlisted: boolean = false;

  // 購入発券APIリクエストパラメータ
  private _ordersPaymentRecordsReqParam: OrdersPaymentRecordsRequest = {} as OrdersPaymentRecordsRequest;

  /**
   *  発券要求処理
   */
  executeTicketingRequest(param: AnabizPaymentInputTicketingRequestParam, errorEvent: () => void) {
    this._pageLoadingService.startLoading(false);
    const ticketingRequestParam = this.createTicketingRequestParameters(param);

    apiEventAll(
      () => {
        this._ticketingRequestStoreService.setTicketingRequestFromApi(ticketingRequestParam);
      },
      this._ticketingRequestStoreService.getTicketingRequest$(),
      (response) => {
        this._pageLoadingService.endLoading();
        const ticketingRequestResult: OrdersPaymentRecordsState = {
          requestIds: response.requestIds,
          warnings: response.warnings,
          data: {
            orderStatus: 'applyingForTicketing',
          },
        };
        this.postCompletion(ticketingRequestResult);
      },
      () => {
        const apiErrorCode: string = this._common.apiError?.errors?.at(0)?.code ?? '';
        let errorMsgId = '';
        let isRetryable = false;
        switch (apiErrorCode) {
          case ErrorCodeConstants.ERROR_CODES.EBAZ000502: // ANA Biz 権限チェックエラー
            isRetryable = true;
            errorMsgId = 'E1021';
            break;
          case ErrorCodeConstants.ERROR_CODES.EBAZ000503: // ANA Biz 利用停止エラー
            isRetryable = true;
            errorMsgId = 'E0945';
            break;
          case ErrorCodeConstants.ERROR_CODES.EBAZ000212: // “EBAZ000212”(購入/発券時PNR変更発生エラー)
            isRetryable = false;
            errorMsgId = 'E0100';
            break;
          case ErrorCodeConstants.ERROR_CODES.EBAZ000213: // “EBAZ000213”(購入時スケジュールチェンジエラー)
            isRetryable = false;
            errorMsgId = 'E0566';
            break;
          case ErrorCodeConstants.ERROR_CODES.EBAZ000201: // “EBAZ000201”(発券期限切れエラー)
            isRetryable = false;
            errorMsgId = 'E0564';
            break;
          case ErrorCodeConstants.ERROR_CODES.EBAZ000844: // 予約のみのRM登録失敗
            isRetryable = false;
            errorMsgId = 'E1853';
            break;
          case ErrorCodeConstants.ERROR_CODES.EBAA100035: // 発券要求中のRM登録失敗
            isRetryable = false;
            errorMsgId = 'E1853';
            break;
        }
        if (isRetryable) {
          this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId, apiErrorCode });
        } else {
          // エラーメッセージが入っている場合
          if (errorMsgId) {
            this._errorsHandlerSvc.setNotRetryableError({
              errorType: ErrorType.BUSINESS_LOGIC, // ビジネスロジックエラー
              errorMsgId: errorMsgId, // エラーメッセージID
              apiErrorCode: apiErrorCode, // APIエラーレスポンス情報
            });
          } else {
            // システムエラーへ飛ばす
            this._errorsHandlerSvc.setNotRetryableError({
              errorType: ErrorType.SYSTEM, // システムロジックエラー
              apiErrorCode: apiErrorCode, // APIエラーレスポンス情報
            });
          }
        }

        errorEvent();
      }
    );
  }

  /**
   * 発券要求API実行のためのリクエストパラメータを作成
   * @returns 発券要求APIリクエストパラメータ
   */
  createTicketingRequestParameters(
    param: AnabizPaymentInputTicketingRequestParam
  ): OrdersAnaBizTicketingRequestRequest {
    let orderId = param.prevScreenInfo.orderId;
    let firstName = param.prevScreenInfo.credential.firstName;
    let lastName = param.prevScreenInfo.credential.lastName;

    return {
      // 前画面引継ぎ情報のオーダーID
      orderId: orderId ?? '',
      // 前画面引継ぎ情報の代表者名
      credential: {
        firstName: firstName ?? '',
        lastName: lastName ?? '',
      },
      // カートID
      cartId: this._currentCartStoreService?.CurrentCartData.data?.cartId || undefined,
      approverId: param.approverId,
      requestComment: param.ticketingComment ?? '',
    };
  }

  /**
   * 完了後処理
   * @param responsePaymentRecords 購入発券APIレスポンス
   */
  postCompletion(responsePaymentRecords: OrdersPaymentRecordsState) {
    // ログイン済みの場合、会員情報を取得する
    if (!this._common.isNotLogin()) {
      this.subscribeService(
        'GetMemberInformationApi_passengerInformationRequest',
        this._common.amcMemberStoreService.saveMemberInformationToAMCMember$(),
        (result) => {}
      );
    }

    const cartId = this._currentCartStoreService.CurrentCartData.data?.cartId;
    if (cartId && this._common.isNotLogin()) {
      const param: PlansDeletePlansRequest = {
        cartIds: [cartId],
      };
      // プラン削除API実行
      this._planListService.deletePlans(param, undefined, true);
    }
    this._ngZone.run(() => {
      this.pagetransitionToBookingComplete(responsePaymentRecords);
    });
  }

  /**
   * 予約・購入完了画面への遷移
   * @param response 購入発券APIレスポンス
   */
  pagetransitionToBookingComplete(response: OrdersPaymentRecordsState) {
    const warnings: AlertMessageItem[] = [];
    // ワーニング情報リスト作成
    let messageId = '';
    response.warnings?.forEach((warning) => {
      switch (warning.code) {
        case ErrorCodeConstants.ERROR_CODES.WBAZ000203: // DxAPIから航空券・EMD発券ワーニングが返却された場合
          messageId = 'W0530';
          break;
        case ErrorCodeConstants.ERROR_CODES.WBAZ000206:
        case ErrorCodeConstants.ERROR_CODES.WBAZ000511: // SK登録失敗ワーニングの場合
          messageId = 'W0944';
          break;
        case ErrorCodeConstants.ERROR_CODES.WBAZ000207: // プランの削除に失敗した場合)
          messageId = 'W0946';
          break;
        case ErrorCodeConstants.ERROR_CODES.WBAZ000210: // 完了メール(購入完了メールまたは予約完了メール)の送信に失敗した場合
        case ErrorCodeConstants.ERROR_CODES.WBAZ000211: // IRメールの送信に失敗した場合
          messageId = 'W0169';
          break;
        case ErrorCodeConstants.ERROR_CODES.WBAZ000428: // 予約基本情報の新規登録対象として指定されたクレジットカード番号が、既に登録済みのクレジットカード番号と重複した場合
          messageId = 'W0736';
          break;
        case ErrorCodeConstants.ERROR_CODES.WBAZ000212: // 予約基本情報の更新に失敗した場合
          messageId = 'W0533';
          break;
        case ErrorCodeConstants.ERROR_CODES.WBAZ000513: // CASへの発券要求メールリクエスト失敗した場合
          messageId = 'W1831';
          break;
        case ErrorCodeConstants.ERROR_CODES.WBAZ000523: // 有効な離島カードが登録されていない場合
          messageId = 'W1012';
          break;
        case ErrorCodeConstants.ERROR_CODES.WBAZ000524: // 有効な障がい者手帳が登録されていない場合
          messageId = 'W1013';
          break;
        case ErrorCodeConstants.ERROR_CODES.WBAZ000512:
          messageId = 'W1846'; // 発着通知メールのRM登録が失敗した場合
          break;
        default:
          messageId = '';
          break;
      }
      if (messageId) {
        warnings.push({
          contentHtml: 'm_error_message-' + messageId,
          isCloseEnable: true,
          alertType: AlertType.WARNING,
          errorMessageId: messageId,
          apiErrorCode: warning.code,
        });
      }
    });

    let paymentMethod = '';
    if (this.isReserveOnly) {
      paymentMethod = PaymentMethodsType.RESERVATION_ONLY;
    } else {
      paymentMethod = PaymentMethodsType.CREDIT_CARD;
    }
    // 4 予約・購入完了画面へ引き継ぐ情報
    let _deliveryInformationState: DeliveryInformationState = {
      paymentInformation: {
        orderStatus: response.data?.orderStatus ?? '',
        is3DSPayment: this._is3DSPayment,
        isWaitlisted:
          this._getOrderStoreService?.getOrderData?.data?.air?.isContainedWaitlistedSegment ?? this.isWaitlisted,
        paymentMethod: paymentMethod,
        beforePaymentOrder: this._getOrderStoreService?.getOrderData ?? {},
        warnings: warnings,
      },
    };

    this._deliveryInformationStoreService.setDeliveryInformation({
      ...this._deliveryInformationStoreService.deliveryInformationData,
      ..._deliveryInformationState,
    });
    // 5 支払情報入力画面取得情報破棄処理
    this._paymentInputStoreService.paymentInputInformationDiscard();
    // 操作中カートの破棄
    this._currentCartStoreService.resetCurrentCart();
    // 6 予約・購入完了画面へ遷移する
    this._router.navigateByUrl(RoutesResRoutes.BOOKING_COMPLETED);
  }

  /**
   * 購入発券API実行のためのリクエストパラメータを作成
   * @returns 購入発券APIリクエストパラメータ
   */
  createPaymentRecordsRequestParameters(param: AnabizPaymentInputPaymentParam): OrdersPaymentRecordsRequest {
    let orderId = param.prevScreenInfo.orderId;
    let firstName = param.prevScreenInfo.credential.firstName;
    let lastName = param.prevScreenInfo.credential.lastName;
    // クレジットカード決済対象の場合にクレジットカード情報を設定
    let paymentCard: PaymentRequestPaymentCard | undefined;
    // 支払者識別情報
    let payerIdentification: PaymentRequestPayerIdentification | undefined;

    this.isReserveOnly = param.isReserveOnly;
    if (param.isCreditCardPayment) {
      paymentCard = this.getPaymentCardInfo(param.creditCardInfo);
      payerIdentification = this.getPayerIdentificationInfo(param.deviceId, param.creditCardInfo);
    } else if (!param.isCreditCardPayment && param.isCardless && !param.isReserveOnly && !param.isWaitlisted) {
      paymentCard = { holderName: 'DUMMY NAME', expiryDate: '209906' };
    }
    const shareholderCoupons = param.shareholderCoupons?.map(
      (bound) =>
        <OrdersAnaBizTicketingRequestRequestshareholderCouponsInner>{
          flights: bound.flights.map((flight) => {
            return {
              flightId: flight.flightId,
              travelers: flight.travelers.map((traveler) => {
                return { travelerId: traveler.travelerId, number: traveler.number, pin: traveler.pin };
              }),
            };
          }),
        }
    );

    return {
      // 前画面引継ぎ情報のオーダーID
      orderId: orderId ?? '',
      // 前画面引継ぎ情報の代表者名
      credential: {
        firstName: firstName ?? '',
        lastName: lastName ?? '',
      },
      // カートID
      cartId: this._currentCartStoreService?.CurrentCartData.data?.cartId || undefined,
      // 支払リクエスト情報
      paymentRequest: {
        // クレジットカード情報
        paymentCard: paymentCard,
        // 支払者識別情報
        payerIdentification: payerIdentification,
        shareholderCoupons: shareholderCoupons,
      },
      isReservationOnly: param.isReserveOnly,
      isWaitlisted: param.isWaitlisted,
      //株主優待情報に紐づくID
      fareDiscountIds: this._paymentInputStoreService.paymentInputData.fareDiscountIds,
    };
  }

  /**
   * 購入発券API(2回目)実行のためのリクエストパラメータを作成
   * @returns 購入発券APIリクエストパラメータ
   */
  createPaymentRecordsRequestParameters2(): OrdersPaymentRecordsRequest {
    const authorization: PaymentRequestAuthorization = {
      paymentRedirectionContext: {
        partner3DSSessionId: this._cardinalSeccionId,
      },
    };
    this._ordersPaymentRecordsReqParam.paymentRequest.authorization = authorization;
    const browser: PaymentRequestPayerIdentificationBrowser = {
      acceptHeader: 'Accept: text/plain; q=0.5, text/html',
      userAgent: navigator.userAgent,
    };
    const contact: PaymentRequestPayerIdentificationContact = this._ordersPaymentRecordsReqParam.paymentRequest
      .payerIdentification?.contact as PaymentRequestPayerIdentificationContact;
    const deviceFingerPrint: string = this._ordersPaymentRecordsReqParam.paymentRequest.payerIdentification
      ?.deviceFingerPrint as string;
    const payerIdentification: PaymentRequestPayerIdentification = {
      deviceFingerPrint: deviceFingerPrint,
      contact: contact,
      browser: browser,
    };
    this._ordersPaymentRecordsReqParam.paymentRequest.payerIdentification = payerIdentification;
    delete this._ordersPaymentRecordsReqParam.fareDiscountIds;
    return this._ordersPaymentRecordsReqParam;
  }

  /**
   * 購入発券API(3回目)実行のためのリクエストパラメータを作成
   * @returns 購入発券APIリクエストパラメータ
   */
  createPaymentRecordsRequestParameters3(): OrdersPaymentRecordsRequest {
    const paymentRedirectionContext: PaymentRequestAuthorizationPaymentRedirectionContext = this
      ._ordersPaymentRecordsReqParam.paymentRequest.authorization
      ?.paymentRedirectionContext as PaymentRequestAuthorizationPaymentRedirectionContext;
    let paymentResumption: PaymentRequestAuthorizationPaymentResumption = {};

    // 3DSv1の場合
    if (
      this._ordersPaymentRecordsStoreService.ordersPaymentRecordsData.warnings?.[0]?.code ===
      ErrorCodeConstants.ERROR_CODES.WBAZ000200
    ) {
      paymentResumption = { payerAuthenticationResponse: this._paymentInputStoreService.paymentInputData.jwtToken };
    }

    // 3DSv2の場合
    if (
      this._ordersPaymentRecordsStoreService.ordersPaymentRecordsData.warnings?.[0]?.code ===
      ErrorCodeConstants.ERROR_CODES.WBAZ000201
    ) {
      paymentResumption = { challenge3DSResponse: this._paymentInputStoreService.paymentInputData.jwtToken };
    }

    this._ordersPaymentRecordsReqParam.paymentRequest.authorization = {
      paymentRedirectionContext: paymentRedirectionContext,
      paymentResumption: paymentResumption,
    };
    return this._ordersPaymentRecordsReqParam;
  }

  /**
   * セットアップ完了タイマー
   * @returns
   */
  private _cardinalClientTimeoutHandle() {
    const timeoutValue = Number(this._aswMasterSvc.getMPropertyByKey('cardinal', 'timeout.millisecond.client'));
    return timer(timeoutValue).subscribe(() => {
      this._ngZone.run(() => {
        (window as any).Cardinal.off('payments.setupComplete');
        this._cardinalNotRetryableHandle();
      });
    });
  }

  /**
   * 継続不可能エラー設定
   */
  private _cardinalNotRetryableHandle() {
    this._errorsHandlerSvc.setNotRetryableError({
      errorType: ErrorType.BUSINESS_LOGIC, // ビジネスロジックエラー
      errorMsgId: 'E0398', // Cardinalエラー
    });
  }

  /**
   * クレジットカード情報取得
   * @returns クレジットカード情報
   */
  getPaymentCardInfo(creditCardInfo: AnabizCreditCardInformation | undefined): PaymentRequestPaymentCard | undefined {
    // 選択中のクレジットカード
    let registeredCard;
    let cardNumber;
    if (creditCardInfo?.selectedCreditCard === PaymentRequestPaymentCard.RegisteredCardTypeEnum.CorporatePaymentCard1) {
      // 登録済みカード１
      registeredCard = PaymentRequestPaymentCard.RegisteredCardTypeEnum.PaymentCard1;
      cardNumber = undefined;
    } else if (
      creditCardInfo?.selectedCreditCard === PaymentRequestPaymentCard.RegisteredCardTypeEnum.CorporatePaymentCard2
    ) {
      // 登録済みカード２
      registeredCard = PaymentRequestPaymentCard.RegisteredCardTypeEnum.PaymentCard2;
      cardNumber = undefined;
    } else {
      // 新しいカード
      registeredCard = undefined;
      cardNumber = creditCardInfo?.cardNumber;
    }
    return {
      registeredCardType: registeredCard,
      cardNumber: cardNumber,
      holderName: creditCardInfo?.holderName ?? '',
      expiryDate: creditCardInfo?.expiryDate ?? '',
      cvv: creditCardInfo?.isUatpCard ? undefined : creditCardInfo?.securityCode,
      isUatpCard: creditCardInfo?.isUatpCard,
      saveAsBasicReservationInformation: creditCardInfo?.isCardUpdate,
    };
  }

  /**
   * 購入発券API用クレジットカード名義人情報取得
   * @returns クレジットカード名義人情報
   */
  getPayerIdentificationInfo(
    deviceId: string,
    creditCardInfo: AnabizCreditCardInformation | undefined
  ): PaymentRequestPayerIdentification | undefined {
    return {
      deviceFingerPrint: deviceId,
      contact: {
        email: {
          address: creditCardInfo?.mailAddress ?? '',
        },
        phone: {
          countryPhoneExtension: creditCardInfo?.countryNumber ?? '',
          number: creditCardInfo?.phoneNumber ?? '',
        },
      },
    };
  }

  /**
   * クレジットカードPAN情報取得API呼び出し
   * @param successEvent
   * @param errorEvent
   */
  invokeGetCreditPanInformationApi(
    successEvent: (response: GetCreditPanInformationState) => void,
    errorEvent: (error: GetCreditPanInformationState) => void
  ) {
    apiEventAll(
      () => {
        this._getCreditPanInformationService.callApi();
      },
      this._getCreditPanInformationService.getCreditPanInformation$(),
      (response) => {
        successEvent(response);
      },
      (error) => {
        errorEvent(error);
      }
    );
  }

  /**
   * 購入発券処理
   */
  executePaymentRecords(param: AnabizPaymentInputPaymentParam, errorEvent: () => void) {
    this._pageLoadingService.startLoading(false);
    // 購入発券API実行のためのパラメータを作成
    this._ordersPaymentRecordsReqParam = this.createPaymentRecordsRequestParameters(param);

    //購入発券API実行(1回目)の実行
    apiEventAll(
      () => {
        this._ordersPaymentRecordsStoreService.setOrdersPaymentRecordsFromApi(this._ordersPaymentRecordsReqParam);
      },
      this._ordersPaymentRecordsStoreService.getOrdersPaymentRecords$(),
      (response) => {
        // 1.1.28 - 9.以下、購入発券が正常に行われたときの処理
        const warning = response.warnings;
        if (
          warning !== undefined &&
          warning.length > 0 &&
          warning[0].code === ErrorCodeConstants.ERROR_CODES.WBAZ000199
        ) {
          // 1.1.28 3DS認証前処理
          this.preCardinalAuthentication1(response, errorEvent);
        } else {
          this._pageLoadingService.endLoading();
          // 1.1.31 完了後処理を行う
          this.postCompletion(response);
        }
      },
      () => {
        // 異常系処理の際に支払情報入力画面 store 内のfareDiscountIdsをクリア
        this._paymentInputStoreService.setPaymentInput({
          ...this._paymentInputStoreService.paymentInputData,
          fareDiscountIds: undefined,
        });
        this.paymentRecordsError();
        errorEvent();
      }
    );
  }

  /**
   * Cardinalを利用した3DS認証前処理1
   * @param response 購入発券APIレスポンス
   */
  preCardinalAuthentication1(response: OrdersPaymentRecordsState, errorEvent: () => void) {
    // 株主優待情報と紐づくfareDiscountIdsの値を支払情報入力画面 store 内で保持
    this._paymentInputStoreService.setPaymentInput({
      ...this._paymentInputStoreService.paymentInputData,
      fareDiscountIds: response.data?.fareDiscountIds,
    });
    // cardinal関連のsongbird.jsのローディング
    this._loadScriptSvc
      .load$(this._aswMasterSvc.getMPropertyByKey('cardinal', 'script.url'), true)
      .subscribe((path: any) => {
        if (path) {
          // Cardinal.configure
          this._ngZone.run(() => {
            (window as any).Cardinal.configure({
              // Cardinal接続タイムアウトの時間
              timeout: this._aswMasterSvc.getMPropertyByKey('cardinal', 'timeout.millisecond.cardinal') ?? '',
              // Cardinalコンソールログ出力(off：コンソールへのロギングは有効にならない／on：トランザクション中に発生したことに関する情報の提供を受ける)
              logging: {
                level: this._aswMasterSvc.getMPropertyByKey('cardinal', 'logging.level'),
              },
              payment: {
                view: 'modal',
                framework: 'cardinal',
                displayLoading: true, // ロード画面表示
                displayExitButton: false, // 閉じるボタンを出さない
              },
            });
            const timeSubscribe = this._cardinalClientTimeoutHandle();
            // Cardinal.setup
            (window as any).Cardinal.setup('init', {
              jwt: decodeURIComponent(
                window.atob(
                  response.data?.paymentRequest?.authorization?.paymentRedirectionContext?.encrypted3DSToken ?? ''
                )
              ),
            });
            // セットアップが完了したときに実行する処理を定義する
            (window as any).Cardinal.on(
              'payments.setupComplete',
              (setupCompleteData: PaymentInputSetupCompleteData) => {
                // 4.1 セットアップ完了タイマを破棄する
                timeSubscribe.unsubscribe();
                this._ngZone.run(() => {
                  this.cardinalResponseEvent(setupCompleteData, errorEvent);
                });
              }
            );
          });
        } else {
          this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'E1134' });
          errorEvent();
        }
      });
  }

  /**
   * カーディナル受信後の処理
   * @param setupCompleteData 受信データ
   * @returns
   */
  cardinalResponseEvent(setupCompleteData: PaymentInputSetupCompleteData, errorEvent: () => void) {
    // 4.3 Cardinalの返却値をログに出力する
    this._loggerSvc.info(LogType.PAGE_VIEW, { response: setupCompleteData }, false);
    const modulesValid = (): boolean => {
      const vaild = setupCompleteData.modules.find((data: any) => {
        return data.module === 'CCA' && data.loaded;
      });
      return !!vaild;
    };
    // Cardinalレスポンス.sessionIdが存在しない、または“”(空欄)
    if (!setupCompleteData.sessionId || !modulesValid()) {
      this._loggerSvc.error(LogType.PAGE_VIEW, { errMsg: 'Cardinal Communication Error!' }, false);
      // 継続不可能エラー(処理終了)
      this._cardinalNotRetryableHandle();
      return;
    }
    // 4.5 CardinalセッションIDを保存する
    this._cardinalSeccionId = setupCompleteData.sessionId;
    // 5.Cardinal決済判定をTRUEにする
    this._is3DSPayment = true;
    // 6.購入発券API実行のためのパラメータを作成
    const params: OrdersPaymentRecordsRequest = this.createPaymentRecordsRequestParameters2();
    // 6.購入発券API実行(2回目)の実行
    apiEventAll(
      () => {
        this._ordersPaymentRecordsStoreService.setOrdersPaymentRecordsFromApi(params);
      },
      this._ordersPaymentRecordsStoreService.getOrdersPaymentRecords$(),
      (response) => {
        this._pageLoadingService.endLoading();
        const warning = response.warnings;
        if (warning && warning.length > 0) {
          if (
            warning[0].code === ErrorCodeConstants.ERROR_CODES.WBAZ000200 ||
            warning[0].code === ErrorCodeConstants.ERROR_CODES.WBAZ000201
          ) {
            // 1.1.28.2 3DS認証前処理2
            this.preCardinalAuthentication2(response, errorEvent);
          } else {
            // 1.1.31 完了後処理を行う
            this.postCompletion(response);
          }
        } else {
          // 1.1.31 完了後処理を行う
          this.postCompletion(response);
        }
      },
      () => {
        this.paymentRecordsError();
        errorEvent();
      }
    );
  }

  /**
   * Cardinalを利用した3DS認証前処理2
   * @param response 購入発券APIレスポンス
   */
  preCardinalAuthentication2(response: OrdersPaymentRecordsState, errorEvent: () => void) {
    // ペイロード取得
    let payload = '';

    if (response.warnings?.[0]?.code === ErrorCodeConstants.ERROR_CODES.WBAZ000200) {
      // 3DSv1認証が必要である場合
      payload = response.data?.link?.payload?.find((o) => o.name === 'paReq')?.value ?? '';
    } else if (response.warnings?.[0]?.code === ErrorCodeConstants.ERROR_CODES.WBAZ000201) {
      // 3DSv2認証が必要である場合
      payload = response.data?.link?.payload?.find((o) => o.name === 'cReq')?.value ?? '';
    }

    // tansactionId取得
    const tansactionId = response.data?.link?.payload?.find((o) => o.name === 'transactionId')?.value ?? '';

    this._ngZone.run(() => {
      (window as any)?.Cardinal?.continue(
        'cca',
        {
          AcsUrl: response.data?.link?.href ?? '',
          Payload: payload,
        },
        {
          OrderDetails: {
            TransactionId: tansactionId ?? '',
          },
        }
      );

      // 3Dセキュア認証結果による処理を定義する
      (window as any)?.Cardinal?.on(
        'payments.validated',
        /**
         * 1.1.28.3 3DS認証後処理 (コールバック関数)
         * @param decodedResponseData Cardinalから返却された値
         * @param jwt Cardinal APIサービスからの応答JWT
         */
        (decodedResponseData: CardinalResponse, responseJWT: string) => {
          this._ngZone.run(() => {
            (window as any)?.Cardinal?.off('payments.validated');
            // 1.Cardinalの返却値をログに出力する
            this._loggerService.info(LogType.PAGE_VIEW, decodedResponseData, true);
            // 2.3DS認証結果情報保存
            this._paymentInputStoreService.setPaymentInput({
              ...this._paymentInputStoreService.paymentInputData,
              errorNumber: decodedResponseData.ErrorNumber,
              errorDescription: decodedResponseData.ErrorDescription,
              jwtToken: responseJWT,
              challengeCancel: decodedResponseData.Payment?.ExtendedData.ChallengeCancel,
            });
            this.cardinalAuthorizationPostProcessing(errorEvent);
          });
        }
      );
    });
  }

  /**
   * 3DS認証の認証コード入力後の処理
   */
  cardinalAuthorizationPostProcessing(errorEvent: () => void) {
    // 3DS認証キャンセル判定
    if (this._paymentInputStoreService.paymentInputData.challengeCancel === '01') {
      // ユーザ認証キャンセルの場合
      errorEvent();
      return;
    }
    const errorNumber = Number(this._aswMasterSvc.getMPropertyByKey('cardinal', 'errorNumberList.success'));
    const errorDescriptioPatern = new RegExp(
      this._aswMasterSvc.getMPropertyByKey('cardinal', 'errorDescriptionRegex.success')
    );
    // エラーチェック
    if (
      errorNumber !== this._paymentInputStoreService.paymentInputData.errorNumber ||
      !errorDescriptioPatern.test(this._paymentInputStoreService.paymentInputData.errorDescription ?? '') ||
      !this._paymentInputStoreService.paymentInputData.jwtToken
    ) {
      this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'E0542' });
      errorEvent();
      return;
    }
    // 6.購入発券API実行のためのパラメータを作成
    const params: OrdersPaymentRecordsRequest = this.createPaymentRecordsRequestParameters3();

    this._pageLoadingService.startLoading(false);

    // 6.購入発券API実行(3回目)の実行
    apiEventAll(
      () => {
        this._ordersPaymentRecordsStoreService.setOrdersPaymentRecordsFromApi(params);
      },
      this._ordersPaymentRecordsStoreService.getOrdersPaymentRecords$(),
      (response) => {
        this._pageLoadingService.endLoading();
        // 1.1.31 完了後処理を行う
        this.postCompletion(response);
      },
      () => {
        this.paymentRecordsError();
        errorEvent();
      }
    );
  }

  /**
   * 購入発券API(1回目)実行時のエラー処理
   */
  paymentRecordsError() {
    // ASWDB(マスタ)から決済エラー取得
    this.subscribeService(
      'anabizPaymentInputPres_getPaymentError',
      this._aswMasterSvc.load(
        [
          {
            key: 'PaymentError_ByPk_PR',
            fileName: 'PaymentError_ByPk_PR',
          },
        ],
        true
      ),
      (data) => {
        const apiErr = this._common.apiError?.errors?.[0].code ?? '';
        const source: TypeErrorsInnerSource | undefined = this._common.apiError?.errors?.[0].source;
        const subErrList: any = source?.items ?? '';

        if (data[0] && subErrList) {
          let errInfoList: any[] = [];
          //dataの中からAPIのエラーと同じエラー情報をerrInfoListに追加する
          subErrList.forEach((subErr: any) => {
            errInfoList.push(data[0]?.[apiErr]?.[subErr]?.[0]);
          });
          errInfoList.sort((a: any, b: any) => a.priority - b.priority);
          const errInfo = errInfoList[0];

          if (errInfo) {
            const messageId = errInfo.message_id;
            this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: messageId, apiErrorCode: apiErr });
            return;
          }
        }
        const result = getAnabizPaymentRecordsErrorCode(apiErr);
        if (result.isRetryable) {
          // 継続可能エラー
          this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: result.errMsg, apiErrorCode: apiErr });
        } else {
          // 継続不可能エラー (businessLogic）

          // エラーメッセージが入っている場合
          if (result.errMsg) {
            this._errorsHandlerSvc.setNotRetryableError({
              errorType: ErrorType.BUSINESS_LOGIC, // ビジネスロジックエラー
              errorMsgId: result.errMsg, // エラーメッセージID
              apiErrorCode: apiErr, // APIエラーレスポンス情報
            });
          } else {
            // システムエラーへ飛ばす
            this._errorsHandlerSvc.setNotRetryableError({
              errorType: ErrorType.SYSTEM, // システムロジックエラー
              apiErrorCode: apiErr, // APIエラーレスポンス情報
            });
          }
        }
      }
    );
  }

  /**
   *  差戻処理
   * @param param 差戻リクエスト情報
   */
  sendBackTicketingRequest(param: OrdersAnaBizSendBackTicketingRequestRequest) {
    this._pageLoadingService.startLoading();
    apiEventAll(
      () => {
        this._sendBackTicketingRequestStoreService.setSendBackTicketingRequestFromApi(param);
      },
      this._sendBackTicketingRequestStoreService.getSendBackTicketingRequest$(),
      (response) => {
        this._pageLoadingService.endLoading();
        let hasWarning = '';
        response.warnings?.forEach((element) => {
          if (element.code === ErrorCodeConstants.ERROR_CODES.WBAZ000505) {
            hasWarning = ErrorCodeConstants.ERROR_CODES.WBAZ000505;
          }
        });
        // BookingSearchModelに従いパラメータ作成
        const queryParams = {
          searchType: SEARCH_METHOD_SELECTION, // 検索方法選択
          orderId: param.orderId, // 予約番号
          lastName: param.credential.lastName, // 搭乗者名(姓)
          firstName: param.credential.firstName, // 搭乗者名(名)
          warningId: hasWarning === ErrorCodeConstants.ERROR_CODES.WBAZ000505 ? 'W1016' : '', // (ワーニングID)
          displayMyBookingTab: 'itinerary',
          CONNECTION_KIND: 'ZZZ', // 接続種別
        };

        // 予約検索画面(S01-P010)へ遷移する　(※予約詳細画面(S01-P030)を表示する)
        const lang = this._common.aswContextStoreService.aswContextData.lang;
        const identificationId = this._common.loadSessionStorage(SessionStorageName.IDENTIFICATION_ID);
        const url = transform(
          environment.spa.baseUrl + environment.spa.app.srv + '/booking-search',
          lang,
          identificationId
        );
        submitNavigate(url, queryParams);
      },
      () => {
        this._pageLoadingService.endLoading();
        // APIレスポンスが不合格の場合継続不可能エラー
        const errorCode = this._common.apiError?.errors?.[0].code;
        let errMsgId = '';
        switch (errorCode) {
          case ErrorCodeConstants.ERROR_CODES.EBAZ000528: // ANA Biz利用停止である場合
            errMsgId = 'W0822'; // 発券期限切れの旨
            break;
          case ErrorCodeConstants.ERROR_CODES.EBAZ000504: // 発券要求の発券状況区分エラーである場合
            errMsgId = 'E0947'; // 発券要求の発券状況区分エラーである旨
            break;
          case ErrorCodeConstants.ERROR_CODES.EBAZ000502: // ANA Biz 権限チェックエラー
            errMsgId = 'E1022'; // ANA Biz権限チェックエラーである旨
            break;
          case ErrorCodeConstants.ERROR_CODES.EBAZ000202: // 購入対象のPNRが購入不可PNRであった場合
            errMsgId = 'E0754'; // 購入不可PNRである旨
            break;
          default:
            break;
        }
        this._errorsHandlerSvc.setNotRetryableError({
          errorType: ErrorType.BUSINESS_LOGIC, // ビジネスロジックエラー
          errorMsgId: errMsgId, // エラーメッセージID
          apiErrorCode: errorCode, // APIエラーレスポンス情報
        });
      }
    );
  }
}
