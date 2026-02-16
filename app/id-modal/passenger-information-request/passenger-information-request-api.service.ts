import { Injectable } from '@angular/core';
import {
  apiEventAll,
  defaultApiErrorEvent,
  isEmptyObject,
  isStringEmpty,
  numberZeroUndefined,
  stringEmptyUndefined,
  wheelchairBatteryApi,
} from '@common/helper';
import {
  CartsUpdateTravelersRequestContactsDepartuteArrivalNotifications,
  CartsUpdateTravelersRequestContactsSecondContact,
  CartsUpdateTravelersRequestFrequentFlyerCards,
  CartsUpdateTravelersRequestSupports,
  CartsUpdateTravelersRequestSupportsPregnant,
  CartsUpdateTravelersRequestSupportsWalking,
  CartsUpdateTravelersRequestTravelerDisAbility,
  CartsUpdateTravelersRequestTravelerIslandCard,
  CartsUpdateTravelersRequestTravelersRequestParam,
  DisabilityType,
  PassengerMailDestinationType,
  PassengerPhoneDestinationType,
  PassengerSecondContactType,
  PassengerType,
  RegistrationLabelType,
} from '@common/interfaces';
import { GetCartStoreService, UpdateTravelersInformationStoreService } from '@common/services';
import { GetCartState, UpdateTravelersState } from '@common/store';
import { SupportClass } from '@lib/components/support-class';
import { ErrorType, GenderCodeType, PageType } from '@lib/interfaces';
import { CommonLibService, PageLoadingService } from '@lib/services';
import {
  CartsUpdateTravelersRequest,
  CartsUpdateTravelersRequestContacts,
  CartsUpdateTravelersRequestContactsRepresentative,
  CartsUpdateTravelersRequestContactsRepresentativePhone,
  PostGetCartRequest,
} from 'src/sdk-reservation';
import {
  PassengerInformationRequestApiErrorMap,
  PassengerInformationRequestPassengerInformationDataGroup,
} from './passenger-information-request.state';
import { DatePipe } from '@angular/common';
import {
  PassengerInformationRequestRepresentativeInformationData,
  PassengerInformationRequestRepresentativeInformationParts,
} from './representative-information/representative-information.state';

/**
 * 搭乗者情報入力 API処理サービス
 * API処理部分が大きいので別サービスとして分離
 */
@Injectable({
  providedIn: 'root',
})
export class PassengerInformationRequestApiService extends SupportClass {
  /**
   * コンストラクタ
   */
  constructor(
    private _datePipe: DatePipe,
    private _common: CommonLibService,
    private _getCartStoreService: GetCartStoreService,
    private _updateTravelersInformationStoreService: UpdateTravelersInformationStoreService,
    private _pageLoadingService: PageLoadingService
  ) {
    super();
  }

  destroy(): void {}

  /**
   * カート取得API処理
   * @param next 成功時行うイベント
   * @param error 失敗時行うイベント
   */
  callGetCartApi(
    param: PostGetCartRequest,
    next?: (value: GetCartState) => void,
    error?: (value: GetCartState) => void
  ) {
    this._pageLoadingService.startLoading();
    apiEventAll(
      () => {
        this._getCartStoreService.setGetCartFromApi(param);
      },
      this._getCartStoreService.getGetCart$(),
      (res) => {
        this._pageLoadingService.endLoading();
        if (next) {
          next(res);
        }
      },
      (res) => {
        this._pageLoadingService.endLoading();
        this.callGetCartApiError();
        if (error) {
          error(res);
        }
      }
    );
  }
  /**
   * カート取得API失敗時の処理
   */
  callGetCartApiError() {
    const errorInfo = {
      errorType: ErrorType.BUSINESS_LOGIC,
      errorMsgId: 'E0333',
      apiErrorCode: this._common.apiError?.errors?.[0].code,
    };
    this._common.errorsHandlerService.setNotRetryableError(errorInfo);
  }

  /**
   * 搭乗者更新処理
   * @param param リクエストパラメータ
   * @param successEvent 成功時処理
   * @param errorEvent 失敗時処理
   */
  public updateTravelerInfo(
    param: CartsUpdateTravelersRequest,
    successEvent: (response: UpdateTravelersState) => void,
    errorEvent?: (error: UpdateTravelersState) => void
  ) {
    this._pageLoadingService.startLoading();
    // 搭乗者情報更新APIの実行
    apiEventAll(
      () => {
        this._updateTravelersInformationStoreService.setUpdateTravelersFromApi(param);
      },
      this._updateTravelersInformationStoreService.getGetUpdateTravelers$(),
      (response) => {
        this._pageLoadingService.endLoading();
        successEvent(response);
      },
      (error) => {
        this._pageLoadingService.endLoading();
        this.updateTravelerApiError();
        if (errorEvent) {
          errorEvent(error);
        }
      }
    );
  }

  /**
   * 搭乗者更新API　失敗時の処理
   */
  updateTravelerApiError() {
    defaultApiErrorEvent(
      this._common.apiError?.errors?.[0].code ?? '',
      PassengerInformationRequestApiErrorMap,
      (retryable) => {
        this._common.errorsHandlerService.setRetryableError(PageType.SUBPAGE, retryable);
        window.scroll({
          top: 0,
        } as ScrollToOptions);
      },
      (notRetryable) => {
        this._common.errorsHandlerService.setNotRetryableError(notRetryable);
      }
    );
  }

  /**
   * 各ブロックの登録状況に応じたAPIリクエストパラメータ作成処理
   * @param representativeParts` 代表者情報
   * @param representativeData 代表者情報データ
   * @param passengerInfoList 搭乗者リスト
   * @return 搭乗者情報更新APIのリクエストボディ
   */
  public createApiRequestParam(
    representativeParts: PassengerInformationRequestRepresentativeInformationParts,
    representativeData: PassengerInformationRequestRepresentativeInformationData,
    passengerInfoList: Array<PassengerInformationRequestPassengerInformationDataGroup>
  ): CartsUpdateTravelersRequest {
    let apiRequestParam: CartsUpdateTravelersRequest = {
      cartId: this._getCartStoreService.GetCartData.data?.cartId ?? '',
      contacts: {},
    };
    const EditPassengers = passengerInfoList.filter(
      (pass) => pass.parts.closeHeader.registrarionLabel === RegistrationLabelType.EDITTING
    );

    apiRequestParam.contacts = this.getPassengerContactRequestParam(
      EditPassengers,
      representativeData,
      passengerInfoList[0]
    );
    // 代表者情報が変更中の場合、代表者情報を追加する
    if (representativeParts.registrarionLabel === RegistrationLabelType.EDITTING) {
      apiRequestParam.contacts.representative = this.getRepresentativeInfoRequestParam(representativeData);
    }

    if (EditPassengers.length !== 0) {
      apiRequestParam.travelers = this.getPassengerTravelersRequestParam(EditPassengers);
      apiRequestParam.frequentFlyerCards = this.getPassengerFrequentFlyerCardsRequestParam(EditPassengers);
      apiRequestParam.passengerSupport = this.getPassengerSupportsRequestParam(EditPassengers);
    }

    return apiRequestParam;
  }

  /**
   * 代表者連絡先情報更新のためのAPIリクエストパラメータ作成処理
   * @param representativeData 代表者情報データ
   * @return 搭乗者情報更新APIのリクエストパラメータ 代表者連絡先情報
   */
  private getRepresentativeInfoRequestParam(
    representativeData: PassengerInformationRequestRepresentativeInformationData
  ): CartsUpdateTravelersRequestContactsRepresentative {
    // 搭乗者情報更新APIのリクエストパラメータの、代表者連絡先情報作成
    return {
      email: {
        address: representativeData.email,
      },
      phone: {
        type: representativeData.tellType as CartsUpdateTravelersRequestContactsRepresentativePhone.TypeEnum,
        countryPhoneExtension: representativeData.phoneCountryNumber,
        number: representativeData.phoneNumber,
      },
    };
  }

  /**
   * 搭乗者　APIリクエストパラメータ作成処理　連絡先情報
   * @param editPassengers 搭乗者情報データ
   * @param representativeData 代表者情報
   * @param firstPassenger 一番最初の搭乗者
   * @return 搭乗者情報更新APIのリクエストパラメータ　搭乗者　連絡先情報
   */
  private getPassengerContactRequestParam(
    editPassengers: Array<PassengerInformationRequestPassengerInformationDataGroup>,
    representativeData: PassengerInformationRequestRepresentativeInformationData,
    firstPassenger: PassengerInformationRequestPassengerInformationDataGroup
  ): CartsUpdateTravelersRequestContacts {
    const contacts: CartsUpdateTravelersRequestContacts = {};
    // 変更中の搭乗者情報が存在する場合、搭乗者情報を追加する
    editPassengers
      .filter((pass) => pass.parts.basicInformation.passengerTypeCode !== PassengerType.INF)
      .forEach((pass) => {
        contacts[pass.parts.id] = {
          email: this.getPassengerEmail(pass, representativeData),
          phone: this.getPassengerPhone(pass, representativeData),
          departureArrivalNotifications: this.getPassengerDepartuteArrivalNotifications(pass),
          secondContact: this.getPassengerSecondContact(pass, firstPassenger),
        };
      });
    return contacts;
  }

  /**
   * 搭乗者情報　Email
   * @param passenger  搭乗者情報
   * @param representativeData  代表者情報
   * @returns Email
   */
  private getPassengerEmail(
    passenger: PassengerInformationRequestPassengerInformationDataGroup,
    representativeData: PassengerInformationRequestRepresentativeInformationData
  ) {
    return {
      address:
        passenger.data.contact.passengerMailDestination === PassengerMailDestinationType.REPRESENTATIVE
          ? representativeData.email
          : passenger.data.contact.passengerMailAddress,
      //address: passenger.data.contact.passengerMailAddress,
    };
  }

  /**
   * 搭乗者情報　電話番号
   * @param passenger  搭乗者情報
   * @param representativeData  代表者情報
   * @returns 電話番号
   */
  private getPassengerPhone(
    passenger: PassengerInformationRequestPassengerInformationDataGroup,
    representativeData: PassengerInformationRequestRepresentativeInformationData
  ) {
    if (passenger.data.contact.passengerSMSDestination === PassengerPhoneDestinationType.REPRESENTATIVE) {
      return {
        countryPhoneExtension: representativeData.phoneCountryNumber,
        number: representativeData.phoneNumber,
        lang: this._common.aswContextStoreService.aswContextData.lang,
      };
    } else if (passenger.data.contact.passengerSMSDestination === PassengerPhoneDestinationType.INDIVIDUAL) {
      return {
        countryPhoneExtension: passenger.data.contact.passengerSMSCountryNumber,
        number: passenger.data.contact.passengerSMSNumber,
        lang: this._common.aswContextStoreService.aswContextData.lang,
      };
    }
    return undefined;
  }

  /**
   * 発着通知情報作成
   * @param passenger 搭乗者情報
   * @returns 発着通知情報
   */
  private getPassengerDepartuteArrivalNotifications(
    passenger: PassengerInformationRequestPassengerInformationDataGroup
  ): Array<CartsUpdateTravelersRequestContactsDepartuteArrivalNotifications> | undefined {
    const departuteArrivalNotifications = [];
    if (!passenger.parts.isAdditionalInfo) {
      return undefined;
    }
    if (!isStringEmpty(passenger.data.arrivalAndDepartureNotice.mailRecipientName)) {
      departuteArrivalNotifications.push({
        email: {
          address: passenger.data.arrivalAndDepartureNotice.mailAddress,
        },
        recipient: passenger.data.arrivalAndDepartureNotice.mailRecipientName,
        lang: passenger.data.arrivalAndDepartureNotice.mailLang,
      });
    }
    if (!isStringEmpty(passenger.data.arrivalAndDepartureNotice.mailRecipientName2)) {
      departuteArrivalNotifications.push({
        email: {
          address: passenger.data.arrivalAndDepartureNotice.mailAddress2,
        },
        recipient: passenger.data.arrivalAndDepartureNotice.mailRecipientName2,
        lang: passenger.data.arrivalAndDepartureNotice.mailLang2,
      });
    }
    return departuteArrivalNotifications.length !== 0 ? departuteArrivalNotifications : undefined;
  }

  /**
   * FY23追加分系　第2連絡先情報
   * @param passenger 搭乗者情報
   * @param firstPassenger 一番最初の搭乗者
   * @returns 第2連絡先情報
   */
  private getPassengerSecondContact(
    passenger: PassengerInformationRequestPassengerInformationDataGroup,
    firstPassenger: PassengerInformationRequestPassengerInformationDataGroup
  ): CartsUpdateTravelersRequestContactsSecondContact | undefined {
    if (
      !passenger.parts.contact.isNhAndArriveUsa ||
      passenger.data.contact.passengerSecondContactDestination === PassengerSecondContactType.AFTER_REGISTER
    ) {
      //非表示または後から登録
      return undefined;
    }
    // 1人目と同じ
    if (passenger.data.contact.passengerSecondContactDestination === PassengerSecondContactType.FIRST_TRAVELER) {
      // 1人目と同じ、かつ、1人目は後から登録
      if (firstPassenger.data.contact.passengerSecondContactDestination === PassengerSecondContactType.AFTER_REGISTER) {
        return undefined;
      }
      return {
        phone: {
          countryCode: firstPassenger.data.contact.passengerSecondContactCountry,
          number: firstPassenger.data.contact.passengerSecondContactNumber,
        },
        ownerOfPhone: firstPassenger.data.contact.passengerSecondContactOwnerOfPhone,
      };
    }
    // 個別に設定
    return {
      phone: {
        countryCode: passenger.data.contact.passengerSecondContactCountry,
        number: passenger.data.contact.passengerSecondContactNumber,
      },
      ownerOfPhone: passenger.data.contact.passengerSecondContactOwnerOfPhone,
    };
  }

  /**
   * 搭乗者　APIリクエストパラメータ作成処理　搭乗者情報リスト
   * @param editPassengers 搭乗者情報データ
   * @return 搭乗者情報更新APIのリクエストパラメータ　搭乗者情報リスト
   */
  private getPassengerTravelersRequestParam(
    editPassengers: Array<PassengerInformationRequestPassengerInformationDataGroup>
  ): CartsUpdateTravelersRequestTravelersRequestParam {
    const travelers: CartsUpdateTravelersRequestTravelersRequestParam = {};
    editPassengers.forEach((pass) => {
      let title = pass.data.basicInformation.title === 'DR' ? 'DR' : null;
      travelers[pass.parts.id] = {
        names: {
          title: title,
          firstName: pass.data.basicInformation.firstName,
          middleName: pass.data.basicInformation.middleName,
          lastName: pass.data.basicInformation.lastName,
        },
        dateOfBirth: pass.data.basicInformation.selectYmd
          ? this._datePipe.transform(pass.data.basicInformation.selectYmd, 'yyyy-MM-dd') ?? ''
          : '',
        gender: pass.data.basicInformation.gender,
        regulatoryDetails: isStringEmpty(pass.data.passport.passportNumber)
          ? undefined
          : {
              passport: {
                number: pass.data.passport.passportNumber,
              },
            },
        disabilityDiscountInformation: this.getPassengerDisability(pass),
        islandCard: this.getPassengerIslandCard(pass),
      };
    });

    return travelers;
  }

  /**
   * FY25　搭乗者 障がい者種別
   * @param passenger 搭乗者情報
   * @returns 障がい者種別
   */
  private getPassengerDisability(
    passenger: PassengerInformationRequestPassengerInformationDataGroup
  ): CartsUpdateTravelersRequestTravelerDisAbility | undefined {
    if (!passenger.parts.isDisability) {
      return undefined;
    }
    return {
      disabilityType: passenger.data.disability.disabilityType,
      careReceiverTravelerId:
        passenger.data.disability.disabilityType === DisabilityType.CREGIVER
          ? passenger.data.disability.careReceiverTravelerId
          : undefined,
    };
  }

  /**
   * FY25　搭乗者 離島カード
   * @param passenger 搭乗者情報
   * @returns 離島カード
   */
  private getPassengerIslandCard(
    passenger: PassengerInformationRequestPassengerInformationDataGroup
  ): CartsUpdateTravelersRequestTravelerIslandCard | undefined {
    if (!passenger.parts.isIsland) {
      return undefined;
    }
    return {
      number: passenger.data.island.number,
    };
  }

  /**
   * 搭乗者　APIリクエストパラメータ作成処理　マイレージプログラム情報リスト
   * @param passengerInfoList 搭乗者情報データ
   * @return 搭乗者情報更新APIのリクエストパラメータ　マイレージプログラム情報リスト
   */
  private getPassengerFrequentFlyerCardsRequestParam(
    editPassengers: Array<PassengerInformationRequestPassengerInformationDataGroup>
  ): CartsUpdateTravelersRequestFrequentFlyerCards | undefined {
    const frequentFlyerCards: CartsUpdateTravelersRequestFrequentFlyerCards = {};
    editPassengers.forEach((pass) => {
      if (!isStringEmpty(pass.data.ffpData.mileageProgramName) && !isStringEmpty(pass.data.ffpData.FFPNumber)) {
        frequentFlyerCards[pass.parts.id] = {
          fqtv: [
            {
              companyCode: pass.data.ffpData.mileageProgramName,
              cardNumber: pass.data.ffpData.FFPNumber,
            },
          ],
        };
      } else {
        frequentFlyerCards[pass.parts.id] = {};
      }
    });
    return isEmptyObject(frequentFlyerCards) ? undefined : frequentFlyerCards;
  }

  /**
   * 搭乗者　APIリクエストパラメータ作成処理　搭乗者情報系サポート情報
   * @param passengerInfoList 搭乗者情報データ
   * @return 搭乗者情報更新APIのリクエストパラメータ　搭乗者情報系サポート情報
   */
  private getPassengerSupportsRequestParam(
    editPassengers: Array<PassengerInformationRequestPassengerInformationDataGroup>
  ): CartsUpdateTravelersRequestSupports | undefined {
    const supports: CartsUpdateTravelersRequestSupports = {};
    editPassengers.forEach((pass) => {
      if (pass.parts.isAdditionalInfo) {
        supports[pass.parts.id] = {
          walking: this.getPassengerSupportsRequestWalkingParam(pass),
          blind: pass.data.support.blind,
          deaf: pass.data.support.deaf,
          pregnant: this.getPassengerSupportsRequestPregnantParam(pass),
        };
      }
    });
    return isEmptyObject(supports) ? undefined : supports;
  }

  /**
   * 搭乗者歩行障がい情報
   * @param passenger 搭乗者情報
   * @returns  搭乗者歩行障がい情報
   */
  private getPassengerSupportsRequestWalkingParam(
    passenger: PassengerInformationRequestPassengerInformationDataGroup
  ): CartsUpdateTravelersRequestSupportsWalking | undefined {
    if (!passenger.data.support.walk) {
      //歩行障がい無し
      return {
        wheelChair: {
          isNeeded: false,
        },
      };
    } else if (!passenger.data.support.bringWheelchair) {
      //歩行障がいだが、車いす持ち込みなし
      return {
        degreeSpecialServiceRequest: {
          code: passenger.data.support.walkLevel,
        },
        wheelChair: {
          isNeeded: false,
        },
      };
    }
    const batteryType = stringEmptyUndefined(passenger.data.support.wheelchairBatteryType);
    return {
      degreeSpecialServiceRequest: {
        code: passenger.data.support.walkLevel,
      },
      wheelChair: {
        isNeeded: passenger.data.support.bringWheelchair ?? false,
        isFoldable: passenger.data.support.wheelchairFoldable ?? false,
        type: stringEmptyUndefined(passenger.data.support.wheelchairType),
        batteryType: batteryType !== undefined ? wheelchairBatteryApi(batteryType) : batteryType,
        depth: numberZeroUndefined(passenger.data.support.wheelchairDepth),
        width: numberZeroUndefined(passenger.data.support.wheelchairWidth),
        height: numberZeroUndefined(passenger.data.support.wheelchairHeight),
        weight: numberZeroUndefined(passenger.data.support.wheelchairWeight),
      },
    };
  }

  /**
   * FY25　妊婦情報
   * @param passenger 搭乗者情報
   * @returns 妊婦情報
   */
  private getPassengerSupportsRequestPregnantParam(
    passenger: PassengerInformationRequestPassengerInformationDataGroup
  ): CartsUpdateTravelersRequestSupportsPregnant | undefined {
    if (!passenger.data.support.isPregnant) {
      return undefined;
    }
    return {
      doctor: {
        name: passenger.data.support.doctorName,
        phone: {
          countryPhoneExtension: passenger.data.support.doctorCountryPhoneExtension,
          number: passenger.data.support.doctorPhoneNumber,
        },
      },
      dueDate: this._datePipe.transform(passenger.data.support.pregnantDueDate, 'ddMMMyy') ?? '',
      condition: passenger.data.support.pregnantCondition,
    };
  }
}
