import { AswCommonType } from '../../interfaces';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ASW_COMMON_STORE_NAME, AswCommonState } from './asw-common.state';

/** Select AswCommon State */
export const selectAswCommonState = createFeatureSelector<AswCommonState>(ASW_COMMON_STORE_NAME);

export const selectAswCommonPage = createSelector(selectAswCommonState, (state) => state.pageId);
export const selectAswCommonSubpage = createSelector(selectAswCommonState, (state) => state.subPageId);
export const selectAswCommonFunction = createSelector(selectAswCommonState, (state) => state.functionId);
export const selectAswCommonSubFunction = createSelector(selectAswCommonState, (state) => state.subFunctionId);
/**
 * ページID、部品IDの変更検知のみを行うselector
 */
export const selectAswCommonPageFunc = createSelector(
  selectAswCommonPage,
  selectAswCommonFunction,
  (state1, state2) => {
    return { [AswCommonType.PAGE_ID]: state1, [AswCommonType.FUNCTION_ID]: state2 };
  }
);
export const selectAswCommonSubPageFunc = createSelector(
  selectAswCommonSubpage,
  selectAswCommonSubFunction,
  (state1, state2) => {
    return { [AswCommonType.SUB_PAGE_ID]: state1, [AswCommonType.SUB_FUNCTION_ID]: state2 };
  }
);
