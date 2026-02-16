/**
 * 入力完了操作エリア部品入力情報 設定値
 * @param nextAction 次のアクションに表示する文字列
 * @param nextButtonLabel 次へボタンに表示するラベル
 * @param saveButtonLabel 保存・プラン確認画面へ戻るボタンに表示するラベル
 *
 */
export interface PassengerInformationRequestInputCompleteOperationparts {
  nextAction: string;
  nextButtonLabel: string;
  saveButtonLabel: string;
}

export function initialPassengerInformationRequestInputCompleteOperationparts() {
  return {
    nextAction: '',
    nextButtonLabel: '',
    saveButtonLabel: '',
  };
}
