import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { UpdateServicesEffect } from './update-services.effect';
import { UpdateServicesReducer } from './update-services.reducer';
import { UPDATE_SERVICES_STORE_NAME, UpdateServicesState } from './update-services.state';

/** Token of the UpdateServices reducer */
export const UPDATE_SERVICES_REDUCER_TOKEN = new InjectionToken<ActionReducer<UpdateServicesState, Action>>(
  'Feature UpdateServices Reducer'
);

/** Provide default reducer for UpdateServices store */
export function getDefaultUpdateServicesReducer() {
  return UpdateServicesReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(UPDATE_SERVICES_STORE_NAME, UPDATE_SERVICES_REDUCER_TOKEN),
    EffectsModule.forFeature([UpdateServicesEffect]),
  ],
  providers: [{ provide: UPDATE_SERVICES_REDUCER_TOKEN, useFactory: getDefaultUpdateServicesReducer }],
})
export class UpdateServicesStoreModule {
  public static forRoot<T extends UpdateServicesState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<UpdateServicesStoreModule> {
    return {
      ngModule: UpdateServicesStoreModule,
      providers: [{ provide: UPDATE_SERVICES_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
