import { OverlayRef } from '@angular/cdk/overlay';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { BaseModalComponent, ModalType } from '../base-modal/base-modal.component';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { mergeArray } from '../../helpers';
import { ReplaceParam, ValidationErrorInfo } from '@lib/interfaces';
import { MasterDataService } from '../../services';
import {
  BoundFilterCondition,
  BoundFilterFormValue,
  FareName,
  FilterConditionDomestic,
  FilterFormValue,
  FilterLocationNameInfo,
  OperatingAirline,
} from '../../interfaces';
import { AppConstants } from '@conf/app.constants';

/** エラー名称 */
const ERROR_NAME = {
  CONNECTIONS: 'validate-connections',
};
/** 乗継空港入力チェックParam */
let connectionsParams: ReplaceParam = {
  key: 0,
  value: 'label.transitAirport',
};
/** 乗継空港入力チェック(E0815) */
let connectionsValidationError: ValidationErrorInfo = {
  errorMsgId: 'E0815',
  params: connectionsParams,
};

/**
 * フィルタ条件モーダルComponent
 */
@Component({
  selector: 'asw-filter-flight-modal',
  templateUrl: './filter-flight-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterFlightModalComponent implements OnInit, AfterViewInit {
  public appConstants = AppConstants;
  /**
   * overlayRef
   */
  public overlayRef?: OverlayRef;

  /**
   * ボタン名
   */
  public buttonName = 'Apply';

  /**
   * モーダル種別
   */
  public modalType: ModalType = '05';

  /**
   * フッタ有無
   */
  public hasFooter = true;

  /**
   * タイトル
   */
  public title = 'label.filterForFlight.title';

  /**
   * focus要素
   */
  public focusElement?: any;

  /**
   * フィルタ条件
   */
  public filterCondition!: FilterConditionDomestic;

  /**
   * 往路フィルタ存在有無
   */
  public isOutFilterExist: boolean = false;

  /**
   * 復路フィルタ存在有無
   */
  public isReturnFilterExist: boolean = false;

  /**
   * プロモーション利用可否
   */
  public isPromotionVisible?: boolean;

  /**
   * 復路のバウンドリスト表示可否
   */
  public isReturnVisible?: boolean;

  /**
   * 差分表示可否
   */
  public isDifferDispaly?: boolean;

  /**
   * プロモーション表示可否
   */
  public isPromotionDisplay?: boolean;

  /**
   * フィルターコンディションフォーム
   */
  public filterForm: FormGroup;

  /**
   * 往路: フィルターコンディションフォーム
   */
  public outBoundForm: FormGroup;

  /**
   * 復路: フィルターコンディションフォーム
   */
  public returnBoundForm: FormGroup;

  /**
   * 初期フィルタ条件
   */
  public filterConditionInitData!: FilterConditionDomestic;

  /**
   * 運賃フィルタ種別
   */
  public selectedFare: '0' | '1' = '0';

  @Output()
  public buttonClick$: EventEmitter<FilterConditionDomestic> = new EventEmitter<FilterConditionDomestic>();

  @ViewChild(BaseModalComponent)
  public baseModal!: BaseModalComponent;

  public constructor(private _formBuilder: FormBuilder, private _masterDataService: MasterDataService) {
    this.outBoundForm = this._buildBoundForm();
    this.returnBoundForm = this._buildBoundForm();
    this.filterForm = this._formBuilder.group({
      seatAvailability: false,
      flightBudget: [],
      promotion: false,
      fareOptions: [],
      fareNameMap: '',
      outBoundForm: this.outBoundForm,
      returnBoundForm: this.returnBoundForm,
    });
  }

  public ngAfterViewInit(): void {
    this.isOutFilterExist = !!this.filterCondition.outBound;
    this.isReturnFilterExist = !!this.filterCondition.returnBound && !!this.isReturnVisible;
    this.isPromotionDisplay = !!this.isPromotionVisible;
  }

  /**
   * 初期化処理
   */
  public ngOnInit() {
    this.outBoundForm.controls['connections'].valueChanges.subscribe((value) => {
      this._setConnectionTimeDisableStatus(value, 'out');
    });
    this.returnBoundForm.controls['connections'].valueChanges.subscribe((value) => {
      this._setConnectionTimeDisableStatus(value, 'return');
    });
    this._setFilterForm(this.filterCondition);
    if (this.filterCondition.fareOptions?.fareOptionType) {
      this.selectedFare = this.filterCondition.fareOptions?.fareOptionType!;
    }
    if (this.selectedFare === '0') {
      this.filterForm.controls['fareNameMap'].disable();
      this.filterForm.controls['fareOptions'].enable();
    } else if (this.selectedFare === '1') {
      this.filterForm.controls['fareNameMap'].enable();
      this.filterForm.controls['fareOptions'].disable();
    }
  }

  /**
   * 運賃フィルタ種別の選択
   * @param type 運賃フィルタ種別
   */
  public selectedFareHandle(type: string) {
    if (type === '0') {
      this.selectedFare = '0';
      this.filterForm.controls['fareNameMap'].disable();
      this.filterForm.controls['fareOptions']?.enable();
    } else {
      this.selectedFare = '1';
      this.filterForm.controls['fareOptions']?.disable();
      this.filterForm.controls['fareNameMap']?.enable();
    }
  }

  /**
   * 乗継時間活性・非活性状態設定
   * @param connections 乗継回数
   * @param boundType バウンド種別
   */
  public _setConnectionTimeDisableStatus(connections: boolean[], boundType: 'out' | 'return') {
    if (boundType === 'out') {
      if (connections.some(Boolean)) {
        this.outBoundForm.controls['connectionTime'].enable();
      } else {
        this.outBoundForm.controls['connectionTime'].disable();
      }
    } else {
      if (connections.some(Boolean)) {
        this.returnBoundForm.controls['connectionTime'].enable();
      } else {
        this.returnBoundForm.controls['connectionTime'].disable();
      }
    }
  }
  /**
   * モーダルを閉じる
   */
  public close() {
    this.baseModal.close();
  }

  /**
   * フィルタ条件モーダル適用ボタン押下
   */
  public apply() {
    this.buttonClick$.emit(this._getFilterCondition(this.filterForm));
  }

  /**
   * フィルタ条件モーダルリセットボタン押下
   */
  public reset() {
    this.selectedFare = '0';
    if (this.selectedFare === '0') {
      this.filterForm.controls['fareNameMap'].disable();
      this.filterForm.controls['fareOptions'].enable();
    }
    this._setFilterForm(this.filterConditionInitData);
  }

  /**
   * バウンドフォーム初期化
   * @returns FormGroup
   */
  private _buildBoundForm(): FormGroup {
    return this._formBuilder.group({
      numberOfConnection: [],
      durationTime: [],
      originLocation: [],
      originDepatureTime: [],
      arrivalLocation: [],
      arrivalTime: [],
      connections: [null, this._checkConnections(connectionsValidationError)],
      connectionTime: [],
      operatingAirlines: [],
      aircraftCodes: [],
      wifiService: [],
    });
  }

  /**
   * 乗継空港入力チェック
   * @param option Validationエラー情報
   * @returns
   */
  private _checkConnections(option: ValidationErrorInfo): ValidatorFn {
    return (control: AbstractControl): { [key: string]: ValidationErrorInfo } | null => {
      if (control.value?.filter((isCheck: boolean) => isCheck).length >= 2) {
        return {
          [ERROR_NAME.CONNECTIONS]: option,
        };
      }
      return null;
    };
  }

  /**
   * フィルタフォーム設定
   * @param filterCondition フィルタ条件
   */
  private _setFilterForm(filterCondition: FilterConditionDomestic) {
    const formValue = this._getFormValue(filterCondition);
    this.filterForm.patchValue(formValue);
  }

  /**
   * フィルター条件をフォーム全体の値に変換する
   * @param filterCondition フィルタ条件
   * @returns
   */
  private _getFormValue(filterCondition: FilterConditionDomestic): FilterFormValue {
    const fareNameMap = filterCondition.fareOptions!.fareNameMap.find((fareName) => fareName.value);
    return {
      seatAvailability: filterCondition.seatAvailability,
      flightBudget: [filterCondition.priceFrom, filterCondition.priceTo],
      fareNameMap: fareNameMap ? fareNameMap.fareCode : '',
      fareOptions: filterCondition.fareOptions!.fareOptionMap.map((fareOption) => fareOption.value),
      promotion: filterCondition.promotion,
      outBoundForm: this._getBoundFormValue('out', filterCondition),
      returnBoundForm: this._getBoundFormValue('return', filterCondition),
    };
  }

  /**
   * バウンドFormValue
   * @param boundType 往復種別
   * @param filterCondition フィルタ条件
   * @returns BoundFilterCondition をフォーム値に変換する
   */
  private _getBoundFormValue(
    boundType: 'out' | 'return',
    filterCondition: FilterConditionDomestic
  ): BoundFilterFormValue | null {
    let boundCondition;
    if (boundType === 'out') {
      boundCondition = filterCondition.outBound || null;
    } else {
      boundCondition = filterCondition.returnBound || null;
    }
    return (
      boundCondition && {
        numberOfConnection: boundCondition.numberOfConnection.map((connectionNum) => connectionNum.value),
        durationTime: [boundCondition.durationFrom, boundCondition.durationTo],
        originLocation: boundCondition.originLocation.map((localtion) => localtion.value),
        originDepatureTime: [boundCondition.originTimeFrom, boundCondition.originTimeTo],
        arrivalLocation: boundCondition.arrivalLocation.map((location) => location.value),
        arrivalTime: [boundCondition.arrivalTimeFrom, boundCondition.arrivalTimeTo],
        connections: boundCondition.connections.map((connection) => connection.value),
        connectionTime: boundCondition.connectionTime,
        operatingAirlines: boundCondition.operatingAirlines.map((operatingAirline) => operatingAirline.value),
        aircraftCodes: boundCondition.aircraftCodes.map((aircraftCode) => aircraftCode.value),
        wifiService: boundCondition.wifiService,
      }
    );
  }

  /**
   * フォームの値をフィルター条件に変換する
   * @param filterForm フィルタフォーム
   * @returns
   */
  private _getFilterCondition(filterForm: FormGroup): FilterConditionDomestic {
    const { seatAvailability, fareOptions, fareNameMap, promotion, outBoundForm, returnBoundForm } =
      filterForm.controls;

    const FilterConditionParam = {
      // 選択可能な便
      seatAvailability: seatAvailability.value,
      // 最安金額
      priceMin: this.filterCondition.priceMin,
      // 最高金額
      priceMax: this.filterCondition.priceMax,
      // 総差額From
      priceFrom: filterForm.controls['flightBudget'].value[0],
      // 総差額To
      priceTo: filterForm.controls['flightBudget'].value[1],
      // 運賃フィルタ種別
      fareOptions: {
        // 運賃名称マップ
        fareNameMap: this._getOutputFareName(fareNameMap.value),
        // 運賃オプションマップ
        fareOptionMap: mergeArray(this.filterCondition.fareOptions?.fareOptionMap!, fareOptions.value),
        // 運賃フィルタ種別
        fareOptionType: this.selectedFare,
      },
      // プロモーション適用Air Offerのみ
      promotion: promotion.value,
      // 往路バウンド情報
      outBound: this._getBoundFilterCondition('out', outBoundForm as FormGroup),
      // 復路バウンド情報
      returnBound: this.isReturnFilterExist
        ? this._getBoundFilterCondition('return', returnBoundForm as FormGroup)
        : null,
    } as FilterConditionDomestic;
    return FilterConditionParam as FilterConditionDomestic;
  }

  /**
   * バウンドフィルタ条件取得
   * @param boundType バウンド種別
   * @param boundForm バウンフォーム
   * @returns
   */
  private _getBoundFilterCondition(boundType: 'out' | 'return', boundForm: FormGroup): BoundFilterCondition | null {
    let boundCondition = null;
    if (boundType === 'out') {
      boundCondition = this.filterCondition.outBound;
    } else {
      boundCondition = this.filterCondition.returnBound;
    }
    if (boundForm && boundCondition) {
      const {
        numberOfConnection,
        originLocation,
        arrivalLocation,
        connections,
        operatingAirlines,
        aircraftCodes,
        wifiService,
      } = boundForm.controls;
      return {
        // 乗継回数
        numberOfConnection: mergeArray(boundCondition.numberOfConnection, numberOfConnection.value),
        // 最小所要時間
        durationMin: boundCondition.durationMin,
        // 最大所要時間
        durationMax: boundCondition.durationMax,
        // 出発時刻 From
        originTimeFrom: boundForm.controls['originDepatureTime'].value[0],
        // 出発時刻 To
        originTimeTo: boundForm.controls['originDepatureTime'].value[1],
        // 出発空港
        originLocation: mergeArray(boundCondition.originLocation, originLocation.value),
        // 最小出発時刻
        originTimeMin: boundCondition.originTimeMin,
        // 最大出発時刻
        originTimeMax: boundCondition.originTimeMax,
        // 所要時間 From
        durationFrom: boundForm.controls['durationTime'].value[0],
        // 所要時間 To
        durationTo: boundForm.controls['durationTime'].value[1],
        // 到着空港
        arrivalLocation: mergeArray(boundCondition.arrivalLocation, arrivalLocation.value),
        // 最小到着時刻
        arrivalTimeMin: boundCondition.arrivalTimeMin,
        // 最大到着時刻
        arrivalTimeMax: boundCondition.arrivalTimeMax,
        // 到着時刻 From
        arrivalTimeFrom: boundForm.controls['arrivalTime'].value[0],
        // 到着時刻 To
        arrivalTimeTo: boundForm.controls['arrivalTime'].value[1],
        // 乗継空港
        connections: mergeArray(boundCondition.connections, connections.value),
        // 最小乗継時間
        connectionTimeMin: boundCondition.connectionTimeMin,
        // 最大乗継時間
        connectionTimeMax: boundCondition.connectionTimeMax,
        // 乗継時間
        connectionTime: boundForm.controls['connectionTime'].value,
        // 運航キャリア
        operatingAirlines: mergeArray(boundCondition.operatingAirlines, operatingAirlines.value),
        // 機種
        aircraftCodes: mergeArray(boundCondition.aircraftCodes, aircraftCodes.value),
        // Wi-Fiサービス
        wifiService: wifiService.value,
      } as BoundFilterCondition;
    } else {
      return null;
    }
  }

  private _getOutputFareName(fareNameCode: string): Array<FareName> {
    return this.filterCondition.fareOptions!.fareNameMap.map((fareName) => {
      if (fareName.fareCode === fareNameCode) {
        return { ...fareName, value: true };
      } else {
        return { ...fareName, value: false };
      }
    });
  }

  /**
   *  出発空港名称を取得する
   * @param name 出発空港コードと名称
   * @returns 出発空港名称
   */
  public getLocationName(name: FilterLocationNameInfo) {
    return this._masterDataService.getAirportName(name.locationCode, name.locationName);
  }

  /**
   * 運航航空会社名を取得する
   * @param name 運航キャリアコードと名称
   * @returns 運航航空会社名
   */
  public getAirlineName(name: OperatingAirline) {
    return this._masterDataService.getAirlineName(name.airlineCode, name.airlineName);
  }
}
