import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { aswCommonReducer } from './asw-common.reducer';
import { ASW_COMMON_STORE_NAME, AswCommonState } from './asw-common.state';

/** Token of the AswCommon reducer */
export const ASW_COMMON_REDUCER_TOKEN = new InjectionToken<ActionReducer<AswCommonState, Action>>(
  'Feature AswCommon Reducer'
);

/** Provide default reducer for AswCommon store */
export function getDefaultAswCommonReducer() {
  return aswCommonReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(ASW_COMMON_STORE_NAME, ASW_COMMON_REDUCER_TOKEN)],
  providers: [{ provide: ASW_COMMON_REDUCER_TOKEN, useFactory: getDefaultAswCommonReducer }],
})
export class AswCommonStoreModule {
  public static forRoot<T extends AswCommonState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<AswCommonStoreModule> {
    return {
      ngModule: AswCommonStoreModule,
      providers: [{ provide: ASW_COMMON_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
