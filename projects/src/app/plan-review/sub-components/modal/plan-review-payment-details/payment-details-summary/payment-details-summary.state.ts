export type PaymentDetailsSummaryAmountType =
  (typeof PaymentDetailsSummaryAmountType)[keyof typeof PaymentDetailsSummaryAmountType];
export const PaymentDetailsSummaryAmountType = {
  DEL: 'del',
  DIFF: 'diff',
  NONE: '',
} as const;
/**
 * @param totalAmount 支払総額,
 * @param amountType 支払総額差分フラグ
 * @param originalTotal プロモーションコード適用前支払総額
 * @param travelersSummaryStr　搭乗者種別毎の人数を結合した文字列
 * @param promotionCode:プロモーションコード
 * @param totalFare　運賃総額
 * @param totalFalightSurcharge 運賃総額(フライトサーチャージ総額併記)
 * @param airTransportationCharges 燃油特別付加運賃等
 * @param totalTax 税金総額
 * @param thirdPartyCharges 各国諸税・空港使用料等
 * @param ancillaryTotalWithoutTax Ancillaryサービス税抜総額
 * @param ancillaryTotalTax:Ancillaryサービス税金総額
 * @param alertLabelTxt 香港発着セグメントに対する注釈
 * @param currencyCode 通貨コード
 */
export interface PaymentDetailsSummaryData {
  totalAmount: number;
  amountType: PaymentDetailsSummaryAmountType;
  originalTotal: number;
  travelersSummaryStr: string;
  promotionCode: string;
  totalFare: number;
  totalFlightSurcharge: number;
  airTransportationCharges: number;
  totalTax: number;
  thirdPartyCharges: number;
  ancillaryTotalWithoutTax: number;
  ancillaryTotalTax: number;
  alertLabelTxt: Array<string>;
  currencyCode: string | undefined;
}
