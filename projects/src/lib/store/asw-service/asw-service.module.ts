import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { aswServiceReducer } from './asw-service.reducer';
import { ASW_SERVICE_STORE_NAME, AswServiceState } from './asw-service.state';

/** Token of the AswService reducer */
export const ASW_SERVICE_REDUCER_TOKEN = new InjectionToken<ActionReducer<AswServiceState, Action>>(
  'Feature AswService Reducer'
);

/** Provide default reducer for AswService store */
export function getDefaultAswServiceReducer() {
  return aswServiceReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(ASW_SERVICE_STORE_NAME, ASW_SERVICE_REDUCER_TOKEN)],
  providers: [{ provide: ASW_SERVICE_REDUCER_TOKEN, useFactory: getDefaultAswServiceReducer }],
})
export class AswServiceStoreModule {
  public static forRoot<T extends AswServiceState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<AswServiceStoreModule> {
    return {
      ngModule: AswServiceStoreModule,
      providers: [{ provide: ASW_SERVICE_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
