import { AsyncStoreItem } from '@lib/store';

/**
 * PlanReview model
 */
export interface PlanReviewModel {
  /** 前画面情報 */
  previousPage?: string;
  /** 画面情報更新要否 */
  isNeedRefresh?: boolean;
  /** カート取得完了フラグ */
  isCartGot?: boolean;
  /** プランリスト取得完了フラグ */
  isPlanListGot?: boolean;
  /** 操作オフィス変更完了フラグ */
  isRightOffice?: boolean;
  /** 香港・韓国モーダル同意フラグ */
  isHkKrAgreed?: boolean;
  /** 差分強調表示存在フラグ */
  isPlanChanged?: boolean;
  /** プラン確認画面に表示する現在日時 */
  currentDate?: string;
  /** 初期表示準備完了フラグ */
  isAllReadyToShow: boolean;
  /** アップセル適用状況 */
  upsellStatus: PlanReviewModelUpsellStatus;
}

/**
 * PlanReview model - アップセル適用状況
 */
export interface PlanReviewModelUpsellStatus {
  // 往路アップセル済み判定
  isOutboundUpselled: boolean;
  // 往路アップセルairOfferId
  outUpselledAirOfferId?: string;
  // 復路アップセル済み判定
  isInboundUpselled: boolean;
  // 復路アップセルairOfferId
  inUpselledAirOfferId?: string;
  // 初期表示時airOfferId
  primaryAirOfferId: string;
  // アップセルの動作種類
  upsellFunction?: UpsellFunctionType;
}

/** アップセルの動作種別*/
export type UpsellFunctionType = 'outUpsell' | 'outCancel' | 'inUpsell' | 'inCancel';
export const UpsellFunctionType = {
  OUT_UPSELL: 'outUpsell' as UpsellFunctionType,
  OUT_CANCEL: 'outCancel' as UpsellFunctionType,
  IN_UPSELL: 'inUpsell' as UpsellFunctionType,
  IN_CANCEL: 'inCancel' as UpsellFunctionType,
};

/**
 *  model details
 */
export interface PlanReviewStateDetails extends AsyncStoreItem {}

/**
 * PlanReview store state
 */
export interface PlanReviewState extends PlanReviewStateDetails, PlanReviewModel {}

/**
 * Name of the PlanReview Store
 */
export const PLAN_REVIEW_STORE_NAME = 'planReview';

/**
 * PlanReview Store Interface
 */
export interface PlanReviewStore {
  /** PlanReview state */
  [PLAN_REVIEW_STORE_NAME]: PlanReviewState;
}
