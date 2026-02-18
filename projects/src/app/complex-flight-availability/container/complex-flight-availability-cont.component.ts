import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SearchFlightHistoryStoreService } from '@common/services/store/search-flight/search-flight-history-store/search-flight-history-store.service';
import { SearchFlightStoreService } from '@common/services/store/search-flight/search-flight-store/search-flight-store.service';
import { SearchFlightConditionForRequestState, SearchFlightState } from '@common/store';
import { SupportPageComponent } from '@lib/components/support-class';
import {
  AlertMessageStoreService,
  AswCommonStoreService,
  AswMasterService,
  CommonLibService,
  ErrorsHandlerService,
  LoggerDatadogService,
  PageInitService,
  SystemDateService,
  TealiumService,
} from '@lib/services';
import { ComplexFmfFareFamily, ComplexRequest, ComplexResponse, Items, Type3, Type5 } from 'src/sdk-search';
import { complexFlightAvailabilityPresProps } from '../presenter/complex-flight-availability-pres.state';
import { InitialBase, InitialFlightConsult, InitialInformation, InitialProcess, RakuFlow } from '../helper/index';
import { ComplexFlightAvailabilityRequestService } from '../service/request.service';
import { ComplexFlightAvailabilityStoreService } from '../service/store.service';
import { ShoppingLibService } from '@common/services/shopping/shopping-lib/shopping-lib.service';
import { ComplexFlightAvailabilityTeleportService } from '../service/teleport.service';
import { DataAdapterService } from '../service/data-adapter.service';
import { RoundtripFlightAvailabilityInternationalService } from '@common/services/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.service';
import {
  ComplexFlightAvailabilityPageStoreService,
  ComplexFlightCalendarStoreService,
  CurrentCartStoreService,
  DeliveryInformationStoreService,
  FindMoreFlightsStoreService,
  GetUnavailablePaymentByOfficeCodeService,
  LocalDateService,
  SearchFlightConditionForRequestService,
} from '@common/services';
import { FareTypeOption, ReservationFunctionIdType, ReservationPageIdType } from '@common/interfaces';
import { FlightType } from '@common/components';
import { ComplexFlightAvailabilityEventService } from '../service/event.service';
import { StaticMsgPipe } from '@lib/pipes';
import { RoundtripFlightAvailabilityInternationalContService } from '@app/roundtrip-flight-availability-international/container/roundtrip-flight-availability-international-cont.service';
import { BehaviorSubject } from 'rxjs';
import { DynamicParams } from '../helper/initial.state';
import { UpgradeavailabilityResponse } from '@common/interfaces/shopping/upgrade-availability/upgradeavailabilityResponses';
import { DisplayInfoJSON } from '@app/roundtrip-flight-availability-international/presenter/roundtrip-flight-availability-international-pres.state';
import { MASTER_TABLE } from '@conf/asw-master.config';
import { DeliverySearchInformationStoreService } from '@common/services/store/delivery-search-information-store/delivery-search-information-store.service';
import { PageType } from '@lib/interfaces';
import { RoundtripFlightAvailabilityInternationalPresService } from '@app/roundtrip-flight-availability-international/presenter/roundtrip-flight-availability-international-pres.service';
import { fetchComplexRequestData } from '../helper/data';
import { ComplexFlightAvailabilityUntilService } from '../service/utils.service';

@Component({
  selector: 'asw-complex-flight-availability-cont',
  templateUrl: './complex-flight-availability-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplexFlightAvailabilityContComponent extends SupportPageComponent {
  // プロパティ定義
  // @var 機能ID
  public readonly functionId = ReservationFunctionIdType.PRIME_BOOKING;
  // @var ページID
  public readonly pageId = ReservationPageIdType.COMPLEX_FLIGHT_AVAILABILITY;

  // history function
  public readonly historyFunctionId = this._aswCommonStoreService.aswCommonData.functionId ?? '';
  // history page id
  public readonly historyPageId = this._aswCommonStoreService.aswCommonData.pageId ?? '';

  /** 遷移元機能ID+ページID */
  public readonly historyId = this.historyFunctionId + this.historyPageId;

  // flow処理
  private _flow = new RakuFlow<InitialBase, ComplexFlightAvailabilityContComponent>(this);

  // initialProcess処理
  private _initialProcess = new InitialProcess();

  // initialInformation処理
  private _initialInformation = new InitialInformation();

  // 空席照会処理
  private _initialFlightConsult = new InitialFlightConsult();

  private _pageContext?: DisplayInfoJSON;
  public setPageContext = (val: DisplayInfoJSON | undefined) => (this._pageContext = val);
  public getPageContext = (): DisplayInfoJSON | undefined => this._pageContext;

  /** props定義 */
  public props?: complexFlightAvailabilityPresProps;

  // 検索要否
  protected _shouldSearch = true;
  public setShouldSearch = (val: boolean) => {
    this._shouldSearch = val;
    this._teleportService.emit('shouldSearch', val);
  };
  public getShouldSearch = (): boolean => this._shouldSearch;

  // 複雑カレンダー経由かどうか
  protected _isFromComplexCalendar = false;
  public setIsFromComplexCalendar = (val: boolean) => {
    this._isFromComplexCalendar = val;
  };
  public getIsFromComplexCalendar = (): boolean => this._isFromComplexCalendar;

  // ヘッダーログイン可能フラグ
  protected _isEnabledLogin = false;
  public setIsEnabledLogin = (val: boolean) => (this._isEnabledLogin = val);
  public getIsEnabledLogin = (): boolean => this._isEnabledLogin;

  // 選択中FFのindex
  protected _selectedFFIndex = 0;
  public setSelectedFFIndex = (val: number) => {
    this._selectedFFIndex = val;
    this._teleportService.emit<number>('selectedFFIndex', val);
  };
  public getSelectedFFIndex = () => this._selectedFFIndex;

  // フライト検索画面(R01-P010)の[日本国内単独旅程判定処理]の結果
  protected _searchResultTripType = '';
  public setSearchResultTripType = (val: FlightType) => {
    this._searchResultTripType = val;
    this._teleportService.emit<FlightType>('searchResultTripType', val);
  };
  public getSearchResultTripType = () => this._searchResultTripType;

  // フライト検索画面(R01-P010)の[日本国内単独旅程判定処理]の結果(boolean)
  protected _japanOnlyFlag = false;
  public setJapanOnlyFlag = (val: boolean) => {
    this._japanOnlyFlag = val;
    this._teleportService.emit<boolean>('japanOnlyFlag', val);
  };
  public getJapanOnlyFlag = () => this._searchResultTripType;

  // 空席照会日時(サイト時刻)
  protected _searchedDateTime = '';
  public setSearchedDateTime = (val: string) => {
    this._searchedDateTime = val;
    this._teleportService.emit<string>('searchedDateTime', val);
  };
  public getSearchedDateTime = () => this._searchedDateTime;

  // フライト検索画面(R01-P010)で保持されたリクエストパラメータを選択バウンド情報 [リクエスト用検索条件]
  private _complexRequest?: ComplexRequest;
  public setComplexRequest = (data: ComplexRequest) => {
    this._complexRequest = data;
    this._teleportService.emit<ComplexRequest>('complexRequest', data);
  };
  public getComplexRequest = () => this._complexRequest;

  // 複雑空席照会結果取得APIの戻り値
  protected _complexResponse?: ComplexResponse;
  public setComplexResponse = (data?: ComplexResponse) => {
    this._complexResponse = data;
  };
  public getComplexResponse = () => this._complexResponse;

  // 画面初期化完了を独自のタイミングにするため、falseでオーバーライドする
  public override autoInitEnd: boolean = false;

  /** 動的文言 */
  public dynamicSubject = new BehaviorSubject<DynamicParams>({
    complexTripReply: undefined,
    historyFavoriteReply: undefined,
    upgradeAvailabilityReply: undefined,
    upgradeWaitlistReply: undefined,
    pageContext: undefined,
  });
  /**
   * !!! 以下のparamsは使わないでも、削除しないでください。他のクラスを共有している。
   */
  constructor(
    protected _commonLibService: CommonLibService,
    private _pageInitService: PageInitService,
    protected _alertMessageStoreService: AlertMessageStoreService,
    private _aswCommonStoreService: AswCommonStoreService,
    private _titleService: Title,
    private _routerService: Router,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _requestService: ComplexFlightAvailabilityRequestService,
    private _systemDateService: SystemDateService,
    private _errorsHandlerService: ErrorsHandlerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: ComplexFlightAvailabilityStoreService,
    private _shoppingLibService: ShoppingLibService,
    private _teleportService: ComplexFlightAvailabilityTeleportService,
    private _dataAdapterService: DataAdapterService,
    private _roundtripFlightAvailabilityInternationalService: RoundtripFlightAvailabilityInternationalService,
    private _complexFlightCalendarStoreService: ComplexFlightCalendarStoreService,
    private _findMoreFlightsStoreService: FindMoreFlightsStoreService,
    private _eventService: ComplexFlightAvailabilityEventService,
    private _complexFlightAvailabilityStoreService: ComplexFlightAvailabilityPageStoreService,
    private _searchFlightConditionForRequestService: SearchFlightConditionForRequestService,
    private _staticMsgPipe: StaticMsgPipe,
    private _currentCartStoreService: CurrentCartStoreService,
    private _roundtripFlightAvailabilityService: RoundtripFlightAvailabilityInternationalContService,
    private _aswMasterSvc: AswMasterService,
    private _deliverySearchInformationStoreService: DeliverySearchInformationStoreService,
    private _localDateService: LocalDateService,
    private _roundtripFlightAvailabilityInternationalPresService: RoundtripFlightAvailabilityInternationalPresService,
    private _loggerSvc: LoggerDatadogService,
    private _untilService: ComplexFlightAvailabilityUntilService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _tealiumSvc: TealiumService,
    private _deliveryInformationStoreService: DeliveryInformationStoreService,
    private _getUnavailablePaymentByOfficeCodeService: GetUnavailablePaymentByOfficeCodeService
  ) {
    super(_commonLibService, _pageInitService);

    this._storeService.updateComplexFlightAvailabilityState({ previousId: this.historyId });

    // titleを設置し
    this.forkJoinService(
      'Complex-Flight-Availability-Title-Set',
      [this._staticMsgPipe.get('label.searchResultAndItinerary'), this._staticMsgPipe.get('label.aswPageTitle')],
      ([str1, str2]) => {
        this.deleteSubscription('Complex-Flight-Availability-Title-Set');
        this._titleService.setTitle(str1 + str2);
      }
    );

    // 画面情報に以下の内容を設定する。
    this._commonLibService.aswCommonStoreService.updateAswCommon({
      functionId: this.functionId,
      pageId: this.pageId,
      subFunctionId: '',
      subPageId: '',
      isEnabledLogin: false,
    });
  }

  /** 初期表示処理 */
  init() {
    this.subscribeService(
      'complexFlightAvailabilityComponentGetCache',
      this._aswMasterSvc.load(
        [
          MASTER_TABLE.AIRPORT_I18N_SEARCH_FOR_AIRPORT_CODE,
          MASTER_TABLE.AIRCRAFTCABIN_I18NJOIN_BYPK,
          MASTER_TABLE.M_LIST_DATA_930,
          MASTER_TABLE.M_LIST_DATA_940,
          MASTER_TABLE.M_AIRPORT_I18N,
          MASTER_TABLE.AIRLINE_I18NJOINALL,
          MASTER_TABLE.SERVICE_CONTENTS,
          MASTER_TABLE.AIRPORT_I18N_JOIN_BY_AIRPORT_CODE,
        ],
        true
      ),
      () => {
        this.deleteSubscription('complexFlightAvailabilityComponentGetCache');
        this.params = this.dynamicSubject.asObservable();
        this.initializeData();
      }
    );
    //セッションストレージからaswServiceを削除する
    sessionStorage.removeItem('aswService');
  }

  /** 画面終了時処理 */
  destroy() {
    //　複雑空席照会画面でのteleportのイベントとデータを全て削除する
    this._teleportService.clear();
  }

  /** 画面更新時処理 */
  reload() {}

  // 初期処理
  protected async initializeData() {
    await this._createFlow();

    this.updateComplexProps();

    this._eventService.fareTypeOptionModalListener(this._fareTypeOptionModalHandler);
    //  ユーザ共通.操作オフィスコード=支払不可情報.オフィスとなる、ASWDB(マスタ)の支払不可情報.ユーザーエージェント検索文字列と支払不可情報.ワーニング表示フラグがtrueの支払不可情報.支払方法を取得する。ユーザーエージェントに検索文字列が含まれる場合、”W1862”(利用中のブラウザでは対象の支払方法が使用できないため、推奨ブラウザを使ってほしい旨)のワーニングメッセージを表示する。
    this._getUnavailablePaymentByOfficeCodeService.checkUnavailablePaymentByOfficeCode();
  }

  /** 画面表示内容設定 */
  private complexProps(
    complexResponse: ComplexResponse,
    searchFlight: SearchFlightState,
    complexRequest?: ComplexRequest,
    searchedDateTime?: string,
    selectedFFIndex?: number,
    searchResultTripType?: FlightType,
    japanOnlyFlag?: boolean,
    selectedFareFamily?: ComplexFmfFareFamily,
    displayFareFamilies?: Array<ComplexFmfFareFamily>
  ) {
    this.props = {
      complexFlightAvailabilityResponse: complexResponse,
      searchFlight: searchFlight,
      isShowFooter: true,
      complexRequest: complexRequest,
      searchedDateTime: searchedDateTime,
      selectedFFIndex: selectedFFIndex,
      searchResultTripType: searchResultTripType,
      japanOnlyFlag: japanOnlyFlag,
      selectedFareFamily: selectedFareFamily,
      displayFareFamilies: displayFareFamilies,
    };
  }

  // flowを制定
  private async _createFlow() {
    this._flow.addInstance(this._initialProcess);
    this._flow.addInstance(this._initialInformation);
    this._flow.addInstance(this._initialFlightConsult);
    this._flow.execute((obj) => obj.bindFlow(this._flow).autoInjectService(obj));
    try {
      await this._flow.executeAsyncMethod(async (obj, stop) => {
        await obj.handle();
        if (!obj.isNext()) stop();
      });
    } finally {
      await this.setPageOutPut();
      // 動的文言判定用情報として以下を指定して画面の初期化処理(G01-003)の初期化終了処理を呼び出す。
      this.dynamicSubject.next({
        complexTripReply: this.getComplexResponse(),
        pageContext: this.getPageContext(),
      });
      this._pageInitService.endInit(this.params);
    }
  }

  // FF選択情報を取得
  public getCurrentComplexFmfFareFamily(): ComplexFmfFareFamily {
    const index = this.getSelectedFFIndex();
    const arr = this._complexResponse?.data?.fareFamilies ?? [];
    if (index > arr.length - 1) throw new Error('Err: invalid index in ComplexFmfFareFamily[]');
    return arr[index];
  }

  // 運賃オプションが値を返したときの処理を定義
  private _fareTypeOptionModalHandler = async (selectedFareType: string) => {
    // テンポラリの検索条件として、リクエスト用検索条件を設定する。
    const tmpSearch = this._searchFlightConditionForRequestService.getData();
    // テンポラリの検索条件.fare.fareOptionTypeに、運賃オプションを設定する。
    this._searchFlightConditionForRequestService.updateStore({
      ...tmpSearch,
      request: {
        ...tmpSearch.request,
        fare: {
          ...tmpSearch.request.fare,
          fareOptionType: selectedFareType,
        },
      },
    });
    const _tmpRequest = this._storeService.fetchFlightConditionData();

    if (_tmpRequest) {
      // 引数の検索条件にテンポラリの検索条件を設定し、初期表示処理の[空席照会処理]を行う。
      await this._initialFlightConsult.handle(_tmpRequest);
      // propsを更新
      this.updateComplexProps();
    }
  };

  private async updateComplexProps() {
    // propsを更新
    const P033State = await this._storeService.fetchComplexFlightAvailabilityState();

    this.complexProps(
      P033State.complexResponse ?? {},
      this._searchFlightStoreService.getData(),
      P033State.complexRequest,
      P033State.searchedDateTime,
      P033State.selectedFFIndex,
      P033State.searchResultTripType,
      P033State.japanOnlyFlag,
      P033State.selectedFareFamily,
      P033State.displayFareFamilies
    );
    this._changeDetectorRef.markForCheck();
  }

  // tealiumへのデータセット処理 start

  /** tealiumのpageOutPutにデータセット */
  private async setPageOutPut() {
    const searchFlightObj = await this._storeService?.fetchSearchFlightData();
    const complexReqObj = await fetchComplexRequestData(this._storeService);
    const pageOutPut = this._roundtripFlightAvailabilityInternationalPresService.createDisplayInfoJSON(
      complexReqObj.itineraries,
      searchFlightObj,
      this._japanOnlyFlag ?? false,
      false
    );

    this.setPageContext(pageOutPut);

    // 画面情報JSON（Tealium連携用基本情報JSON設定）
    this._tealiumSvc.setTealiumPageOutput(pageOutPut);
  }
}
