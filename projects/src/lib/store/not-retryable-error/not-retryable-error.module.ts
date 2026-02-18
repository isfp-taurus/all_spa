import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { notRetryableErrorReducer } from './not-retryable-error.reducer';
import { NOT_RETRYABLE_ERROR_STORE_NAME, NotRetryableErrorState } from './not-retryable-error.state';

/** Token of the NotRetryableError reducer */
export const NOT_RETRYABLE_ERROR_REDUCER_TOKEN = new InjectionToken<ActionReducer<NotRetryableErrorState, Action>>(
  'Feature NotRetryableError Reducer'
);

/** Provide default reducer for NotRetryableError store */
export function getDefaultNotRetryableErrorReducer() {
  return notRetryableErrorReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(NOT_RETRYABLE_ERROR_STORE_NAME, NOT_RETRYABLE_ERROR_REDUCER_TOKEN)],
  providers: [{ provide: NOT_RETRYABLE_ERROR_REDUCER_TOKEN, useFactory: getDefaultNotRetryableErrorReducer }],
})
export class NotRetryableErrorStoreModule {
  public static forRoot<T extends NotRetryableErrorState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<NotRetryableErrorStoreModule> {
    return {
      ngModule: NotRetryableErrorStoreModule,
      providers: [{ provide: NOT_RETRYABLE_ERROR_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
