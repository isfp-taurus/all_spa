import { ANA_BIZ_OFFICE_CODE, APF_OFFICE_CODE, MListData, OFFICE_CODE_JP } from '@common/interfaces';
import { MOffice } from '@lib/interfaces';
import { AswContextState } from '@lib/store';
import { filter, map, Observable } from 'rxjs';
import { TravelerNamesInner } from 'src/sdk-reservation';
import { string8ToDate } from './calc';

/**
 * こまごました業務判定をまとめる
 */

/**
 * 操作中POSがカナダかどうか
 * @param aswContext ユーザー共通情報
 * @returns カナダか否か
 */
export function isCanada(aswContext: AswContextState): boolean {
  const canadaPosCode = 'CA';
  if (aswContext.posCountryCode === canadaPosCode) {
    return true;
  } else {
    return false;
  }
}

/**
 * 電話番号種別　APIデータとcacheデータの変換
 * @param code API値
 * @returns キャッシュ値
 */
export function getCachePhoneType(code: string) {
  switch (code) {
    case 'M':
      return 'M1';
    case 'B':
      return 'B1';
    case 'H':
      return 'H1';
    default:
      return code;
  }
}

/**
 * 電話番号種別　APIデータとcacheデータの変換
 * @param code キャッシュ値
 * @returns API値
 */
export function getApiPhoneType(code: string) {
  switch (code) {
    case 'M1':
      return 'M';
    case 'B1':
      return 'B';
    case 'H1':
      return 'H';
    default:
      return code;
  }
}

/**
 * 現在のオフィスの取得
 * @param officeMaster　オフィスマスタ
 * @param posCountryCode　POS国コード(this._common.aswContextStoreService.aswContextData.posCountryCodeで取得可能)
 * @returns 現在のオフィス
 */
export function getCurrentOffice(officeMaster: Array<MOffice>, posCountryCode: string) {
  return officeMaster.find((off) => off.office_code === posCountryCode);
}

/**
 * 適用中のリストのみを返却する
 * @param listData 汎用データリスト
 * @param date 適用日付
 * @returns 適用中の汎用データリスト
 */
export function getApplyListData(listData: Array<MListData>, date: Date): Array<MListData> {
  return fixedArrayCache(listData).filter(
    (list: MListData) =>
      string8ToDate(list.apply_from_date).getTime() <= date.getTime() &&
      date.getTime() <= string8ToDate(list.apply_to_date).getTime()
  );
}

/**
 * 汎用マスタから特定のデータを取り出す
 * @param listData 汎用マスタデータ
 * @param key 取り出すキー PD_001など
 * @param lang 取り出す言語　未指定の場合全言語
 * @returns 取り出したデータ
 */
export function getKeyListData(listData: Array<MListData>, key: string, lang?: string): Array<MListData> {
  return fixedArrayCache(listData)
    .filter((list: MListData) => (lang === undefined || list.lang === lang) && list.data_code === key)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

/**
 * 汎用マスタから特定のデータを取り出す
 * @param listData 汎用マスタデータ
 * @param key 取り出すキー PD_001など
 * @param lang 取り出す言語　未指定の場合全言語
 * @returns 取り出したデータ
 */
export function getKeyListData$(
  listData: Observable<Array<MListData>>,
  key: string,
  lang?: string
): Observable<Array<MListData>> {
  return listData.pipe(
    filter((listData) => listData instanceof Array<any>),
    map((listData) =>
      listData.filter((list: MListData) => (lang === undefined || list.lang === lang) && list.data_code === key)
    ),
    map((listData) => listData.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)))
  );
}

/**
 * キャッシュ取得失敗時にArrayのものでもオブジェクトになってしまうのでガードする処理
 * @param data キャッシュデータ
 * @returns 修正済みキャッシュデータ
 */
export function fixedArrayCache<T>(data?: Array<T> | object): Array<T> {
  return data && Array.isArray(data) ? data : [];
}

/**
 * 汎用版
 */
export function getApplyDateCache(
  dataList: Array<any>,
  date: Date,
  fromKey = 'apply_from_date',
  toKey = 'apply_to_date'
): Array<any> {
  return fixedArrayCache(dataList).filter(
    (list) =>
      string8ToDate(list[fromKey] ?? '').getTime() <= date.getTime() &&
      date.getTime() <= string8ToDate(list[toKey] ?? '').getTime()
  );
}

/**
 * FY25要件 プランの作成オフィスまたは、現在の操作オフィスがANABizオフィスの場合、かつ両方が日本オフィスの場合の判定。
 * 規約の表示判定で使用する
 * APFは対象外とする
 * @param planOfficeCode プラン作成オフィスコード
 * @param currentOfficeCode 現在のオフィスコード
 * @returns 判定結果
 */
export function checkAnaBizAndJapaneseOffice(planOfficeCode: string, currentOfficeCode: string) {
  const offices = [planOfficeCode, currentOfficeCode];
  const isBiz = offices.some((code) => code === ANA_BIZ_OFFICE_CODE);
  return isBiz && offices.every((code) => code.startsWith(OFFICE_CODE_JP) && code !== APF_OFFICE_CODE);
}

/**
 * 搭乗者の名前を名、ミドルネーム、姓で表示する サービシングから使用する場合はキャストしてください
 * @param name 搭乗者の名前情報
 * @returns 整形文字列
 */
export function defaultDispPassengerName(name: TravelerNamesInner) {
  const firstName = `${name.firstName ?? ''}`;
  const middleName = name.middleName ? `${name.middleName} ` : ' ';
  const lastName = name.lastName ?? '';
  return `${firstName}${middleName}${lastName}`;
}
