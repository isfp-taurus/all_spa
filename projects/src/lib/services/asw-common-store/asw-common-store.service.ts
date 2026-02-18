/**
 * 画面情報 store サービス
 */
import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { AswCommonModel, AswCommonType, PageType } from '../../interfaces';
import {
  AswCommonStore,
  selectAswCommonState,
  updateAswCommon,
  setAswCommon,
  AswCommonState,
  selectAswCommonPageFunc,
  selectAswCommonSubPageFunc,
} from '../../store';
import { SupportClass } from '../../components/support-class';
import { Observable } from 'rxjs/internal/Observable';
import { filter, map } from 'rxjs/operators';
/**
 * 画面情報 store サービス
 * store情報
 * @param AswCommonData @see AswCommonModel
 */
@Injectable()
export class AswCommonStoreService extends SupportClass {
  private _aswCommon$: Observable<AswCommonModel>;
  private _aswCommonData!: AswCommonModel;
  get aswCommonData() {
    return this._aswCommonData;
  }

  constructor(private _store: Store<AswCommonStore>) {
    super();
    this._aswCommon$ = this._store.pipe(
      select(selectAswCommonState),
      filter((data) => !!data)
    );
    this.subscribeService('AswCommonStoreServiceData', this._aswCommon$, (data) => {
      this._aswCommonData = data;
    });
  }

  public getAswCommonByKey$(key: AswCommonType): Observable<any> {
    return this._aswCommon$.pipe(
      map((data) => {
        if (typeof data[key] === 'boolean') {
          return data[key];
        }
        return data[key] || null;
      })
    );
  }

  destroy(): void {}

  public getAswCommon$() {
    return this._aswCommon$;
  }

  public updateAswCommonByKey(key: AswCommonType, value: string) {
    this._store.dispatch(updateAswCommon({ [key]: value }));
  }

  public updateAswCommon(value: Partial<AswCommonState>) {
    if (value.pageId) {
      value.isEnabledLogin = value.isEnabledLogin ? true : false;
    }
    this._store.dispatch(updateAswCommon(value));
  }

  public setAswCommon(value: AswCommonState) {
    this._store.dispatch(setAswCommon(value));
  }

  public getFunctionId$(type?: PageType): Observable<string> {
    if (!type) {
      return this._aswCommon$.pipe(
        map(({ subFunctionId: subFuncId, functionId: funcId }) => subFuncId || funcId || '')
      );
    }
    if (type === PageType.PAGE) {
      return this.getAswCommonByKey$(AswCommonType.FUNCTION_ID);
    }
    return this.getAswCommonByKey$(AswCommonType.SUB_FUNCTION_ID);
  }

  public getPageId$(type?: PageType): Observable<string> {
    if (!type) {
      return this._aswCommon$.pipe(map(({ subPageId, pageId }) => subPageId || pageId || ''));
    }
    if (type === PageType.PAGE) {
      return this.getAswCommonByKey$('pageId');
    }
    return this.getAswCommonByKey$('subPageId');
  }

  public getFunctionId(type?: PageType): string {
    if (!type) {
      return this._aswCommonData.subFunctionId || this._aswCommonData.functionId || '';
    }
    if (type === PageType.PAGE) {
      return this._aswCommonData.functionId || '';
    }
    return this._aswCommonData.subFunctionId || '';
  }

  public getPageId(type?: PageType): string {
    if (!type) {
      return this._aswCommonData.subPageId || this._aswCommonData.pageId || '';
    }
    if (type === PageType.PAGE) {
      return this._aswCommonData.pageId || '';
    }
    return this._aswCommonData.subPageId || '';
  }

  /**
   * ページID、部品IDの変更のみをsubscribeするObservableを返却
   * @param type
   * @returns Observable　{pageId:string,functionId:string}または{subPageId:string,subFunctionId:string}
   */
  public getPagefuncId$(type: PageType): Observable<any> {
    if (type === 'page') {
      return this._store.select(selectAswCommonPageFunc);
    }
    return this._store.select(selectAswCommonSubPageFunc);
  }
}
