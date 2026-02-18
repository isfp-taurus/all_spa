/**
 * カート情報 store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { ReservationService } from 'src/sdk-reservation';
import {
  NotEligibleInformationState,
  NotEligibleInformationStore,
  resetNotEligibleInformation,
  selectNotEligibleInformationState,
  updateNotEligibleInformation,
} from '@common/store/not-eligible-information';
import { ApiErrorResponseService } from '@lib/services/api-error-response/api-error-response.service';
import { filter } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

/**
 * カート情報 store サービス
 */
@Injectable()
export class NotEligibleInformationStoreService extends SupportClass {
  // カート情報 Observable
  private _notEligibleInformation$: Observable<NotEligibleInformationState>;
  // カート情報
  private _notEligibleInformationData!: NotEligibleInformationState;
  // カート情報取得
  get notEligibleInformationData() {
    return this._notEligibleInformationData;
  }
  /* コンストラクタ */
  constructor(
    private store: Store<NotEligibleInformationStore>,
    private api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    // StoreからObservable取得
    this._notEligibleInformation$ = this.store.pipe(
      select(selectNotEligibleInformationState),
      filter((data) => !!data)
    );
    // storeの値変更時の処理
    this.subscribeService('notEligibleInformation', this._notEligibleInformation$, (data) => {
      this._notEligibleInformationData = data;
    });
  }
  /* コンストラクタここまで */

  destroy() {}

  public getNotEligibleInformationObservable() {
    return this._notEligibleInformation$;
  }

  public resetNotEligibleInformation() {
    this.store.dispatch(resetNotEligibleInformation());
  }

  /** 画面間受け渡し情報の更新 */
  public updateStore(value: NotEligibleInformationState) {
    this.store.dispatch(updateNotEligibleInformation(value));
  }
}
