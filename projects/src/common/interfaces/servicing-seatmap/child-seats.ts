/** シートマップ画面に表示するチャイルドシートリスト */
export type ChildSeats = {
  /** 更新区分<br> request: 登録、cancel：削除 */
  updateCategory: UpdateSeatsChildSeatsInner.OperationEnum;

  /** 搭乗者ID */
  passengerId: string;

  /** チャイルドシート種類 */
  childSeatType: string;
};

export namespace UpdateSeatsChildSeatsInner {
  export type OperationEnum = 'request' | 'cancel';
  export const OperationEnum = {
    Request: 'request' as OperationEnum,
    Cancel: 'cancel' as OperationEnum,
  };
}
