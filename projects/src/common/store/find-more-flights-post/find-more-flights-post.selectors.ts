import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FIND_MORE_FLIGHTS_POST_NAME, FindMoreFlightsPostState } from './find-more-flights-post.state';

/** Select FindMoreFlightsPost State */
export const selectFindMoreFlightsPostState =
  createFeatureSelector<FindMoreFlightsPostState>(FIND_MORE_FLIGHTS_POST_NAME);

/** Select FindMoreFlightsPost isPending status */
export const selectFindMoreFlightsPostIsPendingStatus = createSelector(
  selectFindMoreFlightsPostState,
  (state) => !!state.isPending
);

/** Select FindMoreFlightsPost isFailure status */
export const selectFindMoreFlightsPostIsFailureStatus = createSelector(
  selectFindMoreFlightsPostState,
  (state) => !!state.isFailure
);
