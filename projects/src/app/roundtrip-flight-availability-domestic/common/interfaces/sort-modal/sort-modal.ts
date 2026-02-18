/**
 * ソート種別
 */
export type SortOrder = '0' | '1' | '2' | '3';
export const SortOrder = {
  RECCOMENDED: '0' as SortOrder,
  DEPARTURE_TIME: '1' as SortOrder,
  ARRIVAL_TIME: '2' as SortOrder,
  FIGHT_DURATION: '3' as SortOrder,
};

/**
 * ソートオプション
 */
export interface SortOption {
  sortName: string;
  sortOrder: SortOrder;
}
