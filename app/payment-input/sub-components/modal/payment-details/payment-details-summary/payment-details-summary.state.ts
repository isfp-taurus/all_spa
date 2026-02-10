/**
* @param totalAmount 支払総額，
* @param totalFeePreApply ブロモーションコード適用前支払総額
* @param passenger 搭乗者人数
* @param promotioncode：ブロモーションコード
* @param totalFare 運賃殺額
* @param totalFaresurcharge運賃総額（フライトサーチャージ総額併記）
* @param flightsurcharges フライトサーチャージ
* @param fuelFee 燃油特別付加運賃等
* @param totalTax 税金総額
* @param countryTaxAndPayment 各国諸税・空港使用料等
* @param ticketingFee 発券手数料
* @param ancillaryNonTaxFee Ancillaryサービス税抜総額
* @param ancillaryTotalTax:Ancillaryサービス税金総額
* @param alertLabelTxt 香港発着セグメントに対する注釈
* @param currencycode 通貨コード
* @param isKeepMyFare Keep My Fare Flag
*/
export interface PaymentDetailsSummaryData {
    totalAmount: number;
    totalFeePreApply: number;
    passenger: Array<{ label: string; num: number }>; 
    promotionCode: string; 
    totalFare: number;
    totalFareSurcharge: number; 
    flightSurcharges: number; 
    fuelFee: number; 
    totalTax: number;
    countryTaxAndPayment: number; 
    ticketingFee: number;
    ancillaryNonTaxFee: number; 
    ancillaryTotalTax: number; 
    alertLabelTxt: Array<string>;
    currencyCode: string; 
    isKeepMyFare: boolean;
}

export function initPaymentDetailsSummaryData(): PaymentDetailsSummaryData {
    return { 
    totalAmount: 0, 
    totalFeePreApply: 0,
    passenger: [], 
    promotionCode: '',
    totalFare: 0, 
    totalFareSurcharge: 0, 
    flightSurcharges: 0, 
    fuelFee: 0, 
    totalTax: 0, 
    countryTaxAndPayment: 0, 
    ticketingFee: 0, 
    ancillaryNonTaxFee: 0, 
    ancillaryTotalTax: 0, 
    alertLabelTxt: [],
    currencyCode: '',
    isKeepMyFare: false,
    };
}

