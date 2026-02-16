import { CountryCodeNameType, MCountryPos, MCountryPosByContact } from '@common/interfaces';

/** 国.国コード(2レター) */
const COUNTRY_2LETTER_CODE = {
  JP: 'JP',
  DIVIDING_LINE: '',
};
/** 電話番号国 国(国際化).国コード(3レター) */
const COUNTRY_3LETTER_CODE = {
  USA: 'USA',
  CAN: 'CAN',
  JPN: 'JPN',
};
/** 電話番号国 国(国際化).国名称用 */
const COUNTRY_NAME = {
  COUNTRY_3LETTER_CODE_TO_COUNTRY_NAME_PREFIX: 'm_country_i18n_',
  DIVIDING_LINE: '----------------------------------------',
};

/**
 * 電話番号国リストを作成する
 * @param mPosCountry オフィス管轄国キャッシュ
 * @param mWithoutPosCountry オフィス管轄外国キャッシュ
 * @param posCountryCode POS国コード
 * @param isContactTelCountry 電話番号居住国(true)/搭乗者SMS送信可(false)
 * @returns 電話番号国リスト
 */
export function getPhoneCountryList(
  mPosCountry: MCountryPosByContact,
  mWithoutPosCountry: MCountryPos[],
  posCountryCode: string,
  isContactTelCountry: boolean = true
): Array<CountryCodeNameType> {
  let phoneCountryTelInfoList: Array<CountryCodeNameType> = [];
  //オフィス管轄国を追加
  mPosCountry?.[posCountryCode]?.forEach((countryInfo: MCountryPos) => {
    phoneCountryTelInfoList.push({
      countryCode: countryInfo.country_2letter_code,
      countryName:
        countryInfo.country_name ??
        `${COUNTRY_NAME.COUNTRY_3LETTER_CODE_TO_COUNTRY_NAME_PREFIX}${countryInfo.country_3letter_code}`,
      isTranslate: countryInfo.country_name === undefined,
    });
  });
  //　日本が含まれない場合日本を追加
  if (!phoneCountryTelInfoList.some((list) => list.countryCode === COUNTRY_2LETTER_CODE.JP)) {
    phoneCountryTelInfoList.push({
      countryCode: COUNTRY_2LETTER_CODE.JP,
      countryName: `${COUNTRY_NAME.COUNTRY_3LETTER_CODE_TO_COUNTRY_NAME_PREFIX}${COUNTRY_3LETTER_CODE.JPN}`,
      isTranslate: true,
    });
  }
  //区切り線を追加
  phoneCountryTelInfoList.push({
    countryCode: COUNTRY_2LETTER_CODE.DIVIDING_LINE,
    countryName: COUNTRY_NAME.DIVIDING_LINE,
    isTranslate: false,
  });
  //オフィス管轄外国を追加
  let mWithoutInfoList: Array<CountryCodeNameType> = [];
  mWithoutPosCountry?.forEach((countryInfo: any) => {
    const isContactTelCountryFlag = isContactTelCountry && countryInfo?.contact_tel_number_country_flg;
    const isSmsSendFlag = !isContactTelCountry && countryInfo?.sms_send_flag;
    const isExist = phoneCountryTelInfoList.find((info) => info.countryCode === countryInfo.country_2letter_code);
    if ((isContactTelCountryFlag || isSmsSendFlag) && !isExist) {
      mWithoutInfoList.push({
        countryCode: countryInfo.country_2letter_code,
        countryName: countryInfo.country_name_sms,
        isTranslate: false,
      });
    }
  });
  return phoneCountryTelInfoList.concat(mWithoutInfoList);
}
