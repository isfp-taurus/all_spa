import { PostGetCartResponse } from 'src/sdk-reservation';

/**
 * NotEligibleInformation model
 */
export interface NotEligibleInformationModel {
  searchMethodSelection: string; // 検索方法選択
  reservationNumber: string; // 予約番号
  passengerName: {
    firstName: string; // 搭乗者名(名)
    lastName: string; // 搭乗者名(姓)
  };
  collaborationSiteId: string; // 連携サイトID
  errorId: string; // エラーID
}

/**
 * NotEligibleInformation model details
 */
export interface NotEligibleInformationStateDetails extends NotEligibleInformationModel {}

/**
 * NotEligibleInformation store state
 */
export interface NotEligibleInformationState extends NotEligibleInformationStateDetails {}

/**
 * Name of the NotEligibleInformation Store
 */
export const NOT_ELIGIBLE_INFORMATION_STORE_NAME = 'notEligibleInformation';

/**
 * NotEligibleInformation Store Interface
 */
export interface NotEligibleInformationStore {
  /** NotEligibleInformation state */
  [NOT_ELIGIBLE_INFORMATION_STORE_NAME]: NotEligibleInformationState;
}
