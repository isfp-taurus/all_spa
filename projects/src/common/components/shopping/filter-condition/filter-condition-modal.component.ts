import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { PageType, ValidationErrorInfo } from '@lib/interfaces';
import {
  AswMasterService,
  CommonLibService,
  ErrorsHandlerService,
  LoggerDatadogService,
  PageLoadingService,
  SystemDateService,
} from '@lib/services';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { MASTER_TABLE } from '@conf/asw-master.config';
import {
  BoundFilterItem,
  CodeFilterItem,
  FilterConditionData,
  FilterConditionOutput,
} from './filter-condition-modal.state';
import { FareTypeItem } from '@common/interfaces';
import { RangeSliderComponent } from '@lib/components';
import { AirportI18nSearchForAirportCodeCache } from '@common/services/shopping/shopping-lib/shopping-lib.state';
import { M_AIRLINES } from '@common/interfaces/common/m_airline.interface';
import { AppConstants } from '@conf/app.constants';

interface ErrorMessage {
  // 乗継空港のチェックエラー
  transitAirportErrors: ValidationErrorInfo | string;
}
/**
 * フィルター条件モーダル
 */
@Component({
  selector: 'asw-filter-condition-modal',
  templateUrl: './filter-condition-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterConditionModalComponent extends SupportModalBlockComponent {
  public appConstants = AppConstants;

  @ViewChild('paymentTotalRangeSlider') paymentTotalRangeSlider?: RangeSliderComponent;
  constructor(
    private _common: CommonLibService,
    private translate: TranslateService,
    private _aswMasterSvc: AswMasterService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _systemDateSvc: SystemDateService,
    private _pageLoadingService: PageLoadingService,
    private _loggerSvc: LoggerDatadogService
  ) {
    super(_common);
  }

  // 支払総額
  public paymentTotalRangeControl!: FormControl;

  // フィルター条件モーダルに描画するデータ
  public filterConditionData!: FilterConditionData;
  // 割引適用有無
  public isPromotionApplied!: boolean;

  // バウンド毎のレンジスライダーの値を適切に埋め込み、またはリセットするために設定する
  public boundControls!: FormArray<FormGroup>;

  /** モーダル外部にデータを渡すSubject */
  private subject!: Subject<FilterConditionOutput>;

  // 乗継空港
  public transitAirportsGroup!: FormGroup;

  // 適用ボタンの有効/無効flg
  public applyDisabled = false;

  // 適用ボタンの無効制御数
  static APPLY_DISABLE_LIMIT = 2;

  // 使用言語
  public lang!: string;

  // チェックエラー
  public errorMessages: ErrorMessage[] = [];

  /**
   * 空港名称取得および空港リストソート処理
   * @param airportList 空港情報リスト
   * @returns ソートされた空港情報リスト
   */
  private getAndSortAirportList(airportList: CodeFilterItem[]): CodeFilterItem[] {
    // マスタ存在空港リスト
    let inMasterAirportList: CodeFilterItem[] = [];
    // マスタ存在なし空港リスト
    let notInMasterAirportList: CodeFilterItem[] = [];

    for (let i = 0; i < airportList.length; i++) {
      // フィルタ条件=検索条件なのでSearchForAirportCodeCache
      let _airPorts: AirportI18nSearchForAirportCodeCache =
        this._aswMasterSvc.aswMaster[MASTER_TABLE.AIRPORT_I18N_SEARCH_FOR_AIRPORT_CODE.key];
      let airPorts = _airPorts[airportList[i].code];
      if (airPorts) {
        for (let j = 0; j < airPorts.length; j++) {
          // 当該空港.空港コード=空港コードとなるASWDB(マスタ)の空港のレコードが存在する場合、
          // 当該空港.空港名称にASWDB(マスタ)の空港.空港名称、当該空港.表示順にASWDB(マスタ)の空港.有償表示順を設定し、
          // マスタ存在空港リストに当該空港を追加する
          if (airPorts[j].search_for_airport_code === airportList[i].code) {
            airportList[i].name = airPorts[j].airport_name;
            airportList[i].displayOrder = airPorts[j].revenue_display_order;
            inMasterAirportList.push(airportList[i]);
            break;
          }

          // 当該空港.空港コード=空港コードとなるASWDB(マスタ)の空港のレコードが存在しない場合、
          // マスタ存在なし空港リストに当該空港を追加する
          if (j === airPorts.length - 1 && airPorts[j].search_for_airport_code !== airportList[i].code) {
            notInMasterAirportList.push(airportList[i]);
            break;
          }
        }
      } else {
        // 当該空港.空港コード=空港コードとなるASWDB(マスタ)の空港のレコードが存在しない場合、
        // マスタ存在なし空港リストに当該空港を追加する
        notInMasterAirportList.push(airportList[i]);
      }
    }

    // マスタ存在空港リストの要素数>1の場合
    if (inMasterAirportList.length > 1) {
      // マスタ存在空港リストを有償表示順の昇順でソートする
      inMasterAirportList.sort(function (a, b) {
        if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
          if (a.displayOrder < b.displayOrder) return -1;
          if (a.displayOrder > b.displayOrder) return 1;
          return 0;
        }
        return 0;
      });
    }

    // マスタ存在なし空港リストが空でない場合
    if (notInMasterAirportList.length > 0) {
      // マスタ存在空港リストの末尾にマスタ存在なし空港リストを追加する
      inMasterAirportList = inMasterAirportList.concat(notInMasterAirportList);
    }

    // マスタ存在空港リストを戻り値として返却する
    return inMasterAirportList;
  }

  /**
   * ASWDB(マスタ)のキャリアテーブルからキャリア名の取得
   * @param airline キャリア情報
   * @returns キャリア名称
   */
  private getAirlineName(airline: FareTypeItem): string {
    // キャッシュを取得
    let result = airline.name;
    // キャッシュにデータがあった場合はこちらを更新
    let updateResult = '';
    let _airlines: M_AIRLINES = this._aswMasterSvc.aswMaster[MASTER_TABLE.AIRLINE_I18NJOINALL.key];
    let airlines = _airlines?.[airline.value];
    if (!airlines || airlines.length === 0) {
      // キャリア情報に該当するデータが取得できないか空だった場合、運用確認ログを出力する
      this._loggerSvc.operationConfirmLog('MST0003', {
        0: MASTER_TABLE.AIRLINE_I18NJOINALL.fileName,
        1: airline.value,
      });
    }
    let operationDate = this._systemDateSvc.getSystemDate().toISOString().slice(0, 10).split('-').join('');
    for (let i = 0; i < airlines?.length; i++) {
      if (
        airlines[i].airline_code === airline.value &&
        airlines[i].apply_from_date <= operationDate &&
        airlines[i].apply_to_date >= operationDate
      ) {
        updateResult = airlines[i].airline_name;
        break;
      }
    }

    if (updateResult) {
      return updateResult;
    }
    return result;
  }

  reload(): void {}

  init(): void {
    this.subject = this.payload.subject;
    this.filterConditionData = JSON.parse(JSON.stringify(this.payload.data));
    this.lang = this._common.aswContextStoreService.aswContextData.lang;
    this.initializeFilterState();
    // 支払総額
    this.paymentTotalRangeControl = new FormControl([
      this.filterConditionData.budgetRange.selectedMinValue,
      this.filterConditionData.budgetRange.selectedMaxValue,
    ]);
    this.boundControls = new FormArray(
      this.filterConditionData.boundFilterItemList.map(
        (bound: BoundFilterItem) =>
          new FormGroup({
            // 総所要時間
            totalTravelTimeRangeControl: new FormControl([
              bound.durationRange.selectedMinValue,
              bound.durationRange.selectedMaxValue,
            ]),
            // 出発時間帯
            departureTimeRangeControl: new FormControl([
              bound.departureTimeRange.selectedMinValue,
              bound.departureTimeRange.selectedMaxValue,
            ]),
            // 到着時間帯
            arrivalTimeRangeControl: new FormControl([
              bound.arrivalTimeRange.selectedMinValue,
              bound.arrivalTimeRange.selectedMaxValue,
            ]),
            // 乗継時間
            transitTimeRangeControl: new FormControl(bound.transitTimeRange.selectedMinValue),
            // 乗継空港
            transitAirportsControl: new FormControl(),
          })
      )
    );
    // 乗継空港のバリエーション処理
    this.checkTransitAirportStatus();
    this.forValidateInput();
  }

  destroy(): void {}

  private initializeFilterState() {
    // 空港コードを基に空港名称をASWDB（キャッシュ）から取得する
    this.filterConditionData.boundFilterItemList.forEach((value) => {
      // 乗継空港リストについて、空港名称取得および空港リストソート処理を行う
      value.transitAirportList = this.getAndSortAirportList(value.transitAirportList);

      // 運航キャリア名称取得処理
      value.operationAirlineList.forEach((operatingAirline) => {
        operatingAirline.name = this.getAirlineName(operatingAirline);
      });
      // ここまで運航キャリア名称取得処理
    });
  }

  /** 入力チェックに関する処理 */
  private forValidateInput() {
    // 初期化時に、各項目から、乗継回数をチェック
    let tranSitAirportCount = 0;
    Object.values(this.filterConditionData.boundFilterItemList).forEach((boundFilterItem) => {
      boundFilterItem.transitAirportList.forEach((tranSitAirport) => {
        if (tranSitAirport.isEnabled) {
          tranSitAirportCount += 1;
        }
      });
    });
    this.setTransitAirportErrorStatus(tranSitAirportCount >= FilterConditionModalComponent.APPLY_DISABLE_LIMIT);
  }

  /** リセット処理行う */
  public filterDataReset() {
    // フィルター条件モーダル表示用の初期データからデータを複製
    this.filterConditionData = JSON.parse(JSON.stringify(this.payload.initialData));
    this.initializeFilterState();
    this.paymentTotalRangeControl.setValue([
      this.filterConditionData.budgetRange.selectedMinValue,
      this.filterConditionData.budgetRange.selectedMaxValue,
    ]);
    this.paymentTotalRangeSlider?.ngAfterViewInit();
    this.boundControls.controls.forEach((control, index) => {
      const bound = this.filterConditionData.boundFilterItemList[index];
      // 総所要時間
      control
        .get('totalTravelTimeRangeControl')
        ?.setValue([bound.durationRange.selectedMinValue, bound.durationRange.selectedMaxValue]);
      // 出発時間帯
      control
        .get('departureTimeRangeControl')
        ?.setValue([bound.departureTimeRange.selectedMinValue, bound.departureTimeRange.selectedMaxValue]);
      // 到着時間帯
      control
        .get('arrivalTimeRangeControl')
        ?.setValue([bound.arrivalTimeRange.selectedMinValue, bound.arrivalTimeRange.selectedMaxValue]);
      // 乗継時間
      control.get('transitTimeRangeControl')?.setValue(bound.transitTimeRange.selectedMinValue);
    });
  }

  public applyDialog(data: FilterConditionData) {
    this._pageLoadingService.startLoading();
    const filterConditionData = this.createSelectedFilterConditionData(data);
    this.subject.next({
      data: filterConditionData,
    });
    this._pageLoadingService.endLoading();
    this.closeModal();
  }

  private createSelectedFilterConditionData(data: FilterConditionData) {
    // 支払総額のフィルター選択値に更新
    data.budgetRange.selectedMinValue = this.paymentTotalRangeControl.value[0];
    data.budgetRange.selectedMaxValue = this.paymentTotalRangeControl.value[1];

    // 総所要時間、出発時間帯、到着時間帯、乗継時間の各フィルター選択値に値を更新
    this.boundControls.controls.forEach((control, index) => {
      // 総所要時間
      data.boundFilterItemList[index].durationRange.selectedMinValue =
        control.get('totalTravelTimeRangeControl')?.value[0];
      data.boundFilterItemList[index].durationRange.selectedMaxValue =
        control.get('totalTravelTimeRangeControl')?.value[1];

      // 出発時間帯
      data.boundFilterItemList[index].departureTimeRange.selectedMinValue =
        control.get('departureTimeRangeControl')?.value[0];
      data.boundFilterItemList[index].departureTimeRange.selectedMaxValue =
        control.get('departureTimeRangeControl')?.value[1];

      // 到着時間帯
      data.boundFilterItemList[index].arrivalTimeRange.selectedMinValue =
        control.get('arrivalTimeRangeControl')?.value[0];
      data.boundFilterItemList[index].arrivalTimeRange.selectedMaxValue =
        control.get('arrivalTimeRangeControl')?.value[1];

      // 乗継時間
      data.boundFilterItemList[index].transitTimeRange.selectedMinValue = control.get('transitTimeRangeControl')?.value;
    });
    return data;
  }

  /** モーダルの選択をキャンセルして閉じる */
  public cancelDialog() {
    this.closeModal();
  }

  /** モーダルを閉じる */
  public closeModal() {
    this.close();
  }

  /** 乗継空港のチェックボックスをループして、
   * チェックした乗継空港の数で判定した結果をもとに適用ボタンの無効/有効制御を行う */
  public checkTransitAirportStatus(index?: number) {
    const applyDisabledFlg: Map<number, boolean> = new Map<number, boolean>();
    applyDisabledFlg.set(0, this.applyDisabled);
    applyDisabledFlg.set(1, this.applyDisabled);

    // 往路の乗継時間の活性状態判定
    if (index === 0) {
      this.filterConditionData.boundFilterItemList[index].transitTimeRangeEnabled =
        this.filterConditionData.boundFilterItemList[index].transitAirportList.some((i) => i.isEnabled);
    }
    // 復路の乗継時間の活性状態判定
    if (index === 1) {
      this.filterConditionData.boundFilterItemList[index].transitTimeRangeEnabled =
        this.filterConditionData.boundFilterItemList[index].transitAirportList.some((i) => i.isEnabled);
    }

    this.boundControls.controls.forEach((control, index) => {
      const bound = this.filterConditionData.boundFilterItemList[index];
      let count = 0;
      bound.transitAirportList.forEach((v) => {
        if (v.isEnabled) {
          count += 1;
        }
      });
      this.errorMessages.push({ transitAirportErrors: '' });
      this.errorMessages[index].transitAirportErrors =
        count >= FilterConditionModalComponent.APPLY_DISABLE_LIMIT ? { errorMsgId: 'E0815' } : '';
      applyDisabledFlg.set(index, count >= FilterConditionModalComponent.APPLY_DISABLE_LIMIT);
    });

    this.setTransitAirportErrorStatus(Boolean(applyDisabledFlg.get(0) || applyDisabledFlg.get(1)));
  }

  /** 乗継空港を2つ以上選択した場合、適用ボタンの無効/有効制御を行う */
  setTransitAirportErrorStatus(selected: boolean) {
    if (selected) {
      this.applyDisabled = true;
    } else {
      this.applyDisabled = false;
    }
  }
}
