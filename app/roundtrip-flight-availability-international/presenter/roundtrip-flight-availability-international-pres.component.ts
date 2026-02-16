import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  Output,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { SortConditionData } from '@common/components/shopping/sort-condition/sort-condition.state';
import { SupportComponent } from '@lib/components/support-class';
import {
  CommonLibService,
  ErrorsHandlerService,
  DialogDisplayService,
  PageInitService,
  ModalService,
} from '@lib/services';
import {
  AirOfferInfo,
  Bound,
  FlightDetail,
  PresenterProps,
  ShowProps,
  FlightSummary,
  TSList,
} from './roundtrip-flight-availability-international-pres.state';
import { Observable } from 'rxjs/internal/Observable';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { FlightDetailModalService } from '@common/components/shopping/flight-detail/flight-detail-modal.service';
import { FareFamilySelectorModalService } from '../../../common/components/shopping/fare-family-selector/fare-family-selector-modal.service';
import { CheapestCalendarMatrixModalService } from '../sub-components/cheapest-calendar-matrix/cheapest-calendar-matrix-modal.service';
import { CheapestCalendarData } from '../sub-components/cheapest-calendar-matrix/cheapest-calendar-matrix-modal.state';
import { isTB, isSP, isPC } from '@lib/helpers';
import { CabinClassSelectorModalService } from '@common/components/shopping/cabin-class-selector/cabin-class-selector-modal.service';
import { CabinClassSelectorData } from '@common/components/shopping/cabin-class-selector/cabin-class-selector.state';
import { FareTypeSelectorModalService } from '@common/components/shopping/search-flight/fare-type-selector/fare-type-selector-modal.service';
import { FilterConditionModalService } from '@common/components/shopping/filter-condition/filter-condition-modal.service';
import { SortConditionModalService } from '@common/components/shopping/sort-condition/sort-condition-modal.service';
import { PaymentDetailModalService } from '@common/components/shopping/payment-detail/payment-detail-modal.service';
import { RoundtripFlightAvailabilityInternationalContComponent } from '@app/roundtrip-flight-availability-international/container/roundtrip-flight-availability-international-cont.component';
import { updateDynamicSubjectPageContext } from '@app/roundtrip-flight-availability-international/container//roundtrip-flight-availability-international-cont.state';
import { CreateCartRequest } from 'src/sdk-reservation';
import { CriteoAlignmentService } from '@common/services';
import { CurrentCartStoreService } from '@common/services/store/common/current-cart-store/current-cart-store.service';
import { DialogClickType, LoginStatusType, PageType } from '@lib/interfaces';
import { DeliveryInformationStoreService } from '@common/services/store/common/delivery-information-store/delivery-information-store.service';
import { PaymentDetailData } from '@common/components/shopping/payment-detail/payment-detail.state';
import { FilterConditionData, FlightUpgradeInfo } from '@common/interfaces';
import { NumberOfTravelers, RoundtripOwdRequest } from 'src/sdk-search';
import { RoundtripFlightAvailabilityInternationalService } from '@common/services/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.service';
import { RoundtripFlightAvailabilityInternationalState } from '@common/store/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.state';
import {
  AirOffer,
  AirOffers,
  DepartureFareFamily,
  FareFamilies,
  ReturnFareFamily,
  ReturnTravelSolution,
} from '@common/interfaces/shopping/roundtrip-owd';
import { CommonSliderComponent } from '@common/components/shopping/common-slider/common-slider.component';
import { RoundtripFlightAvailabilityInternationalContService } from '../container/roundtrip-flight-availability-international-cont.service';
import { DOCUMENT } from '@angular/common';
import { RoundtripOwdState } from '@common/store/roundtrip-owd';
import { CreateCartRequestSearchAirOfferItinerariesInner } from 'src/sdk-reservation/model/createCartRequestSearchAirOfferItinerariesInner';
import { CriteoAlignmentInfo } from '@common/components/shopping/criteo-alignment/criteo-alignment.state';
import { RoundtripFlightAvailabilityInternationalPresService } from './roundtrip-flight-availability-international-pres.service';
import { PatchUpdateAirOffersRequest } from 'src/sdk-reservation';
import { RoundtripOwdResponseDataAirOffersInnerBoundsInnerFlightsInner } from 'src/sdk-search/model/roundtripOwdResponseDataAirOffersInnerBoundsInnerFlightsInner';
import { RoundtripOwdDisplayService } from '@common/services/roundtrip-owd-display/roundtrip-owd-display-store.service';
import { debounceTime, filter, timer } from 'rxjs';
import { StaticMsgPipe } from '@lib/pipes';
import { AmcLoginComponent } from '@lib/components/shared-ui-components/amc-login/amc-login.component';
import { AmcLoginHeaderComponent } from '@lib/components/shared-ui-components/amc-login/amc-login-header.component';

type DeviceType = 'PC' | 'SP' | 'TAB';
@Component({
  selector: 'asw-roundtrip-flight-availability-international-pres',
  templateUrl: './roundtrip-flight-availability-international-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CommonSliderComponent, DialogDisplayService, DeliveryInformationStoreService],
  styleUrls: ['./roundtrip-flight-availability-international-pres.component.scss'],
})
export class RoundtripFlightAvailabilityInternationalPresComponent
  extends SupportComponent
  implements AfterViewInit, AfterViewChecked
{
  public readonly JS_CLASS_TOP_NAME = 'js-class-top';
  // 画面用のstoreの利用
  private _roundtripFlightAvailabilityStoreData =
    this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData;
  /** FFヘッダ部に表示のキャビンクラスを取得する変数 */
  @ViewChildren('cabinClassHeadList', { read: ElementRef<HTMLElement> }) cabinClassHeadList!: QueryList<
    ElementRef<HTMLElement>
  >;
  /** FFヘッダ部に表示のFF名称を取得する変数 */
  @ViewChildren('fareFamilyNameList', { read: ElementRef<HTMLElement> }) fareFamilyNameList!: QueryList<
    ElementRef<HTMLElement>
  >;

  /** ７日間カレンダースクロールの要素を取得する変数 */
  @ViewChild('scrollPanel') scrollPanel?: ElementRef;
  @ViewChildren('scrollPanel') scrollPanelList?: QueryList<ElementRef>;
  @ViewChildren('scrollItemList') scrollItemList?: QueryList<ElementRef>;

  /** 選択中TS・FF情報の要素を取得する変数 */
  @ViewChildren('tsList', { read: ElementRef }) tsList?: QueryList<ElementRef>;
  @ViewChildren('tsListNotPC', { read: ElementRef }) tsListNotPC?: QueryList<ElementRef>;

  /** コンテナから渡される引数 */
  public _props?: PresenterProps;

  // 選択AirOfferId
  private selectAirOfferId: string = '';
  // 選択AirOffer情報
  private selectAirOfferInfo: AirOffer = {};

  @Input()
  set props(data: PresenterProps | undefined) {
    this._props = data;
    this.showPropsList = this.props?.showPropsList;
    this.cheapestCalendarData = this.props?.cheapestCalendarData;
    this.isShowFooter = this.props?.isShowFooter ?? false;
    this.activeFooterBtn = this.props?.activeFooterBtn ?? false;
    this.selectedAirOffer = this.props?.selectedAirOffer;
    this.filterConditionData = this.props?.filterConditionData;
    this.initialFilterConditionData = this.props?.initialFilterConditionData;
    this.selectedSortConditionData = this.props?.sortConditionData;
    this._ffNameMap = this.props?.ffNameMap;
    this.cffListLength = this.props?.cffList ? Object.keys(this.props?.cffList).length : 0;
    this.selectedCabinClass = this.props?.selectedCabinClass;
    this.selectedFareOptionType = this.props?.selectedFareOptionType;
    this.searchDateTimeString = this.props?.searchedDateTime ?? '';
    this.tripTypeList = this.props?.tripTypeList;
    this._changeDetectorRef.markForCheck();
  }

  get props(): PresenterProps {
    return this._props!;
  }

  /** 選択中TS・FF情報の下にある、フライト再選択ボタンのイベント
   * 戻り値：number バウンド番号
   */
  @Output()
  public clickShowOtherFlightsEvent: EventEmitter<number> = new EventEmitter<number>();

  /** 検索ボタン押下時出力 */
  @Output()
  public nextFlow = new EventEmitter<Event>();

  /** ウィンドウサイズの変更を監視するObservable */
  private resizeEvent!: Observable<Event>;

  // 画面描画用変数
  /** 画面描画用 検索条件 */
  public searchFlightCondition!: Object;
  /** 画面描画用 検索実行時刻 */
  public searchDateTimeString: string = '';
  /** 画面描画用 往復空席バウンドリスト */
  public roundTripBoundList?: Bound[];
  public showPropsList?: Array<ShowProps> = [];
  /** 画面描画用 マトリクス形式7日間カレンダーモーダル画面描画用データ */
  private cheapestCalendarData!: CheapestCalendarData;
  /** 画面描画用 検索結果フッタ表示情報フラグ */
  public isShowFooter: boolean = false;
  /** 画面描画用 選択済みairOffer情報 (検索結果フッタ・金額内訳モーダル) */
  public selectedAirOffer?: AirOfferInfo;
  /** 画面描画用 選択済みソート条件 */
  public selectedSortConditionData!: SortConditionData;
  /** 画面描画用 バウンド毎のフィルタ項目 */
  private filterConditionData!: FilterConditionData;
  /** 画面描画用 初期フィルタ項目 */
  private initialFilterConditionData!: FilterConditionData;
  /** フライト詳細の展開状態 */
  public isOpenFlightDetailMap: { [key: string]: boolean } = {};
  /** 画面表示の切り替えフラグ PCの場合true */
  public isPcDevice: boolean = true;
  /** 端末種別 画面サイズで判定 */
  public deviceTypeFromSize: DeviceType = 'PC';
  /** デバイス判定のための変数 */
  public isSP = isSP(); // スマホかどうか
  /** フィルタ条件モーダルの表示非表示 */
  public isShowFilter: boolean = true;
  /** ソート条件モーダルの表示非表示 */
  public isShowSort: boolean = true;
  /** マトリクス形式7日間カレンダーの表示非表示 */
  public isShowCalendar: boolean = true;
  /** キャビンクラス切替ボタンの表示非表示 */
  public selectedCabinClass: string = '';
  /** 運賃オプション切替ボタンの表示非表示 */
  public selectedFareOptionType: string = '';
  /** 運賃オプションリスト */
  public cffListLength: number = 0;
  /** お気に入り追加ボタンの表示非表示 */
  public isShowFavorite: boolean = true;
  /** FF概要の表示に表示 ※初期表示true */
  public isOpenFareOverview: boolean[] = [true, true];
  // ７日間カレンダースクロールの有無
  public isAirCalendarSlider: boolean = true;
  // 右スクロールボタン押下時
  public isRightClicked: boolean = false;
  // 右スクロールボタンの表示形式
  public hideRightBtn: boolean = false;
  // 左スクロールボタンの表示形式
  public hideLeftBtn: boolean = false;
  // 指定要素のLeft値を取得
  public elementLeft: number = 0;

  // 復路の選択中のTS別FF情報のy軸位置を取得
  public yPosition: number = 0;
  // 復路の選択中のTS別FF情報の表示による活性有無(非活性=true、活性=false)
  public activeFooterBtn?: boolean;
  // 復路スクロール済み
  public completedReturnScroll: boolean = false;
  /** 搭乗者人数 */
  public traveler: NumberOfTravelers = { ADT: 0, B15: 0, CHD: 0, INF: 0 };
  /** 画面表示用 搭乗者人数 */
  public travelersLabel: string = '';
  /** FF名称マップ */
  public _ffNameMap: Map<string, string> = new Map();
  /** ANAカウチ利用可否表示フライトIndexリスト */
  public anaCouchIsEnabledFlightIndexList: number[] = [];
  /** 国内旅程か国際旅程か（国内旅程であればtrue） */
  public isDomesticTrip: boolean = false;

  /** 往復空席照会結果(国際)画面のStore */
  private _R01P030Store: RoundtripFlightAvailabilityInternationalState = {};

  /** 指定日検索結果有無 */
  public isSearchResultOfSpecifiedDate: boolean = false;

  /** リクエスト条件 */
  public roundtripOwdRequest?: RoundtripOwdRequest;

  /** 往復指定日空席照会(OWD)用レスポンス */
  private _owd: RoundtripOwdState = { requestIds: [] };

  /** criteo連携情報 */
  public criteoAlignmentInfo: CriteoAlignmentInfo = {};

  /**
   * キャビンクラスが表示されているindex
   * @remarks ヘッダ生成~TS別FF情報生成中に参照するのでViewChildrenだと追加処理が間に合わない恐れがある
   */
  private cabinClassHeaderIndex: { [bound: number]: number[] } = { 0: [], 1: [] };

  /** ヘッダー色判定用リスト */
  public tripTypeList: string[] = [];

  constructor(
    protected _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _flightDetailModalService: FlightDetailModalService,
    private _fareTypeSelectorModalService: FareTypeSelectorModalService,
    private _fareFamilySelectorModalService: FareFamilySelectorModalService,
    private _cheapestCalendarMatrixModalService: CheapestCalendarMatrixModalService,
    private _cabinClassSelectorModalService: CabinClassSelectorModalService,
    private _sortConditionModalService: SortConditionModalService,
    private _filterConditionModalService: FilterConditionModalService,
    private _paymentDetailModalService: PaymentDetailModalService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _roundtripFlightAvailabilityInternationalService: RoundtripFlightAvailabilityInternationalService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _deliveryInfoStoreService: DeliveryInformationStoreService,
    private _dialogSvc: DialogDisplayService,
    private _roundtripFlightAvailabilityInternationalContComponent: RoundtripFlightAvailabilityInternationalContComponent,
    private _commonSliderComponent: CommonSliderComponent,
    private _roundtripOwdDisplayService: RoundtripOwdDisplayService,
    private _roundtripFlightAvailabilityInternationalPresService: RoundtripFlightAvailabilityInternationalPresService,
    private _roundtripFlightAvailabilityService: RoundtripFlightAvailabilityInternationalContService,
    @Inject(DOCUMENT) private document: Document,
    private _criteoAlignmentService: CriteoAlignmentService,
    protected _pageInitService: PageInitService,
    private _staticMsg: StaticMsgPipe,
    private _modalService: ModalService,
    private _el: ElementRef,
    private _renderer: Renderer2
  ) {
    super(_common);
    // 画面表示用データの取得
    this.subscribeService(
      '_roundtripOwdDisplay',
      this._roundtripOwdDisplayService.getRoundtripOwdDisplayObservable(),
      (response) => {
        this._owd = response;
      }
    );
    // P030Storeの取得
    this.subscribeService(
      'getStoreInfo',
      this._roundtripFlightAvailabilityInternationalService.getRoundtripFlightAvailabilityInternationalObservable(),
      (data) => {
        // リクエスト用検索条件が設定済みか
        const isRequestDataExists = !!data.roundtripOwdRequest?.itineraries?.[0].departureDate;
        // 履歴用検索条件が設定済みか
        const isSearchDataExists =
          !!data.searchFlight?.roundTrip?.departureDate || !!data.searchFlight?.onewayOrMultiCity?.[0]?.departureDate;
        // リクエスト用検索条件、履歴用検索条件のいずれかでも初期化されていない場合処理を行わない
        if (!isRequestDataExists && !isSearchDataExists) {
          return;
        }
        this.isSearchResultOfSpecifiedDate = data.isSearchResultOfSpecifiedDate ?? false;
        this.roundtripOwdRequest = data.roundtripOwdRequest;
        this._R01P030Store = data;
        this.isSearchResultOfSpecifiedDate = this._R01P030Store.isSearchResultOfSpecifiedDate ?? false;
        this.roundtripOwdRequest = this._R01P030Store.roundtripOwdRequest;
        this.selectAirOfferId = this._R01P030Store.selectAirOfferId ?? '';
        this.selectAirOfferInfo = this._R01P030Store.selectAirOfferInfo ?? {};
        this.isDomesticTrip = this._R01P030Store.searchResultItineraryType === 'domestic' ? true : false;
        this.traveler = this._R01P030Store.roundtripOwdRequest?.travelers ?? { ADT: 0, B15: 0, CHD: 0, INF: 0 };
        this._roundtripFlightAvailabilityStoreData = data;
        this.criteoAlignmentInfo = this._criteoAlignmentService.createCriteoAlignmentInfo();

        // 動的文言判定用情報
        const displayInfoJson = this._roundtripFlightAvailabilityInternationalPresService.createDisplayInfoJSON(
          this._R01P030Store.roundtripOwdRequest?.itineraries ?? [],
          this._R01P030Store.searchFlight,
          this.isDomesticTrip,
          false
        );
        updateDynamicSubjectPageContext(displayInfoJson);

        // 搭乗者人数のラベル更新
        this.updateTravelersLabel();
      }
    );
  }

  reload(): void {}

  init(): void {
    this.isShowCalendar = this.showPropsList !== undefined ? this.showPropsList.length > 1 : false;
    this.selectedSortConditionData = this.props?.sortConditionData;
    this.updateViewByDeviceType();
    this.getIsRegisteredFavorite();
  }

  destroy(): void {
    this.deleteSubscription('RoundtripFlightAvailabilityInternationalPresComponent-resize');
    this.deleteSubscription('_roundtripOwdDisplay');
    this.deleteSubscription('getStoreInfo');
  }

  ngAfterViewInit(): void {
    this.criteoAlignmentInfo = this._criteoAlignmentService.createCriteoAlignmentInfo();

    // 後述ソートで使用するindex取得関数(ngIfで飛ばされた要素も含めて採番しているため、ソート以外使用禁止)
    const getIndex = (element: ElementRef<HTMLElement>) => {
      return Number(element.nativeElement.dataset['index']);
    };

    // ViewChildrenの順序を保証するためのソート関数
    const sorter = (a: ElementRef<HTMLElement>, b: ElementRef<HTMLElement>) => {
      return getIndex(a) - getIndex(b);
    };

    // FFヘッダ部のキャビンクラス名の表示位置をFF名称の部品と揃える処理(イベント発火で実行するため、関数定数として定義)
    const resizeFunc = () => {
      if (this.showPropsList !== undefined) {
        // boundごとに処理
        this.showPropsList.forEach((_, boundIndex) => {
          // boundごとのFFヘッダ.FF情報.キャビンクラスのHTML要素
          const cabinList = this.cabinClassHeadList
            .filter((v) => Number(v.nativeElement.dataset['boundIndex']) === boundIndex)
            .sort(sorter);
          // (boundごとのFFヘッダ.FF情報.FF名称のうち、)'js-class-top'classが付与されたHTML要素(先頭FFリスト)
          const fareFamilyList = this.fareFamilyNameList
            .filter(
              (v) =>
                Number(v.nativeElement.dataset['boundIndex']) === boundIndex &&
                v.nativeElement.classList.contains(this.JS_CLASS_TOP_NAME)
            )
            .sort(sorter);

          fareFamilyList.forEach((v, index, array) => {
            // 先頭FFリストを最後の要素の1つ前までループ
            if (index !== array.length - 1) {
              // 次の要素の左座標 - 当該要素の左座標を表示幅とし
              const leftX = v.nativeElement.getBoundingClientRect().left;
              const nextLeftX = fareFamilyList[index + 1].nativeElement.getBoundingClientRect().left;
              const width = nextLeftX - leftX;
              // 当該繰り返しインデックスのキャビンクラス表示要素のCSSにwidthとして求めた表示幅を設定する
              const cabinElement = cabinList[index]!;
              cabinElement.nativeElement.style.width = `${width}px`;
            }
          });
        });
      }
    };

    // 初回の実行(AfterViewInit段階でもHTML要素が完全に生成されていないため、要素生成されてListが更新されるのを待機。より後に生成されるFF名称をSubscribe)
    this.subscribeService(
      'RoundtripFlightAvailabilityInternationalPresComponent-DOMContentLoaded',
      this.fareFamilyNameList.changes,
      () => {
        resizeFunc();
      }
    );

    // 画面サイズ変更を監視し、変更の度に処理を実行する
    this.resizeEvent = fromEvent(window, 'resize').pipe(debounceTime(200));
    this.subscribeService('RoundtripFlightAvailabilityInternationalPresComponent-resize', this.resizeEvent, () => {
      resizeFunc();
      this.updateViewByDeviceType();
      this._changeDetectorRef.detectChanges();
    });
  }

  ngAfterViewChecked(): void {
    if (this._commonSliderComponent) {
      this._commonSliderComponent.scrollPanel = this.scrollPanel;
      this._commonSliderComponent.scrollPanelList = this.scrollPanelList;
      this._commonSliderComponent.scrollItemList = this.scrollItemList;
      this._commonSliderComponent.isAirCalendarSlider = this.isAirCalendarSlider;

      if (this.scrollPanel) {
        const scrollPanelRect = this.scrollPanel.nativeElement.getBoundingClientRect();
        this.elementLeft = scrollPanelRect.left;
        this._commonSliderComponent.elementLeft = scrollPanelRect.left;
      }
    }
    if (this.tsList) {
      // PC版：復路の選択中のTS別FF情報のy軸位置を取得 往路・復路がともに選択された場合のみ、tslistのlengthが2になる
      if (this.tsList.length === 2) {
        const firstElement = this.tsList.last.nativeElement;
        this.yPosition = firstElement.getBoundingClientRect().bottom;
        this.completedReturnScroll = false;
      }
    }
    // TAB,SP版
    if (this.tsListNotPC) {
      if (this.tsListNotPC.length === 2) {
        const firstElement = this.tsListNotPC.last.nativeElement;
        this.yPosition = firstElement.getBoundingClientRect().bottom;
        this.completedReturnScroll = false;
      }
    }
    if (this.isOpenFareOverview.find((display) => display)) {
      timer(0).subscribe(() => {
        this._headHeightCalc();
      });
    }

    // 画面下部固定フローティングナビの高さを取得
    const bottomFloat = this.document.getElementsByClassName('l-bottom-float');
    const bottomFloatHeight = window.getComputedStyle(bottomFloat[0]).height;
    // 取得した値 + 8pxをdiv.l-containerのpadding-bottom値として設定
    const containerEl = this.document.getElementById('anchor-page-top');
    this._renderer.setStyle(
      containerEl,
      'padding-bottom',
      `${(Number(bottomFloatHeight.replace('px', '')) + 8).toString()}px`
    );
  }

  /**
   * ウィンドウのサイズ変更イベントをリッスンする
   */
  @HostListener('window:resize')
  public onResize() {
    this._headHeightCalc();
  }

  /**
   * FFヘッダ高さの計算
   */
  private _headHeightCalc() {
    for (let i = 0; i < 2; i++) {
      let contentsStr = '.p-vacant-seat01__overview-contents' + i;
      let headingStr = '.p-vacant-seat01__overview-heading' + i;
      const overviewContents = this._el.nativeElement.querySelectorAll(contentsStr);
      const overviewContentsLength = overviewContents.length;
      if (overviewContentsLength > 0) {
        const childrenLength = overviewContents[0].children.length;
        let heights: Array<number> = Array(childrenLength).fill(0);
        for (let i = 0; i < overviewContentsLength; i++) {
          for (let j = 0; j < childrenLength; j++) {
            if (overviewContents[i]?.children?.[j]?.children?.[1]?.offsetHeight > heights[j]) {
              heights[j] = overviewContents[i]?.children?.[j]?.children?.[1]?.offsetHeight;
            }
          }
        }
        const overviewHead = this._el.nativeElement.querySelector(headingStr);
        heights.forEach((height, i) => {
          if (height > 0) {
            this._renderer.setStyle(overviewHead.children?.[i], 'height', `${height}px`);
            for (let j = 0; j < overviewContentsLength; j++) {
              this._renderer.setStyle(overviewContents[j]?.children?.[i], 'height', `${height}px`);
            }
          }
        });
      }
    }
  }

  // フライトサマリ初期化用
  public settingFlightSummary: FlightSummary = {
    boundIndex: 0,
    travelSolutionId: '',
    isSelected: true,
    departureAirport: '',
    arrivalAirport: '',
    isContainedDelayedFlight: false,
    isContainedEarlyDepartureFlight: false,
    originDepartureDateTime: '',
    originDepartureEstimatedDateTime: '',
    isLateNightDeparture: false,
    numberOfConnections: 0,
    durationTime: '',
    destinationArrivalDateTime: '',
    destinationArrivalEstimatedDateTime: '',
    destinationArrivalDaysDifference: '',
    isAllNhGroupOperated: false,
    isAllStarAllianceOperated: false,
    operatingAirlineNameList: [],
    isContainedSubjectToGovernmentApproval: false,
    labelFromAcvList: [],
    wifiType: undefined,
    lowestPrice: 0,
    departureMultiAirportFlg: false,
    arrivalMultiAirportFlg: false,
  };

  /**
   * キャビンクラス切替ボタン押下時処理
   */
  public openCabinClassModal() {
    if (
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData
        .searchResultItineraryType
    ) {
      const input: CabinClassSelectorData = {
        selectedCabinClassType: this.selectedCabinClass,
        flightType:
          this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData
            .searchResultItineraryType,
      };
      this._cabinClassSelectorModalService.openModal(input);
    }
  }

  /**
   * 運賃オプション切替ボタン押下時処理
   */
  public openFareOptionTypeModal() {
    this._fareTypeSelectorModalService.openModal(
      this.selectedFareOptionType,
      this.selectedCabinClass,
      this.isDomesticTrip
    );
  }

  /**
   * お気に入り追加ボタン押下時処理 ※検索結果操作部
   * @param フライト検索の入力情報
   * @param 画面ID
   */
  public addFavorite() {
    this._roundtripFlightAvailabilityInternationalPresService.addFavorite(
      this._roundtripFlightAvailabilityStoreData.searchFlight,
      'P030'
    );
  }

  /**
   * ログインステータスを判断する
   * ログインしていればtrue
   */
  public getLoginStatus() {
    return !this._common.isNotLogin();
  }

  public isRegisteredFavorite!: boolean;

  /**
   * お気に入り登録済みか否かの情報を取得
   * お気に入り登録済みであればtrue
   */
  public getIsRegisteredFavorite() {
    const storeInfo =
      this._roundtripFlightAvailabilityInternationalService.getRoundtripFlightAvailabilityInternationalObservable();
    this.subscribeService('get isRegisterdFavoite', storeInfo, (data) => {
      this.isRegisteredFavorite = !!data.isRegisteredFavorite;
    });
    return this.isRegisteredFavorite;
  }

  /**
   * フライト詳細アコーディオンの開閉状態を反転する
   *
   * @param boundIndex バウンドインデックス
   * @param tsListIndex TSインデックス
   */
  public changeOpenFlightDetail(boundIndex: number, tsListIndex: number) {
    const key = this.getKeyOfOpenFlightDetailMap(boundIndex, tsListIndex);
    this.isOpenFlightDetailMap[key] = !this.isOpenFlightDetailMap[key];
  }

  /**
   * フライト詳細モーダルを開く
   *
   * @param boundIndex バウンドインデックス
   * @param tsListIndex TSインデックス
   */
  public openFlightDetailModal(boundIndex: number, tsListIndex: number) {
    const flightDetail: FlightDetail = {
      flightDetailHeader: this.props?.showPropsList[boundIndex]?.tsList![tsListIndex]?.flightDetailHeader,
      flightDetailSegment: this.props?.showPropsList[boundIndex]?.tsList![tsListIndex]?.flightDetailSegment,
    };
    this._flightDetailModalService.openModal(flightDetail);
  }

  /**
   * フライト詳細アコーディオンの表示状態を取得する
   *
   * @param boundIndex バウンドインデックス
   * @param tsListIndex TSインデックス
   * @returns 表示状態
   */
  public isOpenFlightDetail(boundIndex: number, tsListIndex: number): boolean {
    const key = this.getKeyOfOpenFlightDetailMap(boundIndex, tsListIndex);
    return this.isOpenFlightDetailMap[key] ?? false;
  }

  /**
   * フライト詳細アコーディオンのキー値を出力する
   *
   * @param boundIndex バウンドインデックス
   * @param tsListIndex TSインデックス
   * @returns キー
   */
  private getKeyOfOpenFlightDetailMap(boundIndex: number, tsListIndex: number): string {
    return boundIndex.toString() + tsListIndex.toString();
  }

  /**
   * FF情報モーダルを開く
   *
   * @param boundIndex バウンドインデックス
   * @param tsList TS別FF情報
   * @param tsIndex TSインデックス
   */
  public openFareFamilySelectorModal(boundIndex: number, tsList: TSList, tsIndex: number) {
    // TS別FF情報内のFF情報押下時処理 実行
    if (tsList.flightSummary) {
      this.updateFareFamilySelectorInfo(boundIndex, tsList.flightSummary.travelSolutionId);
    }

    // FF選択モーダルを開く
    this._fareFamilySelectorModalService.openModal(
      tsList,
      boundIndex,
      this.anaCouchIsEnabledFlightIndexList,
      this._ffNameMap,
      tsIndex,
      this.tripTypeList
    );
  }

  /**
   * マトリクス形式7日間カレンダーモーダルを開く
   */
  public openCheapestCalendarMatrixModal() {
    this._cheapestCalendarMatrixModalService.openModal(this.cheapestCalendarData);
  }
  /**
   * ソート条件モーダルを開く
   */
  public openSortConditonModal() {
    this._sortConditionModalService.openModal(this.selectedSortConditionData);
  }

  /**
   * フィルタ条件モーダルを開く
   */
  public openFilterConditionModal() {
    this._filterConditionModalService.openModal(this.filterConditionData, this.initialFilterConditionData);
  }

  /**
   * FF概要表示切替リンク
   *
   * @param boundIndex バウンドインデックス
   */
  public clickFareOverview(boundIndex: number) {
    this.isOpenFareOverview[boundIndex] = !this.isOpenFareOverview[boundIndex];
  }

  /**
   * カレンダー選択処理※7日間カレンダーパーツ
   *
   * @param boundIndex バウンドインデックス
   * @param calendarIndex カレンダーインデックス
   */
  public selectCalendar(boundIndex: number, calendarIndex: number) {
    // リクエスト用検索条件を複製した情報をテンポラリの検索条件とする
    const { roundtripFlightAvailabilityInternationalData } = this._roundtripFlightAvailabilityInternationalService;
    if (!roundtripFlightAvailabilityInternationalData.roundtripOwdRequest) {
      return;
    }
    const setData: RoundtripFlightAvailabilityInternationalState = {};
    let tmpRequestSearchCondition = structuredClone(roundtripFlightAvailabilityInternationalData.roundtripOwdRequest);
    // 往路: boundIndex=0 復路: boundIndex=1
    if (boundIndex === 0) {
      tmpRequestSearchCondition.itineraries[boundIndex].departureDate =
        this.cheapestCalendarData?.departureDateList && this.cheapestCalendarData.departureDateList?.[calendarIndex]
          ? this.cheapestCalendarData.departureDateList?.[calendarIndex]
          : '';
      /** 現在の往路日付 : リクエスト用検索条件.itineraries[0].departureDate*/
      setData.currentOutboundDate = tmpRequestSearchCondition.itineraries[boundIndex].departureDate;
    } else if (boundIndex === 1) {
      tmpRequestSearchCondition.itineraries[boundIndex].departureDate =
        this.cheapestCalendarData?.returnDateList && this.cheapestCalendarData.returnDateList?.[calendarIndex]
          ? this.cheapestCalendarData.returnDateList?.[calendarIndex]
          : '';
      /** 現在の復路日付 : リクエスト用検索条件.itineraries[1].departureDate ※往復かどうか=trueの場合のみ設定 */
      setData.currentReturnTripDate = tmpRequestSearchCondition.itineraries[boundIndex].departureDate;
    }
    // store更新
    setData.isChangeSearchData = true;
    setData.isHistoryRegistration = false;
    setData.isSelectLowestFare = true;
    this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(setData);
    // [空席照会処理]を呼び出す
    this._roundtripFlightAvailabilityInternationalContComponent.vacantSeatInquiryProcessing(
      true,
      false,
      tmpRequestSearchCondition
    );
  }

  /**
   * 金額内訳リンク押下時処理
   */
  public openPaymentDetailModal(event: Event) {
    event.preventDefault();

    const selectedAirOffer: PaymentDetailData = {
      price: String(this.selectedAirOffer?.price) || '0',
      originalPrice: this.selectedAirOffer?.originalPrice,
      isPromotionApplied: this.selectedAirOffer?.isPromotionApplied!,
      passengerCount: {
        adt: this.selectedAirOffer?.passengerCount.adt!,
        b15: this.selectedAirOffer?.passengerCount.b15!,
        chd: this.selectedAirOffer?.passengerCount.chd!,
        inf: this.selectedAirOffer?.passengerCount.inf!,
      },
      unitPriceList: this.selectedAirOffer?.unitPriceList!,
      accrualMiles: this.selectedAirOffer?.accrualMiles,
    };

    this._paymentDetailModalService.openModal(selectedAirOffer);
  }

  /** フライト再検索ボタン押下時のイベント */
  public clickShowOtherFlightsButton(boundIndex: number) {
    this.clickShowOtherFlightsEvent.emit(boundIndex);
  }

  /** 現在の画面サイズから端末種別を取得する */
  public getDeviceTypeFromSize(): DeviceType {
    if (isSP()) {
      return 'SP';
    }
    if (isTB()) {
      return 'TAB';
    }
    return 'PC';
  }

  /**
   * 画面サイズを基に表示を変更する
   */
  private updateViewByDeviceType() {
    const device = this.getDeviceTypeFromSize();
    if (this.deviceTypeFromSize != device) {
      this.deviceTypeFromSize = device;
      if (this.isPcDevice == false && this.deviceTypeFromSize == 'PC') {
        // PC表示にして再描画
        this.isPcDevice = true;
        this._changeDetectorRef.markForCheck();
      } else if (this.isPcDevice == true && this.deviceTypeFromSize != 'PC') {
        // SP・TAB表示にして再描画
        this.isPcDevice = false;
        this._changeDetectorRef.markForCheck();
      }
    }
  }

  /** 次へボタン押下時のイベント */
  public clickNextFlow(event: Event) {
    // containerで設定された選択AirOffer情報、選択AirOfferIDを再度取得し設定
    this.selectAirOfferInfo = this._roundtripFlightAvailabilityService.getSelectAirOfferInfo();
    this.selectAirOfferId = this._roundtripFlightAvailabilityService.getSelectAirOfferId();
    const airOffer: AirOffer = this.selectAirOfferInfo;
    const airOfferId: string = this.selectAirOfferId;

    // validate処理
    if (airOffer.reasonForRestriction === 'americaAndCuba') {
      this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'E0067' });
      return;
    } else if (airOffer.reasonForRestriction === 'incorrectChildFareCalculation') {
      this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'E0068' });
      return;
    }

    // validate処理
    // 以下の処理にて、選択中のいずれかのバウンドに小型機であるセグメントが1つ以上含まれるかチェックを行う。
    // 小型機有無を初期値falseとする。
    // 画面表示用データ.roundtripBound[0].travelSolutions[選択中往路TSID].flights
    // (以下、当該往路flightsとする)について、当該往路flights.isSmallAircraft=trueとなるもののみ抽出し、4
    // 抽出結果が1件以上ある場合、小型機有無にtrueを設定する。
    // this._owd.data?.roundtripBounds![0];
    // this.roundTripBoundList[0]
    // 小型機有無=false、かつ選択中復路TSが存在する場合、画面表示用データ.roundtripBound[1].travelSolutions[選択中復路TSID].flights
    // (以下、当該復路flightsとする)について、当該復路flights.isSmallAircraft=trueとなるもののみ抽出し、抽出結果が1件以上ある場合、
    // 小型機有無にtrueを設定する。
    const isSmallAircraft: boolean = this.checkIsSmallAircraft();

    if (isSmallAircraft) {
      this._dialogSvc
        .openDialog({ message: 'm_dynamic_message-MSG1003' })
        .buttonClick$.pipe(filter((dialog) => dialog.clickType === DialogClickType.CONFIRM))
        .subscribe(() => {
          this._setAmcLoginHandle(airOfferId);
        });
    } else {
      this._setAmcLoginHandle(airOfferId);
    }
  }

  /**
   * AMC会員ログイン処理
   */
  private _setAmcLoginHandle(airOfferId: string) {
    const loginStatus = this._common.aswContextStoreService.aswContextData.loginStatus;
    if (loginStatus !== LoginStatusType.REAL_LOGIN) {
      const diarogPart = this._modalService.defaultIdPart(AmcLoginComponent, AmcLoginHeaderComponent);
      diarogPart.closeBackEnable = true;
      diarogPart.payload = {
        submitEvent: () => {
          this.clickNextFlowProcess(airOfferId);
        },
        skipEvent: () => {
          this.clickNextFlowProcess(airOfferId);
        },
      };
      this._modalService.showSubPageModal(diarogPart);
    } else {
      this.clickNextFlowProcess(airOfferId);
    }
  }

  private clickNextFlowProcess(airOfferId: string) {
    // カート作成API通信用パラメータを作成
    const searchFlightConditionRequest = this.props.searchFlightContidion.request;
    const itinerarieList: Array<CreateCartRequestSearchAirOfferItinerariesInner> = [];
    if (searchFlightConditionRequest.itineraries) {
      searchFlightConditionRequest.itineraries.forEach((v) => {
        itinerarieList.push({
          departureDate: v.departureDate ? v.departureDate : undefined,
          departureTimeWindowFrom: v.departureTimeWindowFrom ? v.departureTimeWindowFrom : undefined,
          departureTimeWindowTo: v.departureTimeWindowTo ? v.departureTimeWindowTo : undefined,
          destinationLocationCode: v.destinationLocationCode ? v.destinationLocationCode : undefined,
          originLocationCode: v.originLocationCode ? v.originLocationCode : undefined,
          connection: v.connection
            ? {
                locationCode: v.connection?.locationCodes[0],
                time: v.connection?.time,
              }
            : undefined,
        });
      });
    }

    const fareType = {
      isMixedCabin: searchFlightConditionRequest.fare.isMixedCabin,
      cabinClass: searchFlightConditionRequest.fare.cabinClass
        ? searchFlightConditionRequest.fare.cabinClass
        : undefined,
      fareOptionType: searchFlightConditionRequest.fare.fareOptionType
        ? searchFlightConditionRequest.fare.fareOptionType
        : undefined,
      mixedCabinClasses: searchFlightConditionRequest.fare.mixedCabinClasses?.departureCabinClass
        ? {
            departureCabinClass: searchFlightConditionRequest.fare.mixedCabinClasses?.departureCabinClass
              ? searchFlightConditionRequest.fare.mixedCabinClasses?.departureCabinClass
              : undefined,
            returnCabinClass: searchFlightConditionRequest.fare.mixedCabinClasses?.returnCabinClass
              ? searchFlightConditionRequest.fare.mixedCabinClasses?.returnCabinClass
              : undefined,
          }
        : undefined,
    };

    let hasAccompaniedInAnotherReservation: boolean | undefined = undefined;

    if (
      searchFlightConditionRequest.hasAccompaniedInAnotherReservation ||
      searchFlightConditionRequest.hasAccompaniedInAnotherReservation === false
    ) {
      hasAccompaniedInAnotherReservation = searchFlightConditionRequest.hasAccompaniedInAnotherReservation;
    }

    if (this._currentCartStoreService.CurrentCartData.data?.cartId == '') {
      // プラン確認画面(R01-P040)受け渡し情報として、以下の初期値を設定する。
      this._deliveryInfoStoreService.setDeliveryInformation({
        ...this._deliveryInfoStoreService.deliveryInformationData,
        planReviewInformation: {
          ...this._deliveryInfoStoreService.deliveryInformationData.planReviewInformation,
          isNeedGetCart: false,
          supportRegisterErrorCode: undefined,
        },
      });

      // カート情報が存在しない場合の処理
      // カート作成API実行のためのパラメータを作成
      const createCartRequest: CreateCartRequest = {
        airOfferId: airOfferId,
        searchAirOffer: {
          itineraries: itinerarieList,
          fare: fareType,
          promotion: searchFlightConditionRequest.promotion,
          hasAccompaniedInAnotherReservation: hasAccompaniedInAnotherReservation,
        },
      };

      this._roundtripFlightAvailabilityInternationalPresService.createCart(createCartRequest);
    } else {
      // カート情報が存在する場合の処理

      // カート情報取得要否更新処理

      // プラン確認画面(R01-P040)受け渡し情報として、以下の初期値を設定する。
      this._deliveryInfoStoreService.setDeliveryInformation({
        ...this._deliveryInfoStoreService.deliveryInformationData,
        planReviewInformation: {
          ...this._deliveryInfoStoreService.deliveryInformationData.planReviewInformation,
          isNeedGetCart: false,
          supportRegisterErrorCode: undefined,
        },
      });

      const cartId: string | undefined = this._currentCartStoreService.CurrentCartData.data?.cartId;

      const param: PatchUpdateAirOffersRequest = {
        cartId: cartId ?? '',
        postAirOfferBody: {
          airOfferId: airOfferId,
        },
        searchAirOffer: {
          itineraries: itinerarieList,
          fare: fareType,
          promotion: searchFlightConditionRequest.promotion,
          hasAccompaniedInAnotherReservation: hasAccompaniedInAnotherReservation,
        },
      };

      this._roundtripFlightAvailabilityInternationalPresService.updateAirOffers(param);
    }
  }

  // 積算マイルが存在するかどうかを判定する（0の場合はtrue）
  public existsAccrualMiles(): boolean {
    if (!this.selectedAirOffer?.accrualMiles) {
      if (this.selectedAirOffer?.accrualMiles === 0) {
        return true;
      }
      return false;
    } else if (this.selectedAirOffer.accrualMiles >= 0) {
      return true;
    }
    return false;
  }

  /**
   * TS別FF情報内のFF情報押下時処理
   *
   * @param UpdateFareFamilySelectorParam
   * @param boundIndex バウンドインデックス
   * @param travelSolutionId TSID
   */
  public updateFareFamilySelectorInfo(boundIndex: number, travelSolutionId: string) {
    // ※当処理は呼び出し元よりバウンドインデックス(0：往路または片道、1：復路)、および選択TSIDを受け取り、処理を行う。
    // FF選択モーダル表示リストの初期化
    const ffSelectModalList: {
      fareFamily?: FareFamilies;
      displayAirOffer?: AirOffer;
      airOfferId: string;
      upgradeInfo: Array<FlightUpgradeInfo>;
      otherBoundFareChange: boolean;
    }[] = [];

    // バウンドインデックス＝”0”(往路)の場合、以下の処理にて、FF選択モーダルに表示する情報の作成を行う。
    if (boundIndex === 0) {
      // FF選択モーダル内プロモーション適用結果有無を初期値falseとする。
      let isPromotionApplied = false;
      // ANAカウチ利用可否表示フライトインデックスリストとして、空のリストを用意する。
      // ※画面で保持している this.anaCouchIsEnabledFlightIndexList を使用するため、初期化する
      this.anaCouchIsEnabledFlightIndexList = [];

      // ＜以下、画面表示用データ.roundtripBounds[0].fareFamiliesの要素数分、繰り返し＞
      const fareFamilies = this._owd.data?.roundtripBounds && this._owd.data?.roundtripBounds[0]?.fareFamilies;

      fareFamilies &&
        fareFamilies.forEach((fareFamily, ffIndex) => {
          // 往路変更後情報
          const afterDepartureInfo: DepartureFareFamily | undefined = this._owd.data?.airOfferMapping?.[
            travelSolutionId
          ]?.[fareFamily.fareFamilyCode ?? ''] as DepartureFareFamily;

          // 往路変更後AirOfferId取得処理を呼び出す
          let afterAirOfferId = this._roundtripFlightAvailabilityService.getAfterAirOfferId(afterDepartureInfo);

          // 選択AirOfferIdに、往路変更後AirOfferIdを設定する。
          this.selectAirOfferId = afterAirOfferId;

          /**
           * 往復かどうか=true、
           * かつ往路変更後AirOfferIdが存在しない、
           * かつ画面表示用データ.airOfferMapping.<選択TSID>.<当該fareFamilies.fareFamilyCode>が存在する(=往路変更後情報)
           * かつ画面表示用データ.airOffers.<画面表示用データ.airOfferMapping.<選択TSID>.<当該fareFamilies.fareFamilyCode>.cheapestAirOfferId>が存在する場合、
           * 選択AirOfferIdに、画面表示用データ.airOfferMapping.<選択TSID>.<当該fareFamilies.fareFamilyCode>.cheapestAirOfferIdを設定する。
           */
          if (
            this._R01P030Store.isRoundtrip &&
            !afterAirOfferId &&
            afterDepartureInfo &&
            this._owd.data?.airOffers?.[afterDepartureInfo.cheapestAirOfferId]
          ) {
            this.selectAirOfferId = afterDepartureInfo.cheapestAirOfferId;
          }

          const airOffersInfo = this._owd.data?.airOffers as AirOffers;
          // FF毎表示内容情報として空の情報を作成し、以下の項目を設定する。
          const ffInfo = {
            // 当該fareFamilies
            fareFamily: fareFamily,
            // 選択airOfferIdが存在する場合、画面表示用データ.airOffers.選択airOffer
            displayAirOffer: this.selectAirOfferId ? airOffersInfo[this.selectAirOfferId] : undefined,
            // 選択airOfferIdが存在する場合、選択airOfferId
            airOfferId: this.selectAirOfferId ?? '',
            // フライト毎アップグレード情報
            upgradeInfo: this.getUpgradeInfo(0),
            otherBoundFareChange: false,
          };

          //  FF選択モーダル内プロモーション適用結果有無=false、
          //  かつ画面表示用データ.airOffers.<選択airOfferId>.bounds[0].totalPrice.discountが存在する場合、
          //  FF選択モーダル内プロモーション適用結果有無をtrueとする。
          const bounds = this._owd.data?.airOffers?.[this.selectAirOfferId]?.bounds;
          const discount = bounds?.[0]?.totalPrice?.discount;
          if (!isPromotionApplied && discount) {
            isPromotionApplied = true;
          }

          // 以下の処理にて、各セグメントのANAカウチ利用可否表示の要否を判定する
          this.setAnaCouchIsEnabledFlightIndexList(boundIndex);

          // FF選択モーダル表示リストに、FF毎表示内容情報を追加する。
          ffSelectModalList.push(ffInfo);

          // ＜ここまで、画面表示用データ.roundtripBounds[0].fareFamiliesの要素数分、繰り返し＞
        });
    }

    // バウンドインデックス＝”1”(復路)の場合、以下の処理にて、FF選択モーダルを表示するための情報作成を行う。
    if (boundIndex === 1) {
      // FF選択モーダル内プロモーション適用結果有無を初期値falseとする。
      let isPromotionApplied = false;
      // ANAカウチ利用可否表示フライトインデックスリストとして、空のリストを用意する。
      // ※画面で保持している this.anaCouchIsEnabledFlightIndexList を使用するため、初期化する
      this.anaCouchIsEnabledFlightIndexList = [];

      // 以下、画面表示用データ.roundtripBounds[1].fareFamiliesの要素数分、繰り返し
      const fareFamilies = this._owd.data?.roundtripBounds && this._owd.data?.roundtripBounds[1]?.fareFamilies;
      fareFamilies &&
        fareFamilies.forEach((fareFamily) => {
          //  画面表示用データ.airOfferMapping.<選択中往路TSID>.<選択中往路FF>について、
          //  <選択TSID>が存在する、かつ<選択TSID>.<当該fareFamilies.fareFamilyCode>が存在する場合、
          //  画面表示用データ.airOfferMapping.<選択中往路TSID>.<選択中往路FF>.<選択TSID>.<当該fareFamilies.fareFamilyCode>.airOfferIdを選択airOfferIdとする。
          const selectDepartureInfo = this._owd.data?.airOfferMapping?.[
            this._roundtripFlightAvailabilityService.getSelectOutboundTSID()
          ]?.[this._roundtripFlightAvailabilityService.getSelectOutboundFFCode()] as DepartureFareFamily;
          const returnTravelSolution = selectDepartureInfo?.[travelSolutionId] as ReturnTravelSolution;
          const returnFareFamily = returnTravelSolution?.[fareFamily.fareFamilyCode ?? ''] as ReturnFareFamily;
          if (returnTravelSolution && returnFareFamily) {
            this.selectAirOfferId = returnFareFamily.airOfferId ?? '';
          } else {
            this.selectAirOfferId = '';
          }

          // 選択airOfferIdが存在する、
          // かつ画面表示用データ.airOffers.<選択airOfferId>.isUnselectable=true(選択不可)の場合、選択airOfferIdをクリアする
          if (this._owd.data?.airOffers) {
            if (
              this.selectAirOfferId !== '' &&
              this._owd.data?.airOffers[this.selectAirOfferId].isUnselectable === true
            ) {
              this.selectAirOfferId = '';
            }
          }
          const airOffersInfo = this._owd.data?.airOffers as AirOffers;
          // FF毎表示内容情報として空の情報を作成し、以下の項目を設定する。
          const ffInfo = {
            fareFamily: fareFamily,
            displayAirOffer: this.selectAirOfferId ? airOffersInfo[this.selectAirOfferId] : undefined,
            airOfferId: this.selectAirOfferId ?? '',
            // フライト毎アップグレード情報
            upgradeInfo: this.getUpgradeInfo(1),
            otherBoundFareChange: false,
          };

          // FF選択モーダル内プロモーション適用結果有無=false、
          // かつ画面表示用データ.airOffers.<選択airOfferId>.bounds[1].totalPrice.discountが存在する場合、FF選択モーダル内プロモーション適用結果有無にtrueを設定する。
          const bounds = this._owd.data?.airOffers?.[this.selectAirOfferId]?.bounds;
          const discount = bounds && bounds[1].totalPrice?.discount;
          if (!isPromotionApplied && discount) {
            isPromotionApplied = true;
          }

          // 以下の処理にて、各セグメントのANAカウチ利用可否表示の要否を判定する
          this.setAnaCouchIsEnabledFlightIndexList(boundIndex);

          // FF選択モーダル表示リストに、FF毎表示内容情報を追加する。
          ffSelectModalList.push(ffInfo);

          // ＜ここまで、画面表示用データ.roundtripBounds[1].fareFamiliesの要素数分、繰り返し＞
        });
    }

    // 選択中往路TSID、選択中復路TSIDがいずれも空ではない場合、以下の処理を行う。
    if (
      this._roundtripFlightAvailabilityService.getSelectOutboundTSID() !== '' &&
      this._roundtripFlightAvailabilityService.getSelectReturnTripTSID() !== ''
    ) {
      // FFの運賃変更案内表示判定処理
      // FF選択モーダル表示リストの要素数分、繰り返し
      ffSelectModalList.forEach((ffInfo) => {
        // 当該FF毎表示内容情報に、以下の項目を設定する。
        // otherBoundFareChanged = false
        ffInfo.otherBoundFareChange = false;

        // 当該FF毎表示内容情報.displayAirOfferを判定対象AirOfferとする。
        const targetAirOffer = ffInfo.displayAirOffer;

        // 当該バウンドインデックスが0の場合は比較対象インデックスを1、それ以外の場合は比較対象インデックスを0に設定する。
        const compareAirOfferIndex = boundIndex === 0 ? 1 : 0;

        // 以下いずれかの条件を満たす場合、次のFF選択モーダル表示を処理する。
        // 判定対象AirOffer.bounds[比較対象インデックス].travelSolusionId≠選択AirOffer情報.bounds[比較対象インデックス].travelSolusionId
        // 判定対象AirOffer.bounds[比較対象インデックス].fareFamilyCode≠選択AirOffer情報.bounds[比較対象インデックス].fareFamilyCode
        if (
          targetAirOffer?.bounds?.[compareAirOfferIndex]?.travelSolutionId !==
            this.selectAirOfferInfo.bounds?.[compareAirOfferIndex]?.travelSolutionId ||
          targetAirOffer?.bounds?.[compareAirOfferIndex]?.fareFamilyCode !==
            this.selectAirOfferInfo.bounds?.[compareAirOfferIndex]?.fareFamilyCode
        ) {
          return;
        }

        // [運賃変更判定処理]を実施する
        if (targetAirOffer?.bounds && this.selectAirOfferInfo.bounds) {
          const faresChangeDisplayFlg = this._roundtripFlightAvailabilityService.faresChangeDisplayHandling(
            targetAirOffer.bounds,
            this.selectAirOfferInfo.bounds,
            compareAirOfferIndex
          );
          // [運賃変更判定処理]からtrueが返却された場合、当該FF毎表示内容情報.otherBoundFareChangedにtrue(ワーニング表示)を設定する。
          if (faresChangeDisplayFlg) {
            ffInfo.otherBoundFareChange = true;
          }
        }
        // ＜ここまで、FF選択モーダル表示リストの要素数分、繰り返し＞
      });
    }

    // Store更新
    let setData: RoundtripFlightAvailabilityInternationalState = {};
    setData.ffSelectModalList = ffSelectModalList;
    this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(setData);
  }

  /**
   * TS別FF情報内のFF情報押下時処理の1.7と2.3のupgradeInfo
   * @param boundIndex
   * @returns
   */
  private getUpgradeInfo(boundIndex: number): Array<FlightUpgradeInfo> {
    let result: Array<FlightUpgradeInfo> = [];
    let storeUpgradeInfoList =
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData
        .upgradeInfoList;

    // 選択airOfferIdが存在する場合、
    // アップグレード情報マップから選択airOfferIdをキーに値(バウンド毎アップグレード情報マップ)を取得し、
    // 取得したバウンド毎アップグレード情報マップから画面表示用データ.airOffers.<選択airOfferId>.bounds[0].travelSolutionIdをキーに取得した値(フライト毎アップグレード情報マップ)
    storeUpgradeInfoList?.forEach((airOfferUpgradeInfo) => {
      if (airOfferUpgradeInfo.airOfferId === this.selectAirOfferId) {
        airOfferUpgradeInfo?.boundUpgradeInfoList?.forEach((boundUpgradeInfo) => {
          if (
            boundUpgradeInfo?.travelSolutionId ===
            this._owd.data?.airOffers?.[this.selectAirOfferId]?.bounds?.[boundIndex]?.travelSolutionId
          ) {
            result = boundUpgradeInfo?.flightUpgradeInfoList ?? [];
          }
        });
      }
    });

    return result;
  }

  /**
   * スクロール左方向クリック
   */
  public leftSlider(event: Event, boundIndex: number) {
    if (this.scrollPanel) {
      // 左スクロールボタンの押下有無
      this._commonSliderComponent.ClickedLeftBtn = true;
      // 右スクロールボタンの押下有無
      this._commonSliderComponent.ClickedRightBtn = false;

      // 共通のスクロール処理へ
      this._commonSliderComponent.scrollLeft(boundIndex);

      // 最左端(左ボタン表示有無)
      this.hideLeftBtn = this._commonSliderComponent.isLeftEnd ? true : false;
      // 最右端(右ボタン表示有無)
      this.hideRightBtn = false;
    }
  }

  /**
   * スクロール右方向クリック
   */
  public rightSlider(event: Event, boundIndex: number) {
    if (this.scrollPanel) {
      // 左スクロールボタンの押下有無
      this._commonSliderComponent.ClickedLeftBtn = false;
      // 右スクロールボタンの押下有無
      this._commonSliderComponent.ClickedRightBtn = true;

      // 共通のスクロール処理へ
      this._commonSliderComponent.scrollRight(boundIndex);

      // 最右端(右ボタン表示有無)
      this.hideRightBtn = this._commonSliderComponent.isRightEnd ? true : false;
      // 最左端(左ボタン表示有無)
      this.hideLeftBtn = false;
    }
  }

  /**
   * スクロール操作時処理
   */
  @HostListener('window:scroll', ['$event'])
  onscroll() {
    let scrollPosition: number = this.document.body.scrollTop;
    if ('scrollingElement' in this.document) {
      scrollPosition = Number(this.document.scrollingElement?.scrollTop);
    }

    // 往復かどうか=true、かつ画面のy軸のスクロール位置が復路の選択中のTS別FF情報のy軸位置より下の場合、復路スクロール済にtrueを設定する。
    if (this._R01P030Store.isRoundtrip && scrollPosition >= this.yPosition) {
      this.completedReturnScroll = true;
    }

    // スクロール後のフッターの次のボタンの活性化有無(非活性=true、活性=false)
    this.checkedFooterBtn();
  }

  /**
   * 復路の選択中のTS別FF情報のy軸位置を取得(SP・TAB)
   *
   * @param yPosition
   */
  public getYPosition(yPosition: number, boundIndex: number, tsListIndex: number) {
    if (!isPC() && boundIndex === 1 && tsListIndex === 0) {
      this.yPosition = yPosition;
    }
  }

  /**
   * スクロール後のフッターの次のボタンの活性化有無(非活性=true、活性=false)
   */
  public checkedFooterBtn() {
    // 往復かどうか=false、2 往復かどうか=true、かつ復路スクロール済＝true
    if (
      !this._R01P030Store.isRoundtrip ||
      (this.tsList && this.tsList.length === 2 && this._R01P030Store.isRoundtrip && this.completedReturnScroll) ||
      (this.tsListNotPC &&
        this.tsListNotPC.length === 2 &&
        this._R01P030Store.isRoundtrip &&
        this.completedReturnScroll)
    ) {
      if (
        this._roundtripFlightAvailabilityService.getSelectOutboundTSID() &&
        this._roundtripFlightAvailabilityService.getSelectOutboundFFCode() &&
        this._roundtripFlightAvailabilityService.getSelectReturnTripTSID() &&
        this._roundtripFlightAvailabilityService.getSelectReturnTripFF()
      ) {
        this.activeFooterBtn = false;
      }
    }
  }

  /**
   * 小型機有無判定処理を行う
   *
   * @returns 小型機有無判定結果
   */
  private checkIsSmallAircraft() {
    let result = false;

    // 選択中往路TSID
    let selectOutboundTSID =
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData
        .selectOutboundTSID ?? '';

    // 選択中復路TSID
    let selectReturnTripTSID =
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData
        .selectReturnTripTSID ?? '';

    let outBoundTs = this._owd.data?.roundtripBounds?.[0].travelSolutions?.find(
      (element) => element.travelSolutionId === selectOutboundTSID
    );
    if (outBoundTs && outBoundTs.flights) {
      if (outBoundTs.flights.filter((element) => element.isSmallAircraft === true).length > 0) {
        result = true;
      }
    }

    if (!result && this._R01P030Store.isRoundtrip) {
      let returnTripTs = this._owd.data?.roundtripBounds?.[1].travelSolutions?.find(
        (element) => element.travelSolutionId === selectReturnTripTSID
      );
      if (returnTripTs && returnTripTs.flights) {
        if (returnTripTs.flights.filter((element) => element.isSmallAircraft === true).length > 0) {
          result = true;
        }
      }
    }

    return result;
  }

  /**
   * ANAカウチ利用可否表示フライトIndexリスト取得
   *
   * @param boundIndex バウンドインデックス
   */
  public setAnaCouchIsEnabledFlightIndexList(boundIndex: number): void {
    // 以下の処理にて、各セグメントのANAカウチ利用可否表示の要否を判定する
    // 画面表示用データ.airOffers.<選択airOfferId>.bounds[boundIndex].flightsをセグメントリストとする
    const bounds = this._owd.data?.airOffers?.[this.selectAirOfferId]?.bounds;
    let segmentList: RoundtripOwdResponseDataAirOffersInnerBoundsInnerFlightsInner[] = [];
    if (bounds) {
      segmentList = bounds[boundIndex].flights ?? [];
    }

    // ANAカウチ利用可否表示フライトインデックスリストの件数≠セグメントリストの件数の場合、以下の処理を行う。
    if (this.anaCouchIsEnabledFlightIndexList.length !== segmentList.length) {
      // ＜以下、セグメントリストの要素数分、繰り返し＞
      segmentList?.forEach((segment, segIndex) => {
        // ANAカウチ利用可否表示フライトインデックスリストにセグメントリストの繰り返しインデックスが存在する場合、次の繰り返しを処理する。
        if (this.anaCouchIsEnabledFlightIndexList.includes(segIndex)) {
          return;
        }

        // セグメントリスト[セグメントリストの繰り返しインデックス].isCouchAvailable=trueの場合、
        // ANAカウチ利用可否表示フライトインデックスリストにセグメントリストの繰り返しインデックスを設定する。
        if (segment.isCouchAvailable === true) {
          this.anaCouchIsEnabledFlightIndexList.push(segIndex);
        }
      });
    }
  }

  public convertToNumber(num: string | undefined): number {
    if (num === undefined || num === '') {
      return 0;
    }

    return Number(num);
  }

  /** 搭乗者人数のラベル更新 */
  private updateTravelersLabel() {
    const travelerList = [];

    if (this.traveler.ADT > 0) {
      const text = this._staticMsg.transform('label.passengerAdult', { '0': this.traveler.ADT.toString() });
      travelerList.push(text);
    }
    if (this.traveler.B15 > 0) {
      const text = this._staticMsg.transform('label.passengerYoungAdult', { '0': this.traveler.B15.toString() });
      travelerList.push(text);
    }
    if (this.traveler.CHD > 0) {
      const text = this._staticMsg.transform('label.passengerChild', { '0': this.traveler.CHD.toString() });
      travelerList.push(text);
    }
    if (this.traveler.INF > 0) {
      const text = this._staticMsg.transform('label.passengerInfant', { '0': this.traveler.INF.toString() });
      travelerList.push(text);
    }

    this.travelersLabel = travelerList.join(`${this._staticMsg.transform('label.paxNumberDelimiter')} `);
  }

  /**
   * FFリストエリア(FFヘッダ)用のTealium連携Id(xxBoundFare0)を生成
   * @param boundIndex バウンドのインデックス(0: 往路、1: 復路)
   * @param ffHeaderIndex FFヘッダのインデックス
   */
  public getTealiumFFHeaderId(boundIndex: number, ffHeaderIndex: number): string {
    return `${this.getTealiumBound(boundIndex)}Fare${ffHeaderIndex}`;
  }

  /**
   * フライトサマリ用のTealium連携Id(xxBoundTs0)を生成
   * @param boundIndex バウンドのインデックス(0: 往路、1: 復路)
   * @param travelSolutionIndex TS(=フライトサマリ)のインデックス
   */
  public getTealiumFlightSummaryId(boundIndex: number, travelSolutionIndex: number): string {
    return `${this.getTealiumBound(boundIndex)}Ts${travelSolutionIndex}`;
  }

  /**
   * TS別FF情報(FFリスト)用のTealium連携Id(xxBoundTs0Fare0)を生成
   * @param boundIndex バウンドのインデックス(0: 往路、1: 復路)
   * @param ffHeaderIndex FFヘッダのインデックス
   * @param travelSolutionIndex TS(=フライトサマリ)のインデックス
   */
  public getTealiumTSFFListId(boundIndex: number, travelSolutionIndex: number, ffHeaderIndex: number): string {
    return `${this.getTealiumBound(boundIndex)}Ts${travelSolutionIndex}Fare${ffHeaderIndex}`;
  }

  /** Tealium連携用Idのバウンド部分取得 */
  private getTealiumBound(boundIndex: number): string {
    return boundIndex === 0 ? 'outBound' : 'inBound';
  }

  /**
   * (HTML埋め込み、FFヘッダ用)キャビンクラスのヘッダー部のIDを生成
   * @param boundIndex バウンドのインデックス
   * @param cabinClassIndex キャビンクラスの画面上でのindex
   */
  public getCabinClassHeaderId(boundIndex: number, cabinClassIndex: number): string {
    this.cabinClassHeaderIndex[boundIndex].push(cabinClassIndex);
    return `cabinClassHeader_${boundIndex}_${cabinClassIndex}`;
  }

  /**
   * (HTML埋め込み、TS別FF情報用)キャビンクラスのヘッダー部に対応するIDを生成
   * @param boundIndex バウンドのインデックス
   * @param tsffIndex キャビンクラスの画面上でのindex
   */
  public getLabelledByCabinClassId(boundIndex: number, tsffIndex: number): string {
    let cabinClassIndex = 0;
    for (const headerIndex of this.cabinClassHeaderIndex[boundIndex]) {
      // TS別FF情報が引っ張ってくるべきキャビンクラスのindex: ヘッダーのindexがTS別FF情報よりも左で(小さく)、その中で最も右にある(大きい)数字
      if (headerIndex <= tsffIndex && cabinClassIndex < headerIndex) {
        cabinClassIndex = headerIndex;
      }
    }
    return `cabinClassHeader_${boundIndex}_${cabinClassIndex}`;
  }

  /**
   * (HTML埋め込み用)FF名称部のIDを生成
   * @param boundIndex バウンドのインデックス
   * @param fareFamilyIndex FF名称の画面上でのindex
   */
  public getFareFamilyNameId(boundIndex: number, fareFamilyIndex: number): string {
    return `fareFamilyName_${boundIndex}_${fareFamilyIndex}`;
  }
}
