import { OverlayRef } from '@angular/cdk/overlay';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subscription, filter, take } from 'rxjs';
import {
  RoundtripFppItemBoundDetailsDataType,
  RoundtripFppItemFareFamilyDataTypeInner,
  RoundtripFppItemAirBoundsDataType,
  WaitlistGetSearchWaitlistResponse,
  DefaultService,
  Items11,
  RoundtripFppRequestItinerariesInner,
} from '../../sdk';
import {
  AirBounDisplayType,
  FareFamilyOutputType,
  OperatingAirlineNameType,
  OperatingAirlineType,
  FlightSearchCondition,
} from '../../interfaces';
import { MasterDataService } from '../../services';
import { AswContextStoreService, AswServiceStoreService, CommonLibService } from '@lib/services';
import { dateFormat, getFormatHourTime, isSameDay, linkToPagePost } from '../../helpers';
import { AswContextType, DeviceType, SessionStorageName } from '@lib/interfaces';
import { TranslatePrefix } from '@conf/index';
import { ModalType, BaseModalComponent } from '../base-modal/base-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { WaitlistStore, selectWaitlist, setWaitlistFromApi } from '../../store/waitlist';
import { SeatMapModalService } from '../seat-map-modal';
import { SearchFlightStoreService } from '@common/services';
import { SearchFlightStateDetails } from '@common/store';
import { AppConstants } from '@conf/app.constants';
import { isPC } from '@lib/helpers';

/** マルチエアポート区分 */
const MULTI_AIRPORT_TYPE = {
  // マルチエアポート空港
  TYPE_1: '1',
  // マルチエアポート都市
  TYPE_2: '2',
};
/** データコード */
const DATA_CODE = 'PD_002_';
/** 時刻形式 */
const DATE_FORMAT = {
  DATE_TIME_JA: 'H:mm',
  MID_NIGHT_DATE_JA: 'M月d日',
  DATE_TIME_EN: 'h:mm',
  AM_PM_EN: 'a',
  YYYY_MM_DD: 'yyyyMMdd',
};

/** 言語コード */
/** 言語コード */
const LANG_CODE = {
  JA: 'ja',
  CN: 'cn',
  HK: 'hk',
  TW: 'tw',
  KO: 'ko',
};

/**
 * FF選択モーダルComponent
 */
@Component({
  selector: 'asw-fare-family-select-modal',
  templateUrl: './fare-family-select-modal.component.html',
  styleUrls: ['./fare-family-select-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FareFamilySelectModalComponent implements OnInit, AfterViewInit, OnDestroy {
  public appConstants = AppConstants;
  /**
   * Travel Solution情報
   */
  @Input()
  public boundDetails?: RoundtripFppItemBoundDetailsDataType;

  /**
   * AirBound表示タイプ
   */
  @Input()
  public airBoundInfo?: Array<AirBounDisplayType>;

  /**
   * 検索条件.区間毎の情報
   */
  @Input()
  public itinerary?: RoundtripFppRequestItinerariesInner;

  /**
   * 選択したAir Bound情報
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
   * キャビンクラス
   */
  @Input()
  public cabinClass?: String;

  /**
   * focus要素
   */
  @Input()
  public focusElement?: any;

  /**
   * プロモーションが存在する検索結果リスト
   */
  public hasPromotionsResult = false;

  /**
   * 全Air Bound情報フィルタ後選択不可
   */
  @Input()
  public isAllUnableFareFamilyCodes?: Array<string>;

  @Output()
  public buttonClick$: EventEmitter<FareFamilyOutputType> = new EventEmitter<FareFamilyOutputType>();

  @ViewChildren('fix_height')
  public fixHeightEl?: QueryList<ElementRef>;

  /**
   * overlayRef
   */
  public overlayRef?: OverlayRef;

  /**
   * タイトル
   */
  public title = 'lebel.fareSelection';

  /**
   * モーダル種別
   */
  public modalType: ModalType = '04';

  @ViewChild(BaseModalComponent)
  public baseModal!: BaseModalComponent;

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
   * ステップ
   */
  public stepInit = 0;

  /**
   * 空席照会時空席待ち人数取得API応答
   */
  public waitlist$: Observable<WaitlistGetSearchWaitlistResponse>;

  /**
   * 空席照会時空席待ち人数
   */
  public waitlistResponse?: WaitlistGetSearchWaitlistResponse;

  public isGetWaitlistClick = false;

  /**
   * 履歴用検索条件
   */
  private _searchFlight: SearchFlightStateDetails;

  /**
   * ngOnDestroyにunsubscribeを実行
   */
  private _subscriptions: Subscription = new Subscription();
  /** ANAアプリであるか判定 */
  public isAnaApl = false;

  constructor(
    private _common: CommonLibService,
    private _store: Store<WaitlistStore>,
    private _changeDetectorRef: ChangeDetectorRef,
    private _aswContextSvc: AswContextStoreService,
    private _masterDataService: MasterDataService,
    private _translateSvc: TranslateService,
    private _seatMapSvc: SeatMapModalService,
    private _aswServiceSvc: AswServiceStoreService,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _defaultApiSvc: DefaultService,
    private _renderer: Renderer2,
    private _el: ElementRef
  ) {
    this.isAnaApl = this._common.aswContextStoreService.aswContextData.isAnaApl;
    // 履歴用検索条件
    this._searchFlight = this._searchFlightStoreService.getData();
    // 空席待ち人数取得API応答
    this.waitlist$ = this._store.pipe(
      select(selectWaitlist),
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
  public ngOnInit(): void {
    if (isPC()) {
      this.title = 'label.waitngCount';
    } else {
      this.title = 'label.selectFare.title';
    }

    this._subscriptions.add(
      this.waitlist$
        .pipe(
          filter(() => this._aswContextSvc.aswContextData.deviceType === DeviceType.PC || this.isGetWaitlistClick),
          take(1)
        )
        .subscribe((waitlistResponse) => {
          this.isGetWaitlistClick = false;
          this.waitlistResponse = waitlistResponse;
          this._changeDetectorRef.markForCheck();
        })
    );

    // 遅延情報
    this.isContainedDelayedFlight = !!this.boundDetails?.isContainedDelayedFlight;
    // 早発情報
    this.isContainedEarlyDepartureFlight = !!this.boundDetails?.isContainedEarlyDepartureFlight;
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
        this.duration = getFormatHourTime(this.boundDetails?.duration!);
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
    const airBoundInfoView = this.airBoundInfo || [];
    const arrayLength = airBoundInfoView?.length;
    // 同一グループIDのFF情報の上部に１件のみ表示する
    for (let i = 0; i < arrayLength - 1; i++) {
      let z = 1;
      for (let j = i + 1; j < arrayLength; j++) {
        if (
          this.getGroupName(airBoundInfoView?.[i].fareFamilyCode) ===
          this.getGroupName(airBoundInfoView?.[j].fareFamilyCode)
        ) {
          for (let k = j; k > i + z; k--) {
            const tempAirBoundInfo = airBoundInfoView?.[k];
            airBoundInfoView[k] = airBoundInfoView?.[k - 1];
            airBoundInfoView[k - 1] = tempAirBoundInfo;
          }
          z++;
        }
      }
    }
    if (
      this.cabinClass === 'eco' &&
      airBoundInfoView.find((airBound) => {
        airBound.cabin === 'first';
      })
    ) {
      for (let i = 0; i < arrayLength; i++) {
        if (airBoundInfoView?.[i].cabin === 'first') {
          for (let j = i; j < arrayLength - 1; j++) {
            const tempAirBoundInfo = airBoundInfoView?.[j];
            airBoundInfoView[j] = airBoundInfoView?.[j + 1];
            airBoundInfoView[j + 1] = tempAirBoundInfo;
          }
        }
      }
    }
    this.airBoundInfo = airBoundInfoView;
  }

  public modalAfterViewInit(event: boolean) {
    // 国内の場合、必要がありません（do nothing）
  }

  public ngAfterViewInit(): void {
    if (this.airBoundInfo && this.airBoundInfo.length > 1) {
      let fixHeightElCount = 3;
      if (this.boundDetails?.segments) {
        fixHeightElCount = this.boundDetails?.segments && this.boundDetails?.segments.length + fixHeightElCount;
      }
      for (let i = 0; i < fixHeightElCount; i++) {
        let heightMax = 0;
        const element = this._el.nativeElement.querySelectorAll(`.js-fix-height-${i + 1}`);
        element.forEach((el: HTMLElement) => {
          if (el.offsetHeight > heightMax) {
            this._renderer.setStyle(el, 'height', '');
            heightMax = el.offsetHeight;
          }
        });
        element.forEach((el: HTMLElement) => {
          this._renderer.setStyle(el, 'height', `${heightMax}px`);
        });
      }
    }
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  /**
   * 空席待ち人数取得リンク押下処理
   */
  public getWaitlist() {
    this.isGetWaitlistClick = true;
    const call = this._defaultApiSvc.searchWaitlistGet(
      this.boundDetails?.originDepartureDateTime as string,
      this.boundDetails?.segments[0].marketingAirlineCode as string,
      this.boundDetails?.segments[0].marketingFlightNumber as string
    );
    this._store.dispatch(setWaitlistFromApi({ call }));
  }

  /**
   * FF選択モーダル閉じるボタン押下処理
   */
  public close() {
    this.baseModal.close();
  }

  /**
   * 金額取得
   * @param airBoundInfo Air Bound情報
   * @returns
   */
  public getPrice(airBoundInfo?: RoundtripFppItemAirBoundsDataType) {
    return `${airBoundInfo?.airBound?.prices?.totalPrice?.price?.currencyCode}${airBoundInfo?.airBound?.prices?.totalPrice?.price?.total}`;
  }

  /**
   * 総金額取得
   * @param airBoundInfo Air Bound情報
   * @returns
   */
  public getTotalPrice(airBoundInfo?: RoundtripFppItemAirBoundsDataType) {
    return airBoundInfo?.airBound?.prices?.totalPrice;
  }

  /**
   * プロモーション適用済アイコン
   * @param airBoundInfo
   * @returns
   */
  public showPromotionIcon(airBoundInfo?: RoundtripFppItemAirBoundsDataType) {
    const showIcon =
      !!this.getTotalPrice(airBoundInfo)?.discount?.originalTotal ||
      !!this.getTotalPrice(airBoundInfo)?.discount?.aamDiscountCode ||
      !!this.getTotalPrice(airBoundInfo)?.discount?.cat25DiscountName;
    if (showIcon) {
      this.hasPromotionsResult = true;
    }
    return showIcon;
  }

  /**
   * イベント選択
   * @param selectedAirBoundInfo 選択したAir Bound情報
   */
  public selectEvent(selectedAirBoundInfo: RoundtripFppItemAirBoundsDataType) {
    this.baseModal.close();
    this.buttonClick$.emit({
      selectedAirBoundInfo: selectedAirBoundInfo,
      boundDetails: this.boundDetails as RoundtripFppItemBoundDetailsDataType,
      airBoundInfo: this.airBoundInfo as Array<AirBounDisplayType>,
    });
  }

  /**
   * グループ名称取得
   * @param fareFamilyCode Fare Family Code
   * @returns
   */
  public getGroupName(fareFamilyCode?: string): string {
    const groupId = this.fareFamilies?.find((farefamily) => farefamily.fareFamilyCode === fareFamilyCode)
      ?.fareFamilyWithService?.groupId;
    // ユーザ共通.言語情報毎の、データコード=”PD_002”(表示用クラス名称)とvalue=クラス名称コード(※)に紐づく、汎用マスターデータ(リスト).表示内容
    return `${TranslatePrefix.LIST_DATA}${DATA_CODE}${groupId}`;
  }

  /**
   * Air Bound情報.選択済みAir Bound
   * @param airBound Air Bound情報
   * @returns
   */
  public isSelected(airBound: RoundtripFppItemAirBoundsDataType): boolean {
    return this.selectedAirBound?.airBoundId === airBound.airBoundId;
  }

  /**
   * フライト番号リスト
   * @returns
   */
  public get flightNoList(): string {
    const flightNoList: Array<string> = [];
    this.boundDetails?.segments.forEach((segment) => {
      flightNoList.push(`${segment.marketingAirlineCode}${segment.marketingFlightNumber}`);
    });
    return flightNoList.join(',');
  }

  /**
   * 運航キャリア名称を取得する
   */
  public getOperatingAirlineName(name: OperatingAirlineNameType) {
    return this._masterDataService.getInTimeCarrierName(name.operatingCode, name.operatingName);
  }

  /**
   * シートマップリンク押下処理
   * @param event イベント
   */
  public openSeatMap(ffcode: string, ffInfo?: RoundtripFppItemFareFamilyDataTypeInner) {
    if (this.boundDetails?.numberOfConnection === 0) {
      this._seatMapClickHandle(this.boundDetails.segments?.[0], ffcode);
    } else {
      const ref = this._seatMapSvc.open(
        this.isAllUnableFareFamilyCodes,
        {},
        [],
        this.boundDetails,
        ffInfo,
        this.airBoundInfo
      );
      this._subscriptions.add(
        ref.seatMap$.subscribe((data: { segment: Items11; ffCode: string }) => {
          this._seatMapClickHandle(data.segment, ffcode);
        })
      );
    }
  }

  /**
   * シートマップ(参照)(S03-P030)表示処理
   * @param segment セグメント情報
   * @param ffcode Fare Family Code
   */
  private _seatMapClickHandle(segment: Items11, ffcode: string) {
    const { orderId, firstName, lastName } = this._aswServiceSvc.aswServiceData;
    const pagePostParams = {
      marketingAirlineCode: segment?.marketingAirlineCode,
      marketingFlightNumber: segment?.marketingFlightNumber,
      originLocationCode: segment?.departure?.locationCode,
      destinationLocationCode: segment?.arrival?.locationCode,
      bookingClass: (this.airBoundInfo?.find((airBound) => airBound.fareFamilyCode === ffcode) as any)?.[segment.id]
        ?.service?.bookingClass,
      departureDate: dateFormat(segment?.departure?.dateTime, DATE_FORMAT.YYYY_MM_DD),
      JSessionId: sessionStorage.getItem(SessionStorageName.JSESSION_ID),
      amcMemberNumber: !this._common.isNotLogin()
        ? this._common.amcMemberStoreService.amcMemberData.iFlyMemberInfo?.membershipNumber
        : '',
      numberOfADT: this._searchFlight.traveler.adt,
      numberOfB15: this._searchFlight.traveler.b15,
      numberOfCHD: this._searchFlight.traveler.chd,
      numberOfINF: this._searchFlight.traveler.inf,
      fareFamilyCode: ffcode,
      fareFamilyOwnerAirlineCode: this.appConstants.CARRIER.TWO_LETTER,
      orderId: orderId || '',
      firstName: firstName || '',
      lastName: lastName || '',
      CONNECTION_KIND: 'ZZZ',
      LANG: this._aswContextSvc.aswContextData.lang,
    };
    linkToPagePost('servicing/informative-seatmap', pagePostParams, '_blank');
  }

  /**
   * 利用不可静的文言鍵
   * @param airBound Air Bound情報
   * @returns
   */
  public isUnavailableTranslateKey(airBound: RoundtripFppItemAirBoundsDataType): string {
    if (airBound.unavailableReason === RoundtripFppItemAirBoundsDataType.UnavailableReasonEnum.UnavailableJuniorPilot) {
      return 'label.noVacancy1';
    }

    return 'label.noVacancy';
  }

  /**
   * Fare Family情報取得
   * @param fareFamilyCode Fare Family Code
   * @returns
   */
  public getFareFamilyInfo(fareFamilyCode?: string) {
    return this.fareFamilies?.find((farefamily) => farefamily.fareFamilyCode === fareFamilyCode);
  }

  /**
   * priorityCodeに紐づくFF Priority Code.国内用FF URLを取得する
   *
   * @param priorityCode プライオリティコード
   * @returns 国内用FF URL
   */
  public getFFUrl(priorityCode: string) {
    return this._masterDataService.getFFUrlByPriorityCode(priorityCode);
  }

  /**
   *  シートマップの表示フラグ
   */
  public get showSeatMap(): boolean {
    // a. セグメント情報.isNhGroupOperated＝true(NHグループ運航)
    if (this.boundDetails?.segments.some((item) => item.isNhGroupOperated)) {
      return true;
    }
    return false;
  }

  /**
   * フライト番号
   * @returns
   */
  public getFlightNo(segment?: Items11) {
    return `${segment?.marketingAirlineCode}${segment?.marketingFlightNumber}`;
  }

  /**
   * キャビンクラス名称キー
   * @param cabin キャビンクラス
   * @returns
   */
  public getCabinKey(cabin?: string): string {
    return `${TranslatePrefix.LIST_DATA}PD_930_R-domestic-${cabin}`;
  }

  /**
   * 総金額
   * @returns
   */
  public total(boundInfo: AirBounDisplayType): string {
    return `${boundInfo.airBound?.prices?.totalPrice?.price?.total}${boundInfo.airBound?.prices?.totalPrice?.price?.currencyCode}`;
  }

  public newTimeDisplay(dateTime?: string, estimatedDateTime?: string): boolean {
    if (dateTime && estimatedDateTime && isSameDay(dateTime, estimatedDateTime)) {
      // 時分フォーマットで表示
      return true;
    }
    // 月日＋時分フォーマットで表示
    return false;
  }

  /**
   * カンマで連結された運航キャリア名称
   */
  public get contactOperatingAirlinesName() {
    return this._masterDataService.contactOperatingAirlinesName(this.operatingAirlinesArray);
  }
}
