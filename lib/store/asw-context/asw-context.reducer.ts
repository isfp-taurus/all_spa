import {
  AnaBizLoginStatusType,
  BookingType,
  BrowserType,
  DeviceType,
  LoginStatusType,
  MobileDeviceType,
} from '../../interfaces';
import { ActionCreator, ReducerTypes, createReducer, on } from '@ngrx/store';
import { asyncStoreItemAdapter } from '../common';
import * as actions from './asw-context.actions';
import { AswContextState } from './asw-context.state';

/**
 * aswContext initial state
 */
export const aswContextInitialState: AswContextState = {
  metaConnectionKind: '',
  metaLang: '',
  pointOfSaleId: '',
  bookingType: BookingType.UNKNOWN,
  currencyCode: '',
  lang: '',
  posCountryCode: '',
  apfCode: '',
  introduceNumber: '',
  introducerLastName: '',
  introducerFirstName: '',
  deviceType: DeviceType.UNKNOWN,
  browserType: BrowserType.UNKNOWN,
  mobileDeviceType: MobileDeviceType.UNKNOWN,
  osVersion: '',
  loginStatus: LoginStatusType.UNKNOWN,
  isViaGoshokaiNet: false,
  isAnaApl: false,
  isDummyOffice: false,
  requestIds: [],
  anaBizLoginStatus: AnaBizLoginStatusType.UNKNOWN,
  returnUrl: '',
};

/**
 * List of basic actions for AswContext Store
 */
export const aswContextReducerFeatures: ReducerTypes<AswContextState, ActionCreator[]>[] = [
  on(actions.setAswContext, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateAswContext, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetAswContext, () => aswContextInitialState),

  on(actions.cancelAswContextRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.failAswContext, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setAswContextFromApi, actions.changeOfficeAndLangFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * AswContext Store reducer
 */
export const aswContextReducer = createReducer(aswContextInitialState, ...aswContextReducerFeatures);
