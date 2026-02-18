import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '../common';
import {
  cancelAswContextRequest,
  failAswContext,
  setAswContext,
  setAswContextFromApi,
  updateAswContext,
  changeOfficeAndLangFromApi,
} from './asw-context.actions';
import {
  AswContextModel,
  BookingType,
  BrowserType,
  DeviceType,
  LoginStatusType,
  MobileDeviceType,
} from '../../interfaces';
import { ChangeOfficeAndLangResponse } from 'src/sdk-user';

/**
 * Service to handle async AswContext actions
 */
@Injectable()
export class AswContextEffect {
  /**
   * Set the state with the reply content, dispatch failAswContext if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setAswContextFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setAswContext({ ...reply, requestId: action.requestId }),
        (error, action) => of(failAswContext({ error, requestId: action.requestId })),
        cancelAswContextRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failAswContext if it catches a failure
   */
  public changeOfficeLangFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(changeOfficeAndLangFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) =>
            updateAswContext({ ...this._convertReplyIntoStoreModel(reply), requestId: payload.requestId })
          ),
          catchError((err) => of(failAswContext({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  /**
   * Convert reply into store model
   */
  private _convertReplyIntoStoreModel(res: ChangeOfficeAndLangResponse): AswContextModel {
    return {
      ...(res.data?.aswContext as AswContextModel),
      bookingType: (res.data?.aswContext?.bookingType ?? '') as BookingType,
      deviceType: (res.data?.aswContext?.deviceType ?? '') as DeviceType,
      browserType: (res.data?.aswContext?.browserType ?? '') as BrowserType,
      mobileDeviceType: (res.data?.aswContext?.mobileDeviceType ?? '') as MobileDeviceType,
      loginStatus: (res.data?.aswContext?.loginStatus ?? '') as LoginStatusType,
      isViaGoshokaiNet: res.data?.aswContext?.isViaGoshokaiNet ?? false,
      isAnaApl: res.data?.aswContext?.isAnaApl ?? false,
      isDummyOffice: res.data?.aswContext?.isDummyOffice ?? false,
    };
  }

  constructor(protected actions$: Actions) {}
}
