import { createFeatureSelector } from '@ngrx/store';
import { ASW_MASTER_STORE_NAME, AswMasterState } from './asw-master.state';

/** Select AswMaster State */
export const selectAswMasterState = createFeatureSelector<AswMasterState>(ASW_MASTER_STORE_NAME);
