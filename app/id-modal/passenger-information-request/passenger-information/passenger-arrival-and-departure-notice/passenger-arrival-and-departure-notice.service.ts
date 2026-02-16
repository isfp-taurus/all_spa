import { Injectable } from '@angular/core';
import { MListData, RamlContactsTraveler } from '@common/interfaces';
import { SupportClass } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import {
  PassengerInformationRequestPassengerArrivalAndDepartureNoticeData,
  PassengerInformationRequestPassengerArrivalAndDepartureNoticeParts,
} from './passenger-arrival-and-departure-notice.state';
/**
 * 発着通知連絡先情報 service
 */
@Injectable()
export class PassengerInformationRequestPassengerArrivalAndDepartureNoticeService extends SupportClass {
  constructor(private _common: CommonLibService) {
    super();
  }

  destroy() {}

  /**
   * 発着通知連絡先情報　初期値作成
   * @param contacts カート取得情報　搭乗者ごとの連絡先
   * @returns 発着通知連絡先情報　初期値
   */
  createData(
    contactsTraveler?: RamlContactsTraveler
  ): PassengerInformationRequestPassengerArrivalAndDepartureNoticeData {
    return {
      mailRecipientName: contactsTraveler?.departureArrivalNotifications?.[0]?.emails?.recipient ?? '',
      mailAddress: contactsTraveler?.departureArrivalNotifications?.[0]?.emails?.address ?? '',
      confirmMailAddress: contactsTraveler?.departureArrivalNotifications?.[0]?.emails?.address ?? '',
      mailLang: contactsTraveler?.departureArrivalNotifications?.[0]?.emails?.lang ?? '',
      mailRecipientName2: contactsTraveler?.departureArrivalNotifications?.[1]?.emails?.recipient ?? '',
      mailAddress2: contactsTraveler?.departureArrivalNotifications?.[1]?.emails?.address ?? '',
      confirmMailAddress2: contactsTraveler?.departureArrivalNotifications?.[1]?.emails?.address ?? '',
      mailLang2: contactsTraveler?.departureArrivalNotifications?.[1]?.emails?.lang ?? '',
      isError: false,
    };
  }

  /**
   * 発着通知連絡先情報　設定値作成
   * @param pd065 リストデータPD_065 言語名
   * @param isDomestic 国内旅程か否か
   * @param contactsTraveler
   * @returns 発着通知連絡先情報　設定値
   */
  createParts(
    pd065: Array<MListData>,
    isDomestic: boolean,
    contactsTraveler?: RamlContactsTraveler
  ): PassengerInformationRequestPassengerArrivalAndDepartureNoticeParts {
    return {
      isOpen: contactsTraveler?.departureArrivalNotifications?.[0]?.isRegisteredEmail ?? false,
      isLang: !this._common.isJapaneseOffice() || !isDomestic,
      langList: pd065,
    };
  }

  //　言語がリストにあるか判定
  checkLang(lang: string, langList: Array<MListData>) {
    return langList.some((list) => list.value === lang);
  }
}
