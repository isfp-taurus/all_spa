import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { DialogDisplayService, SystemDateService } from '@lib/services';
import {
  RoundtripFppItemAirBoundsDataType,
  RoundtripFppItemAirCalendarDataTypeAirCalendarPeriodDepartureDatesInner,
  RoundtripFppItemAirCalendarDataTypeAirCalendarPeriodReturnDatesInner,
} from '../../../sdk';
import { FlightSearchCondition, ResultDateNavi, ResultDateNaviStateEnum } from '../../../interfaces';
import { DialogClickType, DialogType } from '@lib/interfaces';
import { filter } from 'rxjs';
import { convertStringToDate } from '@lib/helpers';

/** メッセージコード */
const MSG_CODE = {
  MSG1112: 'm_dynamic_message-MSG1112',
};

/**
 * 7日間カレンダーContComponent
 */
@Component({
  selector: 'asw-result-date-navi-cont',
  templateUrl: './result-date-navi-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultDateNaviContComponent implements OnChanges {
  /**
   * 7日間カレンダー
   */
  @Input()
  public departureDates?: Array<
    | RoundtripFppItemAirCalendarDataTypeAirCalendarPeriodDepartureDatesInner
    | RoundtripFppItemAirCalendarDataTypeAirCalendarPeriodReturnDatesInner
  >;

  /**
   * 出発日
   */
  @Input()
  public departureDate?: string;

  /**
   * 検索条件
   */
  @Input()
  public searchCondition?: FlightSearchCondition;

  /**
   * 往復種別
   */
  @Input()
  public type?: 'out' | 'return';

  /**
   * 選択した往路Air Bound情報
   */
  @Input()
  public outSelectedAirBound?: RoundtripFppItemAirBoundsDataType | null;

  /**
   * 出発日ボタンイベント
   */
  @Output()
  public selectCalendar$: EventEmitter<string> = new EventEmitter<string>();

  /**
   * 7日間カレンダー
   */
  public sevenDayCalendar?: Array<ResultDateNavi>;

  constructor(private _dialogSvc: DialogDisplayService, private _systemDateSvc: SystemDateService) {}

  public ngOnChanges(): void {
    this._sevenDayCalendarInit();
  }

  /**
   * 出発日ボタン押下処理
   * @param date 日付
   */
  public selectCalendar(date: string) {
    /*
      1	アプリケーション情報.検索条件.区間毎の情報の件数が2件
      2	アプリケーション情報.選択した往路Air Bound情報が存在する。
      3	選択した7日間カレンダー.出発日が往路出発日
    */
    if (this.type === 'out' && this.outSelectedAirBound && this.searchCondition?.itineraries?.length === 2) {
      this._dialogSvc
        .openDialog({
          message: MSG_CODE.MSG1112,
          type: DialogType.CHOICE,
        })
        .buttonClick$.pipe(filter((dialog) => dialog.clickType === DialogClickType.CONFIRM))
        .subscribe(() => {
          this.selectCalendar$.emit(date);
        });
    } else {
      this.selectCalendar$.emit(date);
    }
  }

  /**
   * 7日間カレンダー初期表示処理
   */
  private _sevenDayCalendarInit() {
    if (this.departureDate && this.departureDates && this.type && this.searchCondition) {
      const sevenDayCalendar: ResultDateNavi[] = [];
      this.departureDates?.forEach((v) => {
        const resultDate = {
          state: this._getStateByDate(v),
          date: v.date,
          cheapestPrice: {
            currencyCode: v.cheapestPrice?.currencyCode,
            value: this.searchCondition?.fare?.fareOptionType === '49' ? 0 : v.cheapestPrice?.value,
          },
        };
        sevenDayCalendar.push(resultDate);
      });
      if (sevenDayCalendar.length > 0) {
        this.sevenDayCalendar = sevenDayCalendar;
      }
    }
  }

  /**
   * 出発日の表示状態を判定する。
   * 特典運賃かつ搭乗日当日は非活性とする。
   */
  private _getStateByDate(
    dateInfo:
      | RoundtripFppItemAirCalendarDataTypeAirCalendarPeriodDepartureDatesInner
      | RoundtripFppItemAirCalendarDataTypeAirCalendarPeriodReturnDatesInner
  ): ResultDateNaviStateEnum {
    const departureDate = convertStringToDate(this.departureDate!);
    // 特典運賃フラグ
    const isAwardFare = dateInfo.cheapestPrice?.value === 0 && dateInfo.isCheapest;
    // 操作日日付
    const systemDate = this._systemDateSvc.getSystemDate();
    if (departureDate.getTime() === convertStringToDate(dateInfo.date).getTime()) {
      return ResultDateNaviStateEnum.SELECTED;
    } else if (
      !(dateInfo.cheapestPrice && (dateInfo.cheapestPrice.value || dateInfo.cheapestPrice.value === 0)) ||
      (isAwardFare && new Date(dateInfo.date).getDate() === new Date(systemDate).getDate())
    ) {
      return ResultDateNaviStateEnum.DISABLED;
    } else {
      return ResultDateNaviStateEnum.VIEW;
    }
  }
}
