import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { MasterStoreKey } from '@conf';
import { environment } from '@env/environment';
import { AswMasterModel, LoadAswMasterInfo, MPropertyType } from '../../interfaces';
import { AswMasterStore, selectAswMasterState, setAswMaster, updateAswMaster } from '../../store';
import { Store, select } from '@ngrx/store';
import { Subscription, Observable, forkJoin, of, from, combineLatest } from 'rxjs';
import { filter, tap, map, catchError } from 'rxjs/operators';
import { AswContextStoreService } from '../asw-context-store/asw-context-store.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * Asw Masterを操作するService
 *
 * @implements OnDestroy
 */
@Injectable({
  providedIn: 'root',
})
export class AswMasterService implements OnDestroy {
  private _subscription: Subscription = new Subscription();
  private _aswMaster$: Observable<AswMasterModel>;
  private _aswMaster!: AswMasterModel;
  get aswMaster() {
    return this._aswMaster;
  }

  constructor(
    private _store: Store<AswMasterStore>,
    private _http: HttpClient,
    private _translateSvc: TranslateService,
    private _aswContextStoreSvc: AswContextStoreService
  ) {
    this._aswMaster$ = this._store.pipe(
      select(selectAswMasterState),
      filter((data) => Object.keys(data).length > 0)
    );
    this._subscription.add(this._aswMaster$.subscribe((master) => (this._aswMaster = master)));
  }

  /**
   * マスタjsonデータロード処理
   *
   * @param masterInfo ロードするマスタキャッシュ情報
   * @param isUpdate マスタキャッシュ用Storeに対して更新するかの判定フラグ（デフォルト：上書き）
   * @returns
   */
  public load(masterInfo: LoadAswMasterInfo[], isUpdate?: boolean): Observable<any[]> {
    let master: AswMasterModel = {};
    return forkJoin(
      masterInfo.map((info) => {
        if (info?.suffixKeys?.length) {
          if (this._isStoredCache(info.key, info.fileName, info.isCurrentLang)) {
            return from(new Promise((resolve) => resolve(this._aswMaster[info.key]))).pipe(
              tap((masterData) => {
                master[info.key] = masterData;
              })
            );
          } else {
            let masterData$: Array<Observable<any[]>> = [];
            info?.suffixKeys.forEach((suffixKey) => {
              masterData$.push(this._httpGetMaster$(info.fileName, info.isCurrentLang, suffixKey));
            });
            return combineLatest(masterData$).pipe(
              tap((masterDatas) => {
                let masterDataList = {};
                masterDatas.forEach((masterData) => {
                  masterDataList = { ...masterDataList, ...masterData };
                });
                master[info.key] = masterDataList;
              })
            );
          }
        } else {
          return (
            this._isStoredCache(info.key, info.fileName, info.isCurrentLang)
              ? from(new Promise((resolve) => resolve(this._aswMaster[info.key]))) //すでに取得済みの場合ストアの値を返却
              : this._httpGetMaster$(info.fileName, info.isCurrentLang)
          ).pipe(
            tap((masterData) => {
              master[info.key] = masterData;
            })
          );
        }
      })
    ).pipe(
      tap(() => {
        // キーURLマップを更新する
        const keyUrlMap = isUpdate ? { ...(this._aswMaster?.['keyUrlMap'] ?? {}) } : {};
        masterInfo.forEach((info) => {
          if (info.isCurrentLang) {
            keyUrlMap[info.key] = `${info.fileName}_${this._translateSvc.currentLang}`;
          } else {
            keyUrlMap[info.key] = info.fileName;
          }
        });
        master['keyUrlMap'] = keyUrlMap;
        //ストアを更新する
        if (isUpdate) {
          this.updateAswMaster(master);
        } else {
          this.setAswMaster(master);
        }
      })
    );
  }

  /**
   * キーURLマップを参照し、取得するキャッシュがstoreに格納されているか確認する
   * @param key キャッシュキー
   * @param url キャッシュのファイル名
   * @param isCurrentLang 言語別かどうか
   * @returns 判定値
   */
  private _isStoredCache(key: string, url: string, isCurrentLang?: boolean) {
    const keyUrlMap = this._aswMaster?.['keyUrlMap'] ?? {};
    if (!this._aswMaster?.[key]) {
      //キーがstoreにない場合
      return false;
    }
    if (isCurrentLang) {
      return keyUrlMap[key] === `${url}_${this._translateSvc.currentLang}`;
    } else {
      return keyUrlMap[key] === url;
    }
  }

  public getAswMaster$(): Observable<AswMasterModel> {
    return this._aswMaster$;
  }

  public getAswMasterByKey$(key: string): Observable<any> {
    return this._aswMaster$.pipe(
      map((data) => {
        if (typeof data[key] === 'boolean') {
          return data[key];
        }
        return data[key] || '';
      })
    );
  }

  public setAswMaster(value: AswMasterModel) {
    this._store.dispatch(setAswMaster(value));
  }

  public updateAswMaster(value: AswMasterModel) {
    this._store.dispatch(updateAswMaster(value));
  }

  public updateAswMasterByKey(key: string, value: any) {
    const aswMasterModel: AswMasterModel = {};
    aswMasterModel[key] = value;
    this._store.dispatch(updateAswMaster(aswMasterModel));
  }

  /**
   * プロパティjsonデータ取得
   *
   * @returns
   */
  public getMProperty(): MPropertyType {
    let mProperty: MPropertyType = {};
    mProperty = this._aswMaster[MasterStoreKey.PROPERTY];
    return mProperty;
  }

  /**
   * プロパティjsonデータ取得（カテゴリー、キー指定あり）
   *
   * @param category プロパティのカテゴリー
   * @param key プロパティのキー
   * @returns
   */
  public getMPropertyByKey(category: string, key: string): string {
    let value: string = '';
    const mProperty: MPropertyType = this.getMProperty();
    value = mProperty[category]?.[key]?.[0]?.['value'];
    return value;
  }

  private _httpGetMaster$(url: string, isCurrentLang?: boolean, suffixKey?: string): Observable<any> {
    url = suffixKey ? `${url}${suffixKey}` : url;
    let loadUrl = `${environment.spa.baseUrl}${environment.spa.app.cache}/${url}`;
    if (isCurrentLang) {
      const lang = this._translateSvc.currentLang;
      loadUrl = `${loadUrl}_${lang}`;
    }

    return this._http.get(`${loadUrl}.json`).pipe(
      catchError(() => {
        return of({});
      })
    );
  }

  public ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
