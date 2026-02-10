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
} from '@common/services';
import { DeliveryInformationState, OrdersPaymentRecordsState } from '@common/store' ; 
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
} from '@lib/services';
import { Subscription, timer, fromEvent, takeWhile, interval } from 'rxjs';
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
import { amopAuthenticationModalParts } from '../sub-components/modal/amop-authentication/amop-authentication.state';
import { PaymentInputPresService } from './payment-input-pres.service';
import { RegisteredCardTypeEnum } from '../sub-components/payment-input-common/payment-input-card-selecting/payment-input-card-selecting.state';
import {
	CardinalResponse, 
	PaymentInputPresTicketingServiceParam, 
	PaymentInputSetupCompleteData,
} from './payment-input-pres.state';
import {
	AnaskyCoinInfo,
	PaymentInputCardInfo, 
	PaymentInputCardHolderInfo, 
	ShareholderCouponsType,
	PreviousScreenHandoverInformation,
	initPreviousScreenHandoverInformation,
} from '../container';

@Injectable({ providedIn: 'root' })
export class PaymentInputPresTicketingService extends SupportClass {
// 購入発券APIリクエストパラメータ
private _ordersPaymentRecordsReqParam: OrdersPaymentRecordsRequest = {} as OrdersPaymentRecordsRequest;
// Cardinal決済判定
private _is3DSPayment = false;
// CardinaltyaID
private _cardinalSeccionId: string = '';
// keep my fareであるかどうか
private _isKeepMyFare: boolean = false;
// いつもの支払い方法登録チェックがチェックされているかどうか
private _isSaveAsUsualChecked: boolean = false;
// いつもの支払い方法登録チェックがチェックされているかどうか（インターネットバンキング）
private _isBankSaveAsUsualChecked: boolean = false;
// 前画面引継情報
private _prevScreenInfo: PreviousScreenHandoverInformation = initPreviousScreenHandoverInformation();
// 選択されている支払方法
private _selectedPaymentMethod: PaymentMethodsType = 'CD' ;
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

// FY25追加
/**予約のみ識別子*/
private _isReservationOnly? = false;
/** 空席待ち予約識別子*/
private _isWaitlisted? = false;
/** 株主優待情報*/
private _shareholderCoupons?: ShareholderCouponsType;

constructor (
	private _common: CommonLibService, 
	private _ordersPaymentRecordsStoreService: OrdersPaymentRecordsStoreService,
	private _errorsHandlerService: ErrorsHandlerService,
	private _aswMasterService: AswMasterService,
	private _loadScriptService: LoadScriptService,
	private _currentCartStoreService: CurrentCartStoreService,
	private _loggerService: LoggerDatadogService,
	private _modalService: ModalService,
	private _getorderStoreService: GetOrderStoreService, 
	private _planListService: PlanListService, 
	private _deliveryInformationStoreService: DeliveryInformationStoreService,
	private _router: Router,
	private _paymentInputPresService: PaymentInputPresService,
	private _paymentInputstoreService: PaymentInputStoreService, 
	private _ngZone: NgZone
){
	super ();
}

private _setParam(param: PaymentInputPresTicketingServiceParam) {
	this._selectedPaymentMethod = param.selectedPaymentMethod;
	this._isCreditCardCombination = param.isCreditCardCombination;
	this._totalUseCoin = param. totalUseCoin;
	this._bankCode = param. bankCode;
	this._isKeepMyFare = param.isKeepMyFare;
	this._issueReceipt = param.issueReceipt;
	this._isSaveAsUsualChecked = param.isSaveAsUsualChecked;
	this._isBankSaveAsUsualChecked = param.isBankSaveAsUsualChecked;
	this._isReservationOnly = param.isReservationOnly;
	this._isWaitlisted = param.isWaitlisted;
	this._shareholderCoupons = param.shareholderCoupons;
	this._prevScreenInfo = param.prevScreenInfo;
}

/**
*購入発券処理
*/
public executePaymentRecords( param: PaymentInputPresTicketingServiceParam, deviceId: string) {
// 関数実行用パラメータ代入
this._setParam(param) ;
// 5.3Dセキュア決済判定初期設定（false: 3DS浦）
this._is3DSPayment = false;
// 6.購入発券API実行のためのパラメータを作成
this._ordersPaymentRecordsReqParam = this._createPaymentRecordsRequestParameters(
	param.selectedCard, 
	param.cardInfo, 
	param.holderInfo,
	deviceId
);
this._ordersPaymentRecordsReqParam;
// 6.購入発券API実行（1回目）の実行
apiEventAll(
 () => {
this._ordersPaymentRecordsStoreService.setOrdersPaymentRecordsFromApi(this._ordersPaymentRecordsReqParam);
},
this._ordersPaymentRecordsStoreService.getOrdersPaymentRecords$(),
( response ) => {
// 1.1.28-9.以下、購入発券が正常に行われたときの処理
const warning = response.warnings;
if (warning !== undefined && warning.length > 0) {
if (warning[0].code === 'WBAZ000199') {
// 1.1.28 3DS認証前処理
this._preCardinalAuthentication1(response) ;
} else {
// 1.1.31.完了後処理を行う
this._postCompletion(response);
}
} else {
// 1.1.31 完了後処理を行う
this._postCompletion(response);
}
},
() => {
this._paymentRecordsError();
}
);
}

/**
*Cardinalを利用した3DS認証処理1
*@param response 購入発券APIレスポンス
*/
private _preCardinalAuthentication1(response: OrdersPaymentRecordsState) {
	// songbird install
	const el = document.createElement('script');
	// scriptタグのsrc属性にsongbird．jsのパスを設定
	el.src = this._aswMasterService.getMPropertyByKey('cardinal', 'script.url');
	// [Production) https://songbird.cardinalcommerce.com/edge/v1/songbird.js
	// [staging] https://songbirdstag.cardinalcommerce.com/edge/v1/songbird.js
	// body要素の最後songbird.jsのインクルード追加
	document.body.appendChild(el);
	// cardinal関連のsongbird.jsのloading
	this._loadScriptService
    .load$(this._aswMasterService.getMPropertyBykey('cardinal', 'script.url'))
	.subscribe((path: any) => {
if (path) {
// Cardinal.configure
(window as any).Cardinal.configure({
// Cardinal接続タイムアウト
timeout: this._aswMasterService.getMPropertyByKey('cardinal', 'timeout millisecond cardinal') ?? '',
// cardinalコンソールログ出力（off：コンソールへのロギングは有効にならない／on：トランザクション中に発生したことに関する情
logging:{
	level: this._aswMasterService.getMpropertyBykey('cardinal', 'logging.level'),
},
payment: {
	view: 'modal',
	framework: 'cardinal',
	displayLoading: true, //ロード画面表示
	displayExitButton: false,// 閉じるボタンを出さない
	},
});
const timeSubscribe = this._cardinalClientTimeoutHandle();
// Cardinal. setup
(window as any).Cardinal.setup('init',{
        jwt: decodeURIComponent(
            window.atob(
            response.data?.paymentRequest?.authorization?.paymentRedirectionContext?.encrypted3DSToken || ''
        )
    ),
});
// セットアップが完了したときに実行する処理を定義する
(window as any).Cardinal.on( 'payments setupComplete', (setupCompleteData: PaymentInputSetupCompleteData) => {
// 4.1セットアップ完了タイマを廃棄
timeSubscribe.unsubscribe();
this._ngZone.run(() => {
    this.cardinalResponseEvent(setupCompleteData);
    });
});
} else {
this._cardinalNotRetryableHandle();
}
});
}

/**
* カーディナル受信後の処理
* @param setupCompleteData $1.7-2
* @returns
*/
cardinalResponseEvent (setupCompleteData: PaymentInputSetupCompleteData) {
// 4.3 Cardinalの返却値をログに出力する
this._loggerService.info(LogType.PAGE_VIEW, { response: setupCompleteData }, false);
const modulesValid = (): boolean => {
const vaild = setupCompleteData.modules.find((data: any) => {
return data.module === 'CCA' && data.loaded;
});
return !!vaild;
};
// Cardinalレスポンス・sessionIdが存在しない、または”（空欄）
if (!setupCompleteData.sessionId || !modulesValid()){
this._loggerService.error (LogType.PAGE_VIEW, { errMsg: 'Cardinal Communication Error! ' }, false);
// 継続不可能エラー（処理終了）
this._cardinalNotRetryableHandle();
return;
}
// 4.5 CardinalセッションIDを保存する
this._cardinalSeccionId = setupCompleteData.sessionId;
// 5.Cardinal決済判定をTRUEにする
this._is3DSPayment = true;
// 6.購入発券API実行のためのパラメータを作成
const params: OrdersPaymentRecordsRequest = this._createPaymentRecordsRequestParameters2();
// 6.購入発券API実行（2回目）の実行
apiEventAll(
() => {
this._ordersPaymentRecordsStoreService.setordersPaymentRecordsFromApi(params);
},
this._ordersPaymentRecordsStoreService.getordersPaymentRecords$(),
(response) => {
const warning = response.warnings;
if (warning){
if (warning[0].code == 'WBAZ000200' || warning[0].code === 'WBAZ000201') {
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
this._paymentRecordsError();
}
);
}

/**
* 購入発券API実行のためのリクエストパラメータを作成
*@returns 購入発券APIリクエストパラメータ
*/
private _createPaymentRecordsRequestParameters (
	selectedCard: RegisteredCardTypeEnum, 
	cardInfo: PaymentInputCardInfo, 
	holderInfo: PaymentInputCardHolderInfo, 
	deviceId: string
): OrdersPaymentRecordsRequest {
let orderId = this._prevScreenInfo.orderId;
let firstName: string | undefined = this._prevScreenInfo.credential.firstName;
let lastName: string | undefined = this._prevScreenInfo.credential.lastName;
// クレジットカード決済対象の場合にクレジットカード情報を設定

const paymentcard: PaymentRequestPaymentCard | undefined = this._paymentInputPresService.isCreditcard( 
this. _isCreditCardCombination, 
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
	if (this. _isCreditCardCombination){
	isUsualPaymentMthod = this._isSaveAsUsualChecked ?? false;
	}
	break; 
default: 
	break;
}
return {
// 前画面引継ぎ情報のオーダーID
orderId: orderId ?? '',
// 前画面引継ぎ情報の代表者名
credential: {
firstName: firstName ?? '', 
lastName: lastName?? '',
},
//カートID
cartId: this._currentCartStoreService?.CurrentCartData.data?.cartId ?? undefined,
// 支払リクエスト情報
paymentRequest: {
// クレジットカード情報
paymentcard: paymentcard,
// 支払者識別情報
payerIdentification: payerIdentification,
// GMOP情報
generalPaymentMethod: gmopPaymentMethod
? { paymentMethod: gmopPaymentMethod, bankCode: bankCode ?? undefined }
: undefined,
},
// 領収書宛名
receiptAddress: this._paymentInputPresService.isCreditcard(
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
//「sdk-reservation」を手動で更新された
isReservationOnly: this._isReservationOnly, 
isWaitlisted: this._isWaitlisted,
shareholderCoupons: this._shareholderCoupons,
};
}

/**
* AMOP認証前処理
*/
private _preAmopAuthentication1(response: OrdersPaymentRecordsState) {
// postMessage受信
this.subscribeService('amopPostMessage', fromEvent<MessageEvent>(window, 'message'), (message: MessageEvent) => {
console. log('recieve message');
// 送信元のオリジンと現在のドメインが一致しない場合は処理しない
if (window.location.origin !== message.origin) {
return;
}

// データ内のメッセージタイプがamop 以外は処理しない
if (message.data?.messageType !== 'amop') {
return;
}

let paymentResumptionLink: PaymentRequestAuthorizationPaymentResumptionLink = { href: '', method: 'GET'};

// クエリストリングのパラメーターが入っている場合
if (message.data?.queryParams && Object.keys(message.data?.queryParams).length > 0) {
paymentResumptionLink = {
	href: message.data.url, 
	method: 'GET',
	payload: Object.entries(message.data.queryParams).map(
	([key, value]) =>
	({
	name: key,
	value: value as string,
	} as PaymentRequestAuthorizationPaymentResumptionLinkPayloadInner)
	),
	};
}

// postパラメーターが入っている場合
if (message.data?.postParams && Object.keys(message.data?.postParams).length > 0) {
paymentResumptionLink = {
	href: message.data.url, 
	method: 'POST',
	payload: Object.entries(message.data.postParams).map(
	([key, value]) =>
({
name: key, 
value: value as string,
} as PaymentRequestAuthorizationPaymentResumptionLinkPayloadInner)
),
};
}

// postMessageのサブスクリプション解除
this.deletesubscription('amopPostMessage');

// 5.Alipay、銀聯、PayPal認証後処理を行う。
this._preAmopAuthentication2(paymentResumptionLink);
});

// フォーム作成
this. createAmopForm(response) ;
}

/**
*外部支払いサイト遷移用フォーム作成
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
if (splitUrl.length > 1){
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
form.className = 'amopform';
form.target = 'amopTab';

const myElement: any = document. querySelector ('asw-payment-input-cont') ;

// フォームを挿入する
myElement?.insertAdjacentHTML('afterbegin', form.outerHTML);

// フォームのサブミットイベントをリッスンする
myElement?.queryselector('form.amopform')?.addEventListener ('formdata', (e: FormDataEvent) => {
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
localStorage.removeItem( 'amopstatus');

// 名前付きで空のタブを生成
const amopTab: Window | null = window.open('', 'amopTab' );

if (amopTab === null) {
console.log('タブが開けない');
}

// 作ったフォームをサブミット
myElement?.queryselector('form. amopform' )?.submit();

// フォームを削除する
myElement?.querySelector('form.amopform')?.remove();

// 子タブの開閉状態ポーリング（テスト用）
this.subscribeService('amopTabPolling', interval(1000), () => {
// タブが開いていない
if (amopTab === null) {
this.deleteSubscription('amopTabPolling' );
this.deletesubscription('amopPostMessage'); 
return;
}

// タブが開いている
if (!amopTab.closed) {
//何もしない。その支払中と判断
console.log( 'open'); 
return;
}

// タブが閉じられた場合
if (amopTab.closed) {
this.deleteSubscription('amopTabPolling'); 
this.deleteSubscription('amopPostMessage');

// ストレージからステータス取得
const amopStatus: string | null = localStorage.getItem('amopStatus');

// ストレージクリア
localStorage.removeItem('amopstatus');

if (amopStatus === null) {
	console.log('タブが途中でとじられた');
} else {
	if (amopStatus === 'complete'){
		console.log('支払正常完了');
	} else {
		console.log('支払が正常に完了していない');
	}
	}
	}
});
}



}