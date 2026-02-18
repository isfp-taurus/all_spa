import { AswPageOutputUpsell, ApiErrorMap } from '@common/interfaces';
import { MasterStoreKey } from '@conf/asw-master.config';
import { ModalType } from '@lib/components';
import { AmcLoginHeaderComponent } from '@lib/components/shared-ui-components/amc-login/amc-login-header.component';
import { AmcLoginComponent } from '@lib/components/shared-ui-components/amc-login/amc-login.component';
import { ModalIdParts } from '@lib/services';
import { DisplayInfoJSON as AswPageOutputSearchCriteria } from '@app/roundtrip-flight-availability-international/presenter/roundtrip-flight-availability-international-pres.state';
import { BehaviorSubject } from 'rxjs';
import { PlansGetPlansResponse, PostGetCartResponse } from 'src/sdk-reservation';
import { FareConditionsState } from '@common/store/fare-conditions/fare-conditions.state';
import { RoundtripOwdState } from '@common/store/roundtrip-owd/roundtrip-owd.state';
import { ErrorCodeConstants } from '@conf/app.constants';

/**
 * 一時URLクエリパラメータキー
 */
export const TEMP_URL_KEY = 'temp';

/**
 * contコンポーネントで使用するキャッシュ
 * @returns キャッシュ情報
 */
export function getPlanReviewContComponentMasterKey() {
  return [{ key: MasterStoreKey.OFFICE_ALL, fileName: 'Office_All' }];
}

/**
 * AMCログインモーダル表示用part
 * @returns
 */
export function planReviewAmcloginModalPayloadParts(): ModalIdParts {
  return {
    id: 'AmcLoginComponent',
    content: AmcLoginComponent,
    header: AmcLoginHeaderComponent,
    closeBackEnable: false,
    type: ModalType.TYPE1,
  };
}

/** 画面情報JSON */
export type DisplayInfoJSON = {
  /** 検索条件 */
  searchCriteria?: AswPageOutputSearchCriteria;
  /** アップセルオファー情報 */
  Upsell?: AswPageOutputUpsell;
  /** アップセル済みフラグ */
  isUpsellApplied?: boolean;
  /** PayPal使用可否 */
  isPaypalAvailable?: boolean;
};

/**
 * 動的文言に渡すパラメータ
 * @param getPlansReply プラン情報
 * @param getCartReply カート情報
 * @param roundtripOwdReply 往復指定日空席照会(OWD)用レスポンス情報
 * @param fareConditionsReply 運賃ルール・手荷物情報取得レスポンス情報
 * @param dynamicContextOfficeInfo ユーザ共通.操作オフィスコードに紐づくオフィス情報
 * @param pageContext 画面情報JSON
 */
export interface PlanReviewDynamicParams {
  getPlansReply?: PlansGetPlansResponse;
  getCartReply?: PostGetCartResponse;
  roundtripOwdReply?: RoundtripOwdState;
  fareConditionsReply?: FareConditionsState;
  dynamicContextOfficeInfo?: any;
  pageContext: DisplayInfoJSON;
}
export function defaultPlanReviewDynamicParams(): PlanReviewDynamicParams {
  return {
    getPlansReply: undefined,
    getCartReply: undefined,
    roundtripOwdReply: undefined,
    fareConditionsReply: undefined,
    pageContext: {
      searchCriteria: undefined,
      Upsell: undefined,
      isUpsellApplied: false,
      isPaypalAvailable: false,
    },
  };
}

/**
 * 予約可否判断APIのエラーレスポンスに対するエラーマップ
 */
export const GetOrdersReservationAvailabilityApiErrorMap: ApiErrorMap = {
  [ErrorCodeConstants.ERROR_CODES.EBAZ000278]: {
    isRetryableError: true,
    errorMsgId: 'E0333', // カート取得失敗
  },
  [ErrorCodeConstants.ERROR_CODES.EIFA000006]: {
    isRetryableError: true,
    errorMsgId: 'EA015', // 該当データなし
  },
  [ErrorCodeConstants.ERROR_CODES.EIFA000007]: {
    isRetryableError: true,
    errorMsgId: 'EA023', // 会員が存在しない
  },
  [ErrorCodeConstants.ERROR_CODES.EIFA000011]: {
    isRetryableError: true,
    errorMsgId: 'EA016', // 会員が存在しない
  },
  [ErrorCodeConstants.ERROR_CODES.EIFA000008]: {
    isRetryableError: true,
    errorMsgId: 'EA019', // 退会会員
  },
  [ErrorCodeConstants.ERROR_CODES.EIFA000009]: {
    isRetryableError: true,
    errorMsgId: 'EA058', // マイル残高不足
  },
  [ErrorCodeConstants.ERROR_CODES.EIFA000010]: {
    isRetryableError: true,
    errorMsgId: 'EA026', // 1SEG1PAX以外で連携されてきた場合
  },
  [ErrorCodeConstants.ERROR_CODES.FIFA000001]: {
    isRetryableError: false,
    errorMsgId: 'EA019', // ifly接続エラー(想定外エラー)
  },
};

export const dynamicSubject = new BehaviorSubject<PlanReviewDynamicParams>(defaultPlanReviewDynamicParams());
