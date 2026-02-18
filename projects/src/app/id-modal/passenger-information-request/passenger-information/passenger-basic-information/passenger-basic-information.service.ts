import { Injectable } from '@angular/core';
import { stringYMDToDate } from '@common/helper';
import { MLangCodeConvert, MListData, PassengerType } from '@common/interfaces';
import { SupportClass } from '@lib/components/support-class';
import { MOffice, AnaBizLoginStatusType } from '@lib/interfaces';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService } from '@lib/services';
import { Traveler } from 'src/sdk-reservation';
import {
  PassengerInformationRequestPassengerBasicInformationData,
  PassengerInformationRequestPassengerBasicInformationParts,
} from './passenger-basic-information.state';
import { PassengerInformationRequestPayload } from '../../passenger-information-request.payload.state';
/**
 * 搭乗者基本情報 service
 */
@Injectable()
export class PassengerInformationRequestPassengerBasicInformationService extends SupportClass {
  constructor(private _common: CommonLibService, public staticMsg: StaticMsgPipe) {
    super();
  }

  destroy() {}

  private _isAnaBizLogin =
    this._common.aswContextStoreService.aswContextData.anaBizLoginStatus === AnaBizLoginStatusType.LOGIN;
  private _bizGivenName = this._common.anaBizContextStoreService.anaBizContextData.allBizContext?.givenName;
  private _bizFamilyName = this._common.anaBizContextStoreService.anaBizContextData.allBizContext?.familyName;
  private _bizEmail = this._common.anaBizContextStoreService.anaBizContextData.allBizContext?.emailAddress;
  private _originBizDateOfBirth =
    this._common.anaBizContextStoreService.anaBizContextData.allBizContext?.dateOfBirth ?? '';
  private _months: any = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  /**
   * 搭乗者基本情報 初期値作成
   * @param traveler 搭乗者情報
   * @param payload 搭乗者情報入力　ペイロードデータ
   * @param index 搭乗者のインデックス
   * @returns 搭乗者基本情報 初期値
   */
  createData(
    traveler: Traveler,
    payload: PassengerInformationRequestPayload,
    index: number
  ): PassengerInformationRequestPassengerBasicInformationData {
    // 法人ログイン時の姓名、生年月日、性別には企業情報の設定値を初期設定する
    // 生年月日と性別は企業情報に姓名・メールアドレスが未設定なら設定しない
    // ミドルネームは法人ログイン時は設定しない

    // 企業情報 dd-MMM-yyyy形式をDate形式に変換
    let bizDateOfBirth = null;
    const [day, month, year] = this._originBizDateOfBirth.split('-');
    if (day && month && year) {
      bizDateOfBirth = new Date(Number(year), this._months[month], Number(day));
      if (isNaN(bizDateOfBirth.getTime())) {
        bizDateOfBirth = null;
      }
    }
    // 性別をカート情報の形式に変換
    // 企業情報 M, F, X, U
    // カート情報 male, female, unspecified, unknown
    const originBizGender = this._common.anaBizContextStoreService.anaBizContextData.allBizContext?.gender;
    let bizGender = '';
    if (originBizGender === 'M') {
      bizGender = 'male';
    } else if (originBizGender === 'F') {
      bizGender = 'female';
    } else if (originBizGender === 'X') {
      bizGender = 'unspecified';
    } else if (originBizGender === 'U') {
      bizGender = 'unknown';
    }

    let firstName = '';
    let lastName = '';
    let middleName = '';
    let selectYmd = null;
    let gender = '';
    if (this._isAnaBizLogin && index === 0 && (payload.editArea === 0 || !payload.isEditMode)) {
      firstName = this._bizGivenName ?? '';
      lastName = this._bizFamilyName ?? '';
      if (this._bizGivenName || this._bizFamilyName || this._bizEmail) {
        selectYmd = bizDateOfBirth;
        gender = bizGender;
      }
    } else {
      firstName = traveler.names?.[0]?.firstName ?? '';
      lastName = traveler.names?.[0]?.lastName ?? '';
      middleName = traveler.names?.[0]?.middleName ?? '';
      selectYmd = stringYMDToDate(traveler.dateOfBirth ?? '') ?? null;
      gender = traveler.gender ?? '';
    }
    return {
      title: traveler.names?.[0]?.title === 'DR' ? 'DR' : '',
      firstName,
      middleName,
      lastName,
      selectYmd,
      gender,
      isError: false,
    };
  }

  /**
   * 搭乗者基本情報 設定値作成
   * @param traveler 搭乗者情報
   * @param departureDate 出発日
   * @param isDomestic 国内旅程か否か
   * @param isDomesticDcsFlight 国内旅程DCS日付前か否か
   * @param pd004 リストデータPD_004 搭乗者の性別リスト
   * @param payload 搭乗者情報入力　ペイロードデータ
   * @param index 搭乗者のインデックス
   * @param property AKAMAIプロパティ
   * @param langCodeConvert 言語変換
   * @param office オフィス
   * @returns 搭乗者基本情報 設定値
   */
  createParts(
    traveler: Traveler,
    departureDate: Date,
    isDomestic: boolean,
    isDomesticDcsFlight: boolean,
    pd004: Array<MListData>,
    payload: PassengerInformationRequestPayload,
    index: number,
    langCodeConvert?: MLangCodeConvert,
    office?: MOffice
  ): PassengerInformationRequestPassengerBasicInformationParts {
    // 敬称リスト
    const titleList: Array<{ value: string; disp: string }> = [];
    //言語
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    if ((office?.pos_country_code === 'DE' || office?.pos_country_code === 'AT') && lang === 'de') {
      //操作オフィスのPOSがドイツ、またはオーストリアのどちらかで、言語がドイツ語の場合
      if (traveler.passengerTypeCode === PassengerType.ADT || traveler.passengerTypeCode === PassengerType.B15) {
        //搭乗者種別が大人またはヤングアダルト
        titleList.push({ value: '', disp: '-' }, { value: 'DR', disp: 'DR' });
      }
    }
    //搭乗者の誕生日
    //生年月日は姓名・メールアドレスが未設定なら設定しない
    let bizDateOfBirth = null;
    const [day, month, year] = this._originBizDateOfBirth.split('-');
    if (day && month && year) {
      bizDateOfBirth = new Date(Number(year), this._months[month], Number(day));
      if (isNaN(bizDateOfBirth.getTime())) {
        bizDateOfBirth = null;
      }
    }
    let birth = null;
    if (this._isAnaBizLogin && index === 0 && (payload.editArea === 0 || !payload.isEditMode)) {
      if (this._bizGivenName || this._bizFamilyName || this._bizEmail) {
        birth = bizDateOfBirth;
      }
    } else {
      birth = stringYMDToDate(traveler.dateOfBirth ?? '') ?? null;
    }

    let genderList = pd004.map((list) => {
      return { value: list.value, disp: list.display_content };
    });
    //　幼児の場合性別に、未選択、未公開を表示しない
    if (traveler.passengerTypeCode === PassengerType.INF) {
      genderList = genderList.filter((list) => list.value !== 'unspecified' && list.value !== 'unknown');
    }

    return {
      titleList: titleList,
      genderList: genderList,
      order: langCodeConvert?.traveler_input_order_type ?? '',
      passengerTypeCode: traveler.passengerTypeCode ?? '',
      selectDate: {
        order: langCodeConvert?.date_display_order ?? 'YMD',
        dateFrom: this.getDateFrom(traveler.passengerTypeCode ?? '', departureDate, isDomesticDcsFlight),
        dateTo: this.getDateTo(traveler.passengerTypeCode ?? '', departureDate, isDomesticDcsFlight, isDomestic),
        initialDate: birth
          ? {
              year: birth.getFullYear(),
              month: birth.getMonth() + 1,
              day: birth.getDate(),
            }
          : {},
        errorMsg: '',
      },
    };
  }

  /**
   * 搭乗者の生年月日のFromの範囲
   * @param code 搭乗者種別
   * @param departure　出発日
   * @param isDomesticDcsFlight 国内旅程DCS日付前か否か
   * @returns 搭乗者の生年月日のFrom
   */
  public getDateFrom(code: string, departure: Date, isDomesticDcsFlight: boolean) {
    const date = new Date(departure);
    switch (code) {
      case PassengerType.ADT:
        date.setFullYear(date.getFullYear() - 99);
        break;
      case PassengerType.B15:
        date.setFullYear(date.getFullYear() - 16);
        break;
      case PassengerType.CHD:
        if (isDomesticDcsFlight) {
          date.setFullYear(date.getFullYear() - 12);
        } else {
          date.setFullYear(date.getFullYear() - 12);
        }
        break;
      case PassengerType.INF:
        if (isDomesticDcsFlight) {
          date.setFullYear(date.getFullYear() - 3);
        } else {
          date.setFullYear(date.getFullYear() - 2);
        }
        break;
      default:
        date.setFullYear(1900);
        break;
    }
    date.setDate(date.getDate() + 1);
    return date;
  }

  /**
   * 搭乗者の生年月日のToの範囲
   * @param code 搭乗者種別
   * @param departure　出発日
   * @param isDomesticDcsFlight　国内旅程DCS日付前か否か
   * @param isDomestic 国内旅程か否か
   * @returns 搭乗者の生年月日のTo
   */
  public getDateTo(code: string, departure: Date, isDomesticDcsFlight: boolean, isDomestic: boolean) {
    const date = new Date(departure);
    switch (code) {
      case PassengerType.ADT:
        if (!isDomestic || isDomesticDcsFlight) {
          date.setFullYear(date.getFullYear() - 16);
        } else {
          // FY25 国内旅程　ヤングアダルト廃止対応
          date.setFullYear(date.getFullYear() - 12);
        }
        break;
      case PassengerType.B15:
        date.setFullYear(date.getFullYear() - 12);
        break;
      case PassengerType.CHD:
        if (isDomesticDcsFlight) {
          date.setFullYear(date.getFullYear() - 3);
        } else {
          date.setFullYear(date.getFullYear() - 2);
        }
        break;
      case PassengerType.INF:
        date.setDate(date.getDate() - 8);
        break;
      default:
        break;
    }
    return date;
  }
}
