import { createFeatureSelector } from '@ngrx/store';
import { PAGE_INIT_STORE_NAME, PageLoadingState } from './page-loading.state';

/** Select PageLoading State */
export const selectPageLoadingState = createFeatureSelector<PageLoadingState>(PAGE_INIT_STORE_NAME);
