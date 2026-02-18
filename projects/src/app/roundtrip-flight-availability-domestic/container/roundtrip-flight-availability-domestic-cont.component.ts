import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AppInfoService, BasePageService, MasterDataService } from '../common/services';
import {
  AlertMessageStoreService,
  ApiErrorResponseService,
  AswCommonStoreService,
  AswContextStoreService,
  DialogDisplayService,
  ErrorsHandlerService,
  LoggerDatadogService,
  ModalService,
  PageLoadingService,
  TealiumService,
  AswMasterService,
  CommonLibService,
  SystemDateService,
} from '@lib/services';
import { filter, map, skip, switchMap, take } from 'rxjs/operators';
import {
  SEARCH_TYPE,
  SELECTED_TS_FF_TYPE,
  FlightSearchCondition,
  AppInfoType,
  AllAirBounDisplayAndTsType,
  travelSolutionDisplayType,
} from '../common/interfaces';
import { BehaviorSubject, Observable, Subscription, combineLatest } from 'rxjs';
import {
  AlertMessageItem,
  AlertType,
  ApiErrorResponseModel,
  DialogClickType,
  DialogType,
  ErrorType,
  LoadingDisplayMode,
  LoginStatusType,
  PageType,
} from '@lib/interfaces';
import { Router } from '@angular/router';
import { dateFormat, getFilterResult, getFormatHourTimeForMinutes, getSortResult } from '../common/helpers';
import {
  FavoritePostRequestFavorite,
  HistoryPostRequestHistoryBoundsInner,
  HistoryPostRequestHistoryRoundtrip,
  NumberOfTravelers,
} from 'src/sdk-search';
import {
  AirBounDisplayType,
  FilterConditionDomestic,
  ServiceInfoListType,
  SortOrder,
  FareFamilyOutputType,
} from '../common/interfaces';
import {
  selectRoundtripFpp,
  selectRoundtripFppIsFailureStatus,
} from '../common/store/roundtrip-fpp/roundtrip-fpp.selectors';
import { Store, select } from '@ngrx/store';
import { resetRoundtripFpp, RoundtripFppStore, setRoundtripFppFromApi } from '../common/store/roundtrip-fpp';
import {
  Bound,
  DefaultService,
  HistoryPostRequest,
  HistoryPostRequestHistory,
  RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner,
  RoundtripFppItemAirBoundsDataType,
  RoundtripFppItemAirCalendarDataType,
  RoundtripFppItemBoundDetailsDataType,
  RoundtripFppItemFareFamilyDataTypeInner,
  RoundtripFppRequest,
  RoundtripFppRequestFare,
  RoundtripFppRequestItinerariesInner,
  RoundtripFppRequestItinerariesInnerConnection,
  RoundtripFppResponse,
} from '../common/sdk';
import {
  CancelPrebookService,
  CreateCartStoreService,
  CurrentCartStoreService,
  DeliveryInformationStoreService,
  GetUnavailablePaymentByOfficeCodeService,
  SearchFlightStoreService,
  UpdateAirOffersStoreService,
} from '@common/services';
import { SearchFlightConditionForRequestStoreService } from '@common/services/shopping/search-flight-condition-for-request-store/search-flight-condition-for-request-store.service';
import { HistoryService } from '@common/services/history/history-store.service';
import { CreateCartStore, SearchFlightStateDetails, TripType, selectCreateCartIsFailureStatus } from '@common/store';
import { FavoriteService } from '@common/services/favorite/favorite-store.service';
import { AmcLoginHeaderComponent } from '@lib/components/shared-ui-components/amc-login/amc-login-header.component';
import { AmcLoginComponent } from '@lib/components/shared-ui-components/amc-login/amc-login.component';
import { CreateCartRequest, PatchUpdateAirOffersRequest, PostGetCartResponseData } from 'src/sdk-reservation';
import { Title } from '@angular/platform-browser';
import { StaticMsgPipe } from '@lib/pipes';
import { CriteoAlignmentInfo } from '@common/components';
import { MasterStoreKey } from '@conf/asw-master.config';
import { M_OFFICE } from '@common/interfaces/common/m_office';
import { RoutesResRoutes } from '@conf/routes.config';
import { RoundtripFlightAvailabilityInternationalContService } from '@app/roundtrip-flight-availability-international/container/roundtrip-flight-availability-international-cont.service';
import { DeliverySearchInformationStoreService } from '@common/services/store/delivery-search-information-store/delivery-search-information-store.service';
import { isEmptyObject } from '@common/helper';
import { ErrorCodeConstants } from '@conf/app.constants';

/** ページタートル*/
const PAGE_TITLE = {
  ROUNDTRIP_FLIGHT_AVAILABILITY_DOMESTIC: 'label.flighSearchResult.title',
  DOMESTIC_ASW_PAGE_TITLE: 'label.domesticAswPageTitle',
};
/** ページ情報 */
const PAGE_INFO = {
  FUNC_ID: 'R01',
  PAGE_ID: 'P031',
};
/** 遷移元画面 ページ情報 */
const TRANSITION_SOURCE_PAGE_INFO = {
  FUNC_ID: 'R01',
  PAGE_ID: 'P040',
};
/** バウンド種別 */
export type BoundType = 'out' | 'return';
export const BoundType = {
  OUT: 'out' as BoundType,
  RETURN: 'return' as BoundType,
};
/** ワーニング ID */
const WARNING_ID = {
  W0888: 'W0888',
  W0887: 'W0887',
  W0890: 'W0890',
  W0837: 'W0837',
};
/** エラーメッセージ ID */
const ERROR_MSG_ID = {
  E0895: 'E0895',
  E0892: 'E0892',
  E0893: 'E0893',
  E0889: 'E0889',
  E1036: 'E1036',
  E1037: 'E1037',
  E1038: 'E1038',
  E0228: 'E0228',
  EA043: 'EA043',
};
/** 時刻形式 */
const DATE_FORMAT = 'yyyy-MM-dd';
const DATE_TIME_DEFAULT_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";
/** メッセージコード */
const MSG_CODE = {
  MSG1003: 'm_dynamic_message-MSG1003',
  MSG1112: 'm_dynamic_message-MSG1112',
  MSG1113: 'MSG1113',
  MSG1114: 'MSG1114',
  MSG1035: 'MSG1035',
};

/**
 * 往復空席照会結果(国内)画面ContComponent
 * (往路: out / 復路: return)
 */
@Component({
  selector: 'asw-roundtrip-flight-availability-domestic-cont',
  templateUrl: './roundtrip-flight-availability-domestic-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundtripFlightAvailabilityDomesticContComponent implements OnInit, OnDestroy {
  /**
   * フライト検索結果
   */
  private _searchAirResult$: Observable<RoundtripFppResponse>;

  /**
   * 往路:初期表示時フィルタ変更旅程空席照会情報
   */
  public outFilterSearchResult?: Array<RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner>;

  /**
   * 復路:初期表示時フィルタ変更旅程空席照会情報
   */
  public returnFilterSearchResult?: Array<RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner>;

  /**
   * 往路: 初期表示時選択可能な便
   */
  public outSeatAvailability: boolean = false;

  /**
   * 復路: 初期表示時選択可能な便
   */
  public returnSeatAvailability: boolean = false;

  /**
   * 往路:7日間空席照会結果
   */
  public outAirCalendar?: RoundtripFppItemAirCalendarDataType;

  /**
   * 復路:7日間空席照会結果
   */
  public returnAirCalendar?: RoundtripFppItemAirCalendarDataType;

  /**
   * 往路:FareFamily
   */
  public outFareFamilies?: Array<RoundtripFppItemFareFamilyDataTypeInner>;

  /**
   * 復路:FareFamily
   */
  public returnFareFamilies?: Array<RoundtripFppItemFareFamilyDataTypeInner>;

  /**
   * 往路:出発日
   */
  public outDepartureDate?: string;

  /**
   * 復路:出発日
   */
  public returnDepartureDate?: string;

  /**
   * 往路:FF概要表示切替
   */
  public outFFSummaryDisplay: boolean = true;

  /**
   * 復路:FF概要表示切替
   */
  public returnFFSummaryDisplay: boolean = true;

  /**
   * 往路:サービス情報リスト(FF選択モーダルで使用される)
   */
  public outServiceInfoList?: ServiceInfoListType;

  /**
   * 往路:選択した往路Travel Solution情報
   */
  public outSelectedTS?: RoundtripFppItemBoundDetailsDataType | null;

  /**
   * 復路:選択した復路Travel Solution情報
   */
  public returnSelectedTS?: RoundtripFppItemBoundDetailsDataType | null;

  /**
   * 往路:選択した往路Air Bound情報
   */
  public outSelectedAirBound?: RoundtripFppItemAirBoundsDataType | null;

  /**
   * 復路:選択した復路Air Bound情報
   */
  public returnSelectedAirBound?: RoundtripFppItemAirBoundsDataType | null;

  /**
   * 往路:選択されたff情報
   */
  private _outFareFamilyInfo?: FareFamilyOutputType;

  /**
   * 復路:選択されたff情報
   */
  private _returnFareFamilyInfo?: FareFamilyOutputType;

  /**
   * リクエスト用検索条件
   */
  public searchCondition?: FlightSearchCondition;

  /**
   * 検索結果操作部.運賃オプション切替ボタン表示条件
   */
  public isFareOptionDisplay = true;

  /**
   * 往路:検索条件.区間毎の情報
   */
  public outItinerary?: RoundtripFppRequestItinerariesInner;

  /**
   * 復路:検索条件.区間毎の情報
   */
  public returnItinerary?: RoundtripFppRequestItinerariesInner;

  /**
   * 往路:変更旅程空席照会情報
   */
  public outSearchResult?: RoundtripFppResponse | null;

  /**
   * 復路:変更旅程空席照会情報
   */
  public returnSearchResult?: RoundtripFppResponse | null;

  /**
   * 往路:出発地
   */
  public outDepartureLocation?: string;

  /**
   * 復路:出発地
   */
  public returnDepartureLocation?: string;

  /**
   * 往路:到着地
   */
  public outArrivalLocation?: string;

  /**
   * 復路:到着地
   */
  public returnArrivalLocation?: string;

  /**
   * 往路:乗継空港
   */
  public outTransferAirport?: Array<string>;

  /**
   * 復路:乗継空港
   */
  public returnTransferAirport?: Array<string>;

  /**
   * 往路:選択中状態
   *
   * unSelected: 未選択
   * selected: 選択済み
   */
  public outStatus: 'unSelected' | 'selected' = 'unSelected';

  /**
   * 復路:選択中状態
   *
   * unSelected: 未選択
   * selected: 選択済み
   */
  public returnStatus: 'unSelected' | 'selected' = 'unSelected';

  /**
   * 往路:FF選択のすべてBoundInfo
   */
  public outAirBoundInfos?: Array<AirBounDisplayType>;

  /**
   * 復路:FF選択のすべてBoundInfo
   */
  public returnAirBoundInfos?: Array<AirBounDisplayType>;

  /**
   * 現在表示されている並べ替え順序
   */
  public currentSortOrder: SortOrder = SortOrder.RECCOMENDED;

  /**
   * 往路:フィルター条件
   */
  public outFilterCondition?: FilterConditionDomestic;

  /**
   * 復路:フィルター条件
   */
  public returnFilterCondition?: FilterConditionDomestic;

  /**
   * フィルタ条件の詳細
   */
  public filterConditionInit$: BehaviorSubject<SEARCH_TYPE> = new BehaviorSubject(SEARCH_TYPE.DEFAULT);

  /**
   * お気に入り登録済み
   */
  public isRegisteredFavorite = false;

  /**
   * 遷移元画面(R01_P040)を判定する
   */
  private _transitionFormP040 = false;

  /**
   * 検索時刻
   */
  public searchTime?: string;

  /**
   * スクロールイベント
   */
  public scrollEvent$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * 履歴用検索条件
   */
  private _searchFlight: SearchFlightStateDetails;

  /** 運賃情報 */
  private _fareOptionType?: string;

  /**
   * 往路選択解除
   */
  private _outSelectCancel?: boolean;

  /**
   * 復路選択解除
   */
  private _returnSelectCancel?: boolean;

  /**
   * アプリケーション情報.検索条件
   */
  private _tempSearchCondition?: FlightSearchCondition;

  /**
   * フライト検索完了の制御
   */
  private _searchSucess$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * 空席照会処理回数
   */
  private _processingTime = 0;

  /**
   * 検索実行の種類
   *
   * default: デフォルト処理、特に処理なし
   * outFFselect: 往復の場合、FFのmodelから往路が選択済み、復路のapiレスポンス場合
   * outCalendar: 7日間カレンダー(往路)選択から、往路のapiレスポンス場合
   * returnCalendar: 7日間カレンダー(復路)選択から、復路のapiレスポンス場合
   */
  private _searchType?: SEARCH_TYPE;

  /**
   * ngOnDestroyにunsubscribeを実行
   */
  private _subscriptions: Subscription = new Subscription();

  /**
   * 検索結果
   */
  private _searchResult?: RoundtripFppResponse;

  /**
   * Safe Travelウィジェット機能有効フラグ
   */
  public safeTravelWidget?: boolean;

  /**
   * 履歴用検索条件.搭乗者数
   */
  public travelers?: NumberOfTravelers;

  /** criteo連携情報 */
  public criteoAlignmentInfo: CriteoAlignmentInfo = {};

  /** プラン確認画面でstoreに登録したカート情報だけを渡されて旅程選択状態を復元することフラグ */
  private _cartRecovery: 'out' | 'return' | 'none' = 'none';

  constructor(
    private _store: Store<RoundtripFppStore | CreateCartStore>,
    private _router: Router,
    private _aswCommonSvc: AswCommonStoreService,
    // TODO: 暫定実装
    private _roundtripApiSvc: DefaultService,
    private _errHandlerSvc: ErrorsHandlerService,
    private _masterDataService: MasterDataService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _dialogSvc: DialogDisplayService,
    private _aswContextSvc: AswContextStoreService,
    private _apiErrorSvc: ApiErrorResponseService,
    private _baseSvc: BasePageService,
    private _loadingSvc: PageLoadingService,
    private _tealiumSvc: TealiumService,
    private _systemDateSvc: SystemDateService,
    private _favoriteService: FavoriteService, // お気に入り登録API(store)：favorite
    private _alertMsgSvc: AlertMessageStoreService,
    private _searchFlightConditionForRequestSvc: SearchFlightConditionForRequestStoreService,
    private _modalService: ModalService,
    private _createCartStoreService: CreateCartStoreService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _deliveryInformationStoreService: DeliveryInformationStoreService,
    private _cancelPrebookService: CancelPrebookService,
    private _updateAirOffersStoreService: UpdateAirOffersStoreService,
    private _searchFlightSvc: SearchFlightStoreService,
    private _historySvc: HistoryService,
    private _appInfoSvc: AppInfoService,
    private _loggerSvc: LoggerDatadogService,
    private _staticMsgPipe: StaticMsgPipe,
    private _titleSvc: Title,
    private _common: CommonLibService,
    private _aswMasterSvc: AswMasterService,
    private _roundtripFlightAvailabilityService: RoundtripFlightAvailabilityInternationalContService,
    private _deliverySearchInformationStoreService: DeliverySearchInformationStoreService,
    private _getUnavailablePaymentByOfficeCodeService: GetUnavailablePaymentByOfficeCodeService
  ) {
    // フライト検索結果
    this._searchAirResult$ = this._store.pipe(
      select(selectRoundtripFpp),
      filter((data): data is RoundtripFppResponse => !!data)
    );
    // 履歴用検索条件
    this._searchFlight = this._searchFlightSvc.getData();
    // ページタートル
    this._titleSvc.setTitle(
      this._staticMsgPipe.transform(PAGE_TITLE.ROUNDTRIP_FLIGHT_AVAILABILITY_DOMESTIC) +
        this._staticMsgPipe.transform(PAGE_TITLE.DOMESTIC_ASW_PAGE_TITLE)
    );
  }

  /**
   * 初期化処理
   */
  public ngOnInit() {
    // 遷移元画面(R01_P040)を判定する。
    this._setTransitionInfo();
    // ローディング画面の表示モードとしてプロモーションモードを指定して画面の初期化処理(G01-003)の初期化開始処理を呼び出す
    this._baseSvc.startInit(PAGE_INFO.FUNC_ID, PAGE_INFO.PAGE_ID);
    // 遷移元画面(R01_P040)の場合、以下の処理にて画面を表示、処理を中断し、以降の処理は行わない。
    if (this._transitionFormP040) {
      // 継続不可能エラータイプの処理
      this._searchApiErrorHandle();
      // 画面の再表示(apiリクエスト処理がない)
      this._histroyDataHandle();
    } else {
      // 往復指定日空席照会(OWD)用APIリクエスト情報
      const searchRequest = this._searchFlightConditionForRequestSvc.getData().request;
      let fppItineraries: Array<RoundtripFppRequestItinerariesInner> = [];
      searchRequest.itineraries.forEach((item) => {
        if (item.connection) {
          let connection: RoundtripFppRequestItinerariesInnerConnection = {
            locationCode: item.connection.locationCodes.join('+'),
          };
          if (item.connection.time !== undefined) {
            connection = { ...connection, time: item.connection.time };
          }
          const itinerary: RoundtripFppRequestItinerariesInner = { ...item, connection: connection };
          fppItineraries.push(itinerary);
        } else {
          fppItineraries.push(item as RoundtripFppRequestItinerariesInner);
        }
      });
      this.searchCondition = { ...searchRequest, itineraries: fppItineraries } as FlightSearchCondition;
      this._fareOptionType = this.searchCondition?.fare.fareOptionType;
      // 搭乗者数
      this.travelers = this.searchCondition.travelers;
      // 画面表示内容、リスト定義に従い画面を表示する。
      // FF ヘッダのグループ名称結合処理　⇒　common/components/fare-family-headerへの処理を変更する。
      // [変更旅程空席照会API呼び出し処理]:変更旅程空席照会APIを呼び出し、変更旅程空席照会情報を取得する
      this._store.dispatch(resetRoundtripFpp());
      // 継続不可能エラータイプの処理
      this._searchApiErrorHandle();
      this._getAirSearchForApi();
      // 現在日時を取得する/下表をすべて満たす場合、フライト検索(E01-P010)へ遷移する。
      this._airSearchResultHandle();
      // 以下の処理にて、選択したTSおよびFFの情報を更新する
      this._setSelectedInfo(SELECTED_TS_FF_TYPE.INIT);
      // アプリケーション情報.Safe Travelウィジェット機能有効フラグを設定する。
      this._setWithSafeTravelWidget();
    }
    // エラーが発生していない変更旅程空席照会API応答が通知されたことを契機に行う
    this._subscriptions.add(
      this._searchSucess$.pipe(filter((sucess) => !!sucess)).subscribe(() => {
        // 初期ない場合
        if (this._processingTime > 0) {
          this._loadingSvc.endLoading();
        }
        if (!this._isOnlyCallApiSearch && !(this._searchType === SEARCH_TYPE.OUT_CALENDAR)) {
          // アプリケーション情報.ソート順=”0”(CPDランク)とする
          this.currentSortOrder = SortOrder.RECCOMENDED;
        }

        // 以下の項目に初期値を設定する。
        this._setInitialValue();

        // 下表をすべて満たす支払方法がある場合、エラーメッセージID＝"W1862"(利用中のブラウザでは対象の支払方法が使用できないため、推奨ブラウザを使ってほしい旨)のワーニングメッセージを表示する。
        this._getUnavailablePaymentByOfficeCodeService.checkUnavailablePaymentByOfficeCode();

        // 空席照会処理回数に空席照会処理回数＋1を設定する
        this._processingTime = this._processingTime + 1;

        // アプリケーション情報.往路出発地のシステム日付に、リクエスト用検索条件.往復旅程区間.往路出発地を基に空港現地時間取得処理(G03-519)を呼び出した結果を設定する。（YYYY-MM-DD形式とする。）
        // ユーザ共通.操作オフィスコード
        const pointOfSaleId = this._aswContextSvc.aswContextData.pointOfSaleId;
        // 空港現地時間取得処理(G03-519)で取得した値をアプリケーション情報.空港現地時間に設定する
        const date: Date = this._systemDateSvc.getAirportLocalDate(pointOfSaleId);
        // アプリケーション情報.往路出発地のシステム日付
        const departureSystemDate = dateFormat(date, DATE_FORMAT);
        // 空席照会処理回数が2以上の場合、動的文言判定用情報として以下を指定して画面の初期化処理(G01-003)の初期化終了処理を呼び出す
        if (this._processingTime === 1) {
          // 動的文言判定用情報として以下を指定して画面の初期化処理(G01-003)の初期化終了処理を呼び出す。
          const dynamicParams$ = combineLatest([
            this._searchAirResult$,
            this._common.amcMemberStoreService.getAMCMember$(),
          ]).pipe(
            map(([searchAttribute, amcMember]) => {
              return {
                // 履歴用検索条件
                dynamicSearchFlight: this._searchFlight,
                // リクエスト用検索条件
                dynamicSearchFlightConditionForRequest: this.searchCondition,
                // 往復指定日空席照会(FPP)API応答
                dynamicGetSearchAttributeReply: searchAttribute,
                // アプリケーション情報.Safe Travelウィジェット機能有効フラグ
                dynamicApplicationSafeTravelWidget: this.safeTravelWidget,
                // 会員情報(AmcMember)
                dynamicAmcmemberReply: amcMember,
                // アプリケーション情報.往路出発地のシステム日付
                dynamicDepartureSystemDate: departureSystemDate,
                // リクエスト用検索条件.往復旅程区間.往路出発日
                dynamicDepartureDate: this.searchCondition?.itineraries[0].departureDate,
                // MSG1655を判定フラグ
                dynamicContainedHandicappedFare: this._returnIsContainedHandicappedFare(searchAttribute),
              };
            })
          );
          this._baseSvc.endInit(dynamicParams$);
        }
        // 以下の処理にて、エラーのチェックを行う
        this._errorCheckHandle();

        // 往復旅程両方の変更かつ往路のFFを選択した場合、復路のバウンドリストまでスクロールする
        if (
          (this._searchType === SEARCH_TYPE.OUT_FF_SELECT && this._cartRecovery === 'none') ||
          this._searchType === SEARCH_TYPE.RETURN_CALENDAR
        ) {
          this.scrollEvent$.next(true);
        }
        // 往路が選択済み、復路の選択場合の状態初期化
        this._searchType = SEARCH_TYPE.DEFAULT;
        // フィルタ条件の初期設定
        this.filterConditionInit$.next(this._searchType as SEARCH_TYPE);
        this._changeDetectorRef.markForCheck();
      })
    );
    // criteo連携情報
    this._createCriteoAlignmentInfo();
    // カート作成・更新処理エラー処理
    this._cardProcessingErrorHandle();
    //セッションストレージからaswServiceを削除する
    sessionStorage.removeItem('aswService');
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    this._baseSvc.unsubscribe(this._subscriptions);
  }

  /**
   * FF選択ボタン押下処理(往路の場合)
   * @param fareFamilyInfo FF情報
   */
  public selectOutFareFamily(fareFamilyInfo: FareFamilyOutputType) {
    this.outStatus = 'selected';
    this.outAirBoundInfos = fareFamilyInfo.airBoundInfo;
    this.outSelectedAirBound = fareFamilyInfo.selectedAirBoundInfo;
    this._outFareFamilyInfo = fareFamilyInfo;
    this._setSelectedInfo(SELECTED_TS_FF_TYPE.OUT);
    // アプリケーション情報.検索条件.区間毎の情報の件数が2件
    if (this.searchCondition?.itineraries.length === 2) {
      // 復路の検索結果を表示する
      this._searchType = SEARCH_TYPE.OUT_FF_SELECT;
      if (this._cartRecovery !== 'none') {
        this._cartRecovery = 'return';
      }
      this._getAirSearchForApi(fareFamilyInfo.selectedAirBoundInfo.airBoundId);
    }
    this._selectCancelMessageHandle();
  }

  /**
   * FF選択ボタン押下処理(復路の場合)
   * @param fareFamilyInfo FF情報
   */
  public selectReturnFareFamily(fareFamilyInfo: FareFamilyOutputType) {
    this.returnStatus = 'selected';
    this.returnAirBoundInfos = fareFamilyInfo.airBoundInfo;
    this.returnSelectedAirBound = fareFamilyInfo.selectedAirBoundInfo;
    this._returnFareFamilyInfo = fareFamilyInfo;
    this._setSelectedInfo(SELECTED_TS_FF_TYPE.RETURN);
    this._alertAreaHandle('delete');
    this._selectCancelMessageHandle();
  }

  /** 往路: フライト再選択 */
  public showOtherOutFlights() {
    this.outStatus = 'unSelected';
    this.returnSearchResult = null;
    this._setSelectedInfo(SELECTED_TS_FF_TYPE.RETURN_RESET);
    this.searchCondition = JSON.parse(JSON.stringify(this.searchCondition));
    if (this.returnSelectedAirBound) {
      // MSG1114のClearなど
      this._alertAreaHandle('add');
    }
  }

  /** 復路: フライト再選択 */
  public showOtherReturnFlights() {
    this.returnStatus = 'unSelected';
    this.searchCondition = JSON.parse(JSON.stringify(this.searchCondition));
    this._alertAreaHandle('delete');
  }

  /**
   * 往路カレンダー選択
   * @param date 日付
   */
  public selectOutCalendar(date: string) {
    let tempSearchCondition: FlightSearchCondition = JSON.parse(JSON.stringify(this.searchCondition));
    for (let index = 0; index < this.searchCondition?.itineraries.length!; index++) {
      if (index === 0) {
        tempSearchCondition.itineraries[0].departureDate = date;
      }
    }
    this._tempSearchCondition = tempSearchCondition;
    this._searchType = SEARCH_TYPE.OUT_CALENDAR;
    this._roundTripClearReturn();
    this._getAirSearchForApi();
  }

  /**
   * 復路カレンダー選択
   * @param date 日付
   */
  public selectReturnCalendar(date: string) {
    let tempSearchCondition: FlightSearchCondition = JSON.parse(JSON.stringify(this.searchCondition));
    for (let index = 0; index < this.searchCondition?.itineraries.length!; index++) {
      if (index === 1) {
        tempSearchCondition.itineraries[1].departureDate = date;
      }
    }
    const selectedBoundId = this.outSelectedAirBound?.airBoundId;
    this._tempSearchCondition = tempSearchCondition;
    this._searchType = SEARCH_TYPE.RETURN_CALENDAR;
    this._getAirSearchForApi(selectedBoundId);
  }

  /**
   * 次へボタン押下処理(検索結果フッタ)
   */
  public continue() {
    // 以下のメッセージIDを基に、順に1件ずつ確認ダイアログ(G02-005)をモーダルで表示する。
    if (this.outSelectedTS?.isSmallAircraft || this.returnSelectedTS?.isSmallAircraft) {
      if (this.outSelectedTS?.isSmallAircraft || this.returnSelectedTS?.isSmallAircraft) {
        this._dialogSvc
          .openDialog({
            message: MSG_CODE.MSG1003,
          })
          .buttonClick$.pipe(filter((dialog) => dialog.clickType === DialogClickType.CONFIRM))
          .subscribe(() => {
            this._setAmcLoginHandle();
          });
      }
    } else {
      this._setAmcLoginHandle();
    }
  }

  /**
   * キャビンクラス切替ボタン押下処理
   * @param cabin キャビンクラス
   */
  public cabinClassApplyHandle(cabin: string) {
    const isRoundTrip = this.searchCondition?.itineraries && this.searchCondition.itineraries.length === 2;

    const _cabinClassChangeEvent = () => {
      if (this.searchCondition) {
        this.searchCondition = {
          ...this.searchCondition,
          fare: {
            ...this.searchCondition.fare,
            cabinClass: cabin,
            isMixedCabin: false,
          },
        };
        if (this.searchCondition.fare.mixedCabinClasses) {
          delete this.searchCondition.fare.mixedCabinClasses;
        }
      }
      isRoundTrip ? (this.returnSearchResult = null) : null;
      this._setSelectedInfo(SELECTED_TS_FF_TYPE.INIT);
      this._searchType = SEARCH_TYPE.DEFAULT;
      this._getAirSearchForApi();
    };
    // メッセージID=”MSG1112”(往路から検索をやりなおす旨)
    if (isRoundTrip && this.outSelectedAirBound) {
      this._dialogSvc
        .openDialog({
          message: MSG_CODE.MSG1112,
          type: DialogType.CHOICE,
        })
        .buttonClick$.subscribe((dialog) => {
          if (dialog.clickType === DialogClickType.CONFIRM) {
            _cabinClassChangeEvent();
          } else {
            // キャビンクラスの切替前状態に戻る
            this.searchCondition = JSON.parse(JSON.stringify(this.searchCondition));
          }
        });
    } else {
      _cabinClassChangeEvent();
    }
  }

  /**
   *  お気に入り追加ボタン押下時処理 ※検索結果操作部
   */
  public addFavorite() {
    const searchFlight = this._searchFlight;
    // 旅程タイプ roundtrip：往復旅程の場合、isRoundTripType=true
    const isRoundTripType = this._searchFlight.tripType === TripType.ROUND_TRIP;
    let favorite: FavoritePostRequestFavorite = {
      tripType: isRoundTripType
        ? HistoryPostRequestHistory.TripTypeEnum.Roundtrip
        : HistoryPostRequestHistory.TripTypeEnum.OnewayOrMulticity,
      fare: this._getHistoryFare(),
      travelers: {
        ADT: searchFlight?.traveler.adt ?? 0,
        B15: searchFlight?.traveler.b15 ?? 0,
        CHD: searchFlight?.traveler.chd ?? 0,
        INF: searchFlight?.traveler.inf ?? 0,
      },
      promotionCode: searchFlight?.promotion.code,
    };
    if (isRoundTripType && searchFlight.roundTrip) {
      let roundtrip: HistoryPostRequestHistoryRoundtrip = {
        originLocationCode: searchFlight.roundTrip.departureOriginLocationCode ?? '',
        destinationLocationCode: searchFlight.roundTrip.departureDestinationLocationCode ?? '',
        departureDate: dateFormat(searchFlight.roundTrip.departureDate, DATE_FORMAT),
        returnDate: dateFormat(searchFlight.roundTrip.returnDate, DATE_FORMAT),
        departureTimeWindowFrom: getFormatHourTimeForMinutes(this._searchFlight.roundTrip.departureTimeWindowFrom),
        departureTimeWindowTo: getFormatHourTimeForMinutes(this._searchFlight.roundTrip.departureTimeWindowTo),
        returnTimeWindowFrom: getFormatHourTimeForMinutes(this._searchFlight.roundTrip.returnTimeWindowFrom),
        returnTimeWindowTo: getFormatHourTimeForMinutes(this._searchFlight.roundTrip.returnTimeWindowTo),
      };
      const departureConnection = this._searchFlight.roundTrip.departureConnection;
      if (departureConnection && departureConnection.connectionLocationCode) {
        roundtrip = { ...roundtrip, departureConnectionLocationCode: departureConnection.connectionLocationCode };
      }
      if (departureConnection && (departureConnection.connectionTime || departureConnection.connectionTime === 0)) {
        roundtrip = { ...roundtrip, departureConnectionTime: departureConnection.connectionTime };
      }
      const returnConnection = this._searchFlight.roundTrip.returnConnection;
      if (returnConnection && returnConnection.connectionLocationCode) {
        roundtrip = { ...roundtrip, returnConnectionLocationCode: returnConnection.connectionLocationCode };
      }
      if (returnConnection && (returnConnection.connectionTime || returnConnection.connectionTime === 0)) {
        roundtrip = { ...roundtrip, returnConnectionTime: returnConnection.connectionTime };
      }
      favorite = { ...favorite, roundtrip: roundtrip };
    } else {
      // 以下の項目を基に、お気に入り登録APIを呼び出す。
      const boundList: Array<HistoryPostRequestHistoryBoundsInner> = [];
      searchFlight?.onewayOrMultiCity.forEach((onewayOrMulticity) => {
        const bound: HistoryPostRequestHistoryBoundsInner = {
          /** 出発空港コード */
          originLocationCode: onewayOrMulticity.originLocationCode + '',
          /** 到着空港コード */
          destinationLocationCode: onewayOrMulticity.destinationLocationCode + '',
          /** 出発日(yyyy-MM-dd) */
          departureDate: dateFormat(onewayOrMulticity.departureDate, DATE_FORMAT),
          /** 出発開始時刻(HH:mm:ss) */
          departureTimeWindowFrom: getFormatHourTimeForMinutes(onewayOrMulticity.departureTimeWindowFrom),
          /** 出発終了時刻(HH:mm:ss) */
          departureTimeWindowTo: getFormatHourTimeForMinutes(onewayOrMulticity.departureTimeWindowTo),
        };
        boundList.push(bound);
      });
      favorite = { ...favorite, bounds: boundList };
    }

    // お気に入り追加API実行
    this._favoriteService.setFavoriteFromApi({ favorite: favorite });
    this._subscriptions.add(
      this._favoriteService
        .getFavoriteObservable()
        .pipe(take(1))
        .subscribe((data: any) => {
          if (data?.favorite) {
            this.isRegisteredFavorite = true;
            this._changeDetectorRef.markForCheck();
          }
        })
    );
    this._subscriptions.add(
      this._favoriteService
        .getFavoriteObservable()
        .pipe(
          filter((res) => !!res.isFailure),
          switchMap(() => {
            return this._apiErrorSvc
              .getApiErrorResponse$()
              .pipe(filter((data): data is ApiErrorResponseModel => !!data));
          })
        )
        .subscribe(({ errors }) => {
          if (!errors?.[0].code) {
            this._errHandlerSvc.setNotRetryableError({
              errorType: ErrorType.SYSTEM,
            });
            return;
          }
          let errorMsgId = '';
          if (errors[0].code === ErrorCodeConstants.ERROR_CODES.EBAZ000437) {
            errorMsgId = ERROR_MSG_ID.E0889;
          }
          if (errorMsgId) {
            // エラーメタイプ
            this._errHandlerSvc.setRetryableError(PageType.PAGE, {
              apiErrorCode: errors[0].code,
              errorMsgId: errorMsgId,
            });
          }
        })
    );
  }

  /**
   * ソート条件モーダル適用ボタン押下処理
   * @param sort ソート種別
   */
  public sortApplyHandle(sort: SortOrder) {
    this.currentSortOrder = sort;
    if (this.outFilterSearchResult) {
      this.outFilterSearchResult = getSortResult(
        this.outFilterSearchResult,
        this.currentSortOrder
      ) as Array<RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner>;
    }
    if (this.returnFilterSearchResult) {
      this.returnFilterSearchResult = getSortResult(
        this.returnFilterSearchResult,
        this.currentSortOrder
      ) as Array<RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner>;
    }
  }

  /**
   * フィルタ条件モーダル適用ボタン押下処理
   * @param filterData フィルタ条件
   */
  public filterApplyHandle(filterData: { condition?: FilterConditionDomestic; isInit?: boolean }) {
    if (filterData.isInit) {
      if (
        this.outSearchResult &&
        this._searchType !== SEARCH_TYPE.OUT_FF_SELECT &&
        this._searchType !== SEARCH_TYPE.RETURN_CALENDAR
      ) {
        this.outFilterCondition = undefined;
      }
      if (this.returnSearchResult) {
        this.returnFilterCondition = undefined;
      }
      return;
    }
    // 以下をすべて満たす場合、メッセージID=”MSG1112”(往路から検索をやりなおす旨)を基に確認ダイアログ(G02-005)をモーダルで表示する。
    if (this.outSearchResult) {
      this.outFilterCondition = filterData.condition;
    }
    if (this.returnSearchResult) {
      this.returnFilterCondition = filterData.condition;
    }
    if (this.searchCondition && filterData.condition) {
      const itineraries = this.searchCondition?.itineraries;
      // メッセージID=”MSG1112”(往路から検索をやりなおす旨)
      if (
        itineraries &&
        itineraries.length === 2 &&
        this.outSelectedAirBound &&
        filterData.condition.outConnectionsChange
      ) {
        this._dialogSvc
          .openDialog({
            message: MSG_CODE.MSG1112,
            type: DialogType.CHOICE,
          })
          .buttonClick$.pipe(filter((dialog) => dialog.clickType === DialogClickType.CONFIRM))
          .subscribe(() => {
            this._filterHandle(filterData.condition!);
          });
      } else {
        this._filterHandle(filterData.condition);
      }
    }
  }

  /**
   * 往路表示
   * @param display boolean
   */
  public changeOutDisplay(display: boolean) {
    this.outFFSummaryDisplay = display;
  }

  /**
   * 復路表示
   * @param display boolean
   */
  public changeReturnDisplay(display: boolean) {
    this.returnFFSummaryDisplay = display;
  }

  /**
   * 選択解除のメッセージ設定、プラン確認画面でstoreに登録したカート情報だけを渡されて旅程選択状態を復元する
   *
   * @param data すべて表示用データ
   * @param type 往路の場合かどうか(OUT:往路/ RETURN:復路)
   */
  public selectedCancel(allViewData: { data: AllAirBounDisplayAndTsType; type: BoundType }) {
    // プランリスト⇒プラン確認⇒空席照会結果場合、復元の処理
    this._cartRecoveryApiHandle(allViewData.data);
    // 選択解除のメッセージ設定
    let selectedAirBound: RoundtripFppItemAirBoundsDataType | any;
    let boundType = allViewData.type;
    if (boundType === BoundType.OUT) {
      selectedAirBound = this.outSelectedAirBound;
    } else {
      selectedAirBound = this.returnSelectedAirBound;
    }
    // 選択解除をtrue(往路の選択が解除される)とする。
    // フライトが選択されており、表示リストにない場合にのみ、選択解除します。
    const isSelectCancel =
      !!selectedAirBound &&
      allViewData.data.allAirBound.every(
        (airBound) => airBound.airBoundId !== selectedAirBound.airBoundId || !airBound.isCanChooseAfterFilter
      );
    if (boundType === BoundType.OUT) {
      this._outSelectCancel = isSelectCancel;
    } else {
      this._returnSelectCancel = isSelectCancel;
    }

    if (isSelectCancel) {
      if (boundType === BoundType.OUT) {
        if (this.searchCondition?.itineraries.length === 2) {
          this.returnFilterSearchResult = undefined;
        }
        this.returnSearchResult = null;
        this._setSelectedInfo(SELECTED_TS_FF_TYPE.OUT_RESET);
      } else {
        this._setSelectedInfo(SELECTED_TS_FF_TYPE.RETURN_RESET);
      }
      this._changeDetectorRef.detectChanges();
    }
    this._setFilterHandleMessage(boundType);
  }

  /**
   * フィルタ処理: filterConditionのBoundConditionに選択した乗継空港が含まれる場合は、APIに再送信
   * @param filterCondition フィルタ条件
   */
  private _filterHandle(filterCondition: FilterConditionDomestic) {
    const outBoundCondition = filterCondition.outBound;
    const returnBoundCondition = filterCondition.returnBound;

    // 往路: フィルター
    if (outBoundCondition) {
      if (filterCondition.outConnectionsChange) {
        this._getFilterSearchForApi(filterCondition);
      } else {
        this._filterBoundData(BoundType.OUT);
      }
    }
    // 復路：フィルター
    if (returnBoundCondition) {
      if (!filterCondition.outConnectionsChange && filterCondition.returnConnectionsChange) {
        this._getFilterSearchForApi(filterCondition);
      } else if (!filterCondition.outConnectionsChange) {
        this._filterBoundData(BoundType.RETURN);
      }
    }
  }

  /**
   * AMCリアルログイン済みでない場合、ログイン(S01-M011)を表示し、処理を中断する
   */
  private _setAmcLoginHandle() {
    const loginStatus = this._aswContextSvc.aswContextData.loginStatus;
    const navigateFunction = () => {
      this._setAppInfo();
      this._loadingSvc.endLoading();
      this._router.navigate([RoutesResRoutes.PLAN_REVIEW]);
      // TODO: TEST PAGE SETTING
      // this._router.navigate(['test-page-R01P040']);
    };
    if (loginStatus !== LoginStatusType.REAL_LOGIN) {
      const diarogPart = this._modalService.defaultIdPart(AmcLoginComponent, AmcLoginHeaderComponent);
      diarogPart.closeBackEnable = true;
      diarogPart.payload = {
        submitEvent: () => {
          this._cardProcessing(navigateFunction);
        },
        skipEvent: () => {
          this._cardProcessing(navigateFunction);
        },
      };
      this._modalService.showSubPageModal(diarogPart);
    } else {
      this._cardProcessing(navigateFunction);
    }
  }

  /**
   * カート作成・更新処理
   */
  private async _cardProcessing(doNavigate: () => void) {
    const pointOfSaleId = this._common.aswContextStoreService.aswContextData.pointOfSaleId;
    this._common.aswContextStoreService.updateAswContext({ pointOfSaleId });
    this._loadingSvc.startLoading(false, LoadingDisplayMode.NORMAL);
    const airBoundIds = [];
    if (this.outSelectedAirBound) {
      airBoundIds.push(this.outSelectedAirBound.airBoundId);
    }
    if (this.returnSelectedAirBound) {
      airBoundIds.push(this.returnSelectedAirBound.airBoundId);
    }
    if (this._currentCartStoreService.CurrentCartData.data?.cartId === '') {
      let fare;
      if (this.searchCondition?.fare.isMixedCabin) {
        fare = {
          isMixedCabin: true,
          mixedCabinClasses: this.searchCondition.fare.mixedCabinClasses,
        };
      } else {
        fare = {
          isMixedCabin: false,
          cabinClass: this.searchCondition?.fare.cabinClass,
          fareOptionType: this.searchCondition?.fare.fareOptionType,
        };
      }
      let param: CreateCartRequest = {
        airBoundIds: airBoundIds,
        searchAirOffer: {
          itineraries: this.searchCondition?.itineraries,
          fare: fare,
          promotion: this.searchCondition?.promotion,
        },
      };
      if (this._passengerOnlyHasChildren) {
        param.searchAirOffer!.hasAccompaniedInAnotherReservation =
          !!this.searchCondition?.hasAccompaniedInAnotherReservation;
      }
      // カート作成APIの実行
      this._createCartStoreService.resetCreateCart();
      this._createCartStoreService.setCreateCartFromApi(param);
      this._subscriptions.add(
        this._createCartStoreService
          .getCreateCart$()
          .pipe(
            filter((res) => !!res.data),
            take(1)
          )
          .subscribe((response) => {
            this._currentCartStoreService.updateCurrentCart({
              data: response.data,
            });
            doNavigate();
          })
      );
    } else {
      // prebook削除APIを実行し、prebookを解除する
      const isSuccess = await this._cancelPrebookService.cancelPrebook(true);
      if (isSuccess) {
        // 選択されたバウンド情報を元にAirOffer更新APIを実行し、カート情報を更新する
        // airoffer更新API実行
        const cartId: string | undefined = this._currentCartStoreService.CurrentCartData.data?.cartId;
        let param: PatchUpdateAirOffersRequest = {
          cartId: cartId ?? '',
          postAirOfferBody: {
            airBoundIds: airBoundIds,
          },
          searchAirOffer: {
            itineraries: this.searchCondition?.itineraries,
            fare: this.searchCondition?.fare,
            promotion: this.searchCondition?.promotion,
          },
        };
        if (this._passengerOnlyHasChildren) {
          param.searchAirOffer!.hasAccompaniedInAnotherReservation =
            !!this.searchCondition?.hasAccompaniedInAnotherReservation;
        }
        this._updateAirOffersStoreService.resetUpdateAirOffers();
        this._updateAirOffersStoreService.setUpdateAirOffersFromApi(param);
        this._subscriptions.add(
          this._updateAirOffersStoreService
            .getUpdateAirOffers$()
            .pipe(
              filter((res) => !!res.data),
              take(1)
            )
            .subscribe((response) => {
              this._currentCartStoreService.updateCurrentCart({
                data: response.data,
              });
              doNavigate();
            })
        );
      }
    }
  }

  /**
   * カート作成・更新処理エラーの処理
   */
  private _cardProcessingErrorHandle() {
    this._subscriptions.add(
      this._store
        .pipe(
          select(selectCreateCartIsFailureStatus),
          filter((isFailure) => isFailure),
          switchMap(() => {
            return this._apiErrorSvc
              .getApiErrorResponse$()
              .pipe(filter((data): data is ApiErrorResponseModel => !!data));
          })
        )
        .subscribe(({ errors }) => {
          if (errors?.[0]?.code) {
            let errorMsgId = '';
            const errMsg = errors[0].code;
            switch (errMsg) {
              case ErrorCodeConstants.ERROR_CODES.EBAZ000627:
                errorMsgId = ERROR_MSG_ID.E1036;
                break;
              case ErrorCodeConstants.ERROR_CODES.EBAZ000628:
                errorMsgId = ERROR_MSG_ID.E1037;
                break;
              case ErrorCodeConstants.ERROR_CODES.EBAZ000629:
                errorMsgId = ERROR_MSG_ID.E1038;
                break;
              case ErrorCodeConstants.ERROR_CODES.EBAA000018:
                errorMsgId = ERROR_MSG_ID.EA043;
                break;
              default:
                break;
            }
            if (errorMsgId) {
              this._loadingSvc.endLoading();
              // エラーメタイプ
              this._errHandlerSvc.setRetryableError(PageType.PAGE, {
                apiErrorCode: errMsg,
                errorMsgId: errorMsgId,
              });
            }
            // プラン確認画面にて保持されたプラン作成失敗判定が存在する場合、エラーメッセージID＝”E1059”にて継続可能なエラー情報を指定し、当画面でエラーメッセージを表示する。
            else if (
              this._deliveryInformationStoreService.deliveryInformationData.planReviewInformation
                ?.isPlanDuplicationFailed
            ) {
              this._loadingSvc.endLoading();
              this._errHandlerSvc.setRetryableError(PageType.PAGE, {
                errorMsgId: 'E1059',
              });
            } else {
              if (errMsg === ErrorCodeConstants.ERROR_CODES.EBAZ000841) {
                this._errHandlerSvc.setNotRetryableError({
                  errorType: ErrorType.BUSINESS_LOGIC,
                  apiErrorCode: errMsg,
                  errorMsgId: 'E1843',
                });
              } else {
                this._errHandlerSvc.setNotRetryableError({
                  errorType: ErrorType.SYSTEM,
                  apiErrorCode: errMsg,
                });
              }
            }
          } else {
            this._errHandlerSvc.setNotRetryableError({
              errorType: ErrorType.SYSTEM,
            });
          }
        })
    );
    this._subscriptions.add(
      this._updateAirOffersStoreService
        .getUpdateAirOffers$()
        .pipe(
          filter((state) => !!(state && state.isFailure)),
          switchMap(() => {
            return this._apiErrorSvc
              .getApiErrorResponse$()
              .pipe(filter((data): data is ApiErrorResponseModel => !!data));
          })
        )
        .subscribe(({ errors }) => {
          if (errors?.[0]?.code) {
            let errorMsgId = '';
            const errMsg = errors[0].code;
            switch (errMsg) {
              case ErrorCodeConstants.ERROR_CODES.EBAZ000627:
                errorMsgId = ERROR_MSG_ID.E1036;
                break;
              case ErrorCodeConstants.ERROR_CODES.EBAZ000628:
                errorMsgId = ERROR_MSG_ID.E1037;
                break;
              case ErrorCodeConstants.ERROR_CODES.EBAZ000629:
                errorMsgId = ERROR_MSG_ID.E1038;
                break;
              case ErrorCodeConstants.ERROR_CODES.EBAA000018:
                errorMsgId = ERROR_MSG_ID.EA043;
                break;
              default:
                break;
            }
            if (errorMsgId) {
              this._loadingSvc.endLoading();
              // エラーメタイプ
              this._errHandlerSvc.setRetryableError(PageType.PAGE, {
                apiErrorCode: errMsg,
                errorMsgId: errorMsgId,
              });
            } else {
              if (errMsg === ErrorCodeConstants.ERROR_CODES.EBAZ000841) {
                this._errHandlerSvc.setNotRetryableError({
                  errorType: ErrorType.BUSINESS_LOGIC,
                  apiErrorCode: errMsg,
                  errorMsgId: 'E1843',
                });
              } else {
                this._errHandlerSvc.setNotRetryableError({
                  errorType: ErrorType.SYSTEM,
                  apiErrorCode: errMsg,
                });
              }
            }
          } else {
            this._errHandlerSvc.setNotRetryableError({
              errorType: ErrorType.SYSTEM,
            });
          }
        })
    );
  }

  /**
   * アプリケーション情報設定
   */
  private _setAppInfo() {
    this._appInfoSvc.setAppInfoByKey(AppInfoType.flightAvailabilityDomesticAppInfo, {
      outSelectedTS: this.outSelectedTS,
      returnSelectedTS: this.returnSelectedTS,
      outSelectedAirBound: this.outSelectedAirBound,
      returnSelectedAirBound: this.returnSelectedAirBound,
      outSearchResultHistroy: this.outSearchResult,
      returnSearchResultHistroy: this.returnSearchResult,
      outAirBoundInfosHistroy: this.outAirBoundInfos,
      returnAirBoundInfosHistroy: this.returnAirBoundInfos,
      searchCondition: this.searchCondition,
      searchTime: this.searchTime,
    });
  }

  /**
   * プラン確認からの遷移時に、旅程選択状態を復元する
   *
   * パターン1: フライト検索⇒空席照会結果⇒プラン確認⇒空席照会結果
   * パターン2: プランリスト⇒プラン確認⇒空席照会結果
   */
  private _histroyDataHandle() {
    const histroyData = this._appInfoSvc.getAppInfoByKey(AppInfoType.flightAvailabilityDomesticAppInfo);
    // 選択中の往路が存在しない場合、パターン1としての処理
    if (histroyData && histroyData.outSelectedTS) {
      this.outSelectedTS = histroyData.outSelectedTS;
      this.returnSelectedTS = histroyData.returnSelectedTS;
      this.outSelectedAirBound = histroyData.outSelectedAirBound;
      this.returnSelectedAirBound = histroyData.returnSelectedAirBound;
      this.returnSearchResult = histroyData.returnSearchResultHistroy;
      this.returnFareFamilies = this.returnSearchResult?.data.airBound.fareFamilies;
      this.outSearchResult = histroyData.outSearchResultHistroy;
      this.outFareFamilies = this.outSearchResult?.data.airBound.fareFamilies;
      this.outAirBoundInfos = histroyData.outAirBoundInfosHistroy;
      this.returnAirBoundInfos = histroyData.returnAirBoundInfosHistroy;
      this.searchCondition = histroyData.searchCondition;
      this.searchTime = histroyData.searchTime;
      // 運賃情報
      this._fareOptionType = this.searchCondition?.fare.fareOptionType;
      // 搭乗者数
      this.travelers = this.searchCondition?.travelers;
      if (this.outSelectedTS) {
        this.outStatus = 'selected';
      }
      if (this.returnSelectedTS) {
        this.returnStatus = 'selected';
      }
      this._searchSucess$.next(true);
      if (this.searchCondition?.itineraries.length === 2) {
        this._setInitialValue(true);
      }
      // 現在日時を取得する/下表をすべて満たす場合、フライト検索(E01-P010)へ遷移する。
      this._airSearchResultHandle(true);
      this._setWithSafeTravelWidget();
    } else {
      // パターン2としての処理
      const _convertData = this._roundtripFlightAvailabilityService.convertData(
        this._currentCartStoreService.CurrentCartData
      );
      const _searchFlight =
        this._roundtripFlightAvailabilityService.createHistoryConditionFromRequestCondition(_convertData);
      this.searchCondition = _convertData.request as FlightSearchCondition;
      this._fareOptionType = this.searchCondition.fare.fareOptionType;
      this.travelers = this.searchCondition.travelers;

      this._cartRecovery = 'out';
      // リクエスト用検索条件からの履歴用検索条件復元処理
      this._searchFlightSvc.updateStore(_searchFlight);
      this._searchFlight = this._searchFlightSvc.getData();
      // 画面表示内容、リスト定義に従い画面を表示する。
      // FF ヘッダのグループ名称結合処理　⇒　common/components/fare-family-headerへの処理を変更する。
      // [変更旅程空席照会API呼び出し処理]:変更旅程空席照会APIを呼び出し、変更旅程空席照会情報を取得する
      this._getAirSearchForApi();
      // 現在日時を取得する/下表をすべて満たす場合、フライト検索(E01-P010)へ遷移する。
      this._airSearchResultHandle();
      // 以下の処理にて、選択したTSおよびFFの情報を更新する
      this._setSelectedInfo(SELECTED_TS_FF_TYPE.INIT);
      // アプリケーション情報.Safe Travelウィジェット機能有効フラグを設定する。
      this._setWithSafeTravelWidget();
    }
  }

  /** パターン2(プランリスト⇒プラン確認⇒空席照会結果)としての処理 */
  private _cartRecoveryApiHandle(data: AllAirBounDisplayAndTsType) {
    if (this._cartRecovery === 'none') {
      return;
    }
    // FF選択ボタン押下処理のパラメーターを取得する
    const getFareFamilyInfo = (airBound: Bound) => {
      const tsInfo = data.allTsDisplay.find((ts) => {
        const boundDetails = (ts as travelSolutionDisplayType).boundDetails;
        return (
          boundDetails.originDepartureDateTime === airBound.originDepartureDateTime &&
          JSON.stringify(
            boundDetails.segments.map((segment) => `${segment.marketingAirlineCode}${segment.marketingFlightNumber}`)
          ) ===
            JSON.stringify(
              airBound.flights?.map((flight) => `${flight.marketingAirlineCode}${flight.marketingFlightNumber}`)
            )
        );
      });
      const fareFamilyInfo: FareFamilyOutputType = {
        selectedAirBoundInfo: (tsInfo as travelSolutionDisplayType).airBoundInfo.find(
          (info) => info.fareFamilyCode === airBound.flights?.[0].fareInfos?.fareFamilyCode
        ) as RoundtripFppItemAirBoundsDataType,
        boundDetails: (tsInfo as travelSolutionDisplayType).boundDetails,
        airBoundInfo: (tsInfo as travelSolutionDisplayType).airBoundInfo,
      };
      return fareFamilyInfo;
    };
    let currentData: PostGetCartResponseData | undefined = this._currentCartStoreService.CurrentCartData.data;
    // プランの有効／無効を判定
    const isPlanValid = !isEmptyObject(currentData?.plan ?? {});

    if (this._cartRecovery === 'out') {
      if (isPlanValid) {
        this.selectOutFareFamily(getFareFamilyInfo(currentData?.plan?.airOffer?.bounds?.[0] as Bound));
      }
      if (this.searchCondition?.itineraries.length === 1) {
        this._cartRecovery = 'none';
      } else if (this.searchCondition?.itineraries.length === 2) {
        this._cartRecovery = 'return';
      }
    } else {
      if (isPlanValid) {
        this.selectReturnFareFamily(getFareFamilyInfo(currentData?.plan?.airOffer?.bounds?.[1] as Bound));
      }
      this._cartRecovery = 'none';
    }
  }

  /**
   * 初期表示時フィルタ往復指定日空席照会情報のフィルター
   * @param filterCondition フィルタ条件
   * @param boundType 往路の場合かどうか(OUT:往路/ RETURN:復路)
   * @param needSearchForApi 往復指定日空席照会API呼び出し要否
   */
  private _filterBoundData(boundType: BoundType) {
    let searchResult: RoundtripFppResponse | null | undefined;
    let fareFamilies: RoundtripFppItemFareFamilyDataTypeInner[] | undefined;
    let filterCondition;

    if (boundType === BoundType.OUT) {
      filterCondition = this.outFilterCondition;
      searchResult = this.outSearchResult;
      fareFamilies = this.outFareFamilies;
    } else {
      filterCondition = this.returnFilterCondition;
      searchResult = this.returnSearchResult;
      fareFamilies = this.returnFareFamilies;
    }
    // 上記以外の場合、フィルタ前往復指定日空席照会情報に当該バウンドの検索結果リストを設定する。
    let beforeFilterData;
    if (searchResult) {
      beforeFilterData = { ...searchResult.data.airBound };
      if (filterCondition?.seatAvailability && fareFamilies) {
        // 以下の処理にて、フィルタ後往復指定日空席照会情報に「選択可能な便」でフィルタしたTravel SolutionとAir Bound情報を追加する。
        beforeFilterData.airBoundGroups = this._filterByAbility(searchResult, fareFamilies);
      }
    }
    // データのフィルター
    if (boundType === BoundType.OUT) {
      this.outFilterSearchResult = getFilterResult(beforeFilterData, filterCondition, boundType);
      this.outFilterSearchResult = getSortResult(
        this.outFilterSearchResult,
        this.currentSortOrder
      ) as Array<RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner>;
    } else {
      this.returnFilterSearchResult = getFilterResult(beforeFilterData, filterCondition, boundType);
      this.returnFilterSearchResult = getSortResult(
        this.returnFilterSearchResult,
        this.currentSortOrder
      ) as Array<RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner>;
    }
    // Next: flight-bound-contによって、trigger selectedCancel イベント
  }

  /**
   * フィルタ時のメッセージ設定
   */
  private _setFilterHandleMessage(boundType: BoundType) {
    /**
     * “MSG1113”(選択が解除された旨)
     * “MSG1114”(往路から選択をやりなおしとなる旨)
     * “MSG1035”(表示可能なTSが0件になった旨)
     */
    let hasMSG1113 = false;
    let hasMSG1114 = false;
    let hasMSG1035 = false;
    const alertMsg = this._alertMsgSvc.getAlertInfomationMessage();
    alertMsg.forEach((v) => {
      if (v.contentId === MSG_CODE.MSG1113) {
        hasMSG1113 = true;
      } else if (v.contentId === MSG_CODE.MSG1114) {
        hasMSG1114 = true;
      } else if (v.contentId === MSG_CODE.MSG1035) {
        hasMSG1035 = true;
      }
    });
    // 往路選択解除=true(往路の選択が解除される)と復路選択解除=true(復路の選択が解除される)
    if (!hasMSG1113 && (this._outSelectCancel || this._returnSelectCancel)) {
      // ”MSG1113”(選択が解除された旨)のメッセージを取得し、インフォメーションメッセージを表示する。
      this._alertMsgSvc.setAlertInfomationMessage({
        contentHtml: MSG_CODE.MSG1113,
        contentId: MSG_CODE.MSG1113,
        isCloseEnable: true,
        alertType: AlertType.INFOMATION,
      });
    } else if (!(this._outSelectCancel || this._returnSelectCancel) && hasMSG1113) {
      // “MSG1113”(選択が解除された旨)のインフォメーションメッセージを削除する。
      this._alertMsgSvc.removeAlertInfomationMessage(MSG_CODE.MSG1113);
    }

    // 下表をすべて満たす場合、動的文言テーブルから”MSG1114”(往路から選択をやりなおしとなる旨)のメッセージを取得し、インフォメーションメッセージを表示する。
    if (!hasMSG1114 && this.searchCondition?.itineraries.length === 2 && this._outSelectCancel) {
      // ”MSG1114”(往路から選択をやりなおしとなる旨)のメッセージを取得し、インフォメーションメッセージを表示する。
      this._alertMsgSvc.setAlertInfomationMessage({
        contentHtml: MSG_CODE.MSG1114,
        contentId: MSG_CODE.MSG1114,
        isCloseEnable: true,
        alertType: AlertType.INFOMATION,
      });
    } else if ((this.searchCondition?.itineraries.length === 1 || !this._outSelectCancel) && hasMSG1114) {
      // ”MSG1114”(往路から選択をやりなおしとなる旨)のインフォメーションメッセージを削除する。
      this._alertMsgSvc.removeAlertInfomationMessage(MSG_CODE.MSG1114);
    }
    // 表示可能TS有無=false(表示可能なTSが0件)の場合、動的文言テーブルから”MSG1035”(表示可能なTSが0件になった旨)のメッセージを取得し、インフォメーションメッセージを表示する。
    const isOutSearchResultEmpty =
      boundType === BoundType.OUT && (!this.outFilterSearchResult || this.outFilterSearchResult.length === 0);
    const isReturnSearchResultEmpty =
      boundType === BoundType.RETURN && (!this.returnFilterSearchResult || this.returnFilterSearchResult.length === 0);
    if ((isOutSearchResultEmpty || isReturnSearchResultEmpty) && !hasMSG1035) {
      this._alertMsgSvc.setAlertInfomationMessage({
        contentHtml: MSG_CODE.MSG1035,
        contentId: MSG_CODE.MSG1035,
        isCloseEnable: true,
        alertType: AlertType.INFOMATION,
      });
    } else if (!(isOutSearchResultEmpty || isReturnSearchResultEmpty) && hasMSG1035) {
      this._alertMsgSvc.removeAlertInfomationMessage(MSG_CODE.MSG1035);
    }
  }

  /**
   * 遷移元画面(R01_P040)の判定を行う
   */
  private _setTransitionInfo() {
    const { functionId, pageId } = this._aswCommonSvc.aswCommonData;
    // fuctionId: 発券後予約変更(機能 ID) / pageId: 変更内容確認(画面 ID)
    if (functionId === TRANSITION_SOURCE_PAGE_INFO.FUNC_ID && pageId === TRANSITION_SOURCE_PAGE_INFO.PAGE_ID) {
      // 遷移元画面はR01_P040です
      this._transitionFormP040 = true;
    } else {
      // 遷移元画面はR01_P040ではない
      this._transitionFormP040 = false;
    }
  }

  /**
   * 往復指定日空席照会(FPP)API応答処理
   * @param selectedBoundId 選択したバウンドID
   */
  private _getAirSearchForApi(selectedBoundId?: string) {
    // 初期ない場合
    if (this._processingTime > 0) {
      this._loadingSvc.startLoading(false);
    }
    // パラメータの指定（以下の項目を基に往復指定日空席照会(FPP)APIを呼び出し、往復指定日空席照会情報を取得する）
    let searchCondition: FlightSearchCondition = this.searchCondition as FlightSearchCondition;
    let getAirCalendarOnly = false;
    if (this._searchType === SEARCH_TYPE.RETURN_CALENDAR || this._searchType === SEARCH_TYPE.OUT_CALENDAR) {
      searchCondition = this._tempSearchCondition as FlightSearchCondition;
    }
    let requestParam: RoundtripFppRequest | any = {
      itineraries: searchCondition?.itineraries,
      fare: searchCondition.fare as RoundtripFppRequestFare,
      searchPreferences: {
        getAirCalendarOnly: getAirCalendarOnly,
      },
    };
    if (searchCondition.travelers) {
      requestParam = {
        ...requestParam,
        travelers: {
          ADT: searchCondition.travelers.ADT,
          CHD: searchCondition.travelers.CHD,
          INF: searchCondition.travelers.INF,
        },
      };
      if (this._passengerOnlyHasChildren) {
        requestParam.travelers.hasAccompaniedInAnotherReservation = searchCondition.hasAccompaniedInAnotherReservation;
      }
    }
    if (selectedBoundId) {
      requestParam = {
        ...requestParam,
        selectedBoundId: selectedBoundId,
      };
    }
    if (searchCondition.promotion) {
      requestParam = {
        ...requestParam,
        promotion: searchCondition.promotion,
      };
    }
    // ユーザ共通.操作オフィスコード
    const pointOfSaleId = this._aswContextSvc.aswContextData.pointOfSaleId;
    // 空港現地時間取得処理(G03-519)で取得した値をアプリケーション情報.空港現地時間に設定する
    let date: Date = this._systemDateSvc.getAirportLocalDate(pointOfSaleId);
    // 検索時刻
    this.searchTime = dateFormat(date, DATE_TIME_DEFAULT_FORMAT);
    const call = this._roundtripApiSvc.roundtripFppPost(requestParam);
    this._store.dispatch(setRoundtripFppFromApi({ call }));
  }

  /**
   * 往復指定日空席照会(FPP)API応答のエーラ処理
   */
  private _searchApiErrorHandle() {
    this._subscriptions.add(
      this._store
        .pipe(
          select(selectRoundtripFppIsFailureStatus),
          filter((isFailure) => isFailure),
          switchMap(() => {
            return this._apiErrorSvc
              .getApiErrorResponse$()
              .pipe(filter((data): data is ApiErrorResponseModel => !!data));
          })
        )
        .subscribe(({ errors }) => {
          const errCode = errors?.[0].code;
          if (errCode === ErrorCodeConstants.ERROR_CODES.EBAZ000063) {
            if (this._processingTime === 0) {
              if (
                this._deliveryInformationStoreService.deliveryInformationData.planReviewInformation
                  ?.isPlanDuplicationFailed
              ) {
                this._deliverySearchInformationStoreService.updateDeliverySearchInformation({
                  errorInfo: {
                    errorMsgId: 'E1060',
                  },
                });
              } else {
                this._deliverySearchInformationStoreService.updateDeliverySearchInformation({
                  errorInfo: {
                    errorMsgId: ERROR_MSG_ID.E0228,
                    apiErrorCode: errCode,
                  },
                });
              }
              // フライト検索(R01-P010)へ遷移する
              this._router.navigate([RoutesResRoutes.FLIGHT_SEARCH]);
            } else {
              this._loadingSvc.endLoading();
              let errMsg = ERROR_MSG_ID.E0228;
              this._errHandlerSvc.setRetryableError(PageType.PAGE, {
                errorMsgId: errMsg,
                apiErrorCode: errCode,
              });
              this.returnStatus = 'unSelected';
              this.outStatus = 'unSelected';
              this._changeDetectorRef.markForCheck();
            }
            //　"EBAZ000174"(過去日で再検索)の場合
          } else if (errCode === ErrorCodeConstants.ERROR_CODES.EBAZ000174) {
            // フライト検索画面に継続可能エラーを設定
            this._deliverySearchInformationStoreService.updateDeliverySearchInformation({
              errorInfo: {
                errorMsgId: 'E1059',
                apiErrorCode: ErrorCodeConstants.ERROR_CODES.EBAZ000174,
              },
            });
            // フライト検索画面に遷移後、空席照会処理を終了する。
            this._router.navigate([RoutesResRoutes.FLIGHT_SEARCH]);
          } else if (errCode) {
            this._errHandlerSvc.setNotRetryableError({
              errorType: ErrorType.SYSTEM,
              apiErrorCode: errCode,
            });
          } else {
            this._errHandlerSvc.setNotRetryableError({
              errorType: ErrorType.SYSTEM,
            });
          }
        })
    );
  }

  /**
   * 空席照会結果判定
   *
   * @param isHistoryBack 遷移元画面(R01_P040)の場合、Storeに値がある
   */
  private _airSearchResultHandle(isHistoryBack?: boolean) {
    let searchAirResult$ = this._searchAirResult$;
    if (isHistoryBack) {
      searchAirResult$ = this._searchAirResult$.pipe(skip(1));
    }
    this._subscriptions.add(
      searchAirResult$.subscribe((result) => {
        if (this._processingTime > 0 && this._searchType === SEARCH_TYPE.FILTER_SEARCH) {
          this._loadingSvc.endLoading();
        }
        this._searchResult = result;
        if (this._searchType === SEARCH_TYPE.RETURN_CALENDAR || this._searchType === SEARCH_TYPE.OUT_CALENDAR) {
          this.searchCondition = this._tempSearchCondition;
        }
        if (
          result?.data?.airCalendar?.isAllSoldOut &&
          result?.data.airBound.isAllSoldOut &&
          result?.data.airBound.airBoundGroups.length === 0 &&
          !this._isOnlyCallApiSearch
        ) {
          this._deliverySearchInformationStoreService.updateDeliverySearchInformation({
            errorInfo: {
              errorMsgId: ERROR_MSG_ID.E0228,
              apiErrorCode: result.warnings[0]?.code,
            },
          });
          // フライト検索(R01-P010)へ遷移する
          this._router.navigate([RoutesResRoutes.FLIGHT_SEARCH]);
        } else {
          if (this._searchType === SEARCH_TYPE.FILTER_SEARCH) {
            const itineraries = this.searchCondition?.itineraries;
            if (itineraries && itineraries?.[0]?.connection?.locationCode) {
              this.outSearchResult = result;
              this.outFareFamilies = result?.data.airBound.fareFamilies;
              this._filterBoundData(BoundType.OUT);
            } else if (itineraries && itineraries.length > 1) {
              this.returnSearchResult = result;
              this.returnFareFamilies = result?.data.airBound.fareFamilies;
              this._filterBoundData(BoundType.RETURN);
            }
            this._changeDetectorRef.markForCheck();
          } else {
            if (this._searchType === SEARCH_TYPE.OUT_FF_SELECT || this._searchType === SEARCH_TYPE.RETURN_CALENDAR) {
              this.returnSearchResult = this._searchResult;
              this.returnFareFamilies = this._searchResult?.data.airBound.fareFamilies;
            } else {
              this.outSearchResult = this._searchResult;
              this.outFareFamilies = this._searchResult?.data.airBound.fareFamilies;
            }
            this._searchSucess$.next(true);
          }
        }
      })
    );
  }

  /**
   * 画面値を設定する
   * @param histroyReturnInit 戻るによる遷移かどうか
   */
  private _setInitialValue(histroyReturnInit?: boolean) {
    const itineraries = this.searchCondition?.itineraries;
    const isFFSelectReturnSearch = this._searchType === SEARCH_TYPE.OUT_FF_SELECT;
    const isReturnCalendar = this._searchType === SEARCH_TYPE.RETURN_CALENDAR;
    if (itineraries && itineraries.length > 0) {
      // 以下の処理にて、アプリケーション情報.7日間カレンダー往路出発日およびアプリケーション情報.7日間カレンダー復路出発日を設定する。
      if (isFFSelectReturnSearch || isReturnCalendar || histroyReturnInit) {
        // 初期表示時フィルタ変更旅程空席照会情報を作成する。
        this._setFilterSearchResult(BoundType.RETURN);
        isReturnCalendar ? this._setSelectedInfo(SELECTED_TS_FF_TYPE.RETURN_RESET) : null;
        const returnItinerary = itineraries?.[itineraries.length - 1];
        // アプリケーション情報.変更旅程空席照会情報.バウンドID=アプリケーション情報.検索条件.区間毎の情報[0].バウンドIDとする。
        this.returnItinerary = returnItinerary;
        this.returnDepartureDate = returnItinerary.departureDate;
        // 出発地
        this.returnDepartureLocation = returnItinerary.originLocationCode;
        // 到着地
        this.returnArrivalLocation = returnItinerary.destinationLocationCode;
        // 乗継地
        this.returnTransferAirport = returnItinerary?.connection?.locationCode.split('+');
        // アプリケーション情報.7日間空席照会結果=変更旅程空席照会API応答.airCalendarとする。
        this.returnAirCalendar = this.returnSearchResult?.data.airCalendar;
        this.returnFareFamilies = this.returnSearchResult?.data.airBound.fareFamilies;
        if (!this._isOnlyCallApiSearch) {
          this.returnFFSummaryDisplay = true;
        }
        // 往復旅程両方の変更かつ往路のFFの選択を変更した場合
        if (isFFSelectReturnSearch && this.returnSelectedAirBound) {
          this._setSelectedInfo(SELECTED_TS_FF_TYPE.RETURN_RESET);
          // MSG1114のClearなど
          this._alertAreaHandle('add');
        }
      } else {
        // 初期表示時フィルタ変更旅程空席照会情報を作成する。
        this._setFilterSearchResult(BoundType.OUT);
        // アプリケーション情報.変更旅程空席照会情報.バウンドID=アプリケーション情報.検索条件.区間毎の情報[0].バウンドIDとする。
        this.outItinerary = itineraries?.[0];
        this.outDepartureDate = itineraries?.[0].departureDate;
        // 出発地
        this.outDepartureLocation = itineraries?.[0].originLocationCode;
        // 到着地
        this.outArrivalLocation = itineraries?.[0].destinationLocationCode;
        // 乗継地
        this.outTransferAirport = itineraries?.[0]?.connection?.locationCode.split('+');
        this.outAirCalendar = this.outSearchResult?.data.airCalendar;
        this.outFareFamilies = this.outSearchResult?.data.airBound.fareFamilies;
        itineraries.length === 2 ? (this.returnDepartureDate = itineraries?.[1].departureDate) : null;
        // アプリケーション情報.FF概要表示切替=true(FF概要を表示する)とする。
        if (!this._isOnlyCallApiSearch) {
          this.outFFSummaryDisplay = true;
        }
      }
    }
  }

  /**
   * アプリケーション情報.フィルタ条件.バウンド情報.乗継空港の件数が1件以上の場合、
   * 検索条件に乗継空港および乗継時間を指定して、変更旅程空席照会情報を取得する。
   * @param filterCondition フィルタ条件
   */
  private _getFilterSearchForApi(filterCondition: FilterConditionDomestic) {
    if (this.searchCondition && this.searchCondition.itineraries) {
      let itineraries = this.searchCondition.itineraries;
      if (filterCondition.outBound) {
        const isOutExistConnection =
          filterCondition.outBound?.connections?.some((connection) => connection.value) || false;
        if (isOutExistConnection) {
          let itinerariesArray: any = [];
          let connection: RoundtripFppRequestItinerariesInnerConnection = {
            locationCode: filterCondition.outBound.connections
              .filter((connection) => connection.value)
              .map((connection) => {
                return connection.locationCode;
              })[0],
          };
          if (filterCondition.outBound.connectionTime !== 0) {
            connection.time = filterCondition.outBound.connectionTime;
          }
          itinerariesArray.push({
            ...itineraries[0],
            connection: connection,
          });
          if (itineraries.length === 2) {
            itinerariesArray.push(itineraries[1]);
          }

          this.searchCondition = {
            ...this.searchCondition,
            itineraries: itinerariesArray,
          };
        }
      }
      const isReturnExistConnection =
        filterCondition.returnBound?.connections?.some((connection) => connection.value) || false;
      if (isReturnExistConnection) {
        if (filterCondition.returnBound) {
          let connection: RoundtripFppRequestItinerariesInnerConnection = {
            locationCode: filterCondition.returnBound.connections
              .filter((connection) => connection.value)
              .map((connection) => {
                return connection.locationCode;
              })[0],
          };
          if (filterCondition.returnBound.connectionTime !== 0) {
            connection.time = filterCondition.returnBound.connectionTime;
          }
          this.searchCondition = {
            ...this.searchCondition,
            itineraries: [
              itineraries[0],
              {
                ...itineraries[1],
                connection: connection,
              },
            ],
          };
        }
      }
      let selectedBoundId = this.outSelectedAirBound?.airBoundId;
      if (this.searchCondition.itineraries[0]?.connection?.locationCode) {
        selectedBoundId = '';
      }
      this._searchType = SEARCH_TYPE.FILTER_SEARCH;
      this._getAirSearchForApi(selectedBoundId);
    }
  }

  /**
   * 選択可能な便・フィルタ・ソートの処理
   * @param boundType 往路の場合かどうか(OUT:往路/ RETURN:復路)
   */
  private _setFilterSearchResult(boundType: BoundType) {
    // 以下の処理にて、アプリケーション情報.変更旅程空席照会情報を設定する。
    // 選択可能な便について ⇒ sub-components/result-function-internationalへの処理を予定する。
    if (boundType === BoundType.OUT) {
      if (this.outSearchResult && this.outFareFamilies) {
        this.outFilterSearchResult = this._initialFilter(this.outSearchResult, this.outFareFamilies, boundType);
        this.outFilterSearchResult = getSortResult(
          this.outFilterSearchResult,
          this.currentSortOrder
        ) as Array<RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner>;
      }
    } else {
      if (this.returnSearchResult && this.returnFareFamilies) {
        this.returnFilterSearchResult = this._initialFilter(
          this.returnSearchResult,
          this.returnFareFamilies,
          boundType
        );
        this.returnFilterSearchResult = getSortResult(
          this.returnFilterSearchResult,
          this.currentSortOrder
        ) as Array<RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner>;
      }
    }
  }

  /**
   * 初期フィルター
   * @param searchResult 検索結果
   * @param fareFamilies FF情報
   * @param boundType 往路の場合かどうか(OUT:往路/ RETURN:復路)
   * @returns
   */
  private _initialFilter(
    searchResult: RoundtripFppResponse,
    fareFamilies: Array<RoundtripFppItemFareFamilyDataTypeInner>,
    boundType: BoundType
  ): Array<RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner> {
    // アプリケーション情報.初期表示時選択可能な便＝false(選択可能な便でフィルタしない)とする。
    if (boundType === BoundType.OUT) {
      this.outSeatAvailability = false;
    } else {
      this.returnSeatAvailability = false;
    }
    // アプリケーション情報.往復指定日空席照会情報に往復指定日空席照会(FPP)API応答.airBoundを設定する。
    return searchResult?.data.airBound.airBoundGroups;
  }

  /**
   * フィルタ後変更旅程空席照会情報に「選択可能な便」でフィルタ
   * @param searchResult 検索結果
   * @param fareFamilies FF情報
   * @returns
   */
  private _filterByAbility(
    searchResult: RoundtripFppResponse,
    fareFamilies: Array<RoundtripFppItemFareFamilyDataTypeInner>
  ) {
    const airBoundExchangeGroups = searchResult?.data.airBound.airBoundGroups;
    // 初期表示時フィルタ往復指定日空席照会情報を作成する。
    const filterSearchResult = [] as Array<RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner>;
    const fareFamilyCodeArr = fareFamilies?.map((fareFamily) => fareFamily.fareFamilyCode);
    if (
      airBoundExchangeGroups &&
      fareFamilyCodeArr &&
      airBoundExchangeGroups.length > 0 &&
      fareFamilyCodeArr.length > 0
    ) {
      airBoundExchangeGroups.forEach((airBoundExchangeGroup) => {
        // 選択可能な便について、初期値をfalse(選択可能な便ではない)とする。
        let isSelectAble = false;
        for (let fareFamilyCode in fareFamilyCodeArr) {
          // 下表をすべて満たす往復指定日空席照会(FPP)API応答.airBound.airBoundGroup.<Fare Family Code>が存在する場合、選択可能な便=true(選択可能な便)を設定する。
          // 往復指定日空席照会(FPP)API応答.airBound.airBoundGroup.<Fare Family Code>.quota≠0
          // 往復指定日空席照会(FPP)API応答.airBound.airBoundGroup.<Fare Family Code>.unavailableReason≠"passedLastBookingDate"(第1バウンドの第1セグメントが最終発券期限を過ぎている)
          const airBoundInfo = airBoundExchangeGroup[fareFamilyCodeArr[fareFamilyCode]];
          if (
            airBoundInfo &&
            airBoundInfo.unavailableReason !== 'passedLastBookingDate' &&
            (airBoundInfo.isWaitlisted === true ||
              airBoundInfo.quotaType === 'enough' ||
              airBoundInfo.quotaType === 'available' ||
              (airBoundInfo.quotaType === 'few' && airBoundInfo.quota !== 0))
          ) {
            isSelectAble = true;
            break;
          }
        }
        // 選択可能な便=true(選択可能な便)の場合、初期表示時フィルタ変更旅程空席照会情報に変更旅程空席照会API応答.airBound.airBoundExchangeGroupを追加する。
        if (isSelectAble) {
          filterSearchResult.push(airBoundExchangeGroup);
        }
      });
    }
    return filterSearchResult;
  }

  /**
   * 選択した往路Air Bound情報/Travel Solution情報/Air Bound ID を設定する
   * @param type 選択したTSおよびFFの情報の処理種類
   */
  private _setSelectedInfo(type: SELECTED_TS_FF_TYPE) {
    if (type === SELECTED_TS_FF_TYPE.INIT) {
      // アプリケーション情報.選択した往路Air Bound情報を空にする
      this.outSelectedAirBound = null;
      // アプリケーション情報.選択した往路Travel Solution情報
      this.outSelectedTS = null;

      // アプリケーション情報.選択した復路Air Bound情報を空にする
      this.returnSelectedAirBound = null;
      // アプリケーション情報.選択した復路Travel Solution情報を空にする
      this.returnSelectedTS = null;

      this.returnStatus = 'unSelected';
      this.outStatus = 'unSelected';
    } else if (type === SELECTED_TS_FF_TYPE.RETURN) {
      this.returnSelectedAirBound = this._returnFareFamilyInfo?.selectedAirBoundInfo;
      this.returnSelectedTS = this._returnFareFamilyInfo?.boundDetails;
    } else if (type === SELECTED_TS_FF_TYPE.RETURN_RESET) {
      // アプリケーション情報.選択した復路Air Bound情報を空にする
      this.returnSelectedAirBound = null;
      // アプリケーション情報.選択した復路Travel Solution情報を空にする
      this.returnSelectedTS = null;
      this.returnStatus = 'unSelected';
    } else if (type === SELECTED_TS_FF_TYPE.OUT_RESET) {
      this.outSelectedTS = null;
      this.outSelectedAirBound = null;
      this.outStatus = 'unSelected';
    } else {
      this.outSelectedAirBound = this._outFareFamilyInfo?.selectedAirBoundInfo;
      this.outSelectedTS = this._outFareFamilyInfo?.boundDetails;
    }
  }

  /**
   * 検索結果0件ワーニング処理
   */
  private _errorCheckHandle() {
    // エラーのチェックなしの場合
    if (this._searchType === SEARCH_TYPE.OUT_FF_SELECT) {
      return;
    }
    //  エラーメッセージID＝”E0066”の場合、
    //    変更旅程空席照会API応答.airBound.isAllSoldOut=true(空席照会の残席無)
    //    変更旅程空席照会API応答.airCalendar.isAllSoldOut=false(7日日間空席照会の残席有)
    //  エラーメッセージID＝”E0064”の場合、
    //    変更旅程空席照会API応答.airBound.isAllSoldOut=true(空席照会の残席無)
    //    変更旅程空席照会API応答.airCalendar.isAllSoldOut=true(7日日間空席照会の残席無)
    //    変更旅程空席照会API応答.airCalendar.airBoundExchangeGroupsの件数が1件以上
    let searchResult;
    if (this._searchType === SEARCH_TYPE.OUT_FF_SELECT) {
      searchResult = this.returnSearchResult;
    } else {
      searchResult = this.outSearchResult;
    }
    // W0837”(指定条件では検索結果がないため運賃を変更して検索した旨)のワーニングメッセージを表示する。
    if (searchResult?.data.isResearched) {
      const alertMessageData: AlertMessageItem = {
        contentHtml: WARNING_ID.W0837,
        contentId: WARNING_ID.W0837,
        isCloseEnable: true,
        alertType: AlertType.WARNING,
        errorMessageId: WARNING_ID.W0837,
      };
      this._alertMsgSvc.setAlertWarningMessage(alertMessageData);
    }
    let msgId = '';
    if (searchResult?.data.airBound.isAllSoldOut && !searchResult?.data.airCalendar.isAllSoldOut) {
      msgId = WARNING_ID.W0887;
      // 検索指定乗継空港の件数が1件以上
      if (
        (this._searchType === SEARCH_TYPE.RETURN_CALENDAR && this.returnItinerary?.connection?.locationCode) ||
        (this._searchType === SEARCH_TYPE.OUT_CALENDAR && this.outItinerary?.connection?.locationCode)
      ) {
        msgId = WARNING_ID.W0890;
      }
    } else if (
      searchResult?.data.airBound.isAllSoldOut &&
      searchResult?.data.airCalendar.isAllSoldOut &&
      searchResult?.data.airBound.airBoundGroups &&
      searchResult?.data.airBound.airBoundGroups.length > 0
    ) {
      msgId = WARNING_ID.W0888;
    }
    if (msgId) {
      const alertMsgs = this._alertMsgSvc.getAlertWarningMessage();
      const hasMsg = alertMsgs.some((v) => v.errorMessageId === msgId);
      if (!hasMsg) {
        this._alertMsgSvc.setAlertWarningMessage({
          contentHtml: msgId,
          contentId: msgId,
          isCloseEnable: true,
          alertType: AlertType.WARNING,
          errorMessageId: msgId,
        });
      }
    } else {
      this._alertMsgSvc.removeAlertWarningMessage(msgId);
    }
  }

  /**
   * “MSG1114”(往路から選択をやりなおしとなる旨))のインフォメーションメッセージを削除する。
   * “MSG1114”の設定
   *
   * @params 操作種類(add: 追加, delete: 削除)
   */
  private _alertAreaHandle(opreationType: 'add' | 'delete') {
    const alertMsg = this._alertMsgSvc.getAlertInfomationMessage();
    let hasMsg = alertMsg.map((v) => v.contentId).includes(MSG_CODE.MSG1114);
    // 往復旅程両方の変更かつ往路のFFの選択を変更した場合、以下の処理を行う
    // 選択中復路組み合わせ不可=true(選択中の復路が組み合わせ不可)の場合
    if (opreationType === 'delete' && hasMsg) {
      this._alertMsgSvc.removeAlertInfomationMessage(MSG_CODE.MSG1114);
    } else if (opreationType === 'add' && !hasMsg) {
      this._alertMsgSvc.setAlertInfomationMessage({
        contentHtml: MSG_CODE.MSG1114,
        contentId: MSG_CODE.MSG1114,
        isCloseEnable: true,
        alertType: AlertType.INFOMATION,
      });
    }
  }
  /**
   * FFを選択した場合、MSG1113(選択が解除された旨)のインフォメーションメッセージを削除する。
   */
  private _selectCancelMessageHandle() {
    const alertMsg = this._alertMsgSvc.getAlertInfomationMessage();
    const hasMsg = alertMsg.map((v) => v.contentId).includes(MSG_CODE.MSG1113);
    if (hasMsg) {
      this._alertMsgSvc.removeAlertInfomationMessage(MSG_CODE.MSG1113);
    }
  }

  /**
   * 往復両方の変更で復路のバウンドリストが表示されていて、往路の日付を変更した場合、往路から再選択となるので復路のバウンドリストは非表示となる。
   * 対象項目
   * 出発日ボタン
   * キャビンクラスモーダル適用ボタン
   * 運賃オプションモーダル適用ボタン
   */
  private _roundTripClearReturn() {
    if (this.searchCondition?.itineraries.length === 2) {
      this.returnSearchResult = null;
      this._setSelectedInfo(SELECTED_TS_FF_TYPE.INIT);
    }
  }

  /**
   * [変更旅程空席照会API呼び出し処理]を行う、共通のパラメータ変更必要がない場合判断
   *
   * OUT_FF_SELECT
   * RETURN_CALENDAR
   * FILTER_SEARCH
   *
   * @returns 共通のパラメータ変更必要がない場合判断
   */
  private get _isOnlyCallApiSearch(): boolean {
    return (
      this._searchType === SEARCH_TYPE.RETURN_CALENDAR ||
      this._searchType === SEARCH_TYPE.FILTER_SEARCH ||
      this._searchType === SEARCH_TYPE.OUT_FF_SELECT
    );
  }

  /**
   * アプリケーション情報.Safe Travelウィジェット機能有効フラグを作成する。
   */
  private _setWithSafeTravelWidget() {
    // アプリケーション情報.Safe Travelウィジェット機能有効フラグにプロパティ(カテゴリ：serviceRequest)からキー："couch.safeTravelWidget"(Safe Travelウィジェット機能有効フラグ)で取得した値を設定する。
    this.safeTravelWidget = this._masterDataService.getSafeTravelWidget();
  }

  /**
   * 履歴についての処理
   */
  private _histroyRegisterHandle() {
    // 以下の項目を基に履歴登録APIを呼び出す。呼び出し時、エラーハンドリング回避フラグ(commonIgnoreErrorFlg)としてtureを指定する
    if (this._aswContextSvc.aswContextData.loginStatus !== LoginStatusType.NOT_LOGIN) {
      // 旅程タイプ roundtrip：往復旅程の場合、isRoundTripType=true
      const isRoundTripType = this._searchFlight.tripType === TripType.ROUND_TRIP;
      let history: HistoryPostRequestHistory = {
        tripType: isRoundTripType
          ? HistoryPostRequestHistory.TripTypeEnum.Roundtrip
          : HistoryPostRequestHistory.TripTypeEnum.OnewayOrMulticity,
        fare: this._getHistoryFare(),
        travelers: {
          ADT: this._searchFlight.traveler.adt,
          B15: this._searchFlight.traveler.b15,
          CHD: this._searchFlight.traveler.chd,
          INF: this._searchFlight.traveler.inf,
        },
        promotionCode: this._searchFlight.promotion.code,
      };
      // 履歴用検索条件.別予約同行者有無
      if (
        this._searchFlight.traveler.adt === 0 &&
        this._searchFlight.traveler.b15 === 0 &&
        this._searchFlight.traveler.chd !== 0
      ) {
        history.hasAccompaniedInAnotherReservation = !!this._searchFlight.hasAccompaniedInAnotherReservation;
      }
      if (isRoundTripType && this._searchFlight.roundTrip) {
        // 履歴用検索条件.往復旅程区間が存在する場合、roundTripの作成
        let roundTrip: HistoryPostRequestHistoryRoundtrip = {
          originLocationCode: this._searchFlight.roundTrip.departureOriginLocationCode as string,
          destinationLocationCode: this._searchFlight.roundTrip.departureDestinationLocationCode as string,
          departureDate: dateFormat(this._searchFlight.roundTrip.departureDate, DATE_FORMAT),
          departureTimeWindowFrom: getFormatHourTimeForMinutes(this._searchFlight.roundTrip.departureTimeWindowFrom),
          departureTimeWindowTo: getFormatHourTimeForMinutes(this._searchFlight.roundTrip.departureTimeWindowTo),
          returnDate: dateFormat(this._searchFlight.roundTrip.returnDate, DATE_FORMAT),
          returnTimeWindowFrom: getFormatHourTimeForMinutes(this._searchFlight.roundTrip.returnTimeWindowFrom),
          returnTimeWindowTo: getFormatHourTimeForMinutes(this._searchFlight.roundTrip.returnTimeWindowTo),
        };
        const departureConnection = this._searchFlight.roundTrip.departureConnection;
        if (departureConnection && departureConnection.connectionLocationCode) {
          roundTrip = { ...roundTrip, departureConnectionLocationCode: departureConnection.connectionLocationCode };
        }
        if (departureConnection && (departureConnection.connectionTime || departureConnection.connectionTime === 0)) {
          roundTrip = { ...roundTrip, departureConnectionTime: departureConnection.connectionTime };
        }
        const returnConnection = this._searchFlight.roundTrip.returnConnection;
        if (returnConnection && returnConnection.connectionLocationCode) {
          roundTrip = { ...roundTrip, returnConnectionLocationCode: returnConnection.connectionLocationCode };
        }
        if (returnConnection && (returnConnection.connectionTime || returnConnection.connectionTime === 0)) {
          roundTrip = { ...roundTrip, returnConnectionTime: returnConnection.connectionTime };
        }
        history = { ...history, roundtrip: roundTrip };
      } else {
        // 履歴用検索条件.往復旅程区間が存在しない場合、boundsの作成
        const bounds: Array<HistoryPostRequestHistoryBoundsInner> = this._searchFlight.onewayOrMultiCity.map((item) => {
          return {
            departureDate: dateFormat(item.departureDate, DATE_FORMAT),
            originLocationCode: item.originLocationCode as string,
            destinationLocationCode: item.destinationLocationCode as string,
            departureTimeWindowFrom: getFormatHourTimeForMinutes(item.departureTimeWindowFrom),
            departureTimeWindowTo: getFormatHourTimeForMinutes(item.departureTimeWindowTo),
          };
        });
        history = { ...history, bounds: bounds };
      }
      // フライト検索履歴登録リクエストを作成する
      const historyObject: HistoryPostRequest | any = {
        history: history,
        commonIgnoreErrorFlg: true,
      };
      this._historySvc.setHistoryFromApi(historyObject);
    }
    this._subscriptions.add(
      this._historySvc
        .getHistoryObservable()
        .pipe(
          filter((res) => !!res.isFailure),
          switchMap(() => {
            return this._apiErrorSvc
              .getApiErrorResponse$()
              .pipe(filter((data): data is ApiErrorResponseModel => !!data));
          })
        )
        .subscribe(({ errors }) => {
          if (errors?.[0]?.code) {
            // 履歴登録API応答.errors[0].code≠""(空欄)の場合、運用監視ログの出力を行う。
            this._loggerSvc.operationConfirmLog('API0003', { 0: errors?.[0].code });
          }
        })
    );
  }

  /**
   * 搭乗者がCHD(小児)のみ
   */
  private get _passengerOnlyHasChildren(): boolean {
    return this.searchCondition?.travelers.ADT === 0 && this.searchCondition.travelers.CHD !== 0;
  }

  /**
   * MSG1655を判定する
   */
  private _returnIsContainedHandicappedFare(searchAttribute: RoundtripFppResponse) {
    const airBoundExchangeGroups = searchAttribute.data.airBound.airBoundGroups;
    const fareFamilyCodeArr = searchAttribute.data.airBound.fareFamilies?.map(
      (fareFamily) => fareFamily.fareFamilyCode
    );
    let containedHandicappedFare = false;
    for (let airIndex = 0; airIndex < airBoundExchangeGroups?.length; airIndex++) {
      for (let ffIndex = 0; ffIndex < fareFamilyCodeArr?.length; ffIndex++) {
        const airBoundInfo = airBoundExchangeGroups[airIndex]?.[fareFamilyCodeArr[ffIndex]];
        if (airBoundInfo && airBoundInfo.isHandicappedFare) {
          containedHandicappedFare = true;
        }
      }
    }
    return containedHandicappedFare;
  }

  /**
   * 履歴の運賃情報の作成
   * @returns 運賃情報
   */
  private _getHistoryFare() {
    // fareの作成
    let fare: any;
    if (!this._searchFlight.fare.isMixedCabin) {
      fare = {
        isMixedCabin: this._searchFlight.fare.isMixedCabin,
        cabinClass: this._searchFlight.fare.cabinClass,
      };
      if (this._fareOptionType) {
        fare = { ...fare, fareOptionType: this._fareOptionType };
      }
    } else {
      fare = {
        isMixedCabin: this._searchFlight.fare.isMixedCabin,
        mixedCabinClasses: {
          departureCabinClass: this._searchFlight.fare.cabinClass,
          returnCabinClass: this._searchFlight.fare.returnCabinClass,
        },
      };
    }
    return fare;
  }

  /**
   * 画面情報JSON（Tealium連携用基本情報JSON設定）
   */
  private _tealiumPageOutputHandle() {
    /** 旅程タイプ */
    let tripType = '';
    /** 往復旅程情報 */
    let roundtrip;
    /** 片道または複雑旅程バウンドリスト */
    let bounds: Array<any> = [];
    /** 運賃情報 */
    let fare = this._getHistoryFare();
    if (this._searchFlight.tripType === TripType.ROUND_TRIP) {
      tripType = 'roundtrip';
      roundtrip = {
        /** 往路出発日 */
        departureDate: dateFormat(this._searchFlight?.roundTrip.departureDate, DATE_FORMAT),
        /** 復路出発日 */
        returnDate: dateFormat(this._searchFlight?.roundTrip.returnDate, DATE_FORMAT),
        /** 出発空港コード */
        originLocationCode: this._searchFlight?.roundTrip.departureOriginLocationCode ?? '',
        /** 到着空港コード */
        destinationLocationCode: this._searchFlight?.roundTrip.departureDestinationLocationCode ?? '',
      };
    } else if (this._searchFlight.tripType === TripType.ONEWAY_OR_MULTI_CITY) {
      tripType = this.searchCondition?.itineraries.length === 1 ? 'oneway' : 'openJaw';
    }

    // 履歴用検索条件.旅程種別=”onewayOrMulticity”
    if (tripType) {
      // 履歴用検索条件.複雑旅程区間数分、繰り返し
      this._searchFlight?.onewayOrMultiCity.forEach((onewayOrMulticity) => {
        const onewayOrMulticityBound: any = {
          /** 出発日 */
          departureDate: dateFormat(onewayOrMulticity.departureDate, DATE_FORMAT),
          /** 出発空港コード */
          originLocationCode: onewayOrMulticity.originLocationCode ?? '',
          /** 到着空港コード */
          destinationLocationCode: onewayOrMulticity.destinationLocationCode ?? '',
        };
        bounds.push(onewayOrMulticityBound);
      });
    }

    // 画面情報JSON（Tealium連携用基本情報JSON設定）
    this._tealiumSvc.setTealiumPageOutput({
      tripType: tripType,
      roundtrip: roundtrip,
      bounds: bounds,
      fare: fare,
    });
  }

  /**
   * criteo連携情報の作成
   */
  private _createCriteoAlignmentInfo() {
    // criteo連携情報 : 区間
    let criteoSegmentCode = '';
    if (this._searchFlight.tripType === TripType.ROUND_TRIP) {
      criteoSegmentCode = `${this._searchFlight.roundTrip.departureOriginLocationCode}_${this._searchFlight.roundTrip.returnOriginLocationCode}`;
    } else if (this._searchFlight.tripType === TripType.ONEWAY_OR_MULTI_CITY) {
      criteoSegmentCode = `${this._searchFlight.onewayOrMultiCity[0].originLocationCode}_${this._searchFlight.onewayOrMultiCity[0].destinationLocationCode}`;
    }
    // criteo連携情報 : 端末種別
    let criteoDeviceType = '';
    if (
      this._common.aswContextStoreService.aswContextData.deviceType === 'PC' ||
      this._common.aswContextStoreService.aswContextData.deviceType === 'TAB'
    ) {
      criteoDeviceType = 'd';
    } else if (this._common.aswContextStoreService.aswContextData.deviceType === 'SP') {
      criteoDeviceType = 'm';
    }
    // criteo連携情報 : 往路出発日
    let criteoDepartureDate = '';
    if (this._searchFlight.tripType === TripType.ROUND_TRIP) {
      criteoDepartureDate = dateFormat(this._searchFlight.roundTrip.departureDate, 'yyyyMMdd');
    } else if (this._searchFlight.tripType === TripType.ONEWAY_OR_MULTI_CITY) {
      criteoDepartureDate = dateFormat(this._searchFlight.onewayOrMultiCity[0].departureDate, 'yyyyMMdd');
    }
    // criteo連携情報 : 復路出発日
    let criteoArrivalDate = '';
    if (this._searchFlight.tripType === TripType.ROUND_TRIP) {
      criteoArrivalDate = dateFormat(this._searchFlight.roundTrip.returnDate, 'yyyyMMdd');
    } else if (this._searchFlight.tripType === TripType.ONEWAY_OR_MULTI_CITY) {
      criteoArrivalDate = this._searchFlight.onewayOrMultiCity[1]
        ? dateFormat(this._searchFlight.onewayOrMultiCity[1].departureDate, 'yyyyMMdd')
        : '';
    }
    // criteo連携情報 : CONNECTION_KIND
    let criteoConnectionKind = '';
    this._aswMasterSvc
      .getAswMasterByKey$(MasterStoreKey.OFFICE_ALL)
      .pipe(take(1))
      .subscribe((_officeAll) => {
        const officePointOfSale = _officeAll.find(
          (office: M_OFFICE) => office.office_code === this._common.aswContextStoreService.aswContextData.pointOfSaleId
        );
        if (officePointOfSale) {
          criteoConnectionKind = officePointOfSale.connection_kind ?? '';
        }
      });
    // criteo連携情報 : 言語コード
    const criteoLanguageCode = this._common.aswContextStoreService.aswContextData.lang;
    // criteo連携情報 : 片道旅程/往復旅程フラグ
    let criteoSearchMode = 'ROUND_TRIP';
    if (
      this._searchFlight.tripType === TripType.ONEWAY_OR_MULTI_CITY &&
      this._searchFlight.onewayOrMultiCity.length === 1
    ) {
      criteoSearchMode = 'ONE_WAY';
    }
    // criteo連携情報 : 大人人数
    const criteoAdultCount = String((this._searchFlight.traveler.adt ?? 0) + (this._searchFlight.traveler.b15 ?? 0));
    // criteo連携情報 : 小児人数
    const criteoChildCount = `${this._searchFlight.traveler.chd ?? 0}`;
    // criteo連携情報 : 幼児人数
    const criteoInfantCount = `${this._searchFlight.traveler.inf ?? 0}`;
    // criteo連携情報 : 運賃種別
    let criteoBoardingClass = '';
    const outCabinClass = this._searchFlight.fare.cabinClass;
    const returnCabinClass = this._searchFlight.fare.returnCabinClass;
    if (this._searchFlight.fare.isMixedCabin && outCabinClass && returnCabinClass) {
      const cabinLevelMap: any = { first: 3, business: 2, ecoPremium: 1, eco: 0 };
      criteoBoardingClass =
        cabinLevelMap[outCabinClass] >= cabinLevelMap[returnCabinClass] ? outCabinClass : returnCabinClass;
    } else {
      criteoBoardingClass = this._searchFlight.fare.cabinClass ?? '';
    }
    // criteo連携情報 : 運賃オプション
    const criteoBoardingClassOption = this._searchFlight.fare.isMixedCabin
      ? ''
      : this._searchFlight.fare.fareOptionType;
    // criteo連携情報 : 運賃総額
    let criteoTotalAmount = '';
    // criteo連携情報 : トランザクションID
    let criteoTransactionId = '';
    // criteo連携情報 :  顧客区分
    let criteoCustomerType = this._common.isNotLogin() ? '0' : '1';

    this.criteoAlignmentInfo = {
      /** 区間 */
      criteoSegmentCode: criteoSegmentCode,
      /** 端末種別 */
      criteoDeviceType: criteoDeviceType,
      /** 往路出発日 */
      criteoDepartureDate: criteoDepartureDate,
      /** 復路出発日 */
      criteoArrivalDate: criteoArrivalDate,
      /** CONNECTION_KIND */
      criteoConnectionKind: criteoConnectionKind,
      /** 言語コード */
      criteoLanguageCode: criteoLanguageCode,
      /** 片道旅程/往復旅程フラグ */
      criteoSearchMode: criteoSearchMode,
      /** 大人人数 */
      criteoAdultCount: criteoAdultCount,
      /** 小児人数 */
      criteoChildCount: criteoChildCount,
      /** 幼児人数 */
      criteoInfantCount: criteoInfantCount,
      /** 運賃種別 */
      criteoBoardingClass: criteoBoardingClass,
      /** 運賃オプション */
      criteoBoardingClassOption: criteoBoardingClassOption,
      /** 運賃総額 */
      criteoTotalAmount: criteoTotalAmount,
      /** トランザクションID */
      criteoTransactionId: criteoTransactionId,
      /** 顧客区分 */
      criteoCustomerType: criteoCustomerType,
    };
  }
}
