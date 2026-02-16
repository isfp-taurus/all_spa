import { ErrorPageRoutes } from '@lib/interfaces';

/**
 * 共通のRoutes定義
 */
const COMMON = 'common' as const;
export const RoutesCommon = {
  /** 共通パス */
  COMMON: COMMON,
  /** 共通エラー画面 */
  SERVICE_ERROR: `${COMMON}/${ErrorPageRoutes.SERVICE}`,
  /** システムエラー画面 */
  SYSTEM_ERROR: `${COMMON}/${ErrorPageRoutes.SYSTEM}`,
  /** セッションタイムアウトエラー画面 */
  SESSION_TIMEOUT_ERROR: `${COMMON}/${ErrorPageRoutes.SESSION_TIMEOUT}`,
  /** ブラウザバックエラー画面 */
  BROWSER_BACK_ERROR: `${COMMON}/${ErrorPageRoutes.BROWSER_BACK}`,
} as const;

// FIXME: 各APPごとに指定する
// TODO: テスト完了後に削除 START
/**
 * HelloWorldのRoutes定義
 */
export const RoutesHelloWorld = {
  HELLOWORLD: 'helloWorld',
  TEST: 'test',
  TESTSSN: 'testSsn',
  TESTHTTP: 'testHttp',
} as const;
// TODO: テスト完了後に削除 END

/**
 * 各画面のURL定義
 * @param ORGANIZATION_SELECT R02P011 ANA Biz組織選択
 * @param LOGIN R02P010 ANA Bizログイン画面
 * @param LOGOUT R02P012 ANA Bizログアウト
 * @param FLIGHT_SEARCH R01P010 フライト検索
 * @param CAPTCHA R01P020 キャプチャ認証
 * @param ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL R01P030 往復空席照会結果(国際)
 * @param ROUNDTRIP_FLIGHT_AVAILABILITY_DOMESTIC R01P031 往復空席照会結果(国内)
 * @param COMPLEX_FLIGHT_CALENDA R01P032 複雑カレンダー
 * @param COMPLEX_FLIGHT_AVAILABILITY R01P033 複雑空席照会結果
 * @param COMPLEX_MORE_FLIGHTS R01P034 Find more Flights
 * @param PLAN_REVIEW R01P040 プラン確認
 * @param PLAN_LIST R01P042 プランリスト
 * @param PET_RESERVATION_INFORMATION_REQUEST R01P054 ペットらくのり
 * @param BOOKING_SEARCH S01-P042 予約確認
 * @param SEATMAP R01P070 シートマップ
 * @param SEAT_ATTRIBUTE_REQUEST R01P071 座席属性指定
 * @param PAYMENT_INPUT R01P080 支払情報入力
 * @param ANABIS_PAYMENT_INPUT R01P083 ANA Biz支払情報入力
 * @param BOOKING_COMPLETED R01P090 予約・購入完了
 * @param ORGANIZATION_SELECT R02P011 ANA Biz組織選択
 * @param LOGIN R02P010 ANA Bizログイン画面
 * @param LOGOUT R02P012 ANA Bizログアウト
 * @param GOSHOKAI_NET_LOGIN R02P020 ご紹介ねっと入口
 */
export const RoutesResRoutes = {
  /** R02P011 ANA Biz組織選択 */
  ORGANIZATION_SELECT: 'organization-select',
  /** R02P010 ANA Bizログイン画面 */
  LOGIN: 'login',
  /** R02P012 ANA Bizログアウト */
  LOGOUT: 'logout',
  /**R01P010 フライト検索 */
  FLIGHT_SEARCH: 'flight-search',
  /** R01P020 キャプチャ認証 */
  CAPTCHA: 'captcha',
  /** R01P030 往復空席照会結果(国際) */
  ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL: 'roundtrip-flight-availability-international',
  /** R01P031 往復空席照会結果(国内) */
  ROUNDTRIP_FLIGHT_AVAILABILITY_DOMESTIC: 'roundtrip-flight-availability-domestic',
  /** R01P032 複雑カレンダー */
  COMPLEX_FLIGHT_CALENDAR: 'complex-flight-calendar',
  /** R01P033 複雑空席照会結果 */
  COMPLEX_FLIGHT_AVAILABILITY: 'complex-flight-availability',
  /** R01P034 Find more Flights */
  COMPLEX_MORE_FLIGHTS: 'complex-more-flights',
  /** R01P040 プラン確認 */
  PLAN_REVIEW: 'plan-review',
  /** R01P042 プランリスト */
  PLAN_LIST: 'plan-list',
  /** R01P054 ペットらくのり申込 */
  PET_RESERVATION_INFORMATION_REQUEST: 'pet-reservation-information-request',
  /** S01-P042 予約確認 */
  BOOKING_SEARCH: 'booking-search',
  /** R01P070 シートマップ */
  SEATMAP: 'seatmap',
  /** R01P071 座席属性指定 */
  SEAT_ATTRIBUTE_REQUEST: 'seat-attribute-request',
  /** R01P080 支払情報入力 */
  PAYMENT_INPUT: 'payment-input',
  /** AMOPレスポンス用ページ */
  PAYMENT_INPUT_AMOP_RESPONSE_BLANK_PAGE: 'payment-input-amop-response-blank-page',
  /** R01P083 ANA Biz支払情報入力 */
  ANABIZ_PAYMENT_INPUT: 'biz-payment-input',
  /** R01P090 予約・購入完了 */
  BOOKING_COMPLETED: 'booking-completed',
  /** R02P010 ANA_Bizログイン画面 */
  ANABIZ_LOGIN: 'anabiz-login',
  /** R02P010 ANA_Bizログイン画面 （シームレスログインのみ) */
  ANABIZ_SEAMLESS_LOGIN: 'anabiz-seamless-login',
  /** R02P012 ANA_Bizログアウト画面 */
  ANABIZ_LOGOUT: 'anabiz-logout',
  /** R02P020 ご紹介ねっと入口 */
  GOSHOKAI_NET_LOGIN: 'goshokai-net-login',
} as const;

/**
 * プロモーションモードでローディング画面を表示する対象のRoutes指定
 */
export const LOADING_MODE_PROMOTION_ROUTES: string[] = [];

export const SERVICING_ROUTES = {
  /** S01 予約確認 */
  /** 予約詳細　*/
  myBooking: 'mybooking',
  /** P010 予約検索 */
  bookingSearch: 'booking-search',
  /** P020 予約一覧 */
  bookingList: 'booking-list',
  /** P021 ANA Biz 発券申請一覧 */
  anabizTicketingApplicationList: 'anabiz-ticketing-application-list',
  /** P031 予約詳細(旅程) */
  myBookingItinerary: 'my-booking-itinerary',

  /** S02 マイカーバレー申込 */
  /** P011 マイカーバレー申込 */
  myCarValetInput: 'my-car-valet-input',
  /** P012 ペットらくのり申込 */
  petInput: 'pet-input',
  /** P013 ジュニアパイロット申込 */
  juniorPilotInput: 'junior-pilot-input',
  /** P020 Ancillary支払情報入力 */
  ancillaryPaymentInput: 'ancillary-payment-input',
  centrairValleyParking: 'centrair-valley-parking',
  /** P030 Ancillary購入完了 */
  serviceRequestCompleted: 'service-request-completed',
  /** Ancillary支払情報入力 */
  serviceRequestPaymentInput: 'service-request-payment-input',
  /** AMOPレスポンス用ページ */
  paymentInputAmopResponseBlankPage: 'payment-input-amop-response-blank-page',

  /** S03 アップグレード */
  /** P010 シートマップ */
  seatMap: 'seatmap',
  /** P020 座席属性指定 */
  seatAttributeRequest: 'seat-attribute-request',
  /** P030 シートマップ（参照） */
  informativeSeatmap: 'informative-seatmap',

  /** S05 ドキュメント表示 */
  /** 領収書検索 */
  receiptSearch: 'receipt-search',
  /** 領収書選択 */
  receiptSelect: 'receipt-select',
  /** 搭乗証明書検索 */
  boardingCertificateSearch: 'boarding-certificate-search',
  /** 搭乗証明書表示 */
  boardingCertificateSelect: 'boarding-certificate-select',
  /** EMD検索 */
  emdSearch: 'emd-search',
  /** eチケット/EMDお客様控え表示 */
  emdSelect: 'emd-select',
  /** ANA Biz ご利用明細書表示 */
  anabizUsageStatementSelect: 'anabiz-usage-statement-select',

  /** S06 リダイレクト案内 */
  /** 免税品プリオーダー案内 */
  dutyFreePreorderGuidance: 'duty-free-preorder-guidance',
  /** ヤマト手荷物案内 */
  yamatoBaggageGuidance: 'yamato-baggage-guidance',

  /** S07 予約基本情報 */
  /** 予約基本情報登録 */
  reservationBasicInformationInput: 'reservation-basic-information-input',

  /** E01 発券後予約変更 */
  /** P010 フライト検索 */
  flightSearch: 'change-flight-search',

  /** E02 イレギュラー振替 */
  /** P030 振替内容確認 */
  involuntaryReview: 'involuntary-review',
  /** P010 フライト検索 */
  involuntaryFlightSearch: 'involuntary-flight-search',

  /** E03 解約 */
  /** P010 払戻情報入力 */
  refundInput: 'refund-input',
  /** P020 解約完了 */
  refundCompleted: 'refund-completed',

  /** E04 アップグレード */
  /** P010 アップグレード対象フライト選択 */
  upgradeFlightSelect: 'upgrade-flight-select',

  /** R01 新規予約 */
  /** P080 支払情報入力 */
  paymentInput: 'payment-input',

  /** C01 オンラインチェックイン */
  /** P010 チェックイン検索 */
  checkinSearch: 'checkin-search',
  /** P050 チェックイン確認 */
  checkinReview: 'checkin-review',

  /** C02 搭乗手続き */
  /** P010 チェックイン状況詳細 */
  checkinMybooking: 'checkin-mybooking',
} as const;
