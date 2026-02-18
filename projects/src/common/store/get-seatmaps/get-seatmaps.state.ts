import { AsyncStoreItem } from '@lib/store';
import { GetSeatmapsResponse } from 'src/sdk-servicing';

export interface SeatmapsModel extends GetSeatmapsResponse {}

export interface SeatmapsState extends SeatmapsModel, AsyncStoreItem {}

export const SEATMAPS_STATE = 'seatmaps';

export interface SeatmapsStore {
  [SEATMAPS_STATE]: SeatmapsState;
}
