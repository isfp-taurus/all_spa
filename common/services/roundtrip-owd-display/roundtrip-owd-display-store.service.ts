/**
 * 往復指定日空席照会(OWD)API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import {
  RoundtripOwdDisplayState,
  RoundtripOwdDisplayStore,
  resetRoundtripOwdDisplay,
  selectRoundtripOwdDisplayState,
  setRoundtripOwdDisplay,
  updateRoundtripOwdDisplay,
} from '@common/store/roundtrip-owd-display';

/**
 * 往復指定日空席照会(OWD)APIの画面表示用 store サービス
 *   API実行は行わない
 * store情報
 * @param RoundtripOwdData @see RoundtripOwdStatusGetState
 */
@Injectable()
export class RoundtripOwdDisplayService extends SupportClass {
  private _roundtripOwdDisplay$: Observable<RoundtripOwdDisplayState>;
  private _roundtripOwdDisplayData!: RoundtripOwdDisplayState;
  get roundtripOwdDisplayData() {
    return this._roundtripOwdDisplayData;
  }

  constructor(private _store: Store<RoundtripOwdDisplayStore>) {
    super();
    this._roundtripOwdDisplay$ = this._store.pipe(
      select(selectRoundtripOwdDisplayState),
      filter((data) => !!data)
    );
    this.subscribeService('RoundtripOwdDisplayService', this._roundtripOwdDisplay$, (data) => {
      this._roundtripOwdDisplayData = data;
    });
  }

  destroy() {}

  public getRoundtripOwdDisplayObservable() {
    return this._roundtripOwdDisplay$;
  }

  public resetRoundtripOwdDisplay() {
    this._store.dispatch(resetRoundtripOwdDisplay());
  }

  public updateRoundtripOwdDisplay(value: Partial<RoundtripOwdDisplayState>) {
    this._store.dispatch(updateRoundtripOwdDisplay(value));
  }

  public setRoundtripOwdDisplay(value: RoundtripOwdDisplayState) {
    this._store.dispatch(setRoundtripOwdDisplay(value));
  }
}
