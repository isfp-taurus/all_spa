import { TaxAllLangItem } from '@common/interfaces';

/**
 * 国コード + 税金名称を取得
 * @param taxData
 * @returns
 */
export function getTaxNameWithCountryCode(taxData: TaxAllLangItem): string {
  const name = taxData.tax_name ?? '';
  const countryCode = taxData.country_3letter_code ?? '';
  return [countryCode, name].join(' ');
}
