import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { SupportComponent } from '@lib/components/support-class';
import {
  InputComponent,
  SelectComponent,
  AirportComponent,
  DateSelectorParts,
  DateSelectorComponent,
  CheckboxComponent,
} from '@lib/components';
import { AirportListParts } from '@lib/components/shared-ui-components/airport/airport.state';
import { AswContextStoreService, AswMasterService, CommonLibService, ErrorsHandlerService } from '@lib/services';
import { SearchFlightState, TripType, SearchFlightConstant } from '@common/store/search-flight';
import {
  PassengersCount,
  DefaultPassengersCount,
} from '@common/components/shopping/search-flight/passenger-selector/passenger-selector.state';
import { SearchFlightBodyPresProps } from '../../presenter/search-flight-body-pres.state';
import { Airport, PageType, ValidationErrorInfo } from '@lib/interfaces';
import { StaticMsgPipe } from '@lib/pipes';
import { SearchFlightStoreService } from '@common/services/store/search-flight/search-flight-store/search-flight-store.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { of } from 'rxjs/internal/observable/of';
import { take } from 'rxjs/operators';
import { ShoppingLibService } from '@common/services/shopping/shopping-lib/shopping-lib.service';
import { FareTypeSelectorModalService } from '@common/components/shopping/search-flight/fare-type-selector/fare-type-selector-modal.service';
import { SearchFlightHistorySelectModalService } from '@common/components/shopping/search-flight/search-flight-history-select/search-flight-history-select-modal.service';
import { interval } from 'rxjs/internal/observable/interval';
import { AswValidators } from '@lib/helpers/validate/validators';
import { convertStringToDate } from '@lib/helpers';

@Component({
  selector: 'asw-roundtrip',
  templateUrl: './roundtrip.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundtripComponent extends SupportComponent implements AfterViewInit, OnChanges {
  public originAirportControl: FormControl = new FormControl('', this.originValidator.bind(this));
  public destinationAirportControl: FormControl = new FormControl('', this.destinationValidator.bind(this));
  public originTransitAirportControl: FormControl = new FormControl('', this.originTransitValidator.bind(this));
  public destinationTransitAirportControl: FormControl = new FormControl(
    '',
    this.destinationTransitValidator.bind(this)
  );
  public departureDateControl: FormControl = new FormControl('', this.originDepartDateValidator.bind(this));
  public returnDateControl: FormControl = new FormControl('', this.returnDepartDateValidator.bind(this));
  public departureAndReturnDateFormGroup: FormGroup = new FormGroup({
    departureDate: this.departureDateControl,
    returnDate: this.returnDateControl,
  });
  public roundFormGroup: Map<string, FormControl | FormGroup> = new Map();

  constructor(
    protected common: CommonLibService,
    private staticMsg: StaticMsgPipe,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _shoppingLibService: ShoppingLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _fareTypeSelectorModalService: FareTypeSelectorModalService,
    private _searchFlightHistorySelectModalService: SearchFlightHistorySelectModalService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _aswContextStoreSvc: AswContextStoreService,
    private _aswMasterSvc: AswMasterService
  ) {
    super(common);
    this.searchFlightData = this._searchFlightStoreService.getData();
    this.roundFormGroup.set('originLocationCode', this.originAirportControl);
    this.roundFormGroup.set('destinationLocationCode', this.destinationAirportControl);
    this.roundFormGroup.set('departureConnectionLocationCode', this.originTransitAirportControl);
    this.roundFormGroup.set('returnConnectionLocationCode', this.destinationTransitAirportControl);
    this.roundFormGroup.set('departureAndReturnDate', this.departureAndReturnDateFormGroup);
  }

  // 出発地
  originValidator(control: AbstractControl) {
    // valueが存在しない場合エラー情報を返却
    if (!control.value) {
      return {
        'validate-flight': {
          errorMsgId: 'E0002',
          params: {
            key: 0,
            value: this.staticMsg.transform('label.departureLocation'),
            dontTranslate: true,
          },
        },
      };
    }
    // 空港存在チェック処理
    if (this.notExistAirport(control, this.selectedOriginAirport, this.originAirportComponent)) {
      return {
        errorMsgId: 'E0059',
      };
    }

    // 空港一致チェック処理
    const checkRet = this.checkSameAirport();

    // NGの場合
    if (checkRet) {
      return checkRet;
    }

    return null;
  }

  // 到着地
  destinationValidator(control: AbstractControl) {
    // valueが存在しない場合エラー情報を返却
    if (!control.value) {
      return {
        'validate-flight': {
          errorMsgId: 'E0002',
          params: {
            key: 0,
            value: this.staticMsg.transform('label.arrivalLocation'),
            dontTranslate: true,
          },
        },
      };
    }
    // 空港存在チェック処理
    if (this.notExistAirport(control, this.selectedDestinationAirport, this.destinationAirportComponent)) {
      return {
        errorMsgId: 'E0059',
      };
    }

    // 空港一致チェック処理
    const checkRet = this.checkSameAirport();

    // NGの場合
    if (checkRet) {
      return checkRet;
    }

    return null;
  }

  // 往路乗継地
  originTransitValidator(control: AbstractControl) {
    if (!control.value) {
      return null;
    }

    // 空港存在チェック処理
    if (this.notExistAirport(control, this.selectedTransitDepartAirport, this.transitDepartComponent)) {
      return {
        errorMsgId: 'E0059',
      };
    }

    return null;
  }

  // 復路乗継地
  destinationTransitValidator(control: AbstractControl) {
    if (!control.value) {
      return null;
    }

    // 空港存在チェック処理
    if (this.notExistAirport(control, this.selectedTransitReturnAirport, this.transitReturnComponent)) {
      return {
        errorMsgId: 'E0059',
      };
    }

    return null;
  }

  // 往路出発日
  originDepartDateValidator(control: AbstractControl) {
    if (!control.value) {
      return {
        'validate-flight': {
          errorMsgId: 'E0002',
          params: {
            key: 0,
            value: this.staticMsg.transform('label.departReturnDays'),
            dontTranslate: true,
          },
        },
      };
    }
    return null;
  }

  // 復路出発日
  returnDepartDateValidator(control: AbstractControl) {
    if (!control.value) {
      return {
        'validate-flight': {
          errorMsgId: 'E0002',
          params: {
            key: 0,
            value: this.staticMsg.transform('label.departReturnDays'),
            dontTranslate: true,
          },
        },
      };
    }
    return null;
  }

  // [空港一致チェック処理]
  checkSameAirport() {
    const origin = this.selectedOriginAirport
      ? this.selectedOriginAirport.airport_code
      : this.originAirportControl.value;
    const destination = this.selectedDestinationAirport
      ? this.selectedDestinationAirport.airport_code
      : this.destinationAirportControl.value;
    if (origin === destination) {
      return {
        errorMsgId: 'E0060',
      };
    } else {
      return null;
    }
  }

  // [空港存在チェック処理]
  notExistAirport(control: AbstractControl, selectedAirport: Airport | null, airportComponent: AirportComponent) {
    return (
      (!selectedAirport || control.value !== selectedAirport.name) &&
      !airportComponent.airportList.some((item) => item.airport_code === control.value)
    );
  }

  reload() {}
  init() {
    // 有償/特典指定リストの作成および初期値設定(初期値は有償で設定)
    this.awardOptions = this._shoppingLibService.getAwardList();
    this.selectedAwardOption = 'priced';

    // ログインステータスでプルダウン選択肢切り替え
    this.subscribeService('loginStatus FlightSearch', this.common.aswContextStoreService.getAswContext$(), (data) => {
      this.deleteSubscription('loginStatus FlightSearch');
      if (data.loginStatus !== 'REAL_LOGIN' || this._shoppingLibService.isAnaBizLogin()) {
        this.awardOptions = this.awardOptions.filter((option) => {
          return option.value === 'priced';
        });
      }
    });

    // ユーザ共通.POS国コードを取得する
    this.posCountryCode = this._aswContextStoreSvc.aswContextData.posCountryCode;
    // Storeの値変更時に入力項目に値を渡す処理を定義
    this.subscribeService('SearchFlightStoreServiceRoundtrip', this._searchFlightStoreService.searchFlight$, (data) => {
      this.searchFlightData = data;
      if (data.tripType === TripType.ROUND_TRIP) {
        // 「一般/特典」選択肢の設定
        this.selectedAwardOption = data.fare.awardOption || 'priced';
        // 「一般/特典」選択肢に合わせた運賃オプションプルダウン表示/非表示設定
        this.setFareTypeShow(this.selectedAwardOption);
        // キャビンクラスリストを更新
        this.cabinClassOptions = this._shoppingLibService.getCabinList(data.isJapanOnly);
        this.isJapanOnlyFlag = data.isJapanOnly;
        this.dcsMigrationDateStatus = data.dcsMigrationDateStatus;
        if (data.roundTrip.isOpenSearchOption != null) {
          this.isOpenSearchOption = data.roundTrip.isOpenSearchOption;
        }
        this.setInputValues(data);
        this._changeDetectorRef.detectChanges();
        // SearchFlightBodyPresComponentのshowErrorMsg()を実行
        this.showErrorMsg.emit();
      }
    });

    // 値監視の開始
    this.subscriptionStart();

    // 項目初期設定
    this.setInputValues(this.searchFlightData);
  }

  destroy() {
    this.subscriptionStop();
  }
  /** 初期表示時のViewChildの値更新はここで実施 */
  ngAfterViewInit(): void {
    // ViewChildの直接値変更は開発環境でのみ、自動プロパティチェック後に値変更したことでエラーが発生する エラー回避のため1回だけ実行のsubscribeで実行タイミングをずらす
    this.subscribeService('RoundtripComponent', of(1).pipe(take(1)), () => {
      if (this.selectedDepartureDate != null && this.selectedReturnDate != null) {
        this.departureAndReturnDateComponent.setDate(this.selectedDepartureDate!, this.selectedReturnDate!);
      }
    });
    this._searchFlightStoreService.updateStore(this.searchFlightData);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isEnabled'] || changes['isJapanOnlyFlag']) {
      if (this.posCountryCode !== 'JP') {
        const cabinClassOptionsList = this._shoppingLibService.getCabinList(this.isJapanOnlyFlag);
        this.cabinClassOptions = cabinClassOptionsList.map((v) => {
          return { value: v.value, textContent: v.textContent };
        });
        this.setInputValues(this.searchFlightData);
      }
    }
  }

  /** 出発時間帯 最小値 */
  public TIME_WINDOW_MIN = SearchFlightConstant.TIME_WINDOW_MIN;
  /** 出発時間帯 最大値 (分単位) */
  public TIME_WINDOW_MAX = SearchFlightConstant.TIME_WINDOW_MAX;
  /** 出発時間帯 目盛り (分単位) */
  public readonly TIME_WINDOW_STEP = 120;

  /** フォームコントロールに渡すsetValueのオプション */
  private readonly OPTION_FORM_CONTROL_SET_VALUE = {
    onlySelf: true,
    emitEvent: false,
  };

  /** フライト検索画面 Storeに格納しているState */
  private searchFlightData!: SearchFlightState;

  /** 親コンポーネントから渡されるプロパティ */
  public _props!: SearchFlightBodyPresProps;
  @Input()
  get props(): SearchFlightBodyPresProps {
    return this._props;
  }
  set props(value: SearchFlightBodyPresProps) {
    this._props = value;
    // 画面項目を設定する
    this.setViewValues();
    this._changeDetectorRef.detectChanges();
  }

  /** このコンポーネントの活性状態 */
  @Input()
  public isEnabled: boolean = true;

  /** バリデーションチェック フォームコントロール*/
  @Input()
  public information: {
    departureOriginLocationCode: string | ValidationErrorInfo;
    departureDestinationLocationCode: string | ValidationErrorInfo;
    passengersErrorMsg: string | ValidationErrorInfo;
    originBoundErrorMsg: string | ValidationErrorInfo;
  } = {
    // 往復
    departureOriginLocationCode: '',
    departureDestinationLocationCode: '',
    // エラーメッセージ用
    passengersErrorMsg: '',
    originBoundErrorMsg: '',
  };
  @Input() formGroup!: FormGroup;
  /** 空港選択部品の値変更時に発火するイベント */

  /** 国内判断フラグ */
  @Input()
  public isJapanOnlyFlag: boolean = false;

  @Input()
  /** 区間オプション表示 */
  public isOpenSearchOption: boolean = false;

  @Output()
  public changeAirport = new EventEmitter<Airport>();

  /** ストップオーバー入力切替リンク押下時処理時に発火するイベント */
  @Output()
  public clickStopOver = new EventEmitter();

  /** Search Optionsボタン */
  @ViewChild('searchOptionButton') searchOptionButton!: ElementRef;
  /** Search Options押下で開閉する要素 */
  @ViewChild('drawerOptions') drawerOptions!: ElementRef;
  /** 空港選択部品 往路乗継地 */
  @ViewChild('transitDepartComponent') transitDepartComponent!: AirportComponent;
  /** 空港選択部品 復路乗継地 */
  @ViewChild('transitReturnComponent') transitReturnComponent!: AirportComponent;
  /** 出発日選択部品 */
  @ViewChild('departureAndReturnDateComponent') departureAndReturnDateComponent!: DateSelectorComponent;
  @ViewChild('departureAndReturnDateComponent', { read: ElementRef }) departureAndReturnDateComponentRef!: ElementRef;
  /** 空港選択部品 出発地*/
  @ViewChild('originAirportComponent') originAirportComponent!: AirportComponent;
  @ViewChild('destinationAirportComponent') destinationAirportComponent!: AirportComponent;

  // 画面制御変数

  // 画面項目コンポーネントに渡す設定値
  // 空港選択肢
  public airportListPartsFrom!: AirportListParts;
  public airportListPartsTo!: AirportListParts;
  public airportListPartsTransit!: AirportListParts;

  // baseDate,lastDateの設定処理
  public dateSelectorParts!: DateSelectorParts;

  // cabinClass用Selectタグの選択肢
  public cabinClassOptions: Array<{ value: string; textContent: string }> = [{ value: '', textContent: '' }];
  public awardOptions: Array<{ value: string; textContent: string }> = [{ value: '', textContent: '' }];

  // 内部で使用する出発地の変数
  public selectedOriginAirport: Airport | null = null;
  // 内部で使用する到着地の変数
  public selectedDestinationAirport: Airport | null = null;
  // 内部で使用する往路乗継地の変数
  public selectedTransitDepartAirport: Airport | null = null;
  // 内部で使用する復路乗継地の変数
  public selectedTransitReturnAirport: Airport | null = null;

  // 入力値の取得と設定を行うオブジェクト
  public formControlDepartureTimeWindow: FormControl = new FormControl();
  public selectedDepartureDate: Date | undefined = undefined;
  public formControlReturnTimeWindow: FormControl = new FormControl();
  public selectedReturnDate: Date | undefined = undefined;
  public passengersCount: PassengersCount = {
    adultCount: DefaultPassengersCount.ADULT,
    youngAdultCount: DefaultPassengersCount.YOUNG_ADULT,
    childCount: DefaultPassengersCount.CHILD,
    infantCount: DefaultPassengersCount.INFANT,
  };
  public formControlCompareFaresNearbyDates: FormControl<boolean | null> = new FormControl<boolean>(false);
  public formControlDepartureConnectionTime: FormControl = new FormControl(0);
  public formControlReturnConnectionTime: FormControl = new FormControl();
  public selectedFareOptionType = '';
  public selectedCabinClass = '';
  public selectedAwardOption = '';
  public departureAirportList: Airport[] | undefined = undefined;
  public destinationAirportList: Airport[] | undefined = undefined;
  public transitAirportList: Airport[] | undefined = undefined;

  /** ユーザ共通.POS国コード */
  public posCountryCode = '';
  /** キャビンクラスに紐づく運賃オプションの存在フラグ */
  public isFareTypeShow: boolean = true;
  @Output()
  public changeDepartureDate = new EventEmitter<Date[]>();
  /** DCS移行開始日前後状態 */
  @Input()
  dcsMigrationDateStatus: string = '';

  private _oldDomesticAswSearchFlag: boolean = false;

  /** 旧国内ASW取扱検索条件フラグ */
  @Input() set oldDomesticAswSearchFlag(value: boolean) {
    if (value) {
      this.destinationTransitAirportControl.disable();
      this.originTransitAirportControl.disable();
    } else {
      this.destinationTransitAirportControl.enable();
      this.originTransitAirportControl.enable();
    }
    this._oldDomesticAswSearchFlag = value;
  }
  get oldDomesticAswSearchFlag(): boolean {
    return this._oldDomesticAswSearchFlag;
  }

  @Output()
  private showErrorMsg = new EventEmitter();

  /** 一時停止をするサブスクリプションのリスト */
  private _subscriptionCanPauseList: Subscription[] = [];

  // 入力フォームのイベント処理の実行を有効/無効にする ストア更新で入力フォームの値を変更したとき、コードからの値変更でイベント発火するコンポーネントによって無限ループに入るのを避けるため
  private eventEnabled: boolean = true;

  /** フォームコントロールのサブスクリプションを開始する */
  private subscriptionStart() {
    // フォームコントロールの値変更を監視し、ストアへの値格納処理を実行

    /** 前後日付表示オプション */
    this._subscriptionCanPauseList.push(
      this.formControlCompareFaresNearbyDates.valueChanges.subscribe((data) => {
        if (this.searchFlightData.tripType === TripType.ROUND_TRIP) {
          if (data !== this.searchFlightData.displayInformation.compareFaresNearbyDates) {
            const state: SearchFlightState = {
              ...this.searchFlightData,
              displayInformation: {
                ...this.searchFlightData.displayInformation,
                compareFaresNearbyDates: data ?? false,
              },
            };
            this._searchFlightStoreService.updateStore(state);
          }
        }
      })
    );
    /** 往路出発時間帯 */
    this._subscriptionCanPauseList.push(
      this.formControlDepartureTimeWindow.valueChanges.subscribe((data) => {
        if (this.searchFlightData.tripType === TripType.ROUND_TRIP) {
          let from: number | null;
          let to: number | null;
          if (data != null && Array.isArray(data) && data.length >= 2) {
            from = data[0];
            to = data[1];
          } else {
            from = this.TIME_WINDOW_MIN;
            to = this.TIME_WINDOW_MAX;
          }
          if (
            from !== this.searchFlightData.roundTrip.departureTimeWindowFrom ||
            to !== this.searchFlightData.roundTrip.departureTimeWindowTo
          ) {
            const state: SearchFlightState = {
              ...this.searchFlightData,
              roundTrip: {
                ...this.searchFlightData.roundTrip,
                departureTimeWindowFrom: from,
                departureTimeWindowTo: to,
              },
            };
            this._searchFlightStoreService.updateStore(state);
          }
        }
      })
    );

    /** 復路出発時間帯 */
    this._subscriptionCanPauseList.push(
      this.formControlReturnTimeWindow.valueChanges.subscribe((data) => {
        if (this.searchFlightData.tripType === TripType.ROUND_TRIP) {
          let from: number | null;
          let to: number | null;
          if (data !== null && Array.isArray(data) && data.length >= 2) {
            from = data[0];
            to = data[1];
          } else {
            from = this.TIME_WINDOW_MIN;
            to = this.TIME_WINDOW_MAX;
          }
          if (
            from !== this.searchFlightData.roundTrip.returnTimeWindowFrom ||
            to !== this.searchFlightData.roundTrip.returnTimeWindowTo
          ) {
            const state: SearchFlightState = {
              ...this.searchFlightData,
              roundTrip: {
                ...this.searchFlightData.roundTrip,
                returnTimeWindowFrom: from,
                returnTimeWindowTo: to,
              },
            };
            this._searchFlightStoreService.updateStore(state);
          }
        }
      })
    );

    /** 往路最低乗継時間 */
    this._subscriptionCanPauseList.push(
      this.formControlDepartureConnectionTime.valueChanges.subscribe((data) => {
        if (this.searchFlightData.tripType === TripType.ROUND_TRIP) {
          if (data !== this.searchFlightData.roundTrip.departureConnection.connectionTime) {
            const state: SearchFlightState = {
              ...this.searchFlightData,
              roundTrip: {
                ...this.searchFlightData.roundTrip,
                departureConnection: {
                  ...this.searchFlightData.roundTrip.departureConnection,
                  connectionTime: data,
                },
              },
            };
            this._searchFlightStoreService.updateStore(state);
          }
        }
      })
    );

    /** 復路最低乗継時間 */
    this._subscriptionCanPauseList.push(
      this.formControlReturnConnectionTime.valueChanges.subscribe((data) => {
        if (this.searchFlightData.tripType === TripType.ROUND_TRIP) {
          if (data !== this.searchFlightData.roundTrip.returnConnection.connectionTime) {
            const state: SearchFlightState = {
              ...this.searchFlightData,
              roundTrip: {
                ...this.searchFlightData.roundTrip,
                returnConnection: {
                  ...this.searchFlightData.roundTrip.returnConnection,
                  connectionTime: data,
                },
              },
            };
            this._searchFlightStoreService.updateStore(state);
          }
        }
      })
    );
  }

  /** フォームコントロールのサブスクリプションを停止する */
  private subscriptionStop() {
    this._subscriptionCanPauseList
      .filter((subscription) => subscription != null)
      .forEach((subscription) => subscription.unsubscribe());
    this._subscriptionCanPauseList = [];
  }

  /** 受け取った画面描画用データを基に、この部品の画面描画用データを設定 */
  private setViewValues() {
    // CabinClass選択肢の設定
    this.cabinClassOptions = this._shoppingLibService.getCabinList(this.isJapanOnlyFlag);

    // 空港選択部品
    this.airportListPartsFrom = this.props.airportListPartsFrom;
    this.airportListPartsTo = this.props.airportListPartsTo;
    this.airportListPartsTransit = this.props.airportListPartsTransit;

    // 空港部品の空港リストと地域リスト設定
    this.preAirportRegionDataSetting();

    // 出発日選択部品
    this.dateSelectorParts = {
      isRoundTrip: true,
    };

    // 区間オプション表示
    this.isOpenSearchOption = this.searchFlightData.roundTrip.isOpenSearchOption ?? false;
  }

  /** 空港部品の空港リストと地域リスト設定 */
  private preAirportRegionDataSetting() {
    const airportListKey = this._shoppingLibService.getAirportListKey();
    // 出発地空港リスト
    this.departureAirportList = this.isNotEmpty(airportListKey.departureAirportListKey)
      ? this._aswMasterSvc.aswMaster[airportListKey.departureAirportListKey]
      : undefined;
    //到着地空港リスト
    this.destinationAirportList = this.isNotEmpty(airportListKey.destinationAirportListKey)
      ? this._aswMasterSvc.aswMaster[airportListKey.destinationAirportListKey]
      : undefined;
    // 出発地地域リスト
    let departureRegionList = this.isNotEmpty(airportListKey.departureRegionListKey)
      ? this._aswMasterSvc.aswMaster[airportListKey.departureRegionListKey]
      : undefined;
    // 到着地地域リスト
    let destinationRegionList = this.isNotEmpty(airportListKey.destinationRegionListKey)
      ? this._aswMasterSvc.aswMaster[airportListKey.destinationRegionListKey]
      : undefined;
    this.airportListPartsFrom = {
      ...this.airportListPartsFrom,
      airportList: this.departureAirportList!,
      regionList: departureRegionList!,
    };
    this.airportListPartsTo = {
      ...this.airportListPartsTo,
      airportList: this.destinationAirportList!,
      regionList: destinationRegionList!,
    };
    this.airportListPartsTransit = {
      ...this.airportListPartsTransit,
      airportList: this.destinationAirportList!,
      regionList: destinationRegionList!,
    };
  }

  /** ストアを利用した画面項目の値設定 */
  private setInputValues(data: SearchFlightState): void {
    // バインドされたフォームコントロールはsetValueを実行するとvalueChangesで値変更の通知をするので一時的に値監視を停止
    this.subscriptionStop();
    // 入力フォームに値を設定することで発生するイベントを、起こさないように設定
    this.eventEnabled = false;

    this.searchFlightData = data;

    // 出発地
    this.selectedOriginAirport = this.getAirportFromCache(data.roundTrip.departureOriginLocationCode!, 'origin');
    // 不正空港の場合、formcontrolに設定、表示する
    if (data.roundTrip.departureOriginLocationCode && !this.selectedOriginAirport) {
      this.originAirportControl.setValue(data.roundTrip.departureOriginLocationCode);
    }

    // 到着地
    this.selectedDestinationAirport = this.getAirportFromCache(
      data.roundTrip.departureDestinationLocationCode!,
      'destination'
    );
    // 不正空港の場合、formcontrolに設定、表示する
    if (data.roundTrip.departureDestinationLocationCode && !this.selectedDestinationAirport) {
      this.destinationAirportControl.setValue(data.roundTrip.departureDestinationLocationCode);
    }

    // 往路出発日・復路出発日 ひとつの部品で管理のため、同時設定
    if (data.roundTrip.departureDate != null || data.roundTrip.returnDate != null) {
      if (data.roundTrip.departureDate) {
        const departureDate =
          typeof data.roundTrip.departureDate === 'string'
            ? convertStringToDate(data.roundTrip.departureDate)
            : new Date(data.roundTrip.departureDate);
        if ((this.selectedDepartureDate?.getTime() ?? 0) !== departureDate.getTime()) {
          this.selectedDepartureDate = departureDate;
        }
      } else {
        this.selectedDepartureDate = undefined;
      }
      if (data.roundTrip.returnDate) {
        const returnDate =
          typeof data.roundTrip.returnDate === 'string'
            ? convertStringToDate(data.roundTrip.returnDate)
            : new Date(data.roundTrip.returnDate);
        if ((this.selectedReturnDate?.getTime() ?? 0) !== returnDate.getTime()) {
          this.selectedReturnDate = returnDate;
        }
      } else {
        this.selectedReturnDate = undefined;
      }
      this.departureAndReturnDateComponent.setDate(this.selectedDepartureDate, this.selectedReturnDate);
    }

    // 往路出発時間帯[開始,終了]
    this.formControlDepartureTimeWindow.setValue(
      [data.roundTrip.departureTimeWindowFrom, data.roundTrip.departureTimeWindowTo],
      this.OPTION_FORM_CONTROL_SET_VALUE
    );

    // 復路出発時間帯[開始,終了]
    this.formControlReturnTimeWindow.setValue(
      [data.roundTrip.returnTimeWindowFrom, data.roundTrip.returnTimeWindowTo],
      this.OPTION_FORM_CONTROL_SET_VALUE
    );

    // 往路乗継地
    this.selectedTransitDepartAirport = this.getAirportFromCache(
      data.roundTrip.departureConnection.connectionLocationCode!,
      'transit'
    );
    // 不正空港の場合、formcontrolに設定、表示する
    if (data.roundTrip.departureConnection.connectionLocationCode && !this.selectedTransitDepartAirport) {
      this.originTransitAirportControl.setValue(data.roundTrip.departureConnection.connectionLocationCode);
    }

    // 復路乗継地
    this.selectedTransitReturnAirport = this.getAirportFromCache(
      data.roundTrip.returnConnection.connectionLocationCode!,
      'transit'
    );
    // 不正空港の場合、formcontrolに設定、表示する
    if (data.roundTrip.returnConnection.connectionLocationCode && !this.selectedTransitReturnAirport) {
      this.destinationTransitAirportControl.setValue(data.roundTrip.returnConnection.connectionLocationCode);
    }

    // 搭乗者人数
    this.passengersCount = {
      adultCount: data.traveler.adt,
      youngAdultCount: 0,
      childCount: data.traveler.chd,
      infantCount: data.traveler.inf,
    };

    //一般/特典
    if (data.fare.awardOption && this.selectedAwardOption !== data.fare.awardOption) {
      this.selectedAwardOption = data.fare.awardOption;
    }

    // 運賃オプション
    if (this.selectedFareOptionType !== data.fare.fareOptionType) {
      this.selectedFareOptionType = data.fare.fareOptionType;
    }
    // 前後日付表示オプション
    if (this.formControlCompareFaresNearbyDates.value !== data.displayInformation.compareFaresNearbyDates) {
      this.formControlCompareFaresNearbyDates.setValue(
        data.displayInformation.compareFaresNearbyDates,
        this.OPTION_FORM_CONTROL_SET_VALUE
      );
    }

    // 値監視を再開する
    this.subscriptionStart();
    // イベント処理を有効にする
    this.eventEnabled = true;
  }
  @Output()
  changeOptionOpenEvent = new EventEmitter<boolean>();
  /** オプション開閉処理 */
  private changeOptionOpen(open: boolean): void {
    if (open) {
      this.isOpenSearchOption = true;
    } else {
      this.isOpenSearchOption = false;
    }
    this.changeOptionOpenEvent.emit(open);
    // オプション開閉状態を保持している条件に保存する
    this._searchFlightStoreService.updateStore({
      ...this.searchFlightData,
      roundTrip: {
        ...this.searchFlightData.roundTrip,
        isOpenSearchOption: open,
      },
    });
  }

  /** INTERNAL_DESIGN_EVENT 区間オプション指定開く・閉じるボタン押下時処理 */
  public clickOptionOpen(): void {
    if (this.eventEnabled) {
      if (this.isOpenSearchOption) {
        this.changeOptionOpen(false);
      } else {
        this.changeOptionOpen(true);
      }
    }
  }

  /** INTERNAL_DESIGN_EVENT ストップオーバー入力切替リンク押下時処理 */
  public clickStopOverLink(event: Event) {
    event.preventDefault();
    if (this.eventEnabled) {
      this.clickStopOver.emit();
    }
  }

  // 以下、入力フォームのstore格納処理
  @ViewChild(AirportComponent) airportComponent!: AirportComponent;
  /** 往路出発地の空港部品のOutput取得メソッド */
  public getOutputOriginAirport(airport: Airport | null): void {
    if (this.eventEnabled) {
      // 空港選択された場合と削除された場合で処理を分ける
      if (airport) {
        const state: SearchFlightState = {
          ...this.searchFlightData,
          roundTrip: {
            ...this.searchFlightData.roundTrip,
            departureOriginLocationCode: airport.search_for_airport_code,
            returnDestinationLocationCode: airport.search_for_airport_code,
          },
        };
        this._searchFlightStoreService.updateStore(state);
        this.changeAirport.emit(airport);
      } else {
        const state: SearchFlightState = {
          ...this.searchFlightData,
          roundTrip: {
            ...this.searchFlightData.roundTrip,
            departureOriginLocationCode: null,
          },
          isJapanOnly: false,
        };
        this._searchFlightStoreService.updateStore(state);
      }
    }
  }
  /** 往路到着地の空港部品のOutput取得メソッド */
  public getOutputDestinationAirport(airport: Airport | null): void {
    if (this.eventEnabled) {
      if (airport) {
        const state: SearchFlightState = {
          ...this.searchFlightData,
          roundTrip: {
            ...this.searchFlightData.roundTrip,
            departureDestinationLocationCode: airport.search_for_airport_code,
            returnOriginLocationCode: airport.search_for_airport_code,
          },
        };
        this._searchFlightStoreService.updateStore(state);
        this.changeAirport.emit(airport);
      } else {
        const state: SearchFlightState = {
          ...this.searchFlightData,
          roundTrip: {
            ...this.searchFlightData.roundTrip,
            departureDestinationLocationCode: null,
          },
          isJapanOnly: false,
        };
        this._searchFlightStoreService.updateStore(state);
      }
    }
  }

  /** INTERNAL_DESIGN_EVENT 出発日ボタン押下時処理 (往復同時選択の出発日選択部品のOutput取得メソッド) */
  public getOutputDepartureAndReturnDate(date: Date[]): void {
    if (this.eventEnabled) {
      const state: SearchFlightState = {
        ...this.searchFlightData,
        roundTrip: {
          ...this.searchFlightData.roundTrip,
          departureDate: date[0],
          returnDate: date[1],
        },
      };
      this._searchFlightStoreService.updateStore(state);

      this.changeDepartureDate.emit(date);
    }
  }

  /** INTERNAL_DESIGN_EVENT 搭乗者指定ボタン押下時処理(搭乗者の人数指定部品のOutput取得メソッド) */
  public getOutputPassengerSelect(passenger: PassengersCount) {
    if (this.eventEnabled) {
      const state: SearchFlightState = {
        ...this.searchFlightData,
        traveler: {
          adt: passenger.adultCount,
          b15: 0,
          chd: passenger.childCount,
          inf: passenger.infantCount,
        },
      };
      this._searchFlightStoreService.updateStore(state);
      const haveMessage = this.common.alertMessageStoreService.getAlertInfomationMessage().some((message) => {
        return message.contentId === SearchFlightConstant.INFO_ID_MSG1029;
      });
      if (haveMessage) {
        this.common.alertMessageStoreService.removeAlertInfomationMessage(SearchFlightConstant.INFO_ID_MSG1029);
      }
    }
  }

  /** 前後日付表示オプションチェックボックスのchecked取得メソッド */
  public getOutputCompareFaresNearbyDate(event: CheckboxComponent) {
    if (this.eventEnabled) {
      const checked: boolean = event.checked;
      const state: SearchFlightState = {
        ...this.searchFlightData,
        displayInformation: {
          ...this.searchFlightData.displayInformation,
          compareFaresNearbyDates: checked,
        },
      };
      this._searchFlightStoreService.updateStore(state);
    }
  }

  /** キャビンクラス(Mixed Cabinの利用有の場合往路キャビンクラス)セレクトのOutput取得メソッド */
  public getOutputAwardOption(select: SelectComponent) {
    if (this.eventEnabled) {
      // キャビンクラス指定値変更処理
      this.setFareTypeShow(select.data);
      // 一件目の運賃オプションを選択するになる
      const fareTypeOptionList = this._fareTypeSelectorModalService.createFareTypeOptionListByAwardOption(select.data);
      const selectedFareType =
        fareTypeOptionList.find((v) => v.value === this.selectedFareOptionType) ?? fareTypeOptionList[0];
      const state: SearchFlightState = {
        ...this.searchFlightData,
        fare: {
          ...this.searchFlightData.fare,
          awardOption: select.data != null ? select.data : '',
          fareOptionType: selectedFareType.value ?? '',
        },
      };
      this.selectedAwardOption = select.data != null ? select.data : '';
      this._searchFlightStoreService.updateStore(state);
    }
  }

  /** INTERNAL_DESIGN_EVENT 運賃オプション指定ボタン押下時処理(運賃オプションモーダルのOutput取得メソッド(Mixed Cabinの利用無のみ)) */
  public getOutputFareOptionType(value: string) {
    if (this.eventEnabled) {
      const state: SearchFlightState = {
        ...this.searchFlightData,
        fare: {
          ...this.searchFlightData.fare,
          fareOptionType: value,
        },
      };
      this._searchFlightStoreService.updateStore(state);
    }
  }

  /** キャッシュから空港部品を取得する */
  private getAirportFromCache(code: string, type: string = 'origin') {
    let airports: Airport[] | undefined = [];
    if (type === 'origin') {
      airports = this.departureAirportList;
    } else if (type === 'destination') {
      airports = this.destinationAirportList;
    } else if (type === 'transit') {
      airports = this.transitAirportList;
    } else {
      airports = this.destinationAirportList;
    }
    return (
      airports?.find((airport) => {
        return airport.search_for_airport_code === code;
      }) ?? null
    );
  }

  // 入り替え可能かのチェック
  public switch(isSwitched: boolean) {
    if (!isSwitched) {
      this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'E0240' });
    } else {
      // 保持している条件更新
      const originBk = this.searchFlightData.roundTrip.departureOriginLocationCode;
      const destinationBk = this.searchFlightData.roundTrip.departureDestinationLocationCode;
      const state: SearchFlightState = {
        ...this.searchFlightData,
        roundTrip: {
          ...this.searchFlightData.roundTrip,
          departureOriginLocationCode: destinationBk,
          returnDestinationLocationCode: destinationBk,
          departureDestinationLocationCode: originBk,
          returnOriginLocationCode: originBk,
        },
      };
      this._searchFlightStoreService.updateStore(state);
    }
  }
  /** 空判定 */
  private isNotEmpty(value: any): boolean {
    return value !== '' && value !== null && value !== undefined;
  }

  /**
   * 運賃オプションプルダウン表示設定
   * @param selectData 一般/特典の選択値
   */
  private setFareTypeShow(selectData: string) {
    // キャビンクラス指定値変更処理
    // 一般/特典プルダウンで特典を選択した場合、運賃オプションプルダウンは非表示
    if (selectData === 'priced') {
      this.isFareTypeShow = true;
    } else {
      this.isFareTypeShow = false;
    }
  }
}
