export type ServicingPageIdType = (typeof ServicingPageIdType)[keyof typeof ServicingPageIdType];
export const ServicingPageIdType = {
  /** S01 予約確認 */
  BOOKING_SEARCH: 'P010',
  /** 予約一覧 */
  BOOKING_LIST: 'P020',
  /** ANA Biz 発券申請一覧 */
  ANA_BIZ_APPLICATION_LIST: 'P021',
  /** 予約詳細 */
  MY_BOOKING: 'P030',
  /** 予約詳細(旅程) */
  MYBOOKING_ITINERARY: 'P031',
  /** 予約詳細(搭乗者) */
  MYBOOKING_PASSENGER: 'P032',
  /** 予約詳細(サービス) */
  MYBOOKING_SERVICE: 'P033',
  /** 規約 */
  AGREEMENT: 'M034',
  /** 搭乗者情報入力 */
  PASSENGER_INFORMATION_INPUT: 'M010',
  /** ラウンジ申込 */
  LOUNGE_SERVICE_REQUEST: 'M015',
  /** 手荷物申込 */
  BAGGAGE_REQUEST: 'M016',
  /** 機内食申込 */
  FLIGHT_MEA_REQUEST: 'M017',

  /** S02 サービス申込 */
  /** マイカーバレー申込 */
  MY_CAR_VALET_REQUEST: 'P011',
  /** ペットらくのり申込 */
  PET_EASY_TRAVEL_REQUEST: 'P012',
  /** ジュニアパイロット申込 */
  JUNIOR_PILOT_REQUEST: 'P013',
  /** Ancillary支払情報入力 */
  SERVICE_REQUEST_PAYMENT_INPUT: 'P020',
  /** AMCパスワード入力 */
  SERVICE_REQUEST_PAYMENT_INPUT_AMC_PASSWORD_INPUT: 'P081',

  /** S03 シートマップ */
  /** シートマップ */
  SEATMAP: 'P010',
  /** 座席属性指定 */
  SEAT_ATTRIBUTE_REQUEST: 'P020',
  /** シートマップ（参照） */
  INFORMATIVE_SEATMAP: 'P030',

  /** S05 ドキュメント表示 */
  /** 領収書検索 */
  RECEIPT_SEARCH: 'P010',
  /** 領収書選択 */
  RECEIPT_SELECT: 'P011',
  /** 搭乗証明書検索 */
  BOARDING_CERTIFICATE_SEARCH: 'P020',
  /** 搭乗証明書表示 */
  BOARDING_CERTIFICATE_SELECT: 'P021',
  /** EMD検索 */
  EMD_SEARCH: 'P030',
  /** Eチケット/EMDお客様控え表示 */
  EMD_SELECT: 'P031',
  /** ANA BIZ ご利用明細書表示 */
  ANABIZ_USAGE_STATEMENT_SELECT: 'P040',

  /** S06 リダイレクト案内 */
  /** 免税品プリオーダー案内 */
  DUTY_FREE_PREORDER_GUIDANCE: 'P010',
  /** ヤマト手荷物案内 */
  YAMATO_BAGGAGE_GUIDANCE: 'P020',

  /** S07 予約基本情報 */
  /** 予約基本情報登録 */
  RESERVATION_BASIC_INFORMATION_INPUT: 'P010',

  /** チェックイン搭乗者情報入力 */
  CHECKIN_PASSENGER_INPUT: 'P030',
} as const;
