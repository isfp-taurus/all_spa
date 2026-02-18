import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  GET_CREDIT_PAN_INFORMATION_STORE_NAME,
  GetCreditPanInformationState,
} from './get-credit-pan-information.state';

/** Select GetCreditPanInformation State */
export const selectGetCreditPanInformationState = createFeatureSelector<GetCreditPanInformationState>(
  GET_CREDIT_PAN_INFORMATION_STORE_NAME
);

/** Select GetCreditPanInformation isPending status */
export const selectGetCreditPanInformationIsPendingStatus = createSelector(
  selectGetCreditPanInformationState,
  (state) => !!state.isPending
);

/** Select GetCreditPanInformation isFailure status */
export const selectGetCreditPanInformationIsFailureStatus = createSelector(
  selectGetCreditPanInformationState,
  (state) => !!state.isFailure
);
