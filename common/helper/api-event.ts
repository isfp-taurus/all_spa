import { ApiErrorMap } from '@common/interfaces';
import { ErrorType, NotRetryableErrorModel, RetryableError } from '@lib/interfaces';
import { AsyncStoreItem } from '@lib/store';
import { Observable } from 'rxjs';

/**
 * 汎用的なAPI処理を行う
 */

/**
 * APIストアの処理を行う　リクエストを含めた処理
 * @param requestEvent APIのリクエスト処理　リクエストデータはあらかじめ作っておいて () => { this._xxxxxStoreService.setXxxxxFromApi(request); },などと書く
 * @param event ストアのオブザーバブル this._xxxxxStoreService.getXxxxx$(),
 * @param successEvent 成功時の処理
 * @param errorEvent 失敗時の処理　※任意
 * @param pendingvent ペンディング中の処理　※任意
 */
export function apiEventAll<T extends AsyncStoreItem, U>(
  requestEvent: () => void,
  event: Observable<T>,
  successEvent: (data: T) => void,
  errorEvent?: (data: T) => void,
  pendingvent?: (data: T) => void
) {
  let endSubscription = false;

  const subscription = event.subscribe((response) => {
    if (response.isPending === true) {
      //多重で実行された時subscriptionが作成されていない場合があるため、その場合unsubscribeしないで次でunsubscribeのみ行うようにする
      try {
        subscription.unsubscribe();
      } catch (error) {}
      if (!endSubscription) {
        apiEvent(event, successEvent, errorEvent, pendingvent);
      }
      endSubscription = true;
    }
  });
  requestEvent();
}

/**
 * APIストアの処理を行う　レスポンス処理
 * @param event ストアのオブザーバブル this._xxxxxStoreService.getXxxxx$(),
 * @param successEvent 成功時の処理
 * @param errorEvent 失敗時の処理　※任意
 * @param pendingvent ペンディング中の処理　※任意
 */
export function apiEvent<T extends AsyncStoreItem>(
  event: Observable<T>,
  successEvent: (data: T) => void,
  errorEvent?: (data: T) => void,
  pendingvent?: (data: T) => void
) {
  let endSubscription = false;
  const subscription = event.subscribe((response) => {
    apiEventNotObserbable(
      response,
      (res) => {
        try {
          subscription.unsubscribe();
        } catch (error) {}
        if (!endSubscription) {
          successEvent(res);
        }
        endSubscription = true;
      },
      (res) => {
        try {
          subscription.unsubscribe();
        } catch (error) {}
        if (errorEvent) {
          if (!endSubscription) {
            errorEvent(res);
          }
          endSubscription = true;
        }
      },
      pendingvent
        ? (res) => {
            if (!endSubscription) {
              pendingvent(res);
            }
          }
        : undefined
    );
  });
}

/**
 * APIストアの処理を行う　レスポンスのオブザーバブル内処理
 * @param response ストアのレスポンス
 * @param successEvent 成功時の処理
 * @param errorEvent 失敗時の処理　※任意
 * @param pendingvent ペンディング中の処理　※任意
 */
export function apiEventNotObserbable<T extends AsyncStoreItem>(
  response: T,
  successEvent: (data: T) => void,
  errorEvent?: (data: T) => void,
  pendingvent?: (data: T) => void
) {
  if (response.isPending === false) {
    if (response.isFailure) {
      if (errorEvent) {
        errorEvent(response);
      }
    } else {
      successEvent(response);
    }
  } else {
    if (pendingvent) {
      pendingvent(response);
    }
  }
}

/**
 * APIエラー時の標準処理　該当コードがない場合継続不可能エラー時のイベントが呼び出される
 * @param code APIエラーコード
 * @param map APIエラーに対するエラーメッセージマップ
 * @param retryable 継続可能エラー時のイベント
 * @param notRetryable 継続不可能エラー時のイベント
 */
export function defaultApiErrorEvent(
  code: string,
  map: ApiErrorMap,
  retryable: (error: RetryableError) => void,
  notRetryable: (error: NotRetryableErrorModel) => void
) {
  const errorMap = map[code];
  if (errorMap) {
    if (errorMap.isRetryableError) {
      retryable({
        errorMsgId: errorMap.errorMsgId,
        apiErrorCode: code,
        params: errorMap.replaceParams ?? undefined,
      });
    } else {
      notRetryable({
        errorMsgId: errorMap.errorMsgId,
        apiErrorCode: code,
        params: errorMap.replaceParams ?? undefined,
        errorType: errorMap.errorType ? errorMap.errorType : ErrorType.BUSINESS_LOGIC,
      });
    }
  } else {
    notRetryable({
      errorMsgId: '',
      apiErrorCode: code,
      errorType: ErrorType.SYSTEM,
    });
  }
}
