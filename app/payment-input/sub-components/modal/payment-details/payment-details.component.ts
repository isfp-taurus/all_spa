import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'; 
import { getPassengerLabel, getTaxNameWithCountryCode } from '@common/helper'; 
import { GetOrderStoreService, PaymentInputStoreService } from '@common/services';
import { SupportModalBlockComponent} from '@lib/components/support-class'; 
import { AswMasterService, CommonLibService } from '@lib/services'; 
import { Traveler, TravelerNamesInner } from 'src/sdk-servicing';
import {
MultiCurrencyAirPricingRecords, 
MultiCurrencyAirPricingRecordsTraveler,
} from 'src/sdk-servicing/model/multiCurrencyAirPricingRecords';
import { PaymentDetailsBreakdownItemData } from './payment-details-breakdown/payment-details-breakdown-item/payment-details-breakdown-item.state' ; 
import { PaymentDetailsSummaryData } from './payment-details-summary/payment-details-summary.state'; 
import { PaymentDetailsPayload } from './payment-details.state';
import { MTaxModel } from '@common/interfaces/m_tax'; 
import { StaticMsgPipe } from '@lib/pipes';
import { initPaymentDetailsSummaryData } from './payment-details-summary/payment-details-summary.state' ;
import { TaxAllLang, TaxAllLangItem } from '@common/interfaces' ;

/**
* 支払情報詳細モーダル
*/
@Component ({
selector: 'asw-payment-details',
templateUrl: './payment-details.component.html', 
changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDetailsComponent extends SupportModalBlockComponent {
    constructor(
    private _common: CommonLibService, 
    private _getOrderStoreService: GetOrderStoreService, 
    private _paymentInputStoreService: PaymentInputStoreService, 
    public changeDetectorRef: ChangeDetectorRef, 
    private _master: AswMasterService, 
    private _staticMsgPipe: StaticMsgPipe
    ){
    super(_common);
    }
    public isShow = false;
    public isCanada = false;
    public isMalaysia = false;//マレージアフラグ

    /** 税金キャッシュ*/
    public mTax: Array<TaxAllLangItem> = [];

    /** ペイロード定義*/
    public payload: PaymentDetailsPayload | null = {};

    /** 支払情報サマリ系に渡すデータ*/
    public paymentDetailsSummaryData: PaymentDetailsSummaryData = initPaymentDetailsSummaryData();

    /** 支払情報内訳系に渡すデータ*/
    public paymentDetailsBreakdownData: Array<PaymentDetailsBreakdownItemData> = [];
    /*＊支払情報内訳系に渡す金マスタ文言*/
    public mTaxMsgs: { [key: string]: string } = {};
    /**Keep My Fare トグルスイッチ*/
    public isKeepMyFare: boolean = false;

    /**
    *初期表示処理
    */

    init (): void {
    this.loadTaxMaster(() => {
    this.refresh();
    });
    }

    reload(): void {}

    destroy(): void {}

    refresh() {
    const plan = this._getOrderStoreService.getOrderData.data;
    const currentPrices = this._getOrderStoreService.getOrderData.data?.prices ?? {};
    const travelerNum = plan?.travelersSummary?.travelerNumbers ?? {};
    const passengerNum = [];
    for (const [key, value] of Object.entries(travelerNum)){
        let label = getPassengerLabel (key, '');
        if (label !== '') {
            passengerNum.push({ label: label, num: value });
        }
    }
    const promotioncode = '';
    const alertLabelTxt = this.getAlertLabelText(currentPrices);

    //Summary系情報入力
    this.paymentDetailsSummaryData = this.getPaymentDetailsSummaryData(
    currentPrices, 
    passengerNum, 
    promotioncode, 
    alertLabelTxt
    );
    // 搭乗者内訳で見出しに使用する税金マスタ文言を取得
    this. mTaxMsgs = {
        fuelSurcharge: this.mTax.find((e) => e.tax_code?.trim() === 'F')?.tax_name ?? '',
        insuranceSurcharge: this.mTax. find((e) => e.tax_code?.trim() === 'I')?.tax_name ?? '',
    };
    //搭乗者内訳系情報を入力
    if (plan) {
    this.paymentDetailsBreakdownData =
    plan.travelers?.map((traveler) => {
    const id = traveler.id ?? '';
    const unitPrices = currentPrices.unitPrices?.[id as keyof object] as MultiCurrencyAirPricingRecordsTraveler;
    return this.getPaymentDetailsBreakdownData(unitPrices, traveler);
    }) ?? [];
    }
    this.isShow = true;
    this.changeDetectorRef.detectChanges();
    this.resize();
    }

    /**
    * 支払情報詳細データ作成
    * @param currentPrices 予約詳細画面における支払詳細情報
    * @param passengerLabelList 搭乗者種別と人数リスト
    * @param promotioncode ブロモーションコード
    * @param alertLabelTxt 香港発着セグメントに対する注釈リスト
    * @returns 支払情報詳細データ
    */
    getPaymentDetailsSummaryData(
        currentPrices: MultiCurrencyAirPricingRecords,
        passengerLabelList: Array<{ label: string; num: number }>,
        promotionCode: string,
        alertLabelTxt: Array<string>
        ): PaymentDetailsSummaryData {
        return {
            totalAmount: currentPrices.totalPrices?.total?.[0]?.value ?? 0,
            totalFeePreApply: currentPrices.totalPrices?.discount?.originalTotal ?? 0,
            passenger: passengerLabelList,
            promotionCode: promotionCode,
            totalFare: currentPrices.totalPrices?.ticketPrices?.base?.[0]?.value ?? 0,
            totalFareSurcharge:
            (currentPrices.totalPrices?.ticketPrices?.base?.[0]?.value ?? 0) +
            (currentPrices.totalPrices?.ticketPrices?.flightSurcharges?.[0]?.value ?? 0),
            flightSurcharges: currentPrices.totalPrices?.ticketPrices?.flightSurcharges?.[0]?.value ?? 0,
            fuelFee: currentPrices.totalPrices?.ticketPrices?.airTransportationCharges?.[0]?.value ?? 0,
            totalTax: currentPrices.totalPrices?.ticketPrices?.totalTaxes?.[0]?.value ?? 0,
            countryTaxAndPayment: currentPrices.totalprices?.ticketPrices?.thirdPartycharges?.[0]?.value ?? 0,
            ticketingFee: 0,
            ancillaryNonTaxFee: 0,
            ancillaryTotalTax: 0,
            alertLabelTxt: alertLabelTxt,
            currencyCode: currentPrices.totalPrices?.total?.[0]?.currencyCode ??  '',
            isKeepMyFare: this.isKeepMyFare,
        };
    }

    /**
    * 税金ラベル取得
    * @param code 税金コード
    * @returns 税金ラベル
    */
    getTaxName (code: string) {
        // 存在しない税金コードの場合
        const taxData = this.mTax.find ((tax) => tax.tax_code === code) ;
        if (!taxData) {
            return this._staticMsgPipe.transform('label.othersTax');
        }
        return getTaxNameWithCountryCode(taxData) ;
    }

    /**
    * 香港発着セグメントに対する注釈リスト取得
    * @param currentPrices 予約詳細画面における支払詳細情報
    * @returns 香港発着セグメントに対する注釈リスト
    */
    getAlertLabelText(currentPrices: MultiCurrencyAirPricingRecords) {
        const alertLabelTxt = [];
        const isHKSeg = this._getOrderStoreService.getOrderData.data?.air?.isContainedHongKongSegment;
        const isInsurance = Object.values(currentPrices.unitPrices ?? {}).some(
        (value) => (value.ticketPrices?.insuranceSurcharge?.[0]?.value ?? 0) > 0
        );
        if (isHKSeg && isInsurance) {
            alertLabelTxt.push('message.aboutInsuranceSurchargeOnHKGSector');
        }
        return alertLabelTxt;
    }
    
    /**
    * 表示名取得
    * @param names 搭乗者名
    * @returns 表示名
    */
    getnames (names?: Array<TravelerNamesInner>) {
        return names
        ? {
        title: names[0].title ?? '',
        firstName: names[0].firstName ?? '',
        lastName: names[0].lastName ?? '',
        middleName: names[0].middleName,
        }
        : undefined;
    }

    /**
    * 支払情報詳細モーダル 下部 内訳部分作成
    * @param unitPrices 搭乗者毎の料金
    * @param traveler 搭乗者
    * @returns 支払情報詳細モーダル下部内訳部分
    */
    getPaymentDetailsBreakdownData(unitPrices?: MultiCurrencyAirPricingRecordsTraveler, traveler?: Traveler) {
    const names = this.getnames (traveler?.names);
    // NOTE: al1 payment-input 提携では不要な処理だが、削除すると影響範囲が広いため残しておく
    const ticketInsuranceSurcharge =
    this._common.aswContextstoreService.aswContextData.posCountryCode === 'MY'
        ? (unitPrices?.ticketPrices?.fuelSurcharge?. [0]?.value ?? 0) + 
            (unitPrices?.ticketPrices?.insuranceSurcharge?.[0]?.value ?? 0)
        : unitPrices?.ticketPrices?.fuelSurcharge?. [0]?. value ?? 0;
    return {
    id: traveler?.id ?? '',
    names: names,
    type: traveler?.passengerTypecode ?? '',
    unitTotalFee: unitPrices?.ticketPrices?.base?.[0]?.value ?? 0, 
    ticketTotalFee: unitPrices?.ticketPrices?.flightSurcharge?.[0]?.value ?? 0, 
    flightSurcharge: unitPrices?.ticketPrices?.flightSurcharge?.[0]?.value ?? 0, 
    fuelSurcharge: unitPrices?.ticketPrices?.fuelsurcharge?.[0]?.value ?? 0, 
    insuranceSurcharge: unitPrices?.ticketPrices?.insuranceSurcharge?.[0]?.value ?? 0, 
    ticketingSurcharge: 0, 
    ticketPricesTaxes:
        unitPrices?.ticketPrices?.taxes?.map((tax) => {
            return {
                name: this.getTaxName(tax.code),
                value: tax.value ?? 0,
            };
        }) || [],
        ticketFuelsurcharge: ticketInsuranceSurcharge,
        ticketInsuranceSurcharge: unitPrices?.ticketPrices?.insuranceSurcharge?.[0]?.value ?? 0, 
        ticketingFee: unitPrices?.ticketingFee?.[0]?.value ?? 0, 
        ticketingSurchargeTax: 0, 
        firstBaggageValue: 0, 
        seatValue: 0, 
        couchValue: 0, 
        loungeValue: 0, 
        mealValue: 0, 
        ancillaryTaxes: [],
        currencycode: unitPrices?.ticketPrices.base?.[0]?.currencyCode ?? '',
        };
    }

    /**
    * 閉じる押下
    */
    clickclose() {
        this.close();
    }
    
    /**
    *税金マスタ取得
    *@param callback 税金マスタ取得後に実行する関数
    */
    private loadTaxMaster (callback: () => void) {
        const lang = this._common.aswContextStoreService.aswContextData.lang;
        this.subscribeService(
        'aswMasterPaymentDetails',
        this._master.load([{ key: 'Tax_All_Lang', fileName: 'Tax_All_Lang' }], true),
            (data) => {
                this deleteSubscription('aswMasterPaymentDetails');
                const taxAllLang: TaxAllLang = data[0];
                this.mTax = taxAllLang[lang] ?? [];
                callback() ;
            }
        );
    }

}