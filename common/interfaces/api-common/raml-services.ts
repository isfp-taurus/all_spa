/**
 * 共通RAML　service
 * @param baggage 手荷物
 * @param lounge  ラウンジamlServ
 * @param meal  機内食
 * @param myCarValet  マイカーバレー
 * @param airportService  アテンド。ANAエアポートサポートのSKコードが登録されている（設定ファイルに定義）ものを返却する
 * @param serviceSupport  配慮系サポート。DxAPIより返却された配慮が必要なSSRコードを返却する（表示するサポート系SSR/SKについて、ASWDBにSSR/SKのリストを保持）
 * @param keepMyFare  Keep My Fare
 */
export interface RamlServices {
  baggage: RamlServicesBaggage;
  lounge: RamlServicesLounge;
  meal: RamlServicesMeal;
  myCarValet: RamlServicesMyCarValet;
  airportService: RamlServicesAirportService;
  serviceSupport: object;
  keepMyFare: object;
}

/**
 * baggage
 * @param firstBaggage firstBaggage
 * @param callCenterRequestBaggage  コールセンター申込手荷物情報
 */
export interface RamlServicesBaggage {
  firstBaggage: RamlServicesBaggageFirst;
  callCenterRequestBaggage?: RamlServicesBaggageCallCenterRequest;
}
/**
 * firstBaggage
 * @param key バウンド バウンドIDが項目名となる
 */
export interface RamlServicesBaggageFirst {
  [key: string]: RamlServicesBaggageFirstSegment;
}
/**
 * バウンド
 * @param isAvailable バウンド毎の申込可否
 * @param key 搭乗者 搭乗者IDが項目名となる
 */
export interface RamlServicesBaggageFirstSegment {
  isAvailable: boolean;
  [key: string]: boolean | RamlServicesBaggageFirstSegmentMain;
}
/**
 * 搭乗者
 * @param id 登録済みのサービスID
 * @param serviceStatus SSRステータスとAncillaryのEMDの状態に応じたサービスの申込状態
 * @param isAvailable 申込可否
 * @param prices 申込済みの金額情報
 * @param prices.total 総額
 * @param prices.currencyCode 通貨コード
 * @param catalogue サービスカタログ
 * @param catalogue.prices 金額情報。申込可否がtrueの場合のみ返却する
 * @param catalogue.prices.total 総額
 * @param catalogue.prices.currencyCode 通貨コード
 */
export interface RamlServicesBaggageFirstSegmentMain {
  id?: string;
  serviceStatus?: string;
  isAvailable?: boolean;
  prices?: {
    total?: number;
    currencyCode?: string;
  };
  catalogue?: {
    prices?: {
      total?: number;
      currencyCode?: string;
    };
  };
}
/**
 * コールセンター申込手荷物情報
 * @param key セグメント セグメントIDが項目名となる
 */
export interface RamlServicesBaggageCallCenterRequest {
  [key: string]: RamlServicesBaggageCallCenterRequestSegment;
}
/**
 * セグメント
 * @param key 搭乗者 搭乗者IDが項目名となる。DxAPIから返却された順（順不同）で返却
 */
export interface RamlServicesBaggageCallCenterRequestSegment {
  [key: string]: RamlServicesBaggageCallCenterRequestSegmentSsr;
}
/**
 * 搭乗者
 * @param code SSRコード
 * @param serviceStatus SSRステータスに応じたサービスの申込状態
 * @param attributes フリーテキスト中に含まれる可変要素のリスト
 * @param freetext フリーテキスト
 */
export interface RamlServicesBaggageCallCenterRequestSegmentSsr {
  code: string;
  serviceStatus: string;
  attributes: Array<string>;
  freetext: string;
}
/**
 * Lounge
 * @param key セグメント セグメントIDが項目名となる
 */
export interface RamlServicesLounge {
  [key: string]: RamlServicesLoungeIdInfo;
}
/**
 * バウンド
 * @param isAvailable バウンド毎の申込可否
 * @param key 搭乗者 搭乗者IDが項目名となる
 */
export interface RamlServicesLoungeIdInfo {
  isAvailable: boolean;
  [key: string]: boolean | RamlServicesLoungeIdInfoMain;
}
/**
 * 搭乗者
 * @param code 有料ラウンジのSSRコード
 * @param id 登録済みのサービスID
 * @param statusCode 有料ラウンジのSSRステータスコード
 * @param serviceStatus 有料ラウンジのSSRステータスとAncillaryのEMDの状態に応じたサービスの申込状態
 * @param prices 申込済みの金額情報
 * @param prices.total 総額
 * @param prices.currencyCode 通貨コード
 * @param catalogue 有料ラウンジのサービスカタログ
 */
export interface RamlServicesLoungeIdInfoMain {
  code?: string;
  id?: string;
  statusCode?: string;
  serviceStatus?: ServiceStatusCodeType | string;
  isMyLoungeRequested?: boolean;
  isWaived?: boolean;
  isAvailable?: boolean;
  prices?: {
    total?: number;
    currencyCode?: string;
  };
  catalogue?: Array<RamlServicesLoungeIdInfoMainCatalogue>;
}
/**
 * 有料ラウンジのサービスカタログ
 * @param code 有料ラウンジのSSRコード
 * @param quota 在庫数
 * @param prices 金額情報
 * @param prices.total 総額
 * @param prices.currencyCode 通貨コード
 */
export interface RamlServicesLoungeIdInfoMainCatalogue {
  code: string;
  quota: string;
  prices: {
    total: number;
    currencyCode: string;
  };
}
/**
 * 申込状態
 * @param CONFIRMED：申込み確定
 * @param PREBOOLED：SSRのみ作成して離脱してしまった状態
 * @param CONFIRMED_WITHOUT_TSM：TSMが欠損して申込済み
 * @param REQUESTING：SSRのステータスがHNの場合
 * @param CANCELLED：SSRのステータスがUN/NO/UCの場合
 * @param REQUESTED：カートにて申込済み
 * @param UNKNOWN：不明
 */
export type ServiceStatusCodeType = (typeof ServiceStatusCodeType)[keyof typeof ServiceStatusCodeType];
export const ServiceStatusCodeType = {
  CONFIRMED: 'confirmed',
  PREBOOLED: 'prebooked',
  CONFIRMED_WITHOUT_TSM: 'confirmedWithoutTsm',
  REQUESTING: 'requesting',
  CANCELLED: 'cancelled',
  REQUESTED: 'requested',
  UNKNOWN: '',
} as const;

/**
 * meal
 * @param key セグメント セグメントIDが項目名となる
 */
export interface RamlServicesMeal {
  [key: string]: RamlServicesMealSegment;
}
/**
 * バウンド
 * @param isAvailable バウンド毎の申込可否
 * @param isExpired 受付時間内。出発まで設定ファイルで定めた時間以内の場合、true。
 * @param key 搭乗者 搭乗者IDが項目名となる
 */
export interface RamlServicesMealSegment {
  isAvailable: boolean;
  isExpired: boolean;
  [key: string]: boolean | RamlServicesMealPassenger;
}
/**
 * 搭乗者
 * @param appliedMealList 申込済機内食情報リスト。
 */
export interface RamlServicesMealPassenger {
  appliedMealList: Array<RamlServicesMealPassengerAppliedMeal>;
}
/**
 * 搭乗者
 * @param code SSRコード
 * @param id 登録済みのサービスID
 * @param statusCode 有料ラウンジのSSRステータスコード
 * @param type 機内食種別。登録済みSSRコードより有料/特別/事前を返却　ancillary:有料　special:特別　preOrder:事前
 * @param preOrderMealMessageId 事前オーダーミールメッセージID。機内食種別が事前の時のみ返却。
 * @param prices 申込済みの金額情報
 * @param prices.total 総額
 * @param prices.currencyCode 通貨コード
 */
export interface RamlServicesMealPassengerAppliedMeal {
  code?: string;
  id?: string;
  statusCode?: string;
  type?: string;
  preOrderMealMessageId?: string;
  serviceStatus?: string;
  price?: {
    total?: number;
    currencyCode?: string;
  };
}
/**
 * MyCarValet
 * @param key セグメント セグメントIDが項目名となる
 */
export interface RamlServicesMyCarValet {
  [key: string]: RamlServicesMyCarValetSegment;
}
/**
 * セグメント
 * @param key 搭乗者 搭乗者IDが項目名となる。DxAPIから返却された順（順不同）で返却
 */
export interface RamlServicesMyCarValetSegment {
  [key: string]: RamlServicesMyCarValetSegmentPassenger;
}
/**
 * 搭乗者
 * @param isRequested マイカーバレー申込状況（申込済 or 未申込）RM SCAI（フリーテキストのスペースで区切った1番目に"//WEB//@SCAI"が含まれている）が存在する場合、true：申込済を返却する
 */
export interface RamlServicesMyCarValetSegmentPassenger {
  isRequested: boolean;
}

/**
 * AirportService
 * @param key セグメント セグメントIDが項目名となる
 */
export interface RamlServicesAirportService {
  [key: string]: RamlServicesAirportServiceSegment;
}
/**
 * セグメント
 * @param key 搭乗者 搭乗者IDが項目名となる
 */
export interface RamlServicesAirportServiceSegment {
  [key: string]: RamlServicesAirportServiceSegmentPassenger;
}
/**
 * 搭乗者
 * @param keyword SKコード
 */
export interface RamlServicesAirportServiceSegmentPassenger {
  keyword: string;
}
/**
 * ServiceSupport
 * @param key 搭乗者 搭乗者IDが項目名となる。
 */
export interface RamlServicesServiceSupport {
  [key: string]: any;
}
/**
 * 搭乗者
 * @param specialServiceRequests 配慮系サポートSSR情報リスト
 * @param serviceStatus 当該搭乗者の全SSRステータスに応じたサービスの申込状態
 */
export interface RamlServicesServiceSupportPassenger {
  specialServiceRequests: Array<RamlServicesServiceSupportPassengerSpecialServiceRequests>;
  serviceStatus: string;
}
/**
 * 配慮系サポートSSR情報
 * @param code SSRコード
 * @param id カートに登録されているサービスID
 * @param statusCode SSRステータスコード
 * @param freetext SSRフリーテキスト
 * @param serviceStatus SSRステータスに応じたサービスの申込状態
 */
export interface RamlServicesServiceSupportPassengerSpecialServiceRequests {
  code: string;
  id: string;
  statusCode: string;
  freetext: string;
  serviceStatus: string;
}
/**
 * KeepMyFare
 * @param isAvailable 申込可否
 * @param serviceStatus confirmed：申込み確定。 SSRが存在する場合notRequested：未申し込み。それ以外
 * @param catalogue サービスカタログ ※申込可否がtrueの場合のみ値を返却する
 * @param catalogue.totalPrices 総額情報
 * @param catalogue.totalPrices.prices 総額
 * @param catalogue.totalPrices.currencyCode 通貨コード
 */
export interface RamlServicesKeepMyFare {
  isAvailable: boolean;
  serviceStatus: string;
  catalogue: {
    totalPrices: {
      prices: number;
      currencyCode: string;
    };
  };
}

/**
 * 予約詳細画面における連絡先情報
 * @param representative 代表者連絡先情報
 * @param upgradeNotification アップグレード通知情報
 * @param key 搭乗者毎の情報 ※ 搭乗者IDが項目名になる
 */
export interface RamlContacts {
  representative: RamlContactsRepresentative;
  upgradeNotification: RamlContactsUpgradeNotification;
  [key: string]: RamlContactsTraveler | RamlContactsRepresentative | RamlContactsUpgradeNotification;
}
/**
 * @param emails メールアドレス
 * @param phones 電話番号情報
 * @param contactsDuringStay 連絡先情報
 */
export interface RamlContactsRepresentative {
  emails: Array<RamlContactsEmails>;
  phones: Array<RamlContactsPhones>;
  contactsDuringStay: Array<RamlContactsDuringStay>;
}

/**
 * @param id MAILのID
 * @param address メールアドレス
 * @param encryptedAddress 暗号化済みメールアドレス
 * @param travelerId 搭乗者ID
 * @param isSameAsRepresentative 代表者メールアドレスと同一の場合はtrueを返却する
 */
export interface RamlContactsEmails {
  id: string;
  address: string;
  encryptedAddress: string;
  travelerId?: string;
  isSameAsRepresentative?: boolean;
}
/**
 * @param id contactsのID
 * @param type 電話番号種別
 * @param countryPhoneExtension 国番号から"+"を除いた文字列
 * @param number 電話番号
 * @param encryptedNumber 暗号化済み電話番号
 * @param isSameAsRepresentative 代表者電話番号と同一の場合はtrueを返却する
 */
export interface RamlContactsPhones {
  id?: string;
  type?: string;
  countryPhoneExtension: string;
  number?: string;
  encryptedNumber: string;
  isSameAsRepresentative?: boolean;
}

/**
 * @param id	contactsのID
 * @param number 滞在中の連絡先
 */
export interface RamlContactsDuringStay {
  id: String;
  number: String;
}
/**
 * @param emails メールアドレス
 */
export interface RamlContactsUpgradeNotification {
  emails: Array<RamlContactsEmails>;
}
/**
 * @param emails メールアドレス
 * @param phones 電話番号
 * @param isRefused SSR：CTCR(キャリアコードがNH)の登録有無（登録：true、未登録：false）
 * @param departureArrivalNotifications 発着通知連絡先情報
 * @param contactEmails SSR CTCE(キャリアコードがNH)に登録されているメールアドレス
 * @param secondContact 第2連絡先
 */
export interface RamlContactsTraveler {
  emails: Array<RamlContactsEmails>;
  phones: Array<RamlContactsPhones>;
  isRefused: boolean;
  departureArrivalNotifications: Array<RamlContactsTravelerDepartureArrivalNotifications>;
  contactEmails: Array<RamlContactsTravelerContactEmails>;
  secondContact?: Array<RamlContactsTravelerSecondContact>;
}
/**
 * @param emails メールアドレス
 * @param isRegisteredEmail メールアドレスの登録有無（true：登録、false：未登録）
 */
export interface RamlContactsTravelerDepartureArrivalNotifications {
  emails: RamlContactsTravelerDepartureArrivalNotificationsEmail;
  isRegisteredEmail: boolean;
}
/**
 * @param address メールアドレスを小文字に変換した文字列
 * @param recipient 発着通知メール受信者名
 * @param lang 送信言語
 */
export interface RamlContactsTravelerDepartureArrivalNotificationsEmail {
  address: string;
  recipient: string;
  lang: string;
}
/**
 * @param id SSR CTCEのID
 * @param address メールアドレス。ただし、リクエストパラメータのマスキング要否がtrueの場合、先頭3桁以外をアスタリスクでマスキングした文字列。falseの場合、加工なしの文字列を返却する
 * @param encryptedAddress 暗号化済みメールアドレス。リクエストパラメータのマスキング要否がtrueの場合のみ値を返却する
 */
export interface RamlContactsTravelerContactEmails {
  id: string;
  address: string;
  encryptedAddress: string;
}

/**
 * @param phones  2件目緊急時連絡先の電話番号情報
 * @param ownerOfPhone 電話番号の持ち主
 */
export interface RamlContactsTravelerSecondContact {
  phones: RamlContactsPhones;
  ownerOfPhone: string;
}
/**
 * 予約詳細画面におけるFFP情報。GET /purchase/orders/{orderId}のdata.frequentFlyerCards
 * @param id FFP情報のID
 * @param companyCode キャリアコード
 * @param cardNumber FFP会員番号リクエストパラメータのマスキング要否がtrueの場合、下4桁以外をアスタリスクでマスキングした文字列。falseの場合、加工なしの文字列を返却する
 * @param encryptedCardNumber 暗号化済みFFP会員番号。リクエストパラメータのマスキング要否がtrueの場合のみ値を返却する。
 * @param tierLevel NHのtierレベルのみ返却する※優先度は上からとする。
 */
export interface RamlFrequentFlyerCards {
  id?: string;
  companyCode: string;
  cardNumber: string;
  encryptedCardNumber?: string;
  tierLevel?: string;
}

/**
 * TravelerのFY25からの追加項目
 * @param 年齢
 * @param 暗号化済み年齢
 * @param disabilityDiscountInfomation 障がい者割運賃情報
 * @param isDisabilityDiscountInformationRegistered 障がい者割運賃情報登録有無
 * @param islandCard アイきっぷ運賃情報
 * @param isIslandCardRegistered アイきっぷ運賃情報登録有無
 */
export interface RamlTravelerFY25 {
  age?: string;
  encryptedAge?: string;
  disabilityDiscountInfomation?: RamlTravelerFY25DisabilityDiscountInformation;
  isDisabilityDiscountInformationRegistered?: boolean;
  islandCard?: RamlTravelerFY25IslandCard;
  isIslandCardRegistered?: boolean;
}

/**
 * TravelerのFY25からの追加項目 障がい者情報
 * @param disabilityType 障がい者種別 grade1：本人第1種 grade2：本人第2種 mentalDisability：精神障がい caregiver：介助者
 * @param careReceiverTravelerId 被介助者搭乗者ID※障がい者種別において"caregiver"を選択した場合のみ設定
 */
export interface RamlTravelerFY25DisabilityDiscountInformation {
  disabilityType: string;
  careReceiverTravelerId?: string;
}
/**
 * TravelerのFY25からの追加項目 アイきっぷ運賃情報
 * @param number 離島カード番号 英数字20文字以内
 */
export interface RamlTravelerFY25IslandCard {
  number: string;
}
