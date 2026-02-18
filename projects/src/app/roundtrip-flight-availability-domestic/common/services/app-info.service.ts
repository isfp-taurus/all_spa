import { Injectable } from '@angular/core';
import { AppInfoModel, AppInfoType } from '../interfaces';
import { AppInfoStore, selectAppInfoState, setAppInfo, updateAppInfo } from '../store';
import { select, Store } from '@ngrx/store';
import { filter, map, Observable } from 'rxjs';

/**
 * アプリケーション情報Service
 */
@Injectable({
  providedIn: 'root',
})
export class AppInfoService {
  /**
   * アプリケーション情報（Observable）
   */
  public appInfo$: Observable<AppInfoModel>;

  /**
   * アプリケーション情報
   */
  private _aswAppInfoData!: AppInfoModel;

  constructor(private _store: Store<AppInfoStore>) {
    this.appInfo$ = this._store.pipe(
      select(selectAppInfoState),
      filter((data) => !!data)
    );
    this.appInfo$.subscribe((appInfo) => {
      this._aswAppInfoData = appInfo;
    });
  }

  /**
   * アプリケーション情報取得
   * @returns
   */
  public getAppInfo() {
    return this._aswAppInfoData;
  }

  /**
   * keyありでアプリケーション情報取得
   * @param key アプリケーション情報
   * @returns
   */
  public getAppInfoByKey(key: AppInfoType): any {
    return this._aswAppInfoData?.[key];
  }

  /**
   * アプリケーション情報取得（Observable）
   * @returns
   */
  public getAppInfo$() {
    return this.appInfo$;
  }

  /**
   * keyありでアプリケーション情報取得（Observable）
   * @param key アプリケーション情報
   * @returns
   */
  public getAppInfoByKey$(key: AppInfoType): Observable<any> {
    return this.appInfo$.pipe(
      map((data) => {
        if (typeof data[key] === 'boolean' || typeof data[key] === 'number') {
          return data[key];
        }
        return data[key] ? data[key] : '';
      })
    );
  }

  /**
   * keyありでアプリケーション情報設定
   * @param key アプリケーション情報
   * @param value any
   */
  public setAppInfoByKey(key: AppInfoType, value: any) {
    const appInfo: AppInfoModel = {};
    appInfo[key] = value;
    this._store.dispatch(updateAppInfo(appInfo));
  }

  /**
   * アプリケーション情報更新
   * @param value アプリケーション情報Model
   */
  public updateAppInfo(value: AppInfoModel) {
    this._store.dispatch(updateAppInfo(value));
  }

  /**
   * アプリケーション情報設定
   * @param value アプリケーション情報Model
   */
  public setAppInfo(value: AppInfoModel) {
    this._store.dispatch(setAppInfo(value));
  }
}
