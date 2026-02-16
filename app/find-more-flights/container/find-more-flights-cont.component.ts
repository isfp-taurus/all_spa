import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { SupportPageComponent } from '@lib/components/support-class';
import {
  AlertMessageStoreService,
  AswMasterService,
  CommonLibService,
  PageInitService,
  SystemDateService,
  TealiumService,
} from '@lib/services';
import { FindMoreFlightsResponseData } from 'src/sdk-search';
import { PresenterProps } from '@app/find-more-flights/presenter/find-more-flights-pres.state';
import { FindMoreFlightsRequest } from 'src/sdk-search/model/findMoreFlightsRequest';
import { ComplexFmfFareFamilyAirOffersInner } from 'src/sdk-search/model/complexFmfFareFamilyAirOffersInner';
import { ComplexFmfFareFamily } from 'src/sdk-search/model/complexFmfFareFamily';
import { FilterConditionModalService } from '@common/components/shopping/filter-condition/filter-condition-modal.service';
import { AlertMessageItem, AlertType, ErrorType, RetryableError } from '@lib/interfaces';
import {
  ComplexFlightAvailabilityPageStoreService,
  CurrentCartStoreService,
  SearchFlightConditionForRequestService,
  SearchFlightStoreService,
} from '@common/services';
import { Router } from '@angular/router';
import { RoutesResRoutes } from '@conf/routes.config';
import { apiEventAll, deepCopy, getOwdRequestItinerariesFromCart } from '@common/helper';
import {
  BoundFilterItem,
  CodeFilterItem,
  FareTypeItem,
  FilterConditionData,
  FilterItem,
  ReservationFunctionIdType,
  ReservationPageIdType,
} from '@common/interfaces';
import { FindMoreFlightsService } from './find-more-flights.service';
import { StaticMsgPipe } from '@lib/pipes';
import { Title } from '@angular/platform-browser';
import { SortConditionData, SortCondition, SortConditionModalService } from '@common/components';
import { FindMoreFlightsStoreService } from '@common/services/store/find-more-flights/find-more-flights-store/find-more-flights-store.service';
import {
  ComplexFlightAvailabilityState,
  SearchFlightConditionForRequest,
  SearchFlightConditionForRequestState,
  SearchFlightState,
} from '@common/store';
import { SearchFlightConditionForRequestStoreService } from '@common/services/shopping/search-flight-condition-for-request-store/search-flight-condition-for-request-store.service';
import { FindMoreFlightsPostStoreService } from '@common/services/api-store/sdk-reservation/find-more-flights-store/find-more-flights-store.service';
import { BehaviorSubject } from 'rxjs';
import { DynamicParams, LOAD_FMF_CACHE } from './find-more-flights-cont.state';
import { DeliverySearchInformationStoreService } from '@common/services/store/delivery-search-information-store/delivery-search-information-store.service';
import { RoundtripFlightAvailabilityInternationalPresService } from '@app/roundtrip-flight-availability-international/presenter/roundtrip-flight-availability-international-pres.service';
import { RoundtripFlightAvailabilityInternationalContService } from '@app/roundtrip-flight-availability-international/container/roundtrip-flight-availability-international-cont.service';
import { AppConstants } from '@conf/app.constants';
import { ErrorCodeConstants } from '@conf/app.constants';

@Component({
  selector: 'asw-find-more-flights-cont',
  templateUrl: './find-more-flights-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SearchFlightStoreService],
})
export class FindMoreFlightsContComponent extends SupportPageComponent implements OnDestroy {
  public appConstants = AppConstants;
  /** 画面ID : P034_Find more Flights */
  pageId: string = ReservationPageIdType.FIND_MORE_FLIGHTS;
  /** 機能ID : R01 新規予約 Prime booking */
  functionId: string = ReservationFunctionIdType.PRIME_BOOKING;
  /** システム日時 */
  public systemDate: Date;
  /** 選択中のソート条件・初期ソート条件 */
  public sortConditionData: SortConditionData = {
    selectedSortCondition: SortCondition.CPD_RANK,
  };
  /** Presenterに渡す画面描画用データ */
  public props: PresenterProps = {};
  /** Find more Flights用APIの戻り値 */
  public findMoreFlightsResponse: FindMoreFlightsResponseData | undefined;
  /** 対象バウンドインデックス */
  private _currentBoundIndex: number = 0;
  /** 複雑空席照会結果画面(R01-P033)で保持されたリクエストパラメータを選択バウンド情報 */
  private _searchCondition?: FindMoreFlightsRequest;
  /** バウンド数 */
  public moreFlightsBoundReference?: number;
  /** ローディング動画判定 */
  public isLoading = true;
  /** 検索条件 */
  private _searchRequestData?: SearchFlightConditionForRequestState;
  /** 遷移元画面 */
  private _previousId: string = '';
  /** フィルタ条件モーダルリセット用値 */
  private _originalFilterConditionData?: FilterConditionData;
  /** 動的文言 */
  public dynamicSubject = new BehaviorSubject<DynamicParams>({
    findMoreFlightsReply: {
      data: {},
    },
    pageContext: { isDomesticTrip: false },
  });

  reload(): void {
    throw new Error('Method not implemented.');
  }
  destroy(): void {
    this.deleteSubscription('FindMoreFlightsContComponent-sortConditionModal');
    this.deleteSubscription('FindMoreFlightsContComponent-filterConditionModal');
  }

  constructor(
    private _common: CommonLibService,
    private _pageInitService: PageInitService,
    private _sortConditionModalService: SortConditionModalService,
    private _filterConditionModalService: FilterConditionModalService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemDateService: SystemDateService,
    private _router: Router,
    private _alertMessageStoreService: AlertMessageStoreService,
    private _aswMasterSvc: AswMasterService,
    private _findMoreFlightService: FindMoreFlightsService,
    private _staticMsgPipe: StaticMsgPipe,
    private _title: Title,
    private _findMoreFlightsStoreService: FindMoreFlightsStoreService,
    private _searchFlightConditionForRequestStoreService: SearchFlightConditionForRequestStoreService,
    private _findMoreFlightsPostStoreService: FindMoreFlightsPostStoreService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _complexFlightAvailabilityPageStoreService: ComplexFlightAvailabilityPageStoreService,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _tealiumSvc: TealiumService,
    private _deliverySearchInformationStoreService: DeliverySearchInformationStoreService,
    private _roundtripFlightAvailabilityInternationalPresService: RoundtripFlightAvailabilityInternationalPresService,
    private _roundtripFlightAvailabilityInternationalContService: RoundtripFlightAvailabilityInternationalContService,
    private _searchFlightConditionForRequestService: SearchFlightConditionForRequestService
  ) {
    super(_common, _pageInitService);
    // 初期化開始
    this._pageInitService.startInit();
    this.autoInitEnd = false;
    // タブバーに画面タイトルを設定する
    this.forkJoinService(
      'Find-More-Flights-Title-Set',
      [this._staticMsgPipe.get('label.flightList'), this._staticMsgPipe.get('label.aswPageTitle')],
      ([str1, str2]) => {
        this.deleteSubscription('Find-More-Flights-Title-Set');
        this._title.setTitle(str1 + str2);
      }
    );
    // 遷移元画面として画面情報.機能ID+画面情報.画面IDを保持する。
    const previousId =
      this._common.aswCommonStoreService.getFunctionId() + this._common.aswCommonStoreService.getPageId();
    this._findMoreFlightsStoreService.updateFindMoreFlights({ previousId });
    this._previousId = previousId;
    // 画面情報に以下の内容を設定する。
    this._common.aswCommonStoreService.updateAswCommon({
      functionId: this.functionId,
      pageId: this.pageId,
      subFunctionId: '',
      subPageId: '',
      isEnabledLogin: false,
    });

    // システム日付取得(G03-519)のシステム日時取得処理を呼び出し、取得した値を、空席照会日時として保持する。
    this.systemDate = this._systemDateService.getAirportLocalDate(
      this._common.aswContextStoreService.aswContextData.pointOfSaleId
    );
  }

  init(): void {
    /** 動的文言Observable生成 */
    this.params = this.dynamicSubject.asObservable();
    // 複雑空席照会結果画面(R01-P033)で保持されたリクエストパラメータを選択バウンド情報、
    // フライト検索画面(R01-P010)で保持されたリクエストの検索条件を、検索条件とする。
    this._searchCondition = this._findMoreFlightsStoreService.FindMoreFlightsData.searchCondition;
    const requestData = this._searchFlightConditionForRequestStoreService.getData();
    if (requestData.request.itineraries.length !== 0 && this._previousId !== 'R01P040') {
      this._searchRequestData = requestData;
    } else {
      // 遷移元画面=”R01P040”の場合、以下の処理を行う
      // フライト検索画面(R01-P010)で保持された空席照会リクエスト用検索条件が存在しない場合、
      // 往復空席照会結果(国際)画面(R01-P030)の［カート情報からの検索条件復元処理］を行い、
      // 返却された値をフライト検索画面(R01-P010)で保持された空席照会リクエスト用検索条件に設定する。
      this._searchRequestData = this._roundtripFlightAvailabilityInternationalContService.convertData(
        this._currentCartStoreService.CurrentCartData
      );
      this._searchFlightConditionForRequestService.updateStore(this._searchRequestData);
    }
    // フライト検索画面(R01-P010)で保持された履歴登録用の検索条件が存在しない場合、
    // 往復空席照会結果(国際)画面(R01-P030)の［リクエスト用検索条件からの履歴用検索条件復元処理］を行い、
    // 返却された値をフライト検索画面(R01-P010)で保持された履歴登録用の検索条件に設定する。
    const requestHistoryCondition = this._searchFlightStoreService.getData();
    if (requestHistoryCondition.onewayOrMultiCity[0].originLocationCode === null && this._previousId === 'R01P040') {
      const createHistoryData =
        this._roundtripFlightAvailabilityInternationalContService.createHistoryConditionFromRequestCondition(
          this._searchRequestData
        );
      this._searchFlightStoreService.updateStore(createHistoryData);
    }

    this.moreFlightsBoundReference = this._searchCondition?.moreFlightsBoundReference;
    // 選択バウンド情報.moreFlightsBoundReference-1を対象バウンドインデックスとして保持する。
    this._currentBoundIndex = this._searchCondition ? this._searchCondition.moreFlightsBoundReference - 1 : 0;

    // 選択バウンド情報を基にFind more Flights APIを呼び出す
    this.subscribeService('FmF GetAirportNameList', this._aswMasterSvc.load(LOAD_FMF_CACHE, true), ([data]) => {
      if ([data]) {
        this.getFindMoreFlightsPost();
      }
    });

    // ソート条件モーダルが値を返した時の処理を定義
    this.subscribeService(
      'FindMoreFlightsContComponent-sortConditionModal',
      this._sortConditionModalService.asObservableSubject(),
      (data) => {
        this.sortConditionData = data;
        this.updateTravelSolutionsBySortCondition(data.selectedSortCondition);
      }
    );

    // フィルタ条件モーダルが値を返した時の処理を定義
    this.subscribeService(
      'FindMoreFlightsContComponent-filterConditionModal',
      this._filterConditionModalService.asObservableSubject(),
      ({ data }) => {
        if (data && this.findMoreFlightsResponse) {
          this._alertMessageStoreService.removeAllAlertWarningMessage();
          this.handlerFilterConfirm(data, this.findMoreFlightsResponse);
          this.updateTravelSolutionsBySortCondition(this.sortConditionData.selectedSortCondition);
        }
      }
    );
  }

  // Find more Flights用API実行
  private getFindMoreFlightsPost() {
    // APIエラー情報を事前にクリア
    this._common.apiErrorResponseService.clearApiErrorResponse();
    // Find more Flights API呼び出し、受信後処理
    apiEventAll(
      () => {
        this._findMoreFlightsPostStoreService.setFindMoreFlightsPostFromApi(this._searchCondition);
      },
      this._findMoreFlightsPostStoreService.getFindMoreFlightsPost$(),
      (response) => {
        // Find more Flightsレスポンス.warnings[0].code=”WBAZ000198”(返却対象となる結果なし)の場合、
        // エラーメッセージID=”E1061”にて継続可能なエラー情報を指定し、遷移元画面に遷移後、初期表示処理を終了する。
        const warningCode = response?.warnings && response?.warnings[0]?.code;
        if (warningCode === ErrorCodeConstants.ERROR_CODES.WBAZ000198) {
          // 初期化終了処理
          this._pageInitService.endInit(this.params);
          const errorInfo: RetryableError = {
            errorMsgId: 'E1061',
            apiErrorCode: warningCode,
          };
          this._deliverySearchInformationStoreService.updateDeliverySearchInformation({ errorInfo });
          if (this._previousId === 'R01P033') {
            this._router.navigate([RoutesResRoutes.COMPLEX_FLIGHT_AVAILABILITY]);
          } else this._router.navigate([RoutesResRoutes.PLAN_REVIEW]);
          return;
        }
        this.findMoreFlightsResponse = deepCopy(response.data ?? {});
        // 正常終了
        this.initializeProps();
        this.updateTravelSolutionsBySortCondition(this.sortConditionData.selectedSortCondition);
        // 初期化終了処理
        this._pageInitService.endInit(this.params);
      },
      () => {
        this._pageInitService.endInit(this.params);
        // エラーが発生したFind more Flightsレスポンスが通知された場合、
        // 継続不可能エラータイプ＝”system”(システムエラー)にて継続不可能なエラー情報を指定し、初期表示処理を終了する。
        this._findMoreFlightService.setErrorInfo(ErrorType.SYSTEM, '', this._common.apiError?.['errors']?.[0]?.code);
      }
    );
  }

  // 画面描画用のデータに整理する
  private initializeProps() {
    // 既存のエラーメッセージを削除
    this._alertMessageStoreService.removeAllAlertWarningMessage();
    const response = this.findMoreFlightsResponse;
    if (!response) return;

    // 当画面で利用する画面表示用airOffersリストとして、
    // Find more Flightsレスポンス.data.fareFamilies[0].airOffersを複製した情報を保持する。
    const fareFamiliesList: Array<ComplexFmfFareFamily> = response.fareFamilies ?? [];
    const airOffersList: Array<ComplexFmfFareFamilyAirOffersInner> = fareFamiliesList[0]?.airOffers ?? [];
    const length: number = airOffersList.length ?? 0;

    // 以下の処理にて、全ての旅程が利用不可であるかチェックを行う。
    // 全旅程利用不可を初期値trueとする。
    let fullItineraryImpossibleFlg: boolean = true;

    if (length > 0) {
      // 画面表示用airOffersリストについて、当該airOffer.isUnavailable=falseとなるもののみ抽出し、
      // 抽出結果が1件以上ある場合、全旅程利用不可にfalseを設定する。
      fullItineraryImpossibleFlg = !airOffersList.some((airOffer) => !airOffer.isUnselectable);

      // 全旅程利用不可=trueの場合、”W0337”(選択可能なTSが存在しない旨)のワーニングメッセージを表示する。
      if (fullItineraryImpossibleFlg) {
        const warningInfoAvailabilityCheck: AlertMessageItem = {
          contentHtml: 'm_error_message-W0337',
          isCloseEnable: true,
          alertType: AlertType.WARNING,
          errorMessageId: 'W0337',
        };
        this._alertMessageStoreService.setAlertWarningMessage(warningInfoAvailabilityCheck);
      }
    }

    // Find more Flightsレスポンス.data.fareFamilies[0].isPromotionAppliedの値を保持。存在しない場合、falseとする。
    const isPromotionApplied = this.findMoreFlightsResponse?.fareFamilies![0].isPromotionApplied || false;

    // フィルタ条件入力情報を作成する
    // フィルター条件モーダル画面描画用データ
    // フィルター条件モーダルデータ start
    // フィルター条件モーダル画面描画用データの生成
    // バウンド毎のフィルタ項目の生成
    const boundFilterItemList: BoundFilterItem[] = [];

    // 運航キャリアリスト作成開始
    // 空の運航キャリアリストを作成する。
    const operationAirlinesList: Array<FareTypeItem> = [];

    const nhGroupOperatingList = this._aswMasterSvc
      .getMPropertyByKey('application', 'airlines.nhGroupOperating')
      ?.split('|');

    response.airOffersSummary?.operatingAirlines?.forEach((operatingAirline) => {
      // Find more Flightsレスポンス.data.airOffersSummary.operatingAirlinesに、
      // 当該operatingAirlines.airlineCodeが、NHグループ運航キャリアリストに含まれるoperatingAirlinesが1つでも存在する場合、
      // 運航キャリアリストに、airlineCode=”NH”、airlineName=値なしとなる運航キャリアを追加する。
      if (nhGroupOperatingList?.some((item) => item === operatingAirline.airlineCode)) {
        const airlineFilterItem: FareTypeItem = {
          isEnabled: false,
          value: this.appConstants.CARRIER.TWO_LETTER,
          name: '',
        };
        operationAirlinesList.push(airlineFilterItem);
      } else {
        // Find more Flightsレスポンス.data.airOffersSummary.operatingAirlinesについて、
        // 当該operatingAirlines.airlineCodeがNHグループ運航キャリアリストに含まれない場合、
        // 当該operatingAirlinesを運航キャリアリストに追加する。
        const airlineFilterItem: FareTypeItem = {
          isEnabled: false,
          value: operatingAirline.airlineCode ?? '',
          name: operatingAirline.airlineName ?? '',
        };
        operationAirlinesList.push(airlineFilterItem);
      }
    });
    // 運航キャリアリスト作成終わり
    const itinerary = this._searchRequestData?.request?.itineraries?.[this._currentBoundIndex];
    const boundFilterItem: BoundFilterItem = {
      // 乗継回数
      stops:
        response.airOffersSummary?.numbersOfConnections?.map((numbersOfConnection) => {
          const filterItem: FilterItem<number> = {
            item: numbersOfConnection,
            isEnabled: false,
          };
          return filterItem;
        }) ?? [],
      // 総所要時間
      durationRange: {
        limitMinValue: (response.airOffersSummary?.minDuration ?? 0) / 60,
        limitMaxValue: (response.airOffersSummary?.maxDuration ?? 0) / 60,
        selectedMinValue: (response.airOffersSummary?.minDuration ?? 0) / 60,
        selectedMaxValue: (response.airOffersSummary?.maxDuration ?? 0) / 60,
      },
      // 乗継空港リスト
      transitAirportList: [],
      // 運航キャリア
      operationAirlineList: operationAirlinesList,
      // 機種
      aircraftList:
        response.airOffersSummary?.aircraftCodes?.map((aircraft) => {
          const filterItem: FilterItem<string> = {
            item: aircraft,
            isEnabled: false,
          };
          return filterItem;
        }) ?? [],
      // 出発時間帯
      departureTimeRange: {
        limitMinValue: this._findMoreFlightService.getDateMinutes(itinerary?.departureTimeWindowFrom),
        limitMaxValue: this._findMoreFlightService.getDateMinutes(itinerary?.departureTimeWindowTo, 1439),
        selectedMinValue: this._findMoreFlightService.getDateMinutes(itinerary?.departureTimeWindowFrom),
        selectedMaxValue: this._findMoreFlightService.getDateMinutes(itinerary?.departureTimeWindowTo, 1439),
      },
      // 到着時間帯
      arrivalTimeRange: {
        limitMinValue: 0,
        limitMaxValue: 1439,
        selectedMinValue: 0,
        selectedMaxValue: 1439,
      },
      transitTimeRange: {},
      // Wi-Fiサービス
      equipment: { item: 'wifi', isEnabled: false },
    };
    boundFilterItemList.push(boundFilterItem);

    let filterConditionData: FilterConditionData = {
      isAvailable: false,
      fareType: [],
      budgetRange: {
        limitMinValue: response.airOffersSummary?.minPriceDifference?.value ?? undefined,
        limitMaxValue: response.airOffersSummary?.maxPriceDifference?.value ?? undefined,
        selectedMinValue: response.airOffersSummary?.minPriceDifference?.value ?? undefined,
        selectedMaxValue: response.airOffersSummary?.maxPriceDifference?.value ?? undefined,
      },
      boundFilterItemList,
      budgetLabel: 'label.revenue',
    };

    // フィルタ条件モーダルリセット用値を設置
    if (!this._originalFilterConditionData) {
      this._originalFilterConditionData = deepCopy({
        ...filterConditionData,
        isAvailable: !fullItineraryImpossibleFlg,
      });
    }

    // 画面表示情報を作成する
    // 画面に表示するデータをpropsに入れる
    const searchDateTimeString = this._findMoreFlightService.convertDateToFormatDateString(this.systemDate);
    this.props = {
      // 空席照会日時
      searchDateTimeString,
      // 対象バウンドインデックス
      currentBoundIndex: this._currentBoundIndex,
      // AirOffer情報
      airOffersList,
      // ソート条件
      sortConditionData: this.sortConditionData,
      // フィルター条件
      filterConditionData,
      searchRequestData: this._searchRequestData,
      FareFamily: response.fareFamilies?.[0],
      originalFilterConditionData: this._originalFilterConditionData,
    };

    // 全旅程利用不可=falseの場合、フィルタ条件モーダルの「選択可能な便」のcheckedにtrueを設定し、
    if (!fullItineraryImpossibleFlg) {
      filterConditionData = {
        ...filterConditionData,
        isAvailable: true,
      };
      // 後述のフィルタ条件モーダル適用ボタン押下時の処理を行う。
      this.handlerFilterConfirm(filterConditionData, response);
    }

    this.isLoading = false;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * フィルタ条件モーダル
   * 適用ボタン押下時処理
   * @param filterConditionData
   * @param findMoreFlightsResponse
   */
  private handlerFilterConfirm(
    filterConditionData: FilterConditionData,
    findMoreFlightsResponse: FindMoreFlightsResponseData
  ): void {
    this._alertMessageStoreService.removeAllAlertInfomationMessage();
    const fareFamiliesList: Array<ComplexFmfFareFamily> = findMoreFlightsResponse.fareFamilies ?? [];
    let airOffersList: Array<ComplexFmfFareFamilyAirOffersInner> = fareFamiliesList[0]?.airOffers ?? [];
    // フィルタ条件入力情報.選択可能な便=trueの場合、画面表示用airOffersリストから、
    // 画面表示用airOffersリスト.isUnselectable=falseのデータのみを抽出し、抽出した結果で画面表示用airOffersリストを上書きする。
    if (filterConditionData.isAvailable) {
      airOffersList = airOffersList.filter((airOffer) => airOffer.isUnselectable === false);
    }
    // 画面表示用airOffersリストの要素数≠0、
    // かつFind more Flightsレスポンス.airOffersSummary.minPriceDifference.valueが存在する、
    // かつフィルタ条件入力情報.金額.最小値≠Find more Flightsレスポンス.airOffersSummary.minPriceDifference.value、
    // またはフィルタ条件入力情報.金額.最大値≠Find more Flightsレスポンス.airOffersSummary.maxPriceDifference.valueの場合、
    // 画面表示airOffersリストから、
    // フィルタ条件入力情報.金額.現在選択中の最小値
    // ≦画面表示用airOffersリスト.prices.previousSelectionPriceDifference.priceDifference.value
    // ≦フィルタ条件入力情報.金額.現在選択中の最大値となるデータのみ抽出し、抽出した結果で画面表示用airOffersリストを上書きする。
    if (
      (airOffersList.length > 0 &&
        findMoreFlightsResponse.airOffersSummary?.minPriceDifference?.value &&
        filterConditionData?.budgetRange?.selectedMinValue !==
          findMoreFlightsResponse?.airOffersSummary?.minPriceDifference?.value) ||
      filterConditionData?.budgetRange?.selectedMaxValue !==
        findMoreFlightsResponse?.airOffersSummary?.maxPriceDifference?.value
    ) {
      airOffersList = airOffersList.filter((airOffer) => {
        const priceDifference = airOffer?.prices?.previousSelectionPriceDifference?.priceDifference?.value ?? 0;
        return (
          priceDifference <= (Number(filterConditionData?.budgetRange?.selectedMaxValue) || 0) &&
          priceDifference >= (Number(filterConditionData?.budgetRange?.selectedMinValue) || 0)
        );
      });
    }

    // 画面表示用airOffersリストの要素数≠0、かつフィルタ条件入力情報.プロモーション適用TSのみ=trueの場合、
    // 画面表示用airOffersリスト.prices.totalPrice.discountが存在するデータのみを抽出し、
    // 抽出した結果で画面表示用airOffersリストを上書きする。
    if (airOffersList.length > 0 && filterConditionData.isOnlyPromotionCodeAvailable) {
      airOffersList = airOffersList.filter((airOffer) => !!airOffer?.prices?.totalPrice?.discount);
    }

    // 以下の処理にて、各フィルタ条件入力情報の選択されている値のリストを作成する。
    // 選択乗継回数リストとして、空のリストを作成する。
    const stopsList: Array<FilterItem<number>> = [];
    // フィルタ条件入力情報.乗継回数を件数分繰り返し、当該乗継回数.チェック状態=trueの場合、
    // 選択乗継回数リストに当該乗継回数.回数を追加する。
    filterConditionData?.boundFilterItemList?.[0]?.stops?.forEach((stop) => {
      if (stop && stop.isEnabled) {
        stopsList.push(stop);
      }
    });

    // NHグループ運航フィルタ要否を、初期値falseとして用意する。
    let nhGroupOperationFilter: boolean = false;
    // 選択他社運航キャリアリストとして、空のリストを作成する。
    const operationAirlineList: Array<FareTypeItem> = [];

    // フィルタ条件入力情報.運航キャリアリストを件数分繰り返し、当該運航キャリア.チェック状態=trueの場合、以下の処理を行う。
    filterConditionData?.boundFilterItemList?.[0]?.operationAirlineList?.forEach((operationAirline) => {
      // 当該運航キャリア.運航キャリアコード=”NH”の場合、NHグループ運航フィルタ要否=trueとする。
      if (operationAirline.isEnabled) {
        if (operationAirline.value === this.appConstants.CARRIER.TWO_LETTER) {
          nhGroupOperationFilter = true;
        } else {
          // 上記以外の場合、選択他社運航キャリアリストに当該運航キャリアを追加する。
          operationAirlineList.push(operationAirline);
        }
      }
    });

    // 選択機種リストとして、空のリストを作成する。
    const aircraftList: Array<FilterItem<string>> = [];
    // フィルタ条件入力情報.機種リストを件数分繰り返し、当該機種.チェック状態=trueの場合、選択機種リストに当該機種.項目名を追加する。
    filterConditionData?.boundFilterItemList?.[0]?.aircraftList?.forEach((aircraft) => {
      if (aircraft.isEnabled) {
        aircraftList.push(aircraft);
      }
    });

    // 画面表示用airOffersリストについて、以下の表示要否判定処理にて、
    // 処理結果=trueとなるデータのみを抽出し、抽出した結果で画面表示用airOffersリストを上書きする。
    // [以下、表示要否判定処理]

    const filteredAirOffers: Array<ComplexFmfFareFamilyAirOffersInner> = [];

    airOffersList.forEach((airOffer) => {
      // 当該airOffers.bounds[対象バウンドインデックス]を当該boundsとする。
      const currentBounds = airOffer.bounds?.[this._currentBoundIndex];

      // 選択乗継回数リストが空でなく、選択乗継回数リストに当該bounds.numberOfConnectionsが含まれない場合、
      // 処理結果をfalseとして当処理を終了する。
      if (stopsList.length > 0 && !stopsList.some((stop) => stop.item === currentBounds?.numberOfConnections)) {
        return;
      }
      // フィルタ条件入力情報.総所要時間.現在選択中の最小値≠フィルタ条件入力情報.総所要時間.最小値、
      // またはフィルタ条件入力情報.総所要時間.現在選択中の最大値≠フィルタ条件入力情報.総所要時間.最大値の場合、
      // 以下の処理を行う。
      const boundFilterItem = filterConditionData?.boundFilterItemList?.[0];
      if (
        boundFilterItem?.durationRange?.limitMinValue !== boundFilterItem?.durationRange?.selectedMinValue ||
        boundFilterItem?.durationRange?.limitMaxValue !== boundFilterItem?.durationRange?.selectedMaxValue
      ) {
        // 当該bounds.duration<フィルタ条件入力情報.総所要時間.現在選択中の最小値、
        // または当該bounds.duration>フィルタ条件入力情報.総所要時間.現在選択中の最大値となる場合、
        // 処理結果をfalseとして当処理を終了する。
        const duration = (currentBounds?.duration ?? 0) / 60;
        const selectedMinValue = Number(boundFilterItem?.durationRange?.selectedMinValue) || 0;
        const selectedMaxValue = Number(boundFilterItem?.durationRange?.selectedMaxValue) || 0;

        if (duration < selectedMinValue || duration > selectedMaxValue) {
          return;
        }
      }

      // 出発時間帯フィルタ有無を初期値falseとし、以下のいずれかの条件に合致する場合、trueとする。
      // 出発時間帯フィルタ有無=trueの場合、以下の処理を行う
      const filterDepartureFlag = this._findMoreFlightService.departureTimeFilter(boundFilterItem);

      if (filterDepartureFlag) {
        // 出発時間として、当該bounds.originDepartureEstimatedDateTimeが存在する場合、その値を設定し、
        // 存在しない場合は、当該bounds.originDepartureDateTimeを設定する。
        const departureTime = this._findMoreFlightService.getDateMinutes(
          currentBounds?.originDepartureEstimatedDateTime?.slice(-8) ??
            currentBounds?.originDepartureDateTime?.slice(-8)
        );

        // 出発時間<フィルタ条件入力情報.出発時間帯.現在選択中の最小値、
        // または出発時間>フィルタ条件入力情報.出発時間帯.現在選択中の最大値の場合、
        // 処理結果をfalseとして当処理を終了する。
        const selectedMin = Number(boundFilterItem?.departureTimeRange?.selectedMinValue) || 0;
        const selectedMax = Number(boundFilterItem?.departureTimeRange?.selectedMaxValue) || 0;
        if (departureTime < selectedMin || departureTime > selectedMax) {
          return;
        }
      }

      if (
        boundFilterItem?.arrivalTimeRange?.selectedMinValue !== 0 ||
        boundFilterItem?.arrivalTimeRange?.selectedMaxValue !== 1439
      ) {
        // 到着時間として、当該bounds.destinationArrivalEstimatedDateTimeが存在する場合、その値を設定し、
        // 存在しない場合は、当該bounds.destinationArrivalDateTimeを設定する。
        const arrivalTime = this._findMoreFlightService.getDateMinutes(
          currentBounds?.destinationArrivalEstimatedDateTime?.slice(-8) ??
            currentBounds?.destinationArrivalDateTime?.slice(-8)
        );

        // 到着時間<フィルタ条件入力情報.到着時間帯.現在選択中の最小値、
        // または到着時間>フィルタ条件入力情報.到着時間帯.現在選択中の最大値の場合、
        // 処理結果をfalseとして当処理を終了する。
        const selectedMinArrivalTime = Number(boundFilterItem?.arrivalTimeRange?.selectedMinValue) || 0;
        const selectedMaxArrivalTime = Number(boundFilterItem?.arrivalTimeRange?.selectedMaxValue) || 0;
        if (arrivalTime < selectedMinArrivalTime || arrivalTime > selectedMaxArrivalTime) {
          return;
        }
      }

      // フィルタ条件入力情報.Wi-Fiサービス有無=trueの場合、画面表示用airOffersリストから、
      // 画面表示用airOffersリスト.bounds.wiFiType=1のデータのみを抽出し 、
      // 抽出した結果で画面表示用airOffersリストを上書きする。
      if (boundFilterItem?.equipment?.isEnabled && currentBounds?.wiFiType !== '1') {
        return;
      }

      // NHグループ運航フィルタ要否=true、または選択他社運航キャリアリストが空でない場合、
      // 以下の処理を行い、運航キャリアフィルター可=falseとなる場合、
      // 処理結果をfalseとして当処理を終了する。
      if (nhGroupOperationFilter || operationAirlineList.length !== 0) {
        // 運航キャリアフィルター可を初期値falseとする。
        // 以下のいずれかに合致する場合、運航キャリアフィルター可=trueとする。
        const airlineFilterAvailable =
          currentBounds?.flights?.some((flight) =>
            this._findMoreFlightService.checkFlightOfBounds(flight, nhGroupOperationFilter, operationAirlineList)
          ) ?? false;
        if (!airlineFilterAvailable) return;
      }
      // 選択機種リストが空でない場合、以下の処理を行い、機種フィルタ要否=falseとなる場合、
      // 処理結果をfalseとして当処理を終了する。
      if (
        !(
          aircraftList.length === 0 ||
          // <以下、当該bounds.flightの要素数分、繰り返し>
          currentBounds?.flights?.some((flight) =>
            // 機種フィルタ要否を、初期値falseとして用意する。
            // 選択機種リストに当該flight.aircraftCodesが含まれる場合、機種フィルタ要否をtrueとする。
            aircraftList.some((aircraft) => aircraft.item === flight.aircraftCode)
          )
        )
      ) {
        return;
      }
      filteredAirOffers.push({
        ...airOffer,
      });
    });

    this.props = {
      ...this.props,
      airOffersList: filteredAirOffers,
      filterConditionData,
    };
    if (filteredAirOffers.length === 0) {
      const warningInfoFilter: AlertMessageItem = {
        contentHtml: 'm_dynamic_message-MSG1035',
        isCloseEnable: true,
        alertType: AlertType.INFOMATION,
      };
      this._alertMessageStoreService.setAlertInfomationMessage(warningInfoFilter);
    }

    const complexFlightAvailabilityState: ComplexFlightAvailabilityState =
      this._complexFlightAvailabilityPageStoreService.ComplexFlightAvailabilityData;
    const searchFlightState: SearchFlightState = this._searchFlightStoreService.getData();

    // 画面情報JSON生成
    const pageOutPut = this._roundtripFlightAvailabilityInternationalPresService.createDisplayInfoJSON(
      undefined,
      searchFlightState,
      complexFlightAvailabilityState.japanOnlyFlag ?? false,
      true
    );
    // Tealium発火
    this._tealiumSvc.setTealiumPageOutput(pageOutPut);

    // 動的文言設定
    this.dynamicSubject.next({
      findMoreFlightsReply: this._findMoreFlightsPostStoreService.FindMoreFlightsPostData,
      pageContext: pageOutPut,
    });
    this._tealiumSvc.setTealiumPageOutput(pageOutPut);

    this._changeDetectorRef.markForCheck();
  }

  /**
   * ソート条件より、TS情報の並び順を更新する
   * @param SortCondition
   * @param Array<ComplexFmfFareFamilyAirOffersInner>
   */
  public updateTravelSolutionsBySortCondition(value: SortCondition | undefined) {
    const airOffersList = this.props?.airOffersList ?? [];
    switch (value) {
      // CPDランクソートボタン押下時sort処理
      case SortCondition.CPD_RANK:
        this._findMoreFlightService.sortAirOffersListByCpdRank(airOffersList, this._currentBoundIndex);
        break;
      // 出発時刻ソートボタン押下時sort処理
      case SortCondition.DEPARTURE_TIME:
        this._findMoreFlightService.sortAirOffersListByDepartureTime(airOffersList, this._currentBoundIndex);
        break;

      // 到着時刻ソートボタン押下時処理
      case SortCondition.ARRIVAL_TIME:
        this._findMoreFlightService.sortAirOffersListByArrivalTime(airOffersList, this._currentBoundIndex);
        break;

      // 所要時間ソートボタン押下時処理
      case SortCondition.DURATION:
        this._findMoreFlightService.sortAirOffersListByDuration(airOffersList, this._currentBoundIndex);
        break;

      // 運賃差額ソートボタン押下時処理
      case SortCondition.PriceDifference:
        this._findMoreFlightService.sortAirOffersListByPriceDifference(airOffersList);
        break;
      default:
        break;
    }
    this.props = {
      ...this.props,
      sortConditionData: {
        selectedSortCondition: value,
      },
    };
    this._changeDetectorRef.markForCheck();
  }
}
