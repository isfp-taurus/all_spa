import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import {
  DeliveryInformationStoreService,
  FareConditionsStoreService,
  GetOrderStoreService,
  BookingCompletedSubHeaderInformationStoreService,
  GetETicketItineraryReceiptStoreService,
} from '@common/services';
import { SupportPageComponent } from '@lib/components/support-class';
import {
  CommonLibService,
  ErrorsHandlerService,
  AswServiceStoreService,
  PageInitService,
  TealiumService,
  PageLoadingService,
} from '@lib/services';
import { FareConditionsRequest, GetOrderRequest, GetOrderResponseData } from 'src/sdk-servicing';
import { Title } from '@angular/platform-browser';
import { StaticMsgPipe } from '@lib/pipes';
import { MybookingBaggageRulesInput } from '@common/components/servicing/mybooking/mybooking-baggage-rules/mybooking-baggage-rules.state';
import { GetOrderState } from '@common/store';
import { apiEventAll } from '@common/helper';
import { AswServiceModel, ErrorType } from '@lib/interfaces';
import { combineLatest } from 'rxjs';
import {
  DeliveryInformationPaymentInformation,
  ReservationFunctionIdType,
  ReservationPageIdType,
} from '@common/interfaces';
import { BehaviorSubject } from 'rxjs';
import {
  BookingCompletedDynamicParams,
  defaultBookingCompletedDynamicParams,
  DisplayInfoJSON,
} from './booking-completed-cont.state';
import { BookingCompletedContService } from './booking-completed-cont.service';
import { ErrorCodeConstants } from '@conf/app.constants';
/**
 * 予約・購入完了
 */
@Component({
  selector: 'asw-booking-completed-cont',
  templateUrl: './booking-completed-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Title],
})
export class BookingCompletedContComponent extends SupportPageComponent {
  // プロパティ定義
  /** ページID */
  pageId: string = ReservationPageIdType.BOOKING_COMPLEATED;
  /** 機能ID */
  functionId: string = ReservationFunctionIdType.PRIME_BOOKING;

  /**　初期化処理自動完了をオフにする */
  override autoInitEnd = false;
  /**　画面タイトル */
  public titleLabel: string = '';
  /**　完了メッセージ */
  public displayLabel: string = '';

  /** 支払情報入力画面(R01-P080)から渡された決済前PNR情報 */
  public paymentInformation: DeliveryInformationPaymentInformation = {
    orderStatus: '',
    is3DSPayment: false,
    paymentMethod: '',
    beforePaymentOrder: {},
    warnings: [],
  };

  /** 手荷物ルール情報取得完了フラグ */
  public isBaggageRuleExist: boolean = false;

  /** 手荷物ルールエリア表示フラグ */
  public displayBaggageRulesArea: boolean = true;

  /** 手荷物ルールデータ */
  public mybookingBaggageRulesData?: MybookingBaggageRulesInput;

  public pnrInfo?: GetOrderResponseData;

  /** 動的文言用Subject */
  private dynamicSubject = new BehaviorSubject<BookingCompletedDynamicParams>(defaultBookingCompletedDynamicParams());

  /** 画面情報JSON */
  private displayInfoJSON: DisplayInfoJSON = {};

  /** pdfを表示するためのwindow */
  pdfWindow: WindowProxy | null = null;

  /** コンストラクタ */
  constructor(
    private _common: CommonLibService,
    private _pageInitService: PageInitService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _staticMsgPipe: StaticMsgPipe,
    private _title: Title,
    private _aswServiceStoreService: AswServiceStoreService,
    private _deliveryInformationStoreService: DeliveryInformationStoreService,
    private _fareConditionsStoreService: FareConditionsStoreService,
    private _getOrderStoreService: GetOrderStoreService,
    private _bookingCompletedSubHeaderInformationStoreService: BookingCompletedSubHeaderInformationStoreService,
    private _getETicketItineraryReceiptStoreService: GetETicketItineraryReceiptStoreService,
    public change: ChangeDetectorRef,
    private _tealiumService: TealiumService,
    public service: BookingCompletedContService,
    private _pageLoadingService: PageLoadingService
  ) {
    super(_common, _pageInitService);
    this.setInitialAswCommon();
    // 支払情報入力画面(R01-P080)から渡された決済前PNR情報
    this.paymentInformation =
      this._deliveryInformationStoreService.deliveryInformationData.paymentInformation ?? this.paymentInformation;
    const orderStatus =
      this._deliveryInformationStoreService.deliveryInformationData.paymentInformation?.orderStatus ?? '';
    // 画面タイトルをセット
    this.titleLabel = this.setPageTitle(orderStatus);
    // 完了メッセージを取得
    this.displayLabel = this.service.getDisplayLabel(orderStatus);
    // ブレッドクラムの表示判定実施
    this.updateBreadcrumb(this.titleLabel);
    const aswService: AswServiceModel = {
      orderId: this.paymentInformation.beforePaymentOrder.data?.orderId ?? '',
      lastName: this.paymentInformation.beforePaymentOrder.data?.travelers?.[0]?.names?.[0]?.lastName ?? '',
      firstName: this.paymentInformation.beforePaymentOrder.data?.travelers?.[0]?.names?.[0]?.firstName ?? '',
    };
    this._common.aswServiceStoreService.updateAswService(aswService);
  }

  /** INTERNAL_DESIGN_EVENT 初期表示処理 */
  init(): void {
    this._pageInitService.startInit();
    // PNR情報取得API実行のためのパラメータを作成
    const getOrderRequestParam: GetOrderRequest = this.service.createGetOrderRequest(
      this.paymentInformation.beforePaymentOrder.data
    );
    // 画面情報JSON作成
    this.displayInfoJSON = this.service.setDisplayInfoJSON(
      this._deliveryInformationStoreService.deliveryInformationData
    );
    // PNR情報取得API実行
    this.callGetOrderApi(getOrderRequestParam);
    // 支払情報.ワーニング情報のチェック
    this.checkPaymentWarning();
    // 画面情報JSON連携
    this._tealiumService.setTealiumPageOutput(this.displayInfoJSON);
  }

  /**
   * 初期表示の画面情報をセット
   */
  setInitialAswCommon() {
    // 画面情報への機能ID、ページID設定
    this._common.aswCommonStoreService.updateAswCommon({
      functionId: this.functionId,
      pageId: this.pageId,
      subFunctionId: '',
      subPageId: '',
      isEnabledLogin: false,
      isUpgrade: false,
    });
  }

  /**
   * 初期表示の画面情報をセット
   * @param orderStatus オーダーステータス
   * @return 画面タイトルラベル
   */
  setPageTitle(orderStatus: string) {
    // 画面タイトルの出し分け
    let titleLabel = this.service.getTitleLabel(orderStatus);

    // タブバーに画面タイトルを設定する
    this.forkJoinService(
      'BookingCompletedContComponent bookingCompletedSubHeaderInformation',
      [this._staticMsgPipe.get(titleLabel), this._staticMsgPipe.get('label.aswPageTitle')],
      ([str1, str2]) => {
        this._title.setTitle(str1 + str2);
      }
    );

    return titleLabel;
  }

  /**
   * ブレッドクラムの表示判定
   * 実施後ストアに書き込み
   * @param displayTitleLabel 画面タイトルラベル
   */
  updateBreadcrumb(displayTitleLabel: string) {
    // ブレッドクラムの表示判定実施
    const isBreadcrumbDisplay =
      !this._aswServiceStoreService.aswServiceData.orderId &&
      !this._aswServiceStoreService.aswServiceData.lastName &&
      !this._aswServiceStoreService.aswServiceData.firstName;

    // サブヘッダーに画面タイトル、ブレッドクラム表示判定を渡す
    const subHeaderData = {
      displayTitle: displayTitleLabel,
      isBreadcrumbDisplay: isBreadcrumbDisplay,
    };
    //　値をstoreにセット
    this._bookingCompletedSubHeaderInformationStoreService.setBookingCompletedSubHeaderInformation(subHeaderData);
  }

  /**
   * 支払情報から渡されたワーニングをチェックし、あればセットする
   */
  checkPaymentWarning() {
    //支払情報.ワーニング情報がある場合、支払情報.ワーニング情報に設定されたワーニング情報の表示
    this._deliveryInformationStoreService.deliveryInformationData.paymentInformation?.warnings?.forEach((warning) =>
      this._common.alertMessageStoreService.setAlertWarningMessage(warning)
    );
  }

  /**
   * PNR情報取得APIの実行
   * @param request PNR情報取得APIのリクエストパラメータ
   */
  callGetOrderApi(request: GetOrderRequest) {
    // PNR情報取得APIの実行

    apiEventAll(
      () => {
        this._getOrderStoreService.setGetOrderFromApi(request);
      },
      this._getOrderStoreService.getGetOrderObservable(),
      (response) => {
        this.pnrInfo = response.data;
        // MetaConnectSearch向け情報格納(FareAmountとCurrency)
        const totalInfo = response.data?.prices?.totalPrices?.total?.[0];
        const cartData = { finalPrice: String(totalInfo?.value), currency: totalInfo?.currencyCode };
        sessionStorage.setItem('cartData', JSON.stringify(cartData));

        // 初期化終了
        this.dynamicSubject.next({
          getOrderReply: response,
          fareConditionsReply: undefined,
          pageContext: this.displayInfoJSON,
        });
        if (this.pnrInfo && this.pnrInfo.nextActions?.payment)
          this._deliveryInformationStoreService.updateDeliveryInformation({
            passToPayment: {
              orderId: this.pnrInfo.orderId ?? '',
              errInfo: this._deliveryInformationStoreService.deliveryInformationData.passToPayment?.errInfo ?? [],
              credential: {
                lastName: this.pnrInfo.travelers?.[0]?.names?.[0]?.lastName ?? '',
                firstName: this.pnrInfo.travelers?.[0]?.names?.[0]?.firstName ?? '',
              },
            },
          });
        this.callEndInit();
        // 運賃ルール・手荷物ルール取得API実行のためのパラメータを作成
        const fareConditionsRequestParam = this.service.createFareConditionsRequestParam(response.data);
        this.callFareConditionsApi(fareConditionsRequestParam, response);
      },
      (error) => {
        // 初期化終了
        this.callEndInit();
        this._getOrderStoreService.resetGetOrder();
        const errorInfo = {
          errorMsgId: 'E0400',
          apiErrorCode: this._common.apiError?.errors?.[0]?.code,
        };
        this.mybookingBaggageRulesData = {
          fareConditions: { ...this._fareConditionsStoreService.fareConditionsData, isFailure: true },
          getOrder: error,
        };
        this.change.markForCheck();
        this._errorsHandlerSvc.setRetryableError('page', errorInfo);
      }
    );
  }

  /**
   * 運賃ルール・手荷物ルール取得APIの実行
   * @param request 運賃ルール・手荷物ルール取得APIのリクエストパラメータ
   * @param pnr PNR情報取得API
   */
  callFareConditionsApi(request: FareConditionsRequest, pnr: GetOrderState) {
    // 運賃ルール・手荷物ルール取得APIの実行
    apiEventAll(
      () => {
        this._fareConditionsStoreService.setFareConditionsFromApi(request);
      },
      this._fareConditionsStoreService.getFareConditions$(),
      (response) => {
        this._fareConditionsStoreService.resetFareConditions();
        this.isBaggageRuleExist = true;
        this.mybookingBaggageRulesData = {
          fareConditions: response,
          getOrder: pnr,
        };
        // 動的文言
        const bookingCompletedDynamicParams = {
          ...this.dynamicSubject.getValue(),
          fareConditionsReply: response,
        };
        this.dynamicSubject.next(bookingCompletedDynamicParams);
        this.change.markForCheck();
      },
      (error) => {
        this._fareConditionsStoreService.resetFareConditions();
        this.isBaggageRuleExist = false;
        this.mybookingBaggageRulesData = {
          fareConditions: error,
          getOrder: pnr,
        };
        this.change.markForCheck();
      }
    );
  }

  /** 画面終了時処理 */
  destroy() {}

  /** 画面更新時処理 */
  reload() {}

  /**
   * 画面初期化終了処理　複数個所から使うため関数化
   */
  callEndInit() {
    this._pageInitService.endInit(this.dynamicSubject);
  }

  /**
   * 予約詳細へボタン押下時処理
   * @param next 次のアクション
   */
  goToMyBooking(next: string = '') {
    this._pageLoadingService.startLoading();
    this.service.goToMyBooking(next, this.paymentInformation.beforePaymentOrder.data);
  }

  /** ASW TOPへボタン押下時処理 */
  public returnToAswTop() {
    this.service.returnToAswTop();
  }

  /** Eチケットボタン押下時イベント*/
  eTicketPdfCall() {
    this._pageLoadingService.startLoading();
    this.pdfWindow = window.open('');
    apiEventAll(
      () => {
        this._getETicketItineraryReceiptStoreService.setGetETicketItineraryReceiptFromApi({
          eTicketNumber: this.mybookingBaggageRulesData?.getOrder.data?.travelDocuments?.[0]?.id ?? '',
          orderId: this.mybookingBaggageRulesData?.getOrder.data?.orderId ?? '',
          credential: {
            firstName: this.mybookingBaggageRulesData?.getOrder.data?.travelers?.[0]?.names?.[0]?.firstName ?? '',
            lastName: this.mybookingBaggageRulesData?.getOrder.data?.travelers?.[0]?.names?.[0]?.lastName ?? '',
          },
        });
      },
      this._getETicketItineraryReceiptStoreService.getGetETicketItineraryReceipt$(),
      (res) => {
        // pdfを表示するためのwindowが開かれていれば、航空券 PDF取得APIから受け取ったデータをpdfにレンダリングする
        if (this.pdfWindow) {
          this.service.Base64ToPdfOpen(res.data.pdfData, this.pdfWindow);
        }
        this._pageLoadingService.endLoading();
        this._getETicketItineraryReceiptStoreService.resetGetETicketItineraryReceipt();
      },
      (error) => {
        // もしエラーであれば事前に開いていた、別タブを閉じる
        this.pdfWindow?.close();
        this._pageLoadingService.endLoading();
        this._getETicketItineraryReceiptStoreService.resetGetETicketItineraryReceipt();
        const apierror = this._common.apiError;
        let errorId = '';
        if (
          apierror?.errors?.[0]?.code === ErrorCodeConstants.ERROR_CODES.EBAZ000187 ||
          apierror?.errors?.[0]?.code === ErrorCodeConstants.ERROR_CODES.EBAZ000163
        ) {
          errorId = 'E0353';
        }
        const errorInfo = {
          errorType: ErrorType.BUSINESS_LOGIC,
          errorMsgId: errorId,
          apiErrorCode: this._common.apiError?.errors?.[0].code,
        };
        this._errorsHandlerSvc.setNotRetryableError(errorInfo);
      }
    );
  }
}
