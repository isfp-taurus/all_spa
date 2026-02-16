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
import { NextActionService } from '@common/services/next-action/next-action.service';
import { StaticMsgPipe } from '@lib/pipes';
import { AmountFormatPipe } from '@lib/pipes/amount-format/amount-format.pipe';
import { DateFormatPipe } from '@lib/pipes/date-format/date-format.pipe';
import { CommonLibService } from '@lib/services/common-lib/common-lib.service';
import { AnaBizContextState } from '@lib/store/ana-biz-context/ana-biz-context.state';
import { AswContextState } from '@lib/store/asw-context/asw-context.state';
import { BehaviorSubject, Subscription, combineLatestWith } from 'rxjs';
import { GetOrderResponseData } from 'src/sdk-servicing';

/** 発券 */
@Component({
  selector: 'asw-ticketing',
  templateUrl: './ticketing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketingComponent implements OnInit, OnDestroy {
  @ViewChild('template', { static: true })
  template!: TemplateRef<unknown>;
  private _subcriptions = new Subscription();
  displayHighlightedTotalAmount: string = '';
  subscription = new Subscription();

  isDisplayed!: boolean;
  /** 案内 */
  guideLabel: string = '';
  guideLabelReader: string = '';
  displayTotalAmount!: boolean;

  approvableOnAnaBizLabel = 'label.approvableonanabiz';
  displayApprovableOnAnaBiz: boolean = false;

  /** [1.2.47] 空席待ちステータスの旨 */
  displayWaitListStatus!: boolean;

  /** 発券期限が迫っている旨 */
  ticketDeadlineWarning = 'label.closeToTicketingLimit';
  displayTicketDeadlineWarning!: boolean;
  /** 支払総額 */
  totalAmount!: string;
  displayMiles!: boolean;
  /** マイル */
  miles!: string;
  displayTax!: boolean;
  /** 税金 */
  tax!: string;
  displayExpirationLabel!: boolean;
  /** 発券期限ラベル */
  expirationLabel!: string;
  displayTicketingDeadline!: boolean;
  /** 発券期限 */
  ticketingDeadline!: string;
  canBeClickedNext = true;

  pnr$ = new BehaviorSubject<GetOrderResponseData>({});
  @Input() canBeClicked: boolean = true;
  @Input() set pnr(pnr: GetOrderResponseData) {
    this.updateTicketingDisplay(pnr);
    this.pnr$.next(pnr);
  }

  constructor(
    private readonly _nextActionService: NextActionService,
    private readonly _common: CommonLibService,
    private readonly _amountFormatPipe: AmountFormatPipe,
    private readonly _dateFormatPipe: DateFormatPipe,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _staticMsg: StaticMsgPipe,
    private readonly _viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this._viewContainerRef.createEmbeddedView(this.template);
    this._subcriptions.add(
      this.pnr$
        .pipe(
          combineLatestWith(
            this._common.aswContextStoreService.getAswContext$(),
            this._common.anaBizContextStoreService.getAnaBizContext$()
          )
        )
        .subscribe((inputs) => {
          // SIDE_EFFECT: update guideLabel, guideLabelReader
          const [guideLabel, guideLabelReader] = this.getGuideLabel(inputs[0], inputs[1], inputs[2]);
          this.guideLabel = guideLabel;
          this.guideLabelReader = guideLabelReader;
          this.displayApprovableOnAnaBiz = this.getDisplayApprovableOnAnaBiz(inputs[2]);
          this._cdr.markForCheck();
        })
    );
  }

  updateTicketingDisplay(pnr: GetOrderResponseData) {
    this.isDisplayed = this.getIsDisplayed(pnr);
    this.canBeClickedNext = this.getCanBeClicked(pnr);
    this.displayTotalAmount = this.getDisplayTotalamount(pnr);
    this.displayWaitListStatus = this.getDisplayWaitListStatus(pnr);
    this.displayTicketDeadlineWarning = this.getDisplayTicketDeadlineWarning(pnr);
    this.updateHighlightedTotalAmount(pnr);
    this.totalAmount = this._amountFormatPipe.transform(...this.getTotalAmount(pnr));
    this.displayMiles = this.getDisplayMiles(pnr);
    this.miles = this._amountFormatPipe.transform(...this.getMiles(pnr));
    this.displayTax = this.getDisplayTax(pnr);
    this.tax = this._amountFormatPipe.transform(...this.getTax(pnr));
    this.displayExpirationLabel = this.getDisplayExpirationLabel(pnr);
    this.expirationLabel = this.getExpirationLabel(pnr);
    this.displayTicketingDeadline = this.getDisplayTicketingDeadline(pnr);
    this.ticketingDeadline = this._dateFormatPipe.transform(...this.getTicketingDeadline(pnr));
  }

  getIsDisplayed(pnr: GetOrderResponseData) {
    // 1.PNR情報取得API応答.data.nextAction.payment=true(次に必要なアクションである)の場合、下記の通りに設定する
    return pnr.nextActions?.payment === true;
  }

  getCanBeClicked(pnr: GetOrderResponseData) {
    // 1.1.PNR情報取得API応答.data.air.isContainedWaitlistedSegment=true(空席待ちセグメント有)の場合、当グループをラベルとして表示する。
    // 1.2.上記以外の場合、グループ全体をボタンとして表示する。
    const isDisplayedAsButton = pnr.air?.isContainedWaitlistedSegment !== true;
    return this.canBeClicked ? isDisplayedAsButton : false;
  }

  getGuideLabel(pnr: GetOrderResponseData, aswContext: AswContextState, anaBizContext: AnaBizContextState) {
    // 1.PNR情報取得API応答.data.air.isContainedWaitlistedSegment=true(空席待ちセグメント有)の場合、空席待ちである旨の文言を表示する。
    if (pnr.air?.isContainedWaitlistedSegment === true) {
      return ['label.waitListedPeriod', 'label.waitListedPeriod'];
    }

    // 2.PNR情報取得API応答.data.air.isContainedWaitlistedSegment=false(空席待ちセグメント有無が無)、かつPNR情報取得API応答.data.nextActions.paymentDetails.applyForTicketing=true(購入案内の購入申請が要)の場合、購入申請の文言を促す旨
    if (
      pnr.air?.isContainedWaitlistedSegment === false &&
      pnr.nextActions?.paymentDetails?.applyForTicketing === true
    ) {
      return ['label.requestPurchaseAnaBiz', 'reader.requestPurchaseAnaBiz'];
    }

    // 3 上記以外の場合、購入手続きを促す旨を表示する。
    return ['label.pleasePurchase.members1', 'reader.pleasePurchase.members'];
  }

  // ※購入手続きを促す旨を表示する場合、かつ
  getDisplayApprovableOnAnaBiz(anaBizContext: AnaBizContextState): boolean {
    // 1.ユーザ共通情報.data.anaBizContext.authInfo.contractType=""02""(BPS)、かつユーザ共通情報.data.anaBizContext.authInfo.companyInfoA.issueFlag=""1""(使用する)
    const condition1 =
      anaBizContext.authInfo?.contractType === '02' && anaBizContext.authInfo?.companyInfoA?.issueFlag === '1';
    // 2.ユーザ共通情報.data.anaBizContext.authInfo.contractType=""01""(P)、かつユーザ共通情報.data.anaBizContext.authInfo.companyInfoC.issueFlag=""1""(使用する)
    const condition2 =
      anaBizContext.authInfo?.contractType === '01' && anaBizContext.authInfo?.companyInfoC?.issueFlag === '1';

    if (
      // ANA Bizログイン情報.認証情報.ロールリストに""APPROVER""(承認者)が含まれる、かつ以下のいずれかに該当する場合、ANA Biz支払情報入力画面にて発券要求の承認・否認が行える旨の文言を表示する。
      anaBizContext.authInfo?.roles?.includes('APPROVER') &&
      (condition1 || condition2)
    ) {
      return true;
    }

    return false;
  }

  getDisplayTotalamount(pnr: GetOrderResponseData) {
    // PNR情報取得API応答.data.orderType.isAwardBooking=false(有償PNR)の場合、下記の通りに表示する。
    return pnr.orderType?.isAwardBooking === false;
  }

  getDisplayWaitListStatus(pnr: GetOrderResponseData) {
    // PNR情報取得API応答.data.air.isContainedWaitlistedSegment=true(空席待ちセグメント有)の場合、ステータスが空席待ちである旨を表示する
    return Boolean(pnr?.air?.isContainedWaitlistedSegment) === true;
  }

  getDisplayTicketDeadlineWarning(pnr: GetOrderResponseData) {
    // PNR情報取得API応答.data.nextActions.paymentDetails.isCloseToDeadline=true(発券期限間近)の場合、発券期限が迫っている旨を表示する
    return pnr.nextActions?.paymentDetails?.isCloseToDeadline === true;
  }

  getTotalAmount(pnr: GetOrderResponseData): [number, string | undefined, string | undefined] {
    // 当該total.currencyCodeを通貨コード、
    const currencyCode = pnr?.prices?.totalPrices?.total?.[0]?.currencyCode;
    const totalAmount =
      // ＜以下、PNR情報取得API応答.data.prices.totalPrices.totalの件数分繰り返し＞
      pnr?.prices?.totalPrices?.total?.reduce((sum, tax) => {
        // 総額に総額 + 当該total.valueとする
        return sum + (tax.value ?? 0);
      }, 0) ?? 0;
    // ＜ここまで、PNR情報取得API応答.data.prices.totalPrices.totalの件数分繰り返し＞

    // 通貨コードと総額を表示する。
    return [totalAmount, undefined, currencyCode];
  }

  updateHighlightedTotalAmount(pnr: GetOrderResponseData) {
    // PNR情報取得API応答.data.prices.totalPrices.isAirPriceChangeRepricing=true(運賃再計算の支払総額情報の変更有)の場合、総額を赤色で表示する。
    this.displayHighlightedTotalAmount =
      pnr.prices?.totalPrices?.isAirPriceChangeRepricing === true ? 'u-text-color-red' : '';
    // TODO:
    // ※ユーザ共通情報.端末種別="PC"の場合、読み上げ用ラベルとして、変更があった旨の文言をラベルの前に設置する。
  }

  getDisplayMiles(pnr: GetOrderResponseData) {
    // PNR情報取得API応答.data.orderType.isAwardBooking=true(特典PNR)の場合
    return pnr.orderType?.isAwardBooking === true;
  }

  getMiles(pnr: GetOrderResponseData): [number, string | undefined, string] {
    // PNR情報取得API応答.data.prices.totalPrices.requiredMileageを表示する。
    const miles = pnr.prices?.totalPrices?.requiredMileage ?? 0;
    return [miles, undefined, 'MIL'];
  }

  getDisplayTax(pnr: GetOrderResponseData) {
    // PNR情報取得API応答.data.orderType.isAwardBooking=true(特典PNR)の場合、下記の通りに表示する
    return pnr.orderType?.isAwardBooking === true;
  }

  getTax(pnr: GetOrderResponseData): [number, string | undefined, string | undefined] {
    // 当該totalTaxes.currencyCodeを通貨コード、
    const currencyCode = pnr?.prices?.totalPrices?.ticketPrices?.totalTaxes?.[0]?.currencyCode;
    const tax =
      // ＜以下、PNR情報取得API応答.data.prices.totalPrices.ticketPrices.totalTaxesの件数分繰り返し＞
      pnr.prices?.totalPrices?.ticketPrices?.totalTaxes?.reduce((sum, tax) => {
        // 当該totalTaxes.valueを金額として、表示する。
        return sum + (tax.value ?? 0);
      }, 0) ?? 0;
    // ＜ここまで、支払情報.総額情報.航空券総額情報.税金総額情報の件数分繰り返し＞
    return [tax, undefined, currencyCode];
  }

  getDisplayExpirationLabel(pnr: GetOrderResponseData) {
    // PNR情報取得API応答.data.nextActions.paymentDetails.paymentDeadlineが存在する場合に下記の通りに表示する。
    return !!pnr.nextActions?.paymentDetails?.paymentDeadline;
  }

  getExpirationLabel(pnr: GetOrderResponseData) {
    let expirationText = '';
    // 1.PNR情報取得API応答.data.air.isContainedWaitlistedSegment=false(空席待ちセグメント無)の場合
    if (pnr.air?.isContainedWaitlistedSegment === false) {
      if (pnr.orderType?.isAwardBooking === true) {
        // 1.1.PNR情報取得API応答.data.orderType.isAwardBooking=true(特典PNR)の場合、発券期限を表す旨の文言を表示する。
        expirationText = 'label.tickettingDueDate';
      } else {
        // 1.2.上記以外の場合、購入期限を表す旨の文言を表示する。
        expirationText = 'label.purchaseDueDate';
      }
    }
    if (pnr.air?.isContainedWaitlistedSegment === true) {
      // 2.PNR情報取得API応答.data.orderType.isAwardBooking=true(特典PNR)、
      // かつPNR情報取得API応答.data.air.isContainedWaitlistedSegment=true(空席待ちセグメント有)の場合、お預かり期限を表す旨の文言を表示する。
      expirationText = 'label.reservationTimeLimit';
    }
    return expirationText;
  }

  getDisplayTicketingDeadline(pnr: GetOrderResponseData) {
    // PNR情報取得API応答.data.nextActions.paymentDetails.paymentDeadlineが存在する場合、
    return !!pnr.nextActions?.paymentDetails?.paymentDeadline;
  }

  getTicketingDeadline(pnr: GetOrderResponseData): [string, string] {
    // PNR情報取得API応答.data.nextActions.paymentDetails.paymentDeadlineを表示する。
    const ticketingDeadline = pnr.nextActions?.paymentDetails?.paymentDeadline ?? '';
    // フォーマット
    // [日本語]
    // MM月dd日HH時mm分
    // [英語]
    // MMMMM dd,HH:mm
    return [ticketingDeadline, 'default_timelimit'];
  }

  onClick() {
    this._nextActionService.onHandleTicketing(this.pnr$.value);
  }

  ngOnDestroy(): void {
    this._subcriptions.unsubscribe();
  }
}
