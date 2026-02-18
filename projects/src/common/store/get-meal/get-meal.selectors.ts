import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GET_MEAL_STORE_NAME, GetMealState } from './get-meal.state';

/** Select GetMeal State */
export const selectGetMealState = createFeatureSelector<GetMealState>(GET_MEAL_STORE_NAME);

/** Select GetMeal isPending status */
export const selectGetMealIsPendingStatus = createSelector(selectGetMealState, (state) => !!state.isPending);

/** Select GetMeal isFailure status */
export const selectGetMealIsFailureStatus = createSelector(selectGetMealState, (state) => !!state.isFailure);
