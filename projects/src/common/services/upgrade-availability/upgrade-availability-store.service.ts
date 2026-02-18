/**
 * 空席照会時アップグレード可否照会API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import { SearchApiService } from 'src/sdk-search';
import { UpgradeAvailabilityRequest } from '@common/interfaces/shopping/upgrade-availability/upgradeavailabilityRequest';
import {
  UpgradeAvailabilityState,
  UpgradeAvailabilityStore,
  resetUpgradeAvailability,
  selectUpgradeAvailabilityState,
  setUpgradeAvailabilityFromApi,
} from '@common/store/upgrade-availability';

/**
 * 空席照会時アップグレード可否照会API store サービス
 *
 * store情報
 * @param UpgradeAvailabilityData @see UpgradeAvailabilityStatusGetState
 */
@Injectable()
export class UpgradeAvailabilityService extends SupportClass {
  private _upgradeAvailability$: Observable<UpgradeAvailabilityState>;
  private _upgradeAvailabilityData!: UpgradeAvailabilityState;
  get upgradeAvailabilityData() {
    return this._upgradeAvailabilityData;
  }

  constructor(private _store: Store<UpgradeAvailabilityStore>, private _api: SearchApiService) {
    super();
    this._upgradeAvailability$ = this._store.pipe(
      select(selectUpgradeAvailabilityState),
      filter((data) => !!data)
    );

    this.subscribeService('upgrade-availability.service', this._upgradeAvailability$, (data) => {
      this._upgradeAvailabilityData = data;
    });
  }

  destroy() {}

  public getUpgradeAvailabilityObservable() {
    return this._upgradeAvailability$;
  }

  public resetUpgradeAvailability() {
    this._store.dispatch(resetUpgradeAvailability());
  }

  public setUpgradeAvailabilityFromApi(request: UpgradeAvailabilityRequest) {
    this._store.dispatch(setUpgradeAvailabilityFromApi({ call: this._api.upgradeAvailabilityPost(request) }));
  }
}
