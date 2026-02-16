import { CurrentCartModel } from '@common/store';
import { PlansGetPlansResponsePlansInner } from 'src/sdk-reservation';

/** 空港(国際化)キャッシュ */
export type PlanListMAirportI18nList = {
  [key: string]: string;
};

/**
 * サービス申し込み状況
 * - requested: 申し込み済み
 */
export type PlanListServiceStatus = (typeof PlanListServiceStatus)[keyof typeof PlanListServiceStatus];
export const PlanListServiceStatus = {
  REQUESTED: 'requested',
} as const;

/**
 * 処理種別
 * - merge: マージ
 */
export type PlanListProcessType = (typeof PlanListProcessType)[keyof typeof PlanListProcessType];
export const PlanListProcessType = {
  MERGE: 'merge',
} as const;

/**
 * クエリパラメータ
 * - temp: 他端末引継ぎ一時会員番号
 */
export type PlanListQueryParam = (typeof PlanListQueryParam)[keyof typeof PlanListQueryParam];
export const PlanListQueryParam = {
  TEMP: 'temp',
} as const;

/** 表示用プランリスト */
export interface PlanListCurrentPlan {
  cartId: string;
  isValid: boolean;
  isMerged: boolean;
  planName: string;
  createOn: string;
  saveUntil: string;
  finishGetCart: boolean;
  planData?: PlansGetPlansResponsePlansInner;
  cartList: PlanListCurrentCart;
}

/** 表示用カートリスト */
export interface PlanListCurrentCart {
  cartId: string;
  isValid: boolean;
  isChangedPlan: boolean;
  isDelayed: boolean;
  isEarlyFlight: boolean;
  boundList: Array<PlanListBoundReturn>;
  curPassenger: PlanListNumPerType;
  prePassenger: PlanListNumPerType;
  curTotalPrice?: number;
  preTotalPrice?: number;
  curCurrencyCode: string;
  preCurrencyCode: string;
  diffTotalPrice: boolean;
  isDiff: boolean;
  cartData?: CurrentCartModel;
}

/** 表示用バウンドリスト */
export interface PlanListBoundReturn {
  curDep?: string;
  preDep?: string;
  curDepEst?: string;
  preDepEst?: string;
  curDepAirportName?: string;
  preDepAirportName?: string;
  curArv?: string;
  preArv?: string;
  curArvEst?: string;
  preArvEst?: string;
  curDayDiff: string;
  curDayDiffMinusOne: boolean;
  preDayDiff: string;
  preDayDiffMinusOne: boolean;
  curArvAirportName?: string;
  preArvAirportName?: string;
  segment: Array<PlanListSegment>;
  isDelayed: boolean;
  isEarly: boolean;
  isBaggage: boolean;
  isLounge: boolean;
  isMeal: boolean;
  isDepertureEstimate: boolean;
  isArrivalEstimate: boolean;
  isLateNightDeparture: boolean;
  diffFlg: PlanListDiffFlg;
  isDiff: boolean;
}

/** 表示用セグメントリスト */
export interface PlanListSegment {
  curflightName?: string;
  preflightName?: string;
  diffSeg?: boolean;
}

/** セグメント情報 */
export interface PlanListSegmentInfo {
  segment?: Array<PlanListSegment>;
}

/** プランリスト差分リスト */
export interface PlanListDiffFlg {
  diffDep: boolean;
  diffDepEst: boolean;
  diffArv: boolean;
  diffArvEst: boolean;
  arvDayDiff: boolean;
  diffBaggage: boolean;
  diffLounge: boolean;
  diffMeal: boolean;
}

/** 差分情報 */
export interface PlanListDiffInfo {
  diffFlg?: PlanListDiffFlg;
  isDiff?: boolean;
}

/** 搭乗者情報 */
export interface PlanListPassengerInfo {
  curPassenger?: PlanListNumPerType;
  prePassenger?: PlanListNumPerType;
  diffPassenger?: boolean;
}

/** 搭乗者人数 */
export interface PlanListNumPerType {
  ADT?: number;
  B15?: number;
  CHD?: number;
  INF?: number;
}

/** プラン選択 */
export interface PlanListSelect {
  index: number;
  name: string;
  checked: boolean;
  cartId: string;
}
