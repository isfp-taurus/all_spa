import { Injectable } from '@angular/core';
import { SupportClass } from '../../components/support-class';
import { AnaBizContextModel } from '../../interfaces';
import {
  resetAnaBizContext,
  setAnaBizContext,
  updateAnaBizContext,
} from '../../store/ana-biz-context/ana-biz-context.actions';
import { selectAnaBizContextState } from '../../store/ana-biz-context/ana-biz-context.selectors';
import { AnaBizContextState, AnaBizContextStore } from '../../store/ana-biz-context/ana-biz-context.state';
import { Store, select } from '@ngrx/store';
import { Observable, filter } from 'rxjs';

/**
 * ANA Bizログイン情報 store サービス
 * store情報
 * @param anaBizContext @see AnaBizContextModel
 */
@Injectable({
  providedIn: 'root',
})
export class AnaBizContextStoreService extends SupportClass {
  private _anaBizContext$: Observable<AnaBizContextState>;
  private _anaBizContextData!: AnaBizContextState;
  get anaBizContextData() {
    return this._anaBizContextData;
  }

  constructor(private _store: Store<AnaBizContextStore>) {
    super();
    this._anaBizContext$ = this._store.pipe(
      select(selectAnaBizContextState),
      filter((data) => !!data)
    );
    this.subscribeService('AnaBizContextStoreServiceData', this._anaBizContext$, (data) => {
      this._anaBizContextData = data;
    });
  }

  destroy(): void {
    this.deleteSubscription('AnaBizContextStoreServiceData');
  }

  public getAnaBizContext$() {
    return this._anaBizContext$;
  }

  public updateAnaBizContext(value: Partial<AnaBizContextModel>) {
    this._store.dispatch(updateAnaBizContext(value));
  }

  public updateAnaBizContextByKey(key: keyof AnaBizContextModel, value: any) {
    this._store.dispatch(updateAnaBizContext({ [key]: value }));
  }

  public setAnaBizContext(value: AnaBizContextModel) {
    this._store.dispatch(setAnaBizContext(value));
  }

  public resetAnaBizContext() {
    this._store.dispatch(resetAnaBizContext());
  }
}
