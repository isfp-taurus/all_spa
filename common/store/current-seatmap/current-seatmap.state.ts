import { SeatmapStoreModel } from '@common/interfaces/reservation/current-seatmap/seatmap-store-model';
import { SeatmapStoreModelRetrieveField } from '@common/interfaces/reservation/current-seatmap/seatmap-store-model-retrieve-field';

/**
 * CurrentSeatmap store state
 */
export interface CurrentSeatmapState extends SeatmapStoreModel {
  retrieve: Partial<SeatmapStoreModel> & SeatmapStoreModelRetrieveField;
}

/**
 * Name of the CurrentSeatmap Store
 */
export const CURRENT_SEATMAP_STORE_NAME = 'currentSeatmap';

/**
 * CurrentSeatmap Store Interface
 */
export interface CurrentSeatmapStore {
  /** CurrentSeatmap state */
  [CURRENT_SEATMAP_STORE_NAME]: CurrentSeatmapState;
}
