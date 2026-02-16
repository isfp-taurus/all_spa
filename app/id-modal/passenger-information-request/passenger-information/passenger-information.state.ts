import {
  PassengerInformationRequestPassengerArrivalAndDepartureNoticeData,
  initialPassengerInformationRequestPassengerArrivalAndDepartureNoticeData,
  PassengerInformationRequestPassengerArrivalAndDepartureNoticeParts,
  initialPassengerInformationRequestPassengerArrivalAndDepartureNoticeParts,
} from './passenger-arrival-and-departure-notice/passenger-arrival-and-departure-notice.state';
import {
  PassengerInformationRequestPassengerBasicInformationData,
  initialPassengerInformationRequestPassengerBasicInformationData,
  PassengerInformationRequestPassengerBasicInformationParts,
  initialPassengerInformationRequestPassengerBasicInformationParts,
} from './passenger-basic-information/passenger-basic-information.state';
import {
  PassengerInformationRequestPassengerContactData,
  initialPassengerInformationRequestPassengerContactData,
  PassengerInformationRequestPassengerContactParts,
  initialPassengerInformationRequestPassengerContactParts,
} from './passenger-contact/passenger-contact.state';
import {
  initialPassengerDisabilityDiscountData,
  initialPassengerDisabilityDiscountParts,
  PassengerInformationRequestDisabilityDiscountData,
  PassengerInformationRequestDisabilityDiscountParts,
} from './passenger-disability-discount/passenger-disability-discount.state';
import {
  PassengerInformationRequestPassengerFFPData,
  initialPassengerInformationRequestPassengerFFPData,
  PassengerInformationRequestPassengerFFPParts,
  initialPassengerInformationRequestPassengerFFPParts,
} from './passenger-ffp/passenger-ffp.state';
import {
  PassengerInformationRequestPassengerCloseHeaderData,
  initialPassengerInformationRequestPassengerCloseHeaderData,
  PassengerInformationRequestPassengerCloseHeaderParts,
  initialPassengerInformationRequestPassengerCloseHeaderParts,
} from './passenger-header-close/passenger-header-close.state';
import {
  PassengerInformationRequestPassengerOpenHeaderData,
  initialPassengerInformationRequestPassengerOpenHeaderData,
  PassengerInformationRequestPassengerOpenHeaderParts,
  initialPassengerInformationRequestPassengerOpenHeaderParts,
} from './passenger-header-open/passenger-header-open.state';
import {
  initialPassengerInformationRequestIslandCardData,
  initialPassengerInformationRequestIslandCardParts,
  PassengerInformationRequestIslandCardData,
  PassengerInformationRequestIslandCardParts,
} from './passenger-island-card/passenger-island-card.state';
import {
  PassengerInformationRequestPassengerPassportData,
  initialPassengerInformationRequestPassengerPassportData,
  PassengerInformationRequestPassengerPassportParts,
  initialPassengerInformationRequestPassengerPassportParts,
} from './passenger-passport/passenger-passport.state';
import {
  PassengerInformationRequestPassengerSupportData,
  initialPassengerInformationRequestPassengerSupportData,
  PassengerInformationRequestPassengerSupportParts,
  initialPassengerInformationRequestPassengerSupportParts,
} from './passenger-support/passenger-support.state';

/**
 * 搭乗者情報ブロック データ
 * @param arrivalAndDepartureNotice 発着通知連絡先情報データ
 * @param basicInformation 搭乗者基本情報データ
 * @param contact 搭乗者連絡先情報データ
 * @param ffpData FFP情報データ
 * @param passport パスポート番号データ
 * @param closeHeader 搭乗者情報ヘッダクローズ データ
 * @param openHeader 搭乗者情報ヘッダオープン データ
 * @param support サポート情報 データ
 * @param disability 歩行障害 データ
 */
export interface PassengerInformationRequestPassengerInformationData {
  arrivalAndDepartureNotice: PassengerInformationRequestPassengerArrivalAndDepartureNoticeData;
  basicInformation: PassengerInformationRequestPassengerBasicInformationData;
  contact: PassengerInformationRequestPassengerContactData;
  ffpData: PassengerInformationRequestPassengerFFPData;
  passport: PassengerInformationRequestPassengerPassportData;
  closeHeader: PassengerInformationRequestPassengerCloseHeaderData;
  openHeader: PassengerInformationRequestPassengerOpenHeaderData;
  support: PassengerInformationRequestPassengerSupportData;
  disability: PassengerInformationRequestDisabilityDiscountData;
  island: PassengerInformationRequestIslandCardData;
  isError: boolean;
}
export function initialPassengerInformationRequestPassengerInformationData(): PassengerInformationRequestPassengerInformationData {
  const ret: PassengerInformationRequestPassengerInformationData = {
    isError: false,
    arrivalAndDepartureNotice: initialPassengerInformationRequestPassengerArrivalAndDepartureNoticeData(),
    basicInformation: initialPassengerInformationRequestPassengerBasicInformationData(),
    contact: initialPassengerInformationRequestPassengerContactData(),
    ffpData: initialPassengerInformationRequestPassengerFFPData(),
    passport: initialPassengerInformationRequestPassengerPassportData(),
    closeHeader: initialPassengerInformationRequestPassengerCloseHeaderData(),
    openHeader: initialPassengerInformationRequestPassengerOpenHeaderData(),
    support: initialPassengerInformationRequestPassengerSupportData(),
    disability: initialPassengerDisabilityDiscountData(),
    island: initialPassengerInformationRequestIslandCardData(),
  };
  return ret;
}
/**
 * 搭乗者情報ブロック 入力パーツ
 * @param id 入力完了操作エリア表示フラグ
 * @param isOpen エリアの開閉状態
 * @param isEnableComplete 入力完了操作エリア表示フラグ
 * @param isNotInf 子供以上フラグ
 * @param isAdditionalInfo 追加情報
 * @param isExistsTravelSkyHostedAirline パスポート表示フラグ
 * @param isDepartureArrivalNotificationEligible 発着通知連絡先情報表示フラグ
 * @param isDisability　障碍者種別表示フラグ
 * @param isIsland 離島カード情報表示フラグ
 * @param isTravelerSupportsEligible サポート情報表示フラグ
 * @param nextAction  次のアクションに表示する文言
 * @param nextButtonLabel 次へボタンのラベル
 * @param registrarionLabel 登録状況ラベル
 * @param isCloseEnable 閉じるボタン有効フラグ
 * @param arrivalAndDepartureNotice 発着通知連絡先情報　設定値
 * @param basicInformation 搭乗者基本情報　設定値
 * @param contact 搭乗者連絡先情報　設定値
 * @param ffpData FFP情報　設定値
 * @param passport パスポート番号　設定値
 * @param closeHeader 搭乗者情報ヘッダクローズ　設定値
 * @param openHeader 搭乗者情報ヘッダオープン　設定値
 * @param support サポート情報 設定値
 * @param disability 歩行障害 設定値
 */
export interface PassengerInformationRequestPassengerInformationParts {
  id: string;
  isOpen: boolean;
  isEnableComplete: boolean;
  isNotInf: boolean;
  isAdditionalInfo: boolean;
  isExistsTravelSkyHostedAirline: boolean;
  isDepartureArrivalNotificationEligible: boolean;
  isDisability: boolean;
  isIsland: boolean;
  isTravelerSupportsEligible: boolean;
  nextAction: string;
  nextButtonLabel: string;
  registrarionLabel: string;
  isCloseEnable: boolean;
  arrivalAndDepartureNotice: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParts;
  basicInformation: PassengerInformationRequestPassengerBasicInformationParts;
  contact: PassengerInformationRequestPassengerContactParts;
  ffpData: PassengerInformationRequestPassengerFFPParts;
  passport: PassengerInformationRequestPassengerPassportParts;
  closeHeader: PassengerInformationRequestPassengerCloseHeaderParts;
  openHeader: PassengerInformationRequestPassengerOpenHeaderParts;
  support: PassengerInformationRequestPassengerSupportParts;
  disability: PassengerInformationRequestDisabilityDiscountParts;
  island: PassengerInformationRequestIslandCardParts;
}
export function initialPassengerInformationRequestPassengerInformationParts(): PassengerInformationRequestPassengerInformationParts {
  const ret: PassengerInformationRequestPassengerInformationParts = {
    id: '',
    isOpen: false,
    isEnableComplete: false,
    isNotInf: false,
    isAdditionalInfo: false,
    isExistsTravelSkyHostedAirline: false,
    isDepartureArrivalNotificationEligible: false,
    isDisability: false,
    isIsland: false,
    isTravelerSupportsEligible: false,
    nextAction: '',
    nextButtonLabel: '',
    registrarionLabel: '',
    isCloseEnable: false,
    arrivalAndDepartureNotice: initialPassengerInformationRequestPassengerArrivalAndDepartureNoticeParts(),
    basicInformation: initialPassengerInformationRequestPassengerBasicInformationParts(),
    contact: initialPassengerInformationRequestPassengerContactParts(),
    ffpData: initialPassengerInformationRequestPassengerFFPParts(),
    passport: initialPassengerInformationRequestPassengerPassportParts(),
    closeHeader: initialPassengerInformationRequestPassengerCloseHeaderParts(),
    openHeader: initialPassengerInformationRequestPassengerOpenHeaderParts(),
    support: initialPassengerInformationRequestPassengerSupportParts(),
    disability: initialPassengerDisabilityDiscountParts(),
    island: initialPassengerInformationRequestIslandCardParts(),
  };
  return ret;
}
