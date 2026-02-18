import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { UpdatePlannameModel } from './update-planname.state';

/** StateDetailsActions */
const ACTION_SET = '[UpdatePlanname] set';
const ACTION_UPDATE = '[UpdatePlanname] update';
const ACTION_RESET = '[UpdatePlanname] reset';
const ACTION_FAIL = '[UpdatePlanname] fail';
const ACTION_CANCEL_REQUEST = '[UpdatePlanname] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[UpdatePlanname] set from api';
const ACTION_UPDATE_FROM_API = '[UpdatePlanname] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setUpdatePlanname = createAction(ACTION_SET, props<WithRequestId<UpdatePlannameModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateUpdatePlanname = createAction(ACTION_UPDATE, props<WithRequestId<Partial<UpdatePlannameModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetUpdatePlanname = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelUpdatePlannameRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failUpdatePlanname = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setUpdatePlannameFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<UpdatePlannameModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateUpdatePlannameFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<UpdatePlannameModel>>()
);
