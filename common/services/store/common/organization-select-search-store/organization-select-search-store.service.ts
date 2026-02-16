import { Injectable } from '@angular/core';
import { OrganizationSelectSearchModel, OrganizationSelectSearchType } from '@common/interfaces';
import {
  OrganizationSelectSearchState,
  OrganizationSelectSearchStore,
  resetOrganizationSelectSearch,
  selectOrganizationSelectSearchState,
  setOrganizationSelectSearch,
  updateOrganizationSelectSearch,
} from '@common/store';
import { SupportClass } from '@lib/components/support-class';
import { ApiErrorResponseService } from '@lib/services/api-error-response/api-error-response.service';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import { ReservationService } from 'src/sdk-reservation';

/**
 * 組織選択一覧検索 store Service
 */
@Injectable()
export class OrganizationSelectSearchStoreService extends SupportClass {
  private _organizationSelectSearch$: Observable<OrganizationSelectSearchState>;
  private _organizationSelectSearchData!: OrganizationSelectSearchState;
  get organizationSelectSearchData() {
    return this._organizationSelectSearchData;
  }

  constructor(
    private _store: Store<OrganizationSelectSearchStore>,
    private _api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._organizationSelectSearch$ = this._store.pipe(
      select(selectOrganizationSelectSearchState),
      filter((data) => !!data)
    );
    this.subscribeService('OrganizationSelectSearchStoreServiceData', this._organizationSelectSearch$, (data) => {
      this._organizationSelectSearchData = data;
    });
  }

  destroy(): void {}

  public organizationSelectSearch$() {
    return this._organizationSelectSearch$;
  }

  public updateOrganizationSelectSearchByKey(key: OrganizationSelectSearchType, value: any) {
    this._store.dispatch(updateOrganizationSelectSearch({ [key]: value }));
  }

  public updateOrganizationSelectSearch(value: OrganizationSelectSearchModel) {
    this._store.dispatch(updateOrganizationSelectSearch(value));
  }

  public setOrganizationSelectSearch(value: OrganizationSelectSearchModel) {
    this._store.dispatch(setOrganizationSelectSearch(value));
  }

  public resetOrganizationSelectSearch() {
    this._store.dispatch(resetOrganizationSelectSearch());
  }
}
