import { Injectable } from '@angular/core';
import { isStringEmpty } from '@common/helper';
import {
  CountryCodeNameType,
  MCountry,
  PassengerMailDestinationType,
  PassengerPhoneDestinationType,
  PassengerSecondContactType,
  RamlContactsTraveler,
} from '@common/interfaces';
import { SupportClass } from '@lib/components/support-class';
import { MOffice } from '@lib/interfaces';
import { CommonLibService } from '@lib/services';
import { Traveler } from 'src/sdk-reservation';
import {
  PassengerInformationRequestPassengerContactData,
  PassengerInformationRequestPassengerContactParts,
} from './passenger-contact.state';
/**
 * 搭乗者連絡先情報 service
 */
@Injectable()
export class PassengerInformationRequestPassengerContactService extends SupportClass {
  constructor(private _common: CommonLibService) {
    super();
  }

  destroy() {}

  /**
   * 搭乗者連絡先情報 初期値作成
   * @param traveler 搭乗者情報
   * @param country 国リスト
   * @param isEnableRrepresentative
   * @param isEnableRepresentativeMail
   * @param isFirstTraveler 最初の搭乗者フラグ
   * @param isNhAndArriveUsa 旅程にNHグループ運航を含む、かつ到着国がアメリカの便が存在する場合
   * @param firstTravelerSecondContactNumber 1人目の第2連絡先
   * @param contactsTraveler 搭乗者連絡先情報
   * @returns 搭乗者連絡先情報 初期値
   */
  createData(
    traveler: Traveler,
    country: Array<MCountry>,
    isEnableRrepresentative: boolean,
    isEnableRepresentativeMail: boolean,
    isFirstTraveler: boolean,
    isNhAndArriveUsa: boolean,
    firstTravelerSecondContactNumber: string,
    contactsTraveler?: RamlContactsTraveler,
    office?: MOffice
  ): PassengerInformationRequestPassengerContactData {
    // 搭乗者電話番号
    const phoneNumber = contactsTraveler?.phones?.[0]?.number ?? '';
    const firstName = traveler.names?.[0]?.firstName ?? '';
    const passengerSMSDestination = this.getPassengerSMSDestination(
      firstName,
      phoneNumber,
      !!contactsTraveler?.phones?.[0]?.isSameAsRepresentative,
      isEnableRrepresentative,
      isNhAndArriveUsa,
      office
    );
    const passengerSMSCountryNumber = this.getPhoneExtention(
      contactsTraveler?.phones?.[0]?.countryPhoneExtension ?? ''
    );

    //第2連絡先情報
    const secondPhoneNumber = contactsTraveler?.secondContact?.[0]?.phones?.number ?? '';
    const secondPhoneSDestination = this.getSecondDestination(
      firstName,
      secondPhoneNumber,
      firstTravelerSecondContactNumber,
      isFirstTraveler
    );
    const secondPhoneCountryNumber = this.getPhoneExtention(
      contactsTraveler?.secondContact?.[0]?.phones?.countryPhoneExtension ?? ''
    );

    const passengerSMSCountry =
      country.find(
        (cou) =>
          !isStringEmpty(cou.international_tel_country_code) &&
          cou.international_tel_country_code === passengerSMSCountryNumber
      )?.country_2letter_code ?? '';
    const passengerSecondContactCountry =
      country.find((cou) => cou.international_tel_country_code === secondPhoneCountryNumber)?.country_2letter_code ??
      '';
    return {
      passengerMailDestination: this.getPassengerMailDestination(
        firstName,
        contactsTraveler?.emails?.[0]?.isSameAsRepresentative === true,
        isEnableRepresentativeMail
      ),
      passengerMailAddress: contactsTraveler?.emails?.[0]?.address ?? '',
      passengerMailAddressConfirm: contactsTraveler?.emails?.[0]?.address ?? '',
      passengerSMSDestination: passengerSMSDestination,
      passengerSMSCountry: passengerSMSCountry,
      passengerSMSCountryNumber: !isStringEmpty(passengerSMSCountry) ? passengerSMSCountryNumber : '',
      passengerSMSNumber: phoneNumber,
      passengerSecondContactDestination: secondPhoneSDestination,
      passengerSecondContactCountry: passengerSecondContactCountry,
      passengerSecondContactCountryNumber: !isStringEmpty(passengerSecondContactCountry)
        ? secondPhoneCountryNumber
        : '',
      passengerSecondContactNumber: secondPhoneNumber,
      passengerSecondContactOwnerOfPhone: contactsTraveler?.secondContact?.[0]?.ownerOfPhone ?? '',
      isError: false,
    };
  }

  /**
   * 搭乗者連絡先情報 設定値作成
   * @param isNhGroupOperated  NHグループ運航便かどうか
   * @param isEnableRrepresentative SMS代表者と同じを選択可にするか
   * @param country 国リスト
   * @param phoneCountry 国コード名称マップ
   * @param phoneCountrySecondContact 第2連絡先用　国コード名称マップ
   * @param isNhAndArriveUsa 旅程にNHグループ運航を含む、かつ到着国がアメリカの便が存在する場合
   * @returns 搭乗者連絡先情報 設定値
   */
  createParts(
    isNhGroupOperated: boolean,
    isEnableRrepresentative: boolean,
    isEnableRepresentativeMail: boolean,
    isFirstTraveler: boolean,
    country: Array<MCountry>,
    phoneCountry: Array<CountryCodeNameType>,
    phoneCountrySecondContact: Array<CountryCodeNameType>,
    isNhAndArriveUsa: boolean
  ): PassengerInformationRequestPassengerContactParts {
    return {
      isMailDestinationSpecial: true,
      isEnableRrepresentative: isEnableRrepresentative,
      isEnableRepresentativeMail: isEnableRepresentativeMail,
      isDisplayPassengerSMSDestination: true,
      isFirst: isFirstTraveler,
      isNhAndArriveUsa: isNhAndArriveUsa,
      country: country,
      phoneCountrySecondContact: phoneCountrySecondContact,
      phoneCountry: phoneCountry,
    };
  }

  /**
   * メール送信先の判定
   * @param firstName 搭乗者の名
   * @param isSameAsRepresentative 搭乗者の代表者と同じフラグ
   * @param isEnableRepresentativeMail 搭乗者Mailの代表者と同じフラグ
   * @returns メール送信先
   */
  getPassengerMailDestination(firstName: string, isSameAsRepresentative: boolean, isEnableRepresentativeMail: boolean) {
    if (!isEnableRepresentativeMail) {
      return PassengerMailDestinationType.INDIVIDUAL;
    }
    if (isStringEmpty(firstName)) {
      return PassengerMailDestinationType.REPRESENTATIVE;
    }
    return isSameAsRepresentative
      ? PassengerMailDestinationType.REPRESENTATIVE
      : PassengerMailDestinationType.INDIVIDUAL;
  }

  /**
   * SMS送信先の判定
   * @param firstName 搭乗者の名
   * @param phoneNumber 搭乗者の電話番号
   * @param isSameAsRepresentative 搭乗者の代表者と同じフラグ
   * @param isEnableRrepresentative SMS代表者と同じを選択可にするか
   * @param isNhAndArriveUsa 旅程にNHグループ運航を含む、かつ到着国がアメリカの便が存在する場合
   * @returns SMS送信先
   */
  getPassengerSMSDestination(
    firstName: string,
    phoneNumber: string,
    isSameAsRepresentative: boolean,
    isEnableRrepresentative: boolean,
    isNhAndArriveUsa: boolean,
    office?: MOffice
  ) {
    if (!isStringEmpty(firstName)) {
      if (!isStringEmpty(phoneNumber)) {
        return isSameAsRepresentative && isEnableRrepresentative
          ? PassengerPhoneDestinationType.REPRESENTATIVE
          : PassengerPhoneDestinationType.INDIVIDUAL;
      }
      return isNhAndArriveUsa ? PassengerPhoneDestinationType.INDIVIDUAL : PassengerPhoneDestinationType.NOT_SEND;
    }
    //姓名登録済みの場合
    if (isNhAndArriveUsa || office?.sms_send_select_initial) {
      return isEnableRrepresentative
        ? PassengerPhoneDestinationType.REPRESENTATIVE
        : PassengerPhoneDestinationType.INDIVIDUAL;
    }
    return PassengerPhoneDestinationType.NOT_SEND;
  }

  /**
   * 第2連絡先の判定
   * @param firstName 搭乗者の名
   * @param phoneNumber 第2連絡先の電話番号
   * @param firstTravelerSecondContactNumber 1人目の第2連絡先
   * @param isFirst 最初の搭乗者かどうか
   * @returns 第2連絡先
   */
  getSecondDestination(
    firstName: string,
    phoneNumber: string,
    firstTravelerSecondContactNumber: string,
    isFirst: boolean
  ) {
    if (!isStringEmpty(firstName)) {
      if (isFirst) {
        if (isStringEmpty(phoneNumber)) {
          return PassengerSecondContactType.AFTER_REGISTER;
        } else {
          return PassengerSecondContactType.INDIVIDUAL;
        }
      } else {
        if (phoneNumber === firstTravelerSecondContactNumber) {
          return PassengerSecondContactType.FIRST_TRAVELER;
        } else if (isStringEmpty(phoneNumber)) {
          return PassengerSecondContactType.AFTER_REGISTER;
        }
        return PassengerSecondContactType.INDIVIDUAL;
      }
    } else {
      if (isFirst) {
        return PassengerSecondContactType.INDIVIDUAL;
      }
      return PassengerSecondContactType.FIRST_TRAVELER;
    }
  }

  /**
   * 国電話番号の取得　空かつ日本オフィスなら日本のコードを返す
   * @param phoneExtention 国電話番号
   * @returns 国電話番号
   */
  getPhoneExtention(phoneExtention: string) {
    if (isStringEmpty(phoneExtention) && this._common.isJapaneseOffice()) {
      return '81';
    }
    return phoneExtention;
  }
}
