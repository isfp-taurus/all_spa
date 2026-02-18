import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { apiEventAll, fixedArrayCache } from '@common/helper';
import { PaymentMethodsType } from '@common/interfaces/common/payment-methods';
import {
  CurrentCartStoreService,
  DeliveryInformationStoreService,
  GetOrderStoreService,
  OrdersPaymentRecordsStoreService,
  PaymentInputStoreService,
  PlanListService,
  LocalPlanService,
} from '@common/services';
import { DeliveryInformationState, OrdersPaymentRecordsState } from '@common/store';
import { RoutesResRoutes } from '@conf/routes.config';
import { SupportClass } from '@lib/components/support-class';
import { AlertMessageItem, AlertType, ErrorType, LogType, PageType } from '@lib/interfaces';
import {
  AswMasterService,
  CommonLibService,
  ErrorsHandlerService,
  LoadScriptService,
  LoggerDatadogService,
  ModalService,
  PageLoadingService,
} from '@lib/services';
import { Subscription, timer, fromEvent, takeWhile, interval, BehaviorSubject } from 'rxjs';
import {
  LinkPayloadInner,
  OrdersPaymentRecordsRequest,
  PaymentRequestAuthorization,
  PaymentRequestAuthorizationPaymentRedirectionContext,
  PaymentRequestAuthorizationPaymentResumption,
  PaymentRequestAuthorizationPaymentResumptionLink,
  PaymentRequestAuthorizationPaymentResumptionLinkPayloadInner,
  PaymentRequestGeneralPaymentMethod,
  PaymentRequestPayerIdentification,
  PaymentRequestPayerIdentificationBrowser,
  PaymentRequestPayerIdentificationContact,
  PaymentRequestPaymentCard,
  PaymentRequestSkycoin,
  PlansDeletePlansRequest,
} from 'src/sdk-reservation';
import { PaymentRequestAlternativePaymentMethod, TypeErrorsInnerSource } from 'src/sdk-servicing';
import { PaymentInputPresService } from './payment-input-pres.service';
import { RegisteredCardTypeEnum } from '../sub-components/payment-input-common/payment-input-card-selecting/payment-input-card-selecting.state';
import {
  CardinalResponse,
  PaymentInputPresTicketingServiceParam,
  PaymentInputSetupCompleteData,
} from './payment-input-pres.state';
import {
  AnaSkyCoinInfo,
  PaymentInputCardInfo,
  PaymentInputCardHolderInfo,
  PreviousScreenHandoverInformation,
  initPreviousScreenHandoverInformation,
} from '../container';
import { ShareholderCouponsType } from '@common/interfaces';
import { RoutesCommon } from '@conf/routes.config';
import { ErrorCodeConstants } from '@conf/app.constants';

@Injectable({ providedIn: 'root' })
export class PaymentInputPresTicketingService extends SupportClass {
  // 購入発券APIリクエストパラメータ
  private _ordersPaymentRecordsReqParam: OrdersPaymentRecordsRequest = {} as OrdersPaymentRecordsRequest;
  // Cardinal決済判定
  private _is3DSPayment = false;
  // CardinalセッションID
  private _cardinalSeccionId: string = '';
  // keep my fareであるかどうか
  private _isKeepMyFare: boolean = false;
  // いつもの支払い方法登録チェックがチェックされているかどうか
  private _isSaveAsUsualChecked: boolean = false;
  // いつもの支払い方法登録チェックがチェックされているかどうか(インターネットバンキング)
  private _isBankSaveAsUsualChecked: boolean = false;
  // 前画面引継情報
  private _prevScreenInfo: PreviousScreenHandoverInformation = initPreviousScreenHandoverInformation();
  // 選択されている支払方法
  private _selectedPaymentMethod: PaymentMethodsType = 'CD';
  // 使用されているsky coin
  private _totalUseCoin: number = 0;
  // 名義人情報
  private _issueReceipt: string = '';
  // クレジットカード併用が選択されているかどうか
  private _isCreditCardCombination: boolean = false;
  // sky coin併用が選択されているかどうか
  private _isAnaSkyCoinCombination: boolean = false;
  // 銀行コード
  private _bankCode: string = '';

  //FY25追加
  /** 予約のみ識別子 */
  private _isReservationOnly? = false;
  /** 空席待ち予約識別子 */
  private _isWaitlisted? = false;
  /** 株主優待情報 */
  private _isContainedShareholdersBenefitDiscountFare: boolean = false;
  private _shareholderCoupons?: Array<ShareholderCouponsType>;
  /** AMOP支払中判定フラグ */
  private _isPaying$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private _common: CommonLibService,
    private _ordersPaymentRecordsStoreService: OrdersPaymentRecordsStoreService,
    private _errorsHandlerService: ErrorsHandlerService,
    private _aswMasterService: AswMasterService,
    private _loadScriptService: LoadScriptService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _loggerService: LoggerDatadogService,
    private _modalService: ModalService,
    private _getOrderStoreService: GetOrderStoreService,
    private _planListService: PlanListService,
    private _deliveryInformationStoreService: DeliveryInformationStoreService,
    private _router: Router,
    private _paymentInputPresService: PaymentInputPresService,
    private _paymentInputStoreService: PaymentInputStoreService,
    private _ngZone: NgZone,
    private _pageLoadingService: PageLoadingService,
    private _localPlanService: LocalPlanService
  ) {
    super();
  }

  private _setParam(param: PaymentInputPresTicketingServiceParam) {
    this._selectedPaymentMethod = param.selectedPaymentMethod;
    this._isCreditCardCombination = param.isCreditCardCombination;
    this._totalUseCoin = param.totalUseCoin;
    this._bankCode = param.bankCode;
    this._isKeepMyFare = param.isKeepMyFare;
    this._issueReceipt = param.issueReceipt;
    this._isSaveAsUsualChecked = param.isSaveAsUsualChecked;
    this._isBankSaveAsUsualChecked = param.isBankSaveAsUsualChecked;
    this._isReservationOnly = param.isReservationOnly;
    this._isWaitlisted = param.isWaitlisted;
    this._isContainedShareholdersBenefitDiscountFare = param.isContainedShareholdersBenefitDiscountFare;
    this._shareholderCoupons = param.shareholderCoupons;
    this._prevScreenInfo = param.prevScreenInfo;
  }

  /**
   * AMOP支払中状態を取得する
   */
  public getPayingStatus$() {
    return this._isPaying$.asObservable();
  }

  /**
   * 購入発券処理
   */
  public executePaymentRecords(param: PaymentInputPresTicketingServiceParam, deviceId: string) {
    this._pageLoadingService.startLoading(false);
    // 関数実行用パラメータ代入
    this._setParam(param);
    // 5.3Dセキュア決済判定初期設定 (false：3DS無)
    this._is3DSPayment = false;
    // 6.購入発券API実行のためのパラメータを作成
    this._ordersPaymentRecordsReqParam = this._createPaymentRecordsRequestParameters(
      param.selectedCard,
      param.cardInfo,
      param.holderInfo,
      deviceId
    );
    this._ordersPaymentRecordsReqParam;
    // 6.購入発券API実行(1回目)の実行
    apiEventAll(
      () => {
        this._ordersPaymentRecordsStoreService.setOrdersPaymentRecordsFromApi(this._ordersPaymentRecordsReqParam);
      },
      this._ordersPaymentRecordsStoreService.getOrdersPaymentRecords$(),
      (response) => {
        // 1.1.28 - 9.以下、購入発券が正常に行われたときの処理
        const warning = response.warnings;
        if (warning !== undefined && warning.length > 0) {
          if (warning[0].code === ErrorCodeConstants.ERROR_CODES.WBAZ000199) {
            // 1.1.28 3DS認証前処理
            this._preCardinalAuthentication1(response);
          } else {
            // 1.1.31 完了後処理を行う
            this._postCompletion(response);
          }
        } else {
          // 1.1.31 完了後処理を行う
          this._postCompletion(response);
        }
      },
      () => {
        // 異常系処理の際に支払情報入力画面 store 内のfareDiscountIdsをクリア
        this._paymentInputStoreService.setPaymentInput({
          ...this._paymentInputStoreService.paymentInputData,
          fareDiscountIds: undefined,
        });
        this._paymentRecordsError();
        this._pageLoadingService.endLoading();
      }
    );
  }

  /**
   * Cardinalを利用した3DS認証前処理1
   * @param response 購入発券APIレスポンス
   */
  private _preCardinalAuthentication1(response: OrdersPaymentRecordsState) {
    // 株主優待情報と紐づくfareDiscountIdsの値を支払情報入力画面 store 内で保持
    this._paymentInputStoreService.setPaymentInput({
      ...this._paymentInputStoreService.paymentInputData,
      fareDiscountIds: response.data?.fareDiscountIds,
    });
    // cardinal関連のsongbird.jsのローディング
    this._loadScriptService
      .load$(this._aswMasterService.getMPropertyByKey('cardinal', 'script.url'), true)
      .subscribe((path: any) => {
        if (path) {
          // Cardinal.configure
          this._ngZone.run(() => {
            (window as any).Cardinal.configure({
              // Cardinal接続タイムアウトの時間
              timeout: this._aswMasterService.getMPropertyByKey('cardinal', 'timeout.millisecond.cardinal') ?? '',
              // Cardinalコンソールログ出力(off：コンソールへのロギングは有効にならない／on：トランザクション中に発生したことに関する情報の提供を受ける)
              logging: {
                level: this._aswMasterService.getMPropertyByKey('cardinal', 'logging.level'),
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
                  response.data?.paymentRequest?.authorization?.paymentRedirectionContext?.encrypted3DSToken || ''
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
                  this.cardinalResponseEvent(setupCompleteData);
                });
              }
            );
          });
        } else {
          this._loggerService.operationConfirmLog('EXT0001');
          this._errorsHandlerService.setRetryableError(PageType.PAGE, { errorMsgId: 'E1134' });
          this._pageLoadingService.endLoading();
        }
      });
  }

  /**
   * カーディナル受信後の処理
   * @param setupCompleteData 受信データ
   * @returns
   */
  cardinalResponseEvent(setupCompleteData: PaymentInputSetupCompleteData) {
    // 4.3 Cardinalの返却値をログに出力する
    this._loggerService.info(LogType.PAGE_VIEW, { response: setupCompleteData }, false);
    const modulesValid = (): boolean => {
      const vaild = setupCompleteData.modules.find((data: any) => {
        return data.module === 'CCA' && data.loaded;
      });
      return !!vaild;
    };
    // Cardinalレスポンス.sessionIdが存在しない、または“”(空欄)
    if (!setupCompleteData.sessionId || !modulesValid()) {
      this._loggerService.operationConfirmLog('EXT0003');
      this._loggerService.error(LogType.PAGE_VIEW, { errMsg: 'Cardinal Communication Error!' }, false);
      // 継続不可能エラー(処理終了)
      this._cardinalNotRetryableHandle();
      return;
    }
    // 4.5 CardinalセッションIDを保存する
    this._cardinalSeccionId = setupCompleteData.sessionId;
    // 5.Cardinal決済判定をTRUEにする
    this._is3DSPayment = true;
    // 6.購入発券API実行のためのパラメータを作成
    const params: OrdersPaymentRecordsRequest = this._createPaymentRecordsRequestParameters2();
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
            this._preCardinalAuthentication2(response);
          } else {
            // 1.1.31 完了後処理を行う
            this._postCompletion(response);
          }
        } else {
          // 1.1.31 完了後処理を行う
          this._postCompletion(response);
        }
      },
      () => {
        this._pageLoadingService.endLoading();
        this._paymentRecordsError();
      }
    );
  }

  /**
   * 購入発券API実行のためのリクエストパラメータを作成
   * @returns 購入発券APIリクエストパラメータ
   */
  private _createPaymentRecordsRequestParameters(
    selectedCard: RegisteredCardTypeEnum,
    cardInfo: PaymentInputCardInfo,
    holderInfo: PaymentInputCardHolderInfo,
    deviceId: string
  ): OrdersPaymentRecordsRequest {
    let orderId = this._prevScreenInfo.orderId;
    let firstName: string | undefined = this._prevScreenInfo.credential.firstName;
    let lastName: string | undefined = this._prevScreenInfo.credential.lastName;

    // 支払総額取得
    const totalPrice: number =
      this._getOrderStoreService.getOrderData.data?.prices?.totalPrices?.total?.[0]?.value ?? 0;
    // 特典フラグ
    const isAwardBooking: boolean = this._getOrderStoreService.getOrderData.data?.orderType?.isAwardBooking ?? false;

    // 特典かつ徴収0円
    const zeroPFC = isAwardBooking && totalPrice === 0;
    // 特典かつ徴収0円の場合、法人カードと同様にダミー値を固定で設定する
    const paymentCardDummy = { holderName: 'DUMMY NAME', expiryDate: '209906' };

    // ストアの代表者情報を取得
    const represent = this._currentCartStoreService?.CurrentCartData.data?.plan?.contacts?.representative;
    const emailAddress = represent?.emails?.[0]?.address ?? '';
    const phoneCountryPhoneExtension = represent?.phones?.[0]?.countryPhoneExtension ?? '';
    const phoneNumber = represent?.phones?.[0]?.number ?? '';
    // 特典かつ徴収0円の場合、支払者識別情報はストアの代表者情報で設定する
    const holderInfoDummy: PaymentInputCardHolderInfo = {
      email: emailAddress ?? '',
      phone: {
        countryPhoneExtension: phoneCountryPhoneExtension ?? '',
        number: phoneNumber ?? '',
      },
    };
    const payerIdentificationDummy = this._paymentInputPresService.getPayerIdentificationInfo(
      holderInfoDummy,
      deviceId
    );

    // クレジットカード決済対象の場合にクレジットカード情報を設定
    const paymentCard: PaymentRequestPaymentCard | undefined = this._paymentInputPresService.isCreditCard(
      this._isCreditCardCombination,
      this._selectedPaymentMethod
    )
      ? this._paymentInputPresService.getPaymentCardInfo(selectedCard, cardInfo)
      : undefined;
    // 支払者識別情報
    const payerIdentification: PaymentRequestPayerIdentification | undefined =
      this._paymentInputPresService.isCreditCard(this._isCreditCardCombination, this._selectedPaymentMethod)
        ? this._paymentInputPresService.getPayerIdentificationInfo(holderInfo, deviceId)
        : undefined;
    // GMOP情報
    let gmopPaymentMethod: PaymentRequestGeneralPaymentMethod.PaymentMethodEnum | undefined;
    // 銀行選択の値
    let bankCode: string = '';
    // いつもの支払方法登録チェック識別子
    let isUsualPaymentMthod = false;
    switch (this._selectedPaymentMethod) {
      case PaymentMethodsType.CONVENIENCE_STORE:
        gmopPaymentMethod = PaymentRequestGeneralPaymentMethod.PaymentMethodEnum.ConvenienceStore;
        isUsualPaymentMthod = this._isSaveAsUsualChecked ?? false;
        break;
      case PaymentMethodsType.PAY_EASY:
        gmopPaymentMethod = PaymentRequestGeneralPaymentMethod.PaymentMethodEnum.PayEasy;
        break;
      case PaymentMethodsType.CREDIT_CARD:
        isUsualPaymentMthod = this._isSaveAsUsualChecked ?? false;
        break;
      case PaymentMethodsType.ANA_SKY_COIN:
        if (this._isCreditCardCombination) {
          isUsualPaymentMthod = this._isSaveAsUsualChecked ?? false;
        }
        break;
      default:
        break;
    }
    const params: OrdersPaymentRecordsRequest = {
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
        paymentCard: zeroPFC ? paymentCardDummy : paymentCard,
        // 支払者識別情報
        payerIdentification: zeroPFC ? payerIdentificationDummy : payerIdentification,
        // GMOP情報
        generalPaymentMethod: gmopPaymentMethod
          ? gmopPaymentMethod === 'internetBanking'
            ? { paymentMethod: gmopPaymentMethod, bankCode: bankCode } // インターネットバンキングの場合はbankCodeのキー設定
            : { paymentMethod: gmopPaymentMethod } // インターネットバンキング以外はbankCodeのキー含めない
          : undefined,
        shareholderCoupons: this._shareholderCoupons,
      },
      // 領収書宛名
      receiptAddress: this._paymentInputPresService.isCreditCard(
        this._isCreditCardCombination,
        this._selectedPaymentMethod
      )
        ? this._issueReceipt
        : undefined,
      // Keep My Fare利用フラグ
      isKeepMyFare: this._isKeepMyFare,
      // 予約基本情報の支払方法更新要否
      updateBasicPaymentMethod: isUsualPaymentMthod,

      // 以下はFY25追加のリクエストデータです
      // 「sdk-reservation」を手動で更新された
      isReservationOnly: this._isReservationOnly,
      isWaitlisted: this._isWaitlisted,
      //株主優待情報に紐づくID
      fareDiscountIds: this._paymentInputStoreService.paymentInputData.fareDiscountIds,
    };

    // クレジットカード情報のパラメーターの送信有無
    if (!this._isContainedShareholdersBenefitDiscountFare) {
      // 株主優待が表示されていない場合はshareholderCouponsのキーを削除
      delete params.paymentRequest.shareholderCoupons;
    }

    if (zeroPFC) {
      // PFCが0円の場合、パラメータの領収書宛名を削除
      delete params.receiptAddress;
    }

    return params;
  }

  /**
   * AMOP認証前処理
   */
  private _preAmopAuthentication1(response: OrdersPaymentRecordsState) {
    this._isPaying$.next(true);
    // postMessageの受信
    this.subscribeService('amopPostMessage', fromEvent<MessageEvent>(window, 'message'), (message: MessageEvent) => {
      // 送信元のオリジンと現在のドメインが一致しない場合は処理しない
      if (window.location.origin !== message.origin) {
        return;
      }

      // データ内のメッセージタイプが paymentInputAmopMessage 以外は処理しない
      if (message.data?.messageType !== 'paymentInputAmopMessage') {
        return;
      }

      let paymentResumptionLink: PaymentRequestAuthorizationPaymentResumptionLink = { href: '', method: 'GET' };

      // 引数のパラメーターが入っている場合
      if (message.data?.params && Object.keys(message.data?.params).length > 0) {
        paymentResumptionLink = {
          href: message.data.url,
          method: message.data.method,
          payload: Object.entries(message.data.params).map(
            ([key, value]) =>
              ({
                name: key,
                value: value as string,
              } as PaymentRequestAuthorizationPaymentResumptionLinkPayloadInner)
          ),
        };
      }

      // postMessageのサブスクリプション解除
      this.deleteSubscription('amopPostMessage');

      // 5.Alipay、銀聯、PayPal認証後処理を行う。
      this._preAmopAuthentication2(paymentResumptionLink);
    });

    // フォーム作成
    this.createAmopForm(response);
  }

  /**
   * 外部支払いサイト遷移用フォーム作成
   *
   * 外部支払いサイトへ遷移するためのフォームを作成する
   * 別タブを開きそこに対してフォーム送信を行い、外部支払いサイトを表示する
   */
  private createAmopForm(response: OrdersPaymentRecordsState): void {
    let url: string = '';
    let payload: Array<LinkPayloadInner> = [];
    let method: string = '';

    // payloadが入っていない場合はクエリストリングを分解して取得する
    if (!response.data?.link?.payload || response.data?.link?.payload?.length === 0) {
      // urlを分解
      const splitUrl: string[] = response.data?.link?.href?.split('?') as string[];

      // url取得
      url = splitUrl[0];

      // urlを分解してクエリストリングがとれている場合
      if (splitUrl.length > 1) {
        // クエリストリングを取得してパラメーターをKeyValue形式にする
        splitUrl[1].split('&').map((parameter: string) => {
          const items = parameter.split('=');
          const item: LinkPayloadInner = {
            name: items[0],
            value: items[1],
          };
          payload.push(item);
        });
      }

      // メソッド取得
      method = response.data?.link?.method as any; // as string
    } else {
      // url取得
      url = response.data?.link?.href as string;

      // payloadが入っている場合はその値を取得
      payload = response.data?.link?.payload as LinkPayloadInner[];

      // メソッド取得
      method = response.data?.link?.method as any; // as string
    }

    // フォームエレメントの生成
    const form: HTMLFormElement = document.createElement('form');

    // フォームの設定
    form.action = url;
    form.method = method;
    form['rel'] = 'opener';
    form.className = 'paymentInputAmopForm';
    form.target = 'paymentInputAmopTab';

    const myElement: any = document.querySelector('asw-payment-input-cont');

    // フォームを挿入する
    myElement?.insertAdjacentHTML('afterbegin', form.outerHTML);

    // フォームのサブミットイベントをリッスンする
    myElement?.querySelector('form.paymentInputAmopForm')?.addEventListener('formdata', (e: FormDataEvent) => {
      const fd: FormData = e.formData;

      // データをセット
      payload.forEach((item: LinkPayloadInner) => {
        if (item.value) {
          fd.set(item.name, item.value);
        }
      });

      return;
    });

    // ストレージクリア
    localStorage.removeItem('paymentInputAmopStatus');

    // 名前付きで空のタブを生成
    const amopTab: Window | null = window.open('', 'paymentInputAmopTab');

    // 作ったフォームをサブミット
    myElement?.querySelector('form.paymentInputAmopForm')?.submit();

    // フォームを削除する
    myElement?.querySelector('form.paymentInputAmopForm')?.remove();

    // 子タブの開閉状態ポーリング
    this.subscribeService('amopTabPolling', interval(1000), () => {
      // タブが開いていない
      if (amopTab === null) {
        // サブスクリプション削除
        this.deleteSubscription('amopTabPolling');
        this.deleteSubscription('amopPostMessage');
        this._isPaying$.next(false);
        // ローディング終了
        this._pageLoadingService.endLoading();
        return;
      }

      //　タブが開いている
      if (!amopTab.closed) {
        // 何もしない。支払中と判断
        return;
      }

      // タブが閉じられた場合
      if (amopTab.closed) {
        // サブスクリプション削除
        this.deleteSubscription('amopTabPolling');
        this.deleteSubscription('amopPostMessage');

        // ストレージからステータス取得
        const amopStatus: string | null = localStorage.getItem('paymentInputAmopStatus');

        // ストレージクリア
        localStorage.removeItem('paymentInputAmopStatus');

        // payment-input-amop-response-blank-pageまで到達する前に閉じられた場合
        if (amopStatus === null) {
          this._isPaying$.next(false);
          // ローディング終了
          this._pageLoadingService.endLoading();
        }
      }
    });
  }

  /**
   * AMOP認証後処理
   */
  private _preAmopAuthentication2(link: PaymentRequestAuthorizationPaymentResumptionLink) {
    // 2.タブを閉じる。
    if (this._selectedPaymentMethod === PaymentMethodsType.PAYPAL) {
      // 3.選択中支払方法="PP"(PayPal)、認証結果情報.parametersのname="PayerID"の件数=0の場合、処理を終了する。
      if ((link.payload?.filter((parameter) => parameter.name === 'PayerID').length ?? 0) === 0) {
        this._isPaying$.next(false);
        this._pageLoadingService.endLoading();
        return;
      }
    }

    // 4.購入発券APIリクエスト情報に以下の内容を追加し、以下の内容で、購入発券API(2回目)を実行する。
    const params: OrdersPaymentRecordsRequest = this._createPaymentRecordsRequestParametersAmop(link);
    apiEventAll(
      () => {
        this._ordersPaymentRecordsStoreService.setOrdersPaymentRecordsFromApi(params);
      },
      this._ordersPaymentRecordsStoreService.getOrdersPaymentRecords$(),
      (response) => {
        // 購入発券(2回目)レスポンスを購入発券結果情報として保持し、完了後処理を行う。
        this._postCompletion(response);
      },
      () => {
        this._paymentRecordsError();
        this._isPaying$.next(false);
        this._pageLoadingService.endLoading();
      }
    );
  }

  /**
   * AMOP認証後処理
   * 購入発券API(2回目)実行のためのリクエストパラメータを作成
   * @param link 外部サイト用支払認証HTTPリクエスト情報（レスポンス用）
   * @returns 購入発券APIリクエストパラメータ
   */
  private _createPaymentRecordsRequestParametersAmop(
    link: PaymentRequestAuthorizationPaymentResumptionLink
  ): OrdersPaymentRecordsRequest {
    const authorization: PaymentRequestAuthorization = {
      paymentResumption: {
        link: link,
      },
    };
    this._ordersPaymentRecordsReqParam.paymentRequest.authorization = authorization;
    return this._ordersPaymentRecordsReqParam;
  }

  /**
   * 完了後処理
   * @param responsePaymentRecords 購入発券APIレスポンス
   */
  private _postCompletion(responsePaymentRecords: OrdersPaymentRecordsState) {
    // ログイン済みの場合、会員情報を取得する
    if (!this._common.isNotLogin()) {
      this.subscribeService(
        'GetMemberInformationApi_passengerInformationRequest',
        this._common.amcMemberStoreService.saveMemberInformationToAMCMember$(),
        (result) => {
          this._common.aswContextStoreService.updateAswContext({});
        }
      );
    }

    const cartId = this._currentCartStoreService.CurrentCartData.data?.cartId;
    if (cartId && this._common.isNotLogin()) {
      const param: PlansDeletePlansRequest = {
        cartIds: [cartId],
      };
      // プラン削除API実行
      this._planListService.deletePlans(param, undefined, true);
      // 【RM #49723】ローカルプラン削除処理実行
      const localPlanList = this._localPlanService.getLocalPlans() ?? {};
      // 操作中カートとcartIdが一致するプランを検索
      const index = localPlanList?.plans?.findIndex((plan) => plan.cartId === cartId);
      // 一致するプランが存在する場合、削除して上書き
      if (typeof index !== 'undefined' && index !== -1) {
        localPlanList?.plans?.splice(index, 1);
        this._localPlanService.setLocalPlans(localPlanList);
      }
    }
    this._ngZone.run(() => {
      this._pagetransitionToBookingComplete(responsePaymentRecords);
    });
  }

  /**
   * 購入発券API(1回目)実行時のエラー処理
   */
  private _paymentRecordsError() {
    // ASWDB(マスタ)から決済エラー取得
    this.subscribeService(
      'paymentInputPres_getPaymentError',
      this._aswMasterService.load(
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
        const subErr = source?.items?.[0] ?? '';
        if (data[0]) {
          const errInfo = data[0]?.[apiErr]?.[subErr]?.[0];

          if (errInfo) {
            const messageId = errInfo.message_id;
            this._errorsHandlerService.setRetryableError(PageType.PAGE, {
              errorMsgId: messageId,
              apiErrorCode: apiErr,
            });
            return;
          }
        }
        const result = this._paymentInputPresService.getPaymentRecordsErrorCode(apiErr, this._selectedPaymentMethod);
        if (result.isRetryable) {
          // 継続可能エラー
          this._errorsHandlerService.setRetryableError(PageType.PAGE, {
            errorMsgId: result.errMsg,
            apiErrorCode: apiErr,
          });
        } else {
          // 継続不可エラー (ブラウザバック）
          // EBAZ000842の場合
          if (apiErr === ErrorCodeConstants.ERROR_CODES.EBAZ000842) {
            this._router.navigate([RoutesCommon.BROWSER_BACK_ERROR]);
            return;
          }

          // 継続不可能エラー (businessLogic）

          // エラーメッセージが入っている場合
          if (result.errMsg) {
            this._errorsHandlerService.setNotRetryableError({
              errorType: ErrorType.BUSINESS_LOGIC, // ビジネスロジックエラー
              errorMsgId: result.errMsg, // エラーメッセージID
              apiErrorCode: apiErr, // APIエラーレスポンス情報
            });
          } else {
            // システムエラーへ飛ばす
            this._errorsHandlerService.setNotRetryableError({
              errorType: ErrorType.SYSTEM, // システムロジックエラー
              apiErrorCode: apiErr, // APIエラーレスポンス情報
            });
          }
        }
      }
    );
  }

  /**
   * 購入発券API(2回目)実行のためのリクエストパラメータを作成
   * @returns 購入発券APIリクエストパラメータ
   */
  private _createPaymentRecordsRequestParameters2(): OrdersPaymentRecordsRequest {
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
   * セットアップ完了タイマー
   * @returns timer subscription
   */
  private _cardinalClientTimeoutHandle(): Subscription {
    const timeoutValuetemp = Number(this._aswMasterService.getMPropertyByKey('cardinal', 'timeout.millisecond.client'));
    const timeoutValue: number = isNaN(timeoutValuetemp) ? 0 : timeoutValuetemp;
    return timer(timeoutValue).subscribe(() => {
      this._ngZone.run(() => {
        (window as any).Cardinal.off('payments.setupComplete');
        this._loggerService.operationConfirmLog('EXT0002');
        this._cardinalNotRetryableHandle();
      });
    });
  }

  /**
   * cardinal継続不可能エラー設定
   */
  private _cardinalNotRetryableHandle() {
    this._errorsHandlerService.setNotRetryableError({
      errorType: ErrorType.BUSINESS_LOGIC, // ビジネスロジックエラー
      errorMsgId: 'E0398', // Cardinalエラー
    });
  }

  /**
   * Cardinalを利用した3DS認証前処理2
   * @param response 購入発券APIレスポンス
   */
  private _preCardinalAuthentication2(response: OrdersPaymentRecordsState) {
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
            // 3DS認証モーダルを閉じたタイミングでローディングを開始する
            this._pageLoadingService.startLoading(false);

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
            this._cardinalAuthorizationPostProcessing();
          });
        }
      );
    });
  }

  /**
   * 3DS認証の認証コード入力後の処理
   */
  private _cardinalAuthorizationPostProcessing() {
    // 3DS認証キャンセル判定
    if (this._paymentInputStoreService.paymentInputData.challengeCancel === '01') {
      // ユーザ認証キャンセルの場合
      this._pageLoadingService.endLoading();
      return;
    }
    const errorNumber = Number(this._aswMasterService.getMPropertyByKey('cardinal', 'errorNumberList.success'));
    const errorDescriptioPatern = new RegExp(
      this._aswMasterService.getMPropertyByKey('cardinal', 'errorDescriptionRegex.success')
    );
    // エラーチェック
    if (
      errorNumber !== this._paymentInputStoreService.paymentInputData.errorNumber ||
      !errorDescriptioPatern.test(this._paymentInputStoreService.paymentInputData.errorDescription ?? '') ||
      !this._paymentInputStoreService.paymentInputData.jwtToken
    ) {
      this._errorsHandlerService.setRetryableError(PageType.PAGE, { errorMsgId: 'E0397' });
      this._pageLoadingService.endLoading();
      return;
    }
    // 6.購入発券API実行のためのパラメータを作成
    const params: OrdersPaymentRecordsRequest = this._createPaymentRecordsRequestParameters3();
    // 6.購入発券API実行(3回目)の実行
    apiEventAll(
      () => {
        this._ordersPaymentRecordsStoreService.setOrdersPaymentRecordsFromApi(params);
      },
      this._ordersPaymentRecordsStoreService.getOrdersPaymentRecords$(),
      (response) => {
        this._pageLoadingService.endLoading();
        // 1.1.31 完了後処理を行う
        this._postCompletion(response);
      },
      () => {
        this._pageLoadingService.endLoading();
        this._paymentRecordsError();
      }
    );
  }

  /**
   * 購入発券API(3回目)実行のためのリクエストパラメータを作成
   * @returns 購入発券APIリクエストパラメータ
   */
  private _createPaymentRecordsRequestParameters3(): OrdersPaymentRecordsRequest {
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
   * 予約・購入完了画面への遷移
   * @param response 購入発券APIレスポンス
   */
  private _pagetransitionToBookingComplete(response: OrdersPaymentRecordsState) {
    const warnings: AlertMessageItem[] = [];
    let messageId = '';
    // ワーニング情報リスト作成
    response.warnings?.forEach((warning) => {
      switch (warning.code) {
        case ErrorCodeConstants.ERROR_CODES.WBAZ000203: // DxAPIから航空券・EMD発券ワーニングが返却された場合
          messageId = 'W0530';
          break;
        case ErrorCodeConstants.ERROR_CODES.WBAZ000206: // SK登録失敗ワーニングの場合
          messageId = 'W0944';
          break;
        case ErrorCodeConstants.ERROR_CODES.WBAZ000207: // プランの削除に失敗した場合)
          messageId = 'W0946';
          break;
        case ErrorCodeConstants.ERROR_CODES.WBAZ000210: // 完了メール(購入完了メールまたは予約完了メール)の送信に失敗した場合)
        case ErrorCodeConstants.ERROR_CODES.WBAZ000211: // IRメールの送信に失敗した場合
          messageId = 'W0169';
          break;
        case ErrorCodeConstants.ERROR_CODES.WBAZ000428: // 予約基本情報の新規登録対象として指定されたクレジットカード番号が、既に登録済みのクレジットカード番号と重複した場合
          messageId = 'W0736';
          break;
        case ErrorCodeConstants.ERROR_CODES.WBAZ000212: // 予約基本情報の更新に失敗した場合
          messageId = 'W0533';
          break;
        case ErrorCodeConstants.ERROR_CODES.WBAZ000523: // 有効な離島カードが登録されていない場合
          messageId = 'W1012';
          break;
        case ErrorCodeConstants.ERROR_CODES.WBAZ000524: // 有効な障がい者手帳が登録されていない場合
          messageId = 'W1013';
          break;
        case ErrorCodeConstants.ERROR_CODES.WBAZ000520: // 発着通知メールアドレスのRM登録に失敗した場合
          messageId = 'W1846';
          break;
        // FY25 追加END -------------------------------------------
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
    // 4 予約・購入完了画面へ引き継ぐ情報
    let _deliveryInformationState: DeliveryInformationState = {
      paymentInformation: {
        orderStatus: response.data?.orderStatus ?? '',
        is3DSPayment: this._is3DSPayment,
        paymentMethod: this._selectedPaymentMethod,
        // FY25 追加START------------------------------------------------------
        // 「DeliveryInformationModel」にある「DeliveryInformationPaymentInformation」インタフェースが
        // 「isWaitlisted」をStoreに追加済
        isWaitlisted: this._isWaitlisted,
        // FY25 追加END--------------------------------------------------------
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

  destroy() {}
}
