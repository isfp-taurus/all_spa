import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { resetConfidential, setConfidential, updateConfidential } from '../../store/confidential/confidential.actions';
import { selectConfidentialState } from '../../store/confidential/confidential.selectors';
import { ConfidentialState, ConfidentialStore } from '../../store/confidential/confidential.state';
import { Store, select } from '@ngrx/store';
import { Observable, filter } from 'rxjs';

/**
 * 初期流入APIのconfidential store サービス
 * store情報
 * @param confidential @see ConfidentialState
 */
@Injectable()
export class ConfidentialStoreService extends SupportClass {
  private _confidential$: Observable<ConfidentialState>;
  private _confidentialData!: ConfidentialState;
  get confidentialData() {
    return this._confidentialData;
  }

  constructor(private _store: Store<ConfidentialStore>) {
    super();
    this._confidential$ = this._store.pipe(
      select(selectConfidentialState),
      filter((data) => !!data)
    );
    this.subscribeService('ConfidentialStoreServiceData', this._confidential$, (data) => {
      this._confidentialData = data;
    });
  }

  destroy(): void {
    this.deleteSubscription('ConfidentialStoreServiceData');
  }

  public getConfidential$() {
    return this._confidential$;
  }

  public updateConfidential(value: Partial<ConfidentialState>) {
    this._store.dispatch(updateConfidential(value));
  }

  public setConfidential(value: ConfidentialState) {
    this._store.dispatch(setConfidential(value));
  }

  public resetConfidential() {
    this._store.dispatch(resetConfidential());
  }
}
