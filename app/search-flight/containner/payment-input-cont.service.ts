import { Injectable } from '@angular/core'; 
import { apiEventAll } from '@common/helper'; 
import { MCountry } from '@common/interfaces';
import {
BookingSearchService, 
CurrentCartStoreService, 
DeliveryInformationStoreService, 
FareConditionsStoreService, 
GetMemberInformationStoreService, 
GetOrderStoreService,
} from '@common/services';
import { FareConditionsState, GetMemberInformationState, GetOrderState } from '@common/store'; 
import { SupportClass } from '@lib/components/support-class'; 
import { ApiCommonRequest, PageType } from '@lib/interfaces';
import {
ApiErrorResponseService, 
AswMasterService, 
CommonLibService, 
ErrorsHandlerService, 
GetAwardUsersStoreService, 
GetBasicReservationInformationStoreService,
} from '@lib/services';
import {
GetAwardUsersState, 
GetAwardUsersStore, 
GetBasicReservationInformationState, 
setGetAwardUsersFromApi,
} from '@lib/store';
import { Store } from '@ngrx/store';
import { AmcmemberApiService, GetBasicReservationInformationRequest } from 'src/sdk-amcmember'; 
import { ContactsRepresentative } from 'src/sdk-reservation';
import {
FareConditionsRequest, 
GetOrderRequest, 
GetOrderResponseData,
GetOrderResponseDataOrderEligibilitiesPayment, 
GetOrderResponseDataServiceSummaryHasRequested,
Type1,
} from 'src/sdk-servicing';
import { FlightType, TravelerType, screenEntryData } from '.'; 
import { RegisteredCardTypeEnum } from '../sub-components';
import { PreviousScreenHandoverInformation, PaymentInputScreenEntryInfo} from './payment-input-cont.state';
import { SEARCH_METHOD_SELECTION, COLLABORAITION_SITE_ID } from './payment-input-cont.state';

@Injectable({ providedIn: 'root' })
export class PaymentInputContService extends SupportClass {
constructor(
private _common: CommonLibService,
private _deliveryInformationStoreService: DeliveryInformationStoreService,
private _errorsHandlerService: ErrorsHandlerService,
private _currentCartStoreService: CurrentCartStoreService,
private _bookingSearchService: BookingSearchService,
private _getBasicReservationInformationService: GetBasicReservationInformationStoreService,
private _getMemberInformationService: GetMemberInformationStoreService,
private _fareConditionsStoreService: FareConditionsStoreService,
private _getAwardUsersApiErrorResponseService: ApiErrorResponseService,
private _getAwardUsersStore: Store<GetAwardUsersStore>,
private _getAwardUsersApi: AmcmemberApiService,
private _getAwardUsersService: GetAwardUsersStoreService,
private _getOrderStoreService: GetOrderStoreService,
private _masterSvc: AswMasterService
){
super();
}

/**
*予約詳細画面の連携作成
*@param prevScreenInfo 前画面引維彥情報
*@param errorId
*/
saveLinkageParametersInStore(prevScreenInfo: PreviousScreenHandoverInformation, errorId: string): void {
const queryParams = {
previousFuncId: 'R01', //（遷移元画面機能ID）
previousPageId: 'P080', //（遷移元面面画面ID）
searchType: SEARCH_METHOD_SELECTION, // 檢索方法選
cooperationNo: '', //（企業ID）
reservationNo: prevScreenInfo.orderId, // 予約番号
eticketNo: '', //（航空券番号）
lastName: prevScreenInfo.credential.lastName,// 搭秉者名（姓）
firstName: prevScreenInfo.credential.firstName, // 搭琹者名（名）
amcMemberNo:'', //（AMC会員番号）
sited: COLLABORAITION_SITE_ID,
aswIntErrorId: '', 
errorId: errorId,
warningId: '',
nextAction: '',
};
this._bookingSearchService.setBookingSearch(queryParams); 
this._bookingSearchService.saveBookingSearch(queryParams);
}

/**
*画面入力内容設定
*@param countryAll master国情報
*@param pnrRepresentive pnr代表者連絡先情報
*@return 面面入力情報
*/
setScreenEntity(
countryAll: MCountry[],
isAfterStartingFrom: boolean, 
pnrInfo?: GetOrderResponseData, 
pnrRepresentive?: ContactsRepresentative
): PaymentInputScreenEntryInfo {
let emailAddress: string;
if (this._currentCartStoreService.CurrentCartData.data?.cartId){
emailAddress =
this._currentCartStoreService.CurrentCartData.data?.plan?.contacts?.representative?.emails?.[0]?.address ?? '';
} else {
emailAddress = pnrRepresentive?.emails?.[0]?.address ?? '';
}
const countryNumber = pnrRepresentive?.phones?.[0]?.countryPhoneExtension;
const country = countryAll.find((item: MCountry) => item.international_tel_country_code === countryNumber);

// 予約のみ利用可否識別子
const availableReservationsOnly = pnrInfo?.orderEligibilities?.payment?.isOnholdEligible ?? false;
// true（予約のみ機能利用可能）
// 上記以外の場合、false
const isWaitlisted = pnrInfo?.air?.isContainedWaitlistedSegment ?? false;

// 株主優待券情報
const shareholderCoupons = { flights: [] as FlightType[], prefix: '' };
if (pnrInfo?.air?.isContainedshareholdersBenefitDiscountFare){
const prefix = this._masterSvc.getMPropertyByKey('paymentInformationInput', 'shareholderCoupons.numberPrefix');

// PNR情報取得API.data.air.bounds.flightsの件数分、繰返
const flights = pnrInfo?.air?.bounds?.[0].flights ?? ([] as Type1[]);
const _flights: FlightType[] = flights
// ※但し、当該セグメント情報.fareinfos. fareType*shareholdersBenefitDiscount （株主優待割引であるセグメントを除外する
.filter((flight) => flight?.fareInfos?.fareType === 'shareholdersBenefitDiscount')
.map((flight) => ({
flightid: flight.id ?? '', 
originFlight: flight,
// PNR情報取得APILスポンス・data.travelersの件数分、繰り返し※passengerTypecode="INF”を除く
travelers: (pnrInfo?.travelers?.filter((item) => item.passengerTypeCode !== 'INF') ?? []).map((traveler) => ({
travelerId: traveler.id ?? '', 
nmber: '',// “（空欄）
pin: '',//“”（空欄）
originTraveler: traveler,
})) as TravelerType[],
}));

Object.assign(shareholderCoupons, {
flights: _flights, 
prefix: prefix,
});
}
return {
...screenEntryData,
availableReservationsOnly, 
isWaitlisted,
shareholderCoupons,
creditCardInformation: {
// クレジットカード情報・選択中のクレジットカード
selectedCreditCard: RegisteredCardTypeEnum.NewCard,

cardNumber: '',
// クレジットカード情報。有効期限
expiryDate: '',
// クレジットカード情報。カード名義人
holderName:'',
// クレジットカード情報.UATPカード選択識別子
isUatpCard: false,
securityCode: '',
// クレジットカード情報・カード名義
cardHolder: '',
// カート情報とPNR情報とで代表者の連絡先情報を切り替える
// クレジットカード情報・名義人メールアドレス
mailAddress: emailAddress,
// クレジットカード情報。名義人メールアドレス確認
confirmmailAddress: emailAddress,
// クレジットカード情報・電話番号国
phoneCountry: country?.country_2letter_code ?? '',
// クレジットカード情報、電話番号国番号
countryNumber: countryNumber ?? '',
// クレジットカード情報、電話番号
phoneNumber: pnrRepresentive?.phones?.[0]?.number ?? '',
},
};
}

/**
*Ancillaryサービスの申込状況
*@param requestInfo pnr申し込み状況
*@return true： 甲込有 / false：甲込無
*/
getAncillaryServiceStatus(requestInfo: GetOrderResponseDataServiceSummaryHasRequested | undefined): boolean {
if (
requestInfo?.firstBaggage || // 事前追加手荷物
requestInfo?.chargeableLounge || // 国際線有料ラウンジ
requestInfo?.chargeableMeal || // 有料機内食
requestInfo?.chargeableseat // 有料事前座席指定
){
return true;
}
return false;
}

/**
*支扒情報入力機能利用不可理由取得
*@param reasons 支払情報入力機能利用不可理由（PNR情報）
*@returns
*/
orderEligibilitiesToErrorId(
reasons: Array<GetOrderResponseDataOrderEligibilitiesPayment.NonEligibilityReasonsEnum> | undefined
): string {
const code = GetOrderResponseDataOrderEligibilitiesPayment.NonEligibilityReasonsEnum;
if (
reasons?.some(
(value) =>
value === code.NotNhPnr || 
value === code.CallCenterCreated || 
value === code.NdcPnr || 
value === code.SegmentNotConfirmed || 
value === code.HasOpenSegment || 
value === code.OfflineRemark
)
){
return 'E0558'; //購入発券ができない旨
}
if (reasons?.some((value) => value === code.PassedTicketIssuanceDeadline)){
// 発券期限切れ
return 'E0564'; // 発券期限切れの旨
}
return ''; //その他の利用不可理由
}

/**
*前画面引継ぎ情報エラーの処理
*/
previousScreenError(){
const errInfo = this._deliveryInformationStoreService.deliveryInformationData.passToPayment?.errInfo;
if (errInfo && errInfo?.length > 0) {
errInfo.forEach((info) => {
this._errorsHandlerService.setRetryableError(PageType.PAGE, info);
});
}
}

/**
* PNR情報取得APIリクエスト作成
* @param prevScreenInfo 前画面引继含情報
* @returns
*/
serviceCommonInformationAcuquisition(prevScreenInfo: PreviousScreenHandoverInformation){
const cartId = this._currentCartStoreService.CurrentCartData.data?.cartId;
if (cartId) {
return {
orderId:prevScreenInfo.orderId,// 前画面引繼萃情報
credential: {
firstName: prevScreenInfo.credential.firstName, // 前画面引縱意情報.代表者名
lastName: prevScreenInfo.credential.lastName, // 前面面引維 情報.代表者姓
},
mask: false, 
cartId: cartId,
};
} else {
return {
orderId: prevScreenInfo.orderId, // 前画面引糙 情報
credential: {
firstName: prevScreenInfo.credential.firstName,// 前画面引继意情報.优表者名
lastName: prevScreenInfo.credential.lastName,//前画面引維 情報.代表者姓
},
mask: false,
};
}
}


/**
*@param prevScreenInfo 前画面引继情報
*@return 
*/
public generateFareConditionApiParam(prevScreenInfo: PreviousScreenHandoverInformation): FareConditionsRequest {
const cartId = this._currentCartStoreService.CurrentCartData.data?.cartId;
return {
orderId: prevScreenInfo.orderId, // 前画面引继
credential: {
firstName:prevScreenInfo.credential.firstName, // 前画面引继情報.代表者名
lastName:prevScreenInfo.credential.lastName, // 前画面引继情報.代表者姓
},
cartId: cartId ?? undefined,
commonIgnoreErrorFlg: true,
};
}

/**
*予約基本情報取得APT呼出
*@param successEvent 成功時処理
*@param errorEvent 失敗時処理
*/
public invokeGetBasicReservationInformationApi(
requestParameter: GetBasicReservationInformationRequest & ApiCommonRequest, 
successEvent: (response: GetBasicReservationInformationState) => void,
errorEvent: (error: GetBasicReservationInformationState) => void
){
apiEventAll(
 () => {
this._getBasicReservationInformationService.setGetBasicReservationInformationFromApi(requestParameter);
},
this._getBasicReservationInformationService.getGetBasicReservationInformation$(), 
(response) => {
successEvent(response);
},
(error) => {
errorEvent(error);
}
);
}

/**
*会員情報取得API呼出
*@param successEvent 成功時処理
*@param errorEvent 失敗時処理
*/
public invokeGetMemberInformationApi(
successEvent: (response: GetMemberInformationState) => void, 
errorEvent: (error: GetMemberInformationState) => void
){
apiEventAll(
 ()=> {
this._getMemberInformationService.callApi();
},
this._getMemberInformationService.getGetMemberInformation$(),
(response) => { 
successEvent(response);
},
(error) => {
errorEvent (error);
}
);
}

/**
*運賃/手荷物rules取得API呼出
*@param successEvent 成功時処理
*@param errorEvent 失敗時処理
*/
public invokeGetFareConditionsApi(
fareConditionsRequestParam: FareConditionsRequest, 
successEvent?: (response: FareConditionsState) => void, 
errorEvent?: (error: FareConditionsState) => void
){
apiEventAll(
 () => {
this._fareConditionsStoreService.setFareConditionsFromApi(fareConditionsRequestParam);
},
this._fareConditionsStoreService.getFareConditions$(),
(response) => {
if (successEvent) successEvent(response);
},
(error) => {
if (errorEvent) errorEvent(error);
}
);
}

/**
*特典利用者情報取得API呼出
*@param successEvent 成功時処理
*@param errorEvent 失敗時処理
*/
public getAwardUsers(
successEvent: (response: GetAwardUsersState) => void, 
errorEvent: (error: GetAwardUsersState) => void
){
apiEventAll(
() => {
const requestParameter: ApiCommonRequest = {
commonIgnoreErrorFlg: true,
};
this._getAwardUsersApiErrorResponseService.clearApiErrorResponse(); 
this._getAwardUsersStore.dispatch(
setGetAwardUsersFromApi({ call: this._getAwardUsersApi.getAwardUsersPost(requestParameter) })
);
},
this._getAwardUsersService.getAwardUsers$(),
(response) => {
successEvent(response);
},
(error) => {
errorEvent(error);
}
);
}

/**
*PNR情報取得API呼出
*@param getOrderRequestParam
*@param successEvent 成功時処理
*@param errorEvent 失敗時処理
*/
public invokeGetOrderApi(
getOrderRequestParam: GetOrderRequest, 
successEvent: (response: GetOrderState) => void, 
errorEvent: (error: GetOrderState) => void
){
apiEventAll(
 () => {
this._getOrderStoreService.setGetOrderFromApi(getOrderRequestParam);
},
this._getOrderStoreService.getGetOrderObservable(),
(response) => {
successEvent(response);
},
(error) => {
errorEvent (error);
}
);
}

/**
*入力で使用するキャッシュ情報取得
*@param lang 画面言語
*@returns キャッシュ情報
*/
public getPaymentInformationRequestMasterKey(lang: string) {
return [
{
key: 'PaymentInformation_All',
fileName:'PaymentInformation_All',
},
{
key: 'Country_All', 
fileName: 'Country_All',
},
{
key: 'Office_all', 
fileName: 'Office_All',
},
{
key: 'M_Bank_Wellnet', 
fileName: `M_Bank_Wellnet_${lang}`,
},
{
key: 'ListData_All',
fileName: 'ListData_All',
},
{
key: 'Country_WithPosCountryByContactTelNumberCountryFLg',
fileName: `Country_WithPosCountryByContactTelNumberCountryF1g_${lang}`,
},
{
key: 'Country_WithoutPosCountryAndJapanByContactTelNumberCountryFlg',
fileName: `Country_WithoutPosCountryAndJapanByContactTelNumberCountryFlg_${lang}`,
}
];
}
destroy(): void {}
}