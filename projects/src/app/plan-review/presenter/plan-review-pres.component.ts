import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { CurrentCartModel, CurrentPlanModel, FareConditionsState } from '@common/store';
import { AgreementAreaParts } from '@lib/components';
import { SupportComponent } from '@lib/components/support-class';
import {
  CommonLibService,
  DialogDisplayService,
  ErrorsHandlerService,
  ModalService,
  PageLoadingService,
} from '@lib/services';
import { first, fromEvent, Subject, throttleTime } from 'rxjs';
import {
  CurrentCartStoreService,
  CurrentPlanStoreService,
  PlanReviewStoreService,
  DcsDateService,
  LocalDateService,
  OrdersReservationAvailabilityStoreService,
} from '@common/services';
import { PlanReviewPassengerInfoComponent } from '../sub-components/plan-review-passenger-info/plan-review-passenger-info.component';
import { PlanReviewPassengerNumberAreaComponent } from '../sub-components/plan-review-passenger-number-area/plan-review-passenger-number-area.component';
import { PlanReviewPaymentSummaryComponent } from '../sub-components/plan-review-payment-summary/plan-review-payment-summary.component';
import { PlanReviewServicePartsComponent } from '../sub-components/plan-review-service-parts/plan-review-service-parts.component';
import { PlanReviewTripSummaryComponent } from '../sub-components/plan-review-trip-summary/plan-review-trip-summary.component';
import { PlanReviewBaggageRulesComponent } from '../sub-components/plan-review-baggage-rules/plan-review-baggage-rules.component';
import { PlanReviewFareConditionsComponent } from '../sub-components/plan-review-fare-conditions/plan-review-fare-conditions.component';
import { ANA_BIZ_OFFICE_CODE, APF_OFFICE_CODE, PlanReviewPlanHeaderAreaData } from '@common/interfaces';
import { isPC } from '@lib/helpers';
import { passengerInformationRequestPayloadParts } from '@app/id-modal/passenger-information-request/passenger-information-request.payload.state';
import { isEmptyObject } from '@common/helper';
import {
  PlanReviewPresMasterData,
  PlanReviewWaitedComponentId,
  planReviewWaitedComponentList,
} from './plan-review-pres.component.state';
import { PlanReviewPresService } from './plan-review-pres.service';
import { PassengerInformationRequestPassengerInfoService } from '@app/id-modal/passenger-information-request/passenger-information/passenger-information.service';
import { PassengerInformationRequestService } from '@app/id-modal/passenger-information-request/passenger-information-request.service';
import { DialogClickType } from '@lib/interfaces';
import { LoginStatusType } from '@lib/interfaces/login-status';
import { PageType } from '@lib/interfaces';

/**
 * R01P040 プラン確認画面
 */
@Component({
  selector: 'asw-plan-review-pres',
  templateUrl: './plan-review-pres.component.html',
  styleUrls: ['./plan-review-pres.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewPresComponent extends SupportComponent {
  /** メソッド呼び出し用ViewChild */
  @ViewChild(PlanReviewPassengerInfoComponent)
  private _passengerInfoComponent?: PlanReviewPassengerInfoComponent;
  @ViewChild(PlanReviewPassengerNumberAreaComponent)
  private _passengerNumberAreaComponent?: PlanReviewPassengerNumberAreaComponent;
  @ViewChild(PlanReviewPaymentSummaryComponent)
  private _paymentSummaryComponent?: PlanReviewPaymentSummaryComponent;
  @ViewChild(PlanReviewServicePartsComponent)
  private _servicePartComponent?: PlanReviewServicePartsComponent;
  @ViewChild(PlanReviewTripSummaryComponent)
  private _tripSummaryComponent?: PlanReviewTripSummaryComponent;
  @ViewChild(PlanReviewBaggageRulesComponent)
  private _baggageRulesComponent?: PlanReviewBaggageRulesComponent;
  @ViewChild(PlanReviewFareConditionsComponent)
  private _fareConditionsComponent?: PlanReviewFareConditionsComponent;

  /* --- 画面制御用変数 --- */

  /**
   * 表示準備が整った子(/親)コンポーネントの識別子をnextするSubject
   */
  private _readyToShowSbj = new Subject<PlanReviewWaitedComponentId>();

  /** プラン保存済み判定 */
  public isUnsaved = true;

  /** 差分強調表示有無 */
  public isPlanChanged = false;

  /** プラン有効判定 */
  public isPlanValid = false;

  /** 搭乗者情報入力済み判定 */
  public isTravelersInfoRegistered = false;

  /** airportキャッシュマスターデータ */
  public airport = [];

  /** 操作オフィスのPOS */
  public officePos = '';

  /** フライト情報送付先SMSが登録済かどうか */
  public allPhoneReg = false;

  /** 代表者連絡先情報が登録済かどうか */
  public allRepContactsReg = false;

  /** すべての搭乗者が登録済かどうか */
  public allPassengersReg = false;

  /** APFログインフラグ */
  public isApfLogin = false;

  /** anaBizログインフラグ */
  public isAnaBizLogin = false;

  /** ログイン状態チェックフラグ */
  public isLoggedIn = false;
  /** メールアドレス空値チェックフラグ */
  public isMailAddressEmpty = false;

  /**
   * 同意文言エリア設定項目
   */
  public agreementAreaParams: AgreementAreaParts = {
    isModal: false,
  };

  /** 同意文言エリアにてカナダサイト用の同意がなされているか否か */
  public isCaAgreementChecked = false;

  /** すべての搭乗者について、姓名が入力されているか */
  public isAllPaxInfoRegistered = false;

  /** 搭乗者情報入力モーダル表示ボタン活性フラグ */
  public isAbleToOpenPassengerInfoRequest = true;

  /** 遷移先分岐モーダル表示ボタン活性フラグ */
  public isAbleToGoToNextPage = false;

  /* --- 画面出力用情報 --- */

  /** 操作中カート情報 */
  public currentCart: CurrentCartModel = {};

  /** 操作中プラン情報 */
  public currentPlan: CurrentPlanModel = {};

  /** 積算マイル */
  public accrualMiles = 0;

  /** 現在時刻 */
  public currentDate = '';

  /** 遷移元が空席照会結果画面であるか否か */
  public isOutputCriteo = false;

  /* --- 他コンポーネント受け渡し情報 --- */

  /** キャッシュ */
  public masterData?: PlanReviewPresMasterData;

  /** プランヘッダエリア */
  public planHeaderAreaData: PlanReviewPlanHeaderAreaData = {};

  /** 運賃ルール・手荷物情報取得APIレスポンス */
  @Input() fareConditionsResponse?: FareConditionsState;

  /** 特典予約フラグ */
  @Input() isAwardBooking?: boolean = false;

  /** criteoに連携する支払総額 */
  public criteoTotalAmount?: number;

  /** DCS移行開始日以降フラグ */
  public isAfterDcs = true;

  /* --- 表示制御用変数 --- */

  /** 初期表示可否判定 */
  public isReadyToShow = false;

  /** 画面サイズ判定(PC) */
  public isPc = isPC();

  /** 画面サイズ比較用変数(PC) */
  public isPcPre = this.isPc;

  /** 画面サイズチェック用関数 */
  private _resizeEvent = () => {
    this.isPcPre = this.isPc;
    this.isPc = isPC();
    if (this.isPcPre !== this.isPc) {
      this._changeDetectorRef.markForCheck();
    }
  };

  // 予約可能フラグ
  private isReservationAvailable: boolean = false;

  /**
   * コンストラクタ
   */
  constructor(
    private _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _modalService: ModalService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _currentPlanStoreService: CurrentPlanStoreService,
    private _planReviewStoreService: PlanReviewStoreService,
    private _presService: PlanReviewPresService,
    private _dcsDateService: DcsDateService,
    private _pageLoadingService: PageLoadingService,
    private _dialogSvc: DialogDisplayService,
    private _localDateService: LocalDateService,
    private _passengerInfoService: PassengerInformationRequestPassengerInfoService,
    private _service: PassengerInformationRequestService,
    private _ordersReservationAvailabilityStoreService: OrdersReservationAvailabilityStoreService,
    private _errorsHandlerSvc: ErrorsHandlerService
  ) {
    super(_common);
  }

  /**
   * 初期表示処理
   */
  init(): void {
    // 画面サイズチェック
    this.subscribeService('SubHeaderResize', fromEvent(window, 'resize').pipe(throttleTime(500)), this._resizeEvent);

    // 操作オフィスコード
    const pointOfSaleId = this._common.aswContextStoreService.aswContextData.pointOfSaleId;
    if (pointOfSaleId === APF_OFFICE_CODE) {
      this.isApfLogin = true;
    } else if (pointOfSaleId === ANA_BIZ_OFFICE_CODE) {
      this.isAnaBizLogin = true;
    }

    // 全コンポーネントの表示準備が整い次第、テンプレート表示フラグをtrueにする
    this.showThispage();

    this._service.getCacheMasterAirport((airport) => {
      this.airport = airport;
      // 以下、contコンポーネントでのオフィスチェック・変更完了後（＝カート・プラン確定後）に実行
      this.subscribeService(
        'PlanReviewPresComponent isRightOffice',
        this._planReviewStoreService.getPlanReview$().pipe(first((store) => !!store.isRightOffice)),
        () => {
          this.deleteSubscription('PlanReviewPresComponent isRightOffice');

          // キャッシュを取得
          this.subscribeService(
            'PlanReviewPresComponent getMasterData',
            this._presService.getMasterData$(),
            (data: PlanReviewPresMasterData) => {
              this.deleteSubscription('PlanReviewPresComponent getMasterData');
              this.masterData = data;

              // 各種値を設定
              this.setValues();
            }
          );
        }
      );
    });

    // 予約可否判断APIの結果
    this._ordersReservationAvailabilityStoreService.isDataReady$().subscribe((isReady) => {
      if (isReady) {
        this.isReservationAvailable =
          this._ordersReservationAvailabilityStoreService.ordersReservationAvailabilityData.model?.data
            ?.isAvailableToReserve ?? false;
        this.isAbleToGoToNextPage = this.getIsAbleToGoToNextPage();

        if (this.isReservationAvailable) {
          this._errorsHandlerSvc.clearRetryableError();
        } else if (this.isAwardBooking) {
          this._errorsHandlerSvc.setRetryableError(PageType.PAGE, {
            errorMsgId: 'EA033',
          });
        }
      }
    });
  }

  /**
   * 各種変数の値設定処理
   * @param isRefresh
   */
  setValues(isRefresh?: boolean): void {
    this.subscribeService(
      'PlanReviewTripSummary CurrentCart$',
      this._currentCartStoreService.getCurrentCart$().pipe(first((store) => !store.isPending)),
      (data) => {
        this.deleteSubscription('PlanReviewTripSummary CurrentCart$');

        this.currentCart = data;
        this.isPlanValid = !isEmptyObject(this.currentCart.data?.plan ?? {});
        const displayCartPlan = this.isPlanValid
          ? this._currentCartStoreService.CurrentCartData.data?.plan
          : this._currentCartStoreService.CurrentCartData.data?.previousPlan;

        const previousPage = this._planReviewStoreService.PlanReviewData.previousPage ?? '';
        this.currentPlan = this._currentPlanStoreService.CurrentPlanData;
        this.isUnsaved = this.currentPlan.isUnsaved ?? true;

        // ログイン済み判定（リアルログインor仮ログインの場合true）
        const loginStatus = this._common.aswContextStoreService.aswContextData.loginStatus;
        this.isLoggedIn = loginStatus === LoginStatusType.REAL_LOGIN || loginStatus === LoginStatusType.TEMPORARY_LOGIN;

        // 代表者、搭乗者メールアドレスチェック
        // 幼児はチェックしない
        const contacts = this._currentCartStoreService.CurrentCartData.data?.plan?.contacts ?? {};
        const travelers = this._currentCartStoreService.CurrentCartData.data?.plan?.travelers ?? [];
        const nonInfantTravelerIds = travelers.filter((t) => t.passengerTypeCode !== 'INF').map((t) => t.id as string);

        const isRepresentativeEmailEmpty = !contacts.representative?.emails?.[0]?.address?.trim();
        const isAnyTravelerEmailEmpty = nonInfantTravelerIds.some((travelerId) => {
          const contact = contacts[travelerId];
          return !contact?.emails?.[0]?.address?.trim();
        });
        this.isMailAddressEmpty = isRepresentativeEmailEmpty || isAnyTravelerEmailEmpty;

        this.isTravelersInfoRegistered = !!displayCartPlan?.travelersSummary?.isRegistered;
        this.isAllPaxInfoRegistered = this._presService.isAllPaxInfoRegistered(displayCartPlan?.travelers ?? []);

        this.officePos = this._common.aswContextStoreService.aswContextData.posCountryCode;
        this.isAbleToGoToNextPage = this.getIsAbleToGoToNextPage();

        // FY25: DCS移行開始日以降判定
        const departureDate = displayCartPlan?.airOffer?.bounds?.[0]?.originDepartureDateTime ?? '';
        this.isAfterDcs = this._dcsDateService.isAfterDcs(departureDate);

        // 現在日時（当画面表示時刻）を取得しstoreに格納
        this.currentDate = this._localDateService.getCurrentDateStr();
        this._planReviewStoreService.updatePlanReview({ currentDate: this.currentDate });

        this.planHeaderAreaData = {
          planName: this.currentPlan.planName ?? '',
          createdOn: this.currentPlan.creationDate ?? '',
          saveUntil: this.currentPlan.planExpiryDate ?? '',
        };

        // 子コンポーネントを更新
        if (isRefresh) {
          this.refreshChd();
        }

        // 搭乗者情報完全未入力の場合、搭乗者情報入力情報パーツの表示準備完了フラグをtrueにする
        if (!this.isTravelersInfoRegistered) {
          this._readyToShowSbj.next(PlanReviewWaitedComponentId.PASSENGER_INFO);
        }

        this._readyToShowSbj.next(PlanReviewWaitedComponentId.PRES);
        this._changeDetectorRef.markForCheck();
      }
    );
  }

  destroy(): void {}

  reload(): void {}

  /**
   * 画面情報更新処理
   */
  refresh(): void {
    this.endRefresh();
    this.setValues(true);
  }

  /**
   * 子コンポーネント更新処理
   */
  refreshChd(): void {
    this._passengerInfoComponent?.refresh();
    this._passengerNumberAreaComponent?.refresh();
    this._paymentSummaryComponent?.refresh();
    this._servicePartComponent?.refresh();
    this._tripSummaryComponent?.refresh();
    this._baggageRulesComponent?.refresh();
    this._fareConditionsComponent?.refresh();
  }

  /**
   * readyToShowSbjに値を流す処理
   * @param value
   */
  notifyReadyToShow(value: PlanReviewWaitedComponentId): void {
    this._readyToShowSbj.next(value);
  }

  /**
   * PlanReviewStoreの初期表示用フラグを監視して
   * すべてtrueになると画面描画する処理
   */
  showThispage(): void {
    this._presService.waitTillAllReadyToShow(this._readyToShowSbj, planReviewWaitedComponentList, () => {
      // 差分強調表示フラグの値取得＆リセット
      this._presService.resetIsPlanChanged((wasPlanChanged) => {
        this.isPlanChanged = wasPlanChanged;
        this.isReadyToShow = true;
        this._planReviewStoreService.updatePlanReview({ isAllReadyToShow: true });
        this._changeDetectorRef.detectChanges();
      });
    });
  }

  /**
   * 画面更新完了処理
   */
  endRefresh(): void {
    this._presService.waitTillAllReadyToShow(this._readyToShowSbj, planReviewWaitedComponentList, () => {
      // 差分強調表示フラグの値取得＆リセット
      this._presService.resetIsPlanChanged((wasPlanChanged) => {
        this.isPlanChanged = wasPlanChanged;
        this._pageLoadingService.endLoading();
        this._changeDetectorRef.detectChanges();
      });
    });
  }

  /**
   * 搭乗者情報入力モーダル表示処理
   */
  openPassengerInformationInputModal(): void {
    const loginStatus = this._common.aswContextStoreService.aswContextData.loginStatus;
    // 未ログインの場合のみMSG0532を表示
    if (loginStatus === LoginStatusType.NOT_LOGIN) {
      //PageInitService.endInitを使用しているため、endLoadingは入れない。
      this._pageLoadingService.startLoading();
      const parts = passengerInformationRequestPayloadParts();
      parts.payload = {
        isEditMode: false,
        editArea: -1, // 代表者連絡先
      };
      this._modalService.showSubPageModal(parts);
    } else {
      // ログイン済みの場合はそのままモーダルを開く
      this._pageLoadingService.startLoading();
      const parts = passengerInformationRequestPayloadParts();
      parts.payload = {
        isEditMode: false,
        editArea: -1, // 代表者連絡先
      };
      this._modalService.showSubPageModal(parts);
    }
  }

  setAllPhoneReg(allPhoneReg: boolean): void {
    this.allPhoneReg = allPhoneReg;
    this._changeDetectorRef.markForCheck();
  }
  setAllRepContactsReg(allRepContactsReg: boolean): void {
    this.allRepContactsReg = allRepContactsReg;
    this._changeDetectorRef.markForCheck();
  }
  setAllPassengersReg(allPassengersReg: boolean): void {
    this.allPassengersReg = allPassengersReg;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * 次画面遷移可否判定処理
   */
  getIsAbleToGoToNextPage(): boolean {
    const displayCartPlan = this.isPlanValid
      ? this._currentCartStoreService.CurrentCartData.data?.plan
      : this._currentCartStoreService.CurrentCartData.data?.previousPlan;
    // すべての搭乗者について、姓名が入力されているか
    const isAllPaxInfoRegistered = this._presService.isAllPaxInfoRegistered(displayCartPlan?.travelers ?? []);

    if (this.isAwardBooking) {
      return isAllPaxInfoRegistered && this.isReservationAvailable && this.isPlanValid;
    }
    return (
      isAllPaxInfoRegistered &&
      this.isPlanValid &&
      (this.officePos !== 'CA' || this.isCaAgreementChecked) &&
      !(this.isLoggedIn && this.isMailAddressEmpty)
    );
  }

  /**
   * 搭乗者情報入力モーダル表示フラグ
   */
  get showContinueToBookBtn(): boolean {
    // NHグループ運航の米国着便を含まない場合
    // カート情報に搭乗者情報入力済み判定が含まれない
    return !(this.isTravelersInfoRegistered && this.allRepContactsReg && this.allPassengersReg);
  }
}
