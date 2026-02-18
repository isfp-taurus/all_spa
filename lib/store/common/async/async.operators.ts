import { from, identity, Observable, OperatorFunction } from 'rxjs';
import { catchError, finalize, map, pairwise, startWith, switchMap, tap } from 'rxjs/operators';
import { AsyncRequest, ExtractFromApiActionPayloadType, FromApiActionPayload } from './async.interfaces';
import { isIdentifiedCallAction } from './async.helpers';
import { Action } from '@ngrx/store';

/**
 * Custom operator to use instead of SwitchMap with effects based on FromApi actions.
 * It makes sure to emit an action when the inner subscription is unsubscribed in order to keep the store up-to-date with pending information.
 *
 * @param successHandler function that returns the action to emit in case the FromApi call is a success
 * @param errorHandler function that returns the action to emit in case the FromApi call fails
 * @param cancelRequestActionFactory function that returns the action to emit in case the FromApi action is 'cancelled' because a new action was received by the switchMap
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function fromApiEffectSwitchMap<
  T extends FromApiActionPayload<any>,
  S extends ExtractFromApiActionPayloadType<T>,
  U extends Action,
  V extends Action,
  W extends Action
>(
  successHandler: (result: S, action: T) => U,
  errorHandler: (error: any, action: T) => Observable<V>,
  cancelRequestActionFactory: (props: AsyncRequest, action: T) => W
): OperatorFunction<T, U | V | W> {
  const pendingRequestIdsContext: Record<string, boolean> = {};

  return (source$) =>
    source$.pipe(
      tap((action) => {
        if (isIdentifiedCallAction(action)) {
          pendingRequestIdsContext[action.requestId] = true;
        }
      }),
      startWith(undefined),
      pairwise(),
      switchMap(([previousAction, action]) => {
        const isPreviousActionStillRunning =
          isIdentifiedCallAction(previousAction) && pendingRequestIdsContext[previousAction.requestId];

        return from(action!.call).pipe(
          map((result) => successHandler(result, action!)),
          catchError((error) => errorHandler(error, action!)),
          isPreviousActionStillRunning
            ? startWith(cancelRequestActionFactory({ requestId: previousAction!.requestId! }, action!))
            : identity,
          finalize(() => {
            if (isIdentifiedCallAction(action)) {
              delete pendingRequestIdsContext[action.requestId];
            }
          })
        );
      })
    );
}
