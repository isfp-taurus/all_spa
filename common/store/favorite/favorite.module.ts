import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { FavoriteEffect } from './favorite.effect';
import { favoriteReducer } from './favorite.reducer';
import { FAVORITE_STORE_NAME, FavoriteState } from './favorite.state';

/** Token of the Favorite reducer */
export const FAVORITE_REDUCER_TOKEN = new InjectionToken<ActionReducer<FavoriteState, Action>>(
  'Feature Favorite Reducer'
);

/** Provide default reducer for Favorite store */
export function getDefaultFavoriteReducer() {
  return favoriteReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(FAVORITE_STORE_NAME, FAVORITE_REDUCER_TOKEN),
    EffectsModule.forFeature([FavoriteEffect]),
  ],
  providers: [{ provide: FAVORITE_REDUCER_TOKEN, useFactory: getDefaultFavoriteReducer }],
})
export class FavoriteStoreModule {
  public static forRoot<T extends FavoriteState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<FavoriteStoreModule> {
    return {
      ngModule: FavoriteStoreModule,
      providers: [{ provide: FAVORITE_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
