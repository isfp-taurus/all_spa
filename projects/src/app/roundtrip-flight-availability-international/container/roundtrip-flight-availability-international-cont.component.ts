import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { SupportPageComponent } from '@lib/components/support-class';
import {
  AswMasterService,
  CommonLibService,
  ErrorsHandlerService,
  PageInitService,
  PageLoadingService,
  TealiumService,
  LoggerDatadogService,
} from '@lib/services';
import {
  AirCalendar,
  AirOfferInfo,
  FFHeader,
  PresenterProps,
  RoundTrip,
  SelectTSFFInfo,
  ShowProps,
  TSFFInfo,
  TSList,
  UnitPrice,
  onewayOrMulticity,
} from '../presenter/roundtrip-flight-availability-international-pres.state';
import { AirCalendar as AirCalenderInfo, AirCalendarPrices } from '@common/interfaces/shopping/roundtrip-owd';
import {
  RoundtripOwdRequestItinerariesInner,
  Type5ItinerariesInner,
  RoundtripOwdRequestItinerariesInnerConnection,
  RoundtripOwdResponseDataAirOfferMapping,
  RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInner,
  RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInner,
  RoundtripOwdResponseDataAirOffers,
  RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInnerTravelSolutionIdInner,
  RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInnerTravelSolutionIdInnerFareFamilyCodeInner,
  RoundtripOwdResponseDataRoundtripBoundsInnerFareFamiliesInner,
} from 'src/sdk-search';
import { RoundtripFlightAvailabilityInternationalStoreService } from '@common/services/shopping/roundtrip-flight-availability-international-store/roundtrip-flight-availability-international-store.service';
import {
  AirOffer,
  AirOffers,
  Data,
  DepartureFareFamily,
  DepartureTravelSolution,
  FareFamilies,
  ReturnDate,
  ReturnFareFamily,
  ReturnTravelSolution,
  RoundtripBounds,
  RoundtripOwdRequest,
} from '@common/interfaces/shopping/roundtrip-owd';
import { SearchFlightState, TripType } from '@common/store/search-flight/search-flight.state';
import {
  AlertMessageItem,
  AlertType,
  ErrorType,
  NotRetryableErrorModel,
  PageType,
  RetryableError,
} from '@lib/interfaces';
import { AmountFormatPipe, DateFormatPipe, StaticMsgPipe } from '@lib/pipes';
import { Observable } from 'rxjs';
import { DeliveryInformationState, SearchFlightStateDetails } from '@common/store';
import { RoundtripOwdService } from '@common/services/roundtrip-owd/roundtrip-owd-store.service';
import { RoundtripFlightAvailabilityInternationalState } from '@common/store/roundtripFlightAvailabilityInternational';
import { RoundtripFlightAvailabilityInternationalService } from '@common/services/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.service';
import { fareCabinClass } from '@common/interfaces/shopping/fareOption';
import {
  BoundFilterItem,
  CalendarInfo,
  CodeFilterItem,
  FareTypeItem,
  FilterConditionData,
  FilterConditionOutput,
  FilterItem,
  MListData,
  RangeValue,
  ReservationFunctionIdType,
  ReservationPageIdType,
  AirOfferUpgradeInfo,
  BoundUpgradeInfo,
  FlightUpgradeInfo,
  CabinClassUpgradeInfo,
  FareTypeOption,
} from '@common/interfaces';
import { RoundtripFlightAvailabilityInternationalContService } from './roundtrip-flight-availability-international-cont.service';
import { Bound } from 'src/sdk-search';
import { Router } from '@angular/router';
import { RoutesResRoutes } from '@conf/routes.config';
import { MASTER_TABLE } from '@conf/asw-master.config';
import { Bound as BoundDetail } from 'src/sdk-search';
import { FilterConditionModalService } from '@common/components/shopping/filter-condition/filter-condition-modal.service';
import { RoundtripOwdState } from '@common/store/roundtrip-owd';
import {
  AirCalendarCell,
  CheapestCalendarData,
  CheapestCalendarModalOutput,
} from '../sub-components/cheapest-calendar-matrix/cheapest-calendar-matrix-modal.state';
import {
  CurrentCartStoreService,
  DeliveryInformationStoreService,
  GetUnavailablePaymentByOfficeCodeService,
  LocalDateService,
  SearchFlightHistoryStoreService,
  SearchFlightStoreService,
  ShoppingLibService,
} from '@common/services';
import { CheapestCalendarMatrixModalService } from '../sub-components/cheapest-calendar-matrix/cheapest-calendar-matrix-modal.service';
import { RoundtripOwdDisplayService } from '@common/services/roundtrip-owd-display/roundtrip-owd-display-store.service';
import { UpgradeAvailabilityRequest } from '@common/interfaces/shopping/upgrade-availability/upgradeavailabilityRequest';
import { UpgradeAvailabilityState } from '@common/store/upgrade-availability';
import { UpgradeAvailabilityService } from '@common/services/upgrade-availability/upgrade-availability-store.service';
import { FlightPlanService } from '@common/components/shopping/flight-plan/flight-plan.service';
import { SortCondition, SortConditionOutput } from '@common/components/shopping/sort-condition/sort-condition.state';
import { SortConditionModalService } from '@common/components/shopping/sort-condition/sort-condition-modal.service';
import { FareFamilySelectorModalComponent } from '@common/components/shopping/fare-family-selector/fare-family-selector-modal.component';
import { FareFamilySelectorOutput } from '@common/components/shopping/fare-family-selector/fare-family-selector-modal.state';
import { FareFamilySelectorModalService } from '@common/components/shopping/fare-family-selector/fare-family-selector-modal.service';
import { CommonSliderComponent } from '@common/components/shopping/common-slider/common-slider.component';
import { HistoryFavoriteApiService } from '@common/services/shopping/api/history-favorite-api/history-favorite-api.service';
import { SearchFlightConditionForRequestService } from '@common/services/store/search-flight/search-flight-condition-for-request-store/search-flight-condition-for-request-store.service';
import { SearchFlightConditionForRequestState } from '@common/store/search-flight-condition-for-request';
import { CabinClassSelectorOutput } from '@common/components/shopping/cabin-class-selector/cabin-class-selector.state';
import { CabinClassSelectorModalService } from '@common/components/shopping/cabin-class-selector/cabin-class-selector-modal.service';
import { FareTypeModalOutput } from '@common/components';
import { FareTypeSelectorModalService } from '@common/components/shopping/search-flight/fare-type-selector/fare-type-selector-modal.service';
import { AirportI18nSearchForAirportCodeCache } from '@common/services/shopping/shopping-lib/shopping-lib.state';
import { Title } from '@angular/platform-browser';
import { FF_PRIORITY_CODE_CACHE } from '@common/interfaces/common/m-ff-priority-code.interface';
import { DeliverySearchInformationStoreService } from '@common/services/store/delivery-search-information-store/delivery-search-information-store.service';
import { upgradeavailabilityResponsesData } from '@common/interfaces/shopping/upgrade-availability/upgradeavailabilityResponsesData';
import {
  dynamicSubject,
  updateDynamicSubjectGetHistoryFavorite,
  updateDynamicSubjectRoundtripOwd,
  updateDynamicSubjectUpgradeAvailability,
  clearDynamicSubject,
} from './roundtrip-flight-availability-international-cont.state';
import { RoundtripFlightAvailabilityInternationalPresService } from '../presenter/roundtrip-flight-availability-international-pres.service';
import { CabinCacheList } from '@common/interfaces/shopping/cabinClass/cabinClassList';
import { CabinCache } from '@common/interfaces/shopping/cabinClass/cabinClass';
import { AppConstants } from '@conf/app.constants';
import { ErrorCodeConstants } from '@conf/app.constants';

@Component({
  selector: 'asw-roundtrip-flight-availability-international-cont',
  templateUrl: './roundtrip-flight-availability-international-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    RoundtripFlightAvailabilityInternationalStoreService,
    DateFormatPipe,
    AmountFormatPipe,
    CommonSliderComponent,
    SearchFlightConditionForRequestService,
    HistoryFavoriteApiService,
  ],
})
export class RoundtripFlightAvailabilityInternationalContComponent extends SupportPageComponent {
  public appConstants = AppConstants;

  /* 機能ID : R01 新規予約 Prime booking */
  public functionId: string = ReservationFunctionIdType.PRIME_BOOKING;
  /* 画面ID : P030 往復空席照会結果(国際) Roundtrip flight availability (international) */
  public pageId: string = ReservationPageIdType.ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL;
  /** 遷移元画面 : 機能ID + 画面ID */
  private previousId: string = '';

  /** 往復指定日空席照会(OWD)用API レスポンスからairOfferMappingをMapオブジェクト化 */
  /** 往路TSID⇒往路FFID⇒復路TSID⇒復路TSID⇒AirOfferIDのマップ */
  private airOfferMappingMap!: Map<string, any>;
  /** airOfferIdをキーとする、レスポンスから取得したairOfferのマップ */
  private airOfferMap!: Map<string, AirOffer>;

  /** 往復空席照会結果(国際)画面のStore */
  private _R01P030Store: RoundtripFlightAvailabilityInternationalState = {};

  /** Presenterに渡す画面描画用データ */
  public props?: PresenterProps;

  /** 往復指定日空席照会(OWD)用レスポンス */
  private _owd: RoundtripOwdState = { requestIds: [] };
  /** 往路FF順序マップ */
  private ffOrderOutboundMap: Map<string, number> = new Map();
  /** 復路FF順序マップ */
  private ffOrderReturnTripMap: Map<string, number> = new Map();
  /** FF名称マップ */
  private ffNameMap: Map<string, string> = new Map();
  /** CFFリスト */
  private _cffList: fareCabinClass = {};
  /** フィルタ条件入力情報 */
  public filterConditionInfo: FilterConditionData = {};
  /** フィルタ条件入力初期情報 */
  public initiaFfilterConditionInfo: FilterConditionData = {};
  /** 空席照会時アップグレード可否照会マップ(空席照会時アップグレード可否照会レスポンス.data)*/
  private _upgradeAvailabilityMap: upgradeavailabilityResponsesData = {};
  // 空席照会時アップグレード可否照会レスポンス
  private _upgradeAvailability: UpgradeAvailabilityState = { requestIds: [] };
  /** フィルター適用ボタン押下時に使用するTSリスト */
  private travelSolutionList: BoundDetail[] = [];
  /** TSIDリスト */
  public travelSolutionIdList: string[] = [];
  /** 選択乗継回数リスト */
  public selectedStopsList: number[] = [];
  /** 選択出発空港リスト */
  public selectedDepartureAirportsList: string[] = [];
  /** 選択到着空港リスト */
  public selectedArrivalAirportsList: string[] = [];
  /** NHグループ運航フィルタ要否 */
  public isNeedNHGroupOperatingFilter = false;
  /** 選択他社運航キャリアリスト */
  public selectedCompetitorAirLineList: FareTypeItem[] = [];
  /** 選択機種リスト */
  public selectedAirCraftList: string[] = [];
  /** 表示AirOffer */
  private showAirOffer: AirOffer = {};

  // 選択AirOfferId
  private selectAirOfferId: string = '';
  // 選択AirOffer情報
  private selectAirOfferInfo: AirOffer = {};
  // 選択中往路TSID
  private selectOutboundTSID: string = '';
  // 選択中往路FF
  private selectOutboundFF: string = '';
  // 選択中復路TSID
  private selectReturnTripTSID: string = '';
  // 選択中復路FF
  private selectReturnTripFF: string = '';
  /** 往路無料預け入れ手荷物表示有無 */
  private isOutBoundFreeCheckedBaggage: boolean = false;
  /** 復路無料預け入れ手荷物表示有無 */
  private isReturnTripFreeCheckedBaggage: boolean = false;
  /** フッター表示非表示（初期処理用） */
  private isShowFooter: boolean = false;

  // 選択中TS別FF情報
  private _selectTSFFInfo: SelectTSFFInfo = {};
  // presenter受け渡しオブジェクト
  private showProps: ShowProps = {};

  // 7日間カレンダーモーダルの表示非表示
  public isOpenCalendarMatrixModal: boolean = true;

  /** 画面表示用データ(バックアップ) */
  public backupDisplayData?: RoundtripOwdState;

  /** tealium実施制御 */
  private exeTealium: boolean = true;

  /** 空席照会日時 */
  private searchedDateTime?: string;

  /** ヘッダー色判定用リスト */
  private _tripTypeList: string[] = [];

  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _pageInitService: PageInitService,
    private _aswMasterSvc: AswMasterService,
    private _sortConditionModalService: SortConditionModalService,
    private _cheapestCalendarMatrixModalService: CheapestCalendarMatrixModalService,
    private _filterConditionModalService: FilterConditionModalService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _shoppingLibService: ShoppingLibService,
    private _amountFormatPipe: AmountFormatPipe,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _roundtripFlightAvailabilityInternationalService: RoundtripFlightAvailabilityInternationalService,
    private _roundtripOwdService: RoundtripOwdService, // 往復指定日空席照会(OWD)用API(store)：roundtrip-owd
    private _roundtripOwdDisplayService: RoundtripOwdDisplayService,
    private _roundtripFlightAvailabilityInternationalPresService: RoundtripFlightAvailabilityInternationalPresService,
    private _roundtripFlightAvailabilityService: RoundtripFlightAvailabilityInternationalContService,
    private _deliveryInformationStoreService: DeliveryInformationStoreService,
    private _upgradeAvailabilityService: UpgradeAvailabilityService, // 空席照会時アップグレード可否照会API(store)： upgrade-availability
    private _flightPlanService: FlightPlanService,
    private _searchFlightHistoryStoreService: SearchFlightHistoryStoreService,
    private _fareFamilySelectorModalService: FareFamilySelectorModalService,
    private _cabinClassSelectorModalService: CabinClassSelectorModalService,
    private _commonSliderComponent: CommonSliderComponent,
    private _searchFlightConditionForRequestService: SearchFlightConditionForRequestService,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _fareTypeSelectorModalService: FareTypeSelectorModalService,
    private _staticMsgPipe: StaticMsgPipe,
    private _currentCartStoreService: CurrentCartStoreService,
    private _titleService: Title,
    private _deliverySearchInformationStoreService: DeliverySearchInformationStoreService,
    private _tealiumSvc: TealiumService,
    private _localDateService: LocalDateService,
    private _pageLoadingService: PageLoadingService,
    private _loggerSvc: LoggerDatadogService,
    private _getUnavailablePaymentByOfficeCodeService: GetUnavailablePaymentByOfficeCodeService
  ) {
    super(_common, _pageInitService);
    this.autoInitEnd = false;

    // 遷移元画面として画面情報.機能ID+画面情報.画面IDを保持する。
    this.previousId =
      (this._common.aswCommonStoreService.aswCommonData.functionId ?? '') +
      (this._common.aswCommonStoreService.aswCommonData.pageId ?? '');

    // 画面情報に以下の内容を設定する。
    this._common.aswCommonStoreService.updateAswCommon({
      functionId: this.functionId,
      pageId: this.pageId,
      subFunctionId: '',
      subPageId: '',
      isEnabledLogin: false,
    });

    // タイトルの設定
    this.forkJoinService(
      'SearchFlightContComponentTitleGet',
      [this._staticMsgPipe.get('label.searchResult.title'), this._staticMsgPipe.get('label.aswPageTitle')],
      ([str1, str2]) => {
        this._titleService.setTitle(str1 + str2);
      }
    );

    // キャッシュ情報の取得
    this.subscribeService(
      'RoundtripFlightAvailabilityInternationalContComponent getCache',
      this._aswMasterSvc.load(
        [
          MASTER_TABLE.M_FF_PRIORITY_CODE_I18N,
          MASTER_TABLE.AIRLINE_I18NJOINALL,
          MASTER_TABLE.EQUIPMENT_I18NJOIN_PK,
          MASTER_TABLE.AIRCRAFTCABIN_I18NJOIN_BYPK,
          MASTER_TABLE.AIRPORT_I18N_SEARCH_FOR_AIRPORT_CODE,
          MASTER_TABLE.AIRPORT_I18N_JOIN_BY_AIRPORT_CODE,
          MASTER_TABLE.LISTDATA_ALL,
          MASTER_TABLE.M_LIST_DATA_930,
          MASTER_TABLE.M_LIST_DATA_940,
          MASTER_TABLE.OFFICE_ALL,
          MASTER_TABLE.AIRPORT_ALL,
          MASTER_TABLE.SERVICE_CONTENTS,
        ],
        true
      ),
      () => {
        // 名称の簡略化
        this._R01P030Store =
          this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData;

        // 当画面の各種状態(true：可能/表示、false：不可/非表示)の保持
        this.setDisplayStore();

        // 遷移元画面=”R01P040”かつプラン確認画面にて保持された戻る操作実施が存在する場合、以下の処理を行う。
        if (
          this.previousId === ReservationFunctionIdType.PRIME_BOOKING + ReservationPageIdType.PLAN_REVIEW &&
          this._deliveryInformationStoreService.deliveryInformationData.planReviewInformation?.isBackBtnClicked
        ) {
          // 保持された戻る操作実施をクリアし初期表示処理を終了する。
          // 戻る操作実施がstoreなら、そこをクリア
          const deliveryInformationData: DeliveryInformationState = {
            planReviewInformation: {
              isBackBtnClicked: false,
            },
          };
          this._deliveryInformationStoreService.updateDeliveryInformation(deliveryInformationData);

          // APIは実行せずに、画面表示処理
          this._owd = this._roundtripOwdService.roundtripOwdData;
          this.initializeAirOfferMap();
          this.vacantSeatInquiryProcessing(false, false, undefined, true);
          return;
        }

        // 空席照会処理
        this.vacantSeatInquiryProcessing(true, false, this._R01P030Store.roundtripOwdRequest, true);
      }
    );
  }

  /**
   * 空席照会処理
   * @param roundtripOwdRequest APIのリクエスト
   * @param apiExecutionFlag API実行フラグ : true=APIを実行する
   * @param useDisplayData 画面表示用データの使用 : true=画面表示用データの使用  false=APIデータの使用
   * @param isNotLoading ローディング処理をするかどうか
   */
  public async vacantSeatInquiryProcessing(
    apiExecutionFlag: boolean,
    useDisplayData: boolean,
    roundtripOwdRequest?: RoundtripOwdRequest,
    isNotLoading?: boolean
  ) {
    if (roundtripOwdRequest === undefined) {
      roundtripOwdRequest = {
        /** 検索条件情報 */
        itineraries: [],
        /** 搭乗者数 */
        travelers: {
          ADT: 0,
          B15: 0,
          CHD: 0,
          INF: 0,
        },
        /** 運賃情報 */
        fare: {
          isMixedCabin: true,
        },
      };
    }

    // システム日付取得(G03-519)の空港現地時間取得処理を、引数にユーザ共通.操作オフィスコードを指定して呼び出し、取得した値を空席照会日時として保持する。
    // 補足1: 空港現地時間取得処理を、引数にユーザ共通.操作オフィスコードを指定して呼び出し、の処理は呼び出し先内部で行っている。呼び出し先はその結果をフォーマットする。
    // 補足2: 空席照会日時はyyyy-MM-ddTHH:mm:ss形式で保持(引数未指定の場合にyyyy-MM-ddTHH:mm:ssにフォーマット)
    this.searchedDateTime = this._localDateService.getCurrentDateStr();

    if (!this._common.isNotLogin()) {
      // 以下の処理にて、履歴・お気に入り・アップグレードに関する処理を行う。
      // 履歴登録処理
      // 履歴登録要否=trueの場合、
      if (this._R01P030Store.isHistoryRegistration) {
        // 以下の項目を基に履歴登録APIを呼び出す。呼び出し時、エラーハンドリング回避フラグ(commonIgnoreErrorFlg)としてtureを指定する。
        this.historyRegister();
      }
      // ［ここまで、履歴登録処理］
    }
    // API実行フラグ : true=APIを実行する
    if (apiExecutionFlag) {
      // 往復指定日空席照会(OWD)用APIの呼び出し
      if (!(await this._getAPI_OWD(roundtripOwdRequest, isNotLoading))) {
        // 動的文言判定用情報
        this._pageInitService.endInit(null);
        // エラーの場合処理終了
        return;
      }

      //　往復指定日空席照会(OWD)用レスポンス.warnings[0].code="WBAZ000198"(検索結果なし)
      if (!this.isNotTransitionScreenWithWarning()) {
        // 動的文言判定用情報
        this._pageInitService.endInit(null);
        return;
      }
    } else {
      // APIを実行しない場合: ローディング表示しない
      this.autoInitEnd = true;
    }

    // 検索結果フッタ表示状態を以下の処理を実施したのちにfalseに設定する
    if (this._R01P030Store.isRoundtrip) {
      // 往復かどうか=trueの場合、保持している選択AirOfferId、選択AirOffer情報、選択中往路TSID、選択中往路FF、選択中復路TSID、選択中復路FFをクリアする
      this.selectAirOfferId = '';
      this.selectAirOfferInfo = {};
      this.selectOutboundTSID = '';
      this.selectOutboundFF = '';
      this.selectReturnTripTSID = '';
      this.selectReturnTripFF = '';
      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
        selectAirOfferId: this.selectAirOfferId,
        selectAirOfferInfo: this.selectAirOfferInfo,
        selectOutboundTSID: this.selectOutboundTSID,
        selectOutboundFF: this.selectOutboundFF,
        selectReturnTripTSID: this.selectReturnTripTSID,
        selectReturnTripFF: this.selectReturnTripFF,
      });
      this._R01P030Store =
        this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData;
      this.isShowFooter = false;
    } else {
      // 往復かどうか=falseの場合、保持している選択AirOfferId、選択AirOffer情報、選択中往路TSID、選択中往路FFをクリアする。
      this.selectAirOfferId = '';
      this.selectAirOfferInfo = {};
      this.selectOutboundTSID = '';
      this.selectOutboundFF = '';
      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
        selectAirOfferId: this.selectAirOfferId,
        selectAirOfferInfo: this.selectAirOfferInfo,
        selectOutboundTSID: this.selectOutboundTSID,
        selectOutboundFF: this.selectOutboundFF,
      });
      this._R01P030Store =
        this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData;
      this.isShowFooter = false;
    }

    // 検索条件変更有無=trueの場合、以下の処理を行う。
    if (this._R01P030Store?.isChangeSearchData) {
      const setData = {
        // リクエスト用検索条件に、検索条件を設定する
        roundtripOwdRequest: roundtripOwdRequest,
        // ソート条件に、CPDランクソートを設定する
        sortTerms: 'recommendedOrder',
      };

      if (this.props) {
        this.props.sortConditionData.selectedSortCondition = SortCondition.CPD_RANK;
      }

      // Store更新
      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(setData);
      this._R01P030Store =
        this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData;

      // 画面表示用データ(バックアップ)が存在する場合、画面表示用データ(バックアップ)を削除する
      this.backupDisplayData = undefined;
    }

    // 当画面で利用する画面表示用データとして、往復指定日空席照会(OWD)用レスポンス.dataを複製した情報を保持する。
    if (useDisplayData) {
      this._owd = this._roundtripOwdDisplayService.roundtripOwdDisplayData;
    }

    // 画面表示用データ.airOffersが存在する場合、指定日検索結果有無にtrueを設定する。
    if (this._owd.data?.airOffers) {
      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
        isSearchResultOfSpecifiedDate: true,
      });
      this._R01P030Store =
        this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData;
    }

    // 選択中のカレンダー情報を作成
    this.createCalendarInfo();

    // 指定日検索結果有無=trueの場合、FF順序マップ・FF名称マップ作成処理と選択AirOffer情報作成処理を行う
    if (this._R01P030Store.isSearchResultOfSpecifiedDate) {
      this.createFfOrderMapAndFfNameMap();
      this.createSelectedAirOfferInfo();
    }

    // 選択中のCFFリスト作成処理
    this.createSelectedCffList();

    // 指定日検索結果有無=trueの場合、無料預け入れ手荷物表示判定処理と検索結果リストプロモーション適用凡例表示切り替え処理とアップグレード情報リスト作成とフィルタ条件入力情報作成を行う
    if (this._R01P030Store.isSearchResultOfSpecifiedDate) {
      this.determineFreeCheckedBaggageDisplay();
      this.determinePromotionApplied();
      this.createUpgradeInfoList();
      this.createFilterConditionInfo();
    }

    // 画面表示内容に従って、画面表示
    this.showDisplay();

    if (this.exeTealium) {
      const displayInfoJson = this._roundtripFlightAvailabilityInternationalPresService.createDisplayInfoJSON(
        this._R01P030Store.roundtripOwdRequest?.itineraries ?? [],
        this._R01P030Store.searchFlight,
        this._R01P030Store.searchResultItineraryType === 'domestic' ? true : false,
        false
      );

      // 画面情報JSON（Tealium連携用基本情報JSON設定）
      this._tealiumSvc.setTealiumPageOutput(displayInfoJson);
      this.exeTealium = false;
    }

    // 動的文言判定用情報
    this._pageInitService.endInit(dynamicSubject.asObservable());

    // 指定日検索結果有無=trueの場合、FF選択モーダルのFF選択ボタン押下時処理の[TS・FFごとのAirOfferに応じた表示内容更新処理]を行う。
    if (this._R01P030Store.isSearchResultOfSpecifiedDate) {
      this.airOfferOfTsFfDisplayUpdate();
    }

    // ワーニング表示
    this.showWarning();

    // エラーメッセージを表示（プラン作成失敗判定）
    this.showErrorPlanCreationFailed();

    // 指定日検索結果有無=true、かつ画面表示用データ.isAllSoldOut=false(予約可能なairOfferが含まれる)の場合、「選択可能な便」のcheckedにtrueを設定
    // フィルタ条件モーダル適用ボタン押下時の処理を行う
    if (this._R01P030Store.isSearchResultOfSpecifiedDate && this._owd.data?.isAllSoldOut === false) {
      this.filterConditionInfo.isAvailable = true;
      await this.pushFilterConditionModalBtn(this.filterConditionInfo);
      // 選択可能な便のみでフィルタ実施し全便非表示となった場合
      if (this._owd.data.airOffers && Object.keys(this._owd.data.airOffers).length === 0) {
        this.filterConditionInfo.isAvailable = false;
        await this.pushFilterConditionModalBtn(this.filterConditionInfo);
      }
      this._pageLoadingService.endLoading();
    }

    // 履歴用検索条件.追加処理情報.前後日付表示オプション=true(前後3日間の運賃を比較する)の場合、
    // マトリクス形式7日間カレンダー表示ボタン押下処理実行
    let cheapestCalendarData = this.createAirCalendarModalData();
    let calendarDataLength = cheapestCalendarData.airCalendarCellList?.length ?? 0;
    if (calendarDataLength > 0) {
      if (
        this._R01P030Store.searchFlight?.displayInformation.compareFaresNearbyDates &&
        this._R01P030Store.isRoundtrip &&
        this.isOpenCalendarMatrixModal
      ) {
        this.isOpenCalendarMatrixModal = false;
        this._cheapestCalendarMatrixModalService.openModal(cheapestCalendarData);
      }
    }

    // ユーザ共通.ログインステータス≠未ログインの場合、
    // 以下の処理にて、履歴・お気に入り・アップグレードに関する処理を行う。
    this.historyAndFavoriteAndUpgradeHandler();
  }

  reload(): void {}

  init() {
    /** フィルター条件モーダルが値を返した時の処理 */
    const filterConditionDataObservable = this._filterConditionModalService.asObservableSubject();
    this.subscribeService(
      'RoundtripFlightAvailabilityInternationalContComponent-filterConditionmodal',
      filterConditionDataObservable,
      async (data: FilterConditionOutput) => {
        // フィルター条件適用処理
        if (data.data) {
          await this.pushFilterConditionModalBtn(data.data);
          this._pageLoadingService.endLoading();
        }
      }
    );

    // マトリクス形式7日間カレンダーモーダルが値を返した時の処理を定義
    this.subscribeService(
      'RoundtripFlightAvailabilityInternationalContComponent-cheapestCalendarmodal',
      this._cheapestCalendarMatrixModalService.asObservableSubject(),
      (data: CheapestCalendarModalOutput) => {
        //  次へボタン押下時処理※マトリクス形式7日間カレンダーモーダル画面
        //  テンポラリの検索条件として、リクエスト用検索条件を設定する。
        let tmpRequestSearchCondition = JSON.parse(JSON.stringify(this._R01P030Store.roundtripOwdRequest));

        // テンポラリの検索条件.往路出発日に、選択中のカレンダー情報.往路出発日を設定する。
        if (
          tmpRequestSearchCondition &&
          tmpRequestSearchCondition.itineraries &&
          tmpRequestSearchCondition.itineraries[0]
        ) {
          tmpRequestSearchCondition.itineraries[0].departureDate = data.departureDate;
        }
        // テンポラリの検索条件.復路出発日に、選択中のカレンダー情報.復路出発日を設定する。
        if (
          tmpRequestSearchCondition &&
          tmpRequestSearchCondition.itineraries &&
          tmpRequestSearchCondition.itineraries[1]
        ) {
          tmpRequestSearchCondition.itineraries[1].departureDate = data.returnDate;
        }

        // 以下の通り引数を設定し、初期表示処理の[空席照会処理]を行う。
        let setData: RoundtripFlightAvailabilityInternationalState = {};
        // 検索条件変更有無に、true
        setData.isChangeSearchData = true;
        // 履歴登録要否に、false
        setData.isHistoryRegistration = false;
        // 最安運賃を選択する必要があるかどうかに、true
        setData.isSelectLowestFare = true;
        setData.currentOutboundDate = tmpRequestSearchCondition.itineraries[0].departureDate;
        setData.currentReturnTripDate = tmpRequestSearchCondition.itineraries[1].departureDate;
        // 検索条件に、テンポラリの検索条件
        this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(setData);

        // 空席照会処理
        if (tmpRequestSearchCondition) {
          this.vacantSeatInquiryProcessing(true, false, tmpRequestSearchCondition);
        }
      }
    );

    // ソート条件モーダルから条件を選択する処理
    const sortConditionModalObservable$: Observable<SortConditionOutput> =
      this._sortConditionModalService.asObservableSubject();
    this.subscribeService(
      'RoundtripFlightAvailabilityInternationalContComponent-sortconditionmodal',
      sortConditionModalObservable$,
      (data: SortConditionOutput) => {
        this.updateSortCondition(data.selectedSortCondition);
        this._owd = this._sortConditionModalService.updateTravelSolutionsBySortCondition(
          data.selectedSortCondition,
          this._owd
        );
        this.updateSortTerms(data.selectedSortCondition);
        this.showDisplay();
        this.airOfferOfTsFfDisplayUpdate();
      }
    );

    // FF選択モーダルが値を返した時の処理を定義
    const fareFamilySelectorModalObservable$: Observable<FareFamilySelectorOutput> =
      this._fareFamilySelectorModalService.asObservableSubject();
    this.subscribeService(
      'RoundtripFlightAvailabilityInternationalContComponent-farefamilymodal',
      fareFamilySelectorModalObservable$,
      (data: FareFamilySelectorOutput) => {
        this.updateFareFamilyInTsList(data.boundIndex, data.travelSolutionId, data.fareFamilyCode);
      }
    );

    // キャビンモーダルが値を返した時の処理を定義
    const cabinClassModalObservable$: Observable<CabinClassSelectorOutput> =
      this._cabinClassSelectorModalService.asObservableSubject();
    this.subscribeService(
      'RoundtripFlightAvailabilityInternationalContComponent-cabinClassModal',
      cabinClassModalObservable$,
      (data: CabinClassSelectorOutput) => {
        this.updateSelectedCabinClass(data.cabinClassType);
      }
    );

    // 運賃オプションが値を返したときの処理を定義
    const fareTypeOptionModalObservable$: Observable<FareTypeModalOutput> =
      this._fareTypeSelectorModalService.asObservableSubject();
    this.subscribeService(
      'SearchResultFunctionComponent-fareTypeOption',
      fareTypeOptionModalObservable$,
      (data: FareTypeModalOutput) => {
        this.updateSelectedFareOptionType(data.selectedFareType ? data.selectedFareType : '');
      }
    );

    // P030Storeの取得
    this.subscribeService(
      'getStoreInfo',
      this._roundtripFlightAvailabilityInternationalService.getRoundtripFlightAvailabilityInternationalObservable(),
      (data) => {
        this._R01P030Store = data;
      }
    );
  }

  destroy(): void {
    this.deleteSubscription('SearchResultFunctionComponent-fareTypeOption');
    this.deleteSubscription('RoundtripFlightAvailabilityInternationalContComponent-filterConditionmodal');
    this.deleteSubscription('RoundtripFlightAvailabilityInternationalContComponent-cheapestCalendarmodal');
    this.deleteSubscription('RoundtripFlightAvailabilityInternationalContComponent-sortconditionmodal');
    this.deleteSubscription('RoundtripFlightAvailabilityInternationalContComponent-farefamilymodal');
    this.deleteSubscription('RoundtripFlightAvailabilityInternationalContComponent-cabinClassModal');
    clearDynamicSubject();
  }

  /**
   * 当画面の各種状態を保持する。
   * 当画面の入力要素に関連する値について、以下の内容で初期化を行う。
   * 当画面で保持する情報について、以下の内容を保持する。
   */
  private setDisplayStore() {
    // リクエスト用検索条件
    let r01P010SearchData = this._searchFlightConditionForRequestService.getData();
    // 履歴用検索条件
    let searchFlight = this._searchFlightStoreService.getData();
    let p040Only = false;

    // 遷移元画面=”R01P040”、かつリクエスト用検索条件が存在しない場合
    if (
      this.previousId === ReservationFunctionIdType.PRIME_BOOKING + ReservationPageIdType.PLAN_REVIEW &&
      !r01P010SearchData?.request?.itineraries?.[0]?.departureDate
    ) {
      // ［カート情報からの検索条件復元処理］を行い、返却された値をリクエスト用検索条件に設定する
      r01P010SearchData = this._roundtripFlightAvailabilityService.convertData(
        this._currentCartStoreService.CurrentCartData
      );
      p040Only = true;
    }

    // 遷移元画面="R01P040"かつ履歴用検索条件が存在しない場合
    if (
      this.previousId === ReservationFunctionIdType.PRIME_BOOKING + ReservationPageIdType.PLAN_REVIEW &&
      !searchFlight?.roundTrip?.departureDate
    ) {
      searchFlight =
        this._roundtripFlightAvailabilityService.createHistoryConditionFromRequestCondition(r01P010SearchData);

      p040Only = true;
    }

    // 画面状態、内容の保持
    let setData: RoundtripFlightAvailabilityInternationalState = {};
    // 画面の各種状態(true：可能/表示、false：不可/非表示)について、以下の内容を保持する。
    /** 指定日検索結果有無 */
    setData.isSearchResultOfSpecifiedDate = false;
    /** お気に入り登録済み */
    setData.isRegisteredFavorite = false;
    /** 往路選択済み状態 */
    setData.isSelectedOutbound = false;
    /** 復路選択済み状態 */
    setData.isSelectedReturnTrip = false;

    // 画面の入力要素に関連する値について、以下の内容で初期化を行う。
    /** ソート条件 : CPDランクソート */
    setData.sortTerms = 'recommendedOrder';
    /** 運賃オプション : 履歴用検索条件.運賃情報.運賃オプション */
    setData.fareOption = searchFlight.fare.fareOptionType;
    /** キャビンクラス : 履歴用検索条件.運賃情報.キャビンクラス */
    setData.cabinClass = searchFlight.fare.cabinClass;

    // 画面で保持する情報について、以下の内容を保持する。
    /** 往復かどうか : リクエスト用検索条件.itinerariesの要素数=2の場合true、上記以外の場合false */
    setData.isRoundtrip = (r01P010SearchData.request.itineraries ?? []).length === 2 ? true : false;
    /** 現在の往路日付 : リクエスト用検索条件.itineraries[0].departureDate*/
    setData.currentOutboundDate = r01P010SearchData.request.itineraries?.[0].departureDate ?? '';
    /** 現在の復路日付 : リクエスト用検索条件.itineraries[1].departureDate ※往復かどうか=trueの場合のみ設定 */
    setData.currentReturnTripDate = setData.isRoundtrip
      ? r01P010SearchData.request.itineraries?.[1].departureDate ?? ''
      : '';
    /** 検索結果旅程種別 : フライト検索画面(R01-P010)の[日本国内単独旅程判定処理]を行い、結果がtrueの場合は“domestic”、falseの場合は“international”を設定する。*/
    setData.searchResultItineraryType = this.checkOnlyJapan(this._searchFlightStoreService.getData())
      ? 'domestic'
      : 'international';
    /** 最安額連携有無 */
    setData.isLowestPriceCoordination = this._isLowestPriceCoordination(this._searchFlightStoreService.getData());
    /** 検索結果リスト往路プロモーション適用凡例結果有無 */
    setData.isOutboundPromotionApplied = false;
    /** 検索結果リスト復路プロモーション適用凡例結果有無 */
    setData.isReturnTripPromotionApplied = false;
    /** 選択中TS・FF情報往路プロモーション適用凡例結果有無 */
    setData.isSelectedOutboundPromotionApplied = false;
    /** 選択中TS・FF情報復路プロモーション適用凡例結果有無 */
    setData.isSelectedReturnTripPromotionApplied = false;
    /** Commercial Fare Family区分 */
    setData.commercialFareFamilyClassification = setData.searchResultItineraryType === 'international' ? '0' : '1';
    /** 運賃変更案内コンテンツID */
    setData.fareChangeInfoContentID = '';
    /** 復路選択解除案内コンテンツID */
    setData.returnTripDeselectionInfoContentID = '';
    setData.selectedTsChangeInfoContentID = '';
    setData.displayTs0InfoContentID = '';
    /** 検索条件変更有無 */
    setData.isChangeSearchData = false;
    /** 最安運賃を選択する必要があるかどうか */
    setData.isSelectLowestFare = setData.isLowestPriceCoordination;

    /** 履歴用検索条件 */
    setData.searchFlight = searchFlight;
    /** リクエスト用検索条件 */
    setData.roundtripOwdRequest = this.createRoundtripOwdRequest(p040Only, r01P010SearchData);
    /** 履歴登録要否 */
    setData.isHistoryRegistration =
      this.previousId === ReservationFunctionIdType.PRIME_BOOKING + ReservationPageIdType.PLAN_REVIEW ? false : true;

    // 保持された検索フォームより遷移が存在する場合、保持された検索フォームより遷移をクリアする。
    if (r01P010SearchData.request.searchFormFlg) {
      let request = structuredClone(r01P010SearchData.request);
      request.searchFormFlg = false;
      r01P010SearchData = {
        ...r01P010SearchData!,
        request,
      };
      this._searchFlightConditionForRequestService.updateStore(r01P010SearchData);
    }

    // ユーザ共通.POS国コード="MX"(メキシコ)の場合
    if (this._common.aswContextStoreService.aswContextData.posCountryCode === 'MX') {
      // プロパティ(カテゴリ：”serviceRequest”)からキー=”couch.availableAcvList”に紐づく値を
      // ”|”(パイプ)区切りで分割したリストをカウチ対象便ACVコードリストとする。
      let couchAcvCodeList = this._shoppingLibService.getcouchAcvCodeList();
      setData.couchAcvCodeList = couchAcvCodeList;
    }

    // Store更新
    this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(setData);
    this._R01P030Store =
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData;
  }

  private createRoundtripOwdRequest(
    p040Only: boolean,
    data: SearchFlightConditionForRequestState
  ): RoundtripOwdRequest {
    if (p040Only) {
      return {
        /** 検索条件情報 */
        itineraries: data.request.itineraries,
        /** 搭乗者数 */
        travelers: data.request.travelers,
        /** 運賃情報 */
        fare: data.request.fare,
        /** 別予約同行者有無 */
        hasAccompaniedInAnotherReservation: data.request.hasAccompaniedInAnotherReservation,
        /** プロモーション情報 */
        promotion: data.request.promotion,
        /** 追加処理情報 */
        searchPreferences: data?.request?.searchPreferences,
      };
    } else {
      return {
        /** 検索条件情報 */
        itineraries: this._searchFlightConditionForRequestService.getData().request.itineraries,
        /** 搭乗者数 */
        travelers: this._searchFlightConditionForRequestService.getData().request.travelers,
        /** 運賃情報 */
        fare: this._searchFlightConditionForRequestService.getData().request.fare,
        /** 別予約同行者有無 */
        hasAccompaniedInAnotherReservation:
          this._searchFlightConditionForRequestService.getData().request.hasAccompaniedInAnotherReservation,
        /** プロモーション情報 */
        promotion: this._searchFlightConditionForRequestService.getData().request.promotion,
        /** 追加処理情報 */
        searchPreferences: this._searchFlightConditionForRequestService.getData()?.request?.searchPreferences,
      };
    }
  }

  /**
   * 最安額連携有無
   */
  private _isLowestPriceCoordination(searchFlight?: SearchFlightStateDetails): boolean {
    // 以下の条件を全て満たす場合、true
    let lowestPrice = searchFlight?.lowestPrice;
    // 履歴用検索条件.最安額連携情報.通貨コードが存在する
    // 履歴用検索条件.最安額連携情報.最安支払総額、または履歴用検索条件.最安額連携情報.最安運賃額(税抜)が存在する
    if (lowestPrice?.displayedCurrency && (lowestPrice?.displayedTotalPrice || lowestPrice?.displayedBasePrice)) {
      return true;
    }

    // 上記以外の場合false
    return false;
  }

  /**
   * 往復指定日空席照会(OWD)用APIの呼び出し
   * @param isNotLoading ローディング処理をするかどうか
   */
  private _getAPI_OWD(roundtripOwdRequest: RoundtripOwdRequest, isNotLoading?: boolean): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      let result = true;
      if (!isNotLoading) {
        this._pageLoadingService.startLoading();
      }
      // 往復指定日空席照会(OWD)用API実行
      this._roundtripOwdService.setRoundtripOwdFromApi(roundtripOwdRequest);
      // ヘッダー色判定用リスト作成
      this.getTripTypeList(roundtripOwdRequest);

      // APIエラー情報を事前にクリア
      this._common.apiErrorResponseService.clearApiErrorResponse();

      //　往復指定日空席照会(OWD)用API呼び出し、受信後処理
      this.subscribeService(
        '_roundtripOwdData subscribeService',
        this._roundtripOwdService.getRoundtripOwdObservable(),
        (response) => {
          this.deleteSubscription('_roundtripOwdData subscribeService');
          if (response.isPending === false) {
            if (!isNotLoading) {
              this._pageLoadingService.endLoading();
            }
            if (response.isFailure && this._common.apiError) {
              /** エラーが発生した往復指定日空席照会(OWD)用レスポンスが通知された場合に実施する処理 */
              this.isErrorOwdResponse();
              resolve(false);
            } else {
              // 正常系
              this._owd = response;
              if (response.data) {
                // 検索したリクエストをStoreに更新。画面表示とリクエストの整合性をとるため
                this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
                  roundtripOwdRequest: roundtripOwdRequest,
                });
                let searchRequestCondition = this._searchFlightConditionForRequestService.getData();
                let request = structuredClone(searchRequestCondition.request);
                request = {
                  ...request,
                  itineraries: roundtripOwdRequest.itineraries,
                  travelers: roundtripOwdRequest.travelers,
                  fare: roundtripOwdRequest.fare,
                  searchPreferences: roundtripOwdRequest.searchPreferences,
                  hasAccompaniedInAnotherReservation: roundtripOwdRequest.hasAccompaniedInAnotherReservation,
                  promotion: roundtripOwdRequest.promotion,
                };
                searchRequestCondition = {
                  ...searchRequestCondition,
                  request,
                };
                this._searchFlightConditionForRequestService.updateStore(searchRequestCondition);
                // レスポンスを画面表示用のStoreに保存
                this._roundtripOwdDisplayService.updateRoundtripOwdDisplay(response);
                if (response.data.airOffers) {
                  // airOfferMapとairOfferMappingMapのMapオブジェクト作成
                  this.initializeAirOfferMap();
                }
                result = true;
                // 動的文言判定用情報 往復指定日空席照会（OWD）用API応答
                updateDynamicSubjectRoundtripOwd(response);
              }
              resolve(true);
            }
          }
        }
      );
    });
  }

  /**
   * エラーが発生した往復指定日空席照会(OWD)用レスポンスが通知された場合に実施する処理
   */
  private isErrorOwdResponse() {
    const errorCode = this._common.apiError?.errors?.[0].code;
    //　"EBAZ000174"(過去日で再検索)の場合
    if (errorCode === ErrorCodeConstants.ERROR_CODES.EBAZ000174) {
      const errorInfo: RetryableError = {
        errorMsgId: 'E1059',
        apiErrorCode: ErrorCodeConstants.ERROR_CODES.EBAZ000174,
      };
      // フライト検索画面に継続可能エラーを設定
      this._deliverySearchInformationStoreService.updateDeliverySearchInformation({ errorInfo: errorInfo });
      // フライト検索画面に遷移後、空席照会処理を終了する。
      this._router.navigateByUrl(RoutesResRoutes.FLIGHT_SEARCH);
      return;
    }

    //　"EBAZ000824"(過去日で再検索)の場合
    if (errorCode === ErrorCodeConstants.ERROR_CODES.EBAZ000824) {
      const errorInfo: RetryableError = {
        errorMsgId: 'E1830',
        apiErrorCode: ErrorCodeConstants.ERROR_CODES.EBAZ000824,
      };
      // フライト検索画面に継続可能エラーを設定
      this._deliverySearchInformationStoreService.updateDeliverySearchInformation({ errorInfo: errorInfo });
      // フライト検索画面に遷移後、空席照会処理を終了する。
      this._router.navigateByUrl(RoutesResRoutes.FLIGHT_SEARCH);
      return;
    }

    // 上記以外のエラーが発生した往復指定日空席照会(OWD)用レスポンスが通知された場合、継続不可能エラータイプ＝”system”(システムエラー)にて継続不可能なエラー情報を指定し、空席照会処理を終了する。※当処理はstoreを介して行う。
    // 継続不可能エラータイプ＝”system”(システムエラー)にて継続不可能なエラー情報を指定
    const errorInfo: NotRetryableErrorModel = {
      errorType: ErrorType.SYSTEM,
      apiErrorCode: this._common.apiError?.errors?.[0].code,
    };
    this._errorsHandlerSvc.setNotRetryableError(errorInfo);
    // 遷移元画面に遷移後、空席照会処理を終了する
  }

  /**
   * 往復指定日空席照会(OWD)用レスポンス.warnings[0].code="WBAZ000198"(検索結果なし)の場合に実施する処理
   * 前画面に戻る処理が実行される場合、false
   */
  private isNotTransitionScreenWithWarning(): boolean {
    // 往復指定日空席照会(OWD)用レスポンス.warnings[0].code="WBAZ000198"(検索結果なし)の場合、以下の処理を行う。
    if (this._owd.warnings?.[0].code === ErrorCodeConstants.ERROR_CODES.WBAZ000198) {
      // プラン確認画面にて保持されたプラン作成失敗判定が存在する場合、エラーメッセージID＝”E1060”にて継続可能なエラー情報を前画面引継ぎ情報.空席照会エラー情報に保持指定し
      if (
        this._deliveryInformationStoreService.deliveryInformationData.planReviewInformation?.isPlanDuplicationFailed
      ) {
        const errorInfo: RetryableError = {
          errorMsgId: 'E1060',
        };
        this._deliverySearchInformationStoreService.updateDeliverySearchInformation({ errorInfo: errorInfo });
        // フライト検索画面に遷移後、空席照会処理を終了する。
        this._router.navigateByUrl(RoutesResRoutes.FLIGHT_SEARCH);
        return false;
      }

      // 検索条件変更有無=falseの場合、エラーメッセージID＝”E0228”にて継続可能なエラー情報を前画面引継ぎ情報.空席照会エラー情報に保持指定し
      if (!this._R01P030Store?.isChangeSearchData) {
        const errorInfo: RetryableError = {
          errorMsgId: 'E0228',
          apiErrorCode: ErrorCodeConstants.ERROR_CODES.WBAZ000198,
        };
        this._deliverySearchInformationStoreService.updateDeliverySearchInformation({ errorInfo: errorInfo });
        // 遷移元画面に遷移後、空席照会処理を終了する。
        if (this.previousId === ReservationFunctionIdType.PRIME_BOOKING + ReservationPageIdType.PLAN_REVIEW) {
          this._router.navigateByUrl(RoutesResRoutes.PLAN_REVIEW);
        } else {
          this._router.navigateByUrl(RoutesResRoutes.FLIGHT_SEARCH);
        }
        return false;
      }

      // 検索条件変更有無=trueの場合、エラーメッセージID＝”E0228”にて継続可能なエラー情報を指定し、
      if (this._R01P030Store?.isChangeSearchData) {
        const pageType: PageType = PageType.PAGE;
        const errorInfo: RetryableError = {
          errorMsgId: 'E0228',
          apiErrorCode: ErrorCodeConstants.ERROR_CODES.WBAZ000198,
        };
        // 当画面でエラーメッセージを表示し、空席照会処理を終了する。
        this._errorsHandlerSvc.setRetryableError(pageType, errorInfo);
        return true;
      }
    }
    return true;
  }

  /**
   * 選択中のカレンダー情報を作成
   */
  private createCalendarInfo() {
    //  往復かどうか=trueの場合、以下の内容で選択中のカレンダー情報を作成する。
    if (this._R01P030Store?.isRoundtrip) {
      const selectedCalendarInfo: RoundtripFlightAvailabilityInternationalState = {
        calendarInfo: this.calendarInfoList(),
      };
      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(
        selectedCalendarInfo
      );
    }
  }

  /**
   * 選択中のカレンダー情報
   * @returns 選択中のカレンダー情報
   */
  private calendarInfoList(): CalendarInfo {
    const calendarInfoList: CalendarInfo = {
      /** 往路出発日 */
      outwardDepartureDate: this._R01P030Store.roundtripOwdRequest?.itineraries[0].departureDate,
      /** 復路出発日 */
      returnTripDepartureDate: this._R01P030Store.roundtripOwdRequest?.itineraries[1].departureDate,
      /** マトリクス用カレンダー日付 */
      matrixCalendarDate: this._owd.data?.airCalendarPeriod,
      /** マトリクス用カレンダー */
      matrixCalendar: this._owd.data?.airCalender as AirCalenderInfo | undefined,
    };
    return calendarInfoList;
  }

  /**
   * FF順序マップ・FF名称マップ作成
   */
  private createFfOrderMapAndFfNameMap() {
    // 画面表示用データ.roundTripBounds[0].fareFamiliesについて、それぞれ以下の処理を行う。
    this._owd.data?.roundtripBounds?.[0].fareFamilies?.forEach((fareFamily, index) => {
      // 往路FF順序マップに、以下の内容を追加する。
      // キー: 当該fareFamilies.fareFamilyCode
      // 値: 当該fareFamiliesの繰り返しインデックス+1
      const ffCode = fareFamily.fareFamilyCode ?? '';
      this.ffOrderOutboundMap.set(ffCode, index + 1);

      // FF名称マップに、以下の内容を追加する。
      this.addFFName(fareFamily, ffCode);
    });

    // 往復かどうか=trueの場合、以下の処理を行う。
    if (this._R01P030Store?.isRoundtrip) {
      // 画面表示用データ.roundTripBounds[1].fareFamiliesについて、それぞれ以下の処理を行う。
      this._owd.data?.roundtripBounds?.[1]?.fareFamilies?.forEach((fareFamily, index) => {
        // 復路FF順序マップに、以下の内容を追加する。
        // キー: 当該fareFamilies.fareFamilyCode
        // 値: 当該fareFamiliesの繰り返しインデックス+1
        const ffCode = fareFamily.fareFamilyCode ?? '';
        this.ffOrderReturnTripMap.set(ffCode, index + 1);

        // FF名称マップに当該FareFamily.fareFamilyCodeがキーとして存在しない場合、FF名称マップに、以下の内容を追加する。
        if (!this.ffNameMap.get(ffCode)) {
          this.addFFName(fareFamily, ffCode);
        }
      });
    }
  }

  /**
   * FF名称マップにFF名称を追加
   * @param fareFamily
   * @param ffCode
   */
  private addFFName(fareFamily: FareFamilies, ffCode: string) {
    // 当該fareFamilies.fareFamilyWithService.priorityCode=FFPriorityCodeとなるASWDB(マスタ)のFFPriorityCodeテーブル.FareFamily名称をFF名称マップに追加する
    let ffPriorityCodeI18n: Array<FF_PRIORITY_CODE_CACHE> =
      this._aswMasterSvc.aswMaster[MASTER_TABLE.M_FF_PRIORITY_CODE_I18N.key];
    let ffPriorityCode = ffPriorityCodeI18n.find(
      (element) => element.key === `m_ff_priority_code_i18n_${fareFamily.fareFamilyWithService?.priorityCode}`
    );
    if (ffPriorityCode?.value !== undefined) {
      this.ffNameMap.set(ffCode, ffPriorityCode.value);
    }
  }

  /**
   * 初期選択AirOffer情報作成
   */
  private createSelectedAirOfferInfo() {
    // 以下の処理にて、初期選択AirOffer情報作成を行う。

    let airOfferList: Array<AirOffer> = [];
    let airOfferIdList: Array<string> = [];
    const airOffers = this._owd.data?.airOffers as AirOffers;
    let airOffersMap = new Map<string, AirOffer>(Object.entries(airOffers ?? {}));

    // 最安運賃を選択する必要がある
    if (this._R01P030Store?.isSelectLowestFare) {
      airOffersMap.forEach((airOffer, index) => {
        // trueの場合、画面表示用データ.airOffersについて、当該airOffersの値.isCheapest=trueとなるもののみ抽出して配列に変換したもの
        if (airOffer.prices?.isCheapest) {
          airOfferIdList.push(index);
          airOfferList.push(airOffer);
        }
      });
    }

    // 最安運賃を選択する必要がない
    if (!this._R01P030Store?.isSelectLowestFare) {
      airOffersMap.forEach((airOffer, index) => {
        // 上記以外の場合、当該airOffersの値.isUnselectable=falseとなるもののみ抽出して配列に変換したもの
        if (!airOffer.isUnselectable) {
          airOfferIdList.push(index);
          airOfferList.push(airOffer);
        }
      });
    }

    let selectIndex: number = 99999;

    // 往復かどうか=trueの場合、以下の処理を行う。
    if (this._R01P030Store?.isRoundtrip) {
      // 初期選択候補のAirOfferリストについて、それぞれ以下の値の合計値を算出した配列を初期選択優先順位リストとする。
      for (let idx = 0; idx < airOfferList.length; idx++) {
        // 当該選択対象AirOfferリストの値.bounds[0].fareFamilyCodeをキーに往路FF順序マップより取得した値
        let ffOrderOutboundLength: number =
          this.ffOrderOutboundMap.get(airOfferList[idx]?.bounds?.[0].fareFamilyCode ?? '') ?? 999;
        // 当該選択対象AirOfferリストの値.bounds[1].fareFamilyCodeをキーに復路FF順序マップより取得した値
        let ffOrderReturnTripLength: number =
          this.ffOrderReturnTripMap.get(airOfferList[idx]?.bounds?.[1].fareFamilyCode ?? '') ?? 999;
        // 当該選択対象AirOfferリストの値.bounds[0].travelSolutionIdの先頭1文字を除去した文字列を数値に変換した値
        let travelSolutionId1Number: number = Number(
          airOfferList[idx]?.bounds?.[0].travelSolutionId?.substring(
            1,
            airOfferList[idx]?.bounds?.[0].travelSolutionId?.length
          )
        );
        // 当該選択対象AirOfferリストの値.bounds[1].travelSolutionIdの先頭1文字を除去した文字列を数値に変換した値
        let travelSolutionId2Number: number = Number(
          airOfferList[idx]?.bounds?.[1].travelSolutionId?.substring(
            1,
            airOfferList[idx]?.bounds?.[1].travelSolutionId?.length
          )
        );

        // 初期選択優先順位リストのうち、最小となる値のインデックスを選択インデックスとし、以下の値を保持する。
        // 合計値
        let totalIndex =
          ffOrderOutboundLength + ffOrderReturnTripLength + travelSolutionId1Number + travelSolutionId2Number;
        if (totalIndex < selectIndex) {
          // 選択中往路TSID
          this.selectOutboundTSID = airOfferList[idx]?.bounds?.[0].travelSolutionId ?? '';
          // 選択中往路FF
          this.selectOutboundFF = airOfferList[idx]?.bounds?.[0].fareFamilyCode ?? '';
          // 選択中復路TSID
          this.selectReturnTripTSID = airOfferList[idx]?.bounds?.[1].travelSolutionId ?? '';
          // 選択中復路FF
          this.selectReturnTripFF = airOfferList[idx]?.bounds?.[1].fareFamilyCode ?? '';
          // 選択AirOfferId
          this.selectAirOfferId = this._roundtripFlightAvailabilityService.getAirOfferIdFromAirOfferMapping(
            this.airOfferMappingMap,
            airOfferList[idx]?.bounds?.[0].travelSolutionId ?? '',
            airOfferList[idx]?.bounds?.[0].fareFamilyCode ?? '',
            airOfferList[idx]?.bounds?.[1].travelSolutionId,
            airOfferList[idx]?.bounds?.[1].fareFamilyCode
          );
          // 選択AirOffer情報
          this.selectAirOfferInfo = this._roundtripFlightAvailabilityService.getAirOfferObject(
            this.airOfferMappingMap,
            this.airOfferMap,
            airOfferList[idx]?.bounds?.[0].travelSolutionId ?? '',
            airOfferList[idx]?.bounds?.[0].fareFamilyCode ?? '',
            airOfferList[idx]?.bounds?.[1].travelSolutionId,
            airOfferList[idx]?.bounds?.[1].fareFamilyCode
          );
          selectIndex = totalIndex;
        }
      }

      // Store更新
      this._R01P030Store = this._roundtripFlightAvailabilityService.setSelectTSIDandFF(
        this.selectOutboundTSID,
        this.selectOutboundFF,
        this.selectReturnTripTSID,
        this.selectReturnTripFF,
        this.selectAirOfferId,
        this.selectAirOfferInfo
      );
    } else {
      // 往復かどうか=falseの場合
      // 初期選択候補のAirOfferリストについて、それぞれ以下の値の合計値を算出した配列を初期選択優先順位リストとする。
      for (let idx = 0; idx < airOfferList.length; idx++) {
        // 当該選択対象AirOfferリストの値.bounds[0].fareFamilyCodeをキーに往路FF順序マップより取得した値
        let ffOrderOutboundLength: number =
          this.ffOrderOutboundMap.get(airOfferList[idx]?.bounds?.[0].fareFamilyCode ?? '') ?? 999;
        // 当該選択対象AirOfferリストの値.bounds[0].travelSolutionIdの先頭1文字を除去した文字列を数値に変換した値
        let travelSolutionId1Number: number = Number(
          airOfferList[idx]?.bounds?.[0].travelSolutionId?.substring(
            1,
            airOfferList[idx]?.bounds?.[0].travelSolutionId?.length
          )
        );

        let totalIndex = ffOrderOutboundLength + travelSolutionId1Number;
        if (totalIndex < selectIndex) {
          // 選択中往路TSID
          this.selectOutboundTSID = airOfferList[idx]?.bounds![0].travelSolutionId ?? '';
          // 選択中往路FF
          this.selectOutboundFF = airOfferList[idx]?.bounds![0].fareFamilyCode ?? '';
          // 選択AirOfferId
          this.selectAirOfferId = this._roundtripFlightAvailabilityService.getAirOfferIdFromAirOfferMapping(
            this.airOfferMappingMap,
            airOfferList[idx]?.bounds?.[0].travelSolutionId ?? '',
            airOfferList[idx]?.bounds?.[0].fareFamilyCode ?? ''
          );
          // 選択AirOffer情報
          this.selectAirOfferInfo = this._roundtripFlightAvailabilityService.getAirOfferObject(
            this.airOfferMappingMap,
            this.airOfferMap,
            airOfferList[idx]?.bounds?.[0].travelSolutionId ?? '',
            airOfferList[idx]?.bounds?.[0].fareFamilyCode ?? ''
          );
          selectIndex = totalIndex;
        }
      }

      // Store更新
      this._R01P030Store = this._roundtripFlightAvailabilityService.setSelectTSIDandFF(
        this.selectOutboundTSID,
        this.selectOutboundFF,
        undefined,
        undefined,
        this.selectAirOfferId,
        this.selectAirOfferInfo
      );
    }

    // 選択AirOffer情報に値が存在する場合、画面.検索結果フッタを表示する。
    if (this.selectAirOfferInfo !== undefined && Object.keys(this.selectAirOfferInfo).length !== 0) {
      this.isShowFooter = true;
    }
  }

  /**
   * 選択中のCFFリスト作成処理
   */
  private createSelectedCffList() {
    // リクエスト用検索条件.fare.isMixedCabin=falseの場合、運賃オプションリスト.<Commercial Fare Family区分>.<リクエスト用検索条件.fare.cabinclass>のリストを、選択中のCFFリストとして保持する。

    if (!this._R01P030Store.roundtripOwdRequest?.fare?.isMixedCabin) {
      // 運賃オプションリスト
      this._cffList = this._shoppingLibService.createFareOptionList(
        this._R01P030Store.commercialFareFamilyClassification ?? '',
        this._R01P030Store.roundtripOwdRequest?.fare.cabinClass ?? ''
      );
      // Store更新
      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
        cffList: this._cffList,
      });
    }
  }

  /**
   * 無料預け入れ手荷物表示判定
   */
  private determineFreeCheckedBaggageDisplay() {
    // 以下の処理にて、無料預け入れ手荷物表示判定を行う。
    // 往路無料預け入れ手荷物表示有無を初期値falseとし、画面表示用データ.roundtripBounds[0].fareFamiliesについて、
    // 当該fareFamilies.minFreeCheckedBaggageQuantityが存在するfareFamiliesが1つでも存在する場合、往路無料預け入れ手荷物表示有無をtrueとする。
    this._owd.data?.roundtripBounds?.[0].fareFamilies?.some((fareFamily) => {
      if (fareFamily.minFreeCheckedBaggageQuantity !== undefined && fareFamily.minFreeCheckedBaggageQuantity > 0) {
        this.isOutBoundFreeCheckedBaggage = true;
      }
    });

    // 往復かどうか=trueの場合、復路無料預け入れ手荷物表示有無を初期値falseとし、画面表示用データ.roundtripBounds[1].fareFamiliesについて、
    // 当該fareFamilies.minFreeCheckedBaggageQuantityが存在するfareFamiliesが1つでも存在する場合、復路無料預け入れ手荷物表示有無をtrueとする。
    if (this._R01P030Store?.isRoundtrip) {
      this._owd.data?.roundtripBounds?.[1]?.fareFamilies?.some((fareFamily) => {
        if (fareFamily.minFreeCheckedBaggageQuantity !== undefined && fareFamily.minFreeCheckedBaggageQuantity > 0) {
          this.isReturnTripFreeCheckedBaggage = true;
        }
      });
    }

    return false;
  }

  /**
   * プロモーション適用凡例表示判定
   */
  private determinePromotionApplied() {
    // 検索結果リスト往路プロモーション適用結果有無を初期値trueとし、
    // 画面表示用データ.airOffersについて、当該airOffers.bounds[0].totalPrice.discountが存在する場合、検索結果リスト往路プロモーション適用結果有無をtrueとする。
    if (this.airOfferMap) {
      this.airOfferMap.forEach((airOffer) => {
        if (airOffer.bounds) {
          if (airOffer.bounds[0] && airOffer.bounds[0].totalPrice?.discount !== undefined) {
            // Store更新
            this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
              isOutboundPromotionApplied: true,
            });
          }
          if (airOffer.bounds[1] && airOffer.bounds[1].totalPrice?.discount !== undefined) {
            // Store更新
            this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
              isReturnTripPromotionApplied: true,
            });
          }
        }
      });
    }
  }

  /**
   * アップグレード情報リスト作成
   */
  private createUpgradeInfoList() {
    // 以下の処理にて作成したアップグレード情報マップを保持する。
    let airOfferUpgradeInfoList: Array<AirOfferUpgradeInfo> = [];
    // 空のアップグレード情報マップを作成する。
    const airOffers = this._owd.data?.airOffers as AirOffers;
    let airOfferMap = new Map<string, AirOffer>(Object.entries(airOffers ?? {}));
    // ＜以下、画面表示用データ.airOffersの要素数分繰り返し＞
    airOfferMap.forEach((airOffer, key) => {
      // 当該airOffersのキーを当該AirOfferIdとする。
      let airOfferId = key;
      // 空のバウンド毎アップグレード情報マップを作成する。
      let boundUpgradeInfoList: Array<BoundUpgradeInfo> = [];
      // ＜以下、当該airOffers.boundsの要素数分繰り返し＞
      airOffer.bounds?.forEach((bound, boundIndex) => {
        // 空のフライト毎アップグレード情報マップを作成する。
        let flightUpgradeInfoList: Array<FlightUpgradeInfo> = [];
        // 画面表示用データ.roundtripBounds[当該boundsの繰り返しインデックス].travelSolutionsより、
        // travelSolutionId=当該bounds.travelSolutionIdとなるものを抽出し、当該TSとする。
        let travelSolutionInfo: Bound = {};
        this._owd.data?.roundtripBounds?.[boundIndex].travelSolutions?.forEach((travelSolution, tsIndex) => {
          if (travelSolution.travelSolutionId === bound.travelSolutionId) {
            travelSolutionInfo = travelSolution;
          }
        });
        // ＜以下、当該bounds.flightsの要素数分繰り返し＞
        bound?.flights?.forEach((flight, flightIndex) => {
          // 空のキャビンクラス毎アップグレード情報リストを作成する。
          let cabinClassUpgradeInfoList: Array<CabinClassUpgradeInfo> = [];
          // 当該TS.flights[当該flightsの繰り返しインデックス]を当該セグメントとする。
          let segmentInfo = travelSolutionInfo?.flights?.[flightIndex];
          // 当該flights.upgradableCabins(アップグレード可能キャビンクラスリスト)の要素数分、以下の内容として、キャビンクラス毎アップグレード情報リストに追加する。
          flight.upgradableCabins?.forEach((upgradableCabin) => {
            cabinClassUpgradeInfoList.push({
              /** キャビンクラス */
              cabinClass: upgradableCabin,
              /**
               * 残席状況
               * 1 当該セグメント.availableCabins(利用可能なキャビンクラスのリスト)に当該キャビンクラスが含まれない場合、”noSetting”(設定なし)、
               * 2 上記以外の場合、”unacquired”(未取得) アップグレード空席照会を行う前の初期値として、設定なしが確定する場合は設定なし、そうでない場合は未取得を設定しておく。
               */
              seatStatus: !segmentInfo?.availableCabins?.includes(upgradableCabin ?? '') ? 'noSetting' : 'unacquired',
              /** 空席数 */
              vacancyNum: 0,
            });
          });
          //　フライト毎アップグレード情報マップに、
          //  キー = 当該セグメント.marketingAirlineCode+当該セグメント.marketingFlightNumber、
          //  値   = キャビンクラス毎アップグレード情報リストを追加する。
          flightUpgradeInfoList.push({
            segmentKey: segmentInfo?.marketingAirlineCode + '' + segmentInfo?.marketingFlightNumber,
            cabinClassUpgradeInfoList: cabinClassUpgradeInfoList,
          });
        });
        // 　バウンド毎アップグレード情報マップに、
        //   キー = 当該bounds.travelSolutionId、
        //   値   = フライト毎アップグレード情報マップを追加する。
        boundUpgradeInfoList.push({
          travelSolutionId: bound.travelSolutionId,
          flightUpgradeInfoList: flightUpgradeInfoList,
        });
      });
      // 　アップグレード情報マップに、
      //   キー = 当該AirOfferId、
      //   値   = バウンド毎アップグレード情報マップとして追加する。
      airOfferUpgradeInfoList.push({
        airOfferId: airOfferId,
        boundUpgradeInfoList: boundUpgradeInfoList,
      });
    });

    // Store更新
    this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
      upgradeInfoList: airOfferUpgradeInfoList,
    });
  }

  /**
   * フィルタ条件入力情報を作成
   * フィルター条件モーダル画面描画用データの生成
   * @returns フィルター条件モーダル画面描画用データ
   */
  private createFilterConditionInfo() {
    const filterConditionInfo: FilterConditionData = {
      /** 選択可能な便 */
      isAvailable: false,
      /** 支払総額 下限上限および選択値 */
      budgetRange: this._getBudgetRange(),
      /** 運賃タイプ */
      fareType: this._getFareTypeList(),
      /** 無料預け入れ手荷物許容量の表示リスト */
      baggageAllowanceList: this._getBaggageAllowanceList(),
      /** プロモーション適用Air Offerのみ */
      isOnlyPromotionCodeAvailable: false,
      /** プロモーション適用Air Offerのみの表示判定用 */
      isPromotionApplied: this._owd.data?.airOffersSummary?.isPromotionApplied,
      /** バウンド毎のフィルタ項目 バウンド毎に選べる区間・乗継数を設定する */
      boundFilterItemList: this._createBoundFilterItemList(),
    };
    this.filterConditionInfo = filterConditionInfo;
    this.initiaFfilterConditionInfo = filterConditionInfo;
  }

  /**
   * 支払総額
   * @returns 支払総額
   */
  private _getBudgetRange(): RangeValue {
    const budgetRange: RangeValue = {
      /** 最小値 */
      limitMinValue: this._owd.data?.airOffersSummary?.minPrice?.total,
      /** 最大値 */
      limitMaxValue: this._owd.data?.airOffersSummary?.maxTotalPrice?.total,
      /** 現在選択中の最小値 */
      selectedMinValue: this._owd.data?.airOffersSummary?.minPrice?.total,
      /** 現在選択中の最大値 */
      selectedMaxValue: this._owd.data?.airOffersSummary?.maxTotalPrice?.total,
    };
    return budgetRange;
  }

  /**
   * 運賃タイプ
   * @returns 運賃タイプリスト
   */
  private _getFareTypeList(): FareTypeItem[] {
    // 運賃タイプリストとして空のリストを作成する。
    const fareTypeList: FareTypeItem[] = [];

    // 運賃タイプリストに、以下の項目を持つ情報を追加する。
    // チェック状態=false、値=”free”、項目名=無料で変更可の旨の文言キー
    fareTypeList.push({ isEnabled: false, value: 'free', name: 'label.itineraryPermitted' });

    // チェック状態=false、値=”withPenalty”、項目名=有料で変更可の旨の文言キー
    fareTypeList.push({ isEnabled: false, value: 'withPenalty', name: 'label.itineraryPermittedWithFee' });

    // チェック状態=false、値=”free”、項目名=無料で払戻可の旨の文言キー
    fareTypeList.push({ isEnabled: false, value: 'free', name: 'label.refundPermitted' });

    // チェック状態=false、値=”withPenalty”、項目名=無料で払戻可の旨の文言キー
    fareTypeList.push({ isEnabled: false, value: 'withPenalty', name: 'label.refundPermittedWithFee' });

    // 画面表示用データ.airOffersSummary.upgradableCabinsの要素数分、繰り返し、チェック状態=false、値=当該upgradableCabins、項目名=キー：”label.upgradable.“+当該upgradableCabins(文言キー)を追加する。
    this._owd.data?.airOffersSummary?.upgradableCabins?.map((upgradableCabin) => {
      let fareType: FareTypeItem = {
        isEnabled: false,
        value: upgradableCabin,
        name: 'label.upgradable.' + upgradableCabin,
      };
      fareTypeList.push(fareType);
    });

    return fareTypeList;
  }

  /**
   * 無料預け入れ手荷物許容量
   * @returns 無料預け入れ手荷物許容量リスト
   */
  private _getBaggageAllowanceList(): FilterItem<number>[] {
    return (
      this._owd.data?.airOffersSummary?.freeCheckedBaggageQuantities?.map((num) => ({
        /** 回数 */
        item: num,
        /** チェック状態 */
        isEnabled: false,
      })) ?? []
    );
  }

  /**
   * バウンド毎のフィルタ項目の生成
   * @returns バウンド毎のフィルタ項目
   */
  private _createBoundFilterItemList(): BoundFilterItem[] {
    const boundFilterItemList: BoundFilterItem[] = [];
    this._owd.data?.roundtripBounds?.forEach((roundtripBound, index) => {
      const boundFilterItem: BoundFilterItem = {
        // 乗継回数リスト
        stops: this._getStops(roundtripBound),
        // 総所要時間
        durationRange: this._getDurationRange(roundtripBound),
        // 出発空港
        departureAirportList: this._getDepartureAirportList(roundtripBound),
        // 出発時間帯
        departureTimeRange: this._getDepartureTimeRange(index),
        // 到着空港
        arrivalAirportList: this._getArrivalAirportList(roundtripBound),
        // 到着時間帯
        arrivalTimeRange: this._getArrivalTimeRange(),
        // 乗継空港
        transitAirportList: this._getTransitAirportList(roundtripBound),
        // 乗継時間
        transitTimeRange: this._getTransitTimeRange(index),
        // 乗継時間活性状態
        transitTimeRangeEnabled: false,
        // 運航キャリア
        operationAirlineList: this._getOperationAirlineList(roundtripBound),
        // 機種
        aircraftList: this._getAircraftList(roundtripBound),
        // Wi-Fiサービス
        equipment: { item: 'wifi', isEnabled: false },
      };
      boundFilterItemList.push(boundFilterItem);
    });
    return boundFilterItemList;
  }

  /**
   * 乗継回数リスト
   * @param roundtripBound
   * @returns 乗継回数リスト
   */
  private _getStops(roundtripBound: RoundtripBounds): FilterItem<number>[] {
    const stopsInfoList: FilterItem<number>[] = [];
    roundtripBound.travelSolutionsSummary?.numbersOfConnection?.map((num) => {
      const stopsInfo: FilterItem<number> = {
        /** 回数 */
        item: num,
        /** チェック状態 */
        isEnabled: false,
      };
      stopsInfoList.push(stopsInfo);
    });
    return stopsInfoList;
  }

  /**
   * 総所要時間
   * @param roundtripBound
   * @returns 総所要時間
   */
  private _getDurationRange(roundtripBound: RoundtripBounds): RangeValue {
    const durationRange: RangeValue = {
      /** 最小値 */
      limitMinValue: roundtripBound.travelSolutionsSummary?.minDuration
        ? Math.floor(roundtripBound.travelSolutionsSummary.minDuration / 60)
        : undefined,
      /** 最大値 */
      limitMaxValue: roundtripBound.travelSolutionsSummary?.maxDuration
        ? Math.floor(roundtripBound.travelSolutionsSummary.maxDuration / 60)
        : undefined,
      /** 現在選択中の最小値 */
      selectedMinValue: roundtripBound.travelSolutionsSummary?.minDuration
        ? Math.floor(roundtripBound.travelSolutionsSummary.minDuration / 60)
        : undefined,
      /** 現在選択中の最大値 */
      selectedMaxValue: roundtripBound.travelSolutionsSummary?.maxDuration
        ? Math.floor(roundtripBound.travelSolutionsSummary.maxDuration / 60)
        : undefined,
    };
    return durationRange;
  }

  /**
   * 出発空港
   * @param roundtripBound
   * @returns 出発空港
   */
  private _getDepartureAirportList(roundtripBound: RoundtripBounds): CodeFilterItem[] {
    const departureAirportList: CodeFilterItem[] = [];
    roundtripBound.travelSolutionsSummary?.originDepartureAirports?.map((airport) => {
      const departureAirport: CodeFilterItem = {
        /** 国コード */
        countryCode: airport?.countryCode,
        /** 空港コード */
        code: airport?.locationCode,
        /** APIから返却された空港名称 */
        name: airport?.locationName,
        /** チェック状態 */
        isEnabled: false,
      };
      departureAirportList.push(departureAirport);
    });
    return departureAirportList;
  }

  /**
   * 出発時間帯
   * @param index
   * @returns 出発時間帯
   */
  private _getDepartureTimeRange(index: number): RangeValue {
    if (this._R01P030Store.roundtripOwdRequest?.itineraries[index] !== undefined) {
      const departureTimeRange: RangeValue = {
        /** 最小値 */
        limitMinValue: this._R01P030Store.roundtripOwdRequest?.itineraries[index].departureTimeWindowFrom
          ? this.convertTimeOnlyCharactersToNumber(
              this._R01P030Store.roundtripOwdRequest.itineraries[index].departureTimeWindowFrom
            )
          : undefined,
        /** 最大値 */
        limitMaxValue: this._R01P030Store.roundtripOwdRequest?.itineraries[index].departureTimeWindowTo
          ? this.convertTimeOnlyCharactersToNumber(
              this._R01P030Store.roundtripOwdRequest.itineraries[index].departureTimeWindowTo
            )
          : undefined,
        /** 現在選択中の最小値 */
        selectedMinValue: this._R01P030Store.roundtripOwdRequest?.itineraries[index].departureTimeWindowFrom
          ? this.convertTimeOnlyCharactersToNumber(
              this._R01P030Store.roundtripOwdRequest.itineraries[index].departureTimeWindowFrom
            )
          : 0,
        /** 現在選択中の最大値 */
        selectedMaxValue: this._R01P030Store.roundtripOwdRequest?.itineraries[index].departureTimeWindowTo
          ? this.convertTimeOnlyCharactersToNumber(
              this._R01P030Store.roundtripOwdRequest.itineraries[index].departureTimeWindowTo
            )
          : 1439,
      };
      return departureTimeRange;
    }
    return {};
  }

  /**
   * 到着空港
   * @param roundtripBound
   * @returns 到着空港
   */
  private _getArrivalAirportList(roundtripBound: RoundtripBounds): CodeFilterItem[] {
    const arrivalAirportList: CodeFilterItem[] = [];
    roundtripBound.travelSolutionsSummary?.destinationArrivals?.map((airport) => {
      const arrivalAirport: CodeFilterItem = {
        /** 国コード */
        countryCode: airport.countryCode,
        /** 空港コード */
        code: airport.locationCode,
        /** APIから返却された空港名称 */
        name: airport?.locationName,
        /** チェック状態 */
        isEnabled: false,
      };
      arrivalAirportList.push(arrivalAirport);
    });
    return arrivalAirportList;
  }

  /**
   * 到着時間帯
   * @returns 到着時間帯
   */
  private _getArrivalTimeRange(): RangeValue {
    const arrivalTimeRange: RangeValue = {
      /** 現在選択中の最小値 */
      selectedMinValue: 0,
      /** 現在選択中の最大値 */
      selectedMaxValue: 1439, // 23:59
    };
    return arrivalTimeRange;
  }

  /**
   * 乗継空港
   * @param roundtripBound
   * @returns 乗継空港
   */
  private _getTransitAirportList(roundtripBound: RoundtripBounds): CodeFilterItem[] {
    const transitAirportList: CodeFilterItem[] = [];
    roundtripBound.travelSolutionsSummary?.connections?.map((connection) => {
      const transitAirport: CodeFilterItem = {
        /** 国コード */
        countryCode: connection.countryCode,
        /** 空港コード */
        code: connection.locationCode,
        /** APIから返却された空港名称 */
        name: connection?.locationName,
        /** チェック状態 */
        isEnabled: false,
      };
      transitAirportList.push(transitAirport);
    });
    return transitAirportList;
  }

  /**
   * 乗継時間
   * @param index
   * @returns 乗継時間
   */
  private _getTransitTimeRange(index: number): RangeValue {
    if (this._R01P030Store.roundtripOwdRequest !== undefined) {
      if (this._R01P030Store.roundtripOwdRequest.itineraries[index] !== undefined) {
        const transitTimeRange: RangeValue = {
          /** 最小値 */
          limitMinValue: this._R01P030Store.roundtripOwdRequest?.itineraries[index].connection?.time ?? undefined,
          /** 現在選択中の最小値 */
          selectedMinValue: this._R01P030Store.roundtripOwdRequest?.itineraries[index].connection?.time ?? 0,
          /** 現在選択中の最大値 */
          selectedMaxValue: 990, // 16時間30分
        };
        return transitTimeRange;
      }
    }
    return {};
  }

  /**
   * 運航キャリア
   * @param roundtripBound
   * @returns 運航キャリア
   */
  private _getOperationAirlineList(roundtripBound: RoundtripBounds): FareTypeItem[] {
    // 以下の処理にて作成した運航キャリアリストの要素数分、繰り返し
    // 空の運航キャリアリストを作成する。
    const OperationAirlineList: FareTypeItem[] = [];

    // プロパティ(カテゴリ：”applicationCommon”)からキー=”airline.nhGroupOperating”に紐づく値を”|”(パイプ)区切りで分割したリストをNHグループ運航キャリアリストとする。
    let nhGroupOperating = this._aswMasterSvc.getMPropertyByKey('application', 'airlines.nhGroupOperating');
    let nhGroupOperatingList = nhGroupOperating.split('|');
    // 当該roundtripBounds.travelSolutionsSummary.operatingAirlinesに、
    // 当該operatingAirlines.airlineCodeが、NHグループ運航キャリアリストに含まれるoperatingAirlinesが1つでも存在する場合、
    // 運航キャリアリストに、airlineCode=”NH”、airlineName=値なしとなる運航キャリアを追加する。
    const hasNhGroup = roundtripBound.travelSolutionsSummary?.operatingAirlines?.some(({ airlineCode }) =>
      nhGroupOperatingList.includes(airlineCode ?? '')
    );
    if (hasNhGroup) {
      OperationAirlineList.push({
        /** 運航キャリアコード */
        value: this.appConstants.CARRIER.TWO_LETTER,
        name: '',
        isEnabled: false,
      });
    }

    // 当該roundtripBounds.travelSolutionsSummary.operatingAirlinesについて、
    // 当該operatingAirlines.airlineCodeがNHグループ運航キャリアリストに含まれない場合、
    // 当該operatingAirlinesを運航キャリアリストに追加する。
    roundtripBound.travelSolutionsSummary?.operatingAirlines?.forEach((operatingAirline) => {
      if (!nhGroupOperatingList.includes(operatingAirline.airlineCode!)) {
        OperationAirlineList.push({
          /** 運航キャリアコード */
          value: operatingAirline.airlineCode ?? '',
          /** APIから返却された運航キャリア名称 */
          name: operatingAirline.airlineName ?? '',
          /** チェック状態 */
          isEnabled: false,
        });
      }
    });

    return OperationAirlineList;
  }

  /**
   * 機種
   * @param roundtripBound
   * @returns 機種
   */
  private _getAircraftList(roundtripBound: RoundtripBounds): FilterItem<string>[] {
    const AircraftList: FilterItem<string>[] = [];
    roundtripBound.travelSolutionsSummary?.aircraftCodes?.map((code) => {
      const aircraftInfo: FilterItem<string> = {
        /** 回数 */
        item: code,
        /** チェック状態 */
        isEnabled: false,
      };
      AircraftList.push(aircraftInfo);
    });
    return AircraftList;
  }

  /**
   * 画面表示内容に従って、画面表示を行う。
   */
  private async showDisplay() {
    let showPropsList: Array<ShowProps> = [];

    if (this._R01P030Store.isSearchResultOfSpecifiedDate) {
      this._owd.data?.roundtripBounds?.forEach((bound, index) => {
        // バウンド毎のデータ作成
        const showProps: ShowProps = {
          /** 選択未選択 : true=選択 false=未選択 */
          isShowSelectedTsAndFf: false,
          // バウンドヘッダ
          boundHeader: {
            // バウンド番号
            boundNumber: index,
            // 出発地
            departureAirport: this.getAirportName(
              this._R01P030Store.roundtripOwdRequest?.itineraries[index].originLocationCode!,
              ''
            ),
            // 到着地
            arrivalAirport: this.getAirportName(
              this._R01P030Store.roundtripOwdRequest?.itineraries[index].destinationLocationCode!,
              ''
            ),
            // 乗継地
            transitAirport: this.getTransitAirportName(
              this._R01P030Store.roundtripOwdRequest?.itineraries[index].connection
            ),
          },
          // 検索結果リスト
          isSelected: this.createSelected(index),
          // カレンダー
          airCalendarList: this.createCalendarData(index),
          // プロモーション適用凡例
          isPromotionApplied: this.createPromotionApplied(index),
          // FFヘッダ
          ffHeader: this.createFFHeader(index),
          // TSリスト
          tsList: this.getTSList(bound, index),
          // 選択中TS・FF情報(選択済の場合)
          selectTSFFInfo: this._selectTSFFInfo,
        };
        showPropsList.push(showProps);
      });
    } else {
      // カレンダーのみ返された場合の処理
      this._R01P030Store.roundtripOwdRequest?.itineraries.forEach((itinerari, index) => {
        // バウンド毎のデータ作成
        const showProps: ShowProps = {
          /** 選択未選択 : true=選択 false=未選択 */
          isShowSelectedTsAndFf: false,
          // バウンドヘッダ
          boundHeader: {
            // バウンド番号
            boundNumber: index,
            // 出発地
            departureAirport: this.getAirportName(itinerari.originLocationCode!, ''),
            // 到着地
            arrivalAirport: this.getAirportName(itinerari.destinationLocationCode!, ''),
            // 乗継地
            transitAirport: this.getTransitAirportName(itinerari.connection),
          },
          // 検索結果リスト
          isSelected: this.createSelected(index),
          // カレンダー
          airCalendarList: this.createCalendarData(index),
        };
        showPropsList.push(showProps);
      });
    }

    let activeFooterBtn = true;
    if (!this._R01P030Store?.isRoundtrip) {
      activeFooterBtn = !(this.selectOutboundTSID && this.selectOutboundFF);
    }

    this.props = {
      sortConditionData: this.props?.sortConditionData ?? {},
      showPropsList: showPropsList,
      cheapestCalendarData: this.createAirCalendarModalData(),
      isShowFooter: this.isShowFooter,
      activeFooterBtn: activeFooterBtn,
      selectedCabinClass:
        this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData.cabinClass ??
        '',
      selectedFareOptionType:
        this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData.fareOption ??
        '',
      filterConditionData: this.filterConditionInfo,
      initialFilterConditionData: this.initiaFfilterConditionInfo,
      ffNameMap: this.ffNameMap,
      searchFlightContidion: this._searchFlightConditionForRequestService.getData(),
      cffList: this._cffList,
      searchedDateTime: this.searchedDateTime,
      tripTypeList: this._tripTypeList,
    };
  }

  /**
   * フッター情報の作成
   * @returns
   */
  private createFooter(): AirOfferInfo {
    const result: AirOfferInfo = {
      /** 支払総額 */
      price: this.selectAirOfferInfo.prices?.totalPrice?.total ?? 0,
      /** プロモーション適用前支払総額 */
      originalPrice: this.getOriginalPrice(),
      /** プロモーション適用前支払総額（フッター表示用） */
      originalPriceNumber: this.selectAirOfferInfo.prices?.totalPrice?.discount?.originalTotal,
      /** プロモーション適用済案内 */
      isPromotionApplied: this.selectAirOfferInfo.prices?.totalPrice?.discount !== undefined,
      /** 搭乗者人数 */
      passengerCount: {
        adt: this._R01P030Store.roundtripOwdRequest?.travelers.ADT,
        b15: this._R01P030Store.roundtripOwdRequest?.travelers.B15,
        chd: this._R01P030Store.roundtripOwdRequest?.travelers.CHD,
        inf: this._R01P030Store.roundtripOwdRequest?.travelers.INF,
      },
      unitPriceList: this.getUnitPriceList(),
      /** 積算マイル */
      accrualMiles: this.selectAirOfferInfo.accrualMiles,
    };
    return result;
  }

  /**
   * プロモーション適用前支払総額
   * @returns
   */
  private getOriginalPrice(): string {
    if (this.selectAirOfferInfo.prices?.totalPrice?.discount !== undefined) {
      return this._amountFormatPipe.transform(
        this.selectAirOfferInfo.prices?.totalPrice?.discount?.originalTotal!,
        'payment.details_beforePrice',
        this.selectAirOfferInfo.prices?.totalPrice?.currencyCode
      );
    }
    return '';
  }

  /**
   * 搭乗者毎支払い総額リスト作成
   * @returns 搭乗者毎支払い総額リスト
   */
  private getUnitPriceList(): UnitPrice[] {
    const resultList: UnitPrice[] = [];
    this.selectAirOfferInfo?.prices?.unitPrices!.forEach((unitPrice) => {
      let passengerTypeMsgCode: string = unitPrice.passengerTypeCode!;

      // 非ヌルアサーション「!」使用回避
      let _total: number = 0;
      let _base: number = 0;
      let _totalTaxes: number = 0;
      if (unitPrice.prices) {
        _total = unitPrice.prices.total ?? 0;
        _base = unitPrice.prices.base ?? 0;
        _totalTaxes = unitPrice.prices.totalTaxes ?? 0;
      }

      const result: UnitPrice = {
        /** 搭乗者種別 */
        passengerTypeCode: passengerTypeMsgCode,
        /** 支払総額 */
        totalPrice: _total,
        /** 航空運賃 */
        basePrice: _base,
        /** 税金 */
        tax: _totalTaxes,
      };
      resultList.push(result);
    });

    return resultList;
  }

  /**
   * 検索結果リストの作成
   * @param boundIndex バウンドのインデック
   * @returns
   */
  private createSelected(boundIndex: number): boolean {
    // 当該バウンドのインデックス=0、かつ往路選択済み状態=false
    if (boundIndex === 0 && !this._R01P030Store.isSelectedOutbound) {
      return false;
    }
    // 当該バウンドのインデックス=1、かつ復路選択済み状態=false
    if (boundIndex === 1 && !this._R01P030Store.isSelectedReturnTrip) {
      return false;
    }
    return true;
  }

  /**
   * 7日間カレンダーの作成
   * @param response
   */
  private createCalendarData(boundIndex: number): Array<AirCalendar> {
    let airCalendarInfo = this._owd.data?.airCalender as AirCalenderInfo | undefined;
    let result: Array<AirCalendar> = [];
    // 検索条件の日付を選択済み日付として取得
    const selectedDate = this._R01P030Store?.roundtripOwdRequest?.itineraries[boundIndex]!.departureDate ?? '';

    const dateList = [
      this._owd.data?.airCalendarPeriod?.departureDates,
      this._owd.data?.airCalendarPeriod?.returnDates,
    ];

    dateList[boundIndex]?.forEach((dateString, index) => {
      // 条件に応じて、以下を日付情報とする。
      // 往復かどうか=falseの場合、往復指定日空席照会(OWD)用レスポンス.airCalender.<当該日付>
      let dateInfo: { prices?: AirCalendarPrices } | undefined = undefined;
      if (!this._R01P030Store?.isRoundtrip) {
        // 往復でない場合、ReturnDateは入ってこないので後続処理の都合で型を絞り込む
        dateInfo = airCalendarInfo?.[dateString] as { prices?: AirCalendarPrices } | undefined;
      }

      // 以下の条件を全て満たす場合、往復指定日空席照会(OWD)用レスポンス.airCalender.<当該日付>.<現在の復路日付>
      // 往復かどうか=true
      // 当該バウンドのインデックス=0
      // airCalender.<当該日付>が存在する
      if (this._R01P030Store?.isRoundtrip && boundIndex === 0 && airCalendarInfo?.[dateString] !== undefined) {
        dateInfo = airCalendarInfo[dateString][this._R01P030Store.currentReturnTripDate ?? ''] as
          | ReturnDate
          | undefined;
      }

      // 以下の条件を全て満たす場合、往復指定日空席照会(OWD)用レスポンス.airCalender.<現在の往路日付>.<当該日付>
      // 往復かどうか=true
      // 当該バウンドのインデックス=1
      // airCalender.<現在の往路日付>が存在する
      if (
        this._R01P030Store?.isRoundtrip &&
        boundIndex === 1 &&
        airCalendarInfo?.[this._R01P030Store.currentOutboundDate ?? ''] !== undefined
      ) {
        dateInfo = airCalendarInfo[this._R01P030Store.currentOutboundDate ?? ''][dateString] as ReturnDate | undefined;
      }

      const airCalendar: AirCalendar = {
        /** 出発日 : 日付・曜日 */
        date: dateString,
        /** 日付情報有無*/
        isdateInfo: dateInfo ? true : false,
        /** 最安金額 */
        price: dateInfo?.prices?.totalPrices?.total,
        /** 選択状態 */
        isSelected: dateString === selectedDate,
        /** true=選択出来ない（非活性） */
        isDisabled: dateInfo === undefined,
        /** 最安支払い総額であるフラグ */
        isLowestPrice: dateInfo?.prices?.isCheapest,
      };
      result.push(airCalendar);
    });

    return result;
  }

  /**
   * マトリクス形式7日間カレンダーモーダル画面データの作成
   * @param showPropsList
   * @returns
   */
  private createAirCalendarModalData(): CheapestCalendarData {
    let airCalendarInfo = this._owd.data?.airCalender as AirCalenderInfo | undefined;
    let result: CheapestCalendarData = {};

    let airCalendarCellList: AirCalendarCell[][] = [];
    this._owd.data?.airCalendarPeriod?.departureDates?.forEach((departureDate) => {
      let airCalendarCell: AirCalendarCell[] = [];
      this._owd.data?.airCalendarPeriod?.returnDates?.forEach((returnDate) => {
        let dateInfo = airCalendarInfo?.[departureDate]?.[returnDate] as ReturnDate;
        if (dateInfo === undefined) {
          airCalendarCell.push({
            isDisplay: false,
            isAvaliable: false,
            departureDate: '',
            returnDate: '',
            currencySymbol: '',
            price: 0,
            isLowestPrice: false,
          });
        } else {
          const calendarData: AirCalendarCell = {
            isDisplay: true,
            isAvaliable: dateInfo.prices !== undefined,
            departureDate: departureDate,
            returnDate: returnDate,
            price: dateInfo.prices?.totalPrices?.total ?? 0,
            isLowestPrice: dateInfo.prices?.isCheapest ?? false,
            currencySymbol: dateInfo.prices?.totalPrices?.currencyCode ?? '',
          };
          airCalendarCell.push(calendarData);
        }
      });
      airCalendarCellList.push(airCalendarCell);
    });

    /** 往路出発日 */
    result.departureDateList = this._owd.data?.airCalendarPeriod?.departureDates;
    /** 復路出発日 */
    result.returnDateList = this._owd.data?.airCalendarPeriod?.returnDates;
    /** マトリクス用カレンダーデータ */
    result.airCalendarCellList = airCalendarCellList;
    /** 選択中の往路出発日 */
    result.selectedDepartureDate = this._R01P030Store.currentOutboundDate;
    /** 選択中の復路出発日 */
    result.selectedReturnDate = this._R01P030Store.currentReturnTripDate;
    let travelers = this._R01P030Store.roundtripOwdRequest?.travelers;
    /** 旅行者の合計数 */
    result.totalTravelers =
      (travelers?.ADT ?? 0) + (travelers?.B15 ?? 0) + (travelers?.CHD ?? 0) + (travelers?.INF ?? 0);
    return result;
  }

  /**
   * FFヘッダ
   */
  private createFFHeader(boundIndex: number): Array<FFHeader> {
    let result: Array<FFHeader> = [];

    const bound = this._owd.data?.roundtripBounds![boundIndex]!;

    bound.fareFamilies?.forEach((fareFamilie, index, array) => {
      // 表示フラグ
      let showFlg: boolean = false;
      // 当該FFのインデックス=0、
      // または当該バウンド.fareFamilies[当該FFのインデックス-1].fareFamiliesWithService.cabinと当該FF.fareFamilyWithService.cabinが異なる場合に表示する
      if (index === 0) {
        showFlg = true;
      } else {
        const prevCabin = bound.fareFamilies?.[index - 1].fareFamilyWithService?.cabin;
        if (prevCabin !== fareFamilie.fareFamilyWithService?.cabin) {
          showFlg = true;
        }
      }
      const ffHeader: FFHeader = {
        /** FF概要表示切替リンク */
        ffLink: '',
        /** FF概要表示切替リンク：フラグ */
        ffLinkShowFlg: showFlg,
        /** FF情報 */
        ffInfo: {
          /** キャビンクラス */
          cabinClass: this.getCabinClass(this._owd.data?.roundtripBounds![boundIndex]!, fareFamilie, index),
          /** FF名称 */
          ffName: this.ffNameMap.get(fareFamilie.fareFamilyCode ?? ''),
          /** FF帯 */
          ffBand: `${this._R01P030Store.searchResultItineraryType}-${fareFamilie.fareFamilyWithService?.cabin}`,
          /** FF概要 */
          ffOverview: {
            /** 予約変更可否 */
            possibilityChangeItinerary: this.getPossibilityChangeItinerary(fareFamilie),
            /** 払戻可否 */
            possibilityRefund: this.getPossibilityRefund(fareFamilie),
            /** 無料預け入れ手荷物欄表示可否 */
            freeCheckedBaggage: this.getIsFreeCheckedBaggage(boundIndex),
            /** 無料預け入れ手荷物個数 */
            valueFreeBaggage: this.getValueFreeBaggage(fareFamilie),
            /** 座席指定料金 */
            seatReservationFee: this.getSeatReservationFee(fareFamilie),
          },
        },
      };
      result.push(ffHeader);
    });

    return result;
  }

  /**
   * キャビンクラス
   * @param boundIndex
   * @param array
   * @param ffIndex
   * @returns
   */
  private getCabinClass(bound: RoundtripBounds, fareFamilie: FareFamilies, ffIndex: number): string {
    // 当該FFのインデックス=0、または
    // 当該バウンド.fareFamilies[当該FFのインデックス-1].fareFamilyWithService.cabinと
    //                                          当該FF.fareFamilyWithService.cabinが異なる
    if (
      ffIndex === 0 ||
      bound.fareFamilies![ffIndex - 1].fareFamilyWithService?.cabin !== fareFamilie.fareFamilyWithService?.cabin
    ) {
      // データコード=“PD_930”(表示用クラス名称)、value=クラス名称コード(※)となるASWDB(マスタ)の汎用マスターデータ(リスト).表示内容
      // (※)以下を区切り文字(-(ハイフン))で連結した値
      // 1	“R”(有償)
      // 2	検索結果旅程種別
      // 3	当該FF.fareFamilyWithService.cabin
      // ※汎用マスタデータ上の値をR-international-ecoのような値と想定
      let cabinClass = this.getPD930Content_old(
        this._R01P030Store.searchResultItineraryType ?? '',
        fareFamilie.fareFamilyWithService?.cabin ?? ''
      );
      return cabinClass;
    }
    return '';
  }

  /**
   * 予約変更可否
   * @param fareFamilie
   * @returns
   */
  private getPossibilityChangeItinerary(fareFamilie: FareFamilies): string {
    // 以下、当該fareFamily.changeConditionsTypeに応じて表示する。
    // ”unavailable”	予約変更不可の旨
    if (fareFamilie.changeConditionsType === FareFamilies.ChangeConditionsTypeEnum.Unavailable) {
      return 'label.notPermit';
    }
    // ”withPenalty”	予約変更可能(手数料あり)の旨
    if (fareFamilie.changeConditionsType === FareFamilies.ChangeConditionsTypeEnum.WithPenalty) {
      return 'label.permittedWithFee';
    }
    // ”free”	予約変更可能(手数料なし)の旨
    if (fareFamilie.changeConditionsType === FareFamilies.ChangeConditionsTypeEnum.Free) {
      return 'label.permitted';
    }
    return '';
  }

  /**
   * 払戻可否
   */
  private getPossibilityRefund(fareFamilie: FareFamilies): string {
    // 以下、当該fareFamily.refundConditionsTypeに応じて表示する。
    // ”unavailable”	払戻不可の旨
    if (fareFamilie.refundConditionsType === FareFamilies.RefundConditionsTypeEnum.Unavailable) {
      return 'label.notPermit';
    }
    // ”withPenalty”	払戻可能(手数料あり)の旨
    if (fareFamilie.refundConditionsType === FareFamilies.RefundConditionsTypeEnum.WithPenalty) {
      return 'label.permittedWithFee';
    }
    // ”free”	払戻可能(手数料なし)の旨
    if (fareFamilie.refundConditionsType === FareFamilies.RefundConditionsTypeEnum.Free) {
      return 'label.permitted';
    }

    return '';
  }

  /**
   * 無料預け入れ手荷物欄表示可否
   */
  private getIsFreeCheckedBaggage(boundIndex: number): boolean {
    if (boundIndex === 0) {
      return this.isOutBoundFreeCheckedBaggage;
    } else {
      return this.isReturnTripFreeCheckedBaggage;
    }
  }

  /**
   * 無料預け入れ手荷物個数
   */
  private getValueFreeBaggage(fareFamilie: FareFamilies): string {
    // 当該fareFamily.minFreeCheckedBaggageQuantityが存在する
    if (fareFamilie.minFreeCheckedBaggageQuantity! > 0) {
      // 無料預け入れ手荷物表示有無=true	当該fareFamily.minFreeCheckedBaggageQuantityを含む文言
      return String(fareFamilie.minFreeCheckedBaggageQuantity);
    }
    // 上記以外	-(ハイフン)
    return '-';
  }

  /**
   * 座席指定料金
   */
  private getSeatReservationFee(
    fareFamilie: RoundtripOwdResponseDataRoundtripBoundsInnerFareFamiliesInner
  ): string | undefined {
    const families = fareFamilie as FareFamilies;
    if (families.fareFamilyWithService?.seat) {
      return families.fareFamilyWithService?.seat.applicability;
    }
    return undefined;
  }

  /**
   * TSリスト
   *  ┗ フライトサマリ
   *  ┗ フライト詳細ヘッダ
   *  ┗ フライト詳細セグメント
   *  ┗ TS別FF情報
   * @returns
   */
  private getTSList(bound: RoundtripBounds, boundIndex: number): Array<TSList> {
    // 当該バウンドのTS数分繰り返し表示する。
    // SP・TAB版かつ選択中のTSの場合、ネイビーで囲い表示する。
    // ※後述の条件により、全てのTS別FFが選択不可となるフライトについても表示する。
    let result: Array<TSList> = [];
    bound.travelSolutions?.forEach((travelSolution, index) => {
      const tsList: TSList = {
        /** フライトサマリ */
        flightSummary: {
          ...this._flightPlanService.getFlightSummary(travelSolution, boundIndex),
          notShowServiceTitle: true,
        },
        /** フライト詳細ヘッダ */
        flightDetailHeader:
          this._roundtripFlightAvailabilityInternationalPresService.createFlightDetailHeader(travelSolution),
        /** フライト詳細セグメント */
        flightDetailSegment: this._roundtripFlightAvailabilityInternationalPresService.createFlightDetailSegment(
          travelSolution,
          boundIndex
        ),
        /** TS別FF情報 */
        tsffInfo: [],
      };
      result.push(tsList);
    });

    return result;
  }

  /**
   * FF名称
   * @param boundIndex
   * @returns
   */
  private getFareFamilyName(boundIndex: number): string {
    // PCの場合でも読み上げ用文言で使用するため、常に返却。
    // FF名称マップより表示airOfferId.bounds[当該バウンドのインデックス].fareFamilyCodeをキーに取得したFF名称
    return this.ffNameMap.get(this.showAirOffer?.bounds?.[boundIndex]?.fareFamilyCode ?? '') ?? '';
  }

  /**
   * プロモーション適用凡例
   * @param boundIndex
   * @returns
   */
  private getIsPromotionApplied(boundIndex: number): boolean {
    // 以下の条件を全て満たす
    // 1	当該バウンドのインデックス=0
    // 2	選択中TS・FF情報往路プロモーション適用凡例結果有無=true
    if (boundIndex === 0 && this._R01P030Store.isSelectedOutboundPromotionApplied) {
      return true;
    }

    // 以下の条件を全て満たす
    // 1	当該バウンドのインデックス=1
    // 2	選択中TS・FF情報復路プロモーション適用凡例結果有無=true
    if (boundIndex === 1 && this._R01P030Store.isSelectedReturnTripPromotionApplied) {
      return true;
    }

    return false;
  }

  /**
   * 選択中AirOfferの引数バウンドにおけるプロモーション適用前金額をHTMLタグ付きで出力
   * @param boundIndex 対象のバウンドをIndexで指定
   * @returns HTMLタグ付きのプロモーション適用前金額、存在しない場合は空文字
   */
  private getBoundOriginalPrice(boundIndex: number): string {
    // 選択AirOffer情報.bounds[当該バウンド].totalPrice.discountが存在する
    const originalTotal = this.selectAirOfferInfo?.bounds?.[boundIndex].totalPrice?.discount?.originalTotal;
    if (originalTotal !== undefined) {
      // 選択AirOffer情報.bounds[当該バウンドのインデックス].totalPriceについて、currencyCodeとdiscount.originalTotalを利用し、取り消し線をつけて出力
      // ※文字サイズについては、通貨フォーマットのフォーマット文字列にて、通貨ごとに適切なサイズとなるようなCSSの指定を含んだ文字列を定義するものとし、設計での出し分けは行わない。
      return this._amountFormatPipe.transform(originalTotal, 'availability.fare_price.beforePromotion');
    }
    return '';
  }

  /**
   * ワーニング表示
   */
  private showWarning() {
    // 画面表示用データ.isReSearchedが存在するかつその値がtrueの場合、
    // ”W0837”(指定条件では検索結果がないため運賃を変更して検索した旨)のワーニングメッセージを表示する。
    if (this._owd.data?.isReSearched) {
      const AlertMessageData: AlertMessageItem = {
        contentHtml: 'm_error_message-W0837',
        isCloseEnable: true,
        alertType: AlertType.WARNING,
        errorMessageId: 'W0837',
      };
      this._common.alertMessageStoreService.setAlertWarningMessage(AlertMessageData);
    }

    // 画面表示用データ.isOnlyUpperCabinClassesが存在するかつその値がtrueの場合、
    // ”W1063”(指定したキャビンクラスの検索結果が得られなかった旨)のワーニングメッセージを表示する。
    if (this._owd.data?.isOnlyUpperCabinClasses) {
      const AlertMessageData: AlertMessageItem = {
        contentHtml: 'm_error_message-W1063',
        isCloseEnable: true,
        alertType: AlertType.WARNING,
        errorMessageId: 'W1063',
      };
      this._common.alertMessageStoreService.setAlertWarningMessage(AlertMessageData);
    }

    // 指定日検索結果有無=true、かつ画面表示用データ.airOffersSummary.isPromotionAppliedが存在するかつその値がfalseの場合、
    // ”W0839”(プロモーションを適用した検索結果が得られなかった旨)のワーニングメッセージを表示する。
    if (
      this._R01P030Store.isSearchResultOfSpecifiedDate &&
      this._owd.data?.airOffersSummary?.isPromotionApplied === false
    ) {
      const AlertMessageData: AlertMessageItem = {
        contentHtml: 'm_error_message-W0839',
        isCloseEnable: true,
        alertType: AlertType.WARNING,
        errorMessageId: 'W0839',
      };
      this._common.alertMessageStoreService.setAlertWarningMessage(AlertMessageData);
    }

    // 画面表示用データ.isAllSoldOutが存在するかつその値がtrueの場合、
    // ”W0840”(指定した区間と日付は全便満席であるため、再検索フォームより再検索してもらう旨)のワーニングメッセージを表示する。
    if (this._owd.data?.isAllSoldOut) {
      const AlertMessageData: AlertMessageItem = {
        contentHtml: 'm_error_message-W0840',
        isCloseEnable: true,
        alertType: AlertType.WARNING,
        errorMessageId: 'W0840',
      };
      this._common.alertMessageStoreService.setAlertWarningMessage(AlertMessageData);
    }

    // 指定日検索結果有無=true、かつ最安額連携有無=true、かつ履歴用検索条件.最安額連携情報.通貨コード=ユーザ共通.通貨コードの場合、以下の処理にて、連携された最安額と差異がある場合のワーニング表示を行う。
    if (
      this._R01P030Store.isSearchResultOfSpecifiedDate &&
      this._R01P030Store?.isLowestPriceCoordination &&
      this._R01P030Store?.searchFlight?.lowestPrice.displayedCurrency ===
        this._common.aswContextStoreService.aswContextData.currencyCode
    ) {
      // 以下いずれかの条件に合致する場合、”W0831”(案内済みの運賃より高い金額を表示している旨)のワーニングメッセージを表示する。
      // 履歴用検索条件.最安額連携情報.最安支払総額＜画面表示用データ.airOffersSummary.minTotalPrice.total
      if (
        this._owd.data?.airOffersSummary?.minPrice?.total &&
        this._R01P030Store?.searchFlight?.lowestPrice?.displayedTotalPrice &&
        this._R01P030Store.searchFlight.lowestPrice.displayedTotalPrice < this._owd.data.airOffersSummary.minPrice.total
      ) {
        const AlertMessageData: AlertMessageItem = {
          contentHtml: 'm_error_message-W0831',
          isCloseEnable: true,
          alertType: AlertType.WARNING,
          errorMessageId: 'W0831',
        };
        this._common.alertMessageStoreService.setAlertWarningMessage(AlertMessageData);
      }

      // 履歴用検索条件.最安額連携情報.最安運賃額(税抜)＜画面表示用データ.airOffersSummary.minTotalPrice.base
      if (
        this._owd.data?.airOffersSummary?.minPrice?.base &&
        this._R01P030Store?.searchFlight?.lowestPrice?.displayedBasePrice &&
        this._R01P030Store.searchFlight.lowestPrice.displayedBasePrice < this._owd.data.airOffersSummary.minPrice.base
      ) {
        const AlertMessageData: AlertMessageItem = {
          contentHtml: 'm_error_message-W0831',
          isCloseEnable: true,
          alertType: AlertType.WARNING,
          errorMessageId: 'W0831',
        };
        this._common.alertMessageStoreService.setAlertWarningMessage(AlertMessageData);
      }

      // 以下いずれかの条件に合致する場合、”W0832”(案内済みの運賃より低い金額を表示している旨)のワーニングメッセージを表示する。
      // 履歴用検索条件.最安額連携情報.最安支払総額＞画面表示用データ.airOffersSummary.minTotalPrice.total
      if (
        this._owd.data?.airOffersSummary?.minPrice?.total &&
        this._R01P030Store?.searchFlight?.lowestPrice?.displayedTotalPrice &&
        this._R01P030Store.searchFlight.lowestPrice.displayedTotalPrice > this._owd.data.airOffersSummary.minPrice.total
      ) {
        const AlertMessageData: AlertMessageItem = {
          contentHtml: 'm_error_message-W0832',
          isCloseEnable: true,
          alertType: AlertType.WARNING,
          errorMessageId: 'W0832',
        };
        this._common.alertMessageStoreService.setAlertWarningMessage(AlertMessageData);
      }

      // 履歴用検索条件.最安額連携情報.最安運賃額(税抜)＞画面表示用データ.airOffersSummary.minTotalPrice.base
      if (
        this._owd.data?.airOffersSummary?.minPrice?.base &&
        this._R01P030Store?.searchFlight?.lowestPrice?.displayedBasePrice &&
        this._R01P030Store.searchFlight.lowestPrice.displayedBasePrice > this._owd.data.airOffersSummary.minPrice.base
      ) {
        const AlertMessageData: AlertMessageItem = {
          contentHtml: 'm_error_message-W0832',
          isCloseEnable: true,
          alertType: AlertType.WARNING,
          errorMessageId: 'W0832',
        };
        this._common.alertMessageStoreService.setAlertWarningMessage(AlertMessageData);
      }

      // 最安額連携有無にfalseを設定し、履歴用検索条件.最安額連携情報.通貨コード、
      // 履歴用検索条件.最安額連携情報.最安支払総額、履歴用検索条件.最安額連携情報.最安運賃額(税抜)をクリアする。
      let searchFlightStateDetails: SearchFlightStateDetails = structuredClone(this._R01P030Store.searchFlight);
      searchFlightStateDetails.lowestPrice = {
        /** 案内済最安支払総額 */
        displayedTotalPrice: null,
        /** 案内済最安運賃額（税抜） */
        displayedBasePrice: null,
        /** 案内済通貨コード */
        displayedCurrency: null,
      };
      const selectedCalendarInfo: RoundtripFlightAvailabilityInternationalState = {
        isLowestPriceCoordination: false,
        searchFlight: searchFlightStateDetails,
      };
      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(
        selectedCalendarInfo
      );
    }

    //履歴用検索条件.運賃情報.MixedCabin利用有無=true、かつリクエスト用検索条件.fare.isMixedCabin=falseの場合、復路も往路に指定したキャビンクラスで検索している旨のワーニングメッセージを表示する。
    if (
      this._R01P030Store?.searchFlight?.fare.isMixedCabin === true &&
      this._R01P030Store?.roundtripOwdRequest?.fare.isMixedCabin === false
    ) {
      const AlertMessageData: AlertMessageItem = {
        contentHtml: 'm_error_message-W0849',
        isCloseEnable: true,
        alertType: AlertType.WARNING,
        errorMessageId: 'W0849',
      };
      this._common.alertMessageStoreService.setAlertWarningMessage(AlertMessageData);
    }
    //  ユーザ共通.操作オフィスコード=支払不可情報.オフィスとなる、ASWDB(マスタ)の支払不可情報.ユーザーエージェント検索文字列と支払不可情報.ワーニング表示フラグがtrueの支払不可情報.支払方法を取得する。ユーザーエージェントに検索文字列が含まれる場合、”W1862”(利用中のブラウザでは対象の支払方法が使用できないため、推奨ブラウザを使ってほしい旨)のワーニングメッセージを表示する。
    this._getUnavailablePaymentByOfficeCodeService.checkUnavailablePaymentByOfficeCode();
  }

  /**
   * エラーメッセージを表示（プラン作成失敗判定）
   */
  private showErrorPlanCreationFailed() {
    // プラン確認画面にて保持されたプラン作成失敗判定が存在する場合、エラーメッセージID＝”EE1059”にて継続可能なエラー情報を指定し、当画面でエラーメッセージを表示する。
    if (this._deliveryInformationStoreService.deliveryInformationData.planReviewInformation?.isPlanDuplicationFailed) {
      const errorInfo: RetryableError = {
        errorMsgId: 'E1059',
      };
      this._errorsHandlerSvc.setRetryableError(PageType.PAGE, errorInfo);
    }
  }

  /**
   * FF選択ボタン押下時処理※FF選択モーダル画面
   */
  private updateFareFamilyInTsList(boundIndex: number, travelSolutionId: string, fareFamilyCode: string) {
    const showPropsList: ShowProps[] = JSON.parse(JSON.stringify(this.props?.showPropsList));

    // ※当処理は呼び出し元よりバウンドインデックス(0：往路または片道、1：復路)、TS、FFを受け取り、処理を行う。
    let availabilityParams: RoundtripFlightAvailabilityInternationalState = {};

    // 変更前AirOffer情報として、選択AirOffer情報を複製した情報を保持する。
    const changeBefore = this.selectAirOfferInfo;

    // 呼び出し元より指定されたバウンドインデックス＝”0”(往路)の場合、以下の処理を行う。
    if (boundIndex === 0) {
      // 往路選択済み状態にtrueを設定する。
      // ※検索結果リストを非表示にし、選択中TS・FF情報を表示する。
      availabilityParams.isSelectedOutbound = true;

      // 運賃変更案内コンテンツIDが存在する場合、運賃変更案内コンテンツIDを引数としてインフォメーション削除処理を実施し、運賃変更案内コンテンツIDを値なしとする。
      if (this._R01P030Store.fareChangeInfoContentID) {
        this._common.alertMessageStoreService.removeAlertInfomationMessage(this._R01P030Store.fareChangeInfoContentID);
        this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
          fareChangeInfoContentID: '',
        });
      }

      // 選択中往路TSIDに、呼び出し元より指定されたTS.travelSolutionId、選択中往路FFに、呼び出し元より指定されたFF.fareFamilyCodeを設定する。
      this.selectOutboundTSID = travelSolutionId;
      this.selectOutboundFF = fareFamilyCode;
      this._R01P030Store = this._roundtripFlightAvailabilityService.setSelectTSIDandFF(
        this.selectOutboundTSID,
        this.selectOutboundFF
      );
      // 引数に画面表示用データ.airOfferMapping.<選択中往路TSID>.<選択中往路FF>を指定し、TS別FF情報内のFF情報押下時処理の[往路変更後AirOfferId取得処理]を行う。
      const afterDepartureInfo = this._owd.data?.airOfferMapping?.[this.selectOutboundTSID]?.[
        this.selectOutboundFF
      ] as DepartureFareFamily;

      const afterChangeAirOfferId = this._roundtripFlightAvailabilityService.getAfterAirOfferId(afterDepartureInfo);

      // 往路変更後AirOfferIdが存在する場合、以下の処理を行う。
      if (afterChangeAirOfferId) {
        // 選択AirOfferIdに、往路変更後AirOfferIdを設定する。
        // 検索結果フッタ表示状態に、trueを設定する。
        this.selectAirOfferId = afterChangeAirOfferId;
        availabilityParams.searchResultFooterDisplayStatus = true;
      } else {
        // 上記で往路変更後AirOfferIdが存在する以外の場合、以下の処理を行う。
        // 選択AirOfferIdに、画面表示用データ.airOfferMapping.<選択中往路TSID>.<選択中往路FF>.cheapestAirOfferIdを設定する。
        // ※ 選択AirOfferIdを基に選択中TS・FF情報ならびに検索結果フッタの値を表示するが、検索結果フッタについては全バウンド選択済みの場合しか表示が行われないようにするため、最終的な選択AirOfferIdとはなりえないcheapestAirOfferIdを、選択中TS・FF情報の表示のために設定してしまう。
        if (this._owd.data) {
          if (this._owd.data.airOfferMapping) {
            let departureTS = this._owd.data.airOfferMapping?.[this.selectOutboundTSID] as DepartureTravelSolution;
            if (departureTS) {
              let departureFF = departureTS?.[this.selectOutboundFF] as DepartureFareFamily;
              if (departureFF) {
                this.selectAirOfferId = departureFF?.['cheapestAirOfferId'] as string;
              }
            }
          }
        }

        // 選択中復路TSおよび選択中復路FFをクリアする。
        this.selectReturnTripTSID = '';
        this.selectReturnTripFF = '';
        this._R01P030Store = this._roundtripFlightAvailabilityService.setSelectTSIDandFF(
          undefined,
          undefined,
          this.selectReturnTripTSID,
          this.selectReturnTripFF
        );

        // 復路選択済み状態にfalseを設定する。
        // ※ 検索結果リストを表示し、選択中TS・FF情報を非表示する。
        availabilityParams.isSelectedReturnTrip = false;

        // 検索結果フッタ表示状態にfalseを設定する。
        availabilityParams.searchResultFooterDisplayStatus = false;

        // 復路選択解除案内コンテンツIDが存在しない場合、注意喚起エリアへのインフォメーションメッセージ登録処理に
        // メッセージID＝”MSG1036”(復路の選択が解除されたこと)を指定して実行する。
        const message: AlertMessageItem = {
          contentHtml: 'm_dynamic_message-MSG1036',
          isCloseEnable: false,
          alertType: AlertType.INFOMATION,
        };
        let contentId = this._common.alertMessageStoreService.setAlertInfomationMessage(message);
        this._common.alertMessageStoreService.getAlertInfomationMessage();

        // インフォメーション登録処理にて採番されたコンテンツIDを復路選択解除案内コンテンツIDとして保持する。
        this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
          returnTripDeselectionInfoContentID: contentId,
        });
      }

      // 選択AirOffer情報に、画面表示用データ.airOffers.<選択AirOfferId>を設定し、選択中TS・FF情報、ならびに検索結果フッタを画面表示内容に従い再表示する。
      if (this._owd.data) {
        if (this._owd.data.airOffers) {
          this.selectAirOfferInfo = this._owd.data.airOffers[this.selectAirOfferId] as AirOffer;
        }
      }

      // 選択AirOffer情報.bounds[0].totalPrice.discountが存在する場合、選択中TS・FF情報往路プロモーション適用凡例結果有無にtrueを設定する。
      // 往復かどうか=true、かつ選択AirOffer情報.bounds[1].totalPrice.discountが存在する場合、選択中TS・FF情報復路プロモーション適用凡例結果有無にtrueを設定する。
      // プロモーション適用凡例表示判定処理の実行
      this.promotionApplicationDisplay();

      // 選択中復路TS≠””(空欄)の場合、以下の通り引数を設定し、TS別FF情報内のFF情報押下時処理の[運賃変更判定処理]を実施する。
      if (this.selectReturnTripTSID !== '') {
        // 変更前バウンド情報に、変更前AirOffer情報.bounds[比較対象インデックス]
        // 変更後バウンド情報に、選択AirOffer情報.bounds[比較対象インデックス]
        // [運賃変更案内表示判定処理]からtrueが返却された場合、運賃変更案内有無にtrueを設定(インフォメーションメッセージ表示)する。

        // [運賃変更判定処理]からtrueが返却された場合、注意喚起エリアへのインフォメーションメッセージ登録処理に
        // メッセージID＝”MSG1151”(ブッキングクラスが変更となった旨)を指定して実行する。
        let compareIndex: number = 1;
        if (
          this._roundtripFlightAvailabilityService.faresChangeDisplayHandling(
            changeBefore.bounds ?? [],
            this.selectAirOfferInfo.bounds ?? [],
            compareIndex
          )
        ) {
          const message: AlertMessageItem = {
            contentHtml: 'm_dynamic_message-MSG1151',
            isCloseEnable: false,
            alertType: AlertType.INFOMATION,
          };
          let contentId = this._common.alertMessageStoreService.setAlertInfomationMessage(message);
          this._common.alertMessageStoreService.getAlertInfomationMessage();

          // インフォメーション登録処理にて採番されたコンテンツIDを運賃変更案内コンテンツIDとして保持する。
          this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
            fareChangeInfoContentID: contentId,
          });
        }
      }

      // availabilityParamsに設定している値をStoreに反映
      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(
        availabilityParams
      );

      // 選択中TS・FF情報の生成
      if (this._owd.data) {
        if (this._owd.data.roundtripBounds) {
          this._owd.data?.roundtripBounds[0].travelSolutions?.forEach((travelSolution, index) => {
            if (travelSolution.travelSolutionId === this.selectOutboundTSID) {
              this._selectTSFFInfo = this.createSelectTSFFInfo(travelSolution, 0, index);
              /** showPropsの選択中TS・FF情報へ設定 */
              showPropsList[0].selectTSFFInfo = this._selectTSFFInfo;
              /** showPropsの選択未選択にtrue=選択 を設定 */
              showPropsList[0].isShowSelectedTsAndFf = true;
            }
          });
        }
      }

      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
        selectAirOfferId: this.selectAirOfferId,
      });
    } else {
      // 呼び出し元より指定されたバウンドインデックス＝”1”(復路)の場合、以下の処理を行う。
      // 復路選択済み状態にtrue、選択中復路TSに、当該TS.travelSolutionId、選択中復路FFに、当該FF.fareFamilyCodeを設定する。
      availabilityParams.isSelectedReturnTrip = true;
      this.selectReturnTripTSID = travelSolutionId;
      this.selectReturnTripFF = fareFamilyCode;
      this._R01P030Store = this._roundtripFlightAvailabilityService.setSelectTSIDandFF(
        undefined,
        undefined,
        this.selectReturnTripTSID,
        this.selectReturnTripFF
      );

      // 復路選択解除案内コンテンツIDが存在する場合、復路選択解除案内コンテンツIDを引数としてインフォメーション削除処理を実施し、復路選択解除案内コンテンツIDを値なしとする。
      if (this._R01P030Store.returnTripDeselectionInfoContentID) {
        this._common.alertMessageStoreService.removeAlertInfomationMessage(
          this._R01P030Store.returnTripDeselectionInfoContentID
        );
        this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
          returnTripDeselectionInfoContentID: '',
        });
      }

      // 選択AirOfferIdに、画面表示用データ.airOfferMapping.<選択中往路TSID>.<選択中往路FF>.<選択中復路TSID>.<選択中復路FF>.airOfferIdを設定する。
      if (this._owd.data) {
        if (this._owd.data.airOfferMapping) {
          let departureTS = this._owd.data.airOfferMapping?.[this.selectOutboundTSID] as DepartureTravelSolution;
          if (departureTS) {
            let departureFF = departureTS?.[this.selectOutboundFF] as DepartureFareFamily;
            if (departureFF) {
              let returnTS = departureFF?.[this.selectReturnTripTSID] as ReturnTravelSolution;
              if (returnTS) {
                let returnFF = returnTS?.[this.selectReturnTripFF] as ReturnFareFamily;
                if (returnFF) {
                  this.selectAirOfferId = returnFF.airOfferId ?? '';
                }
              }
            }
          }
        }

        if (this._owd.data.airOffers) {
          const airOffersInfo = this._owd.data.airOffers as AirOffers;
          // 選択AirOffer情報に、画面表示用データ.airOffers.<選択AirOfferId>を設定し、選択中TS・FF情報、ならびに検索結果フッタを画面表示内容に従い再表示する。
          this.selectAirOfferInfo = airOffersInfo[this.selectAirOfferId];
        }
      }

      // 検索結果フッタ表示状態に、trueを設定する。
      availabilityParams.searchResultFooterDisplayStatus = true;

      // 往路の場合と同様の[プロモーション適用凡例表示判定処理]を行う。
      // プロモーション適用凡例表示判定処理の実行
      this.promotionApplicationDisplay();

      // 往路と同様の[運賃変更判定処理]を行いtrueが返却された場合、
      // または往路金額が便選択後に変更となった場合
      // 注意喚起エリアへのインフォメーションメッセージ登録処理に
      // メッセージID＝”MSG1151”(運賃が変更となった旨)を指定して実行する。
      let compareIndex: number = 0;
      const changeBeforeBounds = changeBefore.bounds ?? [];
      const selectAirOfferInfoBounds = this.selectAirOfferInfo.bounds ?? [];
      if (
        this._roundtripFlightAvailabilityService.faresChangeDisplayHandling(
          changeBeforeBounds,
          selectAirOfferInfoBounds,
          compareIndex
        ) ||
        changeBeforeBounds[0].totalPrice?.total !== selectAirOfferInfoBounds[0].totalPrice?.total
      ) {
        const message: AlertMessageItem = {
          contentHtml: 'm_dynamic_message-MSG1151',
          isCloseEnable: false,
          alertType: AlertType.INFOMATION,
        };
        let contentId = this._common.alertMessageStoreService.setAlertInfomationMessage(message);
        this._common.alertMessageStoreService.getAlertInfomationMessage();

        // インフォメーション登録処理にて採番されたコンテンツIDを運賃変更案内コンテンツIDとして保持する。
        this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
          fareChangeInfoContentID: contentId,
        });
      }

      // availabilityParamsに設定している値をStoreに反映
      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(
        availabilityParams
      );

      // 選択中TS・FF情報の生成
      if (this._owd.data) {
        if (this._owd.data.roundtripBounds) {
          // 往路側の選択中TS・FF情報の生成
          this._owd.data?.roundtripBounds[0].travelSolutions?.forEach((travelSolution, index) => {
            if (travelSolution.travelSolutionId === this.selectOutboundTSID) {
              this._selectTSFFInfo = this.createSelectTSFFInfo(travelSolution, 0, index);
              /** showPropsの選択中TS・FF情報へ設定 */
              showPropsList[0].selectTSFFInfo = this._selectTSFFInfo;
            }
          });

          // 復路側の選択中TS・FF情報の生成
          this._owd.data.roundtripBounds?.[1]?.travelSolutions?.forEach((travelSolution, index) => {
            if (travelSolution.travelSolutionId === this.selectReturnTripTSID) {
              this._selectTSFFInfo = this.createSelectTSFFInfo(travelSolution, 1, index);
              /** showPropsの選択中TS・FF情報へ設定 */
              this.showProps.selectTSFFInfo = this._selectTSFFInfo;
              showPropsList[1].selectTSFFInfo = this._selectTSFFInfo;
              /** showPropsの選択未選択にtrue=選択 を設定 */
              this.showProps.isShowSelectedTsAndFf = true;
              showPropsList[1].isShowSelectedTsAndFf = true;
            }
          });
        }
      }

      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
        selectAirOfferId: this.selectAirOfferId,
      });
    }

    this.props = {
      ...this.props!,
      showPropsList,
    };

    // 往復かどうか=trueの場合、以下の処理にて、選択されたTS・FFを基に、各TS別FF情報の表示内容更新を行う。
    // TS・FFごとのAirOfferに応じた表示内容更新処理 を実行
    this.airOfferOfTsFfDisplayUpdate();

    // 以下4つの値が全て存在する場合、画面.検索結果フッタの次へボタン活性制御フラグにtrue(活性)を設定する。
    // 選択中往路TSID
    // 選択中往路FF
    // 選択中復路TSID
    // 選択中復路FF
    if (this._R01P030Store.isRoundtrip) {
      if (this.selectOutboundTSID && this.selectOutboundFF && this.selectReturnTripTSID && this.selectReturnTripFF) {
        this.props = {
          ...this.props!,
          activeFooterBtn: false,
          // 検索結果フッタにtrue(非活性)を設定
          isShowFooter: true,
        };
      } else {
        // いずれかひとつでも存在しない場合、false(非活性)を設定する。
        this.props = {
          ...this.props!,
          activeFooterBtn: true,
          // 検索結果フッタにfalse(活性)を設定
          isShowFooter: false,
        };
      }
    } else {
      if (this.selectOutboundTSID && this.selectOutboundFF) {
        this.props = {
          ...this.props!,
          activeFooterBtn: false,
          // 検索結果フッタにtrue(活性)を設定
          isShowFooter: true,
        };
      } else {
        // いずれかひとつでも存在しない場合、false(非活性)を設定する。
        this.props = {
          ...this.props!,
          activeFooterBtn: true,
          // 検索結果フッタにfalse(非活性)を設定
          isShowFooter: false,
        };
      }
    }

    // 選択済みの再設定
    let copyShowPropsList = structuredClone(this.props.showPropsList);
    copyShowPropsList[boundIndex].isShowSelectedTsAndFf = true;
    this.props = {
      ...this.props!,
      showPropsList: copyShowPropsList,
    };
    this._changeDetectorRef.markForCheck();
  }

  /**
   * FF選択モーダルのFF選択ボタン押下時処理の[TS・FFごとのAirOfferに応じた表示内容更新処理]を行う。
   */
  private airOfferOfTsFfDisplayUpdate() {
    // ［以下、TS・FFごとのAirOfferに応じた表示内容更新処理］
    let showAirOfferId = ''; //表示airOfferId | 当該TS内最安AirOffer
    let returnTravelSolution: ReturnTravelSolution | undefined; //復路TS
    let returnFareFamily: ReturnFareFamily; //復路FF
    let tsCheapestAirOfferId = ''; //最安airOfferId
    let tsCheapestAirOffer: AirOffer = {}; //最安airOffer

    // 以下の処理にて、往路の表示内容更新を行う。
    // ＜以下、画面表示用データ.roundtripBounds[0].travelSolutions分、繰り返し＞
    this._owd.data?.roundtripBounds?.[0].travelSolutions?.forEach(
      (travelSolution, tsIndex) => {
        // 当該TS内最安AirOfferId、当該TS内最安AirOfferを初期値を値なしとして用意する。
        // ※(復路側処理)でも使用するため、先にtsCheapestAirOfferId、tsCheapestAirOfferとして初期化済み。
        let tsffInfoList: Array<TSFFInfo> = [];
        // ＜以下、画面表示用データ.roundtripBounds[0].fareFamilies分、繰り返し＞
        this._owd.data?.roundtripBounds?.[0].fareFamilies?.forEach((fareFamilie, ffIndex) => {
          // 画面表示用データ.airOfferMapping.<当該travelSolutions.travelSolutionId>.<当該fareFamilies.fareFamilyCode>を往路情報とする。
          let outboundInfo = this._owd.data?.airOfferMapping?.[travelSolution.travelSolutionId ?? '']?.[
            fareFamilie.fareFamilyCode ?? ''
          ] as DepartureFareFamily;

          if (!this._R01P030Store.isRoundtrip) {
            showAirOfferId = outboundInfo ? outboundInfo.airOfferId : '';
          }

          if (this._R01P030Store.isRoundtrip) {
            // 条件に応じて、当該travelSolutions、当該fareFamiliesに紐づくAirOfferId(以下、表示AirOfferId)を以下とする。
            returnTravelSolution = outboundInfo?.[this.selectReturnTripTSID] as ReturnTravelSolution;
            returnFareFamily = (returnTravelSolution?.[this.selectReturnTripFF] as ReturnFareFamily) ?? {};

            // 以下のいずれかの場合、なし
            // 選択中復路TS=””(空欄)
            // 往路情報.<選択中復路TS>が存在しない
            // 往路情報.<選択中復路TS>.<選択中復路FF>が存在しない
            if (
              this.selectReturnTripTSID === '' ||
              returnTravelSolution === undefined ||
              returnFareFamily === undefined
            ) {
              showAirOfferId = '';
            } else {
              // 上記以外の場合、往路情報.<選択中復路TS>.<選択中復路FF>.airOfferIdを表示airOfferIdとする。
              showAirOfferId = returnFareFamily.airOfferId ?? '';
            }
            // 当該TS内最安AirOfferが値なし、かつ表示airOfferIdが存在する、
            if (tsCheapestAirOffer === undefined && showAirOfferId !== '') {
              // かつ場合、画面表示用データ.airOffers.<表示airOfferId>.isUnselectable=falseの場合、
              if (!this._owd.data?.airOffers?.[showAirOfferId].isUnselectable) {
                // 当該TS内最安AirOfferに画面表示用データ.airOffers.<表示airOfferId>を設定する。
                tsCheapestAirOffer = (this._owd.data?.airOffers?.[showAirOfferId] as AirOffer) ?? {};
                // 当該TS内最安AirOfferを表示AirOfferに設定する。
                this.showAirOffer = tsCheapestAirOffer;
              }
            }

            // 表示airOfferIdが存在しない、または画面表示用データ.airOffers.<表示airOfferId>.isUnselectable=trueの場合、
            // 往路情報.cheapestAirOfferIdを表示airOfferIdとする。
            if (
              showAirOfferId === '' ||
              (this._owd.data?.airOffers?.[showAirOfferId] &&
                this._owd.data?.airOffers?.[showAirOfferId].isUnselectable)
            ) {
              showAirOfferId = outboundInfo?.['cheapestAirOfferId'] as string;
            }
          }

          // 画面表示用データ.airOffers.<表示airOfferId>を表示AirOfferとする。
          this.showAirOffer = (this._owd.data?.airOffers?.[showAirOfferId] as AirOffer) ?? {};

          // 表示AirOfferを基に、TS別FF情報を画面表示内容に従い再表示する。
          tsffInfoList.push(this.getTSFFInfo_new(this.showAirOffer, 0, fareFamilie));

          // ＜ここまで、画面表示用データ.roundtripBounds[0].fareFamilies分、繰り返し＞
        });
        const travelSolutionsAvailability = this._owd.data?.airOffersSummary?.travelSolutionsAvailability;
        // フライトサマリが選択可能か
        let _flightSummaryAvailableFlag: boolean = !(
          travelSolutionsAvailability?.[travelSolution.travelSolutionId ?? '']?.isUnavailable ?? false
        );

        if (this.props && this.props.showPropsList[0].tsList) {
          this.props.showPropsList[0].tsList[tsIndex] = {
            ...this.props.showPropsList[0].tsList[tsIndex]!,
            tsffInfo: tsffInfoList,
            flightSummaryAvailableFlag: _flightSummaryAvailableFlag,
          };
        }
        // 当該TS内最安AirOfferが存在しない場合、
        if (!tsCheapestAirOffer.prices) {
          // 画面表示用データ.airOfferMapping.<当該TS.travelSolutionId>.cheapestAirOfferId を 当該TS内最安AirOfferId、
          let buff = this._owd.data?.airOfferMapping?.[
            travelSolution.travelSolutionId ?? ''
          ] as DepartureTravelSolution;
          tsCheapestAirOfferId = buff?.['cheapestAirOfferId'] as string;

          // 画面表示用データ.airOffers.<表示airOfferId> を 当該TS内最安AirOfferとする。
          tsCheapestAirOffer = (this._owd.data?.airOffers?.[tsCheapestAirOfferId] as AirOffer) ?? {};
        }

        // 当該TS内最安AirOfferを基に、TS別FF情報を画面表示内容に従い再表示する。
        // 選択中TS・FF情報の生成
        if (travelSolution.travelSolutionId === this.selectOutboundTSID) {
          this._selectTSFFInfo = this.createSelectTSFFInfo(travelSolution, 0, tsIndex);
          /** showPropsの選択中TS・FF情報へ設定 */
          this.showProps.selectTSFFInfo = this._selectTSFFInfo;

          /** showPropsの選択未選択にtrue=選択 を設定 */
          this.showProps.isShowSelectedTsAndFf = true;

          // 復路選択済み状態=true(選択済み)の場合、復路のshowPropsの選択未選択にfalse=未選択 を設定
          if (this._R01P030Store.isRoundtrip) {
            const showPropsList: ShowProps[] = JSON.parse(JSON.stringify(this.props?.showPropsList));
            showPropsList[1].isShowSelectedTsAndFf = false;
            this.props = {
              ...this.props!,
              showPropsList,
            };
          }
        }

        // storeを更新する。
        let setData: RoundtripFlightAvailabilityInternationalState = {};
        // 往路選択済み状態にtrue(選択済み)
        setData.isSelectedOutbound = true;
        // 復路選択済み状態にfalse(未選択)
        setData.isSelectedReturnTrip = false;
        this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(setData);
      }

      // ＜ここまで、画面表示用データ.roundtripBounds[0].travelSolutions分、繰り返し＞
    );

    // 以下の処理にて、復路の表示内容更新を行う。
    if (this._R01P030Store.isRoundtrip) {
      // ＜以下、画面表示用データ.roundtripBounds[1].travelSolutions分、繰り返し＞
      this._owd.data?.roundtripBounds?.[1]?.travelSolutions?.forEach((travelSolution, tsIndex) => {
        let tsffInfoList: Array<TSFFInfo> = [];
        // 画面表示用データ.airOfferMapping.<選択中往路TSID>.<選択中往路FF>を往路情報とする。
        let outboundInfo = this._owd.data?.airOfferMapping?.[this.selectOutboundTSID ?? '']?.[
          this.selectOutboundFF ?? ''
        ] as DepartureFareFamily;
        // ＜以下、画面表示用データ.roundtripBounds[1].fareFamilies分、繰り返し＞
        this._owd.data?.roundtripBounds?.[1]?.fareFamilies?.forEach((fareFamilie, ffIndex) => {
          // 表示AirOfferをクリア
          this.showAirOffer = {};

          // 条件に応じて、当該travelSolutions、当該fareFamiliesに紐づくAirOfferId(以下、表示AirOfferId)を以下とする。
          if (outboundInfo) {
            // 往路情報.<当該travelSolutions.travelSolutionId>を取得
            returnTravelSolution = outboundInfo?.[travelSolution.travelSolutionId ?? ''] as ReturnTravelSolution;
            if (returnTravelSolution) {
              // 往路情報.<当該travelSolutions.travelSolutionId>.<当該FF.fareFamilyCode>を取得
              returnFareFamily = returnTravelSolution?.[fareFamilie.fareFamilyCode ?? ''] as ReturnFareFamily;
            }
          }

          // 以下のいずれかの場合、なし
          // 往路情報.<当該travelSolutions.travelSolutionId>が存在しない
          // 往路情報.<当該travelSolutions.travelSolutionId>.<当該FF.fareFamilyCode>が存在しない
          if (returnTravelSolution === undefined || returnFareFamily === undefined) {
            showAirOfferId = '';
          } else {
            // 上記以外の場合、	往路情報.<当該TS.travelSolutionId>.<当該FF.fareFamilyCode>.airOfferId
            showAirOfferId = returnFareFamily.airOfferId ?? '';
          }

          // 表示airOfferIdが存在する、かつ画面表示用データ.airOffers.<表示airOfferId>.isUnselectable=falseの場合、
          // 画面表示用データ.airOffers.<表示airOfferId>を表示AirOfferとする。
          if (
            showAirOfferId !== '' &&
            this._owd.data?.airOffers?.[showAirOfferId] &&
            !this._owd.data?.airOffers?.[showAirOfferId].isUnselectable
          ) {
            this.showAirOffer = (this._owd.data?.airOffers?.[showAirOfferId] as AirOffer) ?? {};
          }

          // 表示AirOfferを基に、TS別FF情報を画面表示内容に従い再表示する。
          // ※ 表示AirOfferが値なしの場合も、値なしの情報を基にした更新を行う。
          tsffInfoList.push(this.getTSFFInfo_new(this.showAirOffer, 1, fareFamilie));

          // ＜ここまで、画面表示用データ.roundtripBounds[1].fareFamilies分、繰り返し＞
        });
        const travelSolutionsAvailability = this._owd.data?.airOffersSummary?.travelSolutionsAvailability;
        // フライトサマリが選択可能か
        let _flightSummaryAvailableFlag: boolean = !(
          travelSolutionsAvailability?.[travelSolution.travelSolutionId ?? '']?.isUnavailable ?? false
        );

        if (this.props && this.props.showPropsList[1] && this.props.showPropsList[1].tsList) {
          this.props.showPropsList[1].tsList[tsIndex] = {
            ...this.props.showPropsList[1].tsList[tsIndex]!,
            tsffInfo: tsffInfoList,
            flightSummaryAvailableFlag: _flightSummaryAvailableFlag,
          };
        }

        // 往路情報.<当該TS.travelSolutionId>.cheapestAirOfferIdを当該TS内最安airOfferIdとする。
        tsCheapestAirOfferId = returnTravelSolution?.['cheapestAirOfferId'] as string;

        // 当該TS内最安airOfferIdが存在する、かつ画面表示用データ.airOffers.<当該TS内最安airOfferId>.isUnselectable=falseの場合、
        // 画面表示用データ.airOffers.<当該TS内最安airOfferId>を当該TS内最安AirOfferとする。
        if (this._owd.data?.airOffers?.[tsCheapestAirOfferId] !== undefined) {
          if (tsCheapestAirOfferId !== '' && !this._owd.data?.airOffers?.[tsCheapestAirOfferId].isUnselectable) {
            tsCheapestAirOffer = (this._owd.data?.airOffers?.[tsCheapestAirOfferId] as AirOffer) ?? {};
          }
        }

        // 当該TS内最安AirOfferを基に、TS別FF情報を画面表示内容に従い再表示する。
        // ※ 表示AirOfferが値なしの場合も、値なしの情報を基にした更新を行う。

        // 選択中TS・FF情報の生成
        this._selectTSFFInfo = this.createSelectTSFFInfo(travelSolution, 1, tsIndex);
        /** showPropsの選択中TS・FF情報へ設定 */
        this.showProps.selectTSFFInfo = this._selectTSFFInfo;
        /** showPropsの選択未選択にtrue=選択 を設定 */
        this.showProps.isShowSelectedTsAndFf = true;

        // ＜ここまで、画面表示用データ.roundtripBounds[1].travelSolutions分、繰り返し＞
      });
    }

    // FF選択モーダルを閉じる。
    const FareFamilySelectorModalComponentInstance = new FareFamilySelectorModalComponent(
      this._common,
      this._commonSliderComponent
    );
    FareFamilySelectorModalComponentInstance.closeModal();

    // ［ここまで、TS・FFごとのAirOfferに応じた表示内容更新処理］

    // フッタ用内訳表示情報を設定
    if (this.props) {
      this.props.selectedAirOffer = this.createFooter();
    }
  }

  /**
   * TS別FF情報
   * @param travelSolution
   * @param boundIndex
   * @returns
   */
  private getTSFFInfo_new(airOffer: AirOffer, boundIndex: number, fareFamilie: FareFamilies): TSFFInfo {
    if (airOffer === undefined || airOffer.bounds === undefined) {
      return { isAvailable: false, fareFamilyName: this.getFareFamilyName(boundIndex) };
    } else {
      let isSelected = false;
      // 選択中であるかどうか設定
      // 以下いずれかの条件を満たす場合、選択中のTS別FF情報である、とする。
      // 1	当該バウンドリストのインデックス=0、かつ表示AirOffer.bounds[0].travelSolutionId=選択中往路TSID、かつ表示AirOffer.bounds[0].fareFamilyCode=選択中往路FF
      // 2	当該バウンドリストのインデックス=1、かつ表示AirOffer.bounds[1].travelSolutionId=選択中復路TSID、かつ表示AirOffer.bounds[1].fareFamilyCode=選択中復路FF
      if (
        boundIndex === 0 &&
        airOffer.bounds[0]?.travelSolutionId === this.selectOutboundTSID &&
        airOffer.bounds[0]?.fareFamilyCode === this.selectOutboundFF
      ) {
        isSelected = true;
      }
      if (
        boundIndex === 1 &&
        airOffer.bounds[1]?.travelSolutionId === this.selectReturnTripTSID &&
        airOffer.bounds[1]?.fareFamilyCode === this.selectReturnTripFF
      ) {
        isSelected = true;
      }
      // 読み上げ用ラベル設定
      // 便名リスト文字列作成
      let airportNameList: string[] = this.getAirportNameList(airOffer, boundIndex);
      let displayContent = this.getDisplayContent(airOffer, fareFamilie);

      // FF名称マップより表示airOfferId.bounds[当該バウンドのインデックス].fareFamilyCodeをキーに取得したFF名称
      const tsffInfo: TSFFInfo = {
        isAvailable: true,
        isSelected: isSelected,
        /** 最安支払総額である旨の表示 */
        isLowestPrice: airOffer.prices?.isCheapest ?? false,
        /** プロモーション適用済アイコン */
        isPromotionApplied: airOffer?.bounds[boundIndex]?.totalPrice?.discount ? true : false,
        /** 金額 */
        price: airOffer?.bounds[boundIndex]?.totalPrice?.total ?? 0,
        /** プロモーション適用前金額 */
        originalPrice: airOffer?.bounds[boundIndex]?.totalPrice?.discount?.originalTotal ?? undefined,
        // 残席状況 enough：十分空席あり available：空席あり few：残席実数 soldOut：売り切れ
        quotaType: airOffer?.bounds[boundIndex]?.quotaType ?? 'soldOut',
        /** 残席数 */
        quota: airOffer?.bounds[boundIndex]?.quota ?? undefined,
        /** FFコード */
        fareFamilyCode: airOffer.bounds?.[boundIndex].fareFamilyCode,
        /** FF名称 */
        fareFamilyName: this.getFareFamilyName(boundIndex),
        /** FF選択表示ボタン */
        // FF選択表示ボタンの表示有無はHTML単独で出し分けるためstateで管理しない
        // 読み上げ用ラベル設定
        // 便名リスト文字列
        airportNameListStr: airportNameList?.join(' '),
        // 汎用マスターデータ(リスト)表示内容
        displayContent: displayContent,
      };
      return tsffInfo;
    }
  }

  /**
   * 便名リスト文字列取得処理
   * @param airOffer
   * @param boundIndex
   * @returns
   */
  private getAirportNameList(airOffer: AirOffer, boundIndex: number): string[] {
    // 返却値の便名リスト文字列を初期化
    let airportNameList: string[] = [];

    if (airOffer === undefined || airOffer.bounds === undefined) {
      // 引数が不足している場合は空のリストを返却
      return airportNameList;
    } else {
      // 読み上げ用ラベル設定 便名リスト文字列作成
      // 引数のboundIndexを基に、OWDよりtravelSolutionsを特定し、繰り返し
      if (this._owd.data?.roundtripBounds) {
        if (this._owd.data?.roundtripBounds[boundIndex]) {
          this._owd.data?.roundtripBounds[boundIndex].travelSolutions?.forEach((travelSolution) => {
            // 引数のairOfferのtravelSolutionIdと一致する場合、当該travelSolutionの販売キャリアコードと便番号をリストに追加
            if (airOffer.bounds && travelSolution.travelSolutionId === airOffer.bounds[boundIndex].travelSolutionId) {
              travelSolution.flights?.forEach((flight) => {
                airportNameList.push((flight.marketingAirlineCode ?? '') + (flight.marketingFlightNumber ?? ''));
              });
            }
          });
        }
      }
      return airportNameList;
    }
  }

  /**
   * 便名リスト文字列取得処理
   * @param airOffer
   * @param fareFamilie
   * @returns
   */
  private getDisplayContent(airOffer: AirOffer, fareFamilie: FareFamilies): string {
    // 返却値の便名リスト文字列を初期化
    let displayContent: string = '';
    if (airOffer === undefined || airOffer.bounds === undefined) {
      // 引数が不足している場合は空のリストを返却
      return displayContent;
    } else {
      // データコード=“PD_930”(表示用クラス名称)、value=クラス名称コード(※)となるASWDB(マスタ)の汎用マスターデータ(リスト).表示内容
      // (※)以下を区切り文字(-(ハイフン))で連結した値
      // “R”(有償)
      // 検索結果旅程種別
      // 当該FF.fareFamilyWithService.cabin
      let value = `R-${this._R01P030Store.searchResultItineraryType}-${fareFamilie.fareFamilyWithService?.cabin}`;
      displayContent = this.getPD930Content(value);

      return displayContent;
    }
  }

  /**
   * プロモーション適用凡例表示判定処理
   */
  private promotionApplicationDisplay(): void {
    // [以下、プロモーション適用凡例表示判定処理]
    let storeParams: RoundtripFlightAvailabilityInternationalState = {};
    let toUpdate: boolean = false;

    // 選択AirOffer情報.bounds[0].totalPrice.discountが存在する場合、選択中TS・FF情報往路プロモーション適用凡例結果有無にtrueを設定する。
    if (this.selectAirOfferInfo?.bounds?.[0].totalPrice?.discount) {
      storeParams.isSelectedOutboundPromotionApplied = true;
      toUpdate = true;
    }

    // 往復かどうか=true、かつ選択AirOffer情報.bounds[1].totalPrice.discountが存在する場合、選択中TS・FF情報復路プロモーション適用凡例結果有無にtrueを設定する。
    if (this._R01P030Store?.isRoundtrip && this.selectAirOfferInfo?.bounds?.[1].totalPrice?.discount) {
      storeParams.isSelectedOutboundPromotionApplied = true;
      toUpdate = true;
    }

    //設定した選択中TS・FF情報復路プロモーション適用凡例結果有無が存在する場合、store更新
    if (toUpdate) {
      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(storeParams);
    }
    // [ここまで、プロモーション適用凡例表示判定処理]
  }

  // プロモーション適用があるかどうか判定する
  private createPromotionApplied(index: number) {
    if (
      index === 0 &&
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData
        .isOutboundPromotionApplied
    ) {
      return true;
    }

    if (
      index === 1 &&
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData
        .isReturnTripPromotionApplied
    ) {
      return true;
    }

    return false;
  }

  /**
   * 選択中TS・FF情報(選択済の場合)
   * @param bound
   * @param boundIndex
   * @param tsListIndex
   * @returns
   */
  private createSelectTSFFInfo(bound: Bound, boundIndex: number, tsListIndex: number): SelectTSFFInfo {
    let _fareFamilyCode: string = '';
    if (this.selectAirOfferInfo) {
      if (this.selectAirOfferInfo.bounds) {
        if (this.selectAirOfferInfo.bounds[boundIndex]) {
          if (this.selectAirOfferInfo.bounds[boundIndex].fareFamilyCode) {
            _fareFamilyCode = this.selectAirOfferInfo.bounds[boundIndex].fareFamilyCode ?? '';
          }
        }
      }
    }

    const result: SelectTSFFInfo = {
      tsListIndex: tsListIndex,
      /** プロモーション適用凡例 */
      isPromotionApplied: this.getIsPromotionApplied(boundIndex),
      /**
       * 遅延情報～ACVに応じたラベルもしくは画像
       * （フライトサマリと同じ）
       */
      flightSummary: this._flightPlanService.getFlightSummary(bound, boundIndex),
      /** フライト詳細表示 */
      flightDetail: '',
      /** プロモーション適用済アイコン */
      isPromotionAppliedIcon:
        this.selectAirOfferInfo?.bounds === undefined
          ? false
          : this.selectAirOfferInfo?.bounds![boundIndex]?.totalPrice?.discount !== undefined,
      /** 最安支払総額である旨の表示 */
      lowestPrice: this.selectAirOfferInfo?.prices?.isCheapest,
      /** 金額 */
      price:
        this.selectAirOfferInfo?.bounds === undefined
          ? ''
          : String(this.selectAirOfferInfo?.bounds![boundIndex]?.totalPrice?.total ?? 0),
      /** プロモーション適用前金額 */
      originalPrice: this.getBoundOriginalPrice(boundIndex),
      /** FFコード */
      fareFamilyCode: _fareFamilyCode,
      /** FF名称 */
      fareFamilyName: this.selectAirOfferInfo?.bounds === undefined ? '' : this.ffNameMap.get(_fareFamilyCode) ?? '',
      /** FF選択表示ボタン */
      selectFareFamilyButton: true,
      /** フライト再選択ボタン */
      reSelectFlightButton: true,
    };

    // 選択AirOffer情報をstoreに設定
    let setData: RoundtripFlightAvailabilityInternationalState = {};
    setData.selectAirOfferInfo = this.selectAirOfferInfo;
    this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(setData);
    this._R01P030Store =
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData;

    return result;
  }

  /**
   * フィルタ条件モーダル適用ボタン押下時の処理
   */
  private async pushFilterConditionModalBtn(data: FilterConditionData) {
    this._pageLoadingService.startLoading();
    // フィルター条件モーダルの状態を保存
    this.filterConditionInfo = data;
    this.showDisplay();

    // 選択TS変更案内コンテンツIDが存在する場合、選択TS変更案内コンテンツIDを引数としてインフォメーション削除処理を実施し、選択TS変更案内コンテンツIDを値なしとする。
    if (this._R01P030Store.selectedTsChangeInfoContentID) {
      // インフォメーション削除
      this._common.alertMessageStoreService.removeAlertInfomationMessage(
        this._R01P030Store.selectedTsChangeInfoContentID
      );
      // 選択TS変更案内コンテンツIDを値なし
      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
        selectedTsChangeInfoContentID: '',
      });
    }

    // バックアップがない場合、画面表示用データ(バックアップ)として、画面表示用データを複製した情報を保持する処理を実施
    if (!this.backupDisplayData && this._roundtripOwdService.roundtripOwdData) {
      this.backupDisplayData = this._roundtripOwdService.roundtripOwdData;
    }

    // この処理で使う画面表示用データ
    let displayData: RoundtripOwdState;

    let selectedTransitAirport: BoundFilterItem[];
    let isDesignatedTransitAirport: boolean = false;

    if (data.boundFilterItemList) {
      // フィルタ条件入力情報.バウンド毎のフィルタ項目、当該バウンド毎のフィルタ項目.乗継空港リストについて、
      // 当該乗継空港.チェック状態=trueとなる乗継空港が存在する場合、乗継空港指定ありとする。
      selectedTransitAirport = data.boundFilterItemList.filter(
        (v) => v.transitAirportList && v.transitAirportList.filter((airPort) => airPort.isEnabled === true).length > 0
      );
      // 乗継空港指定（true:指定あり false:指定なし）
      isDesignatedTransitAirport = selectedTransitAirport.length > 0;
    }

    // 乗継空港指定ありの場合、乗継空港を変更した空席照会結果を取得するための処理を行う
    if (isDesignatedTransitAirport) {
      // リクエスト検索条件をテンポラリ検索条件に格納する
      let temporaryRequestCondition: RoundtripOwdRequest | undefined = JSON.parse(
        JSON.stringify(this._R01P030Store.roundtripOwdRequest)
      );

      if (data.boundFilterItemList) {
        // フィルタ条件入力情報.バウンド毎のフィルタ項目を要素数分繰り返し、以下の処理を行う。
        data.boundFilterItemList.forEach((value, index) => {
          // 選択乗継空港リストとして空のリストを作成する
          const selectedTransitAirportLists: Array<string> = [];
          if (value.transitAirportList) {
            const selectedTransitAirport = value.transitAirportList.filter((airport) => airport.isEnabled === true);
            if (selectedTransitAirport.length > 0) {
              for (let h = 0; h < selectedTransitAirport.length; h++) {
                // 検索条件を見るのでSearchForAirportCodeCacheを使用
                let _airPorts: AirportI18nSearchForAirportCodeCache =
                  this._aswMasterSvc.aswMaster[MASTER_TABLE.AIRPORT_I18N_SEARCH_FOR_AIRPORT_CODE.key];
                let airPorts = _airPorts[selectedTransitAirport[h].code ?? ''];
                for (let i = 0; i < airPorts.length; i++) {
                  if (airPorts[i].search_for_airport_code === selectedTransitAirport[h].code) {
                    selectedTransitAirportLists.push(airPorts[i].search_for_airport_code);
                    break;
                  }
                }
                if (selectedTransitAirportLists.length === 0 && selectedTransitAirport[h].code) {
                  selectedTransitAirportLists.push(selectedTransitAirport[h].code ?? '');
                }
              }
            }
            if (selectedTransitAirportLists.length > 0 && temporaryRequestCondition) {
              temporaryRequestCondition.itineraries[index] = {
                ...temporaryRequestCondition.itineraries[index],
                connection: {
                  locationCodes: selectedTransitAirportLists,
                },
              };
            }
            // 乗継時間初期値を設定
            let initialConnectionTime = temporaryRequestCondition?.itineraries[index].connection?.time ?? 0;
            if (
              value.transitTimeRange &&
              value.transitTimeRange.selectedMinValue &&
              value.transitTimeRange.selectedMinValue !== initialConnectionTime &&
              temporaryRequestCondition
            ) {
              temporaryRequestCondition.itineraries[index] = {
                ...temporaryRequestCondition.itineraries[index],
                connection: {
                  locationCodes: selectedTransitAirportLists,
                  time: Number(value.transitTimeRange.selectedMinValue),
                },
              };
            }
          }
        });
      }
      // 往復指定日空席照会(OWD)用API呼び出し、エラーの場合の処理終了
      if (temporaryRequestCondition && !(await this._getAPI_OWD(temporaryRequestCondition))) {
        // エラーの場合処理終了
        return;
      }

      // 往復指定日空席照会(OWD)用レスポンス.warnings[0].code="WBAZ000198"(検索結果なし)の場合、処理終了
      if (this._owd.warnings?.[0].code === ErrorCodeConstants.ERROR_CODES.WBAZ000198) {
        this.showDisplay();
        this._changeDetectorRef.detectChanges();
        // エラーメッセージID＝”E0228”にて継続可能なエラー情報を指定
        const pageType: PageType = PageType.PAGE;
        const errorInfo: RetryableError = {
          errorMsgId: 'E0228',
          apiErrorCode: ErrorCodeConstants.ERROR_CODES.WBAZ000198,
        };
        this._errorsHandlerSvc.setRetryableError(pageType, errorInfo);
        return;
      }

      this._pageLoadingService.startLoading();

      // レスポンス結果を画面表示用データに格納する
      displayData = structuredClone(this._owd);
    } else {
      // バックアップ用画面表示用データを画面表示用データに格納する
      displayData = structuredClone(this.backupDisplayData!);
    }

    // 以下から画面表示用データのフィルター処理

    // フィルタ条件入力情報.選択可能な便=trueの場合、画面表示用データ.airOffersから、画面表示用データ.airOffers.<airOfferId>.isUnselectable=falseのデータのみを抽出し、
    // 抽出した結果で画面表示用データ.airOffersを上書きする
    if (data.isAvailable === true) {
      if (displayData?.data?.airOffers && Object.keys(displayData.data.airOffers).length !== 0) {
        const extractedAirOffers: AirOffers = {};
        for (const [airOfferId, airOffer] of Object.entries(displayData.data.airOffers)) {
          if (airOffer.isUnselectable === false) {
            extractedAirOffers[airOfferId] = airOffer as AirOffers;
          }
        }
        displayData.data.airOffers = extractedAirOffers;
      }
    }

    // 支払総額のスライダーが操作された場合、以下の処理を実施
    if (displayData?.data?.airOffers && Object.keys(displayData.data.airOffers).length !== 0 && data.budgetRange) {
      if (
        displayData.data.airOffersSummary?.minPrice?.total !== undefined &&
        (data.budgetRange.selectedMinValue !== displayData.data.airOffersSummary?.minPrice?.total ||
          data.budgetRange.selectedMaxValue !== displayData.data.airOffersSummary?.maxTotalPrice?.total)
      ) {
        const extractedAirOffers: AirOffers = {};
        for (const [airOfferId, airOffer] of Object.entries(displayData.data.airOffers)) {
          if (data.budgetRange?.selectedMinValue && data.budgetRange?.selectedMaxValue) {
            if (
              airOffer?.prices?.totalPrice?.total &&
              airOffer.prices?.totalPrice?.total >= Number(data.budgetRange?.selectedMinValue) &&
              airOffer.prices?.totalPrice?.total <= Number(data.budgetRange?.selectedMaxValue)
            ) {
              extractedAirOffers[airOfferId] = airOffer as AirOffers;
            }
          }
        }
        displayData.data.airOffers = extractedAirOffers;
      }
    }

    // 選択変更可条件リスト
    const selectedChangeableConditions: string[] = [];
    // 選択払戻可条件リスト
    const selectedRefundableConditions: string[] = [];
    // 選択アップグレード可条件リスト
    const selectedUpgradableConditions: string[] = [];
    // 運賃タイプリストの作成処理開始
    if (displayData?.data?.airOffers && Object.keys(displayData.data.airOffers).length !== 0) {
      if (data.fareType) {
        // 選択変更可条件リスト作成
        for (let i = 0; i < 2; i++) {
          if (data.fareType[i].isEnabled === true) {
            selectedChangeableConditions.push(data.fareType[i].value);
          }
        }
        // 選択払戻可条件リスト作成
        for (let i = 2; i < 4; i++) {
          if (data.fareType[i].isEnabled === true) {
            selectedRefundableConditions.push(data.fareType[i].value);
          }
        }
        // 選択アップグレード可条件リスト作成
        for (let i = 4; i < data.fareType.length; i++) {
          if (data.fareType[i].isEnabled === true) {
            selectedUpgradableConditions.push(data.fareType[i].value);
          }
        }
      }
    }

    // 選択変更可条件リスト・選択払戻可条件リスト・選択アップグレード可条件リストが全て空の場合は6.4は実施しない
    if (
      selectedChangeableConditions.length > 0 ||
      selectedRefundableConditions.length > 0 ||
      selectedUpgradableConditions.length > 0
    ) {
      if (displayData?.data?.airOffers && Object.keys(displayData.data.airOffers).length !== 0) {
        const airOffersInfo = displayData.data.airOffers as AirOffers;
        const extractedAirOffers: AirOffers = {};
        for (const [airOfferId, airOffer] of Object.entries(airOffersInfo)) {
          // 選択変更可条件リストを使用した絞り込み処理
          if (selectedChangeableConditions.length > 0) {
            airOffer.bounds?.forEach((bound) => {
              if (bound.changeConditionsType && selectedChangeableConditions.includes(bound.changeConditionsType)) {
                extractedAirOffers[airOfferId] = airOffer;
              }
            });
          }

          // 選択払戻可条件リストを使用した絞り込み処理
          if (selectedRefundableConditions.length > 0) {
            airOffer.bounds?.forEach((bound) => {
              if (bound.refundConditionsType && selectedRefundableConditions.includes(bound.refundConditionsType)) {
                extractedAirOffers[airOfferId] = airOffer;
              }
            });
          }

          // 選択アップグレード可条件リストを使用した絞り込み処理
          if (selectedUpgradableConditions.length > 0) {
            airOffer.bounds?.forEach((bound) => {
              bound.flights?.forEach((flight) => {
                flight.upgradableCabins?.forEach((upgradableCabin) => {
                  if (selectedUpgradableConditions.includes(upgradableCabin)) {
                    extractedAirOffers[airOfferId] = airOffer;
                  }
                });
              });
            });
          }
        }
        displayData.data.airOffers = extractedAirOffers;
      }
    }

    // 無料預け入れ手荷物許容量のフィルタ処理
    // 選択無料預け入れ手荷物許容量リストを作成する
    const selectedBaggageAllowance: number[] = [];
    if (
      displayData?.data?.airOffers &&
      Object.keys(displayData.data.airOffers).length !== 0 &&
      data.baggageAllowanceList
    ) {
      // フィルタ条件入力情報.無料預け入れ手荷物許容量を繰り返し、当該無料預け入れ手荷物許容量.チェック状態=trueの場合、
      // 選択無料預け入れ手荷物許容量リストに当該無料預け入れ手荷物許容量.許容量を追加する
      for (let i = 0; i < data.baggageAllowanceList.length; i++) {
        if (data.baggageAllowanceList[i].isEnabled === true && data.baggageAllowanceList[i].item) {
          selectedBaggageAllowance.push(data.baggageAllowanceList[i].item!);
        }
      }
      // 選択無料預け入れ手荷物許容量リストが空でない場合、以下の処理を実施
      if (displayData.data.airOffers && selectedBaggageAllowance.length > 0) {
        const extractedAirOffers: AirOffers = {};
        for (const [airOfferId, airOffer] of Object.entries(displayData.data.airOffers)) {
          for (let i = 0; airOffer.bounds && i < airOffer.bounds.length; i++) {
            if (
              airOffer.bounds[i].minFreeCheckedBaggageQuantity &&
              selectedBaggageAllowance.includes(airOffer.bounds[i].minFreeCheckedBaggageQuantity!)
            ) {
              extractedAirOffers[airOfferId] = airOffer as AirOffers;
            }
          }
        }
        displayData.data.airOffers = extractedAirOffers;
      }
    }

    // 画面表示用データ.airOffersが存在する、かつ画面表示用データ.airOffersの要素数≠0、かつフィルタ条件入力情報.プロモーション適用AirOfferのみ=trueの場合、以下の処理を実施
    if (
      displayData?.data?.airOffers &&
      Object.keys(displayData.data.airOffers).length !== 0 &&
      data.isOnlyPromotionCodeAvailable === true
    ) {
      const extractedAirOffers: AirOffers = {};
      for (const [airOfferId, airOffer] of Object.entries(displayData.data.airOffers)) {
        if (airOffer?.prices?.totalPrice?.discount) {
          extractedAirOffers[airOfferId] = airOffer as AirOffers;
        }
      }
      displayData.data.airOffers = extractedAirOffers;
    }

    // 画面表示用データ.airOffersが存在する、かつ画面表示用データ.airOffersの要素数=0場合、以下の処理を行い、適用ボタン押下時処理を終了する
    if (displayData?.data?.airOffers && Object.keys(displayData.data.airOffers).length === 0) {
      // 以下の処理にてairOffers以外の項目へもフィルタ結果の適用を行い、
      displayData.data?.roundtripBounds?.forEach((roundtripBound) => {
        // 画面表示用データ.roundtripBoundsについて、各roundtripBounds.travelSolutionsを空の配列で上書きする
        roundtripBound.travelSolutions = [];
        // 画面表示用データ.roundtripBoundsについて、各roundtripBounds.fareFamiliesを空の配列で上書きする
        roundtripBound.fareFamilies = [];
      });
      // 画面表示用データ.airOfferMappingを空のオブジェクトで上書きする
      if (displayData.data) {
        displayData.data.airOfferMapping = {};
      }
      this._owd = displayData;
      this._roundtripOwdDisplayService.updateRoundtripOwdDisplay(this._owd);
      this.showDisplay();
      this._changeDetectorRef.detectChanges();

      // 表示TS0件案内コンテンツIDが存在しない場合、注意喚起エリアへのインフォメーションメッセージ登録処理にメッセージID＝”MSG1035”(表示可能なTSが0件になった旨)を指定して実行する。
      if (!this._R01P030Store.displayTs0InfoContentID) {
        const message: AlertMessageItem = {
          contentHtml: 'MSG1035',
          isCloseEnable: false,
          alertType: AlertType.INFOMATION,
        };
        let contentId = this._common.alertMessageStoreService.setAlertInfomationMessage(message);
        this._common.alertMessageStoreService.getAlertInfomationMessage();
        // インフォメーション登録処理にて採番されたコンテンツIDを表示TS0件案内コンテンツIDとして保持する。
        this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
          displayTs0InfoContentID: contentId,
        });
      }
      return;
    }

    // 以下の処理で画面表示用データ.airOffersに存在するairOffersのみのairOfferMappingを抽出する
    if (displayData.data?.airOfferMapping) {
      // 画面表示用データ.airOffersよりキー(airOfferId)のリストを取得し、AirOfferIdリストとする
      const airOfferIdList = Object.keys(displayData.data.airOffers ?? {});
      // 往復かどうか=falseの場合、
      if (this._R01P030Store.isRoundtrip === false) {
        // 更新用AirOfferMappingを空のマップとして初期化
        let newAirOfferMapping: RoundtripOwdResponseDataAirOfferMapping = {};

        // 以下、画面表示用データ.airOfferMappingの件数分繰り返し
        Object.entries(displayData.data.airOfferMapping).forEach(([outBoundTsId, outBoundTsMap]) => {
          // 更新用往路TSマップを空のマップで初期化する
          let newOutBoundTsMap: RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInner = {};

          // 以下、当該AirOfferMapping.<往路のtravelSolutionId>のマップ(往路TSマップ)の件数分繰り返し
          Object.entries(outBoundTsMap).forEach(([outBoundFfCode, outBoundFfMap]) => {
            // 当該往路TSマップのキーがcheapestAirOfferIdの場合、次の繰り返しを処理する
            if (outBoundFfCode === 'cheapestAirOfferId') {
              // forEachコールバック関数のreturnなので、やってることはcontinueと同じ
              return;
            } else if (outBoundFfMap) {
              // 当該往路TSマップ.<往路のFareFamilyCode>.airOfferIdがAirOfferIdリストに含まれる場合、以下の処理を行う。
              const airOfferId = (<RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInner>(
                outBoundFfMap
              )).airOfferId;
              if (airOfferId && airOfferIdList.includes(airOfferId)) {
                // 更新用往路TSマップに当該往路TSマップ.<往路のFareFamilyCode>を追加する
                newOutBoundTsMap[outBoundFfCode] = outBoundFfMap;
                // 当該往路TSマップ.cheapestAirOfferIdと当該往路TSマップ.<往路のFareFamilyCode>.airOfferIdが同一の場合、
                if (outBoundTsMap.cheapestAirOfferId === airOfferId) {
                  // 更新用往路TSマップにキー: cheapestAirOfferId、値: 当該往路TSマップ.<往路のFareFamilyCode>.airOfferIdを追加する
                  newOutBoundTsMap.cheapestAirOfferId = airOfferId;
                }
              }
            }
          });
          // 便宜上、最後の要素の処理はforEach終了直後に処理を回している。処理内容に影響はない
          // 当該往路TSマップが最後の要素、かつ更新用往路TSマップが空ではない、かつ更新用往路TSマップにキー: cheapestAirOfferIdが存在しない場合、以下の処理を行う。
          if (this.isNotEmpty(newOutBoundTsMap) && !newOutBoundTsMap.cheapestAirOfferId) {
            // 最安金額を初期値Number.MAX_VALUE、最安Idを初期値空の文字列とする
            let cheapestPrice = Number.MAX_VALUE;
            let cheapestAirOfferId = '';
            // 以下、更新用往路TSマップの件数分繰り返し
            Object.values(newOutBoundTsMap).forEach((outBoundFfMap) => {
              // 画面表示用データ.airOffers.<当該更新用往路TSマップ.airOfferId>.isUnselectable=false、
              // かつ画面表示用データ.airOffers.<当該更新用往路TSマップ.airOfferId>.prices.totalPrice.total<最安金額の場合、
              // 最安金額に画面表示用データ.airOffers.<当該更新用往路TSマップ.airOfferId>.prices.totalPrice.total
              // 最安Idに当該更新用往路TSマップ.airOfferIdを設定する
              const airOfferId = (<RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInner>(
                outBoundFfMap
              )).airOfferId!;
              const airOffers = displayData.data?.airOffers?.[airOfferId];
              if (airOffers) {
                const isUnselectable = airOffers.isUnselectable;
                const totalPrice = airOffers.prices?.totalPrice?.total;
                if (isUnselectable === false && totalPrice && totalPrice < cheapestPrice) {
                  cheapestPrice = totalPrice;
                  cheapestAirOfferId = airOfferId;
                }
              }
            });
            // ここまで、更新用往路TSマップの件数分繰り返し
            // 更新用往路TSマップにキー: cheapestAirOfferId、値: 最安Idを追加する。
            newOutBoundTsMap.cheapestAirOfferId = cheapestAirOfferId;
          }

          // ここまで、当該AirOfferMapping.<往路のtravelSolutionId>のマップ(往路TSマップ)の件数分繰り返し
          // 更新用往路TSマップが空でない場合、更新用airOfferMappingにキー: 往路のtravelSolutionId、値: 更新用往路TSマップを追加する。
          if (this.isNotEmpty(newOutBoundTsMap)) {
            newAirOfferMapping[outBoundTsId] = newOutBoundTsMap;
          }
        });
        // ここまで、画面表示用データ.airOfferMappingの件数分繰り返し
        // 画面表示用データ.airOfferMappingを更新用AirOfferMappingで上書きする。
        displayData.data.airOfferMapping = newAirOfferMapping;
      } else {
        // 往復かどうか=trueの場合、以下の処理を行う
        // 更新用AirOfferMappingを空のマップとして初期化
        let newAirOfferMapping: RoundtripOwdResponseDataAirOfferMapping = {};

        // 以下、画面表示用データ.airOfferMappingの件数分繰り返し
        Object.entries(displayData.data.airOfferMapping).forEach(([outBoundTsId, outBoundTsMap]) => {
          // 更新用往路TSマップを空のマップで初期化する
          let newOutBoundTsMap: RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInner = {};

          // 以下、当該AirOfferMapping.<往路のtravelSolutionId>のマップ(往路TSマップ)の件数分繰り返し
          Object.entries(outBoundTsMap).forEach(([outBoundFfCode, outBoundFfMap]) => {
            // 当該往路TSマップのキーがcheapestAirOfferIdの場合、次の繰り返しを処理する
            if (outBoundFfCode === 'cheapestAirOfferId') {
              return;
            } else if (outBoundFfMap) {
              // 更新用往路FFマップを空のマップで初期化する
              let newOutBoundFfmap: RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInner =
                {};

              // 以下、当該往路TSマップ.<往路のFareFamilyCode>のマップ(往路FFマップ)の件数分繰り返し
              Object.entries(outBoundFfMap).forEach(([inBoundTsId, inBoundTsMap]) => {
                // 当該往路FFマップのキーがcheapestAirOfferIdの場合、次の繰り返しを処理する
                if (inBoundTsId === 'cheapestAirOfferId') {
                  return;
                } else if (inBoundTsMap) {
                  // 更新用復路TSマップを空のマップで初期化する
                  let newInBoundTsMap: RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInnerTravelSolutionIdInner =
                    {};

                  // 以下、当該往路FFマップ.<復路のTravelSolutionId>のマップ(復路TSマップ)の件数分繰り返し
                  Object.entries(inBoundTsMap).forEach(([inBoundFfCode, inBoundFfMap]) => {
                    // 当該復路TSマップのキーがcheapestAirOfferIdの場合、次の繰り返しを処理する
                    if (inBoundFfCode === 'cheapestAirOfferId') {
                      return;
                    } else if (inBoundFfMap) {
                      // 当該復路TSマップ.<復路のFareFamilyCode>.airOfferIdがAirOfferIdリストに含まれる場合、以下の処理を行う
                      const airOfferId = (<
                        RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInnerTravelSolutionIdInnerFareFamilyCodeInner
                      >inBoundFfMap).airOfferId;
                      if (airOfferId && airOfferIdList.includes(airOfferId)) {
                        // 更新用復路TSマップに当該復路TSマップ<復路のFareFamilyCode>を追加する
                        newInBoundTsMap[inBoundFfCode] = inBoundFfMap;
                        // 当該復路TSマップ.cheapestAirOfferIdと当該復路TSマップ.<復路のFareFamilyCode>.airOfferIdが同一の場合、
                        const inBoundTs = <
                          RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInnerTravelSolutionIdInner
                        >inBoundTsMap;
                        if (inBoundTs.cheapestAirOfferId === airOfferId) {
                          // 更新用復路TSマップにキー: cheapestAirOfferId、値: 当該復路TSマップ.<復路のFareFamilyCode>.airOfferIdを追加する
                          newInBoundTsMap.cheapestAirOfferId = airOfferId;
                        }
                      }
                    }
                  });
                  // 当該復路TSマップが最後の要素、かつ更新用復路TSマップが空ではない、かつ更新用復路TSマップにキー: cheapestAirOfferIdが存在しない場合、以下の処理を行う
                  if (this.isNotEmpty(newInBoundTsMap) && !newInBoundTsMap.cheapestAirOfferId) {
                    // 最安金額を初期値Number.MAX_VALUE、最安Idを初期値空の文字列とする
                    let cheapestPrice = Number.MAX_VALUE;
                    let cheapestAirOfferId = '';
                    // 以下、更新用復路TSマップの件数分繰り返し
                    Object.values(newInBoundTsMap).forEach((inBoundFfMap) => {
                      // 画面表示用データ.airOffers.<当該更新用復路TSマップ.airOfferId>.isUnselectable=false、
                      // かつ画面表示用データ.airOffers.<当該更新用復路TSマップ.airOfferId>.prices.totalPrice.total<最安金額の場合、
                      // 最安金額に画面表示用データ.airOffers.<当該更新用復路TSマップ.airOfferId>.prices.totalPrice.total
                      // 最安Idに当該更新用復路TSマップ.airOfferIdを設定する
                      const airOfferId = (<
                        RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInnerTravelSolutionIdInnerFareFamilyCodeInner
                      >inBoundFfMap).airOfferId!;
                      const airOffers = displayData.data?.airOffers?.[airOfferId];
                      if (airOffers) {
                        const isUnselectable = airOffers.isUnselectable;
                        const totalPrice = airOffers.prices?.totalPrice?.total;
                        if (isUnselectable === false && totalPrice && totalPrice < cheapestPrice) {
                          cheapestPrice = totalPrice;
                          cheapestAirOfferId = airOfferId;
                        }
                      }
                    });
                    // ここまで、更新用復路TSマップの件数分繰り返し
                    // 更新用復路TSマップにキー: cheapestAirOfferId、値: 最安IDを設定する
                    newInBoundTsMap.cheapestAirOfferId = cheapestAirOfferId;
                  }
                  // ここまで、当該往路FFマップ.<復路のTravelSolutionId>のマップ(復路TSマップ)の件数分繰り返し

                  // 更新用復路TSマップが空ではない場合、更新用往路FFマップにキー: 復路のTravelSolutionId、値: 更新用復路TSマップを設定する。
                  if (this.isNotEmpty(newInBoundTsMap)) {
                    newOutBoundFfmap[inBoundTsId] = newInBoundTsMap;
                  }
                  // 当該往路TSマップ.<往路のFareFamilyCode>.cheapestAirOfferIdと更新用復路TSマップ.cheapestAirOfferIdが同一の場合
                  const outBoundFf = <RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInner>(
                    outBoundFfMap
                  );
                  if (outBoundFf.cheapestAirOfferId === newInBoundTsMap.cheapestAirOfferId) {
                    // 更新用往路FFマップにキー: cheapestAirOfferId、値: 更新用復路TSマップ.cheapestAirOfferIdを追加する。
                    newOutBoundFfmap.cheapestAirOfferId = newInBoundTsMap.cheapestAirOfferId;
                  }
                }
              });
              // 当該往路FFマップが最後の要素、かつ更新用往路FFマップが空ではない、かつ更新用往路FFマップにキー: cheapestAirOfferIdが存在しない場合、以下の処理を行う
              if (this.isNotEmpty(newOutBoundFfmap) && !newOutBoundFfmap.cheapestAirOfferId) {
                // 最安金額を初期値Number.MAX_VALUE、最安Idを初期値空の文字列とする
                let cheapestPrice = Number.MAX_VALUE;
                let cheapestAirOfferId = '';
                // 以下、更新用往路FFマップの件数分繰り返し
                Object.values(newOutBoundFfmap).forEach((inBoundTsMap) => {
                  // 画面表示用データ.airOffers.<当該更新用往路FFマップ.<復路のTravelSolutionId>.cheapestAirOfferId>.isUnselectable=false、
                  // かつ画面表示用データ.airOffers.<当該更新用往路FFマップ.<復路のTravelSolutionId>.cheapestAirOfferId>.prices.totalPrice.total<最安金額の場合、
                  // 最安金額に画面表示用データ.airOffers.<当該更新用往路FFマップ.<復路のTravelSolutionId>.cheapestAirOfferId>.prices.totalPrice.total
                  // 最安Idに当該更新用往路FFマップ.<復路のTravelSolutionId>.cheapestAirOfferIdを設定する
                  const airOfferId = (<
                    RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInnerTravelSolutionIdInner
                  >inBoundTsMap).cheapestAirOfferId!;
                  const airOffers = displayData.data?.airOffers?.[airOfferId];
                  if (airOffers) {
                    const isUnselectable = airOffers.isUnselectable;
                    const totalPrice = airOffers.prices?.totalPrice?.total;
                    if (isUnselectable === false && totalPrice && totalPrice < cheapestPrice) {
                      cheapestPrice = totalPrice;
                      cheapestAirOfferId = airOfferId;
                    }
                  }
                });
                // ここまで、更新用往路FFマップの件数分繰り返し
                // 更新用往路FFマップにキー: cheapestAirOfferId、値: 最安Idを追加する。
                newOutBoundFfmap.cheapestAirOfferId = cheapestAirOfferId;
              }
              // ここまで、当該往路TSマップ.<往路のFareFamilyCode>のマップ(往路FFマップ)の件数分繰り返し

              // 更新用往路FFマップが空ではない場合、更新用往路TSマップにキー: 往路のFareFamilyCode、値: 更新用往路FFマップを追加する
              if (this.isNotEmpty(newOutBoundFfmap)) {
                newOutBoundTsMap[outBoundFfCode] = newOutBoundFfmap;
              }
              // 当該AirOfferMapping.<往路のTravelSolutionId>.cheapestAirOfferIdと更新用往路FFマップ.cheapestAirOfferIdが同一の場合、
              if (outBoundTsMap.cheapestAirOfferId === newOutBoundFfmap.cheapestAirOfferId) {
                // 更新用往路TSマップにキー: cheapestAirOfferId、値: 更新用往路FFマップ.cheapestAirOfferIdを追加する
                newOutBoundTsMap.cheapestAirOfferId = newOutBoundFfmap.cheapestAirOfferId;
              }
            }
          });
          // 当該往路TSマップが最後の要素、かつ更新用往路TSマップが空ではない、かつ更新用往路TSマップにキー: cheapestAirOfferIdが存在しない場合、以下の処理を行う
          if (this.isNotEmpty(newOutBoundTsMap) && !newOutBoundTsMap.cheapestAirOfferId) {
            // 最安金額を初期値Number.MAX_VALUE、最安Idを初期値空の文字列とする
            let cheapestPrice = Number.MAX_VALUE;
            let cheapestAirOfferId = '';
            // 以下、更新用往路TSマップの件数分繰り返し
            Object.values(newOutBoundTsMap).forEach((outBoundFfMap) => {
              // 画面表示用データ.airOffers.<当該更新用往路TSマップ.<往路のFareFamilyCode>.cheapestAirOfferId>.isUnselectable=false、
              // かつ画面表示用データ.airOffers.<当該更新用往路TSマップ.<往路のFareFamilyCode>.cheapestAirOfferId>.prices.totalPrice.total<最安金額の場合、
              // 最安金額に画面表示用データ.airOffers.<当該更新用往路TSマップ.<往路のFareFamilyCode>.cheapestAirOfferId>.prices.totalPrice.total
              // 最安Idに当該更新用往路TSマップ.<往路のFareFamilyCode>.cheapestAirOfferIdを設定する
              const airOfferId = (<RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInner>(
                outBoundFfMap
              )).cheapestAirOfferId!;
              const airOffers = displayData.data?.airOffers?.[airOfferId];
              if (airOffers) {
                const isUnselectable = airOffers.isUnselectable;
                const totalPrice = airOffers.prices?.totalPrice?.total;
                if (isUnselectable === false && totalPrice && totalPrice < cheapestPrice) {
                  cheapestPrice = totalPrice;
                  cheapestAirOfferId = airOfferId;
                }
              }
            });
            // ここまで、更新用往路TSマップの件数分繰り返し
            // 更新用往路TSマップにキー: cheapestAirOfferId、値: 最安Idを追加する。
            newOutBoundTsMap.cheapestAirOfferId = cheapestAirOfferId;
          }
          // ここまで、当該AirOfferMapping.<往路のtravelSolutionId>のマップ(往路TSマップ)の件数分繰り返し

          // 更新用往路TSマップが空でない場合、更新用airOfferMappingにキー: 往路のtravelSolutionId、値: 更新用往路TSマップを追加する。
          if (this.isNotEmpty(newOutBoundTsMap)) {
            newAirOfferMapping[outBoundTsId] = newOutBoundTsMap;
          }
        });
        // ここまで、画面表示用データ.airOfferMappingの件数分繰り返し
        // 画面表示用データ.airOfferMappingを更新用AirOfferMappingで上書きする。
        displayData.data.airOfferMapping = newAirOfferMapping;
      }
    }

    // 選択中TS表示有無を初期値trueとする
    let selectTSDisplayFlag: boolean = true;
    if (displayData.data) {
      // 以降の処理は画面表示用データ.roundtripBoundsの要素数分繰り返す
      for (let i = 0; displayData.data.roundtripBounds && i < displayData.data.roundtripBounds.length; i++) {
        // AirOfferに含まれるtravelSolusionIdリストとして空のリストを作成する
        this.travelSolutionIdList = [];

        // 画面表示用データ.airOffersのマップの値の件数分繰り返し、
        // 当該値.bounds[roundtripBoundsの繰り返しインデックス].travelSolusionIdがAirOfferに含まれるtravelSolusionIdリストに含まれていない場合、
        // それを追加する
        if (displayData.data.airOffers) {
          for (const [airOfferId, airOffer] of Object.entries(displayData.data.airOffers)) {
            if (
              airOffer.bounds?.[i].travelSolutionId &&
              !this.travelSolutionIdList.includes(airOffer.bounds[i].travelSolutionId!)
            ) {
              this.travelSolutionIdList.push(airOffer.bounds[i].travelSolutionId!);
            }
          }
        }

        // 当該roundtripBounds.travelSolutionsについて、AirOfferに含まれるtravelSolusionIdリストに、当該travelSolutions.travelSolutionIdが含まれるデータのみを抽出し、
        // 抽出した結果で当該roundtripBounds.travelSolutionsを上書きする
        if (displayData.data.roundtripBounds[i].travelSolutions) {
          const extractedTravelSolutions: BoundDetail[] = [];
          for (let j = 0; j < displayData.data.roundtripBounds[i].travelSolutions!.length; j++) {
            if (
              this.travelSolutionIdList.includes(
                displayData.data.roundtripBounds[i].travelSolutions![j].travelSolutionId!
              )
            ) {
              extractedTravelSolutions.push(displayData.data.roundtripBounds[i].travelSolutions![j]);
            }
          }
          displayData.data.roundtripBounds[i].travelSolutions = extractedTravelSolutions;
        }

        // 以下の処理にて、各フィルタ条件入力情報の選択されている値のリストを作成する
        // 選択乗継回数リスト初期化
        this.selectedStopsList = [];
        // フィルタ条件入力情報.乗継回数リストを件数分繰り返し、当該乗継回数.チェック状態=trueの場合、選択乗継回数リストに当該乗継回数.回数を追加する
        if (data.boundFilterItemList) {
          for (let l = 0; data.boundFilterItemList[i].stops && l < data.boundFilterItemList[i].stops!.length; l++) {
            if (
              data.boundFilterItemList[i].stops![l].isEnabled === true &&
              data.boundFilterItemList[i].stops![l].item
            ) {
              this.selectedStopsList.push(data.boundFilterItemList[i].stops![l].item!);
            } else if (
              data.boundFilterItemList[i].stops![l].isEnabled === true &&
              data.boundFilterItemList[i].stops![l].item === 0
            ) {
              this.selectedStopsList.push(data.boundFilterItemList[i].stops![l].item!);
            }
          }
        }

        // 選択出発空港リスト初期化
        this.selectedDepartureAirportsList = [];
        // フィルタ条件入力情報.出発空港リストを件数分繰り返し、
        // 当該出発空港.チェック状態=trueの場合、選択出発空港リストに当該出発空港.空港コードを追加する
        if (data.boundFilterItemList) {
          for (
            let l = 0;
            data.boundFilterItemList[i].departureAirportList &&
            l < data.boundFilterItemList[i].departureAirportList!.length;
            l++
          ) {
            if (
              data.boundFilterItemList[i].departureAirportList![l].isEnabled === true &&
              data.boundFilterItemList[i].departureAirportList![l].code
            ) {
              this.selectedDepartureAirportsList.push(data.boundFilterItemList[i].departureAirportList![l].code!);
            }
          }
        }

        // 選択到着空港リスト初期化
        this.selectedArrivalAirportsList = [];
        // フィルタ条件入力情報.到着空港リストを件数分繰り返し、
        // 当該到着空港.チェック状態=trueの場合、選択到着空港リストに当該到着空港.空港コードを追加する
        if (data.boundFilterItemList) {
          for (
            let l = 0;
            data.boundFilterItemList[i].arrivalAirportList &&
            l < data.boundFilterItemList[i].arrivalAirportList!.length;
            l++
          ) {
            if (
              data.boundFilterItemList[i].arrivalAirportList![l].isEnabled === true &&
              data.boundFilterItemList[i].arrivalAirportList![l].code
            ) {
              this.selectedArrivalAirportsList.push(data.boundFilterItemList[i].arrivalAirportList![l].code!);
            }
          }
        }

        // NHグループ運航フィルタ要否を、初期値falseとして用意する
        this.isNeedNHGroupOperatingFilter = false;
        // 選択他社運航キャリアリスト初期化
        this.selectedCompetitorAirLineList = [];
        // フィルタ条件入力情報.運航キャリアリストを件数分繰り返し、当該運航キャリア.チェック状態=trueの場合、以下の処理を行う
        if (data.boundFilterItemList) {
          for (
            let l = 0;
            data.boundFilterItemList[i].operationAirlineList &&
            l < data.boundFilterItemList[i].operationAirlineList!.length;
            l++
          ) {
            if (data.boundFilterItemList[i].operationAirlineList![l].isEnabled === true) {
              if (data.boundFilterItemList[i].operationAirlineList![l].value === this.appConstants.CARRIER.TWO_LETTER) {
                this.isNeedNHGroupOperatingFilter = true;
              } else {
                this.selectedCompetitorAirLineList.push(data.boundFilterItemList[i].operationAirlineList![l]);
              }
            }
          }
        }

        // 選択機種リスト初期化
        this.selectedAirCraftList = [];
        // フィルタ条件入力情報.機種リストを件数分繰り返し、当該機種.チェック状態=trueの場合、選択機種リストに当該機種.項目名を追加する
        if (data.boundFilterItemList) {
          for (
            let l = 0;
            data.boundFilterItemList[i].aircraftList && l < data.boundFilterItemList[i].aircraftList!.length;
            l++
          ) {
            if (
              data.boundFilterItemList[i].aircraftList![l].isEnabled === true &&
              data.boundFilterItemList[i].aircraftList![l].item
            ) {
              this.selectedAirCraftList.push(data.boundFilterItemList[i].aircraftList![l].item!);
            }
          }
        }

        // TSの表示要否判定処理開始
        // 始めにTSを上書きするための空リストを作成
        this.travelSolutionList = [];

        // TSの表示要否判定処理結果がfalseの場合はここで処理終了
        if (!this.determineDisplayNecessity(i, displayData.data as Data, data)) {
          return;
        }
        // TSの表示要否判定処理結果で当該roundtripBoundsのtravelSolutionsを上書きする
        displayData.data.roundtripBounds[i].travelSolutions = this.travelSolutionList;

        // 当該roundtripBounds.travelSolutionsの件数が0件の場合、
        if (displayData.data.roundtripBounds[i].travelSolutions?.length === 0) {
          // 以下の処理にて当該roundtripBounds.travelSolutions以外の項目へもフィルタ結果の適用を行い、
          // 当該roundtripBounds.farefamiliesを空の配列で上書きする
          displayData.data.roundtripBounds[i].fareFamilies = [];

          // roundtripBoundsの繰り返しインデックス=0、かつ往復かどうか=trueの場合、以下の処理を行う。
          if (i === 0 && this._R01P030Store.isRoundtrip) {
            // 画面表示用データ.roundtripBounds[1].travelSolutionsを空の配列で上書きする
            displayData.data.roundtripBounds[1].travelSolutions = [];
            // 画面表示用データ.roundtripBounds[1].fareFamiliesを空の配列で上書きする
            displayData.data.roundtripBounds[1].fareFamilies = [];
            // roundtripBoundsの繰り返しインデックス=1の場合、以下の処理を行う。
          } else if (i === 1) {
            // 画面表示用データ.roundtripBounds[0].travelSolutionsを空の配列で上書きする
            displayData.data.roundtripBounds[0].travelSolutions = [];
            // 画面表示用データ.roundtripBounds[0].fareFamiliesを空の配列で上書きする
            displayData.data.roundtripBounds[0].fareFamilies = [];
          }

          // 画面表示用データ.airOfferMappingを空のオブジェクトで上書きする
          displayData.data.airOfferMapping = {};
          // 画面表示用データ.airOffersを空のオブジェクトで上書きする
          displayData.data.airOffers = {};

          this._owd = displayData;
          this._roundtripOwdDisplayService.updateRoundtripOwdDisplay(this._owd);
          this.showDisplay();
          this._changeDetectorRef.detectChanges();

          // 表示TS0件案内コンテンツIDが存在しない場合、注意喚起エリアへのインフォメーションメッセージ登録処理にメッセージID＝”MSG1035”(表示可能なTSが0件になった旨)を指定して実行する。
          if (!this._R01P030Store.displayTs0InfoContentID) {
            const message: AlertMessageItem = {
              contentHtml: 'MSG1035',
              isCloseEnable: false,
              alertType: AlertType.INFOMATION,
            };
            let contentId = this._common.alertMessageStoreService.setAlertInfomationMessage(message);
            this._common.alertMessageStoreService.getAlertInfomationMessage();
            // インフォメーション登録処理にて採番されたコンテンツIDを表示TS0件案内コンテンツIDとして保持する。
            this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
              displayTs0InfoContentID: contentId,
            });
          }
          return;
        }
        // 以下いずれかを満たす場合、選択中TS表示有無をfalseとする
        // ・roundtripBoundsの繰り返しインデックス=0、かつ選択中往路TSIDが存在する、かつ当該roundtripBounds.travelSolutionsにtravelSolutionId=選択中往路TSIDとなるtravelSolutionsが存在しない
        // ・roundtripBoundsの繰り返しインデックス=1、かつ選択中復路TSIDが存在する、かつ当該roundtripBounds.travelSolutionsにtravelSolutionId=選択中復路TSIDとなるtravelSolutionsが存在しない
        if (
          i === 0 &&
          this.selectOutboundTSID &&
          !displayData.data.roundtripBounds[i].travelSolutions?.some(
            (bound) => bound.travelSolutionId === this.selectOutboundTSID
          )
        ) {
          selectTSDisplayFlag = false;
        }
        if (
          i === 1 &&
          this.selectReturnTripTSID &&
          !displayData.data.roundtripBounds[i].travelSolutions?.some(
            (bound) => bound.travelSolutionId === this.selectReturnTripTSID
          )
        ) {
          selectTSDisplayFlag = false;
        }
        // 画面表示用データのストア更新
        this._owd = displayData;
      }

      // 以下の処理にて各roundtripBounds.travelSolutions以外の項目へもフィルタ結果の適用を行う。
      // 画面表示用データ.roundtripBounds[0].travelSolutionsから各travelSolutions.travelSolutionIdを抽出したリストを往路TSIDリストとする。
      const outBoundTripTSIDList =
        displayData.data.roundtripBounds?.[0].travelSolutions
          ?.filter((x) => x.travelSolutionId)
          .map((x) => x.travelSolutionId!) ?? [];

      // 空のairOfferIDリストを作成する (後続処理の都合で先に生成する)
      const airOfferIdList: string[] = [];

      if (displayData.data.airOfferMapping) {
        // 画面表示用データ.airOfferMappingのマップの件数分繰り返し、マップのキー(往路のtravelSolutionId)が往路TSIDリストに含まれるデータのみを抽出し、
        // 抽出した結果で画面表示用データ.airOfferMappingを上書きする
        const airOfferMapping: RoundtripOwdResponseDataAirOfferMapping = {} as RoundtripOwdResponseDataAirOfferMapping;
        for (const [outBoundKey, mapping] of Object.entries(displayData.data.airOfferMapping).filter(
          ([outBoundSolutionId]) => outBoundTripTSIDList.includes(outBoundSolutionId)
        )) {
          airOfferMapping[outBoundKey] = mapping;
        }

        displayData.data.airOfferMapping = airOfferMapping;

        // 往復かどうか=falseの場合、以下の処理を行う
        if (this._R01P030Store.isRoundtrip === false) {
          // 画面表示用データ.airOfferMapping.<往路のtravelSolutionId>.<往路のfareFamilyCode>.<airOfferId>を抽出したリストをAirOfferIDリストに設定する。
          Object.values(displayData.data.airOfferMapping).forEach((solution) => {
            Object.values(solution).forEach((family) => {
              if (typeof family === 'object' && family.airOfferId) {
                airOfferIdList.push(family.airOfferId);
              }
            });
          });

          // 以下の処理で最安AirOfferIdの再設定を行う
          // 以下、画面表示用データ.airOfferMappingの件数分繰り返し
          Object.entries(displayData.data.airOfferMapping).forEach(([outBoundTsId, outBoundTsMap]) => {
            // 当該AirOfferMapping.<往路のTravelSolutionId>.cheapestAirOfferIdが空の場合、次の繰り返しを処理する
            if (!outBoundTsMap.cheapestAirOfferId) {
              // forEachコールバック関数内なので、continueではなくreturn
              return;
            }
            // 最安金額を初期値Number.MAX_VALUE、最安Idを初期値空の文字列とする
            let cheapestPrice = Number.MAX_VALUE;
            let cheapestAirOfferId = '';

            // 以下、当該AirOfferMapping.<往路のtravelSolutionId>のマップ(往路TSマップ)の件数分繰り返し
            Object.entries(outBoundTsMap).forEach(([outBoundFfCode, outBoundFfMap]) => {
              // 当該往路TSマップのキーがcheapestAirOfferIdの場合、次の繰り返しを処理する
              if (outBoundFfCode === 'cheapestAirOfferId') {
                return;
              } else if (outBoundFfMap) {
                // 画面表示用データ.airOffers.<当該更新用往路TSマップ.airOfferId>.isUnselectable=false、
                // かつ画面表示用データ.airOffers.<当該更新用往路TSマップ.airOfferId>.prices.totalPrice.total<最安金額の場合、
                // 最安金額に画面表示用データ.airOffers.<当該更新用往路TSマップ.airOfferId>.prices.totalPrice.total
                // 最安Idに当該更新用往路TSマップ.airOfferIdを設定する
                const airOfferId = (<RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInner>(
                  outBoundFfMap
                )).airOfferId!;
                const airOffers = displayData.data?.airOffers?.[airOfferId];
                if (airOffers) {
                  const isUnselectable = airOffers.isUnselectable;
                  const totalPrice = airOffers.prices?.totalPrice?.total;
                  if (isUnselectable === false && totalPrice && totalPrice < cheapestPrice) {
                    cheapestPrice = totalPrice;
                    cheapestAirOfferId = airOfferId;
                  }
                }
              }
            });
            // ここまで、当該AirOfferMapping.<往路のtravelSolutionId>のマップ(往路TSマップ)の件数分繰り返し
            // 当該AirOfferMapping.<往路のtravelSolutionId>.cheapestAirOfferIdに最安Idを追加する。
            outBoundTsMap.cheapestAirOfferId = cheapestAirOfferId;
          });
          // ここまで、画面表示用データ.airOfferMappingのマップの件数分繰り返し

          // 往復かどうか=trueの場合、以下の処理を行う
        } else {
          // 画面表示用データ.roundtripBounds[1].travelSolutionsから各travelSolutions.travelSolutionIdを抽出したリストを復路TSIDリストとする。
          const returnTripTSIDList =
            displayData.data.roundtripBounds?.[1].travelSolutions
              ?.filter((x) => x.travelSolutionId)
              .map((x) => x.travelSolutionId!) ?? [];

          const mapping: RoundtripOwdResponseDataAirOfferMapping = {};

          // 画面表示用データ.airOfferMappingの繰り返し
          Object.entries(displayData.data.airOfferMapping).forEach(([outBoundSolutionId, outBoundSolution]) => {
            const solution: RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInner = {};
            // 画面表示用データ.airOfferMapping.<往路のtravelSolutionId>の繰り返し
            Object.entries(outBoundSolution).forEach(([outBoundFamilyCode, returnFamily]) => {
              if (typeof returnFamily === 'object') {
                const family: RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInner = {};
                // 画面表示用データ.airOfferMapping.<往路のtravelSolutionId>.<往路のfareFamilyCode>の繰り返し
                Object.entries(returnFamily).forEach(([returnSolutionId, returnSolution]) => {
                  // プロパティの種類で分岐
                  switch (typeof returnSolution) {
                    case 'object':
                      // 画面表示用データ.airOfferMapping.<往路のtravelSolutionId>.<往路のfareFamilyCode>のマップのキー(復路のtravelSolutionId)が
                      // 復路TSIDリストに含まれるデータのみを抽出し、
                      if (returnTripTSIDList.includes(returnSolutionId)) {
                        family[returnSolutionId] = returnSolution;

                        // 同時に処理しておく
                        // 画面表示用データ.airOfferMapping.<往路のtravelSolutionId>.<往路のfareFamilyCode>
                        // .<復路のtravelSolutionId>.<復路のfareFamilyCode>.<airOfferId>
                        // を抽出したリストをAirOfferIDリストに設定する。
                        Object.values(returnSolution).forEach((returnFamily) => {
                          if (typeof returnFamily === 'object' && returnFamily.airOfferId) {
                            airOfferIdList.push(returnFamily.airOfferId);
                          }
                        });
                      }
                      break;

                    // cheapestAirOfferId, airOfferIdの復元
                    case 'string':
                      family[returnSolutionId] = returnSolution;
                      break;

                    // undefinedの場合など
                    default:
                      break;
                  }
                });

                if (Object.keys(family).length > 0) {
                  solution[outBoundFamilyCode] = family;
                }
              } else {
                // stringのプロパティ(cheapestAirOfferId)を復元する
                solution[outBoundFamilyCode] = returnFamily;
              }
            });
            if (Object.keys(solution).length > 0) {
              mapping[outBoundSolutionId] = solution;
            }
          });
          // 抽出した結果で画面表示用データ.airOfferMappingを上書きする。
          displayData.data.airOfferMapping = mapping;

          // 以下の処理で最安AirOfferの再設定を行う
          // 以下、画面表示用データ.airOfferMappingのマップの件数分繰り返し
          Object.entries(displayData.data.airOfferMapping).forEach(([outBoundTsId, outBoundTsMap]) => {
            // 当該AirOfferMapping.<往路のTravelSolutionId>.cheapestAirOfferIdが空の場合、次の繰り返しを処理する(以降の処理は行わない)
            if (!outBoundTsMap.cheapestAirOfferId) {
              return;
            }
            // 往路TS最安ID候補マップを空のマップで初期化する
            let outBoundTsCheapestIdMap: { [airOfferId: string]: number } = {};

            // 以下、当該AirOfferMapping.<往路のtravelSolutionId>のマップ(往路TSマップ)の件数分繰り返し
            Object.entries(outBoundTsMap).forEach(([outBoundFfCode, outBoundFfMap]) => {
              // 当該往路TSマップのキーがcheapestAirOfferIdの場合、次の繰り返しを処理する
              if (outBoundFfCode === 'cheapestAirOfferId') {
                return;
              } else if (outBoundFfMap) {
                // 当該往路FFマップ.<復路のTravelSolutionId>.cheapestAirOfferIdが空の場合、次の繰り返しを処理する
                const ffMap = <RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInner>(
                  outBoundFfMap
                );
                if (!ffMap.cheapestAirOfferId) {
                  return;
                }
                // 往路TS最安ID候補マップを空のマップで初期化する
                let outBoundFfCheapestIdMap: { [airOfferId: string]: number } = {};

                // 以下、当該往路TSマップ.<往路のFareFamilyCode>のマップ(往路FFマップ)の件数分繰り返し
                Object.entries(outBoundFfMap).forEach(([inBoundTsId, inBoundTsMap]) => {
                  // 当該往路FFマップのキーがcheapestAirOfferIdの場合、次の繰り返しを処理する
                  if (inBoundTsId === 'cheapestAirOfferId') {
                    return;
                  } else if (inBoundTsMap) {
                    // 当該往路FFマップ.<復路のTravelSolutionId>.cheapestAirOfferIdが空の場合、次の繰り返しを処理する
                    const tsMap = <
                      RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInnerTravelSolutionIdInner
                    >inBoundTsMap;
                    if (!tsMap.cheapestAirOfferId) {
                      return;
                    }
                    // 最安金額を初期値Number.MAX_VALUE、最安Idを初期値空の文字列とする
                    let cheapestPrice = Number.MAX_VALUE;
                    let cheapestAirOfferId = '';

                    // 以下、当該往路FFマップ.<復路のTravelSolutionId>のマップ(復路TSマップ)の件数分繰り返し
                    Object.entries(inBoundTsMap).forEach(([inBoundFfCode, inBoundFfMap]) => {
                      // 当該復路TSマップのキーがcheapestAirOfferIdの場合、次の繰り返しを処理する
                      if (inBoundFfCode === 'cheapestAirOfferId') {
                        return;
                      } else if (inBoundFfMap) {
                        // 画面表示用データ.airOffers.<当該更新用復路TSマップ.airOfferId>.isUnselectable=false、
                        // かつ画面表示用データ.airOffers.<当該更新用復路TSマップ.airOfferId>.prices.totalPrice.total<最安金額の場合、
                        // 最安金額に画面表示用データ.airOffers.<当該更新用復路TSマップ.airOfferId>.prices.totalPrice.total
                        // 最安Idに当該更新用復路TSマップ.airOfferIdを設定する
                        const airOfferId = (<
                          RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInnerTravelSolutionIdInnerFareFamilyCodeInner
                        >inBoundFfMap).airOfferId!;
                        const airOffers = displayData.data?.airOffers?.[airOfferId];
                        if (airOffers) {
                          const isUnselectable = airOffers.isUnselectable;
                          const totalPrice = airOffers.prices?.totalPrice?.total;
                          if (isUnselectable === false && totalPrice && totalPrice < cheapestPrice) {
                            cheapestPrice = totalPrice;
                            cheapestAirOfferId = airOfferId;
                          }
                        }
                      }
                    });
                    // ここまで、当該往路FFマップ.<復路のTravelSolutionId>のマップ(復路TSマップ)の件数分繰り返し
                    // 当該往路FFマップ.<復路のTravelSolutionId>.cheapestAirOfferIdに最安Idを設定する
                    (<
                      RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInnerTravelSolutionIdInner
                    >inBoundTsMap).cheapestAirOfferId = cheapestAirOfferId;

                    // 最安Idが空ではない場合、往路FF最安ID候補マップに、キー: 最安Id、値: 最安金額を設定する
                    if (cheapestAirOfferId) {
                      outBoundFfCheapestIdMap[cheapestAirOfferId] = cheapestPrice;
                    }
                  }
                });
                // ここまで、当該往路TSマップ.<往路のFareFamilyCode>のマップ(往路FFマップ)の件数分繰り返し

                // 往路FF最安Id候補マップが空ではない場合、以下の処理を行う
                if (this.isNotEmpty(outBoundFfCheapestIdMap)) {
                  // 往路FF最安金額を初期値Number.MAX_VALUE、往路FF最安Idを初期値空の文字列とする
                  let outBoundFfCheapestPrice = Number.MAX_VALUE;
                  let outBoundFfCheapestAirOfferId = '';
                  // 以下、往路FF最安Id候補マップの件数分繰り返し
                  Object.entries(outBoundFfCheapestIdMap).forEach(([airOfferId, price]) => {
                    // 当該往路FF最安ID候補マップの値<最安金額の場合、
                    // 往路FF最安金額に当該往路FF最安候補マップの値、
                    // 往路FF最安Idに当該往路FF最安候補マップのキーを設定する
                    const airOffers = displayData.data?.airOffers?.[airOfferId];
                    if (airOffers) {
                      if (price < outBoundFfCheapestPrice) {
                        outBoundFfCheapestPrice = price;
                        outBoundFfCheapestAirOfferId = airOfferId;
                      }
                    }
                  });
                  // ここまで、往路FF最安Id候補マップの件数分繰り返し
                  // 当該往路TSマップ.<往路のFareFamilyCode>.cheapestAirOfferIdに往路FF最安Idを設定する
                  (<RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInner>(
                    outBoundFfMap
                  )).cheapestAirOfferId = outBoundFfCheapestAirOfferId;
                  // 往路FF最安Idが空ではない場合、往路TS最安Id候補マップに、キー: 往路FF最安Id、値: 往路FF最安金額を設定する
                  if (outBoundFfCheapestAirOfferId) {
                    outBoundTsCheapestIdMap[outBoundFfCheapestAirOfferId] = outBoundFfCheapestPrice;
                  }
                }
              }
            });
            // ここまで、当該AirOfferMapping.<往路のtravelSolutionId>のマップ(往路TSマップ)の件数分繰り返し
            // 往路TS最安Id候補マップが空でない場合、以下の処理を行う。
            if (this.isNotEmpty(outBoundTsCheapestIdMap)) {
              // 往路TS最安金額を初期値Number.MAX_VALUE、往路TS最安Idを初期値空の文字列とする
              let outBoundTsCheapestPrice = Number.MAX_VALUE;
              let outBoundTsCheapestAirOfferId = '';

              // 以下、往路TS最安Id候補マップの件数分繰り返し
              Object.entries(outBoundTsCheapestIdMap).forEach(([airOfferId, price]) => {
                // 当該往路TS最安Id候補マップの値<往路TS最安金額の場合、
                // 往路TS最安金額に当該往路TS最安Id候補マップの値、
                // 往路TS最安Idに当該往路TS最安Id候補マップのキーを設定する
                if (price < outBoundTsCheapestPrice) {
                  outBoundTsCheapestPrice = price;
                  outBoundTsCheapestAirOfferId = airOfferId;
                }
              });
              // ここまで、往路TS最安Id候補マップの件数分繰り返し

              // 当該AirOfferMapping.<往路のTravelSolutionId>.cheapestAirOfferIdに往路TS最安IDを設定する
              outBoundTsMap.cheapestAirOfferId = outBoundTsCheapestAirOfferId;
            }
          });
          // ここまで、画面表示用データ.airOfferMappingの件数分繰り返し
          // ここまで、往復かどうか=true
        }
      }

      if (displayData.data.airOffers) {
        const airOffers: RoundtripOwdResponseDataAirOffers = {};
        // 画面表示用データ.airOffersから画面表示用データ.airOffers.<airOfferId>がAirOfferIDリストに存在するデータのみを抽出し、
        // 抽出した結果で画面表示用データ.airOffersを更新する。
        for (const [airOfferId, airOffer] of Object.entries(displayData.data.airOffers).filter(([airOfferId]) =>
          airOfferIdList.includes(airOfferId)
        )) {
          airOffers[airOfferId] = airOffer;
        }

        displayData.data.airOffers = airOffers;

        // 以下、画面表示用データ.roundtripBoundsの要素数分繰り返し
        displayData.data.roundtripBounds?.forEach((roundtrip, index) => {
          // AirOfferに含まれるfareFamilyCodeリストとして空のリストを作成する。
          const fareFamilyCodeList: string[] = [];

          // 画面表示用データ.airOffersのマップの値の件数分繰り返し、
          // 当該値.bounds[roundtripBoundsの繰り返しインデックス].fareFamilyCodeがAirOfferに含まれるfareFamilyCodeに含まれていない場合、それを追加する。
          for (const airOffer of Object.values(displayData.data!.airOffers!)) {
            const fareFamilyCode = airOffer.bounds?.[index]?.fareFamilyCode;
            if (fareFamilyCode && !fareFamilyCodeList.includes(fareFamilyCode)) {
              fareFamilyCodeList.push(fareFamilyCode);
            }
          }

          // 当該roundtripBounds.fareFamiliesについて、
          // AirOfferに含まれるfareFamilyCodeリストに、当該fareFamilies.fareFamilyCodeが含まれるデータのみを抽出し、
          // 抽出した結果で当該roundtripBounds.fareFamiliesを上書きする。
          if (roundtrip.fareFamilies) {
            roundtrip.fareFamilies = roundtrip.fareFamilies.filter(
              (family) => family.fareFamilyCode && fareFamilyCodeList.includes(family.fareFamilyCode)
            );
          }
        });
        // ここまで、画面表示用データ.roundtripBoundsの要素数分繰り返し
      }
    }

    // 表示TS0件案内コンテンツIDが存在する場合、表示TS0件案内コンテンツIDを引数としてインフォメーション削除処理を実施し、表示TS0件案内コンテンツIDを値なしとする。
    if (this._R01P030Store.displayTs0InfoContentID) {
      this._common.alertMessageStoreService.removeAlertInfomationMessage(this._R01P030Store.displayTs0InfoContentID);
      // インフォメーション登録処理にて採番されたコンテンツIDを表示TS0件案内コンテンツIDとして保持する。
      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
        displayTs0InfoContentID: '',
      });
    }

    // 選択中TS表示有無=falseの場合、以下の処理を行う
    if (!selectTSDisplayFlag) {
      // 初期表示処理の［選択AirOffer情報作成処理］を行う
      this.createSelectedAirOfferInfo();
      // 選択TS変更案内コンテンツIDが存在しない場合、注意喚起エリアへのインフォメーションメッセージ登録処理にメッセージID＝”MSG1034”(選択しているフライトが非表示となったため変更された旨)を指定して実行する。
      if (!this._R01P030Store.selectedTsChangeInfoContentID) {
        const message: AlertMessageItem = {
          contentHtml: 'MSG1034',
          isCloseEnable: false,
          alertType: AlertType.INFOMATION,
        };
        let contentId = this._common.alertMessageStoreService.setAlertInfomationMessage(message);
        this._common.alertMessageStoreService.getAlertInfomationMessage();
        // インフォメーション登録処理にて採番されたコンテンツIDを選択TS変更案内コンテンツIDとして保持する。
        this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
          selectedTsChangeInfoContentID: contentId,
        });
      }
    }

    // 画面の再描画
    this._owd = displayData;
    this._roundtripOwdDisplayService.updateRoundtripOwdDisplay(this._owd);
    this.updateDisplay();
    this.airOfferOfTsFfDisplayUpdate();
    this._changeDetectorRef.detectChanges();
  }

  /**
   * オブジェクトに値が存在するか(空ではないか)判定
   * @param value 対象の値
   * @returns {boolean} 空ではない場合true, 空の場合false
   * @remarks 空文字列などのfalsyな値は空と同一とみなす
   */
  private isNotEmpty(value: object): boolean {
    // 空文字等をfalseで判定するのは使用箇所の都合(初期値で空文字が入ってくるのが怖い)
    return Object.values(value).filter((x) => !!x).length > 0;
  }

  /**
   * 履歴・お気に入り・アップグレードに関する処理
   */
  private async historyAndFavoriteAndUpgradeHandler() {
    // ユーザ共通.ログインステータス≠未ログインの場合、
    if (!this._common.isNotLogin()) {
      // 以下の処理にて、履歴・お気に入り・アップグレードに関する処理を行う。
      // 指定日検索結果有無=trueの場合、以下の[アップグレード可否照会処理]を行う。
      if (this._R01P030Store.isSearchResultOfSpecifiedDate) {
        await this.checkUpgradability();
      }
      // 履歴登録要否=trueの場合、履歴用検索条件を引数として、
      // フライト検索画面(R01-P010)の[履歴・お気に入り情報取得処理]を実施する。
      this._searchFlightHistoryStoreService.requestHistoryFavoriteGet(false);
      // ※当処理は、[履歴・お気に入り情報取得処理]内のエラーが発生していない履歴・お気に入り情報取得レスポンス通知後の処理と平行で行う。
      this.subscribeService(
        'historyFavoriteGet',
        this._searchFlightHistoryStoreService.getRoundtripFlightAvailabilityInternationalObservable(),
        (response) => {
          if (response) {
            const historyFavoriteResponse = this._searchFlightHistoryStoreService.getData();
            // 動的文言判定用情報 履歴・お気に入り情報取得レスポンス
            updateDynamicSubjectGetHistoryFavorite(historyFavoriteResponse);
            this.deleteSubscription('historyFavoriteGet');
            const favoriteList = historyFavoriteResponse && historyFavoriteResponse.favorite;
            if (favoriteList) {
              const roundtripFlightAvailabilityInternationalData =
                this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData;
              if (
                this._roundtripFlightAvailabilityService.checkIsRegisteredFavorite(
                  favoriteList,
                  this._R01P030Store.searchFlight
                )
              ) {
                this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
                  ...roundtripFlightAvailabilityInternationalData,
                  isRegisteredFavorite: true,
                  isNotFavoriteAnimation: true,
                });
              }
            }
          }
        }
      );
      // ＜以下、履歴・お気に入り情報取得レスポンス.お気に入り情報リストの件数分繰り返し＞
    }
  }

  // 履歴登録リクエストを設置し、APIを呼び出す。
  private async historyRegister() {
    this._roundtripFlightAvailabilityInternationalPresService.historyRegister(this._R01P030Store?.searchFlight);
  }

  // アップグレード可否照会処理
  private async checkUpgradability() {
    // 往復指定日空席照会(OWD)用レスポンス.upgradableCabins(アップグレード可能対象キャビンクラスリスト)が0件の場合、
    // アップグレード可否照会処理を終了する。
    const upperCabinClasses = this._owd?.data?.airOffersSummary?.upgradableCabins ?? [];
    if (upperCabinClasses.length === 0) {
      return;
    }
    // アップグレード照会用パラメータリストとして、空のリストを作成する。
    const upgradeParams: Array<Type5ItinerariesInner> = [];
    const itineraries: Array<RoundtripOwdRequestItinerariesInner> = JSON.parse(
      JSON.stringify(this._R01P030Store.roundtripOwdRequest?.itineraries)
    );

    // ＜以下、リクエスト用検索条件.itinerariesのインデックス要素数分、繰り返し＞
    if (itineraries) {
      itineraries.forEach((itinerarie, index) => {
        const roundtripBounds = this._owd?.data?.roundtripBounds && this._owd?.data?.roundtripBounds[index];
        const numbersOfConnections = roundtripBounds && roundtripBounds.travelSolutionsSummary?.numbersOfConnection;
        // 往復指定日空席照会(OWD)用レスポンス.roundtripBounds[処理中のitinerariesの繰り返しインデックス].numbersOfConnections(乗継回数リスト)に0(直行便)が存在する場合、
        if (numbersOfConnections && numbersOfConnections.some((numbersOfConnection) => numbersOfConnection === 0)) {
          // APIのパラメータとして設定できる値とするため、当該itineraries.departureDate(以下、当該departureDateとする)を以下の処理で変換し、出発日付とする。
          // 当該departureDateをyyyy-MM-dd形式に変換するため、当該departureDateから年、月、日をそれぞれ取得し、取得した値を結合した文字列とする。
          // 更に“T”と”00:00:00”を結合した文字列とする。
          const _departureDate = itinerarie.departureDate;
          const departureDate =
            _departureDate && this.convertDateToFormatDateString(new Date(_departureDate)) + 'T00:00:00';
          // 以下の項目からなるアップグレード照会用パラメータを、アップグレード照会用パラメータリストに追加する。
          const upgradeParam: Type5ItinerariesInner = {
            originLocationCode: itinerarie.originLocationCode ?? '',
            departureDateTime: departureDate ?? '',
            destinationLocationCode: itinerarie.destinationLocationCode ?? '',
          };
          upgradeParams.push(upgradeParam);
        }
      });
    }
    // ＜ここまで、リクエスト用検索条件.itinerariesのインデックス要素数分、繰り返し＞
    // アップグレード照会用パラメータリストが空の場合、アップグレード可否照会処理を終了する。
    if (upgradeParams.length === 0) {
      return;
    }

    // 搭乗者人数合計（INF以外）
    const travelers = this._R01P030Store.roundtripOwdRequest?.travelers;
    let travelerSum = 0;
    if (travelers?.ADT) {
      travelerSum += travelers.ADT;
    }
    if (travelers?.B15) {
      travelerSum += travelers.B15;
    }
    if (travelers?.CHD) {
      travelerSum += travelers.CHD;
    }

    // アップグレード照会用パラメータリストを基に、空席照会時アップグレード可否照会APIを呼び出す。
    const upgradeAvailabilityRequest: UpgradeAvailabilityRequest = {
      itineraries: upgradeParams,
      // 呼び出し時、エラーハンドリング回避フラグ(commonIgnoreErrorFlg)としてtureを指定する。
      commonIgnoreErrorFlg: true,
      travelerNumber: travelerSum === 0 ? 1 : travelerSum,
    };
    const upgradeAvailabilityApiReslut = await this._getAPI_upgradeAvailability(upgradeAvailabilityRequest);
    // ※以降の処理は、エラーが発生していない空席照会時アップグレード可否照会レスポンスが通知された場合、処理を行う。当処理はstoreを介して行う。

    if (upgradeAvailabilityApiReslut && this._upgradeAvailability.data) {
      // 空席照会時アップグレード可否照会マップとして、空席照会時アップグレード可否照会レスポンス.dataを複製した情報を保持する。
      this._upgradeAvailabilityMap = JSON.parse(JSON.stringify(this._upgradeAvailability.data));

      // 以下の処理にて直行便であるTSに対してアップグレード情報リストの更新を行う。
      const roundtripBounds = this._owd?.data?.roundtripBounds;
      // ＜以下、往復指定日空席照会(OWD)用レスポンス.roundtripBoundsの要素数分、繰り返し＞
      if (roundtripBounds) {
        for (let i = 0; i < roundtripBounds.length; i++) {
          //  リクエスト用検索条件.itineraries[当該インデックス].departureDateを、出発日付とする。
          const departureDate = itineraries && itineraries[i].departureDate;
          // 空席照会時アップグレード可否照会マップから、出発日付をキーに値を取得し、区間アップグレード可否照会マップとする。
          const upgradeAvailabilityMap = this._upgradeAvailabilityMap[departureDate];
          // 取得不可の場合、次の繰り返しを行う。
          if (!upgradeAvailabilityMap) {
            continue;
          } else {
            // ＜以下、当該roundtripBounds.travelSolutionsの要素数分、繰り返し＞
            const roundtripBound = roundtripBounds[i];
            if (roundtripBound.travelSolutions) {
              for (const travelSolution of roundtripBound.travelSolutions) {
                // 当該travelSolutions.numberOfConnections≠0の場合、次の繰り返しを行う。
                if (travelSolution.numberOfConnections !== 0) {
                  continue;
                } else {
                  // 区間アップグレード可否照会マップから、当該travelSolutions.flights[0].marketingAirlineCode+当該travelSolutions.flights[0].marketingFlightNumber
                  // をキーに値を取得し、当該セグメントアップグレード可否とする。
                  const flights = travelSolution.flights;
                  const segmentUpgradeAvailabilityKeyName =
                    flights && `${flights[0].marketingAirlineCode}${flights[0].marketingFlightNumber}`;
                  let segmentUpgradeAvailability = upgradeAvailabilityMap[segmentUpgradeAvailabilityKeyName ?? ''];
                  // 取得不可の場合、次の繰り返しを行う。
                  if (!segmentUpgradeAvailability) {
                    continue;
                  } else if (
                    this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData
                      .upgradeInfoList
                  ) {
                    const upgradeInfoList: AirOfferUpgradeInfo[] = JSON.parse(
                      JSON.stringify(
                        this._roundtripFlightAvailabilityInternationalService
                          .roundtripFlightAvailabilityInternationalData.upgradeInfoList
                      )
                    );
                    for (let upgradeInfo of upgradeInfoList) {
                      if (upgradeInfo.boundUpgradeInfoList === undefined) {
                        continue;
                      } else {
                        for (let boundUpgradeInfo of upgradeInfo.boundUpgradeInfoList) {
                          if (boundUpgradeInfo.travelSolutionId === travelSolution.travelSolutionId) {
                            if (boundUpgradeInfo.flightUpgradeInfoList) {
                              for (let flightUpgradeInfo of boundUpgradeInfo.flightUpgradeInfoList) {
                                if (
                                  flightUpgradeInfo.segmentKey ===
                                  `${travelSolution.flights?.[0].marketingAirlineCode}${travelSolution.flights?.[0].marketingFlightNumber}`
                                ) {
                                  if (flightUpgradeInfo.cabinClassUpgradeInfoList) {
                                    flightUpgradeInfo.cabinClassUpgradeInfoList.map((value) => {
                                      if (value.seatStatus !== 'noSetting') {
                                        if (
                                          value.cabinClass === 'ecoPremium' &&
                                          segmentUpgradeAvailability.ecoPremium
                                        ) {
                                          value.seatStatus = segmentUpgradeAvailability.ecoPremium;
                                        }

                                        if (value.cabinClass === 'business' && segmentUpgradeAvailability.business) {
                                          value.seatStatus = segmentUpgradeAvailability.business;
                                        }

                                        if (value.cabinClass === 'first' && segmentUpgradeAvailability.first) {
                                          value.seatStatus = segmentUpgradeAvailability.first;
                                        }
                                      }
                                    });
                                  } else {
                                    continue;
                                  }
                                } else {
                                  continue;
                                }
                              }
                            } else {
                              continue;
                            }
                          } else {
                            continue;
                          }
                        }
                      }
                    }
                    this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(
                      {
                        upgradeInfoList: upgradeInfoList,
                      }
                    );
                  }
                }
                // ＜ここまで、当該roundtripBounds.travelSolutionsの要素数分、繰り返し＞
              }
            }
          }
          // ＜ここまで、往復指定日空席照会(OWD)用レスポンス.roundtripBoundsの要素数分、繰り返し＞
        }
      }
    }
    // ［ここまで、アップグレード可否照会処理］
  }

  /** Dateオブジェクトを日付文字列のフォーマットへ変換する yyyy-MM-dd */
  private convertDateToFormatDateString(date: Date): string {
    if (date !== undefined) {
      return (
        date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
      );
    }
    return '';
  }

  // 空席照会時アップグレード可否照会APIを呼び出す
  private async _getAPI_upgradeAvailability(upgradeAvailabilityRequest: UpgradeAvailabilityRequest) {
    // 空席照会時アップグレード可否照会API実行
    this._upgradeAvailabilityService.setUpgradeAvailabilityFromApi(upgradeAvailabilityRequest);

    // 空席照会時アップグレード可否照会API実行後処理
    this._common.apiErrorResponseService.clearApiErrorResponse(); //APIエラー情報を事前にクリア

    // 　空席照会時アップグレード可否照会API呼び出し、受信後処理
    return await new Promise<boolean>((resolve) => {
      this.subscribeService(
        '_upgradeAvailability',
        this._upgradeAvailabilityService.getUpgradeAvailabilityObservable(),
        (response) => {
          if (response.isPending === false) {
            // エラーが発生した空席照会時アップグレード可否照会レスポンスが通知された場合、エラーログの出力を行う。
            // ※当処理はstoreを介して行う。エラーが発生した場合でも画面を継続させるため、非同期で通知されたエラーを無視する。
            if (response.isFailure && this._common.apiError) {
              console.log('空席照会時アップグレード可否照会APIレスポンスで無視エラー発生（初期表示処理時）');
              this._loggerSvc.operationConfirmLog('API0002', { 0: this._common.apiError?.errors?.[0].code ?? '' });
              resolve(false);
            } else {
              // 正常系
              /* ※以降の処理は、エラーが発生していない空席照会時アップグレード可否照会レスポンスが通知された場合、処理を行う。当処理はstoreを介して行う。 */
              this._upgradeAvailability = response;
              // 動的文言判定用情報 空席照会時アップグレード可否照会レスポンス
              updateDynamicSubjectUpgradeAvailability(response);
              resolve(true);
            }
          }
        }
      );
    });
  }

  /** TSの表示要否判定処理 */
  private determineDisplayNecessity(i: number, displayData: Data, filterConditionData: FilterConditionData): boolean {
    if (displayData.roundtripBounds) {
      for (
        let k = 0;
        displayData.roundtripBounds[i].travelSolutions && k < displayData.roundtripBounds[i].travelSolutions!.length;
        k++
      ) {
        // 選択乗継回数リストが空でなく、選択乗継回数リストに当該TS.numberOfConnectionsが含まれない場合、処理結果をfalseとして当処理を終了する
        if (
          this.selectedStopsList.length > 0 &&
          displayData.roundtripBounds[i].travelSolutions![k].numberOfConnections &&
          !this.selectedStopsList.includes(displayData.roundtripBounds[i].travelSolutions![k].numberOfConnections!)
        ) {
          continue;
        }

        if (
          this.selectedStopsList.length > 0 &&
          displayData.roundtripBounds[i].travelSolutions![k].numberOfConnections === 0 &&
          !this.selectedStopsList.includes(displayData.roundtripBounds[i].travelSolutions![k].numberOfConnections!)
        ) {
          continue;
        }

        if (
          (filterConditionData.boundFilterItemList?.[i].durationRange?.selectedMinValue &&
            filterConditionData.boundFilterItemList?.[i].durationRange?.limitMinValue &&
            Number(filterConditionData.boundFilterItemList?.[i].durationRange?.selectedMinValue) !==
              Number(filterConditionData.boundFilterItemList?.[i].durationRange?.limitMinValue)) ||
          (filterConditionData.boundFilterItemList?.[i].durationRange?.limitMaxValue &&
            filterConditionData.boundFilterItemList?.[i].durationRange?.selectedMaxValue &&
            Number(filterConditionData.boundFilterItemList?.[i].durationRange?.limitMaxValue) !==
              Number(filterConditionData.boundFilterItemList?.[i].durationRange?.selectedMaxValue))
        ) {
          // durationが秒単位、selectedMinValue・selectedMaxValueが分単位のため、selectedMinValue・selectedMaxValueを秒単位に変換して比較する
          if (
            (displayData.roundtripBounds[i].travelSolutions![k].duration &&
              filterConditionData.boundFilterItemList?.[i].durationRange?.selectedMinValue &&
              displayData.roundtripBounds[i].travelSolutions![k].duration! <
                Number(filterConditionData.boundFilterItemList?.[i].durationRange?.selectedMinValue!) * 60) ||
            (displayData.roundtripBounds[i].travelSolutions![k].duration &&
              filterConditionData.boundFilterItemList?.[i].durationRange?.selectedMaxValue &&
              displayData.roundtripBounds[i].travelSolutions![k].duration! >
                Number(filterConditionData.boundFilterItemList?.[i].durationRange?.selectedMaxValue!) * 60)
          ) {
            continue;
          }
        }

        // 選択出発空港リストが空でなく、選択出発空港リストに当該TS.originLocationCodeが含まれない場合、当処理を終了する
        if (
          this.selectedDepartureAirportsList.length > 0 &&
          displayData.roundtripBounds[i].travelSolutions![k].originLocationCode &&
          !this.selectedDepartureAirportsList.includes(
            displayData.roundtripBounds[i].travelSolutions![k].originLocationCode!
          )
        ) {
          continue;
        }

        // 出発時間帯フィルタ有無を初期値falseとする
        let isDepartureDateTimeFilter = false;

        if (
          (filterConditionData.boundFilterItemList?.[i].departureTimeRange?.limitMinValue &&
            filterConditionData.boundFilterItemList?.[i].departureTimeRange?.selectedMinValue &&
            Number(filterConditionData.boundFilterItemList?.[i].departureTimeRange?.limitMinValue) !==
              Number(filterConditionData.boundFilterItemList?.[i].departureTimeRange?.selectedMinValue)) ||
          (!filterConditionData.boundFilterItemList?.[i].departureTimeRange?.limitMinValue &&
            filterConditionData.boundFilterItemList?.[i].departureTimeRange?.selectedMinValue &&
            Number(filterConditionData.boundFilterItemList?.[i].departureTimeRange?.selectedMinValue) !== 0) ||
          (filterConditionData.boundFilterItemList?.[i].departureTimeRange?.limitMaxValue &&
            filterConditionData.boundFilterItemList?.[i].departureTimeRange?.selectedMaxValue &&
            Number(filterConditionData.boundFilterItemList?.[i].departureTimeRange?.limitMaxValue) !==
              Number(filterConditionData.boundFilterItemList?.[i].departureTimeRange?.selectedMaxValue)) ||
          (!filterConditionData.boundFilterItemList?.[i].departureTimeRange?.limitMaxValue &&
            filterConditionData.boundFilterItemList?.[i].departureTimeRange?.selectedMaxValue &&
            Number(filterConditionData.boundFilterItemList?.[i].departureTimeRange?.selectedMaxValue) !== 1439)
        ) {
          isDepartureDateTimeFilter = true;
        }

        // 出発時間帯フィルタ有無=trueの場合、以下の処理を行う
        if (isDepartureDateTimeFilter) {
          const departureDateTime =
            displayData.roundtripBounds[i].travelSolutions![k].originDepartureEstimatedDateTime ??
            displayData.roundtripBounds[i].travelSolutions![k].originDepartureDateTime;

          if (!departureDateTime) {
            continue;
          }

          const departureTime = this.convertDateTimeCharactersToNumber(departureDateTime);
          // 出発時間<フィルタ条件入力情報.出発時間帯.現在選択中の最小値、または出発時間帯>フィルタ条件入力情報.出発時間帯.現在選択中の最大値の場合、当処理を終了する
          if (
            departureTime <
              Number(filterConditionData.boundFilterItemList?.[i].departureTimeRange?.selectedMinValue!) ||
            departureTime > Number(filterConditionData.boundFilterItemList?.[i].departureTimeRange?.selectedMaxValue!)
          ) {
            continue;
          }
        }

        // 選択到着空港リストが空でなく、選択到着空港リストに当該TS.destinationLocationCodeが含まれない場合、当処理を終了する
        if (
          this.selectedArrivalAirportsList.length > 0 &&
          displayData.roundtripBounds[i].travelSolutions![k].destinationLocationCode &&
          !this.selectedArrivalAirportsList.includes(
            displayData.roundtripBounds[i].travelSolutions![k].destinationLocationCode!
          )
        ) {
          continue;
        }

        if (
          (filterConditionData.boundFilterItemList?.[i].arrivalTimeRange?.selectedMinValue &&
            Number(filterConditionData.boundFilterItemList?.[i].arrivalTimeRange?.selectedMinValue) !== 0) ||
          (filterConditionData.boundFilterItemList?.[i].arrivalTimeRange?.selectedMaxValue &&
            Number(filterConditionData.boundFilterItemList?.[i].arrivalTimeRange?.selectedMaxValue) !== 1439)
        ) {
          // 到着時間について、当該TS.destinationArrivalEstimatedDateTimeが存在する場合、
          // その値を設定し、存在しない場合は、当該TS.destinationArrivalDateTimeを設定する
          const arrivalDateTime =
            displayData.roundtripBounds[i].travelSolutions![k].destinationArrivalEstimatedDateTime ??
            displayData.roundtripBounds[i].travelSolutions![k].destinationArrivalDateTime;

          if (!arrivalDateTime) {
            continue;
          }

          const arrivalTime = this.convertDateTimeCharactersToNumber(arrivalDateTime);
          // 到着時間<フィルタ条件入力情報.到着時間帯.現在選択中の最小値、または到着時間>フィルタ条件入力情報.到着時間帯.現在選択中の最大値の場合、当処理を終了する
          if (
            arrivalTime < Number(filterConditionData.boundFilterItemList?.[i].arrivalTimeRange?.selectedMinValue!) ||
            arrivalTime > Number(filterConditionData.boundFilterItemList?.[i].arrivalTimeRange?.selectedMaxValue!)
          ) {
            continue;
          }
        }

        // NHグループ運航フィルタ要否=true、または選択他社運航キャリアリストが空でない場合、以下の処理を行う
        if (this.isNeedNHGroupOperatingFilter || this.selectedCompetitorAirLineList.length > 0) {
          // 運航キャリアフィルター可を初期値falseとする
          let isApplyOperationAirlineFilter = false;

          displayData.roundtripBounds[i].travelSolutions![k].flights?.forEach((flight) => {
            if (this.isNeedNHGroupOperatingFilter && flight.isNhGroupOperated) {
              isApplyOperationAirlineFilter = true;
            }

            // 選択他社運航キャリアリストについて、運航キャリアコードと運航キャリア名称をそれぞれ取り出した配列を定義する
            const selectedCompetitorAirLineCodeList = this.selectedCompetitorAirLineList.map((v) => v.value);
            const selectedCompetitorAirLineNameList = this.selectedCompetitorAirLineList.map((v) => v.name);

            if (
              (flight.operatingAirlineCode &&
                selectedCompetitorAirLineCodeList.includes(flight.operatingAirlineCode)) ||
              (flight.operatingAirlineCode === '' &&
                flight.operatingAirlineName &&
                selectedCompetitorAirLineNameList.includes(flight.operatingAirlineName))
            ) {
              isApplyOperationAirlineFilter = true;
            }
          });

          // 運航キャリアフィルター可=falseとなる場合、当処理を終了する
          if (!isApplyOperationAirlineFilter) {
            continue;
          }
        }

        // 選択機種リストが空でない場合、以下の処理を行う
        if (this.selectedAirCraftList.length > 0) {
          // 機種フィルタ要否を、初期値falseとして用意する
          let isNeedAirCraftFilter = false;

          // 選択機種リストに当該flight.aircraftCodesが含まれる場合、機種フィルタ要否をtrueとする
          displayData.roundtripBounds[i].travelSolutions![k].flights?.forEach((flight) => {
            if (flight.aircraftCode && this.selectedAirCraftList.includes(flight.aircraftCode)) {
              isNeedAirCraftFilter = true;
            }
          });

          // 機種フィルタ要否=falseとなる場合、当処理を終了する
          if (!isNeedAirCraftFilter) {
            continue;
          }
        }

        // フィルタ条件入力情報.Wi-Fiサービスチェック状態=true、
        // かつ当該TS.wiFiType≠”1”(全てのセグメントがWi-Fiサービスあり)の場合、処理結果をfalse(continue)して当処理を終了する。
        if (
          filterConditionData.boundFilterItemList?.[i].equipment?.isEnabled &&
          displayData.roundtripBounds[i].travelSolutions?.[k].wiFiType !== '1'
        ) {
          continue;
        }

        // ここまで到達したTSをtravelSolutionListに追加
        this.travelSolutionList.push(displayData.roundtripBounds[i].travelSolutions![k]);
      }
      return true;
    }
    return false;
  }

  private updateDisplay() {
    // フィルタ後のデータのソート処理を行う
    this._owd = this._sortConditionModalService.updateTravelSolutionsBySortCondition(
      this.props?.sortConditionData.selectedSortCondition ?? SortCondition.CPD_RANK,
      this._owd
    );

    // ソート条件のストア情報更新
    this.updateSortTerms(this.props?.sortConditionData.selectedSortCondition ?? SortCondition.CPD_RANK);

    // 画面表示内容に従って、画面表示
    this.showDisplay();
  }

  /** ソート条件のストア更新 */
  private updateSortTerms(value: SortCondition) {
    let setData: Partial<RoundtripFlightAvailabilityInternationalState>;

    if (value === SortCondition.CPD_RANK) {
      setData = {
        // ソート条件に、"recommendedOrder"(CPDランクソート)を設定する
        sortTerms: 'recommendedOrder',
      };
      // Store更新
      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(setData);
    }

    if (value === SortCondition.DEPARTURE_TIME) {
      setData = {
        // ソート条件に、"departureTimeOrder"(出発時刻ソート)を設定する
        sortTerms: 'departureTimeOrder',
      };
      // Store更新
      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(setData);
    }

    if (value === SortCondition.ARRIVAL_TIME) {
      setData = {
        // ソート条件に、"arrivalTimeOrder"(到着時刻ソート)を設定する
        sortTerms: 'arrivalTimeOrder',
      };
      // Store更新
      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(setData);
    }

    if (value === SortCondition.DURATION) {
      setData = {
        // ソート条件に、"flightdurationOrder"(総所要時間ソート)を設定する
        sortTerms: 'flightdurationOrder',
      };
      // Store更新
      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(setData);
    }
    this._R01P030Store =
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData;
  }

  /**
   * yyyy-MM-dd'T'HH:mm:ss形式のものをHH:mm:ssに関して数値に変換する
   * @param dateTime 日時
   * @returns 日時をHH:mm:ssに関して数値に変換したもの
   */
  private convertDateTimeCharactersToNumber(dateTime: string): number {
    // 時
    const hour = Number(dateTime.slice(11, 13));
    // 分
    const minutes = Number(dateTime.slice(14, 16));

    return hour * 60 + minutes;
  }

  /**
   * HH:mm:ss形式のものをHH:mm:ssに関して数値に変換する
   * @param dateTime 日時
   * @returns 日時をHH:mm:ssに関して数値に変換したもの
   */
  private convertTimeOnlyCharactersToNumber(dateTime: string | undefined): number | undefined {
    if (!dateTime) {
      return undefined;
    }
    // 時
    const hour = Number(dateTime.slice(0, 2));
    // 分
    const minutes = Number(dateTime.slice(3, 5));

    return hour * 60 + minutes;
  }

  /**
   * 検索条件で指定した空港コード(都市コード混在)から空港名を取得
   * @param airportCode 空港コード
   * @returns 空港名
   */
  private getAirportName(airportCode: string, airportName: string): string {
    // キャッシュを取得
    let updateResult = '';
    // 検索条件の空港コードには都市コードが混在するため、SearchForAirportCodeから取得
    let _airPorts: AirportI18nSearchForAirportCodeCache =
      this._aswMasterSvc.aswMaster[MASTER_TABLE.AIRPORT_I18N_SEARCH_FOR_AIRPORT_CODE.key];
    let airPorts = _airPorts[airportCode];
    for (let i = 0; i < airPorts?.length; i++) {
      if (airPorts[i].search_for_airport_code === airportCode) {
        updateResult = airPorts[i].airport_name;
        break;
      }
    }
    if (updateResult) {
      return updateResult;
    }
    return airportName;
  }

  /**
   * 検索条件で指定した乗継地点(空港コード、都市コード混在)から空港名を取得
   * @param connection 乗継情報
   * @returns 乗継空港名
   */
  private getTransitAirportName(
    connection: RoundtripOwdRequestItinerariesInnerConnection | undefined
  ): Array<string> | undefined {
    if (!connection) {
      return undefined;
    }

    if (!connection.locationCodes) {
      return undefined;
    }
    const newTransitAirportList = connection.locationCodes.map((element) => this.getAirportName(element, ''));
    return newTransitAirportList;
  }

  /**
   * airOffersを基にairOfferIdをキーとするairOffer情報のMapオブジェクトを生成する
   * airOfferMappingを基にairOfferIdにアクセスするMapオブジェクトを生成する
   * @param response RoundtripOwdResponse 往復空席照会APIレスポンス
   */
  private initializeAirOfferMap() {
    // AirOfferのマップを初期化
    const airOffers = this._owd.data?.airOffers as AirOffers;
    this.airOfferMap = new Map<string, AirOffer>(Object.entries(airOffers ?? {}));
    // AirOfferMappingから往路TSID ⇒ 往路FFIDのMAP
    this.airOfferMappingMap = new Map(Object.entries(this._owd.data?.airOfferMapping!));
    this.airOfferMappingMap.forEach((v1, k1, map1) => {
      if (typeof v1 === 'object') {
        // 往路FFID ⇒ 復路TSIDのマップ
        const value1 = new Map(Object.entries(v1));
        value1.forEach((v2, k2, map2) => {
          if (typeof v2 === 'object') {
            // 復路TSID ⇒ 復路FFIDのマップ
            const value2 = new Map(Object.entries(v2!));
            value2.forEach((v3, k3, map3) => {
              if (typeof v3 === 'object') {
                // 復路FFID ⇒ AirOfferIDのマップ
                const value3 = new Map(Object.entries(v3));
                map3.set(k3, value3);
              }
            });
            map2.set(k2, value2);
          }
        });
        map1.set(k1, value1);
      }
    });
  }

  /**
   * 選択中TS・FF情報 フライト再選択ボタン
   * @param boundIndex
   */
  public clickShowOtherFlightsButton(boundIndex: number) {
    this.unselectFareFamily(boundIndex);
  }

  /** 選択中のTS・FFを未選択にする */
  private unselectFareFamily(boundIndex: number) {
    const showPropsList: ShowProps[] = JSON.parse(JSON.stringify(this.props?.showPropsList));
    showPropsList[boundIndex].isShowSelectedTsAndFf = false;
    this.props = {
      ...this.props!,
      showPropsList,
    };
    this._changeDetectorRef.markForCheck();
  }

  /** ソート条件を変更する */
  private updateSortCondition(value: SortCondition) {
    if (value > -1 && value !== this.props?.sortConditionData.selectedSortCondition) {
      this.props = {
        ...this.props!,
        sortConditionData: { selectedSortCondition: value },
      };
    }
  }

  /** 選択したキャビンクラスの値を変更し、選択したキャビンクラスに基づく画面表示処理を実施する */
  private updateSelectedCabinClass(value: string) {
    if (value && value !== this.props?.selectedCabinClass) {
      let fareOption = this.props?.selectedFareOptionType;

      if (this._R01P030Store.roundtripOwdRequest?.fare.isMixedCabin === false) {
        const cffList = this._shoppingLibService.createFareOptionList(
          this._R01P030Store.commercialFareFamilyClassification ?? '',
          value
        ) as unknown as Array<FareTypeOption>;

        if (!cffList.find((ele) => ele.value === fareOption)) {
          fareOption = cffList[0].value;
        }
      }
      // リクエスト検索条件をテンポラリ検索条件に格納する
      let temporaryRequestCondition: RoundtripOwdRequest | undefined = JSON.parse(
        JSON.stringify(this._R01P030Store.roundtripOwdRequest)
      );

      // テンポラリの検索条件.fare.cabinClassに、キャビンクラスを設定する。
      if (temporaryRequestCondition && temporaryRequestCondition.fare.cabinClass) {
        temporaryRequestCondition.fare.cabinClass = value;
      }

      // リクエスト用検索条件.fare.isMixedCabin=falseの場合、テンポラリの検索条件.fareOptionTypeに、運賃オプションを設定する。
      if (temporaryRequestCondition && temporaryRequestCondition.fare.isMixedCabin === false) {
        temporaryRequestCondition.fare.fareOptionType = fareOption;
      }

      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
        cabinClass: value,
        fareOption: fareOption,
      });

      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
        isChangeSearchData: true,
        isHistoryRegistration: false,
        isSelectLowestFare: false,
      });

      this.vacantSeatInquiryProcessing(true, true, temporaryRequestCondition);
    }
  }

  /** 選択した運賃オプションの値を変更し、選択した運賃オプションに基づく画面表示処理を実施する */
  private updateSelectedFareOptionType(value: string) {
    if (value && value !== this.props?.selectedFareOptionType) {
      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
        fareOption: value,
      });
      // リクエスト検索条件をテンポラリ検索条件に格納する
      let temporaryRequestCondition: RoundtripOwdRequest | undefined = JSON.parse(
        JSON.stringify(this._R01P030Store.roundtripOwdRequest)
      );
      // テンポラリの検索条件.fare.fareOptionTypeに、キャビンクラスを設定する。
      if (temporaryRequestCondition && temporaryRequestCondition.fare.fareOptionType) {
        temporaryRequestCondition.fare.fareOptionType = value;
      }

      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
        isChangeSearchData: true,
        isHistoryRegistration: false,
        isSelectLowestFare: false,
      });

      this.vacantSeatInquiryProcessing(true, true, temporaryRequestCondition);
    }
  }

  /**
   * データコード=“PD_930”(表示用クラス名称)、value=クラス名称コード(※)となるASWDB(マスタ)の汎用マスターデータ(リスト).表示内容取得
   * @param value クラス名称コード
   * @returns データコード=“PD_930”の表示内容
   */
  private getPD930Content(value: string) {
    let listDataAkamaiData: MListData[] = this._aswMasterSvc.aswMaster[MASTER_TABLE.LISTDATA_ALL.key];
    let content = '';
    // キャッシュを取得
    listDataAkamaiData?.forEach((data) => {
      if (data.data_code === 'PD_930' && data.value === value) {
        content = data.display_content;
      }
    });
    return content;
  }

  /**
   * PD_930キャッシュの取得（getPD930Contentに変更になる予定で、正式アナウンスがあったら削除予定）
   * @param value
   * @returns
   */
  private getPD930Content_old(type: string, value: string): string {
    let result: string = '';
    let m_list_data_930: CabinCacheList = this._aswMasterSvc.aswMaster[MASTER_TABLE.M_LIST_DATA_930.key];
    let typeDataList = m_list_data_930?.[type];
    if (typeDataList) {
      typeDataList.some((typeData: CabinCache) => {
        if (typeData.value === value) {
          result = typeData.label;
        }
      });
    }
    return result;
  }

  /** 国内単独旅程判定処理（true: 国内のみ, false:　海外旅程を含む） */
  private checkOnlyJapan(state: SearchFlightState): boolean {
    let preRoundTrip: RoundTrip | undefined;
    let preOnewayOrMulticity: Array<onewayOrMulticity> | undefined;
    if (state.tripType === TripType.ROUND_TRIP) {
      preRoundTrip = {
        departureOriginLocationCode: state.roundTrip.departureOriginLocationCode,
        departureConnectionLocationCode: state.roundTrip.departureConnection.connectionLocationCode,
        departureDestinationLocationCode: state.roundTrip.departureDestinationLocationCode,
        returnConnectionLocationCode: state.roundTrip.returnConnection.connectionLocationCode,
      };
    } else {
      preOnewayOrMulticity = state.onewayOrMultiCity.map((data) => {
        return {
          originLocationCode: data.originLocationCode,
          destinationLocationCode: data.destinationLocationCode,
        };
      });
    }
    return this._shoppingLibService.checkJapanOnlyTrip(preRoundTrip, preOnewayOrMulticity);
  }

  /**
   *   ヘッダー色判定用リスト作成
   */

  public getTripTypeList(roundtripOwdRequest: RoundtripOwdRequest) {
    roundtripOwdRequest?.itineraries.forEach((itinerary) => {
      const tripType =
        this._shoppingLibService.getAirportByRefCode(itinerary.originLocationCode)?.country_2letter_code !== 'JP' ||
        this._shoppingLibService.getAirportByRefCode(itinerary.destinationLocationCode)?.country_2letter_code !== 'JP'
          ? 'international'
          : 'domestic';
      this._tripTypeList.push(tripType);
    });
  }
}
