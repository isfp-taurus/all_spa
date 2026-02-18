import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  ContactRegState,
  EmphType,
  PassengerType,
  PlanReviewOutputPassengerInfosItem,
  PlanReviewOutputRepContacts,
} from '@common/interfaces';
import { CurrentCartStoreService, DiffEmphService, DcsDateService } from '@common/services';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { first } from 'rxjs/operators';
import { PostGetCartResponseDataPlan, PostGetCartResponseDataPreviousPlan } from 'src/sdk-reservation';
import { PlanReviewPassengerInfoService } from './plan-review-passenger-info-service';
import { PlanReviewPassengerIndividualInfoComponent } from './plan-review-passenger-individual-info/plan-review-passenger-individual-info.component';
import { getPaxName, getKeyListData, isEmptyObject, isStringEmpty } from '@common/helper';
import { StaticMsgPipe } from '@lib/pipes';
import { BehaviorSubject } from 'rxjs';
import { PlanReviewPresMasterData } from '../../presenter/plan-review-pres.component.state';

/**
 * 搭乗者情報入力情報
 */
@Component({
  selector: 'asw-passenger-info',
  templateUrl: './plan-review-passenger-info.component.html',
  styleUrls: ['./plan-review-passenger-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewPassengerInfoComponent extends SupportComponent implements DoCheck {
  /** 子コンポーネントアクセス用ViewChildren */
  @ViewChildren(PlanReviewPassengerIndividualInfoComponent)
  private _individualInfoComponents?: QueryList<PlanReviewPassengerIndividualInfoComponent>;

  /** 取得したマスタデータ */
  @Input() set masterData(value: PlanReviewPresMasterData | undefined) {
    this._masterData = value;
    this._isMasterDataSetSbj.next(!!this._masterData);
  }
  get masterData(): PlanReviewPresMasterData | undefined {
    return this._masterData;
  }
  private _masterData?: PlanReviewPresMasterData;

  /** マスタデータset状況判定用Subject */
  private _isMasterDataSetSbj = new BehaviorSubject<boolean>(false);

  /** プラン有効判定 */
  public isPlanValid = false;

  /** 初期表示準備完了EventEmitter */
  @Output() readyToShow = new EventEmitter();

  /** フライト情報送付先SMSが登録済 EventEmitter */
  @Output() allPhoneReg = new EventEmitter<boolean>();

  /** 代表者連絡先情報が登録済 EventEmitter */
  @Output() allRepContactsReg = new EventEmitter<boolean>();

  /** 搭乗者情報が登録済 EventEmitter */
  @Output() allPassengersReg = new EventEmitter<boolean>();

  /** 初期表示準備完了フラグ */
  public isShow = false;

  /** TravelSkyキャリア判定 */
  public isTravelSky = false;

  /** 画面出力用代表者連絡先情報 */
  public outputRepContacts: PlanReviewOutputRepContacts = {};

  /** 画面出力用搭乗者情報 */
  public outputPassengerInfos: PlanReviewOutputPassengerInfosItem[] = [];

  /** FY25: 国内単独旅程フラグ */
  public isDomestic = false;

  /** FY25: DCS移行開始日以降フラグ */
  public isAfterDcs = false;

  /** FY25: 障がい割・アイきっぷ運賃適用フラグ */
  public fareTypeFlags = {
    isDisabilityDiscount: false,
    isIslandTicket: false,
  };

  /** FY25: 他PNRに大人の同行者が存在するか否か */
  public hasAccompaniedInAnotherReservation?: boolean;

  /**
   * 初期表示処理
   */
  constructor(
    private _common: CommonLibService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _passengerInfoService: PlanReviewPassengerInfoService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _diffEmphService: DiffEmphService,
    private _staticMsgPipe: StaticMsgPipe,
    private _dcsDateService: DcsDateService
  ) {
    super(_common);
  }

  init(): void {
    this.subscribeService(
      'PlanReviewPassengerInfo isMasterDataSet',
      this._isMasterDataSetSbj.asObservable().pipe(first((isSet) => !!isSet)),
      () => {
        this.deleteSubscription('PlanReviewPassengerInfo isMasterDataSet');
        this.refresh();
      }
    );
  }

  refresh(): void {
    this.subscribeService(
      'PlanReviewPassengerInfo CurrentCart$',
      this._currentCartStoreService.getCurrentCart$().pipe(first((store) => !store.isPending)),
      (data) => {
        this.deleteSubscription('PlanReviewPassengerInfo CurrentCart$');
        this.isPlanValid = !isEmptyObject(data.data?.plan ?? {});

        const currentCartPlan = data.data?.plan;
        const prevCartPlan = data.data?.previousPlan;
        const displayCartPlan = this.isPlanValid ? currentCartPlan : prevCartPlan;

        this.isTravelSky = false;

        // FY25: 日本国内単独旅程判定
        this.isDomestic = displayCartPlan?.airOffer?.tripType === 'domestic';
        // FY25: DCS移行開始日前後判定
        const departureDate = displayCartPlan?.airOffer?.bounds?.[0]?.originDepartureDateTime ?? '';
        this.isAfterDcs = this._dcsDateService.isAfterDcs(departureDate);

        // FY25: 障がい割運賃の適用有無を判定
        this.fareTypeFlags.isDisabilityDiscount = !!displayCartPlan?.airOffer?.bounds?.some((bound) =>
          bound.flights?.some((segment) => segment.fareInfos?.fareType === 'disabilityDiscount')
        );
        // FY25: アイきっぷ運賃の適用有無を判定
        this.fareTypeFlags.isIslandTicket = !!displayCartPlan?.airOffer?.bounds?.some((bound) =>
          bound.flights?.some((segment) => segment.fareInfos?.fareType === 'islandTicket')
        );
        /** FY25: 他PNRに大人の同行者が存在するか否か */
        this.hasAccompaniedInAnotherReservation =
          displayCartPlan?.travelersSummary?.hasAccompaniedInAnotherReservation ?? undefined;

        // ▼ ▼ 画面出力用代表者連絡先情報を設定 ▼ ▼
        this.createOutputRepContacts(currentCartPlan, prevCartPlan);
        // ▼ ▼ 画面出力用搭乗者情報を設定 ▼ ▼
        this.createOutputPassengerInfos(currentCartPlan, prevCartPlan);

        // 当コンポーネントの初期表示準備完了フラグをtrueにする
        this.isShow = true;
        this.readyToShow.emit();

        this._changeDetectorRef.markForCheck();
      }
    );
  }

  /**
   * ChangeDetection走査時処理
   */
  ngDoCheck(): void {
    this._individualInfoComponents?.forEach((item) => item.refresh());
  }

  /**
   * 画面出力用代表者連絡先作成処理
   * @param currentContacts
   * @param prevContacts
   */
  createOutputRepContacts(
    currentCartPlan?: PostGetCartResponseDataPlan,
    prevCartPlan?: PostGetCartResponseDataPreviousPlan
  ): void {
    const currentRepEmail = currentCartPlan?.contacts?.representative?.emails?.[0];
    const prevRepEmail = prevCartPlan?.contacts?.representative?.emails?.[0];
    const currentRepPhone = currentCartPlan?.contacts?.representative?.phones?.[0];
    const prevRepPhone = prevCartPlan?.contacts?.representative?.phones?.[0];

    // 電話番号種別を取得
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    const phoneTypes = getKeyListData(this.masterData?.listDataAll ?? [], 'PD_010', lang);

    if (!this.isPlanValid) {
      // プラン無効の場合
      const phoneType =
        phoneTypes?.find((phoneType) => phoneType.value === `${prevRepPhone?.type}1`)?.display_content ?? '';
      this.outputRepContacts = {
        email: {
          value: prevRepEmail?.address ?? '',
          type: EmphType.NL,
        },
        phone: {
          value: prevRepPhone
            ? `${phoneType} ${prevRepPhone?.countryPhoneExtension ?? ''}${prevRepPhone?.number ?? ''}`
            : '',
          type: EmphType.NL,
        },
      };
    } else {
      // プラン有効の場合
      const email = this._diffEmphService.getEmphData(currentRepEmail?.address, prevRepEmail?.address);
      const currentPhoneType =
        phoneTypes?.find((phoneType) => phoneType.value === `${currentRepPhone?.type}1`)?.display_content ?? '';
      const currentPhoneValue = currentRepPhone?.number
        ? `${currentPhoneType} ${currentRepPhone?.countryPhoneExtension ?? ''}${currentRepPhone?.number ?? ''}`
        : '';
      const prevPhoneType =
        phoneTypes?.find((phoneType) => phoneType.value === `${prevRepPhone?.type}1`)?.display_content ?? '';
      const prevPhoneValue = prevRepPhone?.number
        ? `${prevPhoneType} ${prevRepPhone?.countryPhoneExtension ?? ''}${prevRepPhone?.number ?? ''}`
        : '';
      const phone = this._diffEmphService.getEmphData(currentPhoneValue, prevPhoneValue);
      this.outputRepContacts = { email: email, phone: phone };
    }

    // 代表者連絡先情報登録済判定
    if (currentRepPhone?.number && currentRepPhone.countryPhoneExtension && currentRepEmail?.address) {
      this.allRepContactsReg.emit(true);
    } else {
      this.allRepContactsReg.emit(false);
    }

    this._changeDetectorRef.markForCheck();
  }

  /**
   * 画面出力用搭乗者情報作成処理
   * @param currentPassengers
   * @param prevPassengers
   */
  createOutputPassengerInfos(
    currentCartPlan?: PostGetCartResponseDataPlan,
    prevCartPlan?: PostGetCartResponseDataPreviousPlan
  ): void {
    const currentPassengers = currentCartPlan?.travelers ?? [];
    const currentContacts = currentCartPlan?.contacts ?? {};
    const prevPassengers = prevCartPlan?.travelers ?? [];
    const prevContacts = prevCartPlan?.contacts ?? {};

    // 表示の基本となる搭乗者情報
    const displayPassengers = this.isPlanValid ? currentPassengers : prevPassengers;

    // 搭乗者毎に新旧情報を比較し、出力用の搭乗者情報を作成
    this.outputPassengerInfos = displayPassengers.map((displayPax, index) => {
      // 当該搭乗者の搭乗者ID
      const paxId = displayPax.id ?? '';
      // 最新の当該搭乗者情報
      const currentPax = currentPassengers.find((pax) => pax.id === paxId) ?? {};
      // 当該搭乗者(最新情報)に対応する旧情報
      const prevPax = prevPassengers.find((pax) => pax.id === paxId) ?? {};
      // 最新の当該搭乗者情報を格納していくMapオブジェクト
      const currentPaxMap = new Map<keyof PlanReviewOutputPassengerInfosItem, any>();
      // 最新化前の当該搭乗者情報を格納していくMapオブジェクト
      const prevPaxMap = new Map<keyof PlanReviewOutputPassengerInfosItem, any>();

      // 搭乗者姓名
      // 変更管理 No.50 第3性別対応
      const currentRegName = getPaxName(currentPax);
      const prevRegName = getPaxName(prevPax);
      currentPaxMap.set(
        'name',
        currentRegName ?? this._staticMsgPipe.transform('label.passenger.n', { '0': index + 1 })
      );
      prevPaxMap.set('name', prevRegName ?? this._staticMsgPipe.transform('label.passenger.n', { '0': index + 1 }));

      // 搭乗者種別
      currentPaxMap.set('passengerTypeCode', currentPax.passengerTypeCode);
      prevPaxMap.set('passengerTypeCode', prevPax.passengerTypeCode);

      // 生年月日
      currentPaxMap.set('dateOfBirth', currentPax.dateOfBirth);
      prevPaxMap.set('dateOfBirth', prevPax.dateOfBirth);

      // 性別
      // 変更管理 No.50 第3性別対応
      const lang = this._common.aswContextStoreService.aswContextData.lang;
      const [currentGenderLabel, prevGenderLabel] = [currentPax.gender, prevPax.gender].map((gender) =>
        this._passengerInfoService.getGenderLabel(gender ?? '', lang, this.masterData?.listDataAll ?? [])
      );
      currentPaxMap.set('gender', currentGenderLabel);
      prevPaxMap.set('gender', prevGenderLabel);

      // パスポート番号登録判定
      if (this.isTravelSky) {
        const isCurrentPassportRegistered = !isStringEmpty(currentPax.regulatoryDetails?.passports?.[0]?.number);
        currentPaxMap.set(
          'isPassportRegistered',
          this._passengerInfoService.stringifyRegStateBool(isCurrentPassportRegistered)
        );
        const isPrevPassportRegistered = !isStringEmpty(prevPax?.regulatoryDetails?.passports?.[0]?.number);
        prevPaxMap.set(
          'isPassportRegistered',
          this._passengerInfoService.stringifyRegStateBool(isPrevPassportRegistered)
        );
      }

      // マイレージプログラム
      const currentCompanyCode = currentCartPlan?.frequentFlyerCards?.[paxId]?.fqtv?.companyCode;
      const prevCompanyCode = prevCartPlan?.frequentFlyerCards?.[paxId]?.fqtv?.companyCode;
      currentPaxMap.set(
        'programName',
        this.masterData?.mileage?.find((program) => program.carrier_code === currentCompanyCode)
          ?.mileage_program_name ?? ''
      );
      prevPaxMap.set(
        'programName',
        this.masterData?.mileage?.find((program) => program.carrier_code === prevCompanyCode)?.mileage_program_name ??
          ''
      );

      // FFP番号
      currentPaxMap.set('programNumber', currentCartPlan?.frequentFlyerCards?.[paxId]?.fqtv?.cardNumber);
      prevPaxMap.set('programNumber', prevCartPlan?.frequentFlyerCards?.[paxId]?.fqtv?.cardNumber);

      // 障がい割旅客種別
      if (this.fareTypeFlags.isDisabilityDiscount) {
        currentPaxMap.set(
          'isDisabilDiscountRegistered',
          this._passengerInfoService.stringifyRegStateBool(!!currentPax.disabilityDiscountInfomation?.disabilityType)
        );
        prevPaxMap.set(
          'isDisabilDiscountRegistered',
          this._passengerInfoService.stringifyRegStateBool(!!prevPax.disabilityDiscountInfomation?.disabilityType)
        );
      }

      // 離島番号
      if (this.fareTypeFlags.isIslandTicket) {
        currentPaxMap.set(
          'isIslandCardRegistered',
          this._passengerInfoService.stringifyRegStateBool(!!currentPax.islandCard?.number)
        );
        prevPaxMap.set(
          'isIslandCardRegistered',
          this._passengerInfoService.stringifyRegStateBool(!!prevPax.islandCard?.number)
        );
      }

      // 搭乗者メールアドレス
      const currentTrsEmail = currentContacts[paxId]?.emails?.[0];
      const prevTrsEmail = prevContacts[paxId]?.emails?.[0];
      currentPaxMap.set('emailAddress', currentTrsEmail?.address);
      prevPaxMap.set('emailAddress', prevTrsEmail?.address);

      // 搭乗者メールアドレス登録状況
      currentPaxMap.set('emailRegState', this._passengerInfoService.getEmailRegState(currentTrsEmail));
      prevPaxMap.set('emailRegState', this._passengerInfoService.getEmailRegState(prevTrsEmail));

      // SMS送付先
      const currentPaxPhone = currentContacts[paxId]?.phones?.[0];
      const prevPaxPhone = prevContacts[paxId]?.phones?.[0];
      currentPaxMap.set(
        'phoneNumber',
        currentPaxPhone?.number ? `${currentPaxPhone?.countryPhoneExtension ?? ''}${currentPaxPhone?.number ?? ''}` : ''
      );
      prevPaxMap.set(
        'phoneNumber',
        prevPaxPhone?.number ? `${prevPaxPhone?.countryPhoneExtension ?? ''}${prevPaxPhone?.number ?? ''}` : ''
      );

      // SMS送付先登録状況
      currentPaxMap.set(
        'phoneRegState',
        this._passengerInfoService.getPhoneRegState(currentPaxPhone, !!currentRegName)
      );
      prevPaxMap.set('phoneRegState', this._passengerInfoService.getPhoneRegState(prevPaxPhone, !!prevRegName));

      // 発着通知連絡先情報
      currentPaxMap.set(
        'isNotifReg',
        this._passengerInfoService.stringifyRegStateBool(
          !!currentContacts[paxId]?.departureArrivalNotifications?.[0]?.isRegisteredEmail
        )
      );
      prevPaxMap.set(
        'isNotifReg',
        this._passengerInfoService.stringifyRegStateBool(
          !!prevContacts[paxId]?.departureArrivalNotifications?.[0]?.isRegisteredEmail
        )
      );

      // サポート情報登録状況
      currentPaxMap.set(
        'isSupportReg',
        this._passengerInfoService.stringifyRegStateBool(
          !!currentCartPlan?.travelerSupports?.[currentPax?.id ?? '']?.isSupportRegistered
        )
      );
      prevPaxMap.set(
        'isSupportReg',
        this._passengerInfoService.stringifyRegStateBool(
          !!prevCartPlan?.travelerSupports?.[prevPax?.id ?? '']?.isSupportRegistered
        )
      );

      // 以上で作成したcurrentPInfo・prevPInfoに基づき、this.outputPassengerInfosの値を設定
      const isNewlyAdded = !isEmptyObject(currentPax) && isEmptyObject(prevPax);
      if (isNewlyAdded) {
        // 新規追加の場合、差分強調表示は行わない
        return Object.fromEntries(Array.from(currentPaxMap).map(([key, value]) => [key, { value, type: EmphType.NL }]));
      }
      const displayPaxMap = this.isPlanValid ? currentPaxMap : prevPaxMap;
      const outputPaxInfo: PlanReviewOutputPassengerInfosItem = Object.fromEntries(
        Array.from(displayPaxMap).map(([key, value]) => {
          const currentValue = currentPaxMap.get(key);
          const prevValue = prevPaxMap.get(key);
          const displayValue = this._diffEmphService.getEmphData(currentValue, prevValue);
          return [key, displayValue];
        })
      );
      return outputPaxInfo;
    });

    // フライト情報送付先SMSが登録済かどうか
    const allPhoneReg = this.outputPassengerInfos.every(
      (pax) =>
        (pax.passengerTypeCode?.value === PassengerType.INF && pax.phoneRegState?.value !== ContactRegState.UNREG) ||
        (pax.passengerTypeCode?.value !== PassengerType.INF &&
          (pax.phoneRegState?.value === ContactRegState.SAME_AS_REP ||
            pax.phoneRegState?.value === ContactRegState.INDIV))
    );
    this.allPhoneReg.emit(allPhoneReg);

    // 搭乗者情報が登録済かどうか
    const allPassengersReg = currentPassengers.every((passenger) => {
      const hasBasicinfo =
        passenger.names?.[0]?.firstName &&
        passenger.names?.[0]?.lastName &&
        passenger.passengerTypeCode &&
        passenger.dateOfBirth &&
        passenger.gender
          ? true
          : false;
      const paxId = passenger.id ?? '';
      const hasEmail =
        currentContacts[paxId]?.emails?.[0].isSameAsRepresentative ||
        (currentContacts[paxId]?.emails?.[0].isSameAsRepresentative !== true &&
          currentContacts[paxId]?.emails?.[0].address);
      const hasPhone =
        (currentContacts[paxId]?.phones?.[0].number && currentContacts[paxId]?.phones?.[0].countryPhoneExtension) ||
        (!currentContacts[paxId]?.phones?.[0].number && !currentContacts[paxId]?.phones?.[0].countryPhoneExtension);
      // INFかどうか
      const isNotInf = this._passengerInfoService.getIsAdditionalInfo(passenger.passengerTypeCode ?? '');

      return (isNotInf && hasBasicinfo && hasEmail && hasPhone) || (!isNotInf && hasBasicinfo);
    });
    this.allPassengersReg.emit(allPassengersReg);

    this._changeDetectorRef.markForCheck();
  }

  reload(): void {}
  destroy(): void {}
}
