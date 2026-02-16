import { MCountry } from '../../../master/m_country';
import { MLangCodeConvert } from '../../../master/m_lang-code-convert';
import { MListData } from '../../../master/m_listdata';
import { MOffice } from '@lib/interfaces';
import { CountryCodeNameType } from '@common/interfaces/common/master-data.interface';
import { MAirport } from '@common/interfaces';
import { MMileageProgram } from '@common/interfaces';

/**
 * 搭乗者情報入力で使用するマスターデータ定義
 * @param pd004 リストデータPD_004 搭乗者の性別リスト
 * @param pd010 リストデータPD_010 電話番号種別
 * @param pd020 リストデータPD_020 サポート情報　妊婦の現在の状態
 * @param pd065 リストデータPD_065 言語名
 * @param pd960 リストデータPD_960 バッテリータイプの表示名称
 * @param mileage マイレージプログラムリスト
 * @param country　国コードマスタ
 * @param phoneCountry 電話番号国
 * @param phoneCountrySms 電話番号国SMS用
 * @param office　オフィスマスタ
 * @param langCodeConvert 言語変換マスタ
 * @param property AKAMAIプロパティテーブル
 */
export interface PassengerInformationRequestMastarData {
  pd004: Array<MListData>;
  pd006: Array<MListData>;
  pd010: Array<MListData>;
  pd020: Array<MListData>;
  pd065: Array<MListData>;
  pd960: Array<MListData>;
  mileage: Array<MMileageProgram>;
  country: Array<MCountry>;
  phoneCountry: Array<CountryCodeNameType>;
  phoneCountrySms: Array<CountryCodeNameType>;
  office: Array<MOffice>;
  langCodeConvert: Array<MLangCodeConvert>;
  property: any;
  airport: Array<MAirport>;
}

export function initialPassengerInformationRequestMastarData(): PassengerInformationRequestMastarData {
  return {
    pd004: [],
    pd006: [],
    pd010: [],
    pd020: [],
    pd065: [],
    pd960: [],
    mileage: [],
    country: [],
    phoneCountry: [],
    phoneCountrySms: [],
    office: [],
    langCodeConvert: [],
    property: {},
    airport: [],
  };
}
