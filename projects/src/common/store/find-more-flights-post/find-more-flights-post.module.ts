import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { FindMoreFlightsPostEffect } from './find-more-flights-post.effect';
import { FindMoreFlightsPostReducer } from './find-more-flights-post.reducer';
import { FIND_MORE_FLIGHTS_POST_NAME, FindMoreFlightsPostState } from './find-more-flights-post.state';

/** Token of the FindMoreFlightsPost reducer */
export const GET_FIND_MORE_FLIGHTS_POST_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<FindMoreFlightsPostState, Action>
>('Feature FindMoreFlightsPost Reducer');

/** Provide default reducer for FindMoreFlightsPost store */
export function getDefaultFindMoreFlightsPostReducer() {
  return FindMoreFlightsPostReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(FIND_MORE_FLIGHTS_POST_NAME, GET_FIND_MORE_FLIGHTS_POST_REDUCER_TOKEN),
    EffectsModule.forFeature([FindMoreFlightsPostEffect]),
  ],
  providers: [{ provide: GET_FIND_MORE_FLIGHTS_POST_REDUCER_TOKEN, useFactory: getDefaultFindMoreFlightsPostReducer }],
})
export class FindMoreFlightsPostStoreModule {
  public static forRoot<T extends FindMoreFlightsPostState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<FindMoreFlightsPostStoreModule> {
    return {
      ngModule: FindMoreFlightsPostStoreModule,
      providers: [{ provide: GET_FIND_MORE_FLIGHTS_POST_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
