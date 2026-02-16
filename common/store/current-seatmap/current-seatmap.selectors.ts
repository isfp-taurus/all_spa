import { createFeatureSelector } from '@ngrx/store';
import { CURRENT_SEATMAP_STORE_NAME, CurrentSeatmapState } from './current-seatmap.state';

/** Select CurrentSeatmap State */
export const selectCurrentSeatmapState = createFeatureSelector<CurrentSeatmapState>(CURRENT_SEATMAP_STORE_NAME);
