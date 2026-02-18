import { dateFormat, getFormatHourTime, linkToPagePost } from '../../../helpers';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { FareFamilySelectModalService } from '../../fare-family-select-modal/fare-family-select-modal.service';
import {
  DefaultService,
  Items11,
  RoundtripFppItemAirBoundsDataType,
  RoundtripFppItemBoundDetailsDataType,
  RoundtripFppItemFareFamilyDataTypeInner,
  RoundtripFppRequestItinerariesInner,
  WaitlistGetSearchWaitlistResponse,
} from '../../../sdk';
import {
  AirBounDisplayType,
  FareFamilyOutputType,
  OperatingAirlineType,
  SeatMapInfo,
  ServiceInfoListType,
} from '../../../interfaces';
import { MasterDataService } from '../../../services';
import { ApiErrorResponseModel, AswContextType, ErrorType, PageType, SessionStorageName } from '@lib/interfaces';
import {
  ApiErrorResponseService,
  AswContextStoreService,
  AswServiceStoreService,
  CommonLibService,
  ErrorsHandlerService,
} from '@lib/services';
import { Observable, Subject, Subscription, filter, map, of, switchMap } from 'rxjs';
import { FlightSearchCondition } from '../../../interfaces/flight-search';
import { SeatMapModalService } from '../../../components/seat-map-modal/seat-map-modal.service';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { WaitlistStore, selectWaitlistState, setWaitlistFromApi } from '../../../store/waitlist';
import { SearchFlightStoreService } from '@common/services';
import { SearchFlightStateDetails } from '@common/store';
import { v4 } from 'uuid';
import { AppConstants } from '@conf/app.constants';
import { ErrorCodeConstants } from '@conf/app.constants';

/** マルチエアポート区分 */
const MULTI_AIRPORT_TYPE = {
  // マルチエアポート空港
  TYPE_1: '1',
  // マルチエアポート都市
  TYPE_2: '2',
};
/** 時刻形式 */
const DATE_FORMAT = {
  DATE_TIME_JA: 'H:mm',
  MID_NIGHT_DATE_JA: 'M月d日',
  DATE_TIME_EN: 'h:mm',
  AM_PM_EN: 'a',
  YYYY_MM_DD: 'yyyyMMdd',
};

/** 言語コード */
const LANG_CODE = {
  JA: 'ja',
  CN: 'cn',
  HK: 'hk',
  TW: 'tw',
  KO: 'ko',
};
/** エラーメッセージ ID */
const ERROR_MSG_ID = {
  E0891: 'E0891',
};

/**
 * フライトサマリContComponent
 */
@Component({
  selector: 'asw-vacant-seat-item-cont',
  templateUrl: './vacant-seat-item-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacantSeatItemContComponent implements OnInit, OnDestroy {
  public appConstants = AppConstants;
  /**
   * Travel Solution情報
   */
  @Input()
  public boundDetails?: RoundtripFppItemBoundDetailsDataType;

  /**
   * 全Air Bound情報フィルタ後選択不可
   */
  @Input()
  public isAllUnableFareFamilyCodes?: Array<string>;

  /**
   * AirBound表示タイプ
   */
  @Input()
  public airBoundInfo?: Array<AirBounDisplayType>;

  /**
   * 選択済みAirBound情報
   */
  @Input()
  public selectedAirBound?: RoundtripFppItemAirBoundsDataType | null;

  /**
   * 区間毎の情報
   */
  @Input()
  public boundInfo?: RoundtripFppRequestItinerariesInner[];

  /**
   * 検索条件
   */
  @Input()
  public searchCondition?: FlightSearchCondition;

  /**
   * 指定したキャビンクラス
   */
  @Input()
  public cabinClass?: string;

  /**
   * 検索条件.区間毎の情報
   */
  @Input()
  public itinerary?: RoundtripFppRequestItinerariesInner;

  /**
   * ANAカウチ利用可が含まれるセグメント
   */
  @Input()
  public anaCouchSegments?: any;

  /**
   * サービス情報リスト
   */
  @Input()
  public svcInfoList?: ServiceInfoListType;

  /**
   * スクロール連動の計算の制御
   */
  @Input()
  public scrollShadow$?: Subject<'start' | 'end' | 'none'>;

  /**
   * スクロール表示用のパラメータ(国内の場合)
   */
  public isFirstCells = true;

  /**
   * Fare Family情報
   */
  @Input()
  public fareFamilies?: Array<RoundtripFppItemFareFamilyDataTypeInner>;

  /**
   * 指定したキャビンクラス以外
   */
  @Input()
  public hasDiffCabinClass?: boolean;

  @Output()
  public selectFareFamily$: EventEmitter<FareFamilyOutputType> = new EventEmitter<FareFamilyOutputType>();

  @Output()
  public scrollButtonClick$: EventEmitter<'previous' | 'next'> = new EventEmitter<'previous' | 'next'>();

  /**
   * 遅延情報
   */
  public isContainedDelayedFlight = false;

  /**
   * 早発情報
   */
  public isContainedEarlyDepartureFlight = false;

  /**
   * 出発地
   */
  public departureLocation?: string;

  /**
   * 出発地太字表示フラグ
   */
  public departureLocationEm?: boolean;

  /**
   * 到着地
   */
  public destinationLocation?: string;

  /**
   * 到着地太字表示フラグ
   */
  public destinationLocationEm?: boolean;

  /**
   * 出発時刻
   */
  public departureTime?: string;

  /**
   * 出発時刻(am/pm)
   */
  public departureTimeMeridian?: string;

  /**
   * 最新出発時刻
   */
  public departureTimeNew?: string;

  /**
   * 最新出発時刻(am/pm)
   */
  public departureTimeNewMeridian?: string;

  /**
   * 到着時刻
   */
  public destinationTime?: string;

  /**
   * 到着時刻(am/pm)
   */
  public destinationTimeMeridian?: string;

  /**
   * 最新到着時刻
   */
  public destinationTimeNew?: string;

  /**
   * 最新到着時刻(am/pm)
   */
  public destinationTimeNewMeridian?: string;

  /**
   * 深夜発
   */
  public isLateNightDeparture?: boolean;

  /**
   * 深夜出発日時
   */
  public lateNightDepartureDate?: string;

  /**
   * 乗継回数
   */
  public numberOfConnection?: number;

  /**
   * 所要時間
   */
  public duration?: string;

  /**
   * 到着日付差
   */
  public arrivalDaysDifference?: number;

  /**
   * 赤字表示要否判定
   */
  public hasRedChar?: boolean;

  /**
   * 全ての日本国内線および日本発着国際線がNHグループ運航便
   */
  public isAllNhGroupOperated?: boolean;

  /**
   * 全ての日本国内線および日本発着国際線がスターアライアンス加盟キャリア運航
   */
  public isAllStarAllianceOperated?: boolean;

  /**
   * 運航キャリア名称
   */
  public operatingAirlinesArray?: Array<OperatingAirlineType>;

  /**
   * 運政府認可申請中情報
   */
  public isContainedPendingGovernmentApproval?: boolean;

  /**
   * Wi-Fiサービスアイコン
   */
  public wifiAvailableType?: string;

  /**
   * ACVに応じたラベルもしくは画像
   */
  public acvMessageKeyList?: Array<string>;

  public isSelfWaitingCountsClick = false;

  /**
   * 空席待ち人数取得API応答
   */
  public waitlist$: Observable<WaitlistGetSearchWaitlistResponse>;

  /**
   * 履歴用検索条件
   */
  private _searchFlight: SearchFlightStateDetails;

  /**
   * ngOnDestroyにunsubscribeを実行
   */
  private _subscriptions: Subscription = new Subscription();

  /**
   * ID of the request
   */
  private _requestId: string = '';
  constructor(
    private _common: CommonLibService,
    private _store: Store<WaitlistStore>,
    private _changeDetectorRef: ChangeDetectorRef,
    private _fareSelectSvc: FareFamilySelectModalService,
    private _aswContextSvc: AswContextStoreService,
    private _translateSvc: TranslateService,
    private _masterDataService: MasterDataService,
    private _aswServiceSvc: AswServiceStoreService,
    private _defaultApiSvc: DefaultService,
    private _apiErrorSvc: ApiErrorResponseService,
    private _errorHandlerSvc: ErrorsHandlerService,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _seatMapSvc: SeatMapModalService
  ) {
    // 履歴用検索条件
    this._searchFlight = this._searchFlightStoreService.getData();
    // 空席待ち人数取得API応答
    this.waitlist$ = this._store.pipe(
      select(selectWaitlistState),
      filter((state) => !!state && state.requestId === this._requestId),
      map((state) => state.model),
      filter((modal): modal is WaitlistGetSearchWaitlistResponse => !!modal)
    );
    this._translateSvc.onLangChange.subscribe(() => {
      // 出発地
      if (
        this._masterDataService.getMultiAirportType(this.itinerary?.originLocationCode as string) ===
        MULTI_AIRPORT_TYPE.TYPE_2
      ) {
        this.departureLocationEm =
          this._masterDataService.getMultiAirportType(this.boundDetails?.originLocationCode as string) ===
          MULTI_AIRPORT_TYPE.TYPE_1;
        this.departureLocation = this._masterDataService.getAirportName(
          this.boundDetails?.originLocationCode,
          this.boundDetails?.originLocationName
        );
      }
      // 到着地
      if (
        this._masterDataService.getMultiAirportType(this.itinerary?.destinationLocationCode as string) ===
        MULTI_AIRPORT_TYPE.TYPE_2
      ) {
        this.destinationLocationEm =
          this._masterDataService.getMultiAirportType(this.boundDetails?.destinationLocationCode as string) ===
          MULTI_AIRPORT_TYPE.TYPE_1;
        this.destinationLocation = this._masterDataService.getAirportName(
          this.boundDetails?.destinationLocationCode,
          this.boundDetails?.destinationLocationName
        );
      }
    });
  }

  /**
   * 初期化処理
   */
  public ngOnInit() {
    // 遅延情報
    this.isContainedDelayedFlight = this.boundDetails?.isContainedDelayedFlight || false;
    // 早発情報
    this.isContainedEarlyDepartureFlight = this.boundDetails?.isContainedEarlyDepartureFlight || false;

    this.wifiAvailableType = this.boundDetails?.wiFiType;
    // 出発地
    if (
      this._masterDataService.getMultiAirportType(this.itinerary?.originLocationCode as string) ===
      MULTI_AIRPORT_TYPE.TYPE_2
    ) {
      this.departureLocationEm =
        this._masterDataService.getMultiAirportType(this.boundDetails?.originLocationCode as string) ===
        MULTI_AIRPORT_TYPE.TYPE_1;
      this.departureLocation = this._masterDataService.getAirportName(
        this.boundDetails?.originLocationCode,
        this.boundDetails?.originLocationName
      );
    }
    // 到着地
    if (
      this._masterDataService.getMultiAirportType(this.itinerary?.destinationLocationCode as string) ===
      MULTI_AIRPORT_TYPE.TYPE_2
    ) {
      this.destinationLocationEm =
        this._masterDataService.getMultiAirportType(this.boundDetails?.destinationLocationCode as string) ===
        MULTI_AIRPORT_TYPE.TYPE_1;
      this.destinationLocation = this._masterDataService.getAirportName(
        this.boundDetails?.destinationLocationCode,
        this.boundDetails?.destinationLocationName
      );
    }
    // 出発時刻
    this._subscriptions.add(
      this._aswContextSvc.getAswContextByKey$(AswContextType.LANG).subscribe((lang) => {
        let departureTimeNew;
        let destinationTimeNew;
        departureTimeNew = this.boundDetails?.originDepartureEstimatedDateTime;
        destinationTimeNew = this.boundDetails?.destinationArrivalEstimatedDateTime;
        const departureTime = this.boundDetails?.originDepartureDateTime;
        const destinationTime = this.boundDetails?.destinationArrivalDateTime;
        // 深夜出発日時
        // ユーザ共通.言語情報＝"ja"(日本語)
        if (lang === LANG_CODE.JA && this.boundDetails?.isLateNightDeparture) {
          this.lateNightDepartureDate = departureTimeNew || departureTime;
        }
        // 最新出発時刻
        this.departureTimeNew = departureTimeNew;
        // 出発時刻
        this.departureTime = departureTime;
        // 最新到着時刻
        this.destinationTimeNew = destinationTimeNew;
        // 到着時刻
        this.destinationTime = destinationTime;
        // 所要時間
        this.duration = getFormatHourTime(this.boundDetails?.duration as number);
      })
    );
    // 乗継回数
    this.numberOfConnection = this.boundDetails?.numberOfConnection;

    this.arrivalDaysDifference =
      this.boundDetails?.destinationArrivalEstimatedDaysDifference ||
      this.boundDetails?.destinationArrivalDaysDifference;

    // 運航キャリア識別
    this.isAllNhGroupOperated = this.boundDetails?.isAllNhGroupOperated;
    // this.isAllStarAllianceOperated = this.boundDetails?.isAllStarAllianceOperated;
    // 運航キャリア名称(運航キャリアコードに該当する運航キャリア名称とキャリア URL を ASWDB(マスタ)から取得)
    this.operatingAirlinesArray = [];
    this.boundDetails?.operatingAirlines.forEach((operatingAirline) => {
      if (operatingAirline.airlineCode !== this.appConstants.CARRIER.TWO_LETTER) {
        const operatingAirlineLink = this._masterDataService.getInTimeAirlineLink(operatingAirline.airlineCode);
        this.operatingAirlinesArray?.push({
          name: { operatingName: operatingAirline.airlineName, operatingCode: operatingAirline.airlineCode },
          link: operatingAirlineLink,
        });
      }
    });
    // 政府認可申請中情報
    this.isContainedPendingGovernmentApproval = this.boundDetails?.isContainedPendingGovernmentApproval;

    this._subscriptions.add(
      this._store
        .pipe(
          select(selectWaitlistState),
          filter((state) => !!state.isFailure && state.requestId === this._requestId),
          switchMap(() => {
            return this._apiErrorSvc
              .getApiErrorResponse$()
              .pipe(filter((data): data is ApiErrorResponseModel => !!data));
          })
        )
        .subscribe(({ errors }) => {
          if (this.isSelfWaitingCountsClick) {
            this.isSelfWaitingCountsClick = false;
            if (errors?.[0].code === ErrorCodeConstants.ERROR_CODES.EBAZ000574) {
              this._errorHandlerSvc.setRetryableError(PageType.PAGE, {
                errorMsgId: ERROR_MSG_ID.E0891,
                apiErrorCode: errors[0].code,
              });
            } else if (errors?.[0].code) {
              this._errorHandlerSvc.setNotRetryableError({
                errorType: ErrorType.SYSTEM,
                apiErrorCode: errors[0].code,
              });
            } else {
              this._errorHandlerSvc.setNotRetryableError({
                errorType: ErrorType.SYSTEM,
              });
            }
          }
        })
    );
    this._subscriptions.add(
      this.waitlist$
        .pipe(
          switchMap(() => {
            if (this.isSelfWaitingCountsClick) {
              this.isSelfWaitingCountsClick = false;
              return this._fareSelectSvc.open(
                this.boundDetails,
                this.airBoundInfo?.filter((info) => !!info.airBoundId),
                this.itinerary,
                this.selectedAirBound,
                this.boundInfo,
                this.fareFamilies,
                this.cabinClass,
                this.isAllUnableFareFamilyCodes
              ).buttonClick$;
            }
            return of(false);
          }),
          filter((fareFamilyInfo): fareFamilyInfo is FareFamilyOutputType => !!fareFamilyInfo)
        )
        .subscribe((fareFamilyInfo) => {
          if (fareFamilyInfo) {
            this.selectFareFamily$.emit(fareFamilyInfo);
          }
        })
    );
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  /**
   * FF選択
   * @param selectedAirBoundInfo 選択したAir Bound情報
   */
  public selectFareFamily(selectedAirBoundInfo: RoundtripFppItemAirBoundsDataType) {
    this.selectFareFamily$.emit({
      selectedAirBoundInfo: selectedAirBoundInfo,
      boundDetails: this.boundDetails as RoundtripFppItemBoundDetailsDataType,
      airBoundInfo: this.airBoundInfo as Array<AirBounDisplayType>,
    });
  }

  /**
   * 運賃別シートマップ表示リンク押下処理
   */
  public seatMapClick() {
    let seatMapInfo: SeatMapInfo;
    seatMapInfo = {
      // 遅延情報
      isContainedDelayedFlight: this.isContainedDelayedFlight,
      // 早発情報
      isContainedEarlyDepartureFlight: this.isContainedEarlyDepartureFlight,
      // 赤字表示要否判定
      hasRedChar: this.hasRedChar,
      // 出発地
      departureLocation: this.departureLocation,
      // 出発地太字表示フラグ
      departureLocationEm: this.departureLocationEm,
      // 到着地
      destinationLocation: this.destinationLocation,
      // 到着地太字表示フラグ
      destinationLocationEm: this.destinationLocationEm,
      // 出発時刻
      departureTime: this.departureTime,
      // 出発時刻(am/pm)
      departureTimeMeridian: this.departureTimeMeridian,
      // 最新出発時刻
      departureTimeNew: this.departureTimeNew,
      // 最新出発時刻(am/pm)
      departureTimeNewMeridian: this.departureTimeNewMeridian,
      // 到着時刻
      destinationTime: this.destinationTime,
      // 到着時刻(am/pm)
      destinationTimeMeridian: this.destinationTimeMeridian,
      // 最新到着時刻
      destinationTimeNew: this.destinationTimeNew,
      // 最新到着時刻(am/pm)
      destinationTimeNewMeridian: this.destinationTimeNewMeridian,
      // 深夜発
      isLateNightDeparture: this.isLateNightDeparture,
      // 深夜出発日時
      lateNightDepartureDate: this.lateNightDepartureDate,
      // 乗継回数
      numberOfConnection: this.numberOfConnection,
      // 所要時間
      duration: this.duration,
      // 到着日付差
      arrivalDaysDifference: this.arrivalDaysDifference,
      // 運航キャリア識別
      isAllNhGroupOperated: this.isAllNhGroupOperated,
      // 全ての日本国内線および日本発着国際線がスターアライアンス加盟キャリア運航
      isAllStarAllianceOperated: this.isAllStarAllianceOperated,
      // 運航キャリア名称
      operatingAirlinesArray: this.operatingAirlinesArray,
      // 全Air Bound情報フィルタ後選択不可
      isAllUnableFareFamilyCodes: this.isAllUnableFareFamilyCodes,
    };
    let fareFamilies: RoundtripFppItemFareFamilyDataTypeInner[] = [];
    this.fareFamilies?.forEach((fareFamily) => {
      if (
        this.airBoundInfo?.find(
          (airBound) => airBound.fareFamilyCode === fareFamily.fareFamilyCode && airBound?.isCanChooseAfterFilter
        )
      ) {
        fareFamilies.push(fareFamily);
      }
    });
    const ref = this._seatMapSvc.open(
      this.isAllUnableFareFamilyCodes,
      seatMapInfo,
      fareFamilies,
      this.boundDetails,
      undefined,
      this.airBoundInfo
    );

    ref.seatMap$.subscribe((data: { segment: Items11; ffCode: string }) => {
      const { orderId, firstName, lastName } = this._aswServiceSvc.aswServiceData;
      const pagePostParams = {
        marketingAirlineCode: data.segment?.marketingAirlineCode,
        marketingFlightNumber: data.segment?.marketingFlightNumber,
        originLocationCode: data.segment?.departure?.locationCode,
        destinationLocationCode: data.segment?.arrival?.locationCode,
        bookingClass: (this.airBoundInfo?.find((airBound) => airBound.fareFamilyCode === data.ffCode) as any)?.[
          data.segment.id
        ]?.service?.bookingClass,
        departureDate: dateFormat(data.segment?.departure?.dateTime, DATE_FORMAT.YYYY_MM_DD),
        JSessionId: sessionStorage.getItem(SessionStorageName.JSESSION_ID),
        amcMemberNumber: !this._common.isNotLogin()
          ? this._common.amcMemberStoreService.amcMemberData.iFlyMemberInfo?.membershipNumber
          : '',
        numberOfADT: this._searchFlight.traveler.adt,
        numberOfB15: this._searchFlight.traveler.b15,
        numberOfCHD: this._searchFlight.traveler.chd,
        numberOfINF: this._searchFlight.traveler.inf,
        fareFamilyCode: data.ffCode,
        fareFamilyOwnerAirlineCode: this.appConstants.CARRIER.TWO_LETTER,
        orderId: orderId || '',
        firstName: firstName || '',
        lastName: lastName || '',
        CONNECTION_KIND: 'ZZZ',
        LANG: this._aswContextSvc.aswContextData.lang,
      };
      linkToPagePost('servicing/informative-seatmap', pagePostParams, '_blank');
    });
  }

  /**
   * 空席待ち人数取得リンク押下処理
   */
  public waitingCountsClick() {
    this.isSelfWaitingCountsClick = true;
    const call = this._defaultApiSvc.searchWaitlistGet(
      this.boundDetails?.originDepartureDateTime as string,
      this.boundDetails?.segments[0].marketingAirlineCode as string,
      this.boundDetails?.segments[0].marketingFlightNumber as string
    );
    this._requestId = v4();
    this._store.dispatch(setWaitlistFromApi({ call, requestId: this._requestId }));
  }

  /**
   * FF情報スクロールボタン押下処理
   * @param type ボタンタイプ（左／右）
   */
  public scrollButtonClick(type: 'previous' | 'next') {
    this.scrollButtonClick$.emit(type);
  }
}
