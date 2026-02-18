import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { UpdatePlannameEffect } from './update-planname.effect';
import { updatePlannameReducer } from './update-planname.reducer';
import { UPDATE_PLANNAME_STORE_NAME, UpdatePlannameState } from './update-planname.state';

/** Token of the UpdatePlanname reducer */
export const UPDATE_PLANNAME_REDUCER_TOKEN = new InjectionToken<ActionReducer<UpdatePlannameState, Action>>(
  'Feature UpdatePlanname Reducer'
);

/** Provide default reducer for UpdatePlanname store */
export function getDefaultUpdatePlannameReducer() {
  return updatePlannameReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(UPDATE_PLANNAME_STORE_NAME, UPDATE_PLANNAME_REDUCER_TOKEN),
    EffectsModule.forFeature([UpdatePlannameEffect]),
  ],
  providers: [{ provide: UPDATE_PLANNAME_REDUCER_TOKEN, useFactory: getDefaultUpdatePlannameReducer }],
})
export class UpdatePlannameStoreModule {
  public static forRoot<T extends UpdatePlannameState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<UpdatePlannameStoreModule> {
    return {
      ngModule: UpdatePlannameStoreModule,
      providers: [{ provide: UPDATE_PLANNAME_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
