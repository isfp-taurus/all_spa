import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { apiErrorResponseReducer } from './api-error-response.reducer';
import { API_ERROR_RESPONSE_STORE_NAME, ApiErrorResponseState } from './api-error-response.state';

/** Token of the ApiErrorResponse reducer */
export const API_ERROR_RESPONSE_REDUCER_TOKEN = new InjectionToken<ActionReducer<ApiErrorResponseState, Action>>(
  'Feature ApiErrorResponse Reducer'
);

/** Provide default reducer for ApiErrorResponse store */
export function getDefaultApiErrorResponseReducer() {
  return apiErrorResponseReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(API_ERROR_RESPONSE_STORE_NAME, API_ERROR_RESPONSE_REDUCER_TOKEN)],
  providers: [{ provide: API_ERROR_RESPONSE_REDUCER_TOKEN, useFactory: getDefaultApiErrorResponseReducer }],
})
export class ApiErrorResponseStoreModule {
  public static forRoot<T extends ApiErrorResponseState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<ApiErrorResponseStoreModule> {
    return {
      ngModule: ApiErrorResponseStoreModule,
      providers: [{ provide: API_ERROR_RESPONSE_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
