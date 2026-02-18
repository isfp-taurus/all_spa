import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DYNAMIC_CONTENT_STORE_NAME, DynamicContentState } from './dynamic-content.state';

/** Select DynamicContent State */
export const selectDynamicContentState = createFeatureSelector<DynamicContentState>(DYNAMIC_CONTENT_STORE_NAME);

/** Select subpage's DynamicContent State */
export const selectSubPageDynamicContent = createSelector(selectDynamicContentState, (state) => state.subPageInfo);

/** Select page's DynamicContent State */
export const selectPageDynamicContent = createSelector(selectDynamicContentState, (state) => state.pageInfo);
