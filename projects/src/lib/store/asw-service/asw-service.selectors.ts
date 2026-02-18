import { createFeatureSelector } from '@ngrx/store';
import { ASW_SERVICE_STORE_NAME, AswServiceState } from './asw-service.state';

/** Select AswService State */
export const selectAswServiceState = createFeatureSelector<AswServiceState>(ASW_SERVICE_STORE_NAME);
