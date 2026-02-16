import { CamelToSnake, SnakeToCamelCase } from '@lib/interfaces';
import { SelectCompanyAccountResponse } from 'src/sdk-authorization';
/**
 * ANA Biz組織選択
 */
export interface SelectCompanyAccountModel extends SelectCompanyAccountResponse {}

/**
 * キーリスト @see {@link SelectCompanyAccountModel}
 * インターフェイスのキー かつ キー = valueの定義
 */
export type SelectCompanyAccountType = (typeof SelectCompanyAccountType)[keyof typeof SelectCompanyAccountType];
export const SelectCompanyAccountType: {
  [key in Uppercase<keyof Required<CamelToSnake<SelectCompanyAccountModel>>>]: SnakeToCamelCase<Lowercase<key>> &
    keyof SelectCompanyAccountModel;
} = {
  WARNINGS: 'warnings',
  DATA: 'data',
};
