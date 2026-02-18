import { createAction, props } from '@ngrx/store';
import { AlertMessageItem } from '../../interfaces';
import { AlertMessageState } from './alert-message.state';

/** StateDetailsActions */
const ACTION_SET = '[AlertMessage] set';
const ACTION_ADD_WARNING = '[AlertMessage] add warning';
const ACTION_ADD_INFOMATION = '[AlertMessage] add infomation';
const ACTION_REMOVE_WARNING = '[AlertMessage] remove warning';
const ACTION_REMOVE_INFOMATION = '[AlertMessage] remove infomation';
const ACTION_ADD_SUB_WARNING = '[AlertMessage] add sub warning';
const ACTION_ADD_SUB_INFOMATION = '[AlertMessage] add sub infomation';
const ACTION_REMOVE_SUB_WARNING = '[AlertMessage] remove sub warning';
const ACTION_REMOVE_SUB_INFOMATION = '[AlertMessage] remove sub infomation';
const ACTION_REMOVE_ALL_WARNING = '[AlertMessage] remove all warning';
const ACTION_REMOVE_ALL_INFOMATION = '[AlertMessage] remove all infomation';
const ACTION_REMOVE_ALL_SUB_WARNING = '[AlertMessage] remove all sub warning';
const ACTION_REMOVE_ALL_SUB_INFOMATION = '[AlertMessage] remove all sub infomation';
const ACTION_REMOVE_ALL = '[AlertMessage] remove all';
const ACTION_REMOVE_ALL_SUB = '[AlertMessage] remove all sub';
const ACTION_UPDATE = '[AlertMessage] update';
const ACTION_RESET = '[AlertMessage] reset';

/**
 * 追加削除系
 */
export const setAlertMessage = createAction(ACTION_SET, props<AlertMessageState>());
export const addAlertWarningMessage = createAction(ACTION_ADD_WARNING, props<AlertMessageItem>());
export const addAlertInfomationMessage = createAction(ACTION_ADD_INFOMATION, props<AlertMessageItem>());
export const removeAlertWarningMessage = createAction(ACTION_REMOVE_WARNING, props<{ id: string }>());
export const removeAlertInfomationMessage = createAction(ACTION_REMOVE_INFOMATION, props<{ id: string }>());
export const addAlertSubWarningMessage = createAction(ACTION_ADD_SUB_WARNING, props<AlertMessageItem>());
export const addAlertSubInfomationMessage = createAction(ACTION_ADD_SUB_INFOMATION, props<AlertMessageItem>());
export const removeAlertSubWarningMessage = createAction(ACTION_REMOVE_SUB_WARNING, props<{ id: string }>());
export const removeAlertSubInfomationMessage = createAction(ACTION_REMOVE_SUB_INFOMATION, props<{ id: string }>());
export const removeAllAlertWarningMessage = createAction(ACTION_REMOVE_ALL_WARNING);
export const removeAllAlertInfomationMessage = createAction(ACTION_REMOVE_ALL_INFOMATION);
export const removeAllAlertSubWarningMessage = createAction(ACTION_REMOVE_ALL_SUB_WARNING);
export const removeAllAlertSubInfomationMessage = createAction(ACTION_REMOVE_ALL_SUB_INFOMATION);
export const removeAllAlertMessage = createAction(ACTION_REMOVE_ALL);
export const removeAllAlertSubMessage = createAction(ACTION_REMOVE_ALL_SUB);

/**
 * 更新系（多分使わない？）
 */
export const updateAlertMessage = createAction(ACTION_UPDATE, props<Partial<AlertMessageState>>());

/**
 * リセット
 */
export const resetAlertMessage = createAction(ACTION_RESET);
