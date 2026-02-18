import { MOffice } from '@lib/interfaces';

/**
 * 予約購入完了画面　使用cacheデータ定義
 * @param office オフィスマスタ
 */
export interface BookingCompletedMastarData {
  office: Array<MOffice>;
}

export function initialBookingCompletedMastarData() {
  return {
    office: [],
  };
}
