import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NOT_ELIGIBLE_INFORMATION_STORE_NAME, NotEligibleInformationState } from './not-eligible-information.state';

/** Select NotEligibleInformation State */
export const selectNotEligibleInformationState = createFeatureSelector<NotEligibleInformationState>(
  NOT_ELIGIBLE_INFORMATION_STORE_NAME
);
