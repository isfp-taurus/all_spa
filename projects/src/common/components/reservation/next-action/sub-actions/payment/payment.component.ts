import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NextActionBankLang } from '@common/services/next-action/master/bank-lang';
import { NEXT_ACTION_LOAD_MASTERS } from '@common/services/next-action/master/next-action-master';
import { NextActionService } from '@common/services/next-action/next-action.service';
import { AmountFormatPipe } from '@lib/pipes/amount-format/amount-format.pipe';
import { DateFormatPipe } from '@lib/pipes/date-format/date-format.pipe';
import { CommonLibService } from '@lib/services/common-lib/common-lib.service';
import { AswContextState } from '@lib/store/asw-context/asw-context.state';
import { BehaviorSubject, combineLatestWith, Subscription } from 'rxjs';
import {
  GetOrderResponseData,
  GetOrderResponseDataAir,
  GetOrderResponseDataNextActionsOfflinePaymentDetails,
} from 'src/sdk-servicing';
import {
  PAYMENT_DEADLINE_LABEL_MONGON_VALUES,
  PAYMENT_GUIDE_LABEL_EXPIRED_MONGON_VALUES,
  PAYMENT_GUIDE_LABEL_NON_EXPIRED_MONGON_VALUES,
  PAYMENT_METHOD_LABEL_MONGON_VALUES,
  PAYMENT_METHOD_MONGON_VALUES,
  TOTAL_AMOUNT_LABEL_MONGON_VALUES,
} from './payment.component.constant';

/** 払込 */
@Component({
  selector: 'asw-payment',
  templateUrl: './payment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentComponent implements OnInit, OnDestroy {
  @ViewChild('template', { static: true })
  template!: TemplateRef<unknown>;
  private _subcriptions = new Subscription();
  canBeClickedNext = true;

  isDisplayed!: boolean;
  /** 収納機関番号 */
  receivingInstitutionNumber: string = '';
  /** 確認番号 */
  payeasyConfirmationNumber: string = '';

  /** 払込案内期限超過の旨 */
  paymentGuideLabel: string = '';
  paymentGuideLabelReader: string = '';
  displayTheRest!: boolean;
  /** これから支払う総額 */
  totalAmount!: string;
  totalAmountLabel: string = '';
  displayPaymentDeadline!: boolean;
  /** 払込期限 */
  paymentDeadline!: string;
  /** 払込期限ラベル */
  paymentDeadlineLabel: string = '';
  /** 払込方法 */
  paymentMethod!: string;
  paymentMethodLabel: string = '';
  displayBank!: boolean;
  /** 銀行名 */
  bankName!: string;
  displayPaymentNumber!: boolean;
  /**
   * 決済番号 / お客様番号
   */
  paymentNumber!: string;
  displayPayeasy!: boolean;

  pnr$ = new BehaviorSubject<GetOrderResponseData>({});
  @Input() canBeClicked: boolean = true;
  @Input() set pnr(pnr: GetOrderResponseData) {
    this.updatePaymentDisplay(pnr);
    this.pnr$.next(pnr);
  }

  constructor(
    private readonly _nextActionService: NextActionService,
    private readonly _amountFormatPipe: AmountFormatPipe,
    private readonly _dateFormatPipe: DateFormatPipe,
    private readonly _common: CommonLibService,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this._viewContainerRef.createEmbeddedView(this.template);
    this._subcriptions.add(
      this.pnr$
        .pipe(
          combineLatestWith(
            this._common.aswContextStoreService.getAswContext$(),
            // 銀行(国際化)
            this._common.aswMasterService.getAswMasterByKey$(NEXT_ACTION_LOAD_MASTERS.BANK_LANG.key)
          )
        )
        .subscribe((inputs: [GetOrderResponseData, AswContextState, NextActionBankLang]) => {
          this.bankName = this.getBankName(inputs[0], inputs[1], inputs[2]);
          this._cdr.markForCheck();
        })
    );

    // 1.	Pay-Easy収納機関番号取得処理
    // 1.1.	以下の条件でASWDBの「プロパティ」テーブルから情報を取得する。
    this.receivingInstitutionNumber = this._common.aswMasterService.getMPropertyByKey(
      'paymentRelated',
      'payeasy.receivingInstitutionNumber'
    );
  }

  updatePaymentDisplay(pnr: GetOrderResponseData) {
    this.isDisplayed = this.getIsDisplayed(pnr);
    this.canBeClickedNext = this.getCanBeClicked(pnr);
    this.displayTheRest = this.getDisplayTheRest(pnr);
    const [paymentGuideLabel, paymentGuideLabelReader] = this.getPaymentGuideLabel(pnr);
    this.paymentGuideLabel = paymentGuideLabel;
    this.paymentGuideLabelReader = paymentGuideLabelReader;
    this.totalAmount = this._amountFormatPipe.transform(...this.getTotalAmount(pnr));
    this.totalAmountLabel = this.getTotalAmountLabel(pnr);
    this.displayPaymentDeadline = this.getDisplayPaymentDeadline(pnr);
    this.paymentDeadline = this._dateFormatPipe.transform(...this.getPaymentDeadline(pnr));
    this.paymentDeadlineLabel = this.getPaymentDeadlineLabel(pnr);
    this.paymentMethod = this.getPaymentMethod(pnr);
    this.paymentMethodLabel = this.getPaymentMethodLabel(pnr);
    this.displayBank = this.getDisplayBank(pnr);
    this.displayPaymentNumber = this.getDisplayPaymentNumber(pnr);
    this.paymentNumber = this.getPaymentNumber(pnr);
    this.displayPayeasy = this.getDisplayPayeasy(pnr);
    // 2.	Pay-easy確認番号取得処理
    // 2.1.	Pay-easy確認番号用プロパティのキー設定
    // 2.2.	以下の条件でASWDBの「プロパティ」テーブルから情報を取得する。
    this.payeasyConfirmationNumber = this._common.aswMasterService.getMPropertyByKey(
      'paymentRelated',
      this.getConfirmationNumberKey(pnr)
    );
  }

  getConfirmationNumberKey(pnr: GetOrderResponseData) {
    // ユーザ共通情報.言語情報 = "ja"(日本語)、かつPNR情報取得API応答.data.air.tripType = "international"(国際旅程)の場合
    if (
      this._common.aswContextStoreService.aswContextData.lang === 'ja' &&
      pnr?.air?.tripType === GetOrderResponseDataAir.TripTypeEnum.International
    ) {
      return 'payeasy.confirmationNumber.international.ja';
    }
    // ユーザ共通情報.言語情報 = "ja"(日本語)、かつPNR情報取得API応答.data.air.tripType = "domestic"(日本国内単独旅程)の場合
    if (
      this._common.aswContextStoreService.aswContextData.lang === 'ja' &&
      pnr?.air?.tripType === GetOrderResponseDataAir.TripTypeEnum.Domestic
    ) {
      return 'payeasy.confirmationNumber.domestic.ja';
    }
    // ユーザ共通情報.言語情報 = "en"(英語)、かつPNR情報取得API応答.data.air.tripType = "international"(国際旅程)の場合
    if (
      this._common.aswContextStoreService.aswContextData.lang === 'en' &&
      pnr?.air?.tripType === GetOrderResponseDataAir.TripTypeEnum.International
    ) {
      return 'payeasy.confirmationNumber.international.en';
    }
    // ユーザ共通情報.言語情報 = "en"(英語)、かつPNR情報取得API応答.data.air.tripType = "domestic"(日本国内単独旅程)の場合
    if (
      this._common.aswContextStoreService.aswContextData.lang === 'en' &&
      pnr?.air?.tripType === GetOrderResponseDataAir.TripTypeEnum.Domestic
    ) {
      return 'payeasy.confirmationNumber.domestic.en';
    }
    // 上記のいずれかに該当しない場合、Pay-easy確認番号に""(空欄)とし、本処理を終了する。
    return '';
  }

  getIsDisplayed(pnr: GetOrderResponseData) {
    return pnr.nextActions?.offlinePaymentDetails?.isExpired === true || pnr.nextActions?.offlinePayment === true;
  }

  getCanBeClicked(pnr: GetOrderResponseData) {
    if (this.canBeClicked) {
      // 1.PNR情報取得API応答.data.nextActions.offlinePaymentDetails.isExpired=true(払込期限超過)の場合、当グループをラベルとして表示する。
      if (pnr.nextActions?.offlinePaymentDetails?.isExpired === true) {
        return false;
      }
      // 2.PNR情報取得API応答.data.nextAction.offlinePayment=true(次に必要なアクションである)の場合、グループ全体をボタンとして表示する。
      if (pnr.nextActions?.offlinePayment === true) {
        return true;
      }
    }
    return false;
  }

  getPaymentGuideLabel(pnr: GetOrderResponseData) {
    const paymentMethod = pnr.nextActions?.offlinePaymentDetails?.paymentMethod ?? '';
    return pnr.nextActions?.offlinePaymentDetails?.isExpired
      ? // PNR情報取得API応答.data.nextActions.offlinePaymentDetails.isExpired=true(払込期限超過)の場合、払込方法に応じて期限超過の旨を表示する文言を表示する。
        PAYMENT_GUIDE_LABEL_EXPIRED_MONGON_VALUES[paymentMethod]
      : // 上記以外の場合、払込方法に応じて払込を行っていただく旨を表示する文言を表示する。
        PAYMENT_GUIDE_LABEL_NON_EXPIRED_MONGON_VALUES[paymentMethod];
  }

  getDisplayTheRest(pnr: GetOrderResponseData) {
    // 以下、PNR情報取得API応答.data.nextActions.offlinePaymentDetails.isExpired=false(払込期限内)の場合に表示する。
    return pnr.nextActions?.offlinePaymentDetails?.isExpired === false;
  }

  getTotalAmount(pnr: GetOrderResponseData): [number, string | undefined, string | undefined] {
    // PNR情報取得API応答.data.prices.totalPrices.total[0].currencyCodeを通貨コード
    const currencyCode = pnr.prices?.totalPrices?.total?.[0]?.currencyCode;
    // PNR情報取得API応答.data.totalPrices.total[0].valueを金額として
    const totalAmount = pnr.prices?.totalPrices?.total?.[0]?.value ?? 0;
    return [totalAmount, undefined, currencyCode];
  }

  getTotalAmountLabel(pnr: GetOrderResponseData) {
    const paymentMethod = pnr.nextActions?.offlinePaymentDetails?.paymentMethod ?? '';
    return TOTAL_AMOUNT_LABEL_MONGON_VALUES[paymentMethod];
  }

  getDisplayPaymentDeadline(pnr: GetOrderResponseData) {
    // PNR情報取得API応答.data.orderStatus=”paymentAccepted”(支払受付中)の場合
    return pnr?.orderStatus === 'paymentAccepted';
  }

  getPaymentDeadline(pnr: GetOrderResponseData): [string, string] {
    // PNR情報取得API応答.data.nextActions.offlinePaymentDetails.Deadlineを表示する
    const paymentDeadline = pnr?.nextActions?.offlinePaymentDetails?.deadline ?? '';
    // フォーマット
    // [日本語]
    // MM月dd日HH時mm分
    // [英語]
    // MMMMM dd,HH:mm
    return [paymentDeadline, 'default_timelimit'];
  }

  getPaymentDeadlineLabel(pnr: GetOrderResponseData) {
    const paymentMethod = pnr.nextActions?.offlinePaymentDetails?.paymentMethod ?? '';
    return PAYMENT_DEADLINE_LABEL_MONGON_VALUES[paymentMethod];
  }

  getPaymentMethod(pnr: GetOrderResponseData) {
    // PNR情報取得API応答.data.nextActions.offlinePaymentDetails.paymentMethodとなる文言を表示する。
    const paymentMethodValue = pnr.nextActions?.offlinePaymentDetails?.paymentMethod ?? '';
    return PAYMENT_METHOD_MONGON_VALUES[paymentMethodValue];
  }

  getPaymentMethodLabel(pnr: GetOrderResponseData) {
    const paymentMethod = pnr.nextActions?.offlinePaymentDetails?.paymentMethod ?? '';
    return PAYMENT_METHOD_LABEL_MONGON_VALUES[paymentMethod];
  }

  getDisplayBank(pnr: GetOrderResponseData) {
    // PNR情報取得API応答.data.nextActions.offlinePaymentDetails.paymentMethod=”bank”(インターネットバンキング)の場合、以下の銀行名取得処理。
    return (
      pnr.nextActions?.offlinePaymentDetails?.paymentMethod ===
      GetOrderResponseDataNextActionsOfflinePaymentDetails.PaymentMethodEnum.Bank
    );
  }

  getBankName(pnr: GetOrderResponseData, aswContext: AswContextState, bankLang: NextActionBankLang) {
    // 3. 銀行名取得処理
    // 3.1.	以下の条件でASWDBの「銀行(国際化)」テーブルから情報を取得する。
    const bankAll = bankLang[aswContext.lang] ?? [];
    // 銀行コード=nextActions.offlinePaymentDetails.bankCode
    const findBank = bankAll.filter(
      (bank) => bank.bank_code === pnr.nextActions?.offlinePaymentDetails?.bankCode && bank.lang === aswContext.lang
    )[0];
    // 3.2.	取得できた場合、銀行(国際化).銀行名称を銀行名とする。それ以外の場合、銀行名に""(空欄)とする。
    return findBank?.bank_name ?? '';
  }

  getDisplayPaymentNumber(pnr: GetOrderResponseData) {
    // PNR情報取得API応答.data.nextActions.offlinePaymentDetails.paymentMethod=”convinienceStore”(コンビニ支払)の場合、PNR情報取得API応答.data.nextActions.offlinePaymentDetails.paymentNumberを表示する。
    return (
      pnr.nextActions?.offlinePaymentDetails?.paymentMethod ===
      GetOrderResponseDataNextActionsOfflinePaymentDetails.PaymentMethodEnum.ConvinienceStore
    );
  }

  getPaymentNumber(pnr: GetOrderResponseData) {
    // PNR情報取得API応答.data.nextActions.offlinePaymentDetails.paymentMethod=”convinienceStore”(コンビニ支払)の場合、PNR情報取得API応答.data.nextActions.offlinePaymentDetails.paymentNumberを表示する。
    // PNR情報取得API応答.data.nextActions.offlinePaymentDetails.paymentMethod=”payEasy”(Pay-easy)の場合、 PNR情報取得API応答.data.nextActions.offlinePaymentDetails.paymentNumberを表示する。
    return pnr.nextActions?.offlinePaymentDetails?.paymentNumber ?? '';
  }

  getDisplayPayeasy(pnr: GetOrderResponseData) {
    // PNR情報取得API応答.data.nextActions.offlinePaymentDetails.paymentMethod=”payEasy”(Pay-easy)の場合、 以下のPay-easy収納機関番号取得処理。
    // PNR情報取得API応答.data.nextActions.offlinePaymentDetails.paymentMethod=”payEasy”(Pay-easy)の場合、 PNR情報取得API応答.data.nextActions.offlinePaymentDetails.paymentNumberを表示する。
    // PNR情報取得API応答.data.nextActions.offlinePaymentDetails.paymentMethod=”payEasy”(Pay-easy)の場合、 以下のPay-easy確認番号取得処理。
    return (
      pnr.nextActions?.offlinePaymentDetails?.paymentMethod ===
      GetOrderResponseDataNextActionsOfflinePaymentDetails.PaymentMethodEnum.Payeasy
    );
  }

  onClick() {
    this._nextActionService.onHandlePayment(this.pnr$.value);
  }

  ngOnDestroy(): void {
    this._subcriptions.unsubscribe();
  }
}
