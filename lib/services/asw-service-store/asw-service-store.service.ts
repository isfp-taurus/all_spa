import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { AswServiceModel, AswServiceType } from '../../interfaces';
import { AswServiceStore, selectAswServiceState, updateAswService, setAswService } from '../../store';
import { SupportClass } from '../../components/support-class';
import { Observable } from 'rxjs/internal/Observable';
import { filter, map } from 'rxjs/operators';

/**
 * AswService Storeを操作するService
 */
@Injectable({
  providedIn: 'root',
})
export class AswServiceStoreService extends SupportClass {
  private _aswService$: Observable<AswServiceModel>;
  private _aswServiceData: AswServiceModel = {};
  get aswServiceData() {
    return this._aswServiceData;
  }

  constructor(private _store: Store<AswServiceStore>) {
    super();
    this._aswService$ = this._store.pipe(
      select(selectAswServiceState),
      filter((data) => !!data)
    );
    this.subscribeService('AswServiceStoreServiceData', this._aswService$, (data) => {
      this._aswServiceData = data;
    });
  }

  destroy(): void {}

  public getAswService$() {
    return this._aswService$;
  }

  public getAswServiceByKey$(key: AswServiceType): Observable<any> {
    return this._aswService$.pipe(
      map((data) => {
        if (typeof data[key] === 'boolean') {
          return data[key];
        }
        return data[key];
      })
    );
  }

  public updateAswServiceByKey(key: AswServiceType, value: string) {
    const aswServiceModel: AswServiceModel = {};
    aswServiceModel[key] = value;
    this._store.dispatch(updateAswService(aswServiceModel));
  }

  public updateAswService(value: AswServiceModel) {
    this._store.dispatch(updateAswService(value));
  }

  public setAswService(value: AswServiceModel) {
    this._store.dispatch(setAswService(value));
  }
}
