import { GetCompanyAccountsResponse } from 'src/sdk-authorization';

/**
 * 動的文言に渡すパラメータ
 * @param anaBizGetCompanyAccountsReply ANA Biz組織リスト取得
 */
export interface OrganizationSelectDynamicParams {
  anaBizGetCompanyAccountsReply?: GetCompanyAccountsResponse;
}
export function defaultOrganizationSelectDynamicParams(
  anaBizGetCompanyAccounts: GetCompanyAccountsResponse
): OrganizationSelectDynamicParams {
  return {
    anaBizGetCompanyAccountsReply: anaBizGetCompanyAccounts,
  };
}
