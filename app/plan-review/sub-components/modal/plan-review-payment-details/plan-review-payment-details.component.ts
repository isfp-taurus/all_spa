import { AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { isStringEmpty, getPaxName, getTaxNameWithCountryCode, fixedArrayCache } from '@common/helper';
import { AirportAllData, TaxAllLang, TaxAllLangItem } from '@common/interfaces';
import { CurrentCartStoreService, GetAirportListByCountryService } from '@common/services';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { StaticMsgPipe } from '@lib/pipes';
import { AswMasterService, CommonLibService, LoggerDatadogService } from '@lib/services';
import { PaymentDetailsBreakdownItemData } from './payment-details-breakdown/payment-details-breakdown-item/payment-details-breakdown-item.state';
import {
  PaymentDetailsSummaryAmountType,
  PaymentDetailsSummaryData,
} from './payment-details-summary/payment-details-summary.state';
import {
  AwardDetails,
  getPlanReviewPaymentDetailsMasterKey,
  PaymentDetailsPayload,
  travelerNumStaticMsgs,
} from './plan-review-payment-details.state';

/**
 * 支払情報詳細モーダル
 */
@Component({
  selector: 'asw-payment-details',
  templateUrl: './plan-review-payment-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewPaymentDetailsComponent extends SupportModalBlockComponent implements AfterViewChecked {
  constructor(
    private _common: CommonLibService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _aswMasterSvc: AswMasterService,
    private _staticMsgPipe: StaticMsgPipe,
    private _router: Router,
    private _getAirportListByCountryService: GetAirportListByCountryService,
    private _loggerSvc: LoggerDatadogService
  ) {
    super(_common);
  }

  /** 表示可否フラグ */
  public isShow = false;

  public isCanada = false; //カナダフラグ
  public isMalaysia = false; //マレーシアフラグ

  /** 税金キャッシュ */
  public taxCurrentLang: Array<TaxAllLangItem> = [];

  /** ペイロード定義 */
  public override payload: PaymentDetailsPayload | null = {
    amountType: PaymentDetailsSummaryAmountType.NONE,
  };

  /** 支払情報サマリ系に渡すデータ */
  public paymentDetailsSummaryData: PaymentDetailsSummaryData = {
    totalAmount: 0,
    amountType: '',
    originalTotal: 0,
    travelersSummaryStr: '',
    promotionCode: '',
    totalFare: 0,
    totalFlightSurcharge: 0,
    airTransportationCharges: 0,
    totalTax: 0,
    thirdPartyCharges: 0,
    ancillaryTotalWithoutTax: 0,
    ancillaryTotalTax: 0,
    alertLabelTxt: [],
    currencyCode: undefined,
  };

  /** 支払情報内訳系に渡すデータ */
  public paymentDetailsBreakdownData: Array<PaymentDetailsBreakdownItemData> = [];

  /** 支払情報内訳系に渡す税金マスタ文言 */
  public mTaxMsgs: { [key: string]: string } = {};

  public paymentDetailsAwardData: AwardDetails = {
    isAwardBooking: false,
    sumRequiredMiles: 0,
    paxRequiredMiles: 0,
  };

  /** 香港空港リスト */
  public hkAirportList: Array<string> = [];

  init(): void {
    this.closeWithUrlChange(this._router);
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    this.subscribeService(
      'planReviewPaymentDetail getMasterDataAll',
      this._aswMasterSvc.load(getPlanReviewPaymentDetailsMasterKey(lang), true),
      (data) => {
        this.deleteSubscription('planReviewPaymentDetail getMasterDataAll');
        const taxAllLang: TaxAllLang = data[0];
        this.taxCurrentLang = taxAllLang[lang] ?? [];
        const airportAll: Array<AirportAllData> = fixedArrayCache(data[1]);
        this.hkAirportList = this._getAirportListByCountryService.getAirportListByCountry('HK', airportAll);
        this.refresh();
      }
    );
  }

  reload(): void {}

  destroy(): void {}

  refresh() {
    //　正規データ
    const currentPrices = this._currentCartStoreService.CurrentCartData.data?.plan?.prices ?? {};
    const plan = this._currentCartStoreService.CurrentCartData.data?.plan;

    //テストデータ
    //const plan: Required<PostGetCartResponseDataPlan> = testPlan;
    //const currentPrices: Required<CreateCartResponseDataPlanPrices> = currentPricesTest;
    //テストデータ end

    this.isCanada = this._common.aswContextStoreService.aswContextData.posCountryCode === 'CA';
    this.isMalaysia = this._common.aswContextStoreService.aswContextData.posCountryCode === 'MY';

    const currentTotal = currentPrices.totalPrices?.total?.value;

    // 搭乗者種別毎の人数を結合した文字列
    const travelersDivider = this._staticMsgPipe.transform('label.separaterComma');
    const travelersSummaryStr = Object.entries(plan?.travelersSummary?.numberOfTraveler ?? {})
      .filter(([key, value]) => Object.keys(travelerNumStaticMsgs).includes(key) && value > 0)
      .map(([key, value]) => this._staticMsgPipe.transform(travelerNumStaticMsgs[key], { 0: value }))
      .join(travelersDivider);

    const alertLabelTxt = [];

    // 香港発着セグの存在判定
    const isHKSeg = this._currentCartStoreService.CurrentCartData.data?.plan?.airOffer?.bounds?.some((bound) =>
      bound.flights?.some((flight) => {
        const departureAirport = flight.departure?.locationCode ?? '';
        const arrivalAirport = flight.arrival?.locationCode ?? '';
        return this.hkAirportList.includes(departureAirport) || this.hkAirportList.includes(arrivalAirport);
      })
    );
    // 航空保険料が存在するか否か
    const isInsuranceSurcharge = Object.values(currentPrices.unitPrices ?? {}).some((unitPrice) => {
      if (this.isMalaysia) {
        // マレーシアの場合のみ、航空保険料＋燃油特別付加運賃で判定
        return (
          (unitPrice.ticketPrices?.insuranceSurcharge?.value ?? 0) +
            (unitPrice.ticketPrices?.fuelSurcharge?.value ?? 0) >
          0
        );
      } else {
        return unitPrice.ticketPrices?.insuranceSurcharge?.value;
      }
    });
    if (isHKSeg && isInsuranceSurcharge) {
      alertLabelTxt.push('message.aboutInsuranceSurchargeOnHKGSector');
    }

    //Summary系情報を入力
    const _paymentDetailsSummaryData: PaymentDetailsSummaryData = {
      // 支払総額
      totalAmount: currentTotal ?? 0,
      // 支払総額の差分強調表示種別
      amountType: this.payload?.amountType ?? PaymentDetailsSummaryAmountType.NONE,
      // プロモーションコード適用前支払総額
      originalTotal: currentPrices.totalPrices?.discount?.originalTotal ?? 0,
      // 搭乗者人数
      travelersSummaryStr: travelersSummaryStr,
      // プロモーションコード
      promotionCode:
        (currentPrices.totalPrices?.discount?.cat25DiscountName ||
          currentPrices.totalPrices?.discount?.aamDiscountCode) ??
        '',
      // 運賃総額
      totalFare: currentPrices.totalPrices?.ticketPrices?.base?.value ?? 0,
      // フライトサーチャージ総額
      totalFlightSurcharge: currentPrices.totalPrices?.ticketPrices?.totalFlightSurcharges ?? 0,
      // 燃油特別付加運賃等
      airTransportationCharges: currentPrices.totalPrices?.ticketPrices?.airTransportationCharges?.value ?? 0,
      // 税金総額
      totalTax: currentPrices.totalPrices?.ticketPrices?.totalTaxes?.value ?? 0,
      // 各国諸税・空港使用料等総額
      thirdPartyCharges: currentPrices.totalPrices?.ticketPrices?.thirdPartyCharges?.value ?? 0,
      // ※発券手数料は0固定のため項目なし
      // Ancillaryサービス税抜総額
      ancillaryTotalWithoutTax: 0,
      // Ancillaryサービス税金総額
      ancillaryTotalTax: 0,
      // 香港発着セグメントに対する注釈
      alertLabelTxt: alertLabelTxt,
      // 通貨コード
      currencyCode: currentPrices.totalPrices?.total?.currencyCode,
    };
    this.paymentDetailsSummaryData = _paymentDetailsSummaryData;

    // 搭乗者内訳で見出しに使用する税金マスタ文言を取得
    this.mTaxMsgs = {
      fuelSurcharge: this.getTaxDataByTaxCode('F')?.tax_name ?? '',
      insuranceSurcharge: this.getTaxDataByTaxCode('I')?.tax_name ?? '',
    };

    //搭乗者内訳系情報を入力
    if (plan) {
      const _paymentDetailsBreakdownData: Array<PaymentDetailsBreakdownItemData> = [];
      plan.travelers?.forEach((traveler, index) => {
        const id = traveler.id ?? '';
        const unitPrices = currentPrices.unitPrices?.[id as keyof object];

        _paymentDetailsBreakdownData.push({
          // 搭乗者ID
          id: id,
          // 搭乗者姓名
          // 変更管理 No.50 第3性別対応
          dispName: getPaxName(traveler) ?? this._staticMsgPipe.transform('label.passenger.n', { '0': index + 1 }),
          // 搭乗者種別
          ptc: traveler.passengerTypeCode ?? '',
          // 運賃総額
          unitTicketBase: unitPrices?.ticketPrices?.base ?? 0,
          // フライトサーチャージ
          flightSurcharge: unitPrices?.ticketPrices?.flightSurcharge?.value ?? 0,
          // 燃油特別付加運賃
          fuelSurcharge: this.isMalaysia
            ? (unitPrices?.ticketPrices?.fuelSurcharge?.value ?? 0) +
              (unitPrices?.ticketPrices?.insuranceSurcharge?.value ?? 0)
            : unitPrices?.ticketPrices?.fuelSurcharge?.value ?? 0,
          // 航空保険料
          insuranceSurcharge: unitPrices?.ticketPrices?.insuranceSurcharge?.value ?? 0,
          // ※発券手数料は0固定のため項目なし
          // 各国税額
          taxesPerCountry:
            unitPrices?.ticketPrices?.taxes?.map((tax) => {
              if (isStringEmpty(tax.code)) {
                // 税金コードが存在しない場合「その他税額」として扱う
                return {
                  name: this._staticMsgPipe.transform('label.othersTax'),
                  value: tax.value ?? 0,
                };
              } else {
                // 税金コードが存在する場合、国コード＋マスタから取得した税金名称
                const taxData = this.getTaxDataByTaxCode(tax.code!);
                return {
                  name: taxData ? getTaxNameWithCountryCode(taxData) : '',
                  value: tax.value ?? 0,
                };
              }
            }) || [],
          // Ancillaryサービス支払内訳：手荷物
          firstBaggageValue: 0,
          // Ancillaryサービス支払内訳：ラウンジ
          loungeValue: 0,
          // Ancillaryサービス支払内訳：機内食
          mealValue: 0,
          // Ancillaryサービス税額
          ancillaryTaxes: [],
          // 通貨コード
          currencyCode: unitPrices?.ticketPrices?.currencyCode,
        });
      });
      this.paymentDetailsBreakdownData = _paymentDetailsBreakdownData;
    }
    if (this.payload?.isAwardBooking) {
      this.paymentDetailsAwardData.isAwardBooking = this.payload?.isAwardBooking;
      this.paymentDetailsAwardData.sumRequiredMiles = this.payload?.totalMileage;
      this.paymentDetailsAwardData.paxRequiredMiles = this.payload?.paxMileage;
    }
    this.isShow = true;
    this._changeDetectorRef.markForCheck();
  }

  getTaxDataByTaxCode(taxCode?: string): TaxAllLangItem | undefined {
    // ※テーブル定義上税金コードがcharacter型となっているため、1桁の税金コードには半角スペースが付与される
    const taxData = this.taxCurrentLang.find((data) => data.tax_code.trim() === taxCode);
    // 税金コードに該当するデータが取得できないか空だった場合、運用確認ログを出力する
    if (!taxData) {
      this._loggerSvc.operationConfirmLog('MST0003', { 0: 'Tax_All_Lang', 1: taxCode ?? '' });
    }
    return taxData;
  }

  ngAfterViewChecked(): void {
    this.resize();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * 閉じるボタン押下時処理
   */
  clickClose() {
    this.close();
  }
}
