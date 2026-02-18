/**
 * ユーザー共通情報 store サービス
 */
import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { SupportClass } from '../../components/support-class';
import { AswContextModel, AswContextType } from '../../interfaces';
import {
  AswContextState,
  AswContextStore,
  selectAswContextState,
  setAswContext,
  updateAswContext,
  changeOfficeAndLangFromApi,
} from '../../store';
import { ChangeOfficeAndLangRequest, UserApiService } from 'src/sdk-user';
import { ApiErrorResponseService } from '../api-error-response/api-error-response.service';
import { Observable } from 'rxjs/internal/Observable';
import { filter, map } from 'rxjs/operators';

/**
 * ユーザー共通情報 store サービス
 * store情報
 * @param aswContextData @see AswContextState
 */
@Injectable()
export class AswContextStoreService extends SupportClass {
  private _aswContext$: Observable<AswContextState>;
  private _aswContextData!: AswContextState;
  get aswContextData() {
    return this._aswContextData;
  }

  constructor(
    private _store: Store<AswContextStore>,
    private _api: UserApiService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._aswContext$ = this._store.pipe(
      select(selectAswContextState),
      filter((data) => !!data)
    );
    this.subscribeService('AswContextStoreServiceData', this._aswContext$, (state) => {
      this._aswContextData = state;
    });
  }

  public getAswContextByKey$(key: AswContextType): Observable<any> {
    return this._aswContext$.pipe(
      map((data) => {
        if (typeof data[key] === 'boolean') {
          return data[key];
        }
        return data[key];
      })
    );
  }

  destroy() {}

  public getAswContext$() {
    return this._aswContext$;
  }

  public updateAswContextByKey(key: AswContextType, value: any) {
    this._store.dispatch(updateAswContext({ [key]: value }));
  }

  public updateAswContext(value: Partial<AswContextModel>) {
    this._store.dispatch(updateAswContext(value));
  }

  public setAswContext(value: AswContextModel) {
    this._store.dispatch(setAswContext(value));
  }

  /**
   * 言語切替用
   * @param lang 言語コード 更新しない場合nullを指定
   * @param pointOfSaleId オフィスコード 更新しない場合nullを指定
   */
  public changeLanguage(lang: string | null, pointOfSaleId: string | null) {
    if (!lang && !pointOfSaleId) {
      return;
    }
    let value: ChangeOfficeAndLangRequest = {};
    if (lang) {
      value = {
        lang: lang,
      };
    }
    if (pointOfSaleId) {
      value = {
        ...value,
        pointOfSaleId: pointOfSaleId,
      };
    }
    this._apiErrorResponseService.clearApiErrorResponse();
    this._store.dispatch(changeOfficeAndLangFromApi({ call: this._api.changeOfficeAndLangPost(value) }));
  }
}
