/**
 * 航空券 PDF取得API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import {} from '@lib/store';
import {
  ServicingApiService,
  GetETicketItineraryReceiptRequest,
  GetETicketItineraryReceiptResponse,
} from 'src/sdk-servicing';
import {
  GetETicketItineraryReceiptState,
  GetETicketItineraryReceiptStore,
  resetGetETicketItineraryReceipt,
  selectGetETicketItineraryReceiptState,
  setGetETicketItineraryReceiptFromApi,
} from '@common/store/get-eTicketItineraryReceipt';
import { ApiErrorResponseService } from '@lib/services/api-error-response/api-error-response.service';

/**
 * 航空券 PDF取得API store サービス
 *
 * store情報
 * @param GetETicketItineraryReceiptData @see GetETicketItineraryReceiptState
 */
@Injectable()
export class GetETicketItineraryReceiptStoreService extends SupportClass {
  private _getETicketItineraryReceipt$: Observable<GetETicketItineraryReceiptState>;
  private _getETicketItineraryReceiptData!: GetETicketItineraryReceiptState;
  get getETicketItineraryReceiptData() {
    return this._getETicketItineraryReceiptData;
  }

  constructor(
    private store: Store<GetETicketItineraryReceiptStore>,
    private api: ServicingApiService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._getETicketItineraryReceipt$ = this.store.pipe(
      select(selectGetETicketItineraryReceiptState),
      filter((data) => !!data)
    );
    this.subscribeService('GetETicketItineraryReceiptStoreService', this._getETicketItineraryReceipt$, (data) => {
      this._getETicketItineraryReceiptData = data;
    });
  }
  destroy() {}

  public getGetETicketItineraryReceipt$() {
    return this._getETicketItineraryReceipt$;
  }

  public resetGetETicketItineraryReceipt() {
    this.store.dispatch(resetGetETicketItineraryReceipt());
  }

  public setGetETicketItineraryReceiptFromApi(request: GetETicketItineraryReceiptRequest) {
    this.store.dispatch(
      setGetETicketItineraryReceiptFromApi({ call: this.api.ordersGetETicketItineraryReceiptPost(request) })
    );
  }
}
