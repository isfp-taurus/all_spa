import { PlansGetPlansResponsePlansInner } from 'src/sdk-reservation';

/**
 * ローカルプラン保存対象プロパティSet
 * ※想定外のプロパティを保存しないために規定
 */
export const localPlanPropertySet = new Set<keyof PlansGetPlansResponsePlansInner>([
  'cartId',
  'planName',
  'creationDate',
  'planExpiryDate',
  'planLastModificationDate',
  'prebookExpiryDate',
  'isUnsaved',
  'isPrebooked',
  'creationPointOfSaleId',
]);
