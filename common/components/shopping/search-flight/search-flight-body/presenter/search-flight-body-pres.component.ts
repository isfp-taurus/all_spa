import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { TabComponent } from '@lib/components';
import { Airport, ApiCommonRequest, LoginStatusType, ValidationErrorInfo } from '@lib/interfaces';
import { AswMasterService, CommonLibService, SystemDateService } from '@lib/services';
import { SupportComponent } from '@lib/components/support-class';
import { OnewayOrMultiCityComponent } from '../sub-components/oneway-or-multicity/oneway-or-multicity.component';
import { RoundtripComponent } from '../sub-components/roundtrip/roundtrip.component';
import { SearchFlightConditionForRequestService, SearchFlightStoreService, LocalDateService } from '@common/services';
import { SearchFlightState, TripType } from '@common/store';
import { SearchFlightBodyPresProps } from './search-flight-body-pres.state';
import { SearchFlightHistorySelectModalService } from '../../search-flight-history-select/search-flight-history-select-modal.service';
import { SearchFlightBodyContComponent } from '@common/components/shopping/search-flight/search-flight-body/container/search-flight-body-cont.component';
import { apiEventAll, defaultApiErrorEvent } from '@common/helper';
import { ErrorType, MOffice, PageType } from '@lib/interfaces';
import { map } from 'rxjs';

@Component({
  selector: 'asw-search-flight-body-pres',
  templateUrl: './search-flight-body-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFlightBodyPresComponent extends SupportComponent {
  /** 親から渡されるプロパティ */
  @Input()
  public props!: SearchFlightBodyPresProps;
  /** 選択中のタブ番号 */
  // FIXME:暫定対応 タブ切り替え時に画面が固まる事象への対応
  private _tabIndex = 0;
  get tabIndex(): number {
    return this._tabIndex;
  }
  @Input()
  set tabIndex(newValue: number) {
    const oldValue = this._tabIndex;
    if (oldValue !== newValue) {
      this._tabIndex = newValue;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _searchFlightState!: SearchFlightState;

  /** 国際判断フラグ */
  @Input()
  public isJapanOnlyFlag: boolean = false;

  @Input()
  public information: {
    departureOriginLocationCode: string | ValidationErrorInfo;
    departureDestinationLocationCode: string | ValidationErrorInfo;
    passengersErrorMsg: string | ValidationErrorInfo;
    originBoundErrorMsg: string | ValidationErrorInfo;
  } = {
    //往復
    departureOriginLocationCode: '',
    departureDestinationLocationCode: '',
    //エラーメッセージ用
    passengersErrorMsg: '',
    originBoundErrorMsg: '',
  };
  @Output()
  changeOptionOpenEvent = new EventEmitter<boolean>();

  @Input() requestParam: any;
  @Input() onewayInformationList: Array<number> = [];
  /** タブ番号 */
  @Output()
  activeNum$ = new EventEmitter<number>();

  // FIXME:暫定対応 タブ切り替え時に画面が固まる事象への対応
  private _activeNum = 0;
  public get activeNum(): number {
    return this._activeNum;
  }
  public set activeNum(newValue: number) {
    const oldValue = this._activeNum;
    if (oldValue !== newValue) {
      this._activeNum = newValue;
      this.activeNum$.emit(newValue);
    }
  }

  /** 空港選択部品押下時出力 */
  @Output()
  changeAirport = new EventEmitter<Airport>();

  /** 出発日選択部品押下時出力 */
  @Output()
  changeDepartureDate = new EventEmitter<Date[]>();
  /** DCS移行開始日前後状態 */
  @Input()
  dcsMigrationDateStatus: string = '';
  /** 旧国内ASW取扱検索条件フラグ */
  @Input()
  oldDomesticAswSearchFlag: boolean = false;

  /** 子コンポーネントの参照 */
  @ViewChild('tabComponent') tabComponent!: TabComponent;
  @ViewChild('roundTripComponent') roundTripComponent!: RoundtripComponent;
  @ViewChild('onewayOrMulticityComponent') onewayOrMulticityComponent!: OnewayOrMultiCityComponent;

  /** 自動検索要否 */
  @Input()
  public autoSearch: boolean = false;

  constructor(
    private common: CommonLibService,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _systemDateSvc: SystemDateService,
    private _aswMasterSvc: AswMasterService,
    private _searchFlightConditionForRequestService: SearchFlightConditionForRequestService,
    private _searchFlightBodyContComponent: SearchFlightBodyContComponent,
    private _localDateService: LocalDateService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super(common);

    // 流入データ
    this.subscribeService('SearchFlightStoreService-getData', this._searchFlightStoreService.searchFlight$, (data) => {
      this._searchFlightState = data;
    });
  }

  reload(): void {}
  init(): void {
    // 自動検索以外の場合
    if (!this.autoSearch) {
      // 出発地と到着地を設定する
      this.departureAndArrivalHandler();
    }
  }
  destroy(): void {}

  /** 旅程種別タブ押下時処理 */
  clickTabEvent(activeNum: number) {
    // FIXME:暫定対応 タブ切り替え時に画面が固まる事象への対応
    this.activeNum = activeNum;
  }

  /** roundtripComponentのストップオーバー入力切替リンク押下時処理 */
  clickStopOverEvent() {
    this.tabComponent.tabClick(1);
    // FIXME:暫定対応 タブ切り替え時に画面が固まる事象への対応
    this.activeNum = this.tabComponent.activeNum;
  }

  /** 出発地・到着地・乗継地値変更時処理 */
  changeAirportEvent(airport: Airport) {
    this.changeAirport.emit(airport);
  }

  /** 出発地・到着地・乗継地値変更時処理 */
  changeDepartureDateEvent(date: Date[]) {
    this.changeDepartureDate.emit(date);
  }

  changeOptionOpen(event: boolean) {
    this.changeOptionOpenEvent.emit(event);
  }

  /** 空判定 */
  private isEmpty(value: String): boolean {
    return !value;
  }

  private departureAndArrivalHandler() {
    if (this.common.aswContextStoreService.aswContextData.loginStatus !== 'NOT_LOGIN') {
      if (this.isDisplayAgain()) {
        return;
      }
      const requestParam = this.requestParam ?? {};
      let defaultAdditionalDaysToNextBound: number = parseInt(
        this._aswMasterSvc.getMPropertyByKey('search', 'defaultAdditionalDaysToNextBound')
      );
      if (this._searchFlightState.tripType === TripType.ROUND_TRIP) {
        let departureDateRoundTrip: Date | null = this._localDateService.getCurrentDate();
        let returnDateRoundTrip: Date | null = this._localDateService.getCurrentDate();
        // 往路出発日のパラメータが存在しない、またはyyyy-MM-dd形式でない場合、往路出発日に現在日時を設定。
        // それ以外の場合は、パラメータをそのまま設定。
        if (
          this.isEmpty(requestParam['departureDate'] as string) ||
          !this._searchFlightBodyContComponent.judgeStringDate(requestParam['departureDate'] as string)
        ) {
          departureDateRoundTrip = this._localDateService.getCurrentDate();
        } else {
          departureDateRoundTrip = this._searchFlightState.roundTrip.departureDate;
        }

        // 復路出発日が存在しない、またはyyyy-MM-dd形式でない場合、復路出発日に対して現在日付＋プロパティマスタから取得した加算日数を設定する。
        // それ以外の場合、パラメータをそのまま設定。
        if (
          this.isEmpty(requestParam['returnDate'] as string) ||
          !this._searchFlightBodyContComponent.judgeStringDate(requestParam['returnDate'] as string)
        ) {
          returnDateRoundTrip.setDate(returnDateRoundTrip.getDate() + defaultAdditionalDaysToNextBound);
        } else {
          returnDateRoundTrip = this._searchFlightState.roundTrip.returnDate;
        }

        const departureOriginLocationCode = this._searchFlightState.roundTrip.departureOriginLocationCode || null;
        const departureDestinationLocationCode =
          this._searchFlightState.roundTrip.departureDestinationLocationCode || null;
        const roundtripState: SearchFlightState = {
          ...this._searchFlightState,
          roundTrip: {
            ...this._searchFlightState.roundTrip,
            departureOriginLocationCode: departureOriginLocationCode,
            departureDestinationLocationCode: departureDestinationLocationCode,
            returnOriginLocationCode: departureDestinationLocationCode,
            returnDestinationLocationCode: departureOriginLocationCode,
            departureDate: departureDateRoundTrip || null,
            returnDate: returnDateRoundTrip || null,
          },
        };
        this._searchFlightStoreService.updateStore(roundtripState);
      }
      if (this._searchFlightState.tripType === TripType.ONEWAY_OR_MULTI_CITY) {
        let departureDate1: Date | null = this._localDateService.getCurrentDate();
        let departureDate2: Date | null = this._localDateService.getCurrentDate();
        // 区間1の出発日のパラメータが存在し、yyyy-MM-dd形式の場合、パラメータを区間1の出発日に設定。
        if (
          !this.isEmpty(requestParam['departureDate1'] as string) &&
          this._searchFlightBodyContComponent.judgeStringDate(requestParam['departureDate1'] as string)
        ) {
          departureDate1 = this._searchFlightState.onewayOrMultiCity[0].departureDate;
        }
        // 区間2の出発日のパラメータが存在し、yyyy-MM-dd形式の場合、パラメータを区間2の出発日に設定。
        if (
          !this.isEmpty(requestParam['departureDate2'] as string) &&
          this._searchFlightBodyContComponent.judgeStringDate(requestParam['departureDate2'] as string)
        ) {
          departureDate2 = this._searchFlightState.onewayOrMultiCity[1]?.departureDate;
        }
        const bounds = this._searchFlightState.onewayOrMultiCity.map((bound, index) => {
          if (index >= 2) return bound;
          if (index == 1)
            return {
              ...bound,
              originLocationCode: bound.originLocationCode || null,
              destinationLocationCode: bound.destinationLocationCode || null,
              departureDate: departureDate2 || null,
            };
          if (index == 0)
            return {
              ...bound,
              originLocationCode: bound.originLocationCode || null,
              destinationLocationCode: bound.destinationLocationCode || null,
              departureDate: departureDate1 || null,
            };
          return bound;
        });
        const oneOrMulticityState: SearchFlightState = {
          ...this._searchFlightState,
          onewayOrMultiCity: bounds,
        };
        this._searchFlightStoreService.updateStore(oneOrMulticityState);
      }
    }
  }

  /** フライト検索画面再表示判定 */
  private isDisplayAgain(): boolean {
    const searchFlightConditionForRequestState = this._searchFlightConditionForRequestService.getData();
    const itineraries = searchFlightConditionForRequestState.request.itineraries;
    return itineraries.length > 0;
  }

  /** 親のshowErrorMsgを子から呼び出す為の処理
   *  外部流入の場合のみ実施
   */
  public showErrorMsg(): void {
    const cont = this._searchFlightBodyContComponent;
    if (
      cont.searchFlightBodyPresComponent != null &&
      cont.searchFlightBodyPresComponent.roundTripComponent != null &&
      cont.requestParam != null
    ) {
      cont.showErrorMsg(cont.checkInputData(undefined, cont.requestParam));
    }
  }
}
