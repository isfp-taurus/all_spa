export type ServicingFunctionIdType = (typeof ServicingFunctionIdType)[keyof typeof ServicingFunctionIdType];
export const ServicingFunctionIdType = {
  /** 予約確認 */
  BOOKING_CONFIRMATION: 'S01',
  /** サービス申込 */
  SERVICE_REQUEST: 'S02',
  /** シートマップ */
  SEATMAP: 'S03',
  /** 搭乗者情報入力 */
  PASSENGER_INFORMATION_REQUUEST: 'S04',
  /** ドキュメント表示 */
  DOCUMENT_DISPLAY: 'S05',
  /** リダイレクト案内 */
  REDIRECT_GUIDE: 'S06',
  /** 予約基本情報 */
  RESERVATION_BASIC_INFORMATION: 'S07',
  /** 新規予約 */
  SERVICE_REQUEST_PAYMENT_INPUT_PRIME_BOOKING: 'R01',
  ONLINE_CHECKING: 'C01',
} as const;
