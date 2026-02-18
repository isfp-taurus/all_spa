import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, Subscription, combineLatest, switchMap, of } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import {
  NotRetryableErrorModel,
  RetryableError,
  PageType,
  ErrorType,
  ErrorCommonInfo,
  ApiCommonRequest,
} from '../../interfaces';
import { ApiErrorResponseService } from '../api-error-response/api-error-response.service';
import { AswCommonStoreService } from '../asw-common-store/asw-common-store.service';
import {
  NotRetryableErrorStore,
  RetryableErrorStore,
  selectPageRetryableError,
  selectSubPageRetryableError,
  setNotRetryableError,
  resetNotRetryableError,
  setSubPageRetryableError,
  setPageRetryableError,
  resetSubPageRetryableError,
  resetPageRetryableError,
  resetAllRetryableError,
  selectNotRetryableError,
} from '../../store';
import { MasterStoreKey, RoutesCommon } from '@conf';
import { HttpErrorResponse } from '@angular/common/http';
import { AswMasterService } from '../asw-master/asw-master.service';
import { PageLoadingService } from '../page-loading/page-loading.service';
import { TealiumService } from '../tealium/tealium.service';
import { ErrorCodeConstants } from '@conf/app.constants';

/**
 * エラーハンドリングService
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorsHandlerService implements OnDestroy {
  private _subscription: Subscription = new Subscription();

  /** 継続不可能エラー情報 */
  private _notRetryableError$!: Observable<NotRetryableErrorModel | null>;
  /** 継続可能エラー情報（page用） */
  private _pageRetryableError$!: Observable<RetryableError | null>;
  /** 継続可能エラー情報（subPage用） */
  private _subPageRetryableError$!: Observable<RetryableError | null>;

  constructor(
    private _store: Store<NotRetryableErrorStore | RetryableErrorStore>,
    private _apiErrorResSvc: ApiErrorResponseService,
    private _aswCommonSvc: AswCommonStoreService,
    private _router: Router,
    private _aswMasterSvc: AswMasterService,
    private _loadingSvc: PageLoadingService,
    private _tealiumSvc: TealiumService
  ) {
    // 継続不可能エラー情報
    this._notRetryableError$ = this._store.pipe(select(selectNotRetryableError));
    // 継続可能エラー情報（page用）
    this._pageRetryableError$ = this._store.pipe(select(selectPageRetryableError));
    // 継続可能エラー情報（subPage用）
    this._subPageRetryableError$ = this._store.pipe(select(selectSubPageRetryableError));
  }

  /**
   * 初期化処理
   * - 継続不可能エラー情報Storeに保持されているerrorTypeに応じて、エラーハンドリング処理を行う
   */
  public init() {
    this._subscription.add(
      this.getNotRetryableError$().subscribe((errorData: NotRetryableErrorModel) => {
        // ローディング表示イベント終了
        this._loadingSvc.endLoading();
        // Tealium連携用Global変数初期化
        this._tealiumSvc.init();

        switch (errorData.errorType) {
          // システムエラーの場合
          case ErrorType.SYSTEM:
            this._router.navigate([RoutesCommon.SYSTEM_ERROR]);
            break;
          // セッションタイムアウトエラーの場合
          case ErrorType.SESSION_TIMEOUT:
            this._router.navigate([RoutesCommon.SESSION_TIMEOUT_ERROR]);
            break;
          // ビジネスロジックエラーの場合
          case ErrorType.BUSINESS_LOGIC:
            this._router.navigate([RoutesCommon.SERVICE_ERROR]);
            break;
          default:
            break;
        }
      })
    );
  }

  /**
   * 継続不可能エラー情報Storeから情報取得（エラーがある場合のみ）
   *
   * @returns
   */
  public getNotRetryableError$(): Observable<NotRetryableErrorModel> {
    return this._notRetryableError$.pipe(filter((data): data is NotRetryableErrorModel => !!data && !!data.errorType));
  }

  /**
   * 継続不可能エラー情報Storeから情報取得（エラーがない場合の初期Stateを含む）
   *
   * @returns
   */
  public getNotRetryableErrorWithInitialState$(): Observable<NotRetryableErrorModel | null> {
    return this._notRetryableError$;
  }

  /**
   * 継続不可能エラー情報Store設定
   *
   * @param errorInfo 継続不可能エラー情報
   */
  public setNotRetryableError(errorInfo: NotRetryableErrorModel) {
    let hasNotRetryableError = false;
    this._subscription.add(
      this.getNotRetryableError$()
        .pipe(take(1))
        .subscribe(() => {
          hasNotRetryableError = true;
        })
    );
    if (!hasNotRetryableError) {
      this._store.dispatch(setNotRetryableError(errorInfo));
    }
  }

  /**
   * 継続不可能エラー情報Storeクリア
   */
  public clearNotRetryableError() {
    this._store.dispatch(resetNotRetryableError());
  }

  /**
   * 継続可能エラー情報Storeから情報取得
   *
   * @param pageType 画面タイプ（未指定の場合は「page」とする）
   * @returns
   */
  public getRetryableError$(pageType?: PageType): Observable<RetryableError | null> {
    if (pageType === PageType.SUBPAGE) {
      return this._subPageRetryableError$;
    } else {
      return this._pageRetryableError$;
    }
  }

  /**
   * 継続可能エラー情報Storeに情報格納
   *
   * @param pageType 画面タイプ
   * @param errorInfo 継続可能エラー情報
   */
  public setRetryableError(pageType: PageType, errorInfo?: RetryableError) {
    if (pageType === PageType.SUBPAGE) {
      this._store.dispatch(setSubPageRetryableError(errorInfo || {}));
    } else {
      this._store.dispatch(setPageRetryableError(errorInfo || {}));
    }
  }

  /**
   * 継続可能エラー情報Storeクリア
   *
   * @param pageType 画面タイプ
   */
  public clearRetryableError(pageType?: PageType) {
    if (pageType === PageType.SUBPAGE) {
      this._store.dispatch(resetSubPageRetryableError());
    } else if (pageType === PageType.PAGE) {
      this._store.dispatch(resetPageRetryableError());
    } else {
      this._store.dispatch(resetAllRetryableError());
    }
  }

  /**
   * 表示用エラー文言ID体系取得
   * - ※pageType指定がある場合、RetryableErrorStoreより情報を取得する。
   * 指定がない場合、NotRetryableErrorStoreより情報を取得する。
   *
   * @param pageType 画面タイプ
   * @param fixedErrorMsgKey 固定のエラー文言キー
   * @returns
   */
  public getDisplayErrorKey$(pageType?: PageType, fixedErrorMsgKey?: string): Observable<string> {
    // 機能ID
    let funcId$ = this._aswCommonSvc.getFunctionId$(pageType).pipe(map((data) => data || 'CMN00'));
    // 画面ID
    let pageId$ = this._aswCommonSvc.getPageId$(pageType).pipe(map((data) => data || 'P000'));
    // エラー情報
    let errorInfo$: Observable<ErrorCommonInfo | null>;
    // エラーメッセージID・APIエラーコード
    let msgIdApiCode$: Observable<string>;

    // 画面タイプが指定された場合、タイプに応じて継続可能エラー情報StoreからエラーメッセージID、APIエラーコードを取得
    if (pageType) {
      errorInfo$ = this.getRetryableError$(pageType);
      // 画面タイプの指定がない場合、継続不可能エラー情報StoreからエラーメッセージID、APIエラーコードを取得
    } else {
      errorInfo$ = this.getNotRetryableErrorWithInitialState$();
    }
    msgIdApiCode$ = errorInfo$.pipe(
      map((data) => {
        if (data?.apiErrorCode) {
          return `${data?.errorMsgId || fixedErrorMsgKey || ''}-${data.apiErrorCode}`;
        }
        return `${data?.errorMsgId || fixedErrorMsgKey || ''}`;
      })
    );

    return combineLatest([funcId$, pageId$, msgIdApiCode$]).pipe(
      take(1),
      map(([funcId, pageId, msgIdApiCode]) => ` (${funcId}${pageId}-${msgIdApiCode})`)
    );
  }

  /**
   * APIエラー共通ハンドリング処理
   *
   * @param res APIレスポンス情報
   * @param commonIgnoreErrorFlg エラーハンドリング回避フラグ
   */
  public apiErrorCommonHandler(
    res: HttpErrorResponse,
    commonIgnoreErrorFlg?: ApiCommonRequest['commonIgnoreErrorFlg']
  ) {
    let errorInfo: NotRetryableErrorModel;
    // APIエラーコード
    const _apiErrorCode = res.error.errors ? res.error.errors[0]?.code : '';
    // HTTPステータスコード
    const _statusCode = res.status;
    // エラータイプ（THROUGHの場合の判定用）
    const _errorType = res.error.errorType;
    // 500系かの判定
    const is5XX = String(_statusCode).startsWith('5');
    // エラーハンドリング回避フラグが「true」の場合、エラーレスポンス情報をApiErrorResponseStoreにそのまま格納する（上書き保存）
    if (commonIgnoreErrorFlg) {
      // APIからerrorsが回答された場合、errorsをそのまま格納
      if (res.error.errors) {
        this._apiErrorResSvc.setApiErrorResponse(res.error);
      } else {
        this._apiErrorResSvc.setApiErrorResponse(res);
      }
    } else {
      // HTTPステータスコードが500系かつ、購入発券処理でタイムアウトエラーが回答された場合
      if (is5XX && _apiErrorCode === ErrorCodeConstants.ERROR_CODES.FDXZ000005) {
        errorInfo = {
          errorType: ErrorType.BUSINESS_LOGIC,
          apiErrorCode: _apiErrorCode,
          errorMsgId: 'E1844',
        };
      }
      // HTTPステータスコードが500系または404の場合
      // または0（CORSエラーなどのネットワークエラー考慮）の場合
      else if (_statusCode === 404 || is5XX || _statusCode === 0) {
        errorInfo = {
          errorType: ErrorType.SYSTEM,
          apiErrorCode: _apiErrorCode,
        };
      } else if (_statusCode === 429) {
        errorInfo = {
          errorType: ErrorType.BUSINESS_LOGIC,
          apiErrorCode: _apiErrorCode,
          errorMsgId: 'E1825',
        };
      }
      // セッションタイムアウトエラーの場合（アクセストークン有効期限切れ）
      else if (
        [ErrorCodeConstants.ERROR_CODES.EBAZ000015, ErrorCodeConstants.ERROR_CODES.EAPZ000018].includes(_apiErrorCode)
      ) {
        errorInfo = {
          errorType: ErrorType.SESSION_TIMEOUT,
          apiErrorCode: _apiErrorCode,
        };
      }
      // 認可検証エラーの場合
      else if (
        [
          ErrorCodeConstants.ERROR_CODES.EAPZ000001,
          ErrorCodeConstants.ERROR_CODES.EAPZ000003,
          ErrorCodeConstants.ERROR_CODES.EAPZ000019,
          ErrorCodeConstants.ERROR_CODES.EAPZ000020,
        ].includes(_apiErrorCode)
      ) {
        errorInfo = {
          errorType: ErrorType.BUSINESS_LOGIC,
          apiErrorCode: _apiErrorCode,
          errorMsgId: 'E0768',
        };
      }
      // 初期流入エラーの場合
      else if (_apiErrorCode === ErrorCodeConstants.ERROR_CODES.EAPZ000004) {
        errorInfo = {
          errorType: ErrorType.BUSINESS_LOGIC,
          apiErrorCode: _apiErrorCode,
          errorMsgId: 'E0438',
        };
      }
      // エラーレスポンス情報に含まれた「errorType」が「THROUGH」の場合
      else if (_errorType === 'THROUGH') {
        const _errorMsgId = this._getThroughErrorMsgId(_apiErrorCode);
        errorInfo = {
          errorType: ErrorType.BUSINESS_LOGIC,
          apiErrorCode: _apiErrorCode,
          errorMsgId: _errorMsgId ? _errorMsgId : 'E1855',
        };
      }
      // 上記以外の場合、エラーレスポンス情報をApiErrorResponseStoreにそのまま格納する（上書き保存）
      else {
        // APIからerrorsが回答された場合、errorsをそのまま格納
        if (res.error.errors) {
          this._apiErrorResSvc.setApiErrorResponse(res.error);
        } else {
          this._apiErrorResSvc.setApiErrorResponse(res);
        }
        return;
      }
      this.setNotRetryableError(errorInfo);
    }
  }

  /**
   * DxAPIエラーコード対応マスタ、またはiFlyエラーコード対応マスタ_エラーメッセージマスタから、
   * APIエラーコードに対応したエラーメッセージID取得
   *
   * @param apiErrorCode APIエラーコード
   * @returns
   */
  private _getThroughErrorMsgId(apiErrorCode: string): string {
    let errorMsgId: string = '';
    // DxAPIエラーコード対応マスタキャッシュ、またはiFlyエラーコード対応マスタ_エラーメッセージマスタキャッシュから、
    // APIエラーコードに対応したエラーメッセージIDを取得する
    this._subscription.add(
      this._aswMasterSvc
        .getAswMasterByKey$(MasterStoreKey.DXAPI_ERROR_CODE)
        .pipe(
          switchMap((dxapiResult) => {
            const dxapiErrorMsgId = dxapiResult[apiErrorCode]?.[0]?.['error_message_id'] || '';

            if (dxapiErrorMsgId) {
              // dxapiマスタに一致するエラーコードが存在する場合、取得した値を返却する
              return of(dxapiErrorMsgId);
            } else {
              // dxapiマスタに一致するエラーコードが存在しない場合、
              // iFlyエラーコード対応マスタ_エラーメッセージマスタに一致するエラーコードを返却する
              return this._aswMasterSvc.getAswMasterByKey$(MasterStoreKey.IFLY_ERROR_CODE_ERRORMESSAGE).pipe(
                map((iflyResult) => {
                  const iflyErrorMsgId = iflyResult?.find(
                    (item: { space_error_code: string; error_message_id: string }) => {
                      return item.space_error_code === apiErrorCode;
                    }
                  );
                  return iflyErrorMsgId.error_message_id || '';
                })
              );
            }
          }),
          take(1)
        )
        .subscribe((result) => {
          errorMsgId = result;
        })
    );
    return errorMsgId;
  }

  public ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
