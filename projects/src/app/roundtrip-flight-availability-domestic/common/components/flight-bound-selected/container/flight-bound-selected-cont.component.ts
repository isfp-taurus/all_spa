import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FlightSearchCondition,
  AirBounDisplayType,
  ServiceInfoListType,
  FareFamilyOutputType,
  OperatingAirlineType,
} from '../../../interfaces';
import { getFormatHourTime } from '../../../helpers';
import { MasterDataService } from '../../../services';
import { AswContextType } from '@lib/interfaces';
import { AswContextStoreService } from '@lib/services';
import { Subscription } from 'rxjs';
import { FareFamilySelectModalService } from '../../../components/fare-family-select-modal/fare-family-select-modal.service';
import { FlightDetailsModalService } from '../../../components/flight-details-modal/flight-details-modal.service';
import { TranslateService } from '@ngx-translate/core';
import {
  RoundtripFppItemAirBoundsDataType,
  RoundtripFppItemBoundDetailsDataType,
  RoundtripFppItemFareFamilyDataTypeInner,
  RoundtripFppRequestItinerariesInner,
} from '../../../../common/sdk';
import { AppConstants } from '@conf/app.constants';

/** マルチエアポート区分 */
const MULTI_AIRPORT_TYPE = {
  // マルチエアポート空港
  TYPE_1: '1',
  // マルチエアポート都市
  TYPE_2: '2',
};

/** 言語コード */
const LANG_CODE = {
  JA: 'ja',
  CN: 'cn',
  HK: 'hk',
  TW: 'tw',
  KO: 'ko',
};

/**
 * 選択中TS・FF情報ContComponent
 */
@Component({
  selector: 'asw-flight-bound-selected-cont',
  templateUrl: './flight-bound-selected-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightBoundSelectedContComponent implements OnInit, OnDestroy, OnChanges {
  public appConstants = AppConstants;

  /**
   * 選択済みかどうか
   */
  @Input()
  public isSelected = false;

  /**
   * Travel Solution情報
   */
  @Input()
  public boundDetails?: RoundtripFppItemBoundDetailsDataType | null;

  /**
   * Air Bound情報
   */
  @Input()
  public airBoundInfo?: Array<AirBounDisplayType>;

  /**
   * 検索条件
   */
  @Input()
  public searchCondition?: FlightSearchCondition;

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
   * 選択中TS・FF情報のAir Bound情報
   */
  @Input()
  public selectedAirBound?: RoundtripFppItemAirBoundsDataType | null;

  /**
   * 区間毎の情報
   */
  @Input()
  public boundInfo?: RoundtripFppRequestItinerariesInner[];

  /**
   * Fare Family情報
   */
  @Input()
  public fareFamilies?: Array<RoundtripFppItemFareFamilyDataTypeInner>;

  /**
   * 全Air Bound情報フィルタ後選択不可
   */
  @Input()
  public isAllUnableFareFamilyCodes?: Array<string>;

  /**
   * プロモーションが存在する検索結果リスト
   */
  @Input()
  public hasPromotionsResult?: boolean;

  /**
   * 往復種別
   */
  @Input()
  public type?: 'out' | 'return';

  /**
   * 指定したキャビンクラス
   */
  @Input()
  public cabinClass?: string;

  /**
   * Air Bound情報
   */
  public viewAirBound?: RoundtripFppItemAirBoundsDataType | null;

  @Output()
  public selectFareFamily$: EventEmitter<FareFamilyOutputType> = new EventEmitter<FareFamilyOutputType>();

  @Output()
  public showOtherFlights$: EventEmitter<any> = new EventEmitter<any>();

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
  public wiFiType?: string;

  /**
   * ACVに応じたラベルもしくは画像
   */
  public acvMessageKeyList?: Array<string>;

  /**
   * boundDetails選択済み
   */
  public isSelectedBoundDetails = false;

  /**
   * ngOnDestroyにunsubscribeを実行
   */
  private _subscriptions: Subscription = new Subscription();

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedAirBound'] && this.isSelected) {
      this.viewAirBound = this.selectedAirBound;
    }
  }

  constructor(
    private _fareSelectSvc: FareFamilySelectModalService,
    private _aswContextSvc: AswContextStoreService,
    private _masterDataService: MasterDataService,
    private _translateSvc: TranslateService,
    private _flghtDetailsModalsvc: FlightDetailsModalService
  ) {
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
        // ユーザ共通.言語情報=“ja”(日本語)
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
        if (this.boundDetails?.duration) {
          this.duration = getFormatHourTime(this.boundDetails?.duration);
        }
      })
    );
    // 乗継回数
    this.numberOfConnection = this.boundDetails?.numberOfConnection;

    // 到着日付差
    this.arrivalDaysDifference =
      this.boundDetails?.destinationArrivalEstimatedDaysDifference ||
      this.boundDetails?.destinationArrivalDaysDifference;
    // // 赤字表示要否判定
    // this.hasRedChar =
    //   !!this.boundDetails?.destinationArrivalEstimatedDaysDifference ||
    //   this.boundDetails?.destinationArrivalDaysDifference === -1 ||
    //   !!this.departureTimeNew ||
    //   !!this.destinationTimeNew;

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
    // Wi-Fiサービスアイコン
    this.wiFiType = this.boundDetails?.wiFiType;
    // boundDetails選択済み
    if (
      this.airBoundInfo?.find(
        (airBound) => !!airBound.airBoundId && airBound.airBoundId === this.selectedAirBound?.airBoundId
      )
    ) {
      this.isSelectedBoundDetails = true;
    }
    if (this.isSelectedBoundDetails && this.selectedAirBound) {
      this.viewAirBound = this.selectedAirBound;
    } else {
      this.viewAirBound = this.boundDetails?.cheapestRoundtrip;
    }
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  /**
   * FF選択表示ボタン押下
   */
  public selectFareFamily() {
    this._subscriptions.add(
      this._fareSelectSvc
        .open(
          this.boundDetails!,
          this.airBoundInfo?.filter((info) => !!info.airBoundId),
          this.itinerary,
          this.selectedAirBound,
          this.boundInfo,
          this.fareFamilies,
          this.cabinClass,
          this.isAllUnableFareFamilyCodes
        )
        .buttonClick$.subscribe((fareFamilyInfo) => {
          this.selectFareFamily$.emit(fareFamilyInfo);
        })
    );
  }

  /**
   * フライト再選択ボタン押下
   */
  public showOtherFlights() {
    this.showOtherFlights$.emit();
  }

  /**
   * フライト詳細ボタン押下
   */
  public openFlightDetails() {
    if (this.boundDetails && this.airBoundInfo) {
      this._flghtDetailsModalsvc.open(this.airBoundInfo, this.boundDetails, this.cabinClass as string);
    }
  }
}
