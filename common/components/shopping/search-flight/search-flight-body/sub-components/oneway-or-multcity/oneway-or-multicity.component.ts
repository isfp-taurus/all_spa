import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren,
  OnChanges,
  SimpleChanges,
  ElementRef,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import {
  SearchFlightState,
  SearchFlightConstant,
  Bound,
  ExtraBound,
  FormBound,
  searchFlightInitialState,
  TripType,
} from '@common/store/search-flight';
import {
  InputComponent,
  SelectComponent,
  DateSelectorParts,
  AirportComponent,
  DateSelectorComponent,
  CheckboxComponent,
} from '@lib/components';
import { AirportListParts } from '@lib/components/shared-ui-components/airport/airport.state';
import { SupportComponent } from '@lib/components/support-class';
import { Airport, ValidationErrorInfo } from '@lib/interfaces';
import { AswContextStoreService, AswMasterService, CommonLibService } from '@lib/services';
import { SearchFlightBodyPresProps } from '../../presenter/search-flight-body-pres.state';
import {
  PassengersCount,
  DefaultPassengersCount,
} from '@common/components/shopping/search-flight/passenger-selector/passenger-selector.state';
import { SearchFlightStoreService } from '@common/services/store/search-flight/search-flight-store/search-flight-store.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { of } from 'rxjs/internal/observable/of';
import { take } from 'rxjs/operators';
import { ShoppingLibService } from '@common/services/shopping/shopping-lib/shopping-lib.service';
import { FareTypeSelectorModalService } from '@common/components/shopping/search-flight/fare-type-selector/fare-type-selector-modal.service';
import { SearchFlightHistorySelectModalService } from '@common/components/shopping/search-flight/search-flight-history-select/search-flight-history-select-modal.service';
import { interval } from 'rxjs/internal/observable/interval';
import { StaticMsgPipe } from '@lib/pipes';
import { AswValidators } from '@lib/helpers/validate/validators';
import { convertStringToDate } from '@lib/helpers';

@Component({
  selector: 'asw-oneway-or-multicity',
  templateUrl: './oneway-or-multicity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnewayOrMultiCityComponent extends SupportComponent implements AfterViewInit, OnChanges {
  constructor(
    protected common: CommonLibService,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _shoppingLibService: ShoppingLibService,
    private _fareTypeSelectorModalService: FareTypeSelectorModalService,
    private _searchFlightHistorySelectModalService: SearchFlightHistorySelectModalService,
    private _aswContextStoreSvc: AswContextStoreService,
    private staticMsg: StaticMsgPipe,
    private _aswMasterSvc: AswMasterService
  ) {
    super(common);
    this.defaultBound = this.createInitialFormBound(0, null, null);
    this.searchFlightData = this._searchFlightStoreService.getData();
    // boundListの初期設定処理
    this.boundList = [];
  }

  ngAfterViewInit(): void {
    //ViewChildの直接値変更は開発環境でのみ、自動プロパティチェック後に値変更したことでエラーが発生する エラー回避のため1回だけ実行のsubscribeで実行タイミングをずらす
    this.subscribeService('OnewayOrMulticityComponent', of(1).pipe(take(1)), () => {
      //出発地 初期値設定
      this.originAirportComponent.forEach((airportCmp, index) => {
        if (this.boundList.length > index) {
          airportCmp.setAirport(this.boundList[index].originLocation, false);
        }
      });
      //到着地 初期値設定
      this.destinationAirportComponent.forEach((airportCmp, index) => {
        if (this.boundList.length > index) {
          airportCmp.setAirport(this.boundList[index].destinationLocation, false);
        }
      });
      //出発日 初期値設定
      this.departureDateComponent.forEach((dateCmp, index) => {
        if (this.boundList.length > index) {
          let departureDate = this.boundList[index].departureDate;
          if (departureDate != null) {
            if (typeof departureDate === 'string') {
              dateCmp.setDate(convertStringToDate(departureDate));
            } else {
              dateCmp.setDate(new Date(departureDate));
            }
          }
        }
      });
    });
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

  // 出発地
  originValidator(i: number, control: AbstractControl) {
    if (!control.value) {
      // 1区間目の場合、必須チェックを行う
      if (i === 0) {
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
      } else {
        // 2区間目以降の場合、必須チェックを行わない
        return null;
      }
    }
    // 空港存在チェック処理
    if (this.notExistAirport(control, this.boundList[i].originLocation, this.originAirportComponent.get(i)!)) {
      return {
        errorMsgId: 'E0059',
      };
    }

    // 空港一致チェック処理
    const checkRet = this.checkSameAirport(i);

    // NGの場合
    if (checkRet) {
      return checkRet;
    }

    return null;
  }

  // 到着地
  destinationValidator(i: number, control: AbstractControl) {
    if (!control.value) {
      // 1区間目の場合、必須チェックを行う
      if (i === 0) {
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
      } else {
        // 2区間目以降の場合、必須チェックを行わない
        return null;
      }
    }
    // 空港存在チェック処理
    if (
      this.notExistAirport(control, this.boundList[i].destinationLocation, this.destinationAirportComponent.get(i)!)
    ) {
      return {
        errorMsgId: 'E0059',
      };
    }

    // 空港一致チェック処理
    const checkRet = this.checkSameAirport(i);

    // NGの場合
    if (checkRet) {
      return checkRet;
    }

    return null;
  }

  // 出発日
  departDateValidator(i: number, control: AbstractControl) {
    // 1区間目の場合、必須チェックを行う
    if (i === 0) {
      if (!control.value) {
        return {
          'validate-flight': {
            errorMsgId: 'E0002',
            params: {
              key: 0,
              value: this.staticMsg.transform('label.departureDate'),
              dontTranslate: true,
            },
          },
        };
      }
    }
    return null;
  }

  // [空港一致チェック処理]
  checkSameAirport(i: number) {
    const origin = this.boundList[i].originLocation
      ? this.boundList[i].originLocation?.airport_code
      : this.boundList[i].originLocationFormControl.value;
    const destination = this.boundList[i].destinationLocation
      ? this.boundList[i].destinationLocation?.airport_code
      : this.boundList[i].destinationLocationFormControl.value;
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

  public boundInit() {
    // boundListの初期設定処理
    this.boundList = [this.createInitialFormBound(0, null, null)];
    this.formControlInit();
  }

  formControlInit() {
    this.boundList.forEach((bound, i) => {
      bound.originLocationFormControl.setValidators(this.originValidator.bind(this, i));
      bound.destinationLocationFormControl.setValidators(this.destinationValidator.bind(this, i));
      bound.departureDateFormControl.setValidators(this.departDateValidator.bind(this, i));
    });
  }

  public getFormControlGroup() {
    const formControlGroup: Map<string, FormControl> = new Map();
    this.boundList.forEach((bound, i) => {
      formControlGroup.set('originLocationCode' + i, bound.originLocationFormControl);
      formControlGroup.set('destinationLocationCode' + i, bound.destinationLocationFormControl);
      formControlGroup.set('departureDate' + i, bound.departureDateFormControl);
    });
    return formControlGroup;
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

    // boundListの初期設定処理
    this.boundList = [this.defaultBound];
    // ユーザ共通.POS国コードを取得する
    this.posCountryCode = this._aswContextStoreSvc.aswContextData.posCountryCode;
    this.formControlInit();

    // ユーザ共通.POS国コードを取得する
    this.posCountryCode = this._aswContextStoreSvc.aswContextData.posCountryCode;

    //CabinClass選択肢の設定
    this.cabinClassOptions = this._shoppingLibService.getCabinList(this.isJapanOnlyFlag);

    //空港選択部品の設定
    this.airportListParts = this.props.airportListParts;
    this.airportListPartsFrom = this.props.airportListPartsFrom;
    this.airportListPartsTo = this.props.airportListPartsTo;

    //Storeの値変更時に入力項目に値を渡す処理を定義
    this.subscribeService(
      'SearchFlightStoreServiceOnewayOrMulticity',
      this._searchFlightStoreService.searchFlight$,
      (data) => {
        this.searchFlightData = data;
        if (data.tripType === TripType.ONEWAY_OR_MULTI_CITY) {
          // 入力済み区間数更新
          this.boundInputCount = this._shoppingLibService.getBoundInputCount(data.onewayOrMultiCity);
          this.dcsMigrationDateStatus = data.dcsMigrationDateStatus;
          // CabinClass選択肢の設定
          this.cabinClassOptions = this._shoppingLibService.getCabinList(data.isJapanOnly);

          // 「一般/特典」選択肢の設定
          this.selectedAwardOption = data.fare.awardOption || 'priced';
          // 「一般/特典」選択肢に合わせた運賃オプションプルダウン表示/非表示設定
          this.setFareTypeShow(this.selectedAwardOption);

          this.isJapanOnlyFlag = data.isJapanOnly;
          if (this.boundList.length !== data.onewayOrMultiCity.length) {
            this.addInitialBoundList(data.onewayOrMultiCity);
          }
          this._changeDetectorRef.detectChanges();
          //コンポーネントに対しメソッドで値渡しをしている部品は画面再描画後でないと、コンポーネントのオブジェクトが生成されない
          //detectChangeによる画面再描画でオブジェクトが生成されたタイミングで再実行して部品に値を渡す
          this.setInputValues(data);
        }
      }
    );

    this.subscriptionStart();

    // 項目初期設定
    this.setInputValues(this.searchFlightData);
  }

  destroy() {
    this.subscriptionStop();
    this.deleteSubscription('OnewayOrMulticityComponent');
    this.deleteSubscription('SearchFlightStoreService');
  }

  /** 出発時間帯 最小値 */
  public TIME_WINDOW_MIN = SearchFlightConstant.TIME_WINDOW_MIN;
  /** 出発時間帯 最大値 (分単位) */
  public TIME_WINDOW_MAX = SearchFlightConstant.TIME_WINDOW_MAX;
  /** 出発時間帯 目盛り (分単位) */
  public readonly TIME_WINDOW_STEP = 120;
  /** 出発地空港リスト */
  public departureAirportList: Airport[] | undefined = undefined;
  /** 到着地空港リスト */
  public destinationAirportList: Airport[] | undefined = undefined;
  /** 第一区間出発地空港リスト */
  public firstBoundDepartureAirportList: Airport[] | undefined = undefined;

  readonly MAX_BOUND_LIST_LENGTH = SearchFlightConstant.MAX_ONEWAY_OR_MULTICITY_BOUNDS_LENGTH;

  /** フォームコントロールに渡すsetValueのオプション */
  private readonly OPTION_FORM_CONTROL_SET_VALUE = {
    onlySelf: true,
    emitEvent: false,
  };
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
  @Input() onewayInformationList: Array<number> = [];
  @Input() formGroup!: FormGroup;
  /** 親コンポーネントから渡されるプロパティ */
  private _props!: SearchFlightBodyPresProps;
  @Input()
  get props(): SearchFlightBodyPresProps {
    return this._props;
  }
  set props(value: SearchFlightBodyPresProps) {
    this._props = value;
    this._changeDetectorRef.detectChanges();
  }

  /** このコンポーネントの活性状態 */
  @Input()
  public isEnabled: boolean = true;

  /** 国内判断フラグ */
  @Input()
  public isJapanOnlyFlag: boolean = false;

  @Output()
  public changeAirport = new EventEmitter<Airport>();

  /** フライト検索画面 Storeに格納しているState */
  private searchFlightData!: SearchFlightState;

  /** 空港選択部品 出発地*/
  @ViewChildren('originAirportComponent') originAirportComponent!: QueryList<AirportComponent>;
  /** 空港選択部品 到着地*/
  @ViewChildren('destinationAirportComponent') destinationAirportComponent!: QueryList<AirportComponent>;
  /** 出発日選択部品 */
  @ViewChildren('departureDateComponent') departureDateComponent!: QueryList<DateSelectorComponent>;
  @ViewChildren('departureDateComponent', { read: ElementRef }) departureDateComponentRef!: QueryList<ElementRef>;

  //画面項目コンポーネントに渡す設定値
  public airportListParts!: AirportListParts;
  public airportListPartsFrom!: AirportListParts;
  public airportListPartsTo!: AirportListParts;

  // baseDate,lastDateの設定処理
  public dateSelectorParts: DateSelectorParts = {};

  // 動作確認用cabinClass用Selectタグの選択肢
  public cabinClassOptions: Array<{ value: string; textContent: string }> = [];
  public awardOptions: Array<{ value: string; textContent: string }> = [{ value: '', textContent: '' }];

  /** 描画用入力項目 */
  public boundList!: Array<FormBound>;

  /** 入力済み区間数 */
  public boundInputCount: number = 0;

  /** 一時停止をするサブスクリプションのリスト */
  private _subscriptionCanPauseList: Subscription[] = [];

  private defaultBound: FormBound;

  public passengersCount: PassengersCount = {
    adultCount: DefaultPassengersCount.ADULT,
    youngAdultCount: DefaultPassengersCount.YOUNG_ADULT,
    childCount: DefaultPassengersCount.CHILD,
    infantCount: DefaultPassengersCount.INFANT,
  };

  public formControlCompareFaresNearbyDates: FormControl<boolean | null> = new FormControl<boolean>(false);
  public selectedCabinClass = '';
  public selectedAwardOption = '';
  public selectedFareOptionType = '';
  /** ユーザ共通.POS国コード */
  public posCountryCode = '';
  /** キャビンクラスに紐づく運賃オプションの存在フラグ */
  public isFareTypeShow: boolean = true;
  @Output()
  public changeDepartureDate = new EventEmitter<Date[]>();
  /** DCS移行開始日前後状態 */
  @Input()
  dcsMigrationDateStatus: string = '';
  /** 旧国内ASW取扱検索条件フラグ */
  @Input()
  oldDomesticAswSearchFlag: boolean = false;

  //入力フォームのイベント処理の実行を有効/無効にする ストア更新で入力フォームの値を変更したとき、コードからの値変更でイベント発火するコンポーネントによって無限ループに入るのを避けるため
  private eventEnabled: boolean = true;

  /** フォームコントロールのサブスクリプションを開始する */
  private subscriptionStart() {
    //フォームコントロールの値変更を監視し、ストアへの値格納処理を実行
    /** 前後日付表示オプション */
    this._subscriptionCanPauseList.push(
      this.formControlCompareFaresNearbyDates.valueChanges.subscribe((data) => {
        if (this.searchFlightData.tripType === TripType.ONEWAY_OR_MULTI_CITY) {
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

    //出発時間帯
    for (let i = 0; i < this.boundList.length; i++) {
      const subscription = this.boundList[i].departureTimeWindow.valueChanges.subscribe((data) => {
        if (this.searchFlightData.tripType === TripType.ONEWAY_OR_MULTI_CITY) {
          if (
            data != null &&
            (data[0] !== this.searchFlightData.onewayOrMultiCity[i].departureTimeWindowFrom ||
              data[1] !== this.searchFlightData.onewayOrMultiCity[i].departureTimeWindowTo)
          ) {
            let bounds = this.searchFlightData.onewayOrMultiCity.slice();
            bounds[i] = {
              ...bounds[i],
              departureTimeWindowFrom: data[0],
              departureTimeWindowTo: data[1],
            };
            let state: SearchFlightState = {
              ...this.searchFlightData,
              onewayOrMultiCity: bounds,
            };
            // Mixed Cabin利用可否判定・リセット
            state = this._shoppingLibService.checkMixCabinAndReset(state);

            this._searchFlightStoreService.updateStore(state);
          }
        }
      });
      this.boundList[i].subscriptionDepartureTimeWindow = subscription;
    }
  }

  /** フォームコントロールのサブスクリプションを停止する */
  private subscriptionStop() {
    this._subscriptionCanPauseList
      .filter((subscription) => subscription != null)
      .forEach((subscription) => subscription.unsubscribe());
    this._subscriptionCanPauseList = [];

    for (let i = 0; i < this.boundList.length; i++) {
      if (this.boundList[i].subscriptionDepartureTimeWindow != null) {
        this.boundList[i].subscriptionDepartureTimeWindow?.unsubscribe();
        this.boundList[i].subscriptionDepartureTimeWindow = null;
      }
    }
  }

  /** １つの区間の入力項目値を生成する */
  private createInitialFormBound(
    index: number,
    valueSelectedMin: number | null,
    valueSelectedMax: number | null
  ): FormBound {
    const departureTimeWindow = new FormControl<number[] | null>(
      valueSelectedMin != null && valueSelectedMax != null ? [valueSelectedMin, valueSelectedMax] : null
    );

    const formBound = {
      originLocation: null,
      destinationLocation: null,
      departureDate: null,
      originLocationFormControl: new FormControl(),
      destinationLocationFormControl: new FormControl(),
      departureDateFormControl: new FormControl(),
      departureTimeWindow: departureTimeWindow,
      subscriptionDepartureTimeWindow: null,
    };
    return formBound;
  }
  /** １つ以上区間の入力項目値を生成する */
  private addInitialBoundList(data: Bound[]) {
    // const boundList: FormBound[] = [];
    data.forEach((store_bound, i) => {
      //区間数が増えている場合の追加処理
      if (this.boundList.length <= i) {
        const bound: FormBound = {
          ...this.createInitialFormBound(
            i,
            store_bound.departureTimeWindowFrom ?? null,
            store_bound.departureTimeWindowTo ?? null
          ),
          departureDate: null,
        };
        this.boundList.push(bound);
      }
    });
    this.formControlInit();
  }
  /** 毎区間値を設定する */
  private setFormBoundList(boundList: FormBound[], store_bound: Bound, i: number) {
    if (boundList.length === 0) {
      return boundList;
    }
    //出発地
    if (boundList[i].originLocation) {
      if (store_bound.originLocationCode == null) {
        boundList[i].originLocation = null;
        if (this.originAirportComponent != null && this.originAirportComponent.length > i) {
          this.originAirportComponent.get(i)?.setAirport(boundList[i].originLocation);
        }
      } else if (boundList[i].originLocation!.search_for_airport_code !== store_bound.originLocationCode) {
        boundList[i].originLocation = this.getAirportFromCache(store_bound.originLocationCode!, 'origin', i);
        if (this.originAirportComponent != null && this.originAirportComponent.length > i) {
          this.originAirportComponent.get(i)?.setAirport(boundList[i].originLocation);
          // 不正空港の場合、formcontrolに設定、表示する
          if (store_bound.originLocationCode && !boundList[i].originLocation) {
            boundList[i].originLocationFormControl.setValue(store_bound.originLocationCode);
          }
        }
      }
    } else {
      if (store_bound.originLocationCode) {
        boundList[i].originLocation = this.getAirportFromCache(store_bound.originLocationCode!, 'origin', i);
        if (this.originAirportComponent != null && this.originAirportComponent.length > i) {
          this.originAirportComponent.get(i)?.setAirport(boundList[i].originLocation);
          // 不正空港の場合、formcontrolに設定、表示する
          if (store_bound.originLocationCode && !boundList[i].originLocation) {
            boundList[i].originLocationFormControl.setValue(store_bound.originLocationCode);
          }
        }
      }
    }

    //到着地
    if (boundList[i].destinationLocation) {
      if (store_bound.destinationLocationCode == null) {
        boundList[i].destinationLocation = null;
        if (this.destinationAirportComponent != null && this.destinationAirportComponent.length > i) {
          this.destinationAirportComponent.get(i)?.setAirport(boundList[i].destinationLocation);
        }
      } else if (boundList[i].destinationLocation!.search_for_airport_code !== store_bound.destinationLocationCode) {
        boundList[i].destinationLocation = this.getAirportFromCache(
          store_bound.destinationLocationCode!,
          'destination',
          i
        );
        if (this.destinationAirportComponent != null && this.destinationAirportComponent.length > i) {
          this.destinationAirportComponent.get(i)?.setAirport(boundList[i].destinationLocation);
          // 不正空港の場合、formcontrolに設定、表示する
          if (store_bound.destinationLocationCode && !boundList[i].destinationLocation) {
            boundList[i].destinationLocationFormControl.setValue(store_bound.destinationLocationCode);
          }
        }
      }
    } else {
      if (store_bound.destinationLocationCode) {
        boundList[i].destinationLocation = this.getAirportFromCache(
          store_bound.destinationLocationCode!,
          'destination',
          i
        );
        if (this.destinationAirportComponent != null && this.destinationAirportComponent.length > i) {
          this.destinationAirportComponent.get(i)?.setAirport(boundList[i].destinationLocation);
          // 不正空港の場合、formcontrolに設定、表示する
          if (store_bound.destinationLocationCode && !boundList[i].destinationLocation) {
            boundList[i].destinationLocationFormControl.setValue(store_bound.destinationLocationCode);
          }
        }
      }
    }

    //出発日
    if (store_bound.departureDate) {
      if (boundList[i].departureDate?.getTime() !== store_bound.departureDate.getTime()) {
        boundList[i].departureDate = store_bound.departureDate;
        if (typeof store_bound.departureDate === 'string') {
          this.departureDateComponent.get(i)?.setDate(convertStringToDate(store_bound.departureDate));
        } else {
          this.departureDateComponent.get(i)?.setDate(new Date(boundList[i].departureDate!));
        }
      }
    } else {
      boundList[i].departureDate = null;
    }

    const departureTime = boundList[i].departureTimeWindow.value;
    if (departureTime != null) {
      const departureTime_tmp = departureTime.slice();
      if (departureTime[0] !== store_bound.departureTimeWindowFrom) {
        departureTime_tmp[0] = store_bound.departureTimeWindowFrom;
      }
      if (departureTime[1] !== store_bound.departureTimeWindowTo) {
        departureTime_tmp[1] = store_bound.departureTimeWindowTo;
      }
      if (departureTime_tmp[0] == null || departureTime_tmp[1] == null) {
        boundList[i].departureTimeWindow.setValue(null, this.OPTION_FORM_CONTROL_SET_VALUE);
      } else if (departureTime[0] !== departureTime_tmp[0] || departureTime[1] !== departureTime_tmp[1]) {
        boundList[i].departureTimeWindow.setValue(
          [departureTime_tmp[0], departureTime_tmp[1]],
          this.OPTION_FORM_CONTROL_SET_VALUE
        );
      }
    } else {
      boundList[i].departureTimeWindow.setValue(null, this.OPTION_FORM_CONTROL_SET_VALUE);
    }
    return boundList;
  }

  /** ストアを利用した画面項目の値設定 */
  private setInputValues(data: SearchFlightState): void {
    //バインドされたフォームコントロールはsetValueを実行するとvalueChangesで値変更の通知をするので一時的に値監視を停止
    this.subscriptionStop();
    //入力フォームに値を設定することで発生するイベントを、起こさないように設定
    this.eventEnabled = false;

    this.searchFlightData = data;

    //描画用の入力項目の値再設定処理
    //変更箇所のある部品のみ値を変更し、不要な部品再描画を行わないようにする。
    let i = 0;
    if (
      Array.isArray(this.searchFlightData.onewayOrMultiCity) &&
      this.searchFlightData.onewayOrMultiCity.length !== 0
    ) {
      for (const store_bound of this.searchFlightData.onewayOrMultiCity) {
        this.boundList = this.setFormBoundList(this.boundList, store_bound, i);
        i++;
      }
    }

    if (this.boundList.length > i) {
      //区間数が減っている場合の削除処理
      this.boundList.splice(i, this.boundList.length);
    }

    // 区間ごとの画面部品を作成する
    this.preAirportRegionDataSetting();
    //搭乗者人数
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
    //運賃オプション
    if (this.selectedFareOptionType !== data.fare.fareOptionType) {
      this.selectedFareOptionType = data.fare.fareOptionType;
    }
    //前後日付表示オプション
    if (this.formControlCompareFaresNearbyDates.value !== data.displayInformation.compareFaresNearbyDates) {
      this.formControlCompareFaresNearbyDates.setValue(
        data.displayInformation.compareFaresNearbyDates,
        this.OPTION_FORM_CONTROL_SET_VALUE
      );
    }

    //値監視を再開する
    this.subscriptionStart();
    //イベント処理を有効にする
    this.eventEnabled = true;
  }

  /** 空港部品の空港リストと地域リスト設定 */
  private preAirportRegionDataSetting() {
    const airportListKey = this._shoppingLibService.getAirportListKey(TripType.ONEWAY_OR_MULTI_CITY);
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
    this.boundList.map((bound, boundIndex) => {
      // 出発地用空港データとして、複雑旅程区間の繰り返しインデックス=0の場合は発着識別=”Departure”(第一出発地)
      if (boundIndex === 0) {
        if (!bound.airportListPartsFrom) {
          const newAirportListPartsFrom: AirportListParts = {
            ...this.airportListPartsFrom,
            terminalType: 'Departure',
            airportList: this.departureAirportList,
          };
          if (departureRegionList) {
            newAirportListPartsFrom.regionList = departureRegionList;
          }
          bound.airportListPartsFrom = newAirportListPartsFrom;
        }
        if (!bound.dateSelectorParts) {
          bound.dateSelectorParts = {
            ...this.dateSelectorParts,
          };
        }
      } else {
        // 連携元日付を設定する
        const previousSectionDate =
          this.searchFlightData.onewayOrMultiCity[boundIndex - 1].departureDate ??
          this.dateSelectorParts.previousSectionDate;
        if (!bound.dateSelectorParts) {
          bound.dateSelectorParts = {
            ...this.dateSelectorParts,
            previousSectionDate: previousSectionDate,
          };
        } else if (previousSectionDate !== bound.dateSelectorParts.previousSectionDate) {
          bound.dateSelectorParts = {
            ...bound.dateSelectorParts,
            previousSectionDate: previousSectionDate,
          };
        }
        // 出発地用空港データとして、繰り返しインデックス=0でない場合は発着識別=”Destination”(到着地)
        if (!bound.airportListPartsFrom) {
          const newAirportListPartsFrom: AirportListParts = {
            ...this.airportListPartsFrom,
            terminalType: 'Destination',
            airportList: this.destinationAirportList,
          };
          if (destinationRegionList) {
            newAirportListPartsFrom.regionList = destinationRegionList;
          }
          bound.airportListPartsFrom = newAirportListPartsFrom;
        }
      }
      if (!bound.airportListPartsTo) {
        const newAirportListPartsTo: AirportListParts = {
          ...this.airportListPartsTo,
          terminalType: 'Destination',
          airportList: this.destinationAirportList,
        };
        if (destinationRegionList) {
          newAirportListPartsTo.regionList = destinationRegionList;
        }
        bound.airportListPartsTo = newAirportListPartsTo;
      }
    });
  }

  /** キャッシュから空港部品を取得する */
  private getAirportFromCache(code: string, type: string = 'origin', index: number = 0) {
    let airports: Airport[] | undefined = [];
    if (type === 'origin') {
      airports = index === 0 ? this.departureAirportList : this.destinationAirportList;
    } else {
      airports = this.destinationAirportList;
    }
    return (
      airports?.find((airport) => {
        return airport.search_for_airport_code === code;
      }) ?? null
    );
  }

  /** イベント定義 */

  /** INTERNAL_DESIGN_EVENT バウンド削除ボタン押下時処理 */
  public clickDeleteBoundButton(index: number) {
    const bounds = this.searchFlightData.onewayOrMultiCity.slice();
    bounds.splice(index, 1);
    this.boundList.splice(index, 1);
    this.formControlInit();
    const state: SearchFlightState = {
      ...this.searchFlightData,
      onewayOrMultiCity: bounds,
    };
    this._searchFlightStoreService.updateStore(state);
    this.changeAirport.emit();
    this.changeDepartureDate.emit();
  }

  /** INTERNAL_DESIGN_EVENT バウンド追加ボタン押下時処理 */
  public clickAddBoundButton(index: number) {
    if (this.eventEnabled) {
      // 新しいバウンドを作成する
      let additionalBound: Bound = {
        ...searchFlightInitialState.onewayOrMultiCity[0],
        originLocationCode: this.searchFlightData.onewayOrMultiCity[index - 1].destinationLocationCode,
      };
      if (index < this.searchFlightData.onewayOrMultiCity.length) {
        additionalBound.destinationLocationCode = this.searchFlightData.onewayOrMultiCity[index].originLocationCode;
      }
      let onewayOrMultiCityTmp: Array<Bound> = this.searchFlightData.onewayOrMultiCity.slice();
      // バウンドリストに追加する
      onewayOrMultiCityTmp.splice(index, 0, additionalBound);

      const bound: FormBound = {
        ...this.createInitialFormBound(index, null, null),
        departureDate: null,
      };
      this.boundList.splice(index, 0, bound);
      this.formControlInit();

      const state: SearchFlightState = {
        ...this.searchFlightData,
        onewayOrMultiCity: onewayOrMultiCityTmp,
        displayInformation: {
          ...this.searchFlightData.displayInformation,
        },
      };
      this._searchFlightStoreService.updateStore(state);
      this.changeAirport.emit();
    }
  }

  /** 出発地の空港部品のOutput取得メソッド */
  public getOutputOriginAirport(airport: Airport | null, num: number): void {
    if (this.eventEnabled) {
      if (airport) {
        const bound: ExtraBound = {
          ...this.searchFlightData.onewayOrMultiCity[num],
          originLocationCode: airport.search_for_airport_code,
          originLocationName: airport.name,
        };

        //複雑旅程の配列を複製し、出発地を変更した区間を差し替える
        let onewayOrMultiCityTmp: Array<Bound> = [];
        onewayOrMultiCityTmp = this.searchFlightData.onewayOrMultiCity.slice();
        onewayOrMultiCityTmp.splice(num, 1, bound);

        //画面入力を行った場合、乗継地を削除する
        onewayOrMultiCityTmp = onewayOrMultiCityTmp.map((v) => ({ ...v, connectionLocationCode: null }));
        const state: SearchFlightState = {
          ...this.searchFlightData,
          onewayOrMultiCity: onewayOrMultiCityTmp,
        };

        this._searchFlightStoreService.updateStore(state);
        this.changeAirport.emit(airport);
      } else {
        const bound: Bound = {
          ...this.searchFlightData.onewayOrMultiCity[num],
          originLocationCode: null,
        };

        //複雑旅程の配列を複製し、出発地を変更した区間を差し替える
        let onewayOrMultiCityTmp: Array<Bound> = [];
        onewayOrMultiCityTmp = this.searchFlightData.onewayOrMultiCity.slice();
        onewayOrMultiCityTmp.splice(num, 1, bound);

        //画面入力を行った場合、乗継地を削除する
        onewayOrMultiCityTmp = onewayOrMultiCityTmp.map((v) => ({ ...v, connectionLocationCode: null }));
        const state: SearchFlightState = {
          ...this.searchFlightData,
          onewayOrMultiCity: onewayOrMultiCityTmp,
          isJapanOnly: this.isJapanOnlyFlag,
        };

        this._searchFlightStoreService.updateStore(state);
        this.changeAirport.emit();
      }
    }
  }

  /** 到着地の空港部品のOutput取得メソッド */
  public getOutputDestinationAirport(airport: Airport | null, num: number): void {
    if (this.eventEnabled) {
      if (airport) {
        const bound: ExtraBound = {
          ...this.searchFlightData.onewayOrMultiCity[num],
          destinationLocationCode: airport.search_for_airport_code,
          destinationLocationName: airport.name,
        };

        //複雑旅程の配列を複製し、出発地を変更した区間を差し替える
        let onewayOrMultiCityTmp: Array<Bound> = [];
        onewayOrMultiCityTmp = this.searchFlightData.onewayOrMultiCity.slice();
        if (
          num < this.searchFlightData.onewayOrMultiCity.length - 1 &&
          !this.searchFlightData.onewayOrMultiCity[num + 1].originLocationCode
        ) {
          //到着地を変更した区間の、次区間が存在している、次区間の出発地は空欄の場合、出発地の値を更新
          const nextBound: Bound = {
            ...this.searchFlightData.onewayOrMultiCity[num + 1],
          };
          if (nextBound.originLocationCode === null || nextBound.originLocationCode === '') {
            nextBound.originLocationCode = airport.search_for_airport_code;
          }
          onewayOrMultiCityTmp.splice(num, 2, bound, nextBound);
        } else {
          onewayOrMultiCityTmp.splice(num, 1, bound);
        }

        //画面入力を行った場合、乗継地を削除する
        onewayOrMultiCityTmp = onewayOrMultiCityTmp.map((v) => ({ ...v, connectionLocationCode: null }));

        const state: SearchFlightState = {
          ...this.searchFlightData,
          onewayOrMultiCity: onewayOrMultiCityTmp,
        };

        this._searchFlightStoreService.updateStore(state);
        this.changeAirport.emit(airport);
      } else {
        const bound: Bound = {
          ...this.searchFlightData.onewayOrMultiCity[num],
          destinationLocationCode: null,
        };

        //複雑旅程の配列を複製し、出発地を変更した区間を差し替える
        let onewayOrMultiCityTmp: Array<Bound> = [];
        onewayOrMultiCityTmp = this.searchFlightData.onewayOrMultiCity.slice();
        if (
          num < this.searchFlightData.onewayOrMultiCity.length - 1 &&
          !this.searchFlightData.onewayOrMultiCity[num + 1].originLocationCode
        ) {
          //到着地を変更した区間の、次区間が存在している、次区間の出発地は空欄の場合、出発地の値を更新
          const nextBound: Bound = {
            ...this.searchFlightData.onewayOrMultiCity[num + 1],
            originLocationCode: null,
          };
          onewayOrMultiCityTmp.splice(num, 2, bound, nextBound);
        } else {
          onewayOrMultiCityTmp.splice(num, 1, bound);
        }

        //画面入力を行った場合、乗継地を削除する
        onewayOrMultiCityTmp = onewayOrMultiCityTmp.map((v) => ({ ...v, connectionLocationCode: null }));

        const state: SearchFlightState = {
          ...this.searchFlightData,
          onewayOrMultiCity: onewayOrMultiCityTmp,
          isJapanOnly: this.isJapanOnlyFlag,
        };

        this._searchFlightStoreService.updateStore(state);
        this.changeAirport.emit();
      }
    }
  }

  /** 出発日の空港部品のOutput取得メソッド */
  public getOutputDepartureDate(date: Date[], num: number): void {
    if (this.eventEnabled) {
      const bound: Bound = {
        ...this.searchFlightData.onewayOrMultiCity[num],
        departureDate: date[0],
      };

      let onewayOrMultiCityTmp: Array<Bound> = [];
      onewayOrMultiCityTmp = this.searchFlightData.onewayOrMultiCity.slice();
      onewayOrMultiCityTmp.splice(num, 1, bound);

      let state: SearchFlightState = {
        ...this.searchFlightData,
        onewayOrMultiCity: onewayOrMultiCityTmp,
      };
      // Mixed Cabin利用可否判定・リセット
      state = this._shoppingLibService.checkMixCabinAndReset(state);

      this._searchFlightStoreService.updateStore(state);
      this.changeDepartureDate.emit(date);
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

  /** 搭乗者の人数指定部品のOutput取得メソッド */
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

  /** 運賃オプションモーダルのOutput取得メソッド(Mixed Cabinの利用無のみ) */
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
