/**
 * 出発日選択部品　TODO 最新ハイライト等のデザイン
 *
 */
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
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MasterStoreKey } from '@conf/asw-master.config';
import { isPC, isTB, isSP, convertStringToDate } from '../../../helpers';
import { AswContextType } from '../../../interfaces/asw-context';
import { Holiday } from '../../../interfaces/holiday';
import { StaticMsgPipe } from '../../../pipes';
import { AswMasterService } from '../../../services/asw-master/asw-master.service';
import { CommonLibService } from '../../../services/common-lib/common-lib.service';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { Subject } from 'rxjs/internal/Subject';
import { SupportModalUiComponent } from '../../support-class/support-modal-ui-component';
import {
  DateSection,
  DateSelectorParts,
  DateInformation,
  DayStatus,
  MonthInformation,
  MonthStatus,
  YearInformation,
  WeekInformation,
} from './date-selector.state';
import { SystemDateService } from '../../../services/system-date/system-date.service';

interface FormatDate {
  year: string;
  month: string;
  day: string;
}

/**
 * 出発日選択部品
 *
 * @param id HTMLに設定するID
 * @param selectedDate 選択した出発日
 * @param selectedReturnDate 選択した往路日
 * @param changeDate 適用ボタンが押下されたとき呼ばれる関数。引数は選択した出発日、戻り値はなし。
 * @param dateSelectorParts 出発日選択部品入力値 @see {@link DateSelectorParts}
 * @param dateForm フォームグループ/ フォームコントロール
 */
@Component({
  selector: 'asw-date-selector',
  templateUrl: './date-selector.component.html',
  styleUrls: ['./date-selector.scss'], //アニメーション用のCSSを追加
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateSelectorComponent extends SupportModalUiComponent implements AfterViewInit {
  constructor(
    private _common: CommonLibService,
    public changeDetector: ChangeDetectorRef,
    private _aswMasterService: AswMasterService,
    private _elementRef: ElementRef,
    private _staticMsgPipe: StaticMsgPipe,
    private _sysDateService: SystemDateService
  ) {
    super(_common);
  }

  reload(): void {}
  init(): void {
    if (this._dateSelectorParts?.isRoundTrip) {
      this.toggleModalTitle();
    }

    //画面のリサイズイベント
    this.subscribeService('DateSelectorResize', fromEvent(window, 'resize'), this.resizeEvent); //throttleTimeを入れるとscrollが先に動いてバグる

    //祝日判定のためオフィスの切り替わりを検知
    this.subscribeService(
      'DateSelectorResizeUpdateOffice',
      this._common.aswContextStoreService.getAswContextByKey$(AswContextType.POINT_OF_SALE_ID),
      () => {
        const preIsPosJp = this.isPosJp;
        this.isPosJp = this._common.isJapaneseOffice();
        this.loadCache();
        if (this.dateSelectorParts && this.isPosJp !== preIsPosJp) {
          //　設定ありかつ日本オフィスに変更がかかった場合
          this.refreshSelectedCompDates();
          this.refreshList();
        }
      }
    );
  }
  destroy(): void {}

  loadCache() {
    const langPrefix = '_' + this._common.aswContextStoreService.aswContextData.lang;
    //マスター文言を取得
    this.subscribeService(
      'DateSelectorLoadAswMasterData_PD',
      this._aswMasterService.getAswMasterByKey$(MasterStoreKey.LISTDATA_PD_017 + langPrefix),
      (data: Array<{ key: string; value: string }>) => {
        if (12 <= data.length) {
          this.monthShortName = data.map((month) => month.value);
          this.updateDisplayMonth();
        }
      }
    );

    //AKAMAIから祝日データを取得
    this.subscribeService(
      'Holiday_NationalHolidayListFromToday',
      this._aswMasterService.getAswMasterByKey$(MasterStoreKey.HOLIDAY_NATIONALHOLIDAYLISTFROMTODAY),
      (data: Array<Holiday>) => {
        this.holidayListAkamai = data;
        this.updateHoliday();
      }
    );
  }

  private resizeEvent = () => {
    if (this.isOpen) {
      this.isPCPre = this.isPC;
      this.isTBPre = this.isTB;
      this.isSPPre = this.isSP;
      this.isPC = isPC();
      this.isTB = isTB();
      this.isSP = isSP();
      if (this.isPC !== this.isPCPre) {
        //PCとPC以外では月の表示数が異なるため切り替える
        this.displayMonthUsed = this.isPC ? this.displayMonth : this.displayMonthAll;
      }
      this.resize();
      if (this.scrollPosition) {
        this.scrollToSelectedMonth(this.scrollPosition);
      }
      this.changeDetector.markForCheck();
    }
  };

  ngAfterViewInit(): void {
    if (this.dateSelectorCalendars) {
      /**
       * ngForの要素変更後処理
       * PC ⇒　TABサイズになった際に「表示する要素数が変更（PCでは2か月、そのほかではすべての月）」される
       * さらに、PC ⇒　TABサイズになった際にPCで選択していた月の位置までスクロール位置を移動させる
       */
      this.subscribeService('dateSelectorEvent', this.dateSelectorCalendars.changes, (t) => {
        if (this.isOpen && this.isPC !== this.isPCPre) {
          this.setViewContent();
        }
      });
    }
  }

  /** フォーム */
  @ViewChild('inputDate') inputDate!: ElementRef<HTMLButtonElement>;
  /** モーダル全体 */
  @ViewChild('modalContents') modalContents!: ElementRef;
  /** モーダルのヘッダー部 */
  @ViewChild('modalHead') modalHead!: ElementRef;
  /** モーダルのフッター部 */
  @ViewChild('modalFooter') modalFooter!: ElementRef;
  /** モーダルのボディ部 */
  @ViewChild('modalBody') modalBody!: ElementRef;
  /** モーダルのボディの月選択の列 */
  @ViewChild('modalBodyMonth') modalBodyMonth!: ElementRef;
  /** モーダルのボディの日付選択の列 */
  @ViewChild('modalBodyCalendar') modalBodyCalendar!: ElementRef;
  /** モーダルのボディの日付選択の列 (月送りのボタンを除く) */
  @ViewChildren('dateSelectorCalendar') dateSelectorCalendars?: QueryList<any>;

  @Output()
  changeDate = new EventEmitter<Date[]>();

  @Input()
  public dateForm!: FormGroup | FormControl;

  public focusElement?: any;

  @Input()
  set selectedDate(data: Date | null) {
    if (data) {
      this._setDateResBind.newDate = data;
      if (this.initDateSelector && !this.isOpen) {
        if (this.dateSelectorParts?.isRoundTrip) {
          if (this._setDateResBind.returnDate) {
            this.setDate(this._setDateResBind.newDate, this._setDateResBind.returnDate);
            this._setDateResBind = {};
          }
        } else {
          this.setDate(this._setDateResBind.newDate);
          this._setDateResBind = {};
        }
      }
    } else {
      if (this.initDateSelector && !this.isOpen) {
        if (this.dateSelectorParts?.isRoundTrip) {
          if (this._setDateResBind.returnDate) {
            this.setDate(undefined, this._setDateResBind.returnDate);
            this._setDateResBind = {};
          }
        }
      }
    }
  }
  @Input()
  set selectedReturnDate(data: Date | null) {
    if (data) {
      this._setDateResBind.returnDate = data;
      if (this.initDateSelector && !this.isOpen) {
        if (this._setDateResBind.newDate) {
          this.setDate(this._setDateResBind.newDate, this._setDateResBind.returnDate);
          this._setDateResBind = {};
        } else {
          this.setDate(undefined, this._setDateResBind.returnDate);
          this._setDateResBind = {};
        }
      }
    } else {
      if (this.initDateSelector && !this.isOpen) {
        if (this._setDateResBind.newDate) {
          this.setDate(this._setDateResBind.newDate);
          this._setDateResBind = {};
        }
      }
    }
  }
  @Output()
  selectedDateChange = new EventEmitter<Date | null>();
  @Output()
  selectedReturnDateChange = new EventEmitter<Date | null>();

  _selectedCompDate: DateInformation | null = null;
  get selectedCompDate(): DateInformation | null {
    return this._selectedCompDate;
  }
  set selectedCompDate(value: DateInformation | null) {
    this._selectedCompDate = value;
    if (value) {
      this.selectedDateChange.emit(new Date(value.yearNum, value.monthNum, value.num));
    } else {
      this.selectedDateChange.emit(null);
    }
  }

  _selectedCompReturnDate: DateInformation | null = null;
  get selectedCompReturnDate(): DateInformation | null {
    return this._selectedCompReturnDate;
  }
  set selectedCompReturnDate(value: DateInformation | null) {
    this._selectedCompReturnDate = value;
    if (value) {
      this.selectedReturnDateChange.emit(new Date(value.yearNum, value.monthNum, value.num));
    } else {
      this.selectedReturnDateChange.emit(null);
    }
  }

  public _dateSelectorParts: DateSelectorParts | null = null;
  @Input()
  get dateSelectorParts() {
    return this._dateSelectorParts;
  }
  set dateSelectorParts(data: DateSelectorParts | null) {
    this._dateSelectorParts = data;
    this.refreshList();
  }

  /** 祝日リスト */
  public holidayListAkamai: Array<Holiday> = [];

  /** マスター文言 月名 */
  public monthShortName = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  /** マスター文言 月名 */
  public monthFullName = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  /** 静的文言 曜日 */
  public weekShortName = [
    'label.sunday',
    'label.monday',
    'label.tuesday',
    'label.wednesday',
    'label.thursday',
    'label.friday',
    'label.saturday',
  ];

  /** 静的文言 */
  public staticMessage = {
    formLabelForOneway: 'label.departureDate1',
    formLabelForRoundTrip: 'label.departReturnDays',
    placeholderForOneway: 'placeholder.departDay',
    placeholderForRoundTrip: 'placeholder.departReturnDays',
    modalTitleDeparture: 'heading.pleaseSelectDepartureDate',
    modalTitleReturn: 'heading.pleaseSelectReturnDate',
    modalTitleNormal: 'heading.pleaseSelectDepartureDate.normal',
    altClose: 'label.close',
    altPrevMonth: 'message.movePreviousMonthFormat',
    altNextMonth: 'message.moveFollowingMonthFormat',
    applyButton: 'label.apply1',
  };

  public inputSwitchCase = '';
  public inputPattern = {
    bothDepartureReturnDate: 'bothDepartureReturnDate',
    onlyDepartureDate: 'onlyDepartureDate',
    onlyReturnDate: 'onlyReturnDate',
    forOneway: 'forOneway',
  };
  public dateOrigin = '';
  public dateDestination = '';
  public placeholder = '';
  public formLabel = '';
  public DayStatus = DayStatus;
  public isApplyEnable = false;
  public modalTitle = this.staticMessage.modalTitleNormal;

  private scrollPosition?: HTMLDivElement; // PC/TAB/SP版を変更してもスクロール位置保持する

  public currentId = ''; //SP.TAB版で使用する。現在スクロール表示されている月のIDを格納。
  public isOpen = false;
  public isPosJp = true;
  public isPCPre = false; // PCかどうか
  public isTBPre = false; // タブレットかどうか
  public isSPPre = false; // スマホかどうか
  public isPC = false; // PCかどうか
  public isTB = false; // タブレットかどうか
  public isSP = false; // スマホかどうか
  public dateSection: DateSection = {
    fromDate: new Date(),
    toDate: new Date(),
    year: [],
  };

  //　初期化完了通知
  public initDateSelector$ = new Subject();
  private _setDateRes: { newDate?: Date; returnDate?: Date } = {};
  private _setDateResBind: { newDate?: Date; returnDate?: Date } = {};
  public initDateSelector = false;

  public displayMonth: MonthInformation[] = [];
  public displayMonthAll: MonthInformation[] = [];
  public displayMonthUsed: MonthInformation[] = [];
  private beforeSelectedCompDate: DateInformation | null = null;
  private beforeSelectedCompReturnDate: DateInformation | null = null;
  public selectedMonth?: MonthInformation; // wcag対応用

  public modalInitioalHeight = 0; // モーダルの初期高さ。スクロールバーの表示判定に使用
  public modalSetHeight = 0; // モーダルの高さ。スクロールバーの表示判定に使用

  /**
   * マスター文言から取得があった場合などに表示文字を更新
   */
  updateMonthShortName(): void {
    this.dateSection.year.forEach((year) => {
      year.month.forEach((month) => {
        month.subDispName = this.monthShortName[month.monthNum];
        month.dispName = month.yearNum + ' ' + this.monthShortName[month.monthNum];
        month.selectName = this.monthShortName[month.monthNum];
      });
    });
  }

  /**
   * 祝日の更新
   */
  updateHoliday(): void {
    if (this._common.isJapaneseOffice()) {
      this.dateSection.year.forEach((year) => {
        year.month.forEach((month) => {
          month.week.forEach((week) => {
            week.date.forEach((date) => {
              date.isHoliday = this.holidayListAkamai.some((holiday) => {
                let formatHoliday = convertStringToDate(holiday.holiday);
                formatHoliday.setDate(formatHoliday.getDate() + 1);
                return (
                  formatHoliday.getFullYear().toString() +
                    (formatHoliday.getMonth() + 1).toString().padStart(2, '0') +
                    formatHoliday.getDate().toString().padStart(2, '0') ===
                  date.yearNum.toString() +
                    (date.monthNum + 1).toString().padStart(2, '0') +
                    date.num.toString().padStart(2, '0')
                );
              });
            });
          });
        });
      });
    } else {
      this.dateSection.year.forEach((year) => {
        year.month.forEach((month) => {
          month.week.forEach((week) => {
            week.date.forEach((date) => {
              date.isHoliday = false;
            });
          });
        });
      });
    }
  }

  /**
   * 内部で使用するリストの更新
   */
  refreshList(): void {
    const _dateSection: DateSection = {
      fromDate: new Date(),
      toDate: new Date(),
      year: [],
    };
    this.isApplyEnable = false;

    this.placeholder = this._dateSelectorParts?.isRoundTrip
      ? this.staticMessage.placeholderForRoundTrip
      : this.staticMessage.placeholderForOneway;

    if (this._dateSelectorParts?.itemName) {
      this.formLabel = this._dateSelectorParts.itemName;
    } else {
      this.formLabel = this._dateSelectorParts?.isRoundTrip
        ? this.staticMessage.formLabelForRoundTrip
        : this.staticMessage.formLabelForOneway;
    }

    _dateSection.fromDate =
      this._dateSelectorParts?.baseDate ??
      this._sysDateService.getAirportLocalDate(this._common.aswContextStoreService.aswContextData.pointOfSaleId);

    // 選択可能日数を判定
    let toDate = new Date(_dateSection.fromDate);
    if (this._dateSelectorParts) {
      const parts = this._dateSelectorParts;
      if (parts.maxDates) {
        // 選択可能日数
        toDate.setDate(toDate.getDate() + parts.maxDates);
      } else if (parts.lastDate) {
        // 最終日
        toDate = parts.lastDate;
      } else {
        // 組み込み元から最終日と選択可能日数の両方が未選択
        toDate.setDate(toDate.getDate() + Number(this._aswMasterService.getMPropertyByKey('search', 'searchableDays')));
      }
    } else {
      // 組み込み元から最終日と選択可能日数の両方が未選択
      toDate.setDate(toDate.getDate() + Number(this._aswMasterService.getMPropertyByKey('search', 'searchableDays')));
    }
    _dateSection.toDate = toDate;

    const monthNum =
      (_dateSection.toDate.getFullYear() - _dateSection.fromDate.getFullYear()) * 12 +
      _dateSection.toDate.getMonth() -
      _dateSection.fromDate.getMonth() +
      1;
    let year: YearInformation = {
      yearNum: _dateSection.fromDate.getFullYear(),
      month: [],
    };
    let startDate = new Date(_dateSection.fromDate);
    startDate.setDate(1);
    for (let i = 0; i <= monthNum; i++) {
      if (startDate.getMonth() === 0 && i !== 0) {
        _dateSection.year.push({ ...year });
        year = {
          yearNum: startDate.getFullYear(),
          month: [],
        };
      }

      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      const month: MonthInformation = {
        id: this.id + '-month-display-' + i.toString(),
        subDispName: this.monthShortName[endDate.getMonth()],
        selectName: `${endDate.getFullYear()}/${this.monthFullName[endDate.getMonth()]}/01`,
        dispName: `${endDate.getFullYear()}/${this.monthFullName[endDate.getMonth()]}/01`,
        monthStatus:
          i === 0 ? MonthStatus.INITIAL_MONTH : i + 1 === monthNum ? MonthStatus.LAST_MONTH : MonthStatus.NONE,
        monthNum: endDate.getMonth(),
        maxNum: endDate.getDate(),
        week: [],
        yearNum: endDate.getFullYear(),
        enabled: true,
        previousEnabled: i !== 0,
        nextEnabled: i + 1 < monthNum,
      };
      const weekNum = startDate.getDay();
      let week: WeekInformation = {
        date: [],
      };
      if (weekNum !== 0) {
        //日曜日から1日までのダミー日にちを追加
        for (let j = 0; j < weekNum; j++) {
          week.date.push({
            id: this.modalId + endDate.getFullYear().toString() + endDate.getMonth().toString() + 'StartDummy' + j,
            num: 0,
            week: j,
            WeeklyName: this.weekShortName[j],
            isHoliday: false,
            status: DayStatus.HIDE,
            title: '',
            isFirst: false,
            isLast: false,
            yearNum: endDate.getFullYear(),
            monthNum: endDate.getMonth(),
            time: endDate.getFullYear() * 10000 + endDate.getMonth() * 100 + 0,
            isPrevious: false,
          });
        }
      }
      for (let j = 0; j < month.maxNum; j++) {
        const date: DateInformation = {
          id: this.modalId + endDate.getFullYear().toString() + endDate.getMonth().toString() + 'day' + j,
          num: j + 1,
          week: (weekNum + j) % 7,
          WeeklyName: this.weekShortName[(weekNum + j) % 7],
          isHoliday: false,
          status:
            this._selectedCompDate &&
            this._selectedCompDate.status === DayStatus.SELECTED &&
            this._selectedCompDate.yearNum === year.yearNum &&
            (this._selectedCompDate.monthNum === i + _dateSection.fromDate.getMonth() ||
              this._selectedCompDate.monthNum === i + _dateSection.fromDate.getMonth() - 12) &&
            this._selectedCompDate.num === j + 1
              ? DayStatus.SELECTED
              : DayStatus.NONE,
          title: endDate.getFullYear() + '/' + (endDate.getMonth() + 1) + '/' + (j + 1),
          isFirst: j === 0,
          isLast: j + 1 === month.maxNum,
          yearNum: endDate.getFullYear(),
          monthNum: endDate.getMonth(),
          time: endDate.getFullYear() * 10000 + endDate.getMonth() * 100 + j + 1,
          isPrevious:
            this._dateSelectorParts?.previousSectionDate?.getFullYear() === endDate.getFullYear() &&
            this._dateSelectorParts?.previousSectionDate?.getMonth() === endDate.getMonth() &&
            this._dateSelectorParts?.previousSectionDate?.getDate() === j + 1,
        };
        week.date.push(date);
        if ((weekNum + j) % 7 == 6) {
          month.week.push({ ...week });
          week = {
            date: [],
          };
        }
      }
      if (week.date.length != 0) {
        for (let j = week.date.length; j < 7; j++) {
          //最終日から土曜日までダミーの日付を追加
          week.date.push({
            id: this.modalId + endDate.getFullYear().toString() + endDate.getMonth().toString() + 'EndDummy' + j,
            num: 0,
            week: j,
            WeeklyName: this.weekShortName[j],
            isHoliday: false,
            status: DayStatus.HIDE,
            title: '',
            isFirst: false,
            isLast: false,
            yearNum: endDate.getFullYear(),
            monthNum: endDate.getMonth(),
            time: endDate.getFullYear() * 10000 + endDate.getMonth() * 100 + 0,
            isPrevious: false,
          });
        }
        month.week.push({ ...week });
      }
      if (monthNum === 1) {
        if (i === 0) {
          month.week.forEach((week) =>
            week.date
              .filter(
                (date) =>
                  (date.num < _dateSection.fromDate.getDate() || date.num > _dateSection.toDate.getDate()) &&
                  date.status !== DayStatus.HIDE
              )
              .forEach((date) => (date.status = DayStatus.DISABLE))
          );
        } else {
          month.week.forEach((week) =>
            week.date
              .filter((date) => date.status !== DayStatus.HIDE)
              .forEach((date) => (date.status = DayStatus.DISABLE))
          );
          month.enabled = false;
        }
      } else {
        if (i === 0) {
          month.week.forEach((week) =>
            week.date
              .filter((date) => date.num < _dateSection.fromDate.getDate() && date.status !== DayStatus.HIDE)
              .forEach((date) => (date.status = DayStatus.DISABLE))
          );
        } else if (i + 1 === monthNum) {
          month.week.forEach((week) =>
            week.date
              .filter((date) => date.num > _dateSection.toDate.getDate() && date.status !== DayStatus.HIDE)
              .forEach((date) => (date.status = DayStatus.DISABLE))
          );
        } else if (i === monthNum) {
          month.week.forEach((week) =>
            week.date
              .filter((date) => date.status !== DayStatus.HIDE)
              .forEach((date) => (date.status = DayStatus.DISABLE))
          );
          month.enabled = false;
        }
      }
      year.month.push(month);
      startDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
    }
    _dateSection.year.push({ ...year });
    this.dateSection = _dateSection;
    if (this.selectedCompDate) {
      this.refreshCalendar(this.selectedCompDate.yearNum, this.selectedCompDate.monthNum);
    } else {
      this.refreshCalendar(this.dateSection.fromDate.getFullYear(), this.dateSection.fromDate.getMonth());
    }
    const _displayMonthAll: MonthInformation[] = [];
    this.dateSection.year.forEach((year) =>
      year.month.forEach((month) => {
        _displayMonthAll.push(month);
      })
    );
    this.displayMonthAll = _displayMonthAll;
    this.currentId = this.displayMonthAll[0].id;
    this.updateHoliday();

    /** AKAMAIのキャッシュ取得待ちを行うため、リスト作成前に初期値がセットされる場合がある
     * そのため内部用の初期化フラグを持ち、リスト作成前に初期値がセットされていたらこのタイミングで再実施する。
     */
    this.initDateSelector = true;
    if (this._setDateRes.newDate) {
      this.setDate(this._setDateRes.newDate, this._setDateRes.returnDate);
      this._setDateRes = {};
    } else if (this._setDateResBind.newDate) {
      this.setDate(this._setDateResBind.newDate, this._setDateResBind.returnDate);
      this._setDateResBind = {};
    }
    this.initDateSelector$.next(null);
  }

  /**
   * 内部で使用する往路/復路選択日の初期化
   */
  private refreshSelectedCompDates(): void {
    this.selectedCompDate = null;
    this.selectedCompReturnDate = null;
  }

  onEscapeEvent(): void {
    this.isOpen = false;
  }

  onClickInput(): void {
    this.focusElement = document.activeElement;
    this.beforeSelectedCompDate = this.selectedCompDate;
    this.beforeSelectedCompReturnDate = this.selectedCompReturnDate;
    this.isOpen = true;
    this.dateForm.markAsTouched();
    this.isPC = isPC();
    this.isTB = isTB();
    this.isSP = isSP();
    this.isPCPre = this.isPC;
    this.isTBPre = this.isTB;
    this.isSPPre = this.isSP;
    this.updateDisplayMonth();
    const month = this.displayMonthAll.find(
      (mon) => mon.yearNum === this.selectedCompDate?.yearNum && mon.monthNum === this.selectedCompDate.monthNum
    );
    if (month) {
      this.currentId = month.id;
    }

    const firstDay = this.displayMonth.map((month) => {
      return month.week.flatMap((week) => week.date).find((date) => date.status === DayStatus.NONE);
    })[0];

    //描画後に処理を行う
    const resizeObserver = new ResizeObserver(() => {
      this.setViewContent();
      // 閉じるボタンにフォーカスが当たるので this.focusToButton(); は使用しない。
      if (firstDay) this._elementRef.nativeElement.querySelector(`#${firstDay.id}`).focus();
      //処理を行うのは1度のみでいいのでunobserveする
      resizeObserver.unobserve(this.modalHead.nativeElement);
    });
    resizeObserver.observe(this.modalHead.nativeElement);

    // 複雑都市用
    if (!this._dateSelectorParts?.isRoundTrip && this.selectedCompDate) {
      this.isApplyEnable = true;
    }
  }

  blurInput(): void {
    if (this.focusElement) {
      this.focusElement.focus();
    }
    this.isOpen = false;
    this.setDayToPreviousSettings();
    // フォームのラベルの更新
    this.clickApply();
  }

  getDateSection(): DateSection {
    return this.dateSection;
  }

  updateDisplayMonth(): void {
    this.displayMonthUsed = this.isPC ? this.displayMonth : this.displayMonthAll;
  }

  /** 日付をクリアする */
  clearDate(): void {
    this.dateOrigin = '';
    this.dateDestination = '';
    this.inputSwitchCase = '';
    this.changeDate.emit([]);
    this.refreshSelectedCompDates();
    this.refreshList();
    if (this.dateForm instanceof FormGroup) {
      Object.keys(this.dateForm.controls).forEach((controlName) => {
        this.dateForm.get(controlName)?.setValue(null);
      });
    }
    if (this.dateForm instanceof FormControl) this.dateForm.setValue(null);
  }

  /**
   * 画面のリサイズ処理及び、SP、TAB版の場合スクロール位置の設定を行う
   * スクロール位置は、選択した月が上にくる位置とする。
   */
  setViewContent(): void {
    this.resize();
    if (!this.isPC) {
      // 複雑都市で区分2以降で閉じてるモーダルを選択させないため、offsetTop !== 0としている
      const elemList: NodeListOf<HTMLDivElement> = document.querySelectorAll(`#${this.currentId}`);
      const elem = Array.from(elemList).find((e) => e.offsetTop !== 0);
      if (elem) {
        this.scrollToSelectedMonth(elem);
      }
    }
  }

  /**
   * SP、TAB用のスクロール検知して現在表示されている月を検知する処理
   * HACK 処理負荷となるためもっといい案があれば
   */
  scroll(): void {
    if (!this.isPC) {
      let currentMonth!: MonthInformation;
      const modalBodyTopIncludMargin: number = this.modalBody.nativeElement.scrollTop + 17;
      let id = '';
      this.displayMonthAll.forEach((month) => {
        // setViewContent()参照
        const monthList: NodeListOf<HTMLDivElement> = document.querySelectorAll(`#${month.id}`);
        const selectedMonthCalendar = Array.from(monthList).find((e) => e.offsetTop !== 0);
        if (selectedMonthCalendar) {
          const monthRowHeight: number = this.modalBodyMonth.nativeElement.offsetHeight;
          const selectedMonthCalendarTop = selectedMonthCalendar.offsetTop - monthRowHeight;

          if (modalBodyTopIncludMargin > selectedMonthCalendarTop) {
            id = month.id;
            currentMonth = month;
            this.scrollPosition = selectedMonthCalendar;
          }
        }
      });
      this.currentId = id;
      if (id !== this.displayMonth[0].id && currentMonth) {
        this.refreshCalendar(currentMonth.yearNum, currentMonth.monthNum);
      }
    }
  }

  /**
   * 月の位置にスクロールさせる \
   * スクロール位置 = 選択した月 - 月の列 - margin(16px)
   * @param {HTMLDivElement} monthElement 選択した月
   */
  private scrollToSelectedMonth(monthElement: HTMLDivElement): void {
    this.modalBody.nativeElement.scrollTop =
      monthElement.offsetTop - this.modalBodyMonth.nativeElement.offsetHeight - 16;
  }

  isCurrentMonth(month: MonthInformation): boolean {
    if (this.isPC) {
      return this.displayMonth[0].monthNum === month.monthNum && this.displayMonth[0].yearNum === month.yearNum;
    } else {
      return month.id === this.currentId;
    }
  }

  isEnablePrevious(): boolean {
    const twoBlockLength = 2;
    return twoBlockLength <= this.displayMonth.length && this.displayMonth[0].previousEnabled;
  }

  isEnableNext(): boolean {
    const twoBlockLength = 2;
    return twoBlockLength <= this.displayMonth.length && this.displayMonth[1].nextEnabled;
  }

  clickPrevious(): void {
    if (this.displayMonth[0].monthNum !== 0) {
      this.refreshCalendar(this.displayMonth[0].yearNum, this.displayMonth[0].monthNum - 1);
    } else {
      this.refreshCalendar(this.displayMonth[0].yearNum - 1, 11);
    }
  }

  clickNext(): void {
    this.refreshCalendar(this.displayMonth[1].yearNum, this.displayMonth[1].monthNum);
  }

  refreshCalendar(year: number, month: number): void {
    this.displayMonth = [];
    const yearInfo = this.dateSection.year.find((yearInfo) => yearInfo.yearNum === year);
    if (yearInfo) {
      const monthInfo1 = yearInfo.month.find((monthInfo) => monthInfo.monthNum === month);
      if (monthInfo1) {
        this.displayMonth.push(monthInfo1);
        if (monthInfo1.monthNum + 1 === 12) {
          const yearInfo2 = this.dateSection.year.find((yearInfo) => yearInfo.yearNum === year + 1);
          if (yearInfo2) {
            const monthInfo2 = yearInfo2.month.find((monthInfo) => monthInfo.monthNum === 0);
            if (monthInfo2) {
              this.displayMonth.push(monthInfo2);
            }
          }
        } else {
          const monthInfo2 = yearInfo.month.find((monthInfo) => monthInfo.monthNum === month + 1);
          if (monthInfo2) {
            this.displayMonth.push(monthInfo2);
          }
        }
        this.currentId = monthInfo1.id;
      }
    }
    this.updateDisplayMonth();
  }

  clickMonth(month: MonthInformation): void {
    if (this.isPC) {
      this.refreshCalendar(month.yearNum, month.monthNum);
      this.currentId = month.id;
    } else {
      // setViewContent()参照
      const monthList: NodeListOf<HTMLDivElement> = document.querySelectorAll(`#${month.id}`);
      const selectedMonthCalendar = Array.from(monthList).find((e) => e.offsetTop !== 0);
      if (selectedMonthCalendar) {
        this.scrollToSelectedMonth(selectedMonthCalendar);
      }
    }
    this.selectedMonth = month;
  }

  /**
   * 外部からの日付の設定
   * @param newDate 出発日
   * @param returnDate 往路日　往復旅程の場合
   */
  public setDate(newDate?: Date, returnDate?: Date): void {
    if (!this.initDateSelector) {
      //初期化前にセットされた場合いったん保留
      this._setDateRes = { newDate: newDate, returnDate: returnDate };
      return;
    }

    if (newDate && returnDate && newDate.getTime() > returnDate.getTime()) {
      this.dateOrigin = '';
      this.dateDestination = '';
      this.inputSwitchCase = '';
      return;
    }

    const datelist: DateInformation[] = [];
    this.dateSection.year.forEach((year) =>
      year.month.forEach((month) => month.week.forEach((week) => week.date.forEach((date) => datelist.push(date))))
    );
    const targetDate =
      newDate &&
      datelist.find(
        (date) =>
          date.yearNum === newDate.getFullYear() &&
          date.monthNum === newDate.getMonth() &&
          date.num === newDate.getDate() &&
          date.status !== DayStatus.DISABLE
      );
    if (targetDate) {
      this.refreshCalendar(targetDate.yearNum, targetDate.monthNum);
      // 往復
      if (this._dateSelectorParts?.isRoundTrip) {
        // 復路日を設定した場合
        if (returnDate) {
          const targetReturnDate = datelist.find(
            (date) =>
              date.yearNum === returnDate.getFullYear() &&
              date.monthNum === returnDate.getMonth() &&
              date.num === returnDate.getDate() &&
              date.status !== DayStatus.DISABLE
          );
          // 往路日復路日ともに既に選択していた場合、リセットする
          if (this.selectedCompDate !== null && this.selectedCompReturnDate !== null) {
            this.setDayStatusSection(this.selectedCompDate.time, this.selectedCompReturnDate.time, DayStatus.NONE);
          }
          // 復路日がカレンダーにある場合
          if (targetReturnDate) {
            this.selectedCompDate = targetDate;
            this.selectedCompReturnDate = targetReturnDate;
            this.setDayStatus(targetDate, DayStatus.SELECTED_FROM);
            this.setDayStatus(targetReturnDate, DayStatus.SELECTED_TO);
            this.setDayStatusSection(
              this.selectedCompDate.time + 1,
              this.selectedCompReturnDate.time - 1,
              DayStatus.SELECTED_SECTION
            );
            this.clickDate(targetDate);
            this.clickDate(targetReturnDate);
            this.clickApply();
            // 復路日がカレンダーにない場合
          } else {
            this.selectedCompDate = targetDate;
            this.setDayStatus(targetDate, DayStatus.SELECTED_FROM);
            this.clickDate(targetDate);
            this.isApplyEnable = false;
          }
          // 復路日を設定しない場合
        } else {
          // 往路日が既に選択されていた場合はリセット
          if (this.selectedCompDate !== null) {
            this.setDayStatus(this.selectedCompDate, DayStatus.NONE);
            // 復路日も既に選択されていた場合はリセット
            if (this.selectedCompReturnDate !== null) {
              this.setDayStatusSection(this.selectedCompDate.time, this.selectedCompReturnDate.time, DayStatus.NONE);
            }
          }
          this.refreshSelectedCompDates();
          this.clickDate(targetDate);
          this.clickApply();
        }
        // 片道
      } else {
        this.clickDate(targetDate);
        this.clickApply();
      }
    } else if (returnDate) {
      const targetReturnDate = datelist.find(
        (date) =>
          date.yearNum === returnDate.getFullYear() &&
          date.monthNum === returnDate.getMonth() &&
          date.num === returnDate.getDate() &&
          date.status !== DayStatus.DISABLE
      );
      if (targetReturnDate) {
        this.refreshCalendar(targetReturnDate.yearNum, targetReturnDate.monthNum);
        this.selectedCompReturnDate = targetReturnDate;
        this.setDayStatus(targetReturnDate, DayStatus.SELECTED_TO);
        this.clickApply();
      }
    }
    this.changeDetector.markForCheck();
  }

  /**
   * カレンダー日付選択
   * @param {DateInformation} date 選択した日付
   */
  clickDate(date: DateInformation): void {
    // フォームを空にする
    this.dateOrigin = '';
    this.dateDestination = '';
    this.inputSwitchCase = '';
    if (this._dateSelectorParts?.isRoundTrip) {
      if (!this.selectedCompDate && !this.selectedCompReturnDate) {
        this.dateForm instanceof FormGroup &&
          this.dateForm.get(Object.keys(this.dateForm.controls)[0])?.setValue(new Date(date.title));
        this.selectedCompDate = date;
        this.setDayStatus(date, DayStatus.SELECTED_FROM);
        this.isApplyEnable = false;
      } else if (!this.selectedCompDate && this.selectedCompReturnDate) {
        if (date.time > this.selectedCompReturnDate.time) {
          // 選択した日付が既に選択されていた帰りより未来だった場合新たに選択した日付を行きとして設定する
          // 選択済みの日付を取り消し
          this.setDayStatus(this.selectedCompReturnDate, DayStatus.NONE);
          // 日付の更新
          this.dateForm instanceof FormGroup &&
            this.dateForm.get(Object.keys(this.dateForm.controls)[0])?.setValue(new Date(date.title));
          this.selectedCompDate = date;
          this.setDayStatus(date, DayStatus.SELECTED_FROM);
          this.isApplyEnable = false;
        } else if (date.time < this.selectedCompReturnDate.time) {
          // 選択した日付が既に選択されていた帰りより過去だった場合新たに選択した日付を行きとして設定する
          this.dateForm instanceof FormGroup &&
            this.dateForm.get(Object.keys(this.dateForm.controls)[0])?.setValue(new Date(date.title));
          this.selectedCompDate = date;
          this.setDayStatus(date, DayStatus.SELECTED_FROM);
          this.setDayStatusSection(
            this.selectedCompDate.time + 1,
            this.selectedCompReturnDate.time - 1,
            DayStatus.SELECTED_SECTION
          );
          this.isApplyEnable = true;
        } else {
          // 選択した日付が既に選択されていた帰りと同日の場合
          this.dateForm instanceof FormGroup &&
            this.dateForm.get(Object.keys(this.dateForm.controls)[0])?.setValue(new Date(date.title));
          this.selectedCompDate = date;
          this.setDayStatus(date, DayStatus.SELECTED);
          this.isApplyEnable = true;
        }
      } else if (this.selectedCompDate && !this.selectedCompReturnDate) {
        if (date.time > this.selectedCompDate.time) {
          // 選択した日付が既に選択されていた行きより未来だった場合新たに選択した日付を帰りとして設定する
          this.dateForm instanceof FormGroup &&
            this.dateForm.get(Object.keys(this.dateForm.controls)[1])?.setValue(new Date(date.title));
          this.selectedCompReturnDate = date;
          this.setDayStatus(date, DayStatus.SELECTED_TO);
          this.setDayStatusSection(
            this.selectedCompDate.time + 1,
            this.selectedCompReturnDate.time - 1,
            DayStatus.SELECTED_SECTION
          );
          this.isApplyEnable = true;
        } else if (date.time < this.selectedCompDate.time) {
          // 選択した日付が既に選択されていた行きより過去だった場合新たに選択した日付を行きとして設定する
          // 選択済みの日付を取り消し
          this.setDayStatus(this.selectedCompDate, DayStatus.NONE);
          // 日付の更新
          this.dateForm instanceof FormGroup &&
            this.dateForm.get(Object.keys(this.dateForm.controls)[0])?.setValue(new Date(date.title));
          this.selectedCompDate = date;
          this.setDayStatus(date, DayStatus.SELECTED_FROM);
          this.isApplyEnable = false;
        } else {
          // 選択した日付が既に選択されていた行きと同日の場合
          this.dateForm instanceof FormGroup &&
            this.dateForm.get(Object.keys(this.dateForm.controls)[1])?.setValue(new Date(date.title));
          this.selectedCompReturnDate = date;
          this.setDayStatus(date, DayStatus.SELECTED);
          this.isApplyEnable = true;
        }
      } else if (this.selectedCompDate && this.selectedCompReturnDate) {
        // 選択済みの日付を取り消し
        this.setDayStatus(this.selectedCompDate, DayStatus.NONE);
        this.setDayStatus(this.selectedCompReturnDate, DayStatus.NONE);
        this.setDayStatusSection(this.selectedCompDate.time, this.selectedCompReturnDate.time, DayStatus.NONE);
        // 日付の更新
        this.selectedCompDate = date;
        this.selectedCompReturnDate = null;
        this.dateForm instanceof FormGroup &&
          this.dateForm.get(Object.keys(this.dateForm.controls)[0])?.setValue(new Date(date.title));
        this.setDayStatus(date, DayStatus.SELECTED_FROM);
        this.isApplyEnable = false;
      }

      this.toggleModalTitle();
    } else {
      // 選択済みの日付を取り消し
      if (this.selectedCompDate != null) {
        this.setDayStatus(this.selectedCompDate, DayStatus.NONE);
      }
      // 日付の更新
      this.selectedCompDate = date;
      this.dateForm.setValue(new Date(date.title));
      this.setDayStatus(date, DayStatus.SELECTED);
      this.isApplyEnable = true;
    }
  }

  private formatDate(date: DateInformation): string {
    const param: FormatDate = {
      year: date.yearNum.toString(),
      month: (date.monthNum + 1).toString().padStart(2, '0'),
      day: date.num.toString().padStart(2, '0'),
    };
    return `${param.year}/${param.month}/${param.day}`;
  }

  clickApply(): void {
    if (this._dateSelectorParts?.isRoundTrip) {
      if (this.selectedCompDate && this.selectedCompReturnDate) {
        this.dateOrigin = this.formatDate(this.selectedCompDate);
        this.dateDestination = this.formatDate(this.selectedCompReturnDate);
        this.inputSwitchCase = this.inputPattern.bothDepartureReturnDate;
      } else if (this.selectedCompDate) {
        this.dateOrigin = this.formatDate(this.selectedCompDate);
        this.inputSwitchCase = this.inputPattern.onlyDepartureDate;
      } else if (this.selectedCompReturnDate) {
        this.dateDestination = this.formatDate(this.selectedCompReturnDate);
        this.inputSwitchCase = this.inputPattern.onlyReturnDate;
      }
    } else {
      if (this.selectedCompDate) {
        this.dateOrigin = this.formatDate(this.selectedCompDate);
        this.inputSwitchCase = this.inputPattern.forOneway;
      }
    }
    this.isOpen = false;
    if (this.selectedCompDate) {
      this.refreshCalendar(this.selectedCompDate.yearNum, this.selectedCompDate.monthNum);
    }
    const event = [];
    this.selectedCompDate
      ? event.push(new Date(this.selectedCompDate.yearNum, this.selectedCompDate.monthNum, this.selectedCompDate.num))
      : null;
    this.selectedCompReturnDate
      ? event.push(
          new Date(
            this.selectedCompReturnDate.yearNum,
            this.selectedCompReturnDate.monthNum,
            this.selectedCompReturnDate.num
          )
        )
      : null;
    this.changeDate.emit(event);
  }

  setDayStatus(date: DateInformation, status: DayStatus): void {
    const yearInfo = this.dateSection.year.find((yearInfo) => yearInfo.yearNum === date.yearNum);
    if (yearInfo === undefined) return;
    const monthInfo = yearInfo.month.find((monthInfo) => monthInfo.monthNum === date.monthNum);
    if (monthInfo === undefined) return;
    const dateInfo = monthInfo.week
      .find((weekInfo) => weekInfo.date.find((dateInfo) => dateInfo.num === date.num) !== undefined)
      ?.date.find((dateInfo) => dateInfo.num === date.num);
    if (dateInfo === undefined) return;
    if (dateInfo.status !== DayStatus.DISABLE && dateInfo.status !== DayStatus.HIDE) {
      dateInfo.status = status;
    }
    // 読み上げ文言（表示/非表示）処理を実行
    if (status != DayStatus.NONE) {
      this.setSelectedDateAriaLabel(date);
    } else {
      this.removeSelectedDateAriaLabel(date);
    }
  }

  setDayStatusSection(timeFrom: number, timeTo: number, status: DayStatus): void {
    this.dateSection.year.forEach((year) => {
      year.month.forEach((month) => {
        month.week.forEach((week) => {
          week.date
            .filter((date) => timeFrom <= date.time && date.time <= timeTo)
            .forEach((dateInfo) => {
              if (dateInfo.status !== DayStatus.DISABLE && dateInfo.status !== DayStatus.HIDE) {
                dateInfo.status = status;
              }
            });
        });
      });
    });
  }

  /**
   * "×"ボタンで戻る際に日付情報も戻す
   */
  private setDayToPreviousSettings(): void {
    const setDayStatusSectionValue = (start: DateInformation, end: DateInformation, status: DayStatus): void => {
      this.setDayStatusSection(start.time + 1, end.time - 1, status);
    };
    // 日付を新しく選択した際はその日付を取り消す
    const resetOnewayForm = (): void => {
      if (this.selectedCompDate) {
        this.setDayStatus(this.selectedCompDate, DayStatus.NONE);
      }
      this.dateForm.setValue(null);
    };
    const resetRoundForm = (): void => {
      if (this.dateForm instanceof FormGroup) {
        if (this.selectedCompDate) {
          this.setDayStatus(this.selectedCompDate, DayStatus.NONE);
        }
        if (this.selectedCompReturnDate) {
          this.setDayStatus(this.selectedCompReturnDate, DayStatus.NONE);
        }
        if (this.selectedCompDate && this.selectedCompReturnDate) {
          setDayStatusSectionValue(this.selectedCompDate, this.selectedCompReturnDate, DayStatus.NONE);
        }
        this.dateForm.get(Object.keys(this.dateForm.controls)[0])?.setValue(null);
        this.dateForm.get(Object.keys(this.dateForm.controls)[1])?.setValue(null);
      }
    };

    if (this._dateSelectorParts?.isRoundTrip && this.dateForm instanceof FormGroup) {
      resetRoundForm();
      if (this.beforeSelectedCompDate && this.beforeSelectedCompReturnDate) {
        this.dateForm
          .get(Object.keys(this.dateForm.controls)[0])
          ?.setValue(new Date(this.beforeSelectedCompDate.title));
        this.setDayStatus(this.beforeSelectedCompDate, DayStatus.SELECTED_FROM);
        this.dateForm
          .get(Object.keys(this.dateForm.controls)[1])
          ?.setValue(new Date(this.beforeSelectedCompReturnDate.title));
        this.setDayStatus(this.beforeSelectedCompReturnDate, DayStatus.SELECTED_TO);
        setDayStatusSectionValue(
          this.beforeSelectedCompDate,
          this.beforeSelectedCompReturnDate,
          DayStatus.SELECTED_SECTION
        );
      } else if (this.beforeSelectedCompDate) {
        this.dateForm
          .get(Object.keys(this.dateForm.controls)[0])
          ?.setValue(new Date(this.beforeSelectedCompDate.title));
        this.setDayStatus(this.beforeSelectedCompDate, DayStatus.SELECTED_FROM);
      } else if (this.beforeSelectedCompReturnDate) {
        this.dateForm
          .get(Object.keys(this.dateForm.controls)[1])
          ?.setValue(new Date(this.beforeSelectedCompReturnDate.title));
        this.setDayStatus(this.beforeSelectedCompReturnDate, DayStatus.SELECTED_TO);
      }
    } else {
      resetOnewayForm();
      if (this.beforeSelectedCompDate) {
        this.dateForm.setValue(new Date(this.beforeSelectedCompDate.title));
        this.setDayStatus(this.beforeSelectedCompDate, DayStatus.SELECTED);
      }
    }

    this._setDateResBind = {
      newDate: this.beforeSelectedCompDate ? new Date(this.beforeSelectedCompDate.title) : undefined,
      returnDate: this.beforeSelectedCompReturnDate ? new Date(this.beforeSelectedCompReturnDate.title) : undefined,
    };
    this.selectedCompDate = this.beforeSelectedCompDate;
    this.selectedCompReturnDate = this.beforeSelectedCompReturnDate;
  }

  /**
   * 往復表示時に往路/復路でタイトルの文言を切り替える
   */
  private toggleModalTitle(): void {
    if (!this.selectedCompDate && !this.selectedCompReturnDate) {
      this.modalTitle = this.staticMessage.modalTitleDeparture;
      return;
    }
    if (this.selectedCompDate) {
      this.modalTitle = this.staticMessage.modalTitleReturn;
    }
    if (this.selectedCompReturnDate) {
      this.modalTitle = this.staticMessage.modalTitleDeparture;
    }
  }

  /**
   * カレンダーの十字キー移動対応
   * @param event
   * @param date
   * @returns
   */
  keyDownDate(event: KeyboardEvent, date: DateInformation): void {
    let add = 0;
    switch (event.key) {
      case 'ArrowUp':
        add = -7;
        break;
      case 'ArrowDown':
        add = 7;
        break;
      case 'ArrowLeft':
        add = -1;
        break;
      case 'ArrowRight':
        add = 1;
        break;
      default:
        return;
    }
    const newDate = new Date(date.yearNum, date.monthNum, date.num + add);
    const datelist: DateInformation[] = [];
    this.displayMonthUsed.forEach((month) =>
      month.week.forEach((week) => week.date.forEach((date) => datelist.push(date)))
    );
    const targetDate = datelist.find(
      (date) =>
        date.yearNum === newDate.getFullYear() &&
        date.monthNum === newDate.getMonth() &&
        date.num === newDate.getDate() &&
        date.status !== DayStatus.DISABLE
    );

    if (targetDate) {
      const elemList: NodeListOf<HTMLElement> = document.querySelectorAll(`#${targetDate.id}`);
      const el = Array.from(elemList).find((e) => e.offsetTop !== 0);
      if (el) {
        el.focus();
      }
    }
  }

  /**
   * カレンダーモーダルの画面高さ調整
   * - スクロールバーの表示判定
   * - カレンダー下部の影の表示判定
   */
  private resize(): void {
    const scroll = this.modalBody?.nativeElement?.scrollTop ?? 0;
    const minWindowHight = 375;

    // 参考 modal02のmax-height: calc(100vh - 64px - 64px);
    // モーダルの作り：Contents=(Header + Body(calendarBody) + Footer)
    const windowHeight = window.innerHeight;
    const modalBodyCalendarElement: HTMLDivElement = this.modalBodyCalendar.nativeElement;

    // モーダルの各要素の高さを取得
    const modalHeaderHeight: number = this.modalHead ? this.modalHead.nativeElement.offsetHeight : 0;
    const modalFooterHeight: number = this.modalFooter ? this.modalFooter.nativeElement.offsetHeight : 0;
    const isSmallScreen = window.matchMedia('(max-width: 767px)').matches;

    if (this.modalBody) {
      this.modalBody.nativeElement.style.height = '';
      if (this.modalContents) {
        this.modalContents.nativeElement.style.height = '';
      }
      this.modalInitioalHeight = this.modalBody.nativeElement.offsetHeight;
    }

    if (this.modalContents) {
      this.modalContents.nativeElement.classList.remove('is-fullscroll');
    }

    let setModalBodyHeightFlag = true;
    if (windowHeight < minWindowHight) {
      setModalBodyHeightFlag = false;
    }
    let margin = isSmallScreen ? 48 : 128;
    if (this.modalBody && this.modalContents) {
      if (setModalBodyHeightFlag) {
        const setVal = windowHeight - margin - modalHeaderHeight - modalFooterHeight;
        this.modalSetHeight = setVal;
        if (setVal > this.modalInitioalHeight) {
          this.modalBody.nativeElement.style.height = this.modalInitioalHeight + 'px';
          if (this.modalFooter) {
            this.modalFooter.nativeElement.classList.remove('is-shadow');
          }
        } else {
          this.modalBody.nativeElement.style.height = setVal + 'px';
          if (this.modalFooter) {
            this.modalFooter.nativeElement.classList.add('is-shadow');
          }
        }
      } else {
        const setVal = windowHeight - margin;
        this.modalContents.nativeElement.style.height = setVal + 'px';
        this.modalContents.nativeElement.classList.add('is-fullscroll');
        if (this.modalFooter && this.modalFooter.nativeElement.classList.hasClass('is-shadow')) {
          this.modalFooter.nativeElement.classList.remove('is-shadow');
        }
      }
      //スクロールしていた場合元の位置に戻す
      const maxScroll =
        (this.modalBody.nativeElement.scrollHeight ?? 0) - (this.modalBody.nativeElement.clientHeight ?? 0);
      if (maxScroll !== 0 && scroll !== 0) {
        this.modalBody.nativeElement.scrollTop = scroll < maxScroll ? scroll : maxScroll;
      }
    }

    // 月送りのボタンが動的に動くので固定させる
    if (this.isPC) {
      modalBodyCalendarElement.style.position = 'unset';
      const btns = modalBodyCalendarElement.querySelectorAll('button');
      btns.forEach((btn) => {
        btn.style.top = '60%';
      });
    }

    this.changeDetector.markForCheck();
  }

  /**
   * 外部からのフォームの設定
   * フライト検索画面で変更検知できないための対応
   */
  public markTouched(): void {
    this.dateForm.markAsTouched();
    this.changeDetector.detectChanges();
  }

  /**
   * 指定したフォームにフォーカスを設定する 組み込み元指定用
   */
  public setFocus(): void {
    this.inputDate.nativeElement.focus();
  }

  /**
   * エラー表示判定
   * - controlがinvalid（チェックエラー）かつフォーカスが外された場合に表示
   */
  public get showError(): boolean {
    // 往復の場合
    if (this.dateForm instanceof FormGroup) {
      // 往路復路どちらかにエラーがあれば表示
      if (
        this.dateForm &&
        (this.dateForm.get(Object.keys(this.dateForm.controls)[0])?.errors ||
          this.dateForm.get(Object.keys(this.dateForm.controls)[1])?.errors)
      ) {
        return this.invalid;
      }
      return false;

      // 片道の場合
    } else {
      if (this.dateForm && this.dateForm.errors) {
        return this.invalid;
      }
      return false;
    }
  }

  /**
   * controlのinvalid（チェックエラー）状態
   */
  private get invalid(): boolean {
    return this.dateForm ? !!this.dateForm.invalid : false;
  }

  /**
   * controlよりエラー情報取得
   */
  public get errors(): Array<string> {
    if (!this.dateForm) {
      return [];
    }

    if (this.dateForm instanceof FormGroup) {
      const controlNames = Object.keys(this.dateForm.controls);
      // 往復の場合は往路/復路のエラー片方を取得
      const errorsArray = controlNames
        .map((controlName) => this.dateForm.get(controlName)?.errors)
        .reduce((acc, errors) => ({ ...acc, ...errors }), {});
      return Object.values(errorsArray || []);
    } else {
      return Object.values(this.dateForm.errors || []);
    }
  }

  /**
   * 日付ボタン読み上げ用文言設定
   * @param date: DateInformation 選択された日付
   */
  private setSelectedDateAriaLabel(date: DateInformation) {
    const element = document.getElementById(date.id);
    if (element) {
      // 子要素から日付を取得
      const day = element.firstElementChild?.innerHTML;
      // 読み上げ用文字列に日付を設定して画面へ
      element.setAttribute('aria-label', this._staticMsgPipe.transform('reader.selectingDate', { '0': day }));
    }
  }

  /**
   * 日付ボタン読み上げ用文言削除
   * @param date: DateInformation 選択された日付
   */
  private removeSelectedDateAriaLabel(date: DateInformation) {
    const element = document.getElementById(date.id);
    if (element) {
      // 読み上げ用文字列を削除
      element.removeAttribute('aria-label');
    }
  }
}
