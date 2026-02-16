/**
 * ANA Biz発券要求API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import {} from '@lib/store';

import { OrdersAnaBizTicketingRequestRequest, ReservationService } from 'src/sdk-reservation';
import { ApiErrorResponseService } from '@lib/services';
import { TicketingRequestState, TicketingRequestStore } from '@common/store/ticketing-request/ticketing-request.state';
import { selectTicketingRequestState } from '@common/store/ticketing-request/ticketing-request.selectors';
import {
  resetTicketingRequest,
  setTicketingRequestFromApi,
} from '@common/store/ticketing-request/ticketing-request.actions';

/**
 * 会員情報取得API store サービス
 *
 * store情報
 * @param getMemberInformationData @see TicketingRequestState
 */
@Injectable()
export class TicketingRequestStoreService extends SupportClass {
  private _getMemberInformation$: Observable<TicketingRequestState>;
  private _getMemberInformationData!: TicketingRequestState;
  get getMemberInformationData() {
    return this._getMemberInformationData;
  }

  constructor(
    private store: Store<TicketingRequestStore>,
    private api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._getMemberInformation$ = this.store.pipe(
      select(selectTicketingRequestState),
      filter((data) => !!data)
    );
    this.subscribeService('ticketingRequest', this._getMemberInformation$, (data) => {
      this._getMemberInformationData = data;
    });
  }

  destroy() {}

  public getTicketingRequest$() {
    return this._getMemberInformation$;
  }

  public resetTicketingRequest() {
    this.store.dispatch(resetTicketingRequest());
  }

  public setTicketingRequestFromApi(request: OrdersAnaBizTicketingRequestRequest) {
    this.store.dispatch(setTicketingRequestFromApi({ call: this.api.ordersAnaBizTicketingRequestPost(request) }));
  }
}
