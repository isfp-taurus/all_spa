/**
 * ANA Biz発券要求差戻API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import { environment } from '@env/environment';
import {} from '@lib/store';
import { OrdersAnaBizSendBackTicketingRequestRequest } from 'src/sdk-reservation';
import {
  SendBackTicketingRequestState,
  SendBackTicketingRequestStore,
  resetSendBackTicketingRequest,
  selectSendBackTicketingRequestState,
  setSendBackTicketingRequestFromApi,
} from '@common/store/send-back-ticketing-request';
import { ReservationService } from 'src/sdk-reservation';
import { ApiErrorResponseService } from '@lib/services';

/**
 * 予約基本情報取得API store サービス
 *
 * store情報
 * @param sendBackTicketingRequestData @see SendBackTicketingRequestState
 */
@Injectable()
export class SendBackTicketingRequestStoreService extends SupportClass {
  private _sendBackTicketingRequest$: Observable<SendBackTicketingRequestState>;
  private _sendBackTicketingRequestData!: SendBackTicketingRequestState;
  get sendBackTicketingRequestData() {
    return this._sendBackTicketingRequestData;
  }

  constructor(
    private store: Store<SendBackTicketingRequestStore>,
    private api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._sendBackTicketingRequest$ = this.store.pipe(
      select(selectSendBackTicketingRequestState),
      filter((data) => !!data)
    );
    this.subscribeService('sendBackTicketingRequest', this._sendBackTicketingRequest$, (data) => {
      this._sendBackTicketingRequestData = data;
    });
  }

  destroy() {}

  public getSendBackTicketingRequest$() {
    return this._sendBackTicketingRequest$;
  }

  public resetSendBackTicketingRequest() {
    this.store.dispatch(resetSendBackTicketingRequest());
  }

  public setSendBackTicketingRequestFromApi(request: OrdersAnaBizSendBackTicketingRequestRequest) {
    this._apiErrorResponseService.clearApiErrorResponse(); //　エラーを事前にクリア
    this.store.dispatch(
      setSendBackTicketingRequestFromApi({
        call: this.api.ordersAnaBizSendBackTicketingRequestPost(request),
      })
    );
  }
}
