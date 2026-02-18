import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { checkFormEqual, checkFormGroupValidate, isCanada, isEmptyObject, isStringEmpty } from '@common/helper';
import {
  CountryCodeNameType,
  MCountry,
  MListData,
  PassengerInformationRequestEditType,
  PassengerInformationRequestMastarData,
  PhoneNumberType,
  RegistrationLabelType,
} from '@common/interfaces';
import { GetCartState } from '@common/store';
import { SupportClass } from '@lib/components/support-class';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService } from '@lib/services';
import { isEmpty } from 'rxjs';
import { PassengerInformationRequestPayload } from '../passenger-information-request.payload.state';
import {
  PassengerInformationRequestRepresentativeInformationConfirmEmailError,
  PassengerInformationRequestRepresentativeInformationData,
  PassengerInformationRequestRepresentativeInformationParts,
} from './representative-information.state';
import { AnaBizLoginStatusType } from '@lib/interfaces';
/**
 * 代表者連絡先情報 service
 */
@Injectable()
export class PassengerInformationRequestRepresentativeInformationService extends SupportClass {
  constructor(private _common: CommonLibService, private _staticMsg: StaticMsgPipe) {
    super();
  }

  destroy() {}

  /**
   * 代表者連絡先情報 初期値の作成
   * @param res カートAPIレスポンス
   * @param master 搭乗者情報入力　キャッシュマスターデータ
   * @param payload 搭乗者情報入力　ペイロードデータ
   * @returns 代表者連絡先情報 初期値
   */
  createData(
    res: GetCartState,
    master: PassengerInformationRequestMastarData,
    payload: PassengerInformationRequestPayload
  ): PassengerInformationRequestRepresentativeInformationData {
    const representative = res.data?.plan?.contacts?.representative;
    let representativeCountryCode = representative?.phones?.[0]?.countryPhoneExtension ?? '';
    if (isStringEmpty(representativeCountryCode) && this._common.isJapaneseOffice()) {
      representativeCountryCode = '81';
    }
    let country = master.country.find((con) => con.international_tel_country_code === representativeCountryCode);
    if (!country && this._common.isJapaneseOffice()) {
      country = master.country.find((con) => con.country_2letter_code === 'JP');
    }
    //法人ログイン時のメールアドレス、電話番号には企業情報の設定値を初期設定する
    //電話番号は企業情報の姓名・メールアドレスが未設定なら設定しない
    const isAnaBizLogin =
      this._common.aswContextStoreService.aswContextData.anaBizLoginStatus === AnaBizLoginStatusType.LOGIN;
    const bizGivenName = this._common.anaBizContextStoreService.anaBizContextData.allBizContext?.givenName;
    const bizFamilyName = this._common.anaBizContextStoreService.anaBizContextData.allBizContext?.familyName;
    const bizEmail = this._common.anaBizContextStoreService.anaBizContextData.allBizContext?.emailAddress;
    const originBizTellType = this._common.anaBizContextStoreService.anaBizContextData.allBizContext?.addressType;
    // 値が設定されていない場合は日本(+81)とする。
    const bizPhoneCountryNumber =
      this._common.anaBizContextStoreService.anaBizContextData.allBizContext?.phoneISDCode || '+81';
    const bizPhoneNumber = this._common.anaBizContextStoreService.anaBizContextData.allBizContext?.phoneNumber;
    // 企業情報 HP：自宅 HM：自宅携帯 BP：勤務先
    // カート情報 H：自宅、M：携帯、B：会社
    let bizTellType = null;
    if (originBizTellType === 'HP') {
      bizTellType = 'H';
    } else if (originBizTellType === 'HM') {
      bizTellType = 'M';
    } else if (originBizTellType === 'BP') {
      bizTellType = 'B';
    }
    let email = '';
    let tellType = null;
    let phoneCountryNumber = '';
    let phoneNumber = '';
    if (
      isAnaBizLogin &&
      (payload.editArea === PassengerInformationRequestEditType.REPRESENTATIVE || !payload.isEditMode)
    ) {
      email = bizEmail ?? '';
      if (bizGivenName || bizFamilyName || bizEmail) {
        tellType = bizTellType;
        phoneCountryNumber = bizPhoneCountryNumber;
        phoneNumber = String(bizPhoneNumber ?? '');
      }
    } else {
      email = representative?.emails?.[0]?.address ?? '';
      tellType = representative?.phones?.[0]?.type ?? PhoneNumberType.MOBILE;
      phoneCountryNumber = representative?.phones?.[0]?.countryPhoneExtension ?? '';
      phoneNumber = representative?.phones?.[0]?.number ?? '';
    }
    return {
      email,
      emailConfirm: email,
      tellType: tellType ?? PhoneNumberType.MOBILE,
      phoneCountry: country?.country_2letter_code ?? '',
      phoneCountryNumber: !country ? '' : phoneCountryNumber ?? '',
      phoneNumber,
      isError: false,
    };
  }

  /**
   * 代表者連絡先情報 設定値の作成
   * @param res カートAPIレスポンス
   * @param payload 搭乗者情報入力ペイロード
   * @param country 国マスタリスト
   * @param pd010 リストデータPD_010 電話番号種別
   * @param phoneCountry 電話番号国コードリスト
   * @returns 代表者連絡先情報 設定値
   */
  createParts(
    res: GetCartState,
    payload: PassengerInformationRequestPayload,
    country: Array<MCountry>,
    pd010: Array<MListData>,
    phoneCountry: Array<CountryCodeNameType>
  ): PassengerInformationRequestRepresentativeInformationParts {
    // 次のアクション
    let nextAction = this._staticMsg.transform('label.nextEdit') + ' ';
    const names = res.data?.plan?.travelers?.[0].names?.at(0);
    if (!isStringEmpty(names?.firstName)) {
      const firstName = names?.firstName ?? '';
      const middleName = names?.middleName ?? '';
      const lastName = names?.lastName ?? '';
      nextAction += `${firstName}${middleName} ${lastName}`;
    } else {
      nextAction += this._staticMsg.transform('label.passenger.n', { '0': 1 });
    }

    const registrarionLabel = this.getRegistrarion(
      payload.isEditMode,
      payload.editArea,
      !isEmptyObject(res.data?.plan?.contacts?.representative)
    );
    return {
      nextAction: nextAction,
      registrarionLabel: registrarionLabel,
      isEditPosCanada: isCanada(this._common.aswContextStoreService.aswContextData),
      isEnableComplete: payload.isEditMode && payload.editArea === PassengerInformationRequestEditType.REPRESENTATIVE,
      country: country,
      pd010: pd010,
      phoneCountry: phoneCountry,
      isCloseEnable: res.data?.plan?.contacts?.representative !== undefined,
    };
  }

  /**
   * 登録状況の取得
   * @param isEditMode 編集中か否か（前画面情報）
   * @param editArea 編集中エリア
   * @param isRegistered 代表者情報登録済みか否か
   * @returns 登録状況ラベル
   */
  getRegistrarion(isEditMode: boolean, editArea: number, isRegistered: boolean) {
    if (!isEditMode || editArea === PassengerInformationRequestEditType.REPRESENTATIVE) {
      return RegistrationLabelType.EDITTING;
    } else if (isRegistered) {
      return RegistrationLabelType.REGISTERED;
    }
    return RegistrationLabelType.NOT_REGISTERED;
  }

  /**
   * 電話種別ボックスラジオ選択肢作成
   * @param Pd010DataList M_LIST_DATE_PD_010取得結果
   * @return 画面表示用電話番号種別リスト
   */
  public createPhoneTypeBoxRadio(Pd010DataList: Array<MListData>): Array<{ value: string; disp: string }> {
    //ソート処理,選択肢作成
    return [...Pd010DataList]
      .sort((a: MListData, b: MListData) => a.display_order - b.display_order)
      .map((Pd010) => {
        return {
          value: Pd010.value,
          disp: Pd010.display_content,
        };
      });
  }

  /**
   * フォームコントロールのエラーチェック
   * @param formGroup
   * @param data
   * @param isTached
   * @returns
   */
  public checkFormError(
    formGroup: FormGroup,
    data: PassengerInformationRequestRepresentativeInformationData,
    isTached: boolean = false
  ) {
    let isError = false;
    //メールアドレス相関チェック
    if (data.email !== '' && data.emailConfirm !== '') {
      if (
        checkFormEqual(
          formGroup.controls['representativeEmail'] as FormControl,
          formGroup.controls['representativeConfirmEmail'] as FormControl,
          PassengerInformationRequestRepresentativeInformationConfirmEmailError
        )
      ) {
        isError = true;
      }
    }
    if (
      checkFormGroupValidate(
        formGroup,
        ['representativeEmail', 'representativeConfirmEmail', 'phoneCountryCode', 'phoneNumber'],
        isTached
      )
    ) {
      isError = true;
    }

    return isError;
  }

  /**
   * 登録状況クラスを取得する
   * @param registrarion  登録状況ラベル
   * @returns 登録状況クラス
   */
  getRegistrationLabelClass(registrarion: string) {
    switch (registrarion) {
      case RegistrationLabelType.REGISTERED:
        return 'p-booking-info-mdl__open-state--registered';
      case RegistrationLabelType.NOT_REGISTERED:
        return 'p-booking-info-mdl__open-state--not-registered u-after-image-none';
      case RegistrationLabelType.EDITTING:
        return 'p-booking-info-mdl__open-state--editing';
      default:
        return '';
    }
  }
}
