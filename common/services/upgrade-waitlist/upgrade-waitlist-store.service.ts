/**
 * アップグレード空席待ち人数取得API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import {
  resetUpgradeWaitlist,
  UpgradeWaitlistState,
  UpgradeWaitlistStore,
  selectUpgradeWaitlistState,
  setUpgradeWaitlistFromApi,
} from '@common/store/upgrade-waitlist';
import { UpgradeWaitlistRequest } from '@common/interfaces/shopping/upgrade-waitlist/upgradeWaitlistRequest';
import { SearchApiService } from 'src/sdk-search';

/**
 * アップグレード空席待ち人数取得API store サービス
 */
@Injectable()
export class UpgradeWaitlistStoreService extends SupportClass {
  private _upgradeWaitList$: Observable<UpgradeWaitlistState>;
  private _upgradeWaitListData!: UpgradeWaitlistState;
  get upgradeWaitListData() {
    return this._upgradeWaitListData;
  }

  constructor(private _api: SearchApiService, private _store: Store<UpgradeWaitlistStore>) {
    super();
    /** データリストの取得 */
    this._upgradeWaitList$ = this._store.pipe(
      select(selectUpgradeWaitlistState),
      filter((data) => !!data)
    );
    this.subscribeService('upgrade-waitlist-store.service', this._upgradeWaitList$, (data) => {
      this._upgradeWaitListData = data;
    });
  }

  destroy() {}

  /** 値が通知されるObservableを取得 */
  public getUpgradeWaitListObservable() {
    return this._upgradeWaitList$;
  }

  /** storeクリア */
  public resetData() {
    this._store.dispatch(resetUpgradeWaitlist());
  }

  /** APIの実行と結果の格納 */
  public setDataFromApi(request: UpgradeWaitlistRequest): void {
    const call = this._api.searchUpgradeWaitlistGet(
      request.departureDateTime,
      request.marketingAirlineCode,
      request.marketingFlightNumber
    );
    this._store.dispatch(setUpgradeWaitlistFromApi({ call: call }));
  }
}
