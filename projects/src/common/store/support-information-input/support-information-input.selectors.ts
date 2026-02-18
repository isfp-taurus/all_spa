import { createFeatureSelector } from '@ngrx/store';
import { SUPPORT_INFORMATION_INPUT_STORE_NAME, SupportInformationInputState } from './support-information-input.state';

/** Select SupportInformationInput State */
export const selectSupportInformationInputState = createFeatureSelector<SupportInformationInputState>(
  SUPPORT_INFORMATION_INPUT_STORE_NAME
);
