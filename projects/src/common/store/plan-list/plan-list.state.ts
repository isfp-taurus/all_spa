import { PlanListCurrentPlan } from '@common/interfaces';
import { AsyncStoreItem } from '@lib/store';

/**
 * PlanList model
 */
export interface PlanListModel {
  /** プランリスト表示情報 */
  planList?: Array<PlanListCurrentPlan>;
  /** サブヘッダ更新要否フラグ */
  isNeedRefresh?: boolean;
  /** プランリスト更新フラグ */
  isChangePlanList?: boolean;
  /** ログイン後プランマージフラグ */
  isPlanMerge?: boolean;
  /** 再表示フラグ */
  isReInit?: boolean;
  /** ローディング終了フラグ */
  finishLoading?: boolean;
}

/**
 *  model details
 */
export interface PlanListStateDetails extends AsyncStoreItem {}

/**
 * PlanList store state
 */
export interface PlanListState extends PlanListStateDetails, PlanListModel {}

/**
 * Name of the PlanList Store
 */
export const PLAN_LIST_STORE_NAME = 'planList';

/**
 * PlanList Store Interface
 */
export interface PlanListStore {
  /** PlanList state */
  [PLAN_LIST_STORE_NAME]: PlanListState;
}
