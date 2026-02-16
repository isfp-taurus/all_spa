/**
 * カート取得API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { distinctUntilChanged, filter, map, take } from 'rxjs/operators';
import {} from '@lib/store';
import { CommonLibService, ErrorsHandlerService, PageLoadingService } from '@lib/services';
import { CaptchaAuthenticationStatusResponse, SearchApiService } from 'src/sdk-search';
import { Subject, Subscription } from 'rxjs';
import {
  resetCaptchaAuthenticationStatusGet,
  selectCaptchaAuthenticationStatusGetIsFailureStatus,
  selectCaptchaAuthenticationStatusGetState,
  setCaptchaAuthenticationStatusGetFromApi,
} from '@common/store/Captcha-authentication-status-get';
import { ApiErrorResponseModel, ErrorType } from '@lib/interfaces';
import {
  GetCaptchaAuthenticationRequest,
  GetCaptchaAuthenticationResponse,
} from '@app/captcha-authentication/container/captcha-authentication-cont.state';
import { RoutesCommon, RoutesResRoutes } from '@conf/routes.config';
import { Router } from '@angular/router';
import { SearchFlightStoreService } from '../store/search-flight/search-flight-store/search-flight-store.service';
import { SearchFlightConditionForRequestService } from '../store/search-flight/search-flight-condition-for-request-store/search-flight-condition-for-request-store.service';

const STATUS = {
  DENIED: 'denied',
  NOT_REQUIRED: 'notRequired',
  KAPTCHA_REQUIRED: 'kaptchaRequired',
  RECAPTCHA_REQUIRED: 'reCaptchaRequired',
  RENDER: 'explicit',
};
/**
 * カート取得API store サービス
 *
 * store情報
 * @param GetCartData @see CaptchaAuthenticationStatusGetState
 */
@Injectable()
export class CaptchaAuthenticationStatusGetStoreService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _api: SearchApiService,
    private _router: Router,
    private _store: Store<CaptchaAuthenticationStatusResponse>,
    private _searchApiSvc: SearchApiService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _searchFlightConditionForRequestService: SearchFlightConditionForRequestService
  ) {
    super();
    /** 値が通知されるObservableを取得 */
    this.response$ = this._store.pipe(
      select(selectCaptchaAuthenticationStatusGetState),
      map((data) => data.model),
      filter((data): data is CaptchaAuthenticationStatusResponse => !!data),
      distinctUntilChanged()
    );
    /** APIからエラーのHTTPステータスコードが回答された場合に通知する */
    this.isFailure$ = this._store.pipe(
      select(selectCaptchaAuthenticationStatusGetIsFailureStatus),
      filter((isFailure) => isFailure)
    );
    this.apiErrorRes$ = this._common.apiErrorResponseService.getApiErrorResponse$().pipe(filter((data) => !!data));

    this._subscriptions.add(
      this.response$.subscribe((response) => {
        this.data = response;
        //6.1	画像認証要否取得レスポンス
        switch (response.authenticationStatus) {
          // authenticationStatus="denied"の場合
          case STATUS.DENIED:
            this._errorsHandlerSvc.setNotRetryableError({
              errorType: ErrorType.SYSTEM,
              errorMsgId: 'E0249',
            });
            break;
          case STATUS.NOT_REQUIRED:
            // キャプチャー認証不要な場合、そのまま画面遷移
            if (this.nextPage !== this.nowPage) {
              this._router.navigate([this.nextPage]);
            } else {
              this._router.navigateByUrl(RoutesResRoutes.CAPTCHA, { skipLocationChange: true }).then(() => {
                this._router.navigate([this.nextPage]);
              });
            }
            break;
          default:
            this._router.navigate([RoutesResRoutes.CAPTCHA]);
            break;
        }
      })
    );
  }

  destroy(): void {
    this._subscriptions?.unsubscribe();
  }

  /** 通知を受け取る変数 */
  private response$: Observable<CaptchaAuthenticationStatusResponse>;
  /** API呼び出し失敗判定フラグ */
  private isFailure$: Observable<boolean>;
  /** APIエラーレスポンス */
  private apiErrorRes$: Observable<ApiErrorResponseModel | null>;
  /** ストアを受け取るオブジェクトからデータを抜き出した変数 */
  private data!: CaptchaAuthenticationStatusResponse;
  /** APIの実行が終了した場合に通知するSubject true:正常終了 false:エラー*/
  private apiProgressSubject: Subject<GetCaptchaAuthenticationResponse> =
    new Subject<GetCaptchaAuthenticationResponse>();

  /** データの取得 */
  public getData(): CaptchaAuthenticationStatusResponse {
    return this.data;
  }
  /** APIの実行が終了したことを通知するObservableを返す */
  public getApiProgressObservable() {
    return this.apiProgressSubject.asObservable();
  }

  /** 結果の初期化 */
  public resetData(): void {
    this._store.dispatch(resetCaptchaAuthenticationStatusGet());
  }

  private _subscriptions: Subscription = new Subscription();
  public nowPage: string = '';
  public nextPage: string = '';
  public originLocationCode: string = '';
  public destinationLocationCode: string = '';

  public skipCaptchaHandle(nowPage?: string) {
    this.nowPage = nowPage ?? '';
    const searchFlightData = this._searchFlightStoreService.getData();
    // tripTypeで判断する
    if (!searchFlightData) {
      // データがない場合エラー画面へ遷移
      this._router.navigate([RoutesCommon.SYSTEM_ERROR]);
      return;
    }
    // 遷移先を設定
    const searchFlightConditionForRequestData = this._searchFlightConditionForRequestService.getData();
    this.nextPage = searchFlightConditionForRequestData?.request?.displayInformation?.nextPage ?? '';

    if (searchFlightData.tripType === 0) {
      // 保持している検索条件.往復旅程区間.往路出発地
      this.originLocationCode = searchFlightData.roundTrip.departureOriginLocationCode || '';
      this.destinationLocationCode = searchFlightData.roundTrip.departureDestinationLocationCode || '';
    } else if (searchFlightData.tripType === 1) {
      // 保持している検索条件.複雑旅程区間[0].出発地
      this.originLocationCode = searchFlightData.onewayOrMultiCity[0].originLocationCode || '';
      this.destinationLocationCode = searchFlightData.onewayOrMultiCity[0].destinationLocationCode || '';
    }

    const call = this._searchApiSvc.captchaAuthenticationStatusGet(
      this.originLocationCode,
      this.destinationLocationCode
    );
    this._store.dispatch(setCaptchaAuthenticationStatusGetFromApi({ call }));
  }
}
