import { MCountry, MCountryPosByContact, MListData } from '@common/interfaces';
import { MBankWellnet } from '@common/interfaces/common/m_bank_wellnet';
import { MPaymentInformation} from '@common/interfaces/master/m_payment_information';
import { MOffice } from '@lib/interfaces';
import { GetOrderResponse, Traveler, Type1 } from 'src/sdk-servicing';
import { RegisteredCardTypeEnum } from '.. /sub-components/payment-input-common/payment-input-card-selecting'; 
import { FareConditionsState } from '@common/store' 
import { GetBasicReservationInformationState, GetAwardUsersState } from '@lib/store'; 
import { BehaviorSubject } from 'rxjs';

// 予約詳細画面へ連携する検索方法選択
export const SEARCH_METHOD_SELECTION = 'order';//予約番号で検索
// 予約詳細画面へ連携する連携サイトID
export const COLLABORAITION_SITE_ID = 'ASW_APP'; // ASW
/**
*画面情報
*/
export interface PaymentInputScreenEntryInfo {
selectedPaymentMethod: string; // 選択中支払方法
isReservationOnly: boolean; // 予約のみ識別子
availableReservationsOnly: boolean; // 予約のみ利用可否識別子
isWaitlisted: boolean; // 空席待ち予約識別子
prevPaymentMethod: string; // 変更前支払方法
isKeepMyFare: boolean; //（未使用）Keep My Fare選択識別子
creditCardInformation: CreditCardInformation; // クレジットカード情報 
shareholderCoupons: ShareholderCouponsType; // 株主優待情報
}

/**
*クレジットカード情報
*/
export interface CreditCardInformation {
selectedCreditCard: string;
cardNumber: string; 
expiryDate: string;
holderName: string;
isUatpCard: boolean;
securityCode: string;
cardHolder: string;
mailAddress: string;
confirmmailAddress: string;
phoneCountry: string; 
countryNumber: string; 
phoneNumber: string; 
}

export function screenEntryData(): PaymentInputScreenEntryInfo{
return {
selectedPaymentMethod: '', 
isReservationOnly: false, 
availableReservationsOnly: false, 
isWaitlisted: false, 
prevPaymentMethod: '',
isKeepMyFare: false,
shareholderCoupons: {
flights: [], 
prefix: '',
},
creditCardInformation: {
selectedCreditCard: RegisteredCardTypeEnum.NewCard, 
cardNumber: '', 
expiryDate: '', 
holderName: '', 
isUatpCard: false, 
securityCode: '', 
cardHolder: '',
mailAddress: '',
confirmmailAddress: '', 
phoneCountry: '', 
countryNumber: '',
phoneNumber:'',
},
};
}

// マスタデータ
export interface PaymentInputMasterData {
paymentInformations: Array<MPaymentInformation>;
countries: Array<MCountry>;
offices: Array<MOffice>;
banks: Array<MBankWellnet>; 
listData: Array<MListData>; 
posCountry: MCountryPosByContact; 
posCountryJp: MCountryPosByContact;
}

/**
* ANA SKY coin
*/
export interface AnaSkyCoinInfo {
travelerId?: string; //搭乗者ID
travelerName?: string; // 
ticketPrice?: number; //充当可能上限コイン
usageCoin?: number;//利用額入力欄
}

/**
*前画面引継ぎ情報
*/
export interface PreviousScreenHandoverInformation {
orderId: string;
credential: { 
firstName: string; 
lastName: string;
};
}

export function initPreviousScreenHandoverInformation(): PreviousScreenHandoverInformation {
return {
orderId: '',
credential: {
firstName: '',
lastName: '',
}
};
}

/**
*クレジットカード情報
*/
export interface PaymentInputCardInfo {
uatpCard?: boolean; 
cardNumber?: string; 
cardExpiryDate?: string;
cvv?: string; 
ownerName?: string;
reservation?: boolean;
}

/**
* 名義人情報
*/
export interface PaymentInputCardHolderInfo {
email?: string;
phone?: PaymentInputPhoneSelectData;
}

export function initHolderInfo(): PaymentInputCardHolderInfo {
return { 
email:'',
phone: initPhoneSelectData(),
};
}

export interface PaymentInputPhoneSelectData {
registerCode?: RegisterCodeType; 
countryPhoneCode: string; 
countryPhoneExtension: string;
number: string;
}


export function initPhoneSelectData(): PaymentInputPhoneSelectData {
return { 
registerCode: '0',
countryPhoneCode: '',
countryPhoneExtension: '', 
number: '',
};
}

export type RegisterCodeType = '0' | '1';

export function PaymentInputInitMOffice(): MOffice {
return { 
office_code: '', 
pos_country_code: '',
dummy_office_flag: false, 
connection_kind: '', 
meta_connection_kind: '', 
content_connection_kind: '',
promotion_available_flag: false, 
booking_type: '', 
currency_code: '', 
third_language_code: '', 
pos_lh_site: '',
lh_third_language_code: '', 
initial_region_code: '', 
time_zone_airport_code: '',
sms_send_select_initial: false, 
available_ensighten_tag: false,
card_brand_pattern: '', 
paypal_available_flag: false, 
last_modification_date_time: '',
};
}

/**
*支払情報入力で使用するキャッシュ情報取得
*@returns 支払情報入力で使用するキャッシュ情報
*/
export function getPaymentInformationRequestMasterkey(lang: string) {
return [
{
key: 'PaymentInformation_All', 
fileName: 'PaymentInformation_All',
},
{
key: 'Country_All', 
fileName: 'Country_All',
},
{
key: 'office_all', 
fileName: 'Office_All',
},
{
key: 'm_bank', 
fileName: 'm_bank',
},
{
key: `m_bank_i18n-${lang}`,
fileName: `m_bank_i18n/${lang}`,
},
{
key: 'ListData_All', 
fileName: 'ListData_All',
},
{
key: 'Country_WithPosCountryByContactTelNumberCountryF1g',
fileName: `Country_WithPosCountryByContactTelNumberCountryFlg_${lang}`,
},
{
key: 'Country_WithoutPosCountryAndJapanByContactTelNumberCountryFlg',
fileName: `Country_WithoutPosCountryAndJapanByContactTelNumberCountryFlg_${lang}`,
},
];
}

// セグメント情報
export type FlightType = {
flightId: string; 
originFlight: Type1;
travelers: TravelerType[];
};

//搭乗者情報
export type TravelerType = {
travelerId: string; 
nmber: string; 
pin: string;
originTraveler: Traveler;
};

// 株主優待情報
export type ShareholderCouponsType = {
flights: FlightType[];
prefix?: string;
};

/** 画面情報JSON */
export type DisplayInfoJSON = {
/** 利用可能支払方法リスト*/
availablePaymentMethods?: string[];
/** 選択中支払方法 */
currentPaymentMethod?: string;
/** 検索条件（運賃情報.Mixedcabin選択有無）*/
flightCondition?: { fare: { isMixedCabin: boolean }};
/** 検索条件有無 */
hasSearchCriteria?: boolean;
/** Keep my Farea　*/ 
isKeepMyFare?: boolean;
} ;

/**
*動的文言に渡すパラメータ
*@param getorderReply PNR情報取得レスポンス
*@param fareconditionsReply 運賃ルール・手荷物情報取得レスポンス
*@param getBasicReservation 予約基本情報レスポンス
*@param getspecial sutilizers 特典情報レスポンス
*@param pageContext 画面情報JSON
*/
export interface PaymentInputDynamicParams { 
getOrderReply?: GetOrderResponse; 
fareConditionsReply?: FareConditionsState; 
getBasicReservation?: GetBasicReservationInformationState; 
getSpecialsUtilizers?: GetAwardUsersState; 
pageContext?: DisplayInfoJSON;
}
export function defaultPaymentInputDynamicParams(): PaymentInputDynamicParams {
return {
getOrderReply: undefined, 
fareConditionsReply: undefined, 
getBasicReservation: undefined, 
getSpecialsUtilizers: undefined,
pageContext: {
availablePaymentMethods: [], 
currentPaymentMethod: '',
flightCondition: { fare: { isMixedCabin: false } }, 
hasSearchCriteria: false, 
isKeepMyFare: false,
},
};
}

export const dynamicSubject = new BehaviorSubject<PaymentInputDynamicParams>(defaultPaymentInputDynamicParams());