import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  EventEmitter,
  Input,
  Optional,
  Output,
  Self,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { SupportComponent } from '../../../components/support-class';
import { ValidationErrorInfo } from '../../../interfaces';
import { CommonLibService } from '../../../services';
import { YMDFormEvent } from './select-date-ymd.state';

//　内部で使用する型定義
type SelectYmdStatus = {
  id: string;
  num: any;
  label: string;
  altLabel: string | null;
  option: Array<{ value: number; disp: string }>;
  dateType: number;
};

/**
 * 日付プルダウン(年月日)
 * @param id HTMLにセットするID
 * @param dateFrom 日付範囲開始日
 * @param dateTo 日付範囲終了日
 * @param className 装飾の上書き
 * @param isMax 端数モード指定。 true max(23:59:59) false min(0:0:0)
 * @param order 表示順指定。例　YMD:年月日、MDY：月日年、DMY：日月年
 * @param errorMessage 画面に表示するエラーメッセージ
 * @param altLabels 部品にセットする読み上げ用文言　年月日の順で指定
 * @param initialDate 初期年月日。初期値として設定する年月日。
 * @param selectedDate 選択中に年月日
 * @param changeEvent 変更時イベント
 * @param isError エラーフラグ
 * @param disabled 現在の無効化状態
 */
@Component({
  selector: 'asw-select-date-ymd',
  templateUrl: './select-date-ymd.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./select-date-ymd.scss'],
})
export class SelectDateYmdComponent extends SupportComponent implements ControlValueAccessor, DoCheck {
  constructor(
    private _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    @Self() @Optional() public control: NgControl
  ) {
    super(_common);
    this.control && (this.control.valueAccessor = this);
  }

  init(): void {
    const initialValue = this.control?.value;
    if (initialValue instanceof Date) {
      this.initialDate = {
        year: initialValue.getFullYear(),
        month: initialValue.getMonth() + 1,
        day: initialValue.getDate(),
      };
    }
    const controlValueChanges = this.control?.valueChanges;
    if (controlValueChanges) {
      this.subscribeService('onChangeYmdValue', controlValueChanges, (changeValue) => {
        if (changeValue instanceof Date) {
          this._changeSelectDate(changeValue);
        }
        this._changeDetectorRef.markForCheck();
      });
    }
    this.refresh();
  }

  public ngDoCheck(): void {
    if (this.control && this.control.touched) {
      this._onEvent();
      this._changeDetectorRef.markForCheck();
    }
  }

  destroy(): void {}
  reload(): void {}

  // --- 以下、ControlValueAccessor用IF --- //

  private _onChange?: (value: any) => void;
  private _onTouched?: (value: any) => void;

  writeValue(value: typeof this.selectedDate): void {
    this.selectedDate = value;
  }
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // --- ここまで、ControlValueAccessor用IF --- //

  @Input()
  public id = 'SelectDateYmdComponent';
  @Input()
  public dateFrom: Date = new Date();
  @Input()
  public dateTo: Date = new Date(2030, 10, 22);

  public _className = 'c-form-element-select__select';
  @Input()
  set className(data: string) {
    this._className = data;
    this._changeDetectorRef.markForCheck();
  }
  get className() {
    return this._className;
  }
  @Input()
  public isMax = false;
  @Input()
  public title = 'Date Select';
  @Input()
  public order = 'DMY';
  public _errorMessage: string | ValidationErrorInfo = '';
  @Input()
  get errorMessage(): string | ValidationErrorInfo {
    return this._errorMessage;
  }
  set errorMessage(errors: string | ValidationErrorInfo) {
    this._errorMessage = errors;
    this.innerErrors = this.getErrors();
    this._changeDetectorRef.markForCheck();
  }
  @Input()
  public altLabels: Array<string> = ['', '', ''];
  @Input()
  public initialDate: { year?: number; month?: number; day?: number } = {};
  @Input()
  public selectedDate: Date | null = null;
  @Output()
  selectedDateChange = new EventEmitter<Date | null>();
  @Output()
  changeEvent: EventEmitter<Date> = new EventEmitter<Date>();
  @Input()
  public isError = false;
  @Output()
  isErrorChange = new EventEmitter<boolean>();
  @Input()
  public disabled: boolean = false;

  public error: string | null = null;
  public selectData: Array<SelectYmdStatus> = [];
  public innerErrors: string | ValidationErrorInfo = '';
  public maxDay = 31;

  // 静的文言
  @Input() public staticMessage = {
    year: 'label.year',
    month: 'label.month',
    day: 'label.day',
  };

  public refresh() {
    const yearOption: Array<{ value: number; disp: string }> = [];
    for (let i = this.dateFrom.getFullYear(); i <= this.dateTo.getFullYear(); i++) {
      yearOption.push({ value: i, disp: i.toString() });
    }
    const monthOption: Array<{ value: number; disp: string }> = [];
    for (let i = 1; i <= 12; i++) {
      monthOption.push({ value: i, disp: i.toString().padStart(2, '0') });
    }
    const dayOption: Array<{ value: number; disp: string }> = [];
    for (let i = 1; i <= 31; i++) {
      dayOption.push({ value: i, disp: i.toString().padStart(2, '0') });
    }

    const yearBlock: SelectYmdStatus = {
      id: 'date-ymd-select-year',
      num: this.initialDate.year ? this.initialDate.year : null,
      label: this.staticMessage.year,
      altLabel: this.altLabels[0],
      option: yearOption,
      dateType: 0,
    };
    const monthBlock: SelectYmdStatus = {
      id: 'date-ymd-select-month',
      num: this.initialDate.month ? this.initialDate.month : null,
      label: this.staticMessage.month,
      altLabel: this.altLabels[1],
      option: monthOption,
      dateType: 1,
    };
    const dayBlock: SelectYmdStatus = {
      id: 'date-ymd-select-day',
      num: this.initialDate.day ? this.initialDate.day : null,
      label: this.staticMessage.day,
      altLabel: this.altLabels[2],
      option: dayOption,
      dateType: 2,
    };

    if (
      this.order.indexOf('Y') === -1 ||
      this.order.indexOf('M') === -1 ||
      this.order.indexOf('D') === -1 ||
      this.order.length !== 3
    ) {
      this.order = 'DMY';
    }

    const selectData = [];
    for (let str of this.order) {
      if (str === 'Y') {
        selectData.push(yearBlock);
      } else if (str === 'M') {
        selectData.push(monthBlock);
      } else if (str === 'D') {
        selectData.push(dayBlock);
      }
    }
    this.selectData = selectData;
    this.onChangeSelect();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * FormControlの値を反映
   * @param changeValue 更新後の値
   */
  private _changeSelectDate(changeValue?: Date): void {
    if (!changeValue) return;
    const dateMappings = [
      { dateType: 0, value: changeValue.getFullYear() },
      { dateType: 1, value: changeValue.getMonth() + 1 },
      { dateType: 2, value: changeValue.getDate() },
    ];

    dateMappings.forEach((mapping) => {
      const value = this.selectData.find((date) => date.dateType === mapping.dateType);
      if (value) {
        value.num = mapping.value;
      }
    });
  }

  /**
   * onChange・onBlur共通処理
   * @param type 'onChange'または'onBlur'
   */
  private _onEvent(type?: YMDFormEvent) {
    // イベント種別に応じた処理をあらかじめ取得
    const formEvent = this._getFormEvent(type);

    if (this.selectData.length === 3) {
      const year = this.selectData.find((date) => date.dateType === 0);
      const month = this.selectData.find((date) => date.dateType === 1);
      const day = this.selectData.find((date) => date.dateType === 2);
      if (year?.num !== null && month?.num !== null && day?.num !== null) {
        if (year && month && day) {
          const _compareDate1 = new Date(year.num, month.num - 1, day.num, 23, 59, 59);
          const _compareDate2 = new Date(year.num, month.num - 1, day.num, 0, 0, 0);
          if (_compareDate1 < this.dateFrom || this.dateTo < _compareDate2) {
            this.selectedDate = null;
            // エラー
            this.error = 'E0700';
            this.innerErrors = this.getErrors();
          } else if (
            _compareDate1.getFullYear() != year.num ||
            _compareDate1.getMonth() != month.num - 1 ||
            _compareDate1.getDate() != day.num
          ) {
            //先に日にちを選択⇒その日にちが存在できない年月の場合
            this.error = null;
            this.selectedDate = null;
          } else {
            this.error = null;
            if (this.isMax) {
              this.selectedDate = new Date(year.num, month.num - 1, day.num, 23, 59, 59);
            } else {
              this.selectedDate = new Date(year.num, month.num - 1, day.num, 0, 0, 0);
            }
            if (this.changeEvent) {
              this.changeEvent.emit(this.selectedDate);
            }
          }
          this.innerErrors = this.getErrors();
          this.setMaxDate(year, month, day);
          this.selectedDateChange.emit(this.selectedDate);
          // 親Formに変更を伝える
          formEvent && formEvent(this.selectedDate);
          return;
        }
      }
      this.setMaxDate(year, month, day);
    }
    this.selectedDate = null;
    this.selectedDateChange.emit(this.selectedDate);
    this.innerErrors = this.getErrors();
    // 親Formに変更を伝える
    formEvent && formEvent(null);
  }

  /**
   * 親Formから渡されたイベントを取得
   * @param type 'onChange'または'onBlur'
   * @returns 親Formから渡されたイベント
   */
  private _getFormEvent(type?: YMDFormEvent) {
    switch (type) {
      case 'onChange':
        return this._onChange;
      case 'onBlur':
        return this._onTouched;
      default:
        return null;
    }
  }

  onChangeSelect() {
    this._onEvent('onChange');
  }

  onBlurSelect() {
    this._onEvent('onBlur');
  }

  setMaxDate(year: SelectYmdStatus | undefined, month: SelectYmdStatus | undefined, day: SelectYmdStatus | undefined) {
    if (year && month && year.num !== null && month.num !== null && year.num !== 'null' && month.num !== 'null') {
      this.maxDay = new Date(year.num, month.num, 0).getDate();
      if (day && day.num !== null && this.maxDay < day.num) {
        day.num = null; //これをしないと01表示でエラーになってしまう
      }
    } else {
      this.maxDay = 31;
    }
  }

  getErrors() {
    if (this.errorMessage !== '') {
      this.isErrorChange.emit(true);
      this.isError = true;
      return this.errorMessage;
    } else if (this.error) {
      this.isErrorChange.emit(true);
      this.isError = true;
      return this.error;
    }
    const errorsFromControl = this.getErrorsFromControl();
    if (errorsFromControl[0]) {
      this.isErrorChange.emit(true);
      this.isError = true;
      return errorsFromControl[0];
    }
    this.isError = false;
    this.isErrorChange.emit(false);
    return '';
  }

  /**
   * controlよりエラー情報取得
   */
  getErrorsFromControl(): Array<string> {
    if (!this.control || !this.control.errors || (!this.control.dirty && !this.control.touched)) {
      return [];
    }
    const { errors } = this.control;
    return Object.values(errors);
  }
}
