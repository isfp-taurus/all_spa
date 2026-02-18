import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ApiErrorResponseModel } from '../../interfaces';
import { ApiErrorResponseStore, resetApiErrorResponse, selectApiErrorResponse, setApiErrorResponse } from '../../store';
import { Observable } from 'rxjs';

/**
 * ApiErrorResponse Storeを操作するService
 */
@Injectable({
  providedIn: 'root',
})
export class ApiErrorResponseService {
  constructor(private _store: Store<ApiErrorResponseStore>) {}

  /**
   * ApiErrorResponse Storeに情報格納
   *
   * @param response {@link ApiErrorResponseModel}
   */
  public setApiErrorResponse(response: ApiErrorResponseModel) {
    this._store.dispatch(setApiErrorResponse(response));
  }

  /**
   * ApiErrorResponse Storeから情報取得
   *
   * @returns
   */
  public getApiErrorResponse$(): Observable<ApiErrorResponseModel | null> {
    return this._store.pipe(select(selectApiErrorResponse));
  }

  /**
   * ApiErrorResponse Storeクリア
   */
  public clearApiErrorResponse() {
    this._store.dispatch(resetApiErrorResponse());
  }
}
