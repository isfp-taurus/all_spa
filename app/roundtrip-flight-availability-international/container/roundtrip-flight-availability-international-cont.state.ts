import { BehaviorSubject } from 'rxjs';
import { RoundtripOwdState } from '@common/store/roundtrip-owd';
import { UpgradeAvailabilityState } from '@common/store/upgrade-availability';
import { HistoryFavoriteGetResponse } from 'src/sdk-search';
import { DisplayInfoJSON } from '../presenter/roundtrip-flight-availability-international-pres.state';

export interface RoundtripFlightAvailabilityInternationalDynamicParams {
  // 往復指定日空席照会（OWD）用API応答
  roundtripOwdReply?: RoundtripOwdState;
  // 空席照会時アップグレード可否照会レスポンス
  upgradeAvailabilityReply?: UpgradeAvailabilityState;
  // 履歴・お気に入り情報取得レスポンス
  historyFavoriteReply?: HistoryFavoriteGetResponse;
  // 画面情報JSON
  pageContext?: DisplayInfoJSON;
}
export function defaultRoundtripFlightAvailabilityInternationalDynamicParams(): RoundtripFlightAvailabilityInternationalDynamicParams {
  return {
    roundtripOwdReply: undefined,
    upgradeAvailabilityReply: undefined,
    historyFavoriteReply: undefined,
    pageContext: undefined,
  };
}

export const dynamicSubject = new BehaviorSubject<RoundtripFlightAvailabilityInternationalDynamicParams>(
  defaultRoundtripFlightAvailabilityInternationalDynamicParams()
);

// 往復指定日空席照会（OWD）用API応答
let roundtripOwdReply: RoundtripOwdState | undefined = undefined;
// 空席照会時アップグレード可否照会レスポンス
let upgradeAvailabilityReply: UpgradeAvailabilityState | undefined = undefined;
// 履歴・お気に入り情報取得レスポンス
let historyFavoriteReply: HistoryFavoriteGetResponse | undefined = undefined;
// 画面情報JSON
let pageContext: DisplayInfoJSON | undefined = undefined;

// 往復指定日空席照会（OWD）用API応答
export function updateDynamicSubjectRoundtripOwd(roundtripOwdParam: RoundtripOwdState): void {
  roundtripOwdReply = roundtripOwdParam;
  setDynamicSubject();
}

// 空席照会時アップグレード可否照会レスポンス
export function updateDynamicSubjectUpgradeAvailability(upgradeAvailabilityParam: UpgradeAvailabilityState): void {
  upgradeAvailabilityReply = upgradeAvailabilityParam;
  setDynamicSubject();
}

// 履歴・お気に入り情報取得レスポンス
export function updateDynamicSubjectGetHistoryFavorite(getHistoryFavoriteParam: HistoryFavoriteGetResponse): void {
  historyFavoriteReply = getHistoryFavoriteParam;
  setDynamicSubject();
}

// 画面情報JSON
export function updateDynamicSubjectPageContext(pageContextParam: DisplayInfoJSON): void {
  pageContext = pageContextParam;
  setDynamicSubject();
}

// 動的文言判定用情報設定
function setDynamicSubject() {
  dynamicSubject.next({
    roundtripOwdReply: roundtripOwdReply,
    upgradeAvailabilityReply: upgradeAvailabilityReply,
    historyFavoriteReply: historyFavoriteReply,
    pageContext: pageContext,
  });
}

// 動的文言判定用情報をクリア
export function clearDynamicSubject() {
  roundtripOwdReply = undefined;
  upgradeAvailabilityReply = undefined;
  historyFavoriteReply = undefined;
  pageContext = undefined;
}
