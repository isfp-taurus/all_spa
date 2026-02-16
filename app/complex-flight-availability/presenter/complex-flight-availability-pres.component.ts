import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { SearchFlightHistoryState } from '@common/store/search-flight-history/search-flight-history.state';
import { SearchFlightState } from '@common/store/search-flight/search-flight.state';
import { SupportComponent } from '@lib/components/support-class';
import { AswMasterService, CommonLibService } from '@lib/services';
import { ComplexResponse } from 'src/sdk-search/model/complexResponse';
import { complexFlightAvailabilityPresProps, Travelers } from './complex-flight-availability-pres.state';
import { FareTypeSelectorModalService } from '@common/components/shopping/search-flight/fare-type-selector/fare-type-selector-modal.service';
import { FlightType } from '@common/components/shopping/cabin-class-selector/cabin-class-selector.state';
import { ComplexFmfFareFamily } from 'src/sdk-search/model/complexFmfFareFamily';
import { ComplexRequest, Items, NumberOfTravelers } from 'src/sdk-search';
import { Bound } from 'src/sdk-search/model/bound';
import { isPC } from '@lib/helpers';
import { fromEvent } from 'rxjs';
import { ComplexFlightAvailabilityTeleportService } from '../service/teleport.service';
import { fetchComplexRequestData } from '../helper/data';
import { FlightDetailModalService } from '@common/components/shopping/flight-detail/flight-detail-modal.service';
import { ComplexFlightAvailabilityStoreService } from '../service/store.service';
import {
  FlightDetail,
  FlightDetailSegment,
} from '@app/roundtrip-flight-availability-international/presenter/roundtrip-flight-availability-international-pres.state';
import { MASTER_TABLE } from '@conf/asw-master.config';
import { RoundtripFlightAvailabilityInternationalPresService } from '@app/roundtrip-flight-availability-international/presenter/roundtrip-flight-availability-international-pres.service';
import { StaticMsgPipe } from '@lib/pipes';

@Component({
  selector: 'asw-complex-flight-availability-pres',
  templateUrl: './complex-flight-availability-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplexFlightAvailabilityPresComponent extends SupportComponent {
  public complexFlightAvailability?: ComplexResponse;
  public searchFlight?: SearchFlightState;
  public selectedFFIndex: number = 0;

  /** 選択されているキャビンクラス */
  public selectedCabinClass: string = '';

  /** 運賃オプション切替ボタンの表示非表示 */
  public selectedFareOptionType: string = '';

  /** リクエスト検索条件 */
  public complexRequest?: ComplexRequest;

  /* 気に入るリスト */
  public favorites: Items[] = [];

  /** 日本の地域コード文字列 */
  readonly REGION_CODE_JAPAN = '01';

  // 画面描画用  搭乗者情報 travelers
  public travelers: NumberOfTravelers = { ADT: 0, B15: 0, CHD: 0, INF: 0 };

  /** 画面表示用 搭乗者人数 */
  public travelersLabel: string = '';

  public fareFamilies?: ComplexFmfFareFamily[];
  public accrualMiles?: number;
  public isMilesDisplay: boolean = false;
  public numberOfConnections: number = 0;
  public duration: string = '';
  public bounds?: Bound[] = [];
  public fareFamilyIndex = 0;

  // 選択中FF情報
  public fareFamily?: ComplexFmfFareFamily;

  // フライト検索画面(R01-P010)の[日本国内単独旅程判定処理]の結果
  public flightType?: FlightType;
  public japanOnlyFlag?: boolean;

  public cabinClass?: string;

  // 空席照会日時(サイト時刻)
  public searchedDateTime = '';

  //端末認識処理
  public isPc = isPC();
  public isPcPre = isPC();

  /** 画面描画用 検索結果フッタ表示情報フラグ */
  public isShowFooter: boolean = false;

  public isPromotion: boolean = false;

  public displayFareFamilies?: Array<ComplexFmfFareFamily>;

  /** コンストラクタ */
  constructor(
    protected common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _fareTypeSelectorModalService: FareTypeSelectorModalService,
    private _flightDetailModalService: FlightDetailModalService,
    private _teleportService: ComplexFlightAvailabilityTeleportService,
    private _storeService: ComplexFlightAvailabilityStoreService,
    private _aswMasterSvc: AswMasterService,
    private _roundtripFlightAvailabilityInternationalPresService: RoundtripFlightAvailabilityInternationalPresService,
    private _staticMsg: StaticMsgPipe
  ) {
    super(common);
  }

  public _props?: complexFlightAvailabilityPresProps;
  @Input()
  set props(data: complexFlightAvailabilityPresProps | undefined) {
    this._props = data;
    this.isShowFooter = this._props?.isShowFooter ?? false;
    this.complexRequest = this._props?.complexRequest;
    this.searchedDateTime = this._props?.searchedDateTime ?? '';
    this.selectedFFIndex = this._props?.selectedFFIndex ?? 0;
    this.flightType = this._props?.searchResultTripType;
    this.japanOnlyFlag = this._props?.japanOnlyFlag;
    this.displayFareFamilies = this._props?.displayFareFamilies;

    this._initData();
  }
  get props(): complexFlightAvailabilityPresProps | undefined {
    return this._props ? { ...this._props } : undefined;
  }

  /** 初期表示処理 */
  init() {
    this.subscribeService('GovApprovalResize', fromEvent(window, 'resize'), this.resizeEvent);

    this._teleportService.multiReceive(['searchedDateTime'], this._multiHandler);
  }

  /** 画面終了時処理 */
  destroy() {
    this.deleteSubscription('GovApprovalResize');
  }

  /** 画面更新時処理 */
  reload() {}

  /**
   * 多重イベント
   * @param dateTime 空席照会日時(サイト時刻)
   * @param selectedFFIndex FFの選択インデックスを変えるインデックス
   * @param searchResultTripType searchResultTripType
   */
  private _multiHandler = (dateTime: string) => {
    this.searchedDateTime = this._dateConversion(dateTime);
    this._changeDetectorRef.markForCheck();
  };

  // 初期表示処理
  private async _initData() {
    const requestMock = await fetchComplexRequestData(this._storeService);
    this.travelers = requestMock.travelers as Travelers;
    // 搭乗者人数のラベル更新
    this.updateTravelersLabel();
    this.complexFlightAvailability = this._props?.complexFlightAvailabilityResponse ?? {};
    this.searchFlight = this._props?.searchFlight;
    this.fareFamilies = this.complexFlightAvailability?.data?.fareFamilies ?? [];
    this._setPromotionDisplay();

    this._initSearchFlightData();

    this.setTargetBounds(this.selectedFFIndex);

    this._changeDetectorRef.markForCheck();
  }

  // 画面サイズの変更検知
  private resizeEvent = () => {
    this.isPcPre = this.isPc;
    this.isPc = isPC();
    if (this.isPcPre !== this.isPc) {
      this._changeDetectorRef.markForCheck();
    }
  };

  /** duration設定 */
  private convertSecondToHourSecond(second: number): string {
    const hh = `${String(Math.floor(second / 3600))}`.padStart(2, '0');
    const mm = `${String(Math.floor((second % 3600) / 60))}`.padStart(2, '0');
    return `${hh}:${mm}`;
  }

  /** fare-panelで選択したFFのbounds設定 */
  public setTargetBounds(index: number) {
    if (!this.fareFamilies || this.fareFamilies.length <= index) {
      this.fareFamilyIndex = index;
      this.selectedFFIndex = index;
      return;
    }

    this.fareFamily = this.displayFareFamilies?.[index];
    this.bounds = this.fareFamily?.airOffers?.[0]?.bounds;
    this.numberOfConnections = this.fareFamily?.airOffers?.[0]?.numberOfConnections ?? 0;
    this.duration = this.convertSecondToHourSecond(this.fareFamily?.airOffers?.[0]?.duration ?? 0);
    this.isMilesDisplay = this.fareFamily?.airOffers?.[0]?.accrualMiles !== undefined;
    this.accrualMiles = this.fareFamily?.airOffers?.[0]?.accrualMiles ?? 0;

    this.fareFamilyIndex = index;
    this.selectedFFIndex = index;
    this._storeService?.updateComplexFlightAvailabilityState({
      selectedFareFamily: this.fareFamily,
      selectedFFIndex: index,
    });
  }

  /**
   * 「非同期」フライト詳細モーダルを開く
   * @param { {event: Event, boundIndex: number} } event templateからのパラメーター
   */
  public async openFlightDetailModal(event: { event: Event; boundIndex: number }) {
    const boundIndex = event.boundIndex;
    const bound = this.bounds?.[boundIndex];
    this.subscribeService(
      'flightDetailGetCache',
      this._aswMasterSvc.load([MASTER_TABLE.M_LIST_DATA_930, MASTER_TABLE.AIRLINE_I18NJOINALL], true),
      () => {
        this.deleteSubscription('flightDetailGetCache');
        const flightDetailObj = {
          flightDetailHeader: this._roundtripFlightAvailabilityInternationalPresService.createFlightDetailHeader(
            bound ?? {}
          ),
          flightDetailSegment: this._roundtripFlightAvailabilityInternationalPresService.createFlightDetailSegment(
            bound ?? {},
            boundIndex
          ) as FlightDetailSegment[],
        } as FlightDetail;
        this._flightDetailModalService.openModal(flightDetailObj);
      }
    );
  }

  private async _initSearchFlightData() {
    // リクエスト検索条件を取得する
    this.complexRequest = await fetchComplexRequestData(this._storeService);
    this.selectedFareOptionType = this.complexRequest.fare.fareOptionType ?? '';
  }

  /** date-formatに合わせた検索時刻の変換処理 */
  private _dateConversion(dateTime: string) {
    return new Date(dateTime).toISOString().slice(0, 19);
  }

  /**
   * 運賃オプション切替ボタン押下時処理
   * @param event
   */
  public openFareOptionTypeModal(event: Event) {
    const japanOnlyFlag = this.japanOnlyFlag ?? false;
    this._fareTypeSelectorModalService.openModal(this.selectedFareOptionType, this.selectedCabinClass, japanOnlyFlag);
  }

  /** プロモーションアイコンの凡例出し分け */
  private _setPromotionDisplay() {
    this.fareFamilies &&
      this.fareFamilies?.forEach((fareFamily: ComplexFmfFareFamily) => {
        if (fareFamily.isPromotionApplied) this.isPromotion = true;
      });
    !this.isPromotion &&
      this.displayFareFamilies?.forEach((fareFamily) => {
        if (!!fareFamily.airOffers?.[0]?.prices?.totalPrice?.discount) this.isPromotion = true;
      });
  }

  /** 搭乗者人数のラベル更新 */
  private updateTravelersLabel() {
    const travelerList = [];

    if (this.travelers.ADT > 0) {
      const text = this._staticMsg.transform('label.passengerAdult', { '0': this.travelers.ADT.toString() });
      travelerList.push(text);
    }
    if (this.travelers.B15 > 0) {
      const text = this._staticMsg.transform('label.passengerYoungAdult', { '0': this.travelers.B15.toString() });
      travelerList.push(text);
    }
    if (this.travelers.CHD > 0) {
      const text = this._staticMsg.transform('label.passengerChild', { '0': this.travelers.CHD.toString() });
      travelerList.push(text);
    }
    if (this.travelers.INF > 0) {
      const text = this._staticMsg.transform('label.passengerInfant', { '0': this.travelers.INF.toString() });
      travelerList.push(text);
    }

    this.travelersLabel = travelerList.join(`${this._staticMsg.transform('label.paxNumberDelimiter')} `);
  }
}
