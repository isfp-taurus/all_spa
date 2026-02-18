import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { aswMasterReducer } from './asw-master.reducer';
import { ASW_MASTER_STORE_NAME, AswMasterState } from './asw-master.state';

/** Token of the AswMaster reducer */
export const ASW_MASTER_REDUCER_TOKEN = new InjectionToken<ActionReducer<AswMasterState, Action>>(
  'Feature AswMaster Reducer'
);

/** Provide default reducer for AswMaster store */
export function getDefaultAswMasterReducer() {
  return aswMasterReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(ASW_MASTER_STORE_NAME, ASW_MASTER_REDUCER_TOKEN)],
  providers: [{ provide: ASW_MASTER_REDUCER_TOKEN, useFactory: getDefaultAswMasterReducer }],
})
export class AswMasterStoreModule {
  public static forRoot<T extends AswMasterState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<AswMasterStoreModule> {
    return {
      ngModule: AswMasterStoreModule,
      providers: [{ provide: ASW_MASTER_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
