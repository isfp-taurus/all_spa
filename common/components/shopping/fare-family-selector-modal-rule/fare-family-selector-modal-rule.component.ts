import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  Renderer2,
  ViewChildren,
} from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { AswMasterService, CommonLibService, ErrorsHandlerService, LoggerDatadogService } from '@lib/services';
import { ErrorType, NotRetryableErrorModel, PageType, SessionStorageName } from '@lib/interfaces';
import { RoundtripFlightAvailabilityInternationalState } from '@common/store/roundtripFlightAvailabilityInternational';
import { RoundtripFlightAvailabilityInternationalService } from '@common/services/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.service';
import { AirOfferUpgradeInfo, FlightUpgradeInfo } from '@common/interfaces/roundtripFlightAvailabilityInternational';
import { Flights } from '@common/interfaces/shopping/roundtrip-owd/response/data/airOffers/flights';
import { Type9 } from 'src/sdk-search/model/type9';
import { Bounds } from '@common/interfaces/shopping/roundtrip-owd';
import {
  UpgradeDetailInforParam,
  FareFamiliesRule,
} from '@common/components/shopping/fare-family-selector-modal-rule/fare-family-selector-modal-rule.state';
import { Segment } from '@common/components/shopping/fare-family-selector-modal-rule/fare-family-selector-modal-rule.state';
import { MASTER_TABLE, MasterStoreKey } from '@conf/asw-master.config';
import { ServiceContentsByItineraryTypeModel } from '@common/interfaces/common/ServiceContentsByItineraryTypeCabin/ServiceContentsByItineraryType';
import { ServiceContentsByItineraryTypeCabin } from '@common/interfaces/common/ServiceContentsByItineraryTypeCabin/ServiceContentsByItineraryType_Cabin';
import { ServiceContentsByItineraryTypeServiceType } from '@common/interfaces/common/ServiceContentsByItineraryTypeCabin/ServiceContentsByItineraryType_ServiceType';
import { Type5ItinerariesInner } from 'src/sdk-search';
import { UpgradeAvailabilityRequest } from '@common/interfaces/shopping/upgrade-availability/upgradeavailabilityRequest';
import { UpgradeAvailabilityService } from '@common/services/upgrade-availability/upgrade-availability-store.service';
import { UpgradeAvailabilityState } from '@common/store/upgrade-availability';
import { UpgradeWaitlistRequest } from '@common/interfaces/shopping/upgrade-waitlist/upgradeWaitlistRequest';
import { UpgradeWaitlistStoreService } from '@common/services/upgrade-waitlist/upgrade-waitlist-store.service';
import { UpgradeWaitlistState } from '@common/store/upgrade-waitlist';
import { CommonSliderComponent } from '@common/components/shopping/common-slider/common-slider.component';
import { availabilityInformationForDepartureDate } from '@common/interfaces/shopping/upgrade-availability/upgradeavailabilityResponsesForDepartureDate';
import { vacantInformationForFlight } from '@common/interfaces/shopping/upgrade-availability/upgradeavailabilityResponsesForFlight';
import { FareFamilySelectorModalComponent } from '../fare-family-selector/fare-family-selector-modal.component';
import { M_OFFICE } from '@common/interfaces/common/m_office';
import {
  AirportI18nJoinByAirportCodeCache,
  AirportI18nSearchForAirportCodeCache,
} from '@common/services/shopping/shopping-lib/shopping-lib.state';
import { SearchFlightConditionForRequestState } from '@common/store/search-flight-condition-for-request';
import { SearchFlightConditionForRequestService } from '@common/services';
import { StaticMsgPipe } from '@lib/pipes';
import { environment } from '@env/environment';
import { AppConstants } from '@conf/app.constants';

/**
 * FF選択モーダル
 * FF情報のFFルール、セグメント情報画面部品
 */
@Component({
  selector: 'asw-fare-family-selector-modal-rule',
  templateUrl: './fare-family-selector-modal-rule.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FareFamilySelectorModalRuleComponent extends SupportComponent implements AfterViewInit {
  /** 往復空席照会結果(国際)画面のStore */
  private _R01P030Store: RoundtripFlightAvailabilityInternationalState = {};
  /** リクエスト用検索条件 */
  public searchFlightCondition?: SearchFlightConditionForRequestState;

  // 空港情報キャッシューデータ取得
  private airportAkamai: AirportI18nJoinByAirportCodeCache = {};

  /** 当部品のスライド番号 */
  @Input()
  public slideNum: number = 0;
  /** 全体のスライド番号 */
  @Input()
  public slideMax: number = 0;

  @Input()
  public allUpgradeLink: boolean = false;

  @Output()
  public changeAllUpgradeLink = new EventEmitter<UpgradeDetailInforParam>();

  /** FFルール オブジェクト */
  @Input()
  public fareFamiliesRule: FareFamiliesRule = {};
  @Input()
  public fareFamilyName: string = '';
  @Input()
  public fareFamilyCode: string = '';
  @Input()
  public cabinClass: string = '';
  /**  セグメント情報 オブジェクト */
  @Input()
  public segmentList: Segment[] = [];
  /** セグメント情報(TravelSolution配下のflight) */
  public _travelSolutionsFlightsList: Type9[] = [];
  /** セグメント関連情報リ(AirOffer配下のBounds.flight) */
  public _airOffersFlightsList: Flights[] = [];
  /** 当該bound.flights ※AirOffer配下のBounds */
  public _airOfferBounds: Bounds = {};
  /** ANAカウチ利用可否フライトIndexリスト */
  public _anaCouchIsEnabledFlightIndexList: number[] = [];

  /**  縦サイズ 他のFF情報部品と高さを合わせるため外部入力 */
  /**  縦サイズを合わせるためのFF部品 */
  @ViewChildren('fixHeight') fixHeight!: ElementRef[];

  /** FF選択一覧スクロールの要素を取得する変数 */
  @ViewChildren('scrollItemList') scrollItemList?: QueryList<ElementRef>;

  /** 検索結果種別 */
  public searchResultItineraryType: string = '';

  /** アップグレード照会可となるseatStatus */
  public verifiableSeatStatus = ['available', 'waitlisting', 'acquired', 'unacquired'];

  /** アップグレード照会不可となるseatStatus */
  public notVerifiableSeatStatus = ['noSetting', 'occupied'];

  /** FF情報部品（予約変更可否等が記載されている箇所）の高さ */
  public height3Max = 0;
  /** FF情報部品（各フライト毎の提供サービスが記載されている箇所）の高さ */
  public height4Max = 0;
  /** ANAアプリであるか判定 */
  public isAnaApl = false;

  constructor(
    private _common: CommonLibService,
    private _roundtripFlightAvailabilityInternationalService: RoundtripFlightAvailabilityInternationalService, //往復空席照会結果画面store
    private _commonSliderComponent: CommonSliderComponent,
    private _aswMasterSvc: AswMasterService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _fareFamilySelectorModalComponent: FareFamilySelectorModalComponent,
    private _searchFlightConditionForRequestService: SearchFlightConditionForRequestService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _staticMsgPipe: StaticMsgPipe,
    private _renderer: Renderer2,
    private _loggerSvc: LoggerDatadogService
  ) {
    super(_common);

    this.isAnaApl = this._common.aswContextStoreService.aswContextData.isAnaApl;
  }

  /** セグメント情報(TravelSolution配下のflight) */
  @Input()
  set travelSolutionsFlightsList(tsFlightList: Type9[]) {
    this._travelSolutionsFlightsList = tsFlightList;
  }
  get travelSolutionsFlightsList() {
    return this._travelSolutionsFlightsList;
  }

  /** セグメント関連情報リスト(AirOffer配下のBounds.flight) */
  @Input()
  set airOffersFlightsList(aoFlightList: Flights[]) {
    this._airOffersFlightsList = aoFlightList;
  }
  get airOffersFlightsList() {
    return this._airOffersFlightsList;
  }

  /** 当該bound.flights ※AirOffer配下のBounds */
  @Input()
  set airOfferBounds(airOfferBounds: Bounds) {
    this._airOfferBounds = airOfferBounds;
  }
  get airOfferBounds() {
    return this._airOfferBounds;
  }

  /** ANAカウチ利用可否フライトIndexリスト */
  @Input()
  set anaCouchIsEnabledFlightIndexList(anaCouchIndexList: number[]) {
    this._anaCouchIsEnabledFlightIndexList = anaCouchIndexList;
  }
  get anaCouchIsEnabledFlightIndexList() {
    return this._anaCouchIsEnabledFlightIndexList;
  }

  reload(): void {}
  init(): void {
    // セグメント情報(リスト) 作成メソッドを呼び出し、セグメント情報部分の表示値を作成
    this.subscribeService(
      'PushUpgradeAvailability',
      this._roundtripFlightAvailabilityInternationalService.getRoundtripFlightAvailabilityInternationalObservable(),
      () => {
        this.segmentList = [];
        this.getFareFamilySegmentList(
          this.travelSolutionsFlightsList,
          this.airOffersFlightsList,
          this.anaCouchIsEnabledFlightIndexList
        );
        this._changeDetectorRef.detectChanges();
      }
    );
  }
  destroy(): void {
    this.deleteSubscription('_upgradeWaitlist');
    this.deleteSubscription('_upgradeAvailability');
    this.deleteSubscription('PushUpgradeAvailability');
  }

  ngAfterViewInit(): void {
    if (this._commonSliderComponent) {
      this._commonSliderComponent.scrollItemList = this.scrollItemList;
    }

    const lastfarePanelHeadElement = document.getElementById(`p-fare-panel__body3-${this.slideMax - 1}`);
    if (lastfarePanelHeadElement) {
      this.alignFarePanel('p-fare-panel__body3-', this.height3Max);
    }

    const lastfarePanelBodyElement = document.getElementById(`p-fare-panel__body4-${this.slideMax - 1}`);
    if (lastfarePanelBodyElement) {
      this.alignFarePanel('p-fare-panel__body4-', this.height3Max);
    }
  }

  /** FF情報部品の高さをそろえる */
  private alignFarePanel(id: string, height: number) {
    const htmlElementArray: HTMLElement[] = [];
    for (let i = 0; i < this.slideMax; i++) {
      const element = document.getElementById(`${id}${i}`);
      if (element) {
        htmlElementArray.push(element);
      }
    }

    for (let i = 0; i < htmlElementArray.length; i++) {
      const element = htmlElementArray[i];
      if (element.offsetHeight > height) {
        height = element.offsetHeight;
      }
    }

    htmlElementArray.forEach((el) => {
      this._renderer.setStyle(el, 'height', `${height}px`);
    });
  }

  /**
   * セグメント情報 作成メソッド ※itemコンポーネントでの表示値
   *
   * @param travelSolutionsFlightsList セグメント情報リスト
   * @param airOffersFlightsList セグメント関連情報リスト
   * @param anaCouchIsEnabledFlightIndexList ANAカウチ利用可否表示フライトIDリスト
   */
  public getFareFamilySegmentList(
    travelSolutionsFlightsList: Type9[],
    airOffersFlightsList: Flights[],
    anaCouchIsEnabledFlightIndexList: number[]
  ): void {
    // セグメント情報=フライト詳細で空港コードのみのため、JoinByAirportCodeCache
    this.airportAkamai = this._aswMasterSvc.aswMaster[MASTER_TABLE.AIRPORT_I18N_JOIN_BY_AIRPORT_CODE.key];
    // セグメント情報リストの件数分繰り返し
    travelSolutionsFlightsList.forEach((travelSolutionsFlights, tsIndex) => {
      // 出発地　空港名取得処理
      let departureAirport = '';
      let departureAirports = this.airportAkamai[travelSolutionsFlights.departure?.locationCode!];
      if (departureAirports && departureAirports.length !== 0) {
        for (let i = 0; i < departureAirports.length; i++) {
          if (departureAirports[i].airport_code === travelSolutionsFlights.departure?.locationCode!) {
            departureAirport = departureAirports[i].airport_name;
            break;
          }
        }
      } else {
        // 空港コードに該当するデータが取得できないか空だった場合、運用確認ログを出力する
        this._loggerSvc.operationConfirmLog('MST0003', {
          0: MASTER_TABLE.AIRPORT_I18N_JOIN_BY_AIRPORT_CODE.fileName,
          1: travelSolutionsFlights.departure?.locationCode!,
        });
      }
      // 当該flight.departure.locationCode=空港コードとなるASWDB(マスタ)の空港のレコードが存在しない場合、当該flight.departure.locationName
      if (departureAirport === '') {
        departureAirport = travelSolutionsFlights.departure?.locationName ?? '';
      }

      // 到着地　空港名取得処理
      let arrivalAirport = '';
      if (this.airportAkamai[travelSolutionsFlights.arrival?.locationCode!]) {
        let arrivalAirports = this.airportAkamai[travelSolutionsFlights.arrival?.locationCode!];
        for (let i = 0; i < arrivalAirports.length; i++) {
          if (arrivalAirports[i].airport_code === travelSolutionsFlights.arrival?.locationCode!) {
            arrivalAirport = arrivalAirports[i].airport_name;
            break;
          }
        }
      }
      // 当該flight.arrival.locationCode=空港コードとなるASWDB(マスタ)の空港レコードが存在しない場合、当該flight.arrival.locationName
      if (arrivalAirport === '') {
        arrivalAirport = travelSolutionsFlights.arrival?.locationName ?? '';
      }

      // (25-39) ANAカウチ利用可否 ANAカウチ表示可否
      let isShowAnaCouchOne: boolean = false;
      // ANAカウチ利用可否表示フライトIDリストに当該flight.idが含まれる場合、表示可否＝true
      anaCouchIsEnabledFlightIndexList.forEach((couchIndex) => {
        if (couchIndex === tsIndex) {
          isShowAnaCouchOne = true;
        }
      });

      let itineraryType: string = ''; // セグメント区分

      // 検索結果種別を画面storeから取得
      this.searchResultItineraryType = this._R01P030Store.searchResultItineraryType ?? 'international';

      // セグメント情報　の作成処理
      let segment: Segment = {
        // セグメントID
        segmentId: travelSolutionsFlights.id,
        // 出発地
        departureAirport: departureAirport ?? travelSolutionsFlights.departure?.locationName!,
        // 到着地
        arrivalAirport: arrivalAirport ?? travelSolutionsFlights.arrival?.locationName!,
        // (25-37) 座席指定料金
        seatReservationFee: airOffersFlightsList[tsIndex].seat?.applicability,
        // NHグループ運航便かどうか 表示判定用
        isNhGroupOperated: travelSolutionsFlights.isNhGroupOperated ?? false,
        // 日本国内線であるかどうか 表示判定用
        isJapanDomesticFlight: travelSolutionsFlights.isJapanDomesticFlight ?? false,

        /** FF選択モーダル内イベント用引数 */
        // 出発空港コード
        departureLocationCode: travelSolutionsFlights.departure?.locationCode ?? '',
        // 到着空港コード
        arrivalLocationCode: travelSolutionsFlights.arrival?.locationCode ?? '',
        // 出発日
        departureDateTime: travelSolutionsFlights.departure?.dateTime ?? '',
        // 販売キャリアコード
        marketingAirlineCode: travelSolutionsFlights.marketingAirlineCode ?? '',
        // 便番号
        marketingFlightNumber: travelSolutionsFlights.marketingFlightNumber ?? '',
      };

      this.segmentList.push(segment);
    });
  }

  /**
   * 未ログインチェック
   * ログインステータスがNOT_LOGINであればtrue
   * @returns
   */
  private isNotLogin() {
    return this._common.isNotLogin();
  }

  /**
   * シートマップリンク押下時に、シートマップ参照へ連携する情報をstoreに格納
   *
   * @param _departureLocationCode
   * @param _arrivalLocationCode
   * @param _departureDateTime
   * @param _marketingAirlineCode
   * @param _marketingFlightNumber
   * @param _bookingClass
   */
  public seatmapReferenceParams(
    _departureLocationCode?: string,
    _arrivalLocationCode?: string,
    _departureDateTime?: string,
    _marketingAirlineCode?: string,
    _marketingFlightNumber?: string,
    _bookingClass?: string
  ) {
    // ※以降、フライト検索画面(R01-P010)で保持された検索条件を、リクエスト用の検索条件とする。
    this.searchFlightCondition = this._searchFlightConditionForRequestService.getData();
    // yyyy-MM-dd'T'HH:mm:ss形式をyyyyMMdd形式に変換する
    const departureDate = this.convertDateTimeToDate(_departureDateTime);

    // リクエスト用検索条件から、搭乗者数を設定
    let _adt: string = this.searchFlightCondition.request.travelers.ADT.toString();
    let _b15: string = this.searchFlightCondition.request.travelers.B15.toString();
    let _chd: string = this.searchFlightCondition.request.travelers.CHD.toString();
    let _inf: string = this.searchFlightCondition.request.travelers.INF.toString();

    let amcMemberNo: string = ''; // ユーザ共通.会員番号 初期化
    const JSessionId = this._common.loadSessionStorage(SessionStorageName.JSESSION_ID); //「国際ASWからの遷移の際に指定されるセッションID」
    const lang = this._common.aswContextStoreService.aswContextData.lang; // ユーザ共通情報（AswContext）に保存された言語情報を取得
    const pointOfSaleId = this.getConnectionKind(); // ユーザ共通.操作オフィスコード＝オフィスコードとなるASWDB(マスタ)のオフィス.ASWTOP識別

    // 未ログインチェック
    if (!this.isNotLogin()) {
      // ログイン済みの場合、ユーザ共通.会員番号を設定
      amcMemberNo = this._common.amcMemberStoreService.amcMemberData.iFlyMemberInfo?.membershipNumber ?? '';
    }

    // パラメータ送信設定
    const form = document.createElement('form');
    const url = `${environment.spa.baseUrl}${environment.spa.app.srv}/informative-seatmap`;
    form.action = url + '?CONNECTION_KIND=' + pointOfSaleId + '&LANG=' + lang;
    form.target = '_blank'; // 別タブ表示指定
    form.method = 'post'; // サーバへの送信方法を指定
    form.style.display = 'none'; //パラメータを非表示

    //パラメータに値を設定
    form.addEventListener('formdata', ({ formData }) => {
      formData.set('marketingAirlineCode', _marketingAirlineCode ?? '');
      formData.set('marketingFlightNumber', _marketingFlightNumber ?? '0');
      /** 出発空港コード */
      formData.set('originLocationCode', _departureLocationCode ?? '');
      /** 到着空港コード */
      formData.set('destinationLocationCode', _arrivalLocationCode ?? '');
      /** ブッキングクラス */
      formData.set('bookingClass', _bookingClass ?? '');
      /** 出発日 */
      formData.set('departureDate', departureDate);
      /** セッションID */
      formData.set('JSessionId', JSessionId ?? '');
      /** AMC会員番号 */
      formData.set('amcMemberNumber', amcMemberNo ?? '');
      /** 搭乗者数(大人) */
      formData.set('numberOfADT', _adt);
      /** 搭乗者数(ヤングアダルト) */
      formData.set('numberOfB15', _b15);
      /** 搭乗者数(小児) */
      formData.set('numberOfCHD', _chd);
      /** 搭乗者数(幼児) */
      formData.set('numberOfINF', _inf);
      /** farefamilyコード */
      formData.set('fareFamilyCode', this.fareFamilyCode ?? '');
      /** farefamily所有航空会社 */
      formData.set('fareFamilyOwnerAirlineCode', AppConstants.CARRIER.TWO_LETTER);
    });
    document.body.append(form);

    // パラメータ送信
    form.submit();
    // パラメータ送信後、削除処理
    document.body.removeChild(form);
  }

  // yyyy-MM-dd'T'HH:mm:ss形式をyyyyMMdd形式に変換する
  private convertDateTimeToDate(_departureDateTime: string | undefined): string {
    if (_departureDateTime === undefined) {
      return '';
    }

    const year = _departureDateTime.substring(0, 4);
    const month = _departureDateTime.substring(5, 7);
    const date = _departureDateTime.substring(8, 10);

    return year + month + date;
  }

  /**
   * Dateオブジェクトを日付文字列のフォーマットへ変換する yyyy-MM-dd
   */
  private convertDateToFormatDateString(date: Date): string {
    if (date !== undefined) {
      return (
        date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
      );
    }
    return '';
  }

  /**
   * ユーザ共通.操作オフィスコード＝オフィスコードとなるASWDB(マスタ)のオフィス.ASWTOP識別を取得
   * @returns
   */
  private getConnectionKind(): string {
    // ユーザ共通.操作オフィスコード=オフィスコードとなるASWDB(マスタ)のオフィス.ASWTOP識別
    let result = '';
    let _officeAll = this._aswMasterSvc.aswMaster[MASTER_TABLE.OFFICE_ALL.key];
    _officeAll.forEach((officeAll: M_OFFICE) => {
      if (officeAll.office_code === this._common.aswContextStoreService.aswContextData.pointOfSaleId) {
        result = officeAll.connection_kind ?? '';
      }
    });
    return result;
  }

  /**
   * TSIdからboundIndexを判別し取得
   * @returns boundIndex
   */
  private getBoundIndex(): number {
    let tsKey = this.airOfferBounds.travelSolutionId?.slice(0, 1);
    if (tsKey === 'o') {
      return 0;
    } else {
      return 1;
    }
  }

  /**
   * 機内サービスアイコンのツールチップ画像要素を生成する
   * @param src アイコンのパス
   * @param altKey alt文言のキー
   * @param width アイコンの幅
   * @param height アイコンの高さ
   * @returns imgタグ
   */
  public getTooltipIconImage(src: string, altKey: string, width: number, height: number): string {
    const alt = this._staticMsgPipe.transform(altKey);
    return `<img src="${src}" alt="${alt}" width="${width}" height="${height}">`;
  }
}
