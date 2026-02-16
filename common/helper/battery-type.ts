/**
 * 車いすバッテリータイプ変換処理
 * カート取得で返ってくる値と搭乗者更新で送る値が異なるので確認
 * @param value カート取得APIバッテリータイプ種別
 * @return  キャッシュバッテリータイプ種別
 */
export function wheelchairBatteryValue(value: string) {
  switch (value) {
    case 'nickelCadmium':
      return '1'; //ニッカド
    case 'nickelMetalHydride':
      return '2'; //ニッケル水素
    case 'lithiumIon':
      return '3'; //リチウムイオン
    case 'shieldBattery':
      return '6'; //シールド(カート取得APIから返却される形)
    case 'nonShieldBattery':
      return '7'; //ノンシールド(カート取得APIから返却される形)
  }
  return value;
}
/**
 * 車いすバッテリータイプ変換処理
 * @param value キャッシュバッテリータイプ種別
 * @return  カート取得APIバッテリータイプ種別
 */
export function wheelchairBatteryApi(value: string) {
  switch (value) {
    case '1':
      return 'nickelCadmium'; //ニッカド
    case '2':
      return 'nickelMetalHydride'; //ニッケル水素
    case '3':
      return 'lithiumIon'; //リチウムイオン
    case '6':
      return 'shieldBattery'; //シールド(カート取得APIから返却される形)
    case '7':
      return 'nonShieldBattery'; //ノンシールド(カート取得APIから返却される形)
  }
  return value;
}
