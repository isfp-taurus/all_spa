import { Injectable } from '@angular/core';
import {
  getCurrentApplication,
  navigateAnotherApp,
  navigateAnotherMethodPost,
  showPdfInNewWindow,
} from './next-action.helpers';
import { Params, Router } from '@angular/router';
import { environment } from '@env/environment';
import { AmcLoginHeaderComponent } from '@lib/components/shared-ui-components/amc-login/amc-login-header.component';
import { AmcLoginComponent } from '@lib/components/shared-ui-components/amc-login/amc-login.component';
import { AnaBizLoginStatusType } from '@lib/interfaces/ana-biz-login-status';
import { LoginStatusType } from '@lib/interfaces/login-status';
import { SessionStorageName } from '@lib/interfaces/session-storage-name';
import { CommonLibService } from '@lib/services/common-lib/common-lib.service';
import { ModalService } from '@lib/services/modal/modal.service';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { paymentMethodPayloadParts } from '@common/components/reservation/next-action/sub-components/payment-method-modal/payment-method-modal.state';
import { ErrorType } from '@lib/interfaces/errors';
import { PageType } from '@lib/interfaces/page';
import { PageLoadingService } from '@lib/services/page-loading/page-loading.service';
import {
  GetEmdPassengerReceiptRequest,
  GetETicketItineraryReceiptRequest,
  GetOrderResponseData,
  GetOrderResponseDataNextActionsOfflinePaymentDetails,
  GetOrderResponseDataTravelDocumentsInner,
  OrderSeatItemSeatSelection,
  ServicingApiService,
  Type1,
} from 'src/sdk-servicing';

import {
  NextActionTypeEnum,
  ORDERS_GET_E_TICKET_ITINERARY_RECEIPT_POST_ERROR_MAP,
  ORDERS_GET_EMD_PASSENGER_RECEIPT_POST_ERROR_MAP,
  ROUTING_SCREEN,
} from './next-action.constants';
import { NEXT_ACTION_LOAD_MASTERS } from './master/next-action-master';
import { NextActionBankAll } from './master/bank_all';
import { NextActionMFucntionIneligibleReason } from './master/m_function_ineligble_reason';
import { StaticMsgPipe } from '@lib/pipes';
import { isStringEmpty, stringEmptyDefault } from '@common/helper';
import { MasterStoreKey } from '@conf/asw-master.config';
import { MOffice } from '@lib/interfaces';

export interface NextActionInputs {
  canBeClicked: boolean;
  pnr: GetOrderResponseData;
}

interface CallBacks {
  callbackOnHandleRegisterEmail?: (param?: any) => void;
  callbackOnHandleAdvanceSeatSelection?: (param?: any, displayTargetSegmentId?: string) => void;
  callbackOnHandleImmigrationInformationRegistration?: (param?: any) => void;
  callbackOnHandleRegisterEvidenceDisabledPersons?: (param?: any) => void;
  callbackOnHandleRegisterEvidenceIsland?: (param?: any) => void;
  callbackOnHandleJuniorPilot?: (param?: any) => void;
  callbackOnHandleMyCarValet?: (param?: any) => void;
  callbackOnHandleService?: () => void;
  callbackPassengerInformationRegistration?: (pnr?: GetOrderResponseData) => void;
  callbackBaggageRule?: (pnr?: GetOrderResponseData) => void;
  callbackLounge?: (pnr?: GetOrderResponseData) => void;
  callbackFirstBaggage?: (pnr?: GetOrderResponseData) => void;
  callbackMeal?: (pnr?: GetOrderResponseData) => void;
}

export interface ServicingParams {
  orderId: string;
  firstName: string;
  lastName: string;
  nextAction: string;
}

@Injectable({
  providedIn: 'root',
})
export class NextActionService {
  /** NOTE: used as class's method for UT purpose */
  getCurrentApplication;
  navigateToAnotherApp;
  showPdfInNewWindow;
  navigateAnotherMethodPost;
  private _servicingCommonStoreService: any;
  private _servicingSeatmapStoreService: any;
  private _servicingSeatmapBackupStoreService: any;

  pdfWindow: WindowProxy | null = null;

  constructor(
    private readonly _common: CommonLibService,
    private readonly _modalService: ModalService,
    private readonly _router: Router,
    private readonly _servicingApiService: ServicingApiService,
    private _loadingSvc: PageLoadingService,
    private _staticMsg: StaticMsgPipe
  ) {
    this.getCurrentApplication = getCurrentApplication;
    this.navigateToAnotherApp = navigateAnotherApp;
    this.showPdfInNewWindow = showPdfInNewWindow;
    this.navigateAnotherMethodPost = navigateAnotherMethodPost;
  }

  private nextActionInputs$ = new BehaviorSubject<NextActionInputs>({
    canBeClicked: true,
    pnr: {},
  });

  updateInputs(nextActionInputs: NextActionInputs) {
    this.nextActionInputs$.next(nextActionInputs);
  }

  get getInputs(): Observable<NextActionInputs> {
    return this.nextActionInputs$;
  }

  callbacks: CallBacks = {};

  registerCallbacks(callbacks: CallBacks) {
    this.callbacks = { ...callbacks };
  }

  registerServicingCommonStoreService(_servicingCommonStoreService: any) {
    this._servicingCommonStoreService = _servicingCommonStoreService;
  }

  registerServicingSeatmapStoreService(_servicingSeatmapStoreService: any) {
    this._servicingSeatmapStoreService = _servicingSeatmapStoreService;
  }

  registerServicingSeatmapBackupStoreService(_servicingSeatmapBackupStoreService: any) {
    this._servicingSeatmapBackupStoreService = _servicingSeatmapBackupStoreService;
  }

  onHandleService(servicingParams: ServicingParams) {
    const { isServicing } = this.getCurrentApplication();
    if (isServicing) {
      this.callbacks.callbackOnHandleService?.();
    } else {
      this.navigateToAnotherApp(environment.spa.app.srv, ROUTING_SCREEN['S01-P010'], servicingParams);
    }
  }

  onHandlePassengerInformationRegistration(servicingParams: ServicingParams, pnr?: GetOrderResponseData) {
    const { isServicing } = this.getCurrentApplication();
    // 5.	PNR情報取得API応答.data.orderEligibilities.travelerInput.isEligible = false(利用不可)の場合、以下の処理を行う。
    if (pnr?.orderEligibilities?.travelerInput?.isEligible === false) {
      // 5.1.	以下パラメータで「当画面共通処理No2.利用不可理由に応じたエラーメッセージ表示処理」を実施する。
      this.onHandleCommonNo2('travelerInput', pnr.orderEligibilities?.travelerInput?.nonEligibilityReasons, '-');
      if (!isServicing) {
        return;
      }
    }
    if (isServicing) {
      this.callbacks?.callbackPassengerInformationRegistration?.(pnr);
    } else {
      const params: Params = {
        ...servicingParams,
        CONNECTION_KIND: 'ZZZ',
      };
      this.navigateToAnotherApp(environment.spa.app.srv, ROUTING_SCREEN['S01-P010'], params);
    }
  }

  /** “BAGGAGE_RULE"(手荷物ルール) */
  onHandleBaggageRule(servicingParams: ServicingParams, pnr?: GetOrderResponseData) {
    const { isServicing } = this.getCurrentApplication();
    if (isServicing) {
      this.callbacks.callbackBaggageRule?.(pnr);
    } else {
      this.navigateToAnotherApp(environment.spa.app.srv, ROUTING_SCREEN['S01-P010'], servicingParams);
    }
  }

  handleNextAction(servicingParams: ServicingParams, pnr?: GetOrderResponseData) {
    const { nextAction } = servicingParams;

    switch (nextAction) {
      case NextActionTypeEnum.Service:
        /** “SERVICE" (予約詳細(サービス)) */
        this.onHandleService(servicingParams);
        break;
      case NextActionTypeEnum.EmailAddressRegistration:
        // 当画面のメールアドレス登録ボタン押下時の処理を行う。
        this.onHandleRegisterEmail(servicingParams, pnr);
        break;
      case NextActionTypeEnum.Acknowledge:
        // 当画面のイレギュラー振替(Acknowledge)ボタン押下時の処理を行う。
        this.onHandleAcknowledge(pnr);
        break;
      case NextActionTypeEnum.SelfReaccomodation:
        // 当画面のイレギュラー振替(Self Reaccommodation)ボタン押下時の処理を行う。
        this.onHandleSelfReacCommodation(pnr);
        break;
      case NextActionTypeEnum.Ticketing:
        // 当画面の発券ボタン押下時の処理を行う。
        this.onHandleTicketing(pnr);
        break;
      case NextActionTypeEnum.Payment:
        // 当画面の払込ボタン押下時の処理を行う。
        this.onHandlePayment(pnr);
        break;
      case NextActionTypeEnum.OnlineCheckIn:
        // 当画面のオンラインチェックインボタン押下時の処理を行う。
        this.onHandleOnlineCheckin(pnr);
        break;
      case NextActionTypeEnum.PassengerInput:
        // 当画面の搭乗者情報登録ボタン押下時の処理を行う。
        this.onHandlePassengerInformationRegistration(servicingParams, pnr);
        break;
      case NextActionTypeEnum.EticketAndEmd:
        // 当画面のeチケット/EMD表示ボタン押下時の処理を行う。
        this.onHandleETicketAndEMD(servicingParams, pnr);
        break;
      case NextActionTypeEnum.Anabiz:
        // 当画面のANA Bizご利用明細書表示ボタン押下時の処理を行う。
        this.onHandleAnaBiz(servicingParams, pnr);
        break;
      case NextActionTypeEnum.Upgrade:
        // 当画面のアップグレードボタン押下時の処理を行う。
        this.onHandleUpgrade(pnr);
        break;
      case NextActionTypeEnum.BaggageRule:
        this.onHandleBaggageRule(servicingParams, pnr);
        break;
      case NextActionTypeEnum.Lounge:
        this.onHandleLounge(servicingParams, pnr);
        break;
      case NextActionTypeEnum.FirstBaggage:
        this.onHandleFirstBaggage(servicingParams, pnr);
        break;
      case NextActionTypeEnum.Meal:
        this.onHandleMeal(servicingParams, pnr);
        break;
      case NextActionTypeEnum.AdvancedSeatRequest:
        // 当画面の事前座席指定ボタン押下時の処理を行う。
        this.onHandleAdvanceSeatSelection(servicingParams, pnr);
        break;
      case NextActionTypeEnum.YamatoBaggage:
        this.onHandleYamatoBaggage(servicingParams, pnr);
        break;
      case NextActionTypeEnum.MyCarValet:
        this.onHandleMyCarValet(servicingParams, pnr);
        break;
      case NextActionTypeEnum.DutyFreePreorder:
        this.onHandleDutyFreePreOrder(servicingParams, pnr);
        break;
      case NextActionTypeEnum.JuniorPilot:
        this.onHandleJuniorPilot(servicingParams, pnr);
        break;
      default:
        break;
    }
  }

  /** (4)メールアドレス登録ボタン押下処理 */
  onHandleRegisterEmail(servicingParams: ServicingParams, pnr: GetOrderResponseData = {}) {
    const { isServicing } = this.getCurrentApplication();
    if (isServicing) {
      // 1.	予約詳細(サービス)(S01-P033)の[全サービスの編集情報破棄処理]を行う。
      this.onHandleCommonNo3();
    }
    // 2.	PNR情報取得API応答.data.orderEligibilities.travelerInput.isEligible=false(利用不可)、
    // かつ、PNR情報取得API応答.data.nextAction.acknowledgeOrSelfReaccommodation=false の場合、
    // 利用不可理由に対応するエラーメッセージIDの取得を行う。
    if (
      pnr.orderEligibilities?.travelerInput?.isEligible === false &&
      pnr.nextActions?.acknowledgeOrSelfReaccommodation === false
    ) {
      // 以下パラメータで「当画面共通処理No2.利用不可理由に応じたエラーメッセージ表示処理」を実施する。
      this.onHandleCommonNo2('travelerInput', pnr.orderEligibilities?.travelerInput?.nonEligibilityReasons, '-');
    } else if (isServicing) {
      this.callbacks?.callbackOnHandleRegisterEmail?.(pnr);
    } else {
      const params: Params = {
        ...servicingParams,
        CONNECTION_KIND: 'ZZZ',
      };
      this.navigateToAnotherApp(environment.spa.app.srv, ROUTING_SCREEN['S01-P010'], params);
    }
  }

  /** (5) イレギュラー振替(Acknowledge)ボタン押下処理 */
  onHandleAcknowledge(pnr: GetOrderResponseData = {}) {
    const { isExchange, isServicing } = this.getCurrentApplication();

    if (isServicing) {
      //  1.予約詳細(サービス)(S01-P033)の[全サービスの編集情報破棄処理]を行う。
      this.onHandleCommonNo3();
    }

    // 2.	PNR情報取得API応答.data.orderEligibilities.flightReaccommodation.acknowledge.isEligible=false(利用不可)の場合、利用不可理由に対応するエラーメッセージIDの取得を行う。
    if (pnr?.orderEligibilities?.flightReaccommodation?.acknowledge?.isEligible === false) {
      // 以下パラメータで「当画面共通処理No2.利用不可理由に応じたエラーメッセージ表示処理」を実施する。
      this.onHandleCommonNo2(
        'Acknowledg',
        pnr.orderEligibilities?.flightReaccommodation?.acknowledge?.nonEligibilityReasons,
        '-'
      );
    } else if (isExchange) {
      // 3.	上記以外の場合、振替内容確認(E02-P030)へ遷移する。
      this._router.navigate([ROUTING_SCREEN['E02-P030']]);
    } else {
      this.navigateAnotherMethodPost(environment.spa.app.exc, ROUTING_SCREEN['E02-P030'], { CONNECTION_KIND: 'ZZZ' });
    }
  }

  /** (6) イレギュラー振替(Self Reaccommodation)ボタン押下処理 */
  onHandleSelfReacCommodation(pnr: GetOrderResponseData = {}) {
    const { isExchange, isServicing } = this.getCurrentApplication();
    // 1.	予約詳細(サービス)(S01-P033)の[全サービスの編集情報破棄処理]を行う。
    if (isServicing) {
      this.onHandleCommonNo3();
    }

    // 2.	PNR情報取得API応答.data.orderEligibilities.flightReaccommodation.change.isEligible=false(利用不可)の場合、利用不可理由に対応するエラーメッセージIDの取得を行う。
    if (pnr.orderEligibilities?.flightReaccommodation?.change?.isEligible === false) {
      this.onHandleCommonNo2(
        'selfReaccommodation',
        pnr.orderEligibilities?.flightReaccommodation?.change?.nonEligibilityReasons,
        '-'
      );
    } else if (isExchange) {
      // 3.	上記以外の場合、フライト検索(E02-P010)へ遷移する。
      this._router.navigate([ROUTING_SCREEN['E02-P010']]);
    } else {
      // 3.	上記以外の場合、フライト検索(E02-P010)へ遷移する。
      this.navigateAnotherMethodPost(environment.spa.app.exc, ROUTING_SCREEN['E02-P010'], { CONNECTION_KIND: 'ZZZ' });
    }
  }

  handleLoginModalCloseEvent(pnr: GetOrderResponseData = {}) {
    const { isReservation } = this.getCurrentApplication();
    // 3.2.1.2.1.	PNR情報取得API応答.data.orderType.isAwardBooking=false(有償PNR)の場合、支払情報入力(R01-P080)へ遷移する。
    if (pnr.orderType?.isAwardBooking === false) {
      if (isReservation) {
        this._router.navigate([ROUTING_SCREEN['R01-P080']]);
      } else {
        this.navigateAnotherMethodPost(environment.spa.app.res, ROUTING_SCREEN['R01-P080'], { CONNECTION_KIND: 'ZZZ' });
      }
    }
    // 3.2.1.2.2.	PNR情報取得API応答.data.orderType.isAwardBooking=true(特典PNR)の場合、以降の処理に進まない、処理を中止とする。
    // end flow
  }

  handleLoginModalLoginEvent(pnr: GetOrderResponseData = {}) {
    const { isReservation } = getCurrentApplication();
    // 3.2.2.	ユーザ共通.ログインステータス= REAL_LOGIN(ログイン済)、かつPNR情報取得API応答.data.orderType.isAwardBooking=false(有償PNR)の場合、支払情報入力(R01-P080)へ遷移する。

    if (
      this._common.aswContextStoreService.aswContextData.loginStatus === LoginStatusType.REAL_LOGIN &&
      pnr.orderType?.isAwardBooking === false
    ) {
      if (isReservation) {
        this._router.navigate([ROUTING_SCREEN['R01-P080']]);
      } else {
        this.navigateAnotherMethodPost(environment.spa.app.res, ROUTING_SCREEN['R01-P080'], { CONNECTION_KIND: 'ZZZ' });
      }
    }

    // 3.2.3.	ユーザ共通.ログインステータス= REAL_LOGIN(ログイン済)、かつPNR情報取得API応答.data.orderType.isAwardBooking=true(特典PNR)の場合、以下の処理を行う。
    if (
      this._common.aswContextStoreService.aswContextData.loginStatus === LoginStatusType.REAL_LOGIN &&
      pnr.orderType?.isAwardBooking === true
    ) {
      // 3.2.3.1.	以下の条件でASWDBの「プロパティ」テーブルからプロパティ.valueを取得して、旧ASWの発券機能の支払情報入力のURLとして保持する。
      const destinationURL = this._common.aswMasterService.getMPropertyByKey(
        'servicing',
        'url.internationalAsw.awardPaymentInformationInput'
      );

      // 3.2.3.2.	以下の内容をパラメータとして指定し、旧ASWの発券機能の支払情報入力(A04_P03)へ遷移する。
      // ※パラメータ及び内容については、国際ASW_特典支払情報入力IF.xlsx参照

      // ユーザー共通情報.操作オフィスコードに応じてCONNECTION_KINDを取得する。
      const offices: MOffice[] = this._common.aswMasterService.aswMaster[MasterStoreKey.OFFICE_ALL] ?? [];
      const connectionKind =
        offices.find(
          (office) => office.office_code === this._common.aswContextStoreService.aswContextData.pointOfSaleId
        )?.connection_kind ?? '';

      const params = new URLSearchParams({
        identificationId: this._common.loadSessionStorage(SessionStorageName.IDENTIFICATION_ID),
        CONNECTION_KIND: connectionKind,
        LANG: this._common.aswContextStoreService.aswContextData.lang,
        REC_LOC: pnr?.orderId!,
        passengerLastName: this._common.aswServiceStoreService.aswServiceData.lastName!,
        passengerFirstName: this._common.aswServiceStoreService.aswServiceData.firstName!,
        processType: 'P',
        STATIC: 'STATIC',
      }).toString();
      window.open(`${destinationURL}?${params}`, '_self');
    }
  }

  /** (7) 発券ボタン押下処理 */
  onHandleTicketing(pnr: GetOrderResponseData = {}) {
    const { isReservation, isServicing } = this.getCurrentApplication();

    if (isServicing) {
      // 1.	予約詳細(サービス)(S01-P033)の[全サービスの編集情報破棄処理]を行う。
      this.onHandleCommonNo3();
    }

    // 2.	PNR情報取得API応答.data.orderEligibilities.payment.isEligible=false(利用不可)の場合、利用不可理由に対応するエラーメッセージIDの取得を行う。
    if (pnr?.orderEligibilities?.payment?.isEligible === false) {
      // 以下パラメータで「当画面共通処理No2.利用不可理由に応じたエラーメッセージ表示処理」を実施する。
      this.onHandleCommonNo2('Payment', pnr.orderEligibilities?.payment?.nonEligibilityReasons, '-');
    } else {
      // 3.	上記以外の場合
      // 3.1.	ユーザ共通.ANA Bizログインステータス= ”LOGIN”(ログイン済)の場合、ANA Biz支払情報入力(R01-P083)へ遷移する。
      if (this._common.aswContextStoreService.aswContextData.anaBizLoginStatus === AnaBizLoginStatusType.LOGIN) {
        if (isReservation) {
          this._router.navigate([ROUTING_SCREEN['R01-P083']]);
        } else {
          this.navigateAnotherMethodPost(environment.spa.app.res, ROUTING_SCREEN['R01-P083'], {
            CONNECTION_KIND: 'ZZZ',
          });
        }
      }
      // 3.2.	上記以外の場合
      // 3.2.1.	ユーザ共通.ログインステータス= ”NOT_LOGIN”(未ログイン)の場合、以下の処理を行う。
      else if (this._common.aswContextStoreService.aswContextData.loginStatus === LoginStatusType.NOT_LOGIN) {
        // 3.2.1.1.	ログイン画面モーダル表示状態をstoreで管理し、表示する旨を通知することによって未ログイン利用可能としてログイン画面(S01-M011)を表示する。
        const dialogPart = this._modalService.defaultIdPart(AmcLoginComponent, AmcLoginHeaderComponent);
        dialogPart.closeBackEnable = true;
        dialogPart.payload = {
          // 3.2.1.2.	閉じるボタン押下の場合、本処理を終了する。
          closeEvent: () => {},
          // 3.2.1.3.	ログインなしで進むボタン押下の場合、以下の処理を行う。
          skipEvent: () => this.handleLoginModalCloseEvent(pnr),
          // 3.2.1.4.	ログイン成功の場合、以降の処理に進む。
          submitEvent: () => this.handleLoginModalLoginEvent(pnr),
        };
        this._modalService.showSubPageModal(dialogPart);
      }
      // 3.2.2.	ユーザ共通.ログインステータス= ”REAL_LOGIN”(ログイン済)、かつPNR情報取得API応答.data.orderType.isAwardBooking=false(有償PNR)の場合、支払情報入力(R01-P080)へ遷移する。
      // 3.2.3.	ユーザ共通.ログインステータス= ”REAL_LOGIN”(ログイン済)、かつPNR情報取得API応答.data.orderType.isAwardBooking=true(特典PNR)の場合、以下の処理を行う。
      else if (this._common.aswContextStoreService.aswContextData.loginStatus === LoginStatusType.REAL_LOGIN) {
        this.handleLoginModalLoginEvent(pnr);
      }
    }
  }

  /** (8) 払込ボタン押下処理 */
  onHandlePayment(pnr: GetOrderResponseData = {}) {
    const { isServicing } = this.getCurrentApplication();
    // 1.	予約詳細(サービス)(S01-P033)の[全サービスの編集情報破棄処理]を行う。
    if (isServicing) {
      this.onHandleCommonNo3();
    }

    switch (pnr.nextActions?.offlinePaymentDetails?.paymentMethod) {
      // 2.	PNR情報取得API応答.data.nextActions.offlinePaymentDetails.paymentMethod=”bank”(インターネットバンキング)の場合、
      case GetOrderResponseDataNextActionsOfflinePaymentDetails.PaymentMethodEnum.Bank:
        this._common.aswMasterService
          .getAswMasterByKey$(NEXT_ACTION_LOAD_MASTERS.BANK_ALL.key)
          .subscribe((bankAll: NextActionBankAll[]) => {
            // 2.1.	以下の条件でASWDB(マスタ)の銀行テーブルからウェルネット銀行コードを取得する。
            const bnkcd = bankAll.find(
              (bank) => bank.bank_code === pnr.nextActions?.offlinePaymentDetails?.bankCode
            )?.wellnet_bank_code;
            // 2.2.	以下の条件でASWDBの「プロパティ」テーブルからプロパティ.valueを取得して、ウェルネット(外部サイト)のURLとして保持する。
            const destinationURL = this._common.aswMasterService.getMPropertyByKey(
              'servicing',
              'url.wellnet.paymentGuide.internetBanking'
            );
            // 2.3.	以下の支払情報をリクエストパラメータにセットし、ウェルネット(外部サイト)を別タブでする。
            const params = new URLSearchParams({
              dkno: pnr.nextActions?.offlinePaymentDetails?.encryptedPaymentNumber ?? '',
              rkbn: '2',
              skbn: '',
              bnkcd: stringEmptyDefault(bnkcd),
              CONNECTION_KIND: 'ZZZ',
            }).toString();
            window.open(`${destinationURL}?${params}`, '_blank');
          });
        break;
      // 3.	PNR情報取得API応答.data.nextActions.offlinePaymentDetails.paymentMethod=”convinienceStore”(コンビニエンスストア)の場合、
      case GetOrderResponseDataNextActionsOfflinePaymentDetails.PaymentMethodEnum.ConvinienceStore:
        // 払込方法確認ダイアログを表示する。
        this._modalService.showSubModal(paymentMethodPayloadParts({ pnr }));
        break;
      // 4.	PNR情報取得API応答.data.nextActions.offlinePaymentDetails.paymentMethod=”payeasy”(Pay-easy)の場合、
      case GetOrderResponseDataNextActionsOfflinePaymentDetails.PaymentMethodEnum.Payeasy:
        // Pay-easyの払込方法案内ページ（url.totalPayment.payEasy）を別タブにて表示する。
        window.open(this._staticMsg.transform('url.totalPayment.payEasy'), '_blank');
        break;
      default:
        break;
    }
  }

  /** (12) オンラインチェックインボタン押下処理 */
  onHandleOnlineCheckin(pnr: GetOrderResponseData = {}) {
    const { isCheckIn, isServicing } = this.getCurrentApplication();
    // 1.	予約詳細(サービス)(S01-P033)の[全サービスの編集情報破棄処理]を行う。
    if (isServicing) {
      this.onHandleCommonNo3();
    }

    // 2.1.	PNR情報取得API応答.data.orderType.isGroupBooking=false(グループPNRでない)の場合
    // 2.2.	PNR情報取得API応答.data.orderType.isGroupBooking=true(グループPNRである)の場合
    const orderId =
      pnr.orderType?.isGroupBooking === true ? '' : this._common.aswServiceStoreService.aswServiceData.orderId ?? '';
    const eTicketNumber =
      pnr.orderType?.isGroupBooking === true
        ? this._common.aswServiceStoreService.aswServiceData.travelDocumentId ?? ''
        : '';
    const params: Params = {
      orderId,
      eTicketNumber,
      lastName: this._common.aswServiceStoreService.aswServiceData.lastName ?? '',
      firstName: this._common.aswServiceStoreService.aswServiceData.firstName ?? '',
      SITE_ID: 'RESERVATION',
    };

    // 2.	以下パラメータを指定して、チェックイン検索画面(C01-P010)へ遷移する。
    if (isCheckIn) {
      this._router.navigate([ROUTING_SCREEN['C01-P010']], {
        queryParams: params,
      });
    } else {
      const newParams = { ...params, CONNECTION_KIND: 'ZZZ' };
      this.navigateAnotherMethodPost(environment.spa.app.cki, ROUTING_SCREEN['C01-P010'], newParams);
    }
  }

  getTargetedSegments(pnr: GetOrderResponseData = {}) {
    // 2.2.	対象セグメント情報リストとして、値なしの初期値を用意する。
    const targetedSegment: Type1[] = [];
    // 2.3.	PNR情報取得API応答.data.air.boundsを繰り返し、下記の処理を行う。
    pnr.air?.bounds?.forEach((bound) => {
      // 2.3.1.	該当bounds.flightsを繰り返し、下記の処理を行う。
      bound.flights?.forEach((flight) => {
        // 2.3.1.1.	PNR情報取得API応答.data.orderEligibilities.seatmap.<当該flights.id>.isEligible=trueの場合、下記の処理を行う。
        if (pnr.orderEligibilities?.seatmap?.[flight.id as string]?.isEligible === true) {
          // 2.3.1.1.1.	PNR情報取得API応答.data.travelersの件数分繰り返し、下記の処理を行う。
          pnr.travelers?.forEach((traveler) => {
            const seatSelection = pnr.seats?.[flight.id as string]?.[traveler.id as string]
              ?.seatSelection as OrderSeatItemSeatSelection;
            // 2.3.1.1.1.1.	PNR情報取得API応答.data.seats.<当該flights.id>.<当該travelers.id>.seatSelectionが以下全てを満たす場合、
            if (
              // 2.3.1.1.1.1.1.	serviceStatusが存在しない、またはserviceStatus=”cancelled”
              (isStringEmpty(seatSelection?.serviceStatus) ||
                seatSelection?.serviceStatus === OrderSeatItemSeatSelection.ServiceStatusEnum.Cancelled) &&
              // 2.3.1.1.1.1.2.	characteristicRequestSsrCodeが存在しない
              !seatSelection?.characteristicRequestSsrCode
            ) {
              // 対象セグメント情報リストに当該flightsを追加する。
              targetedSegment.push(flight);
            }
          });
        }
      });
    });
    return targetedSegment;
  }

  /** (13) 事前座席指定ボタン押下処理 */
  onHandleAdvanceSeatSelection(servicingParams: ServicingParams, pnr: GetOrderResponseData = {}) {
    const { isServicing } = this.getCurrentApplication();
    // 1.	PNR情報取得API応答.data.orderEligibilities.seatmap.isEligible=false(利用不可)の場合、利用不可理由に対応するエラーメッセージIDの取得を行う。
    if (pnr.orderEligibilities?.seatmap?.isEligible === false) {
      // 以下パラメータで「当画面共通処理No2.利用不可理由に応じたエラーメッセージ表示処理」を実施する。
      this.onHandleCommonNo2('seat', pnr.orderEligibilities?.seatmap?.nonEligibilityReasons, '-');
    } else if (isServicing) {
      // 2.	上記以外の場合、以下の処理を行う。
      // 2.1.	表示対象セグメントIDとして、値なしの初期値を用意する。
      let displayTargetSegmentId = '';
      const targetedSegment = this.getTargetedSegments(pnr);
      // 2.4.	セグメント情報.departure.dateTimeの昇順で対象セグメント情報リストをソートする。
      targetedSegment.sort((first, second) => {
        if (first.departure?.dateTime && second.departure?.dateTime) {
          const firstDate = new Date(first.departure.dateTime).getTime();
          const secondDate = new Date(second.departure.dateTime).getTime();
          return firstDate - secondDate;
        }
        return 0;
      });
      // 2.5.	対象セグメント情報リストの最初セグメント情報.セグメントIDを表示対象セグメントIDに設定する。
      if (targetedSegment[0]?.id) {
        displayTargetSegmentId = targetedSegment[0].id;
      }
      // 2.6.	[当画面共通処理No4.予約詳細store項目削除処理]を行う。
      this.onHandleCommonNo4();
      this.callbacks.callbackOnHandleAdvanceSeatSelection?.(pnr, displayTargetSegmentId);
    } else {
      this.navigateToAnotherApp(environment.spa.app.srv, ROUTING_SCREEN['S01-P010'], servicingParams);
    }
  }

  /** (14) 入国情報登録ボタン押下処理 */
  onHandleImmigrationInformationRegistration(servicingParams: ServicingParams, pnr: GetOrderResponseData = {}) {
    const { isServicing } = this.getCurrentApplication();
    // 1.	予約詳細(サービス)(S01-P033)の[全サービスの編集情報破棄処理]を行う。
    this.onHandleCommonNo3();

    // 2.	PNR情報取得API応答.data.orderEligibilities.travelerInput.isEligible=false(利用不可)の場合、利用不可理由に対応するエラーメッセージIDの取得を行う。
    if (pnr.orderEligibilities?.travelerInput?.isEligible === false) {
      // 以下パラメータで「当画面共通処理No2.利用不可理由に応じたエラーメッセージ表示処理」を実施する。
      this.onHandleCommonNo2('travelerInput', pnr.orderEligibilities?.travelerInput?.nonEligibilityReasons, '-');
    }

    if (isServicing) {
      this.callbacks.callbackOnHandleImmigrationInformationRegistration?.(pnr);
    } else {
      const { aswCommonData } = this._common.aswCommonStoreService;
      const previousScreenId = `${aswCommonData.functionId}-${aswCommonData.pageId}`;
      const params: Params = {
        ...servicingParams,
        previousScreenId,
        CONNECTION_KIND: 'ZZZ',
      };
      this.navigateToAnotherApp(environment.spa.app.srv, ROUTING_SCREEN['S01-P010'], params);
    }
  }

  /** (35) 証憑登録(障がい者)ボタン押下処理 */
  onHandleRegisterEvidenceDisabledPersons(pnr: GetOrderResponseData = {}) {
    // 1.	証憑登録(障がい者)のコンテンツページ（url.certificate RegistrationDiscountsDisabled）を別タブで表示する。
    window.open(this._staticMsg.transform('url.certificate RegistrationDiscountsDisabled'), '_blank');
  }

  /** (36) 証憑登録(離島)ボタン押下処理 */
  onHandleRegisterEvidenceIsland(pnr: GetOrderResponseData = {}) {
    this.callbacks.callbackOnHandleRegisterEvidenceIsland?.(pnr);
    // 1.	証憑登録(離島)のコンテンツページ（url.certificate RegistrationDiscountsIsolatedIsland）を別タブで表示する。
    window.open(this._staticMsg.transform('url.certificate RegistrationDiscountsIsolatedIsland'), '_blank');
  }

  /** (37) ジュニアパイロットボタン押下処理 */
  onHandleJuniorPilot(servicingParams: ServicingParams, pnr: GetOrderResponseData = {}) {
    const { isServicing } = this.getCurrentApplication();
    this.callbacks.callbackOnHandleJuniorPilot?.(pnr);

    // 1.	ジュニアパイロット申込(S02-P013)へ遷移する。

    if (isServicing) {
      this._servicingCommonStoreService.updateServicingCommon({
        backupLanguage: this._common.aswContextStoreService.aswContextData.lang,
      });
      this._router.navigate([ROUTING_SCREEN['S02-P013']]);
    } else {
      this.navigateToAnotherApp(environment.spa.app.srv, ROUTING_SCREEN['S01-P010'], servicingParams);
    }
  }

  /** (23) アップグレードボタン押下処理 */
  onHandleUpgrade(pnr: GetOrderResponseData = {}) {
    const { isExchange, isServicing } = this.getCurrentApplication();

    if (isServicing) {
      // 1.	予約詳細(サービス)(S01-P033)の[全サービスの編集情報破棄処理]を行う。
      this.onHandleCommonNo3();
    }

    if (pnr.orderEligibilities?.upgrade?.isEligible === false) {
      // 以下パラメータで「当画面共通処理No2.利用不可理由に応じたエラーメッセージ表示処理」を実施する。
      this.onHandleCommonNo2('upgrade', pnr.orderEligibilities?.upgrade?.nonEligibilityReasons, '-');
    } else if (isExchange) {
      // 3.	上記以外の場合、アップグレード対象フライト選択(E04-P010)へ遷移する。
      this._router.navigate([ROUTING_SCREEN['E04-P010']]);
    } else {
      // 3.	上記以外の場合、アップグレード対象フライト選択(E04-P010)へ遷移する。
      this.navigateAnotherMethodPost(environment.spa.app.exc, ROUTING_SCREEN['E04-P010'], { CONNECTION_KIND: 'ZZZ' });
    }
  }

  /** (38) ANA Biz ご利用明細書ボタン押下処理 */
  onHandleAnaBiz(servicingParams: ServicingParams, pnr: GetOrderResponseData = {}) {
    const { isServicing } = this.getCurrentApplication();
    if (isServicing) {
      // 1.	予約詳細(サービス)(S01-P033)の[全サービスの編集情報破棄処理]を行う。
      this.onHandleCommonNo3();
    }

    // 2.	PNR情報取得API応答.data.orderEligibilities.usageDetailsListOfBusinessTrip.isEligible=false(利用不可)の場合、利用不可理由に対応するエラーメッセージIDの取得を行う。
    if (pnr.orderEligibilities?.usageDetailsListOfBusinessTrip?.isEligible === false) {
      // 以下パラメータで「当画面共通処理No2.利用不可理由に応じたエラーメッセージ表示処理」を実施する。
      this.onHandleCommonNo2(
        'usageDetailsListOfBusinessTrip',
        pnr.orderEligibilities?.usageDetailsListOfBusinessTrip?.nonEligibilityReasons,
        '-'
      );
    } else if (isServicing) {
      // 3.	上記以外の場合、以下パラメータを指定して、ANA Bizご利用明細書表示(S05-P040)へ遷移する。
      // fix comment CR S01-P030
      this._servicingCommonStoreService?.updateServicingCommon({
        businessTripNumbers: pnr.orderEligibilities?.usageDetailsListOfBusinessTrip?.businessTripNumbers?.map(
          (buNumber) => buNumber.number ?? ''
        ),
      });
      this._router.navigate([ROUTING_SCREEN['S05-P040']]);
    } else {
      this.navigateToAnotherApp(environment.spa.app.srv, ROUTING_SCREEN['S01-P010'], servicingParams);
    }
  }

  /** (15) eチケット/EMD表示ボタン押下処理 */
  onHandleETicketAndEMD(servicingParams: ServicingParams, pnr: GetOrderResponseData = {}) {
    const { isServicing } = this.getCurrentApplication();
    if (isServicing) {
      // 1.	予約詳細(サービス)(S01-P033)の[全サービスの編集情報破棄処理]を行う。
      this.onHandleCommonNo3();
    }
    // 2.	PNR情報取得API応答.data.orderEligibilities.eticketAndEmd.isEligible=false(利用不可)の場合、利用不可理由に対応するエラーメッセージIDの取得を行う。
    if (pnr.orderEligibilities?.eticketAndEmd?.isEligible === false) {
      // 以下パラメータで「当画面共通処理No2.利用不可理由に応じたエラーメッセージ表示処理」を実施する。
      this.onHandleCommonNo2('eTicketEmd', pnr.orderEligibilities?.eticketAndEmd?.nonEligibilityReasons, '-');
    } else if (isServicing) {
      // 3.	上記以外の場合
      // 3.1.	PNR情報取得API応答.data.travelDocumentsが1件かつ、PNR情報取得API応答.data.travelDocuments[0].documentType=”eticket”(航空券)の場合、
      if (
        pnr.travelDocuments?.length === 1 &&
        pnr.travelDocuments?.[0].documentType === GetOrderResponseDataTravelDocumentsInner.DocumentTypeEnum.Eticket
      ) {
        // 航空券PDF取得APIを呼び出す。
        // 3.1.1.	リクエスト情報
        const apiRequestParams: GetETicketItineraryReceiptRequest = {
          orderId: pnr.orderId,
          eTicketNumber: pnr.travelDocuments?.[0]?.id ?? '',
          credential: {
            firstName: this._common.aswServiceStoreService.aswServiceData.firstName!,
            lastName: this._common.aswServiceStoreService.aswServiceData.lastName!,
          },
        };
        this.pdfWindow = window.open('');
        this._loadingSvc.startLoading(true);
        this._servicingApiService
          .ordersGetETicketItineraryReceiptPost(apiRequestParams)
          .pipe(take(1))
          // 3.1.2.	レスポンス情報
          .subscribe({
            // 3.1.2.1.	正常終了の場合
            next: (response) => {
              // 返却されたeチケットお客様控え(PDF)を別タブで表示する
              const pdfName = this._common.aswMasterService.getMPropertyByKey(
                'reportForm',
                'downloadFileName.servicing.itineraryReceipt'
              );
              this.showPdfInNewWindow(response.data.pdfData, pdfName, this.pdfWindow);
              this._loadingSvc.endLoading();
            },
            // 3.1.2.2.	異常終了の場合
            error: (error) => {
              this.pdfWindow?.close();
              /**
               * 以下表の1行目から順に、APIレスポンス.errorsについて、当該error.コード=エラーコードとなるエラーコードが含まれるかを確認し、
               * 最初に含まれるエラーコードについて、そのエラーコードの行に応じたエラーメッセージIDを求める。
               */
              const apiErrorCode = this._common.apiError?.errors?.[0]?.code ?? '';
              const errorMsgId = ORDERS_GET_E_TICKET_ITINERARY_RECEIPT_POST_ERROR_MAP[apiErrorCode];
              this._loadingSvc.endLoading();
              this._common.errorsHandlerService.setNotRetryableError({
                errorType: ErrorType.BUSINESS_LOGIC,
                errorMsgId,
                apiErrorCode,
              });
            },
          });
      } else if (
        pnr.travelDocuments?.length === 1 &&
        pnr.travelDocuments?.[0]?.documentType === GetOrderResponseDataTravelDocumentsInner.DocumentTypeEnum.Services
      ) {
        // 3.2.	PNR情報取得API応答.data.travelDocumentsが1件かつ、PNR情報取得API応答.data.travelDocuments[0].documentType=”services”(EMD)の場合、
        // EMD PDF取得APIを呼び出す。
        // 3.2.1.	リクエスト情報
        const apiRequestParams: GetEmdPassengerReceiptRequest = {
          emdNumber: pnr.travelDocuments?.[0]?.id ?? '',
          credential: {
            firstName: this._common.aswServiceStoreService.aswServiceData.firstName!,
            lastName: this._common.aswServiceStoreService.aswServiceData.lastName!,
          },
        };
        this.pdfWindow = window.open('');
        this._loadingSvc.startLoading(true);
        this._servicingApiService
          .ordersGetEmdPassengerReceiptPost(apiRequestParams)
          .pipe(take(1))
          // 3.2.2.	レスポンス情報
          .subscribe({
            // 3.2.2.1.	正常終了の場合
            next: (response) => {
              // 返却されたEMDお客様控え(PDF)を別タブで表示する
              const pdfName = this._common.aswMasterService.getMPropertyByKey(
                'reportForm',
                'downloadFileName.servicing.emdReceipt'
              );
              this.showPdfInNewWindow(response.data.pdfData, pdfName, this.pdfWindow);
              this._loadingSvc.endLoading();
            },
            // 3.2.2.2.	異常終了の場合
            error: (error) => {
              this.pdfWindow?.close();
              /**
               * 以下表の1行目から順に、APIレスポンス.errorsについて、当該error.コード=エラーコードとなるエラーコードが含まれるかを確認し、
               * 最初に含まれるエラーコードについて、そのエラーコードの行に応じたエラーメッセージIDを求める。
               */
              const apiErrorCode = error?.['error']?.errors?.at(0)?.code ?? '';
              const errorMsgId = ORDERS_GET_EMD_PASSENGER_RECEIPT_POST_ERROR_MAP[apiErrorCode];
              this._loadingSvc.endLoading();
              this._common.errorsHandlerService.setNotRetryableError({
                errorType: ErrorType.BUSINESS_LOGIC,
                errorMsgId,
                apiErrorCode,
              });
            },
          });
      } else {
        this._router.navigate([ROUTING_SCREEN['S05-P031']]);
      }
    } else {
      this.navigateToAnotherApp(environment.spa.app.srv, ROUTING_SCREEN['S01-P010'], servicingParams);
    }
  }

  /** “YAMATO_BAGGAGE"(ヤマト手荷物) */
  onHandleYamatoBaggage(servicingParams: ServicingParams, pnr: GetOrderResponseData = {}) {
    const { isServicing } = this.getCurrentApplication();
    // 1.PNR情報取得API応答.data.orderEligibilities.yamatoBaggage.isEligible=false(利用不可)の場合、以下処理にて、利用不可理由に対応するエラーメッセージIDの取得を行う。
    if (pnr.orderEligibilities?.yamatoBaggage?.isEligible === false) {
      // 1.1. 以下パラメータで「当画面共通処理No2.利用不可理由に応じたエラーメッセージ表示処理」を実施する。
      this.onHandleCommonNo2('yamatoBaggage', pnr?.orderEligibilities?.yamatoBaggage?.nonEligibilityReasons, '-');
    } else if (isServicing) {
      // 2. 上記以外の場合、ヤマト手荷物案内(S06-P020)へ遷移する。
      this._router.navigate([ROUTING_SCREEN['S06-P020']]);
    } else {
      this.navigateToAnotherApp(environment.spa.app.srv, ROUTING_SCREEN['S01-P010'], servicingParams);
    }
  }

  /** “MY_CAR_VALET"(マイカーバレー) */
  onHandleMyCarValet(servicingParams: ServicingParams, pnr: GetOrderResponseData = {}) {
    const { isServicing } = this.getCurrentApplication();
    // 1.PNR情報取得API応答.data.orderEligibilities.myCarValet.isEligible=false(利用不可)の場合、以下処理にて、利用不可理由に対応するエラーメッセージIDの取得を行う。
    if (pnr.orderEligibilities?.myCarValet?.isEligible === false) {
      // 1.1. 以下パラメータで「当画面共通処理No2.利用不可理由に応じたエラーメッセージ表示処理」を実施する。
      this.onHandleCommonNo2('myCarValet', pnr.orderEligibilities?.myCarValet?.nonEligibilityReasons, '-');
    } else if (isServicing) {
      // 2. 上記以外の場合、
      // 2.1. [当画面共通処理No4.予約詳細store項目削除処理]を行う。
      this.onHandleCommonNo4();
      this.callbacks.callbackOnHandleMyCarValet?.(pnr);
      // 2.2. マイカーバレー申込(S02-P011)へ遷移する。
      this._router.navigate([ROUTING_SCREEN['S02-P011']]);
    } else {
      this.navigateToAnotherApp(environment.spa.app.srv, ROUTING_SCREEN['S01-P010'], servicingParams);
    }
  }

  /** “DUTY_FREE_PRE_ORDER"(免税品プリオーダー) */
  onHandleDutyFreePreOrder(servicingParams: ServicingParams, pnr: GetOrderResponseData = {}) {
    const { isServicing } = this.getCurrentApplication();
    // 1.PNR情報取得API応答.data.orderEligibilities.dutyFreePreorder.isEligible=false(利用不可)の場合、以下処理にて、利用不可理由に対応するエラーメッセージIDの取得を行う。
    if (pnr.orderEligibilities?.dutyFreePreorder?.isEligible === false) {
      // 1.1. 以下パラメータで「当画面共通処理No2.利用不可理由に応じたエラーメッセージ表示処理」を実施する。
      this.onHandleCommonNo2('dutyFreePreOrder', pnr.orderEligibilities?.dutyFreePreorder?.nonEligibilityReasons, '-');
    } else if (isServicing) {
      // 2. 上記以外の場合、免税品プリオーダー案内(S06-P010)へ遷移する。
      this._router.navigate([ROUTING_SCREEN['S06-P010']]);
    } else {
      this.navigateToAnotherApp(environment.spa.app.srv, ROUTING_SCREEN['S01-P010'], servicingParams);
    }
  }

  /** “LOUNGE"(ラウンジ) */
  onHandleLounge(servicingParams: ServicingParams, pnr: GetOrderResponseData = {}) {
    const { isServicing } = this.getCurrentApplication();
    // 1.PNR情報取得API応答.data.orderEligibilities.chargeableLounge.isEligible=false(利用不可)の場合、以下処理にて、利用不可理由に対応するエラーメッセージIDの取得を行う。
    if (pnr.orderEligibilities?.chargeableLounge?.isEligible === false) {
      // 1.1. 以下パラメータで「当画面共通処理No2.利用不可理由に応じたエラーメッセージ表示処理」を実施する。
      this.onHandleCommonNo2('lounge', pnr.orderEligibilities?.chargeableLounge?.nonEligibilityReasons, '-');
    } else if (isServicing) {
      // 2. 上記以外の場合、以下処理を行う。
      this.callbacks?.callbackLounge?.(pnr);
    } else {
      this.navigateToAnotherApp(environment.spa.app.srv, ROUTING_SCREEN['S01-P010'], servicingParams);
    }
  }

  /** “FIRST_BAGGAGE"(ファーストバゲージ) */
  onHandleFirstBaggage(servicingParams: ServicingParams, pnr: GetOrderResponseData = {}) {
    const { isServicing } = this.getCurrentApplication();
    // 1.PNR情報取得API応答.data.orderEligibilities.firstBaggage.isEligible=false(利用不可)の場合、以下処理にて、利用不可理由に対応するエラーメッセージIDの取得を行う。
    if (pnr.orderEligibilities?.firstBaggage?.isEligible === false) {
      // 1.1. 以下パラメータで「当画面共通処理No2.利用不可理由に応じたエラーメッセージ表示処理」を実施する。
      this.onHandleCommonNo2('firstBaggage', pnr.orderEligibilities?.firstBaggage?.nonEligibilityReasons, '-');
    } else if (isServicing) {
      // 2. 上記以外の場合、以下処理を行う。
      // 2.1. 予約詳細表示タブ変数に"service"(予約詳細(サービス))を設定する。
      this.callbacks?.callbackFirstBaggage?.(pnr);
    } else {
      this.navigateToAnotherApp(environment.spa.app.srv, ROUTING_SCREEN['S01-P010'], servicingParams);
    }
  }

  /** “MEAL"(機内食) */
  onHandleMeal(servicingParams: ServicingParams, pnr: GetOrderResponseData = {}) {
    const { isServicing } = this.getCurrentApplication();
    // 1.PNR情報取得API応答.data.orderEligibilities.meal.isEligible=false(利用不可)の場合、以下処理にて、利用不可理由に対応するエラーメッセージIDの取得を行う。
    if (pnr.orderEligibilities?.meal?.isEligible === false) {
      // 1.1. 以下パラメータで「当画面共通処理No2.利用不可理由に応じたエラーメッセージ表示処理」を実施する。
      this.onHandleCommonNo2('meal', pnr.orderEligibilities?.meal?.nonEligibilityReasons, '-');
    } else if (isServicing) {
      // 2. 上記以外の場合、以下処理を行う。
      // 2.1. 予約詳細表示タブ変数に"service"(予約詳細(サービス))を設定する。
      this.callbacks?.callbackMeal?.(pnr);
    } else {
      this.navigateToAnotherApp(environment.spa.app.srv, ROUTING_SCREEN['S01-P010'], servicingParams);
    }
  }

  /** 共通No3. 全サービスの編集情報破棄処理 */
  onHandleCommonNo3() {
    if (this._servicingCommonStoreService) {
      this._servicingCommonStoreService?.updateServicingCommon({
        ...this._servicingCommonStoreService?.servicingCommon,
        meal: undefined,
        chargeableLounge: undefined,
        firstBaggage: undefined,
        seatReservationStatus: undefined,
      });
    }

    if (this._servicingSeatmapStoreService) {
      this._servicingSeatmapStoreService.setServicingSeatmap({});
    }

    if (this._servicingSeatmapBackupStoreService) {
      this._servicingSeatmapBackupStoreService.setServicingSeatmapBackup({});
    }
  }

  // (No2) 利用不可理由に応じたエラーメッセージ表示処理
  onHandleCommonNo2(func: string, aswImpossible: Array<string> = [], dxAPIReason = '') {
    this._common.aswMasterService
      .getAswMasterByKey$(NEXT_ACTION_LOAD_MASTERS.FUNCTION_INELIGIBLE_REASON_PK.key)
      .pipe(take(1))
      .subscribe((_mFucntionIneligibleReason: NextActionMFucntionIneligibleReason) => {
        const result = _mFucntionIneligibleReason?.[String(func)]?.[String(aswImpossible?.[0])]?.[String(dxAPIReason)];
        if (result && result.length > 0 && result?.[0].error_message_id !== '') {
          this._common.errorsHandlerService.setRetryableError(PageType.PAGE, {
            errorMsgId: result[0].error_message_id,
          });
        } else {
          this._common.errorsHandlerService.setRetryableError(PageType.PAGE, {
            errorMsgId: 'E0765',
          });
        }
      });
  }

  // (No4) 予約詳細Store項目削除処理
  onHandleCommonNo4() {
    if (this._servicingCommonStoreService) {
      this._servicingCommonStoreService?.updateServicingCommon({
        completedFunction: '',
        lang: '',
        initDisplayService: '',
        isFirstDisplay: false,
      });
    }
  }
}
