import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { FavoritePostEffect } from './favorite-post.effect';
import { favoritePostReducer } from './favorite-post.reducer';
import { FAVORITE_POST_STORE_NAME, FavoritePostState } from './favorite-post.state';

/** Token of the FavoritePost reducer */
export const FAVORITE_POST_REDUCER_TOKEN = new InjectionToken<ActionReducer<FavoritePostState, Action>>(
  'Feature FavoritePost Reducer'
);

/** Provide default reducer for FavoritePost store */
export function getDefaultFavoritePostReducer() {
  return favoritePostReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(FAVORITE_POST_STORE_NAME, FAVORITE_POST_REDUCER_TOKEN),
    EffectsModule.forFeature([FavoritePostEffect]),
  ],
  providers: [{ provide: FAVORITE_POST_REDUCER_TOKEN, useFactory: getDefaultFavoritePostReducer }],
})
export class FavoritePostStoreModule {
  public static forRoot<T extends FavoritePostState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<FavoritePostStoreModule> {
    return {
      ngModule: FavoritePostStoreModule,
      providers: [{ provide: FAVORITE_POST_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
