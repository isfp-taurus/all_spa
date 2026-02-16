import { Injectable } from '@angular/core';
import { isEmptyObject, isStringEmpty } from '@common/helper';
import {
  MAirport,
  MCountry,
  MLangCodeConvert,
  PassengerInformationRequestMastarData,
  PassengerType,
  PhoneNumberType,
  RamlContactsRepresentative,
  RamlContactsTraveler,
  RamlFrequentFlyerCards,
  RegistrationLabelType,
} from '@common/interfaces';
import { GetCartState } from '@common/store';
import { SupportClass } from '@lib/components/support-class';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService } from '@lib/services';
import { Bound, CreateCartResponseDataPlanTravelerSupportsTraveler, Traveler } from 'src/sdk-reservation';
import { PassengerInformationRequestPayload } from '../passenger-information-request.payload.state';
import { PassengerInformationRequestPassengerArrivalAndDepartureNoticeService } from './passenger-arrival-and-departure-notice/passenger-arrival-and-departure-notice.service';
import { PassengerInformationRequestPassengerBasicInformationService } from './passenger-basic-information/passenger-basic-information.service';
import { PassengerInformationRequestPassengerContactService } from './passenger-contact/passenger-contact.service';
import { PassengerInformationRequestDisabilityDiscountService } from './passenger-disability-discount/passenger-disability-discount.service';
import { PassengerInformationRequestPassengerFFPService } from './passenger-ffp/passenger-ffp.service';
import { PassengerInformationRequestPassengerCloseHeaderService } from './passenger-header-close/passenger-header-close.service';
import { PassengerInformationRequestPassengerOpenHeaderService } from './passenger-header-open/passenger-header-open.service';
import {
  PassengerInformationRequestPassengerInformationData,
  PassengerInformationRequestPassengerInformationParts,
} from './passenger-information.state';
import { PassengerInformationRequestIslandCardService } from './passenger-island-card/passenger-island-card.service';
import { PassengerInformationRequestPassengerPassportService } from './passenger-passport/passenger-passport.service';
import { PassengerInformationRequestPassengerSupportService } from './passenger-support/passenger-support.service';
import { AnaBizLoginStatusType, LoginStatusType } from '@lib/interfaces';
/**
 * 搭乗者情報ブロック service
 */
@Injectable()
export class PassengerInformationRequestPassengerInfoService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _staticMsg: StaticMsgPipe,
    private _arrivalAndDepartureNotice: PassengerInformationRequestPassengerArrivalAndDepartureNoticeService,
    private _basicInfo: PassengerInformationRequestPassengerBasicInformationService,
    private _contact: PassengerInformationRequestPassengerContactService,
    private _ffp: PassengerInformationRequestPassengerFFPService,
    private _passport: PassengerInformationRequestPassengerPassportService,
    private _closeHeader: PassengerInformationRequestPassengerCloseHeaderService,
    private _openHeader: PassengerInformationRequestPassengerOpenHeaderService,
    private _support: PassengerInformationRequestPassengerSupportService,
    private _disability: PassengerInformationRequestDisabilityDiscountService,
    private _island: PassengerInformationRequestIslandCardService
  ) {
    super();
  }

  destroy() {}

  /**
   * 搭乗者情報ブロック 初期値作成
   * @param res カートAPIレスポンス
   * @param traveler 搭乗者情報
   * @param index 搭乗者のインデックス
   * @param master 搭乗者情報入力　キャッシュマスターデータ
   * @param payload 搭乗者情報入力　ペイロードデータ
   * @returns 搭乗者情報ブロック 初期値
   */
  createData(
    res: GetCartState,
    traveler: Traveler,
    index: number,
    master: PassengerInformationRequestMastarData,
    payload: PassengerInformationRequestPayload
  ): PassengerInformationRequestPassengerInformationData {
    //代表者の連絡先情報
    const representative: RamlContactsRepresentative | undefined = res.data?.plan?.contacts?.representative as
      | RamlContactsRepresentative
      | undefined;
    //代表者と同じの選択可否
    const isEnableRrepresentative = this.getIsEnableRrepresentative(representative, master.country);
    const isEnableRepresentativeMail = !isStringEmpty(representative?.emails?.[0]?.address);
    //搭乗者の連絡先情報
    const contactsTraveler: RamlContactsTraveler | undefined = res.data?.plan?.contacts?.[traveler.id ?? ''] as
      | RamlContactsTraveler
      | undefined;
    //搭乗者FFP情報
    //法人ログイン時の搭乗者会員番号には企業情報の設定値を初期設定する
    //搭乗者会員番号は企業情報に姓名・メールアドレスが未設定なら設定しない
    let frequentFlyerCard: RamlFrequentFlyerCards | undefined = undefined;
    const isAnaBizLogin =
      this._common.aswContextStoreService.aswContextData.anaBizLoginStatus === AnaBizLoginStatusType.LOGIN;
    const bizGivenName = this._common.anaBizContextStoreService.anaBizContextData.allBizContext?.givenName;
    const bizFamilyName = this._common.anaBizContextStoreService.anaBizContextData.allBizContext?.familyName;
    const bizEmail = this._common.anaBizContextStoreService.anaBizContextData.allBizContext?.emailAddress;
    const bizPassengerMembershipNumber = String(
      this._common.anaBizContextStoreService.anaBizContextData.allBizContext?.passengerMembershipNumber ?? ''
    );
    const originFrequentFlyerCards = (res.data?.plan?.frequentFlyerCards ?? ({} as any))?.[traveler.id ?? '']?.fqtv;
    const bizFrequentFlyerCards = {
      ...originFrequentFlyerCards,
      cardNumber: bizPassengerMembershipNumber,
    };
    if (isAnaBizLogin && index === 0 && (payload.editArea === 0 || !payload.isEditMode)) {
      if (bizGivenName || bizFamilyName || bizEmail) {
        frequentFlyerCard = bizFrequentFlyerCards as RamlFrequentFlyerCards | undefined;
      }
    } else {
      frequentFlyerCard = originFrequentFlyerCards as RamlFrequentFlyerCards | undefined;
    }
    //搭乗者サポート情報
    const support: CreateCartResponseDataPlanTravelerSupportsTraveler | undefined =
      res.data?.plan?.travelerSupports?.[traveler.id ?? ''];
    //オフィス
    const office = master.office.find(
      (off) => off.office_code === this._common.aswContextStoreService.aswContextData.pointOfSaleId
    );
    //FY25 第2連絡先
    const contactsFirstTraveler: RamlContactsTraveler | undefined = res.data?.plan?.contacts?.[
      res.data?.plan?.travelers?.[0]?.id ?? ''
    ] as RamlContactsTraveler | undefined;

    return {
      isError: false,
      arrivalAndDepartureNotice: this._arrivalAndDepartureNotice.createData(contactsTraveler),
      basicInformation: this._basicInfo.createData(traveler, payload, index),
      contact: this._contact.createData(
        traveler,
        master.country,
        isEnableRrepresentative,
        isEnableRepresentativeMail,
        index === 0,
        this.getIsNhAndArriveUsa(res.data?.plan?.airOffer?.bounds ?? [], master.airport),
        contactsFirstTraveler?.secondContact?.[0]?.phones?.number ?? '',
        contactsTraveler,
        office
      ),
      ffpData: this._ffp.createData(frequentFlyerCard),
      passport: this._passport.createData(traveler),
      closeHeader: this._closeHeader.createData(),
      openHeader: this._openHeader.createData(),
      support: this._support.createData(master.pd006, master.pd020, master.pd960, support),
      disability: this._disability.createData(traveler),
      island: this._island.createData(traveler),
    };
  }

  /**
   * 搭乗者情報ブロック 設定値の作成
   * @param res カートAPIレスポンス
   * @param traveler 搭乗者情報
   * @param master 搭乗者情報入力　キャッシュマスターデータ
   * @param index 搭乗者のインデックス
   * @param payload 搭乗者情報入力ペイロード
   * @param isLast 最後の搭乗者か否か
   * @returns 搭乗者情報ブロック 設定値
   */
  createParts(
    res: GetCartState,
    traveler: Traveler,
    master: PassengerInformationRequestMastarData,
    index: number,
    payload: PassengerInformationRequestPayload,
    isLast: boolean
  ): PassengerInformationRequestPassengerInformationParts {
    const contactsTraveler: RamlContactsTraveler | undefined = res.data?.plan?.contacts?.[traveler.id ?? ''] as
      | RamlContactsTraveler
      | undefined;
    //現在のオフィス
    const office = master.office.find(
      (off) => off.office_code === this._common.aswContextStoreService.aswContextData.pointOfSaleId
    );
    //現在の言語の言語変換マスタ
    const langCodeConvert: MLangCodeConvert | undefined = master.langCodeConvert.find(
      (langcon) => langcon.lang === this._common.aswContextStoreService.aswContextData.lang
    );
    //出発時刻
    const deperture = new Date(res.data?.plan?.airOffer?.bounds?.[0]?.originDepartureDateTime ?? '');
    //ANAトラベルスカイラインがあるかどうか
    const existsTravelSkyHostedAirline = res.data?.plan?.airOffer?.existsTravelSkyHostedAirline ?? false;
    // 登録状況
    let isRegistered: boolean = this.isRegistered(existsTravelSkyHostedAirline, traveler, contactsTraveler);
    //次のアクションに表示する内容
    let nextAction = this.getNextAction(
      traveler,
      index,
      isLast,
      res.data?.plan?.airOffer?.tripType ?? '',
      res.data?.plan?.travelers ?? []
    );
    let nextActionLabel = this.getNextActionLabel(isLast, res.data?.plan?.airOffer?.tripType ?? '');
    // 登録状況ラベル
    const registerLabel = this.getRepresentativeRegistrarion(payload.isEditMode, payload.editArea, isRegistered, index);
    // NH運行分が含まれるか
    const isNhGroupOperated =
      res.data?.plan?.airOffer?.bounds?.some((bound) => bound.flights?.some((flight) => flight.isNhGroupOperated)) ??
      false;
    // INFかどうか
    const isNotInf = this.getIsAdditionalInfo(traveler.passengerTypeCode ?? '');
    // 障がい者運賃かどうか
    const isDepartureArrivalNotificationEligible =
      res.data?.plan?.cartEligibilities?.isDepartureArrivalNotificationEligible ?? false;
    // サポート情報を表示するか否か
    const isTravelerSupportsEligible = res.data?.plan?.cartEligibilities?.isTravelerSupportsEligible ?? false;
    //　代表者連絡先
    const representative: RamlContactsRepresentative | undefined = res.data?.plan?.contacts?.representative as
      | RamlContactsRepresentative
      | undefined;
    //代表者と同じを選択可能にするか否か
    const isEnableRrepresentative = this.getIsEnableRrepresentative(representative, master.country);
    const isEnableRepresentativeMail = !isStringEmpty(representative?.emails?.[0]?.address);
    //国内DCS日付判定
    const isDomestic = res.data?.plan?.airOffer?.tripType === 'domestic';
    const domesticDcs = master.property?.migration?.['uiuxs2.transitionDate.domesticDcs']?.[0]?.value ?? '';
    const isDomesticDcsFlight = this.isDomesticDcsFlight(deperture, isDomestic, domesticDcs);

    return {
      id: traveler.id ?? '',
      isOpen: payload.isEditMode && payload.editArea === index,
      isEnableComplete: false,
      isNotInf: isNotInf,
      isAdditionalInfo: isNotInf && (isDepartureArrivalNotificationEligible || isTravelerSupportsEligible),
      isExistsTravelSkyHostedAirline: existsTravelSkyHostedAirline,
      isDepartureArrivalNotificationEligible: isDepartureArrivalNotificationEligible,
      isDisability: isNotInf && this.isExistfareType(res, 'disabilityDiscount'),
      isIsland: isNotInf && this.isExistfareType(res, 'islandTicket'),
      isTravelerSupportsEligible: isTravelerSupportsEligible,
      nextAction: nextAction,
      nextButtonLabel: nextActionLabel,
      registrarionLabel: registerLabel,
      isCloseEnable: isRegistered,
      arrivalAndDepartureNotice: this._arrivalAndDepartureNotice.createParts(
        master.pd065,
        isDomestic,
        contactsTraveler
      ),
      basicInformation: this._basicInfo.createParts(
        traveler,
        deperture,
        isDomestic,
        isDomesticDcsFlight,
        master.pd004,
        payload,
        index,
        langCodeConvert,
        office
      ),
      contact: this._contact.createParts(
        isNhGroupOperated,
        isEnableRrepresentative,
        isEnableRepresentativeMail,
        index === 0,
        master.country,
        master.phoneCountrySms,
        master.phoneCountry,
        this.getIsNhAndArriveUsa(res.data?.plan?.airOffer?.bounds ?? [], master.airport)
      ),
      ffpData: this._ffp.createParts(master.mileage),
      passport: this._passport.createParts(),
      closeHeader: this._closeHeader.createParts(traveler, index, registerLabel, isDomesticDcsFlight),
      openHeader: this._openHeader.createParts(traveler, index, registerLabel, isDomesticDcsFlight),
      support: this._support.createParts(master.pd006, master.pd020, master.pd960),
      disability: this._disability.createParts(traveler.id ?? '', res.data?.plan?.travelers ?? []),
      island: this._island.createParts(),
    };
  }

  /**
   * 登録状況の取得
   * @param isEditMode 編集中か否か（前画面情報）
   * @param editArea 編集中エリア
   * @param isRegistered 登録済みか否か
   * @param index 搭乗者の番号（何番目か）
   * @returns 登録状況ラベル
   */
  getRepresentativeRegistrarion(isEditMode: boolean, editArea: number, isRegistered: boolean, index: number) {
    if (isEditMode && editArea === index) {
      return RegistrationLabelType.EDITTING;
    } else if (isRegistered) {
      return RegistrationLabelType.REGISTERED;
    }
    return RegistrationLabelType.NOT_REGISTERED;
  }

  /**
   * 追加情報を入力可能にするかどうか
   * @param code
   * @returns 追加情報を入力可能フラグ
   */
  getIsAdditionalInfo(code: string): boolean {
    // 搭乗者種別
    switch (code) {
      case PassengerType.ADT:
      case PassengerType.B15:
      case PassengerType.CHD:
        return true;
    }
    return false;
  }

  /**
   * 次のアクションの表示を取得
   * @param traveler 搭乗者情報
   * @param index 搭乗者のインデックス
   * @param isLast 最後の搭乗者か否か
   * @param tripType 旅程タイプ
   * @param travelerList 搭乗者情報リスト
   * @return 次のアクションの表示
   */
  getNextAction(traveler: Traveler, index: number, isLast: boolean, tripType: string, travelerList: Array<Traveler>) {
    let nextAction = `${this._staticMsg.transform('label.nextEdit')} `;
    if (isLast) {
      return this._staticMsg.transform('label.nextEdit') + ' ' + this._staticMsg.transform('label.contineToAsr');
    }
    if (!isStringEmpty(travelerList?.[index + 1]?.names?.[0]?.firstName)) {
      const firstName = travelerList[index + 1].names?.[0]?.firstName ?? '';
      const middleName = travelerList[index + 1].names?.[0]?.middleName ?? '';
      const lastName = travelerList[index + 1].names?.[0]?.lastName ?? '';
      return `${nextAction}${firstName}${middleName} ${lastName}`;
    }
    return `${nextAction}${this._staticMsg.transform('label.passenger.n', { '0': index + 2 })}`;
  }

  /**
   * 次のアクションボタンの表示を取得
   * @param index 搭乗者のインデックス
   * @param isLast 最後の搭乗者か否か
   * @param tripType 旅程タイプ
   * @return 次のアクションの表示
   */
  getNextActionLabel(isLast: boolean, tripType: string) {
    if (isLast && tripType === 'domestic' && this._common.isJapaneseOffice()) {
      return 'label.continue1';
    }
    return 'label.proceed';
  }

  /**
   * 旅程にNHグループ運航、かつ到着国がアメリカの便が存在する場合
   * @param bounds 全バウンド
   * @returns 判定値
   */
  getIsNhAndArriveUsa(bounds: Array<Bound>, airportMaster: Array<MAirport>) {
    //追加分計ドロップアウト対応
    return bounds.some((bound) =>
      bound.flights?.some((flight) => {
        const air = airportMaster.find((airport) => airport.airport_code === flight.arrival?.locationCode);
        return flight.isNhGroupOperated && air?.country_2letter_code === 'US';
      })
    );
  }
  /**
   * 代表者と同じを選択可能か否か
   * @param representative 代表者連絡先情報
   * @param mCountryList 国マスタ
   * @return 判定値
   */
  getIsEnableRrepresentative(representative?: RamlContactsRepresentative, mCountryList?: Array<MCountry>) {
    const representativePhoneType = representative?.phones?.[0]?.type ?? PhoneNumberType.MOBILE;
    let representativeCountryCode = representative?.phones?.[0]?.countryPhoneExtension ?? '';
    if (isStringEmpty(representativeCountryCode) && this._common.isJapaneseOffice()) {
      representativeCountryCode = '81';
    }
    let representativeCountry = mCountryList?.find(
      (count) => count.international_tel_country_code === representativeCountryCode
    );
    return representativePhoneType === PhoneNumberType.MOBILE && !!representativeCountry?.sms_send_flag;
  }

  /**
   * 国内旅程かつDCS日付前化の判定
   * @param departure 出発日
   * @param isDomestic 国内旅程
   * @param domesticDcs DCS　以降日付
   * @returns 判定結果
   */
  isDomesticDcsFlight(departure: Date, isDomestic: boolean, domesticDcs?: string) {
    let isBeforeDcs = true;
    const domesticDcsDate = domesticDcs ? new Date(domesticDcs) : null;
    if (domesticDcsDate && !Number.isNaN(domesticDcsDate.getTime()) && !Number.isNaN(departure.getTime())) {
      isBeforeDcs = departure.getTime() < domesticDcsDate.getTime();
    }
    return isDomestic && isBeforeDcs;
  }

  /**
   * 運賃種別に指定の運賃が1つでも存在するかチェックする
   * @param res カート取得レスポンス
   * @param fareType 運賃種別
   * @returns 判定結果
   */
  isExistfareType(res: GetCartState, fareType: string): boolean {
    return (
      res.data?.plan?.airOffer?.bounds?.some((bound) =>
        bound.flights?.some((flight) => flight.fareInfos?.fareType === fareType)
      ) ?? false
    );
  }

  /**
   * 搭乗者が登録済みかどうか
   * @param existsTravelSkyHostedAirline ANAトラベルスカイラインが含まれるかどうか
   * @param traveler 搭乗者情報
   * @param contactsTraveler 搭乗者連絡先情報
   * @returns 判定結果
   */
  isRegistered(
    existsTravelSkyHostedAirline: boolean,
    traveler: Traveler,
    contactsTraveler: RamlContactsTraveler | undefined
  ): boolean {
    if (!existsTravelSkyHostedAirline || !isStringEmpty(traveler.regulatoryDetails?.passports?.[0]?.number)) {
      //ANAトラベルスカイラインが含まれない(パスポートが未表示)、またはパスポートが登録済み
      if (traveler.passengerTypeCode === PassengerType.INF || traveler.passengerTypeCode === PassengerType.INS) {
        // 幼児の場合搭乗者姓名が登録されていれば登録済み
        if (!isStringEmpty(traveler.names?.[0]?.firstName)) {
          return true;
        }
      } else if (!isStringEmpty(contactsTraveler?.emails?.[0]?.address)) {
        // 幼児以外はメールアドレスが登録されていれば登録済み
        return true;
      }
    }
    return false;
  }
}
