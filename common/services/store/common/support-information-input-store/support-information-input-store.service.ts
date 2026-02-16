/**
 * SupportInformationInput store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import {
  SupportInformationInputState,
  SupportInformationInputStore,
  setSupportInformationInput,
  updateSupportInformationInput,
  resetSupportInformationInput,
  selectSupportInformationInputState,
  supportInformationInputInitialState,
} from '@common/store/support-information-input';

/**
 * SupportInformationInput store サービス
 *
 * store情報
 * @param supportInformationInputData @see SupportInformationInputState
 */
@Injectable()
export class SupportInformationInputStoreService extends SupportClass {
  private _supportInformationInput$: Observable<SupportInformationInputState>;
  public supportInformationInputData: SupportInformationInputState = supportInformationInputInitialState;

  constructor(private store: Store<SupportInformationInputStore>) {
    super();
    this._supportInformationInput$ = this.store.pipe(
      select(selectSupportInformationInputState),
      filter((data) => !!data)
    );
    this.subscribeService('SupportInformationInputStoreServiceDataUpdate', this._supportInformationInput$, (data) => {
      this.supportInformationInputData = data;
    });
  }

  destroy() {}

  public supportInformationInputObservable() {
    return this._supportInformationInput$;
  }

  public setSupportInformationInput(value: SupportInformationInputState) {
    this.store.dispatch(setSupportInformationInput(value));
  }

  public updateSupportInformationInput(value: Partial<SupportInformationInputState>) {
    this.store.dispatch(updateSupportInformationInput(value));
  }

  public resetSupportInformationInput() {
    this.store.dispatch(resetSupportInformationInput());
  }
}
