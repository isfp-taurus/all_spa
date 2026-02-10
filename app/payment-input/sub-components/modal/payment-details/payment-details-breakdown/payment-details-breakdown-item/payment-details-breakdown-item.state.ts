/**
* 搭乗者情報
*
* @param id 搭乗者ID
* @param dispName:string，搭乗者名
* @param type:string 搭乗者タイプ
* @param unitTotalFee 運賃総額
* @param ticketTotalFee運賃総額（フライトサーチャージ総額併記）
* @param flightsurcharge フライトサーチャージ，
* @param fuelSurcharge：燃油特別付加運賃等
* @param insurancesurcharge 航空保険料
* @param ticketingSurcharge 
*
* @param ticketPricesTaxes
* @param code 当該稅金.code
* @param value 税金
*
* @param ticketFuelsurcharge 税金・燃油特別付加運賃
* @param ticketInsurancesurcharge 税金・航空保険料
* @param ticketingFee 発券手数料
* @param ticketingsurchargeTax 税金・発券手数料
* @param seatValue—
* @param couchVal
* @param firstBaggageValue 事前追加手荷物
* @param loungevalue
* @param mealValue 有料機内食
*
* @param ancillaryTaxes
* @param code 税金code
* @param value 税金
*
* @param currencycode通貨コード
*/
export interface PaymentDetailsBreakdownItemData{
    id: string;
    names?: PaymentDetailsBreakdownItemDataNames;
    type: string;
    unitTotalFee: number; 
    ticketTotalFee: number; 
    flightSurcharge: number; 
    fuelSurcharge: number; 
    insuranceSurcharge:number; 
    ticketingSurcharge: number;
    ticketPricesTaxes: Array<{
        name: string; 
        value: number;
    }>;
    ticketFuelSurcharge: number; 
    ticketInsuranceSurcharge: number;
    ticketingFee: number; 
    ticketingSurchargeTax: number;
    seatValue: number; 
    couchValue: number; 
    firstBaggageValue: number; 
    loungeValue: number; 
    mealValue: number;
    ancillaryTaxes: Array<{
    name: string; 
    value: number;
    }>;
    currencyCode: string;
    }
    
    export function initPaymentDetailsBreakdownItemData(): PaymentDetailsBreakdownItemData {
    return {
    id: '',
    names : {
    title:'',
    firstName:'',
    lastName:'',
    middleName: undefined,
    },
    type: '',
    unitTotalFee: 0,
    ticketTotalFee: 0, 
    flightSurcharge: 0, 
    fuelSurcharge: 0, 
    insuranceSurcharge: 0, 
    ticketingSurcharge: 0 ,
    ticketPricesTaxes: [], 
    ticketFuelSurcharge: 0, 
    ticketInsuranceSurcharge: 0, 
    ticketingFee: 0, 
    ticketingSurchargeTax: 0, 
    firstBaggageValue: 0, 
    loungeValue: 0, 
    mealValue: 0, 
    ancillaryTaxes: [], 
    seatValue: 0, 
    couchValue: 0, 
    currencyCode: '',
    };
    }
    
    export interface PaymentDetailsBreakdownItemDataNames{
    title: string;
    firstName: string;
    lastName: string;
    middleName?: string; 
    }