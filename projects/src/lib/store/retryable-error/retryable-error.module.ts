import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { retryableErrorReducer } from './retryable-error.reducer';
import { RETRYABLE_ERROR_STORE_NAME, RetryableErrorState } from './retryable-error.state';

/** Token of the RetryableError reducer */
export const RETRYABLE_ERROR_REDUCER_TOKEN = new InjectionToken<ActionReducer<RetryableErrorState, Action>>(
  'Feature RetryableError Reducer'
);

/** Provide default reducer for RetryableError store */
export function getDefaultRetryableErrorReducer() {
  return retryableErrorReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(RETRYABLE_ERROR_STORE_NAME, RETRYABLE_ERROR_REDUCER_TOKEN)],
  providers: [{ provide: RETRYABLE_ERROR_REDUCER_TOKEN, useFactory: getDefaultRetryableErrorReducer }],
})
export class RetryableErrorStoreModule {
  public static forRoot<T extends RetryableErrorState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<RetryableErrorStoreModule> {
    return {
      ngModule: RetryableErrorStoreModule,
      providers: [{ provide: RETRYABLE_ERROR_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
