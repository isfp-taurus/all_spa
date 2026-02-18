import { Injectable } from '@angular/core';
import {
  fixedArrayCache,
  getApiPhoneType,
  getApplyDateCache,
  getApplyListData,
  getKeyListData,
  getPhoneCountryList,
  isStringEmpty,
} from '@common/helper';
import {
  MCountry,
  MMileageProgram,
  PassengerInformationRequestMastarData,
  PassengerMailDestinationType,
  PassengerSecondContactType,
  RegistrationLabelType,
} from '@common/interfaces';
import { CancelPrebookService, CurrentCartStoreService } from '@common/services';
import { CurrentCartState, GetCartState } from '@common/store';
import { SupportClass } from '@lib/components/support-class';
import { DialogClickType, DialogType } from '@lib/interfaces';
import {
  AswMasterService,
  CommonLibService,
  DialogDisplayService,
  ModalService,
  PageLoadingService,
  SystemDateService,
} from '@lib/services';
import { PostGetCartRequest } from 'src/sdk-reservation';
import {
  getPassengerInformationRequestMasterKey,
  PassengerInformationRequestPassengerInformationDataGroup,
} from './passenger-information-request.state';
import {
  PassengerInformationRequestRepresentativeInformationData,
  PassengerInformationRequestRepresentativeInformationParts,
} from './representative-information/representative-information.state';
import { PassengerInformationRequestPayload } from './passenger-information-request.payload.state';
import { PassengerInformationRequestApiService } from './passenger-information-request-api.service';
import { selectNextPageModalPayloadParts } from './modal/select-next-page-modal/select-next-page-modal-payload.state';
import { PassengerInformationRequestPassengerArrivalAndDepartureNoticeData } from './passenger-information/passenger-arrival-and-departure-notice/passenger-arrival-and-departure-notice.state';
import { PassengerInformationRequestPassengerInfoService } from './passenger-information/passenger-information.service';
import { PassengerInformationRequestRepresentativeInformationService } from './representative-information/representative-information.service';
import { StaticMsgPipe } from '@lib/pipes';
import { AppConstants } from '@conf/app.constants';
import { matchedRegexPattern } from '@lib/helpers/validate/pattern/pattern.validator';

/** SMS送信対象の正規表現判定（先頭が070/080/090/70/80/90のいずれか）*/
const isSmsSendPattern = (tel: string): boolean => matchedRegexPattern(tel, '^0[789]0|^[789]0');

@Injectable({
  providedIn: 'root',
})
export class PassengerInformationRequestService extends SupportClass {
  /**
   * コンストラクタ
   */
  constructor(
    private _common: CommonLibService,
    private _api: PassengerInformationRequestApiService,
    private _staticMsg: StaticMsgPipe,
    private _master: AswMasterService,
    private _modalService: ModalService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _representativeInfoService: PassengerInformationRequestRepresentativeInformationService,
    private _passengerInfoService: PassengerInformationRequestPassengerInfoService,
    private _dialogService: DialogDisplayService,
    private _cancelPrebookService: CancelPrebookService,
    private _sysDate: SystemDateService,
    private _pageLoadingService: PageLoadingService
  ) {
    super();
  }

  destroy(): void {}

  /**
   * 必要なキャッシュを取得する
   * @param event キャッシュ取得後処理
   */
  getCacheMaster(event: (master: PassengerInformationRequestMastarData) => void) {
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    this.subscribeService(
      'PassengerInformationRequestMastarData',
      this._master.load(getPassengerInformationRequestMasterKey(lang), true),
      ([
        country,
        office,
        langConvert,
        mileage,
        PosCountry,
        PosCountryJp,
        PosCountrySms,
        PosCountryJpSms,
        listData,
        property,
        airport,
      ]) => {
        this.deleteSubscription('PassengerInformationRequestMastarData');
        const appListData = getApplyListData(listData, this._sysDate.getSystemDate());
        const posCode = this._common.aswContextStoreService.aswContextData.posCountryCode;
        const phoneCountry = getPhoneCountryList(PosCountry ?? {}, PosCountryJp ?? {}, posCode);
        const phoneCountrySms = getPhoneCountryList(PosCountrySms ?? {}, PosCountryJpSms ?? {}, posCode, false);
        phoneCountry
          .filter((pos) => pos.isTranslate)
          .forEach((pos) => (pos.countryName = this._staticMsg.transform(pos.countryName)));
        phoneCountrySms
          .filter((pos) => pos.isTranslate)
          .forEach((pos) => (pos.countryName = this._staticMsg.transform(pos.countryName)));
        const master: PassengerInformationRequestMastarData = {
          pd004: getKeyListData(appListData, 'PD_004', lang),
          pd006: getKeyListData(appListData, 'PD_006', lang),
          pd010: getKeyListData(appListData, 'PD_010', lang).map((list) => {
            return { ...list, value: getApiPhoneType(list.value) };
          }),
          pd020: getKeyListData(appListData, 'PD_020', lang),
          pd065: getKeyListData(appListData, 'PD_065', lang),
          pd960: getKeyListData(appListData, 'PD_960', lang),
          mileage: getApplyDateCache(mileage, this._sysDate.getSystemDate()).filter(
            (list: MMileageProgram) => list.carrier_code === AppConstants.CARRIER.TWO_LETTER
          ),
          country: fixedArrayCache(country),
          office: fixedArrayCache(office),
          phoneCountry: phoneCountry,
          phoneCountrySms: phoneCountrySms,
          langCodeConvert: fixedArrayCache(langConvert),
          property: property,
          airport: airport ?? [],
        };
        event(master);
      }
    );
  }

  /**
   * airportなキャッシュを取得する
   * @param event airportキャッシュ取得後処理
   */
  getCacheMasterAirport(event: (airport: any) => void) {
    this.subscribeService(
      'PassengerInformationRequestMastarDataAirportAll',
      this._master.load([{ key: 'Airport_All', fileName: 'Airport_All' }], true),
      ([airport]) => {
        this.deleteSubscription('PassengerInformationRequestMastarDataAirportAll');
        event(airport);
      }
    );
  }

  /**
   * aswCommon初期化
   */
  initialAswCommon() {}

  /**
   * 代表者情報作成
   * @param res カート取得APIレスポンス
   * @param master 搭乗者情報入力　キャッシュマスターデータ
   * @param payload 搭乗者情報入力　ペイロードデータ
   */
  createRepresentativeInformation(
    res: GetCartState,
    master: PassengerInformationRequestMastarData,
    payload: PassengerInformationRequestPayload
  ): PassengerInformationRequestRepresentativeInformationData {
    return this._representativeInfoService.createData(res, master, payload);
  }
  /**
   * 代表者情報入力作成
   * @param res カート取得APIレスポンス
   * @param payload 搭乗者情報入力　ペイロードデータ
   * @param master 搭乗者情報入力　キャッシュマスターデータ
   */
  createRepresentativeInformationParts(
    res: GetCartState,
    payload: PassengerInformationRequestPayload,
    master: PassengerInformationRequestMastarData
  ): PassengerInformationRequestRepresentativeInformationParts {
    return this._representativeInfoService.createParts(res, payload, master.country, master.pd010, master.phoneCountry);
  }

  /**
   * 搭乗者情報作成
   * @param res カート取得APIレスポンス
   * @param master 搭乗者情報入力　キャッシュマスターデータ
   * @param payload 搭乗者情報入力　ペイロードデータ
   */
  createPassengerInformationGroup(
    res: GetCartState,
    master: PassengerInformationRequestMastarData,
    payload: PassengerInformationRequestPayload
  ): Array<PassengerInformationRequestPassengerInformationDataGroup> {
    const lastIndex = (res.data?.plan?.travelers ?? []).length - 1;
    return (
      res.data?.plan?.travelers
        ?.map((traveler, index) => {
          return {
            data: this._passengerInfoService.createData(res, traveler, index, master, payload),
            parts: this._passengerInfoService.createParts(res, traveler, master, index, payload, index === lastIndex),
          };
        })
        .filter(
          //編集モードの場合　入力済み、または対象のみデータを取り出す
          (pass, index) =>
            !payload.isEditMode ||
            pass.parts.registrarionLabel !== RegistrationLabelType.NOT_REGISTERED ||
            payload.editArea === index
        ) ?? []
    );
  }

  /**
   * カート取得API処理
   * @param next 成功時行うイベント
   * @param error 失敗時行うイベント
   */
  updateCart(next?: (value: GetCartState) => void, error?: (value: GetCartState) => void) {
    //カート取得APIを呼び出すためのデータ作成
    const getCartRequestParam: PostGetCartRequest = {
      cartId: this._currentCartStoreService.CurrentCartData.data?.cartId ?? '',
      refresh: false,
      mask: false,
    };
    this._api.callGetCartApi(getCartRequestParam, next, error);
  }

  /**
   * 1.1.5	代表者電話番号種別値変更処理
   * @param value 変更値、国コード、電話番号種別
   * @param country 国マスタ
   * @param passengerList 搭乗者リスト
   * @return 警告メッセージ表示フラグ
   */
  changeRepresentativePhoneType(
    value: { code: string; type: string; number: string },
    country: Array<MCountry>,
    passengerList: Array<PassengerInformationRequestPassengerInformationDataGroup>
  ) {
    let isAlert = false;
    if (
      value.type !== 'M' ||
      country.find((con) => con.country_2letter_code === value.code)?.sms_send_flag === false ||
      (value.code === 'JP' && !isSmsSendPattern(value.number))
    ) {
      // 選択された電話番号種別が携帯以外、またはSMS送信可能国でない場合、または 電話番号の国が日本かつ代表者入力情報.電話番号=070/080/090/70/80/90始まり以外の場合、代表者と同じの選択を非活性
      passengerList.forEach((pass) => {
        pass.parts.contact.isEnableRrepresentative = false;
        if (pass.data.contact.passengerSMSDestination === PassengerMailDestinationType.REPRESENTATIVE) {
          // 代表者と同じを選択している搭乗者の選択を切替
          pass.data.contact.passengerSMSDestination = PassengerMailDestinationType.INDIVIDUAL;
          if (pass.parts.registrarionLabel === RegistrationLabelType.REGISTERED) {
            // 入力済みの場合、編集中にし警告メッセージ表示フラグをON
            pass.data.contact.passengerSMSDestination = PassengerMailDestinationType.INDIVIDUAL;
            pass.parts.registrarionLabel = RegistrationLabelType.EDITTING;
            isAlert = true;
          }
        }
      });
      if (isAlert) {
        // 警告メッセージ表示処理
        this._common.alertMessageStoreService.setAlertSubInfomationMessage({
          contentHtml: value.type !== 'M' ? 'm_dynamic_message-MSG1047' : 'm_dynamic_message-MSG1486',
          isCloseEnable: true,
        });
      }
    } else {
      // 代表者と同じの選択を活性
      passengerList.forEach((pass) => {
        pass.parts.contact.isEnableRrepresentative = true;
      });
    }
    return isAlert;
  }

  /**
   * 入力完了操作エリアの表示更新
   * @param representative 代表者情報
   * @param passengerInfoList 搭乗者リスト
   * @param isEditMode 編集モードか否か　編集モードの場合入力完了エリアは表示しない
   * @return 入力完了エリアが表示されているか
   */
  completedAreaShow(
    representative: PassengerInformationRequestRepresentativeInformationParts,
    passengerInfoList: Array<PassengerInformationRequestPassengerInformationDataGroup>,
    isEditMode: boolean
  ): boolean {
    // 各ブロックの編集中判定
    const isRepresentativeEdit = representative.registrarionLabel === RegistrationLabelType.EDITTING;
    const isPassengerInfoEdit = passengerInfoList.some(
      (pass) => pass.parts.registrarionLabel === RegistrationLabelType.EDITTING
    );
    if (isPassengerInfoEdit) {
      // 搭乗者情報が編集中の場合、新規入力であれば最後の搭乗者に入力完了エリアを表示し、他を非表示
      representative.isEnableComplete = false;
      let lastIndex = 0;
      passengerInfoList.forEach((pass, index) => {
        if (pass.parts.registrarionLabel === RegistrationLabelType.EDITTING) {
          lastIndex = index;
        }
      });
      passengerInfoList.forEach((pass, index) => {
        pass.parts.isEnableComplete = index === lastIndex && !isEditMode;
      });
    } else if (isRepresentativeEdit) {
      // 代表者情報が編集中の場合、新規入力であれば代表者情報に入力完了エリアを表示し、他を非表示
      representative.isEnableComplete = !isEditMode;
      passengerInfoList.forEach((pass) => (pass.parts.isEnableComplete = false));
    }
    return isRepresentativeEdit || isPassengerInfoEdit;
  }

  /** 次へボタン/保存・プラン確認画面へ戻るボタン押下処理
   * @param representativeParts` 代表者情報
   * @param representativeData 代表者情報データ
   * @param passengerInfoList 搭乗者リスト
   * @param passengerInfoListInit 初期搭乗者リスト
   * @param successEvent 成功時処理
   * @param errorEvent エラー時処理
   * @param escapeEvent 途中終了イベント
   */
  public savePlan(
    representativeParts: PassengerInformationRequestRepresentativeInformationParts,
    representativeData: PassengerInformationRequestRepresentativeInformationData,
    passengerInfoList: Array<PassengerInformationRequestPassengerInformationDataGroup>,
    passengerInfoListInit: Array<PassengerInformationRequestPassengerInformationDataGroup>,
    successEvent?: () => void,
    errorEvent?: () => void,
    escapeEvent?: () => void
  ) {
    //入力エラーチェック　エラーがある場合処理終了
    if (this.savePlanErrorCheck(representativeData, passengerInfoList)) {
      errorEvent ? errorEvent() : '';
      return;
    }

    const nextEvent = () => {
      this.savePlanConfirm(representativeParts, representativeData, passengerInfoList, successEvent, errorEvent);
    };

    // FY23追加分系 搭乗者SMS送付先と2件目緊急連絡先に同じ電話番号(国番号を含む)
    if (this.checkSecondContact(passengerInfoList, representativeData)) {
      this._common.errorsHandlerService.setRetryableError('subPage', {
        errorMsgId: 'E0874',
      });
      errorEvent ? errorEvent() : '';
      return;
    }

    // 発着通知連絡先情報に変更があったかを確認し、確認ダイアログを出す
    if (
      passengerInfoList.some((pass, index) =>
        Object.entries(pass.data.arrivalAndDepartureNotice).some(
          ([key, value]) =>
            passengerInfoListInit[index].data.arrivalAndDepartureNotice[
              key as keyof PassengerInformationRequestPassengerArrivalAndDepartureNoticeData
            ] !== value
        )
      )
    ) {
      this.subscribeService(
        'PassengerInformationRequest-plansave',
        this._dialogService.openDialog({
          type: DialogType.CHOICE, //ダイアログタイプ
          message: 'm_dynamic_message-MSG1046', //ダイアログのメッセージID
        }).buttonClick$,
        (result) => {
          this.deleteSubscription('PassengerInformationRequest-plansave');
          if (result.clickType === DialogClickType.CONFIRM) {
            nextEvent();
          } else if (escapeEvent) {
            escapeEvent();
          }
        }
      );
    } else {
      nextEvent();
    }
  }

  /**
   * 入力エラーチェック
   * @param representativeData 代表者情報データ
   * @param passengerInfoList 搭乗者リスト
   * @returns エラー有無
   */
  private savePlanErrorCheck(
    representativeData: PassengerInformationRequestRepresentativeInformationData,
    passengerInfoList: Array<PassengerInformationRequestPassengerInformationDataGroup>
  ) {
    //搭乗者情報のSMS送信先種別が変更された旨が注意喚起エリアに存在する場合、非表示とする
    this._common.alertMessageStoreService.removeAllSubAlertMessage();
    //編集中ブロックすべてに対する入力チェック
    if (representativeData.isError || passengerInfoList.some((pass) => pass.data.isError)) {
      //入力エラーがある
      return true;
    }
    return false;
  }

  /**
   * 第2連絡先のチェック
   * 搭乗者の電話番号と第2連絡先の一致確認
   * @param passengerInfoList 搭乗者リスト
   * @param representativeData 代表者情報データ
   */
  public checkSecondContact(
    passengerInfoList: Array<PassengerInformationRequestPassengerInformationDataGroup>,
    representativeData: PassengerInformationRequestRepresentativeInformationData
  ) {
    return passengerInfoList.some((pass) => {
      let number = '';
      let countryNum = '';
      if (pass.data.contact.passengerSMSDestination === PassengerMailDestinationType.REPRESENTATIVE) {
        number = representativeData.phoneNumber;
        countryNum = representativeData.phoneCountryNumber;
      } else if (pass.data.contact.passengerSMSDestination === PassengerMailDestinationType.INDIVIDUAL) {
        number = pass.data.contact.passengerSMSNumber;
        countryNum = pass.data.contact.passengerSMSCountryNumber;
      } else {
        return false;
      }
      if (
        pass.data.contact.passengerSecondContactDestination === PassengerSecondContactType.FIRST_TRAVELER &&
        !isStringEmpty(passengerInfoList[0].data.contact.passengerSecondContactNumber)
      ) {
        let countryNumberForCheck = passengerInfoList[0].data.contact.passengerSecondContactCountryNumber;
        let contactNumberForCheck = passengerInfoList[0].data.contact.passengerSecondContactNumber;
        return (
          pass.parts.contact.isNhAndArriveUsa &&
          countryNumberForCheck === countryNum &&
          contactNumberForCheck === number
        );
      } else {
        return (
          pass.parts.contact.isNhAndArriveUsa &&
          !isStringEmpty(pass.data.contact.passengerSecondContactNumber) &&
          pass.data.contact.passengerSecondContactDestination === PassengerSecondContactType.INDIVIDUAL &&
          pass.data.contact.passengerSecondContactCountryNumber === countryNum &&
          pass.data.contact.passengerSecondContactNumber === number
        );
      }
    });
  }

  /** プラン保存処理
   * @param representativeParts` 代表者情報
   * @param representativeData 代表者情報データ
   * @param passengerInfoList 搭乗者リスト
   * @param successEvent 成功時処理
   * @param errorEvent エラー時処理
   */
  public savePlanConfirm(
    representativeParts: PassengerInformationRequestRepresentativeInformationParts,
    representativeData: PassengerInformationRequestRepresentativeInformationData,
    passengerInfoList: Array<PassengerInformationRequestPassengerInformationDataGroup>,
    successEvent?: () => void,
    errorEvent?: () => void
  ) {
    // Prebook後に搭乗者更新APIを呼び出す
    this._cancelPrebookService.cancelPrebookNext(
      () => {
        this.savePlanUpdateTraveler(
          representativeParts,
          representativeData,
          passengerInfoList,
          successEvent,
          errorEvent
        );
      },
      (isNotRetryable) => {
        if (!isNotRetryable) {
          this.savePlanUpdateTraveler(
            representativeParts,
            representativeData,
            passengerInfoList,
            successEvent,
            errorEvent
          );
        }
      }
    );
  }

  /**
   * 搭乗者更新APIを呼び出す
   * @param representativeParts` 代表者情報
   * @param representativeData 代表者情報データ
   * @param passengerInfoList 搭乗者リスト
   * @param successEvent 成功時処理
   * @param errorEvent エラー時処理
   */
  savePlanUpdateTraveler(
    representativeParts: PassengerInformationRequestRepresentativeInformationParts,
    representativeData: PassengerInformationRequestRepresentativeInformationData,
    passengerInfoList: Array<PassengerInformationRequestPassengerInformationDataGroup>,
    successEvent?: () => void,
    errorEvent?: () => void
  ) {
    const param = this._api.createApiRequestParam(representativeParts, representativeData, passengerInfoList);
    //API呼び出し
    this._api.updateTravelerInfo(
      param,
      (res) => {
        if (successEvent) {
          successEvent();
        }
      },
      errorEvent
    );
  }

  /**
   * 遷移先分岐モーダルの表示
   * @param response カートAPIレスポンス
   * @param passengerInfoList 搭乗者リスト
   * @param closeEvent 閉じた後の処理
   */
  openSelectNextPage(
    response: CurrentCartState,
    passengerInfoList: Array<PassengerInformationRequestPassengerInformationDataGroup>,
    closeEvent?: () => void
  ) {
    this._currentCartStoreService.setCurrentCart(response);
    const parts = selectNextPageModalPayloadParts(false);
    parts.payload = {
      order: passengerInfoList[0]?.parts.basicInformation.order ?? '0',
    };
    if (closeEvent) {
      parts.closeEvent = closeEvent;
    }
    this._modalService.showSubModal(parts);
  }

  /**
   * 編集中のブロックを入力済みにする
   * @param representativeParts` 代表者情報
   * @param passengerInfoList 搭乗者リスト
   */
  editToRegistered(
    representativeParts: PassengerInformationRequestRepresentativeInformationParts,
    passengerInfoList: Array<PassengerInformationRequestPassengerInformationDataGroup>
  ) {
    // 編集中のものを編集済みにする

    if (representativeParts.registrarionLabel === RegistrationLabelType.EDITTING) {
      representativeParts.registrarionLabel = RegistrationLabelType.REGISTERED;
      representativeParts.isCloseEnable = true;
    }

    passengerInfoList
      .filter((pass) => pass.parts.registrarionLabel === RegistrationLabelType.EDITTING)
      .forEach((pass) => {
        pass.parts.registrarionLabel = RegistrationLabelType.REGISTERED;
        pass.parts.isCloseEnable = true;
      });
  }
}
