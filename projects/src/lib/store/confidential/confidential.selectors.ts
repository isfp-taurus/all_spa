import { createFeatureSelector } from '@ngrx/store';
import { CONFIDENTIAL_STORE_NAME, ConfidentialState } from './confidential.state';

/** Select Confidential State */
export const selectConfidentialState = createFeatureSelector<ConfidentialState>(CONFIDENTIAL_STORE_NAME);
