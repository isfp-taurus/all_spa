import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './alert-message.actions';
import { AlertMessageState } from './alert-message.state';
import { state } from '@angular/animations';

/**
 * aswCommon initial state
 */
export const alertMessageInitialState: AlertMessageState = {
  warningMessage: [],
  infomationMessage: [],
  subWarningMessage: [],
  subInfomationMessage: [],
};

/**
 * List of basic actions for AlertMessage Store
 */
export const alertMessageReducerFeatures: ReducerTypes<AlertMessageState, ActionCreator[]>[] = [
  on(actions.setAlertMessage, (_state, payload) => ({ ...payload })),

  on(actions.addAlertWarningMessage, (state, payload) => ({
    ...state,
    warningMessage: [...state.warningMessage, payload],
  })),

  on(actions.addAlertInfomationMessage, (state, payload) => ({
    ...state,
    infomationMessage: [...state.infomationMessage, payload],
  })),

  on(actions.addAlertSubWarningMessage, (state, payload) => ({
    ...state,
    subWarningMessage: [...state.subWarningMessage, payload],
  })),

  on(actions.addAlertSubInfomationMessage, (state, payload) => ({
    ...state,
    subInfomationMessage: [...state.subInfomationMessage, payload],
  })),

  on(actions.removeAlertWarningMessage, (state, payload) => ({
    ...state,
    warningMessage: [...state.warningMessage.filter((item) => item.contentId !== payload.id)],
  })),

  on(actions.removeAlertInfomationMessage, (state, payload) => ({
    ...state,
    infomationMessage: [...state.infomationMessage.filter((item) => item.contentId !== payload.id)],
  })),

  on(actions.removeAllAlertWarningMessage, (state) => ({ ...state, warningMessage: [] })),

  on(actions.removeAllAlertInfomationMessage, (state) => ({ ...state, infomationMessage: [] })),

  on(actions.removeAlertSubWarningMessage, (state, payload) => ({
    ...state,
    subWarningMessage: [...state.subWarningMessage.filter((item) => item.contentId !== payload.id)],
  })),

  on(actions.removeAlertSubInfomationMessage, (state, payload) => ({
    ...state,
    subInfomationMessage: [...state.subInfomationMessage.filter((item) => item.contentId !== payload.id)],
  })),

  on(actions.removeAllAlertSubWarningMessage, (state) => ({ ...state, subWarningMessage: [] })),

  on(actions.removeAllAlertSubInfomationMessage, (state) => ({ ...state, subInfomationMessage: [] })),

  on(actions.removeAllAlertMessage, (state) => ({
    ...state,
    errorMessage: [],
    warningMessage: [],
    infomationMessage: [],
  })),

  on(actions.removeAllAlertSubMessage, (state) => ({
    ...state,
    subErrorMessage: [],
    subWarningMessage: [],
    subInfomationMessage: [],
  })),

  on(actions.updateAlertMessage, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetAlertMessage, () => alertMessageInitialState),
];

/**
 * AlertMessage Store reducer
 */
export const alertMessageReducer = createReducer(alertMessageInitialState, ...alertMessageReducerFeatures);
