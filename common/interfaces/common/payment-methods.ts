/**
 * 支払方法種別
 * @param ALIPAY Alipay
 * @param UNION_PAY 銀聯
 * @param CREDIT_CARD クレジットカード
 * @param ANA_SKY_COIN ANA Sky Coin
 * @param PAYPAL PayPal
 * @param CONVENIENCE_STORE コンビニエンスストア
 * @param INTERNET_BANKING インターネットバンキング
 * @param KEEP_MY_FARE Keep My Fare
 */
export type PaymentMethodsType = (typeof PaymentMethodsType)[keyof typeof PaymentMethodsType];
export const PaymentMethodsType = {
  ALIPAY: 'AP',
  UNION_PAY: 'CU',
  CREDIT_CARD: 'CD',
  ANA_SKY_COIN: 'SC',
  PAYPAL: 'PP',
  CONVENIENCE_STORE: 'CV',
  INTERNET_BANKING: 'IB',
  KEEP_MY_FARE: 'LD',
  PAY_EASY: 'PE',
  RESERVATION_ONLY: 'RE',
} as const;

/**
 * 支払方法コード
 * @param CREDIT_CARD クレジットカード
 * @param CONVENIENCE_STORE コンビニエンスストア
 * @param MIZUHO_BANK  みずほ銀行
 * @param MITSUI_SUMITOMO_BANK 三井住友銀行
 * @param MITSUBISHI_UFJ_BANK 三菱UFJ銀行
 * @param MITSUBISHI_UFJ_BANK ゆうちょ銀行
 */
export type PaymentMethodsCode = (typeof PaymentMethodsCode)[keyof typeof PaymentMethodsCode];
export const PaymentMethodsCode = {
  CREDIT_CARD: '001',
  CONVENIENCE_STORE: '021',
  MIZUHO_BANK: '060',
  MITSUI_SUMITOMO_BANK: '061',
  MITSUBISHI_UFJ_BANK: '063',
  YUCHO_BANK: '069',
} as const;
