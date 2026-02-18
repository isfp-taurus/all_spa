import { DatePipe, registerLocaleData } from '@angular/common';
import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform, Renderer2 } from '@angular/core';
import { CommonLibService } from '../../services';
import { MasterStoreKey } from '@conf/asw-master.config';
import { Subscription } from 'rxjs/internal/Subscription';
import { take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { DeviceType } from '@lib/interfaces';
import { isSP, isTB, convertStringToDate } from '@lib/helpers';

@Pipe({
  name: 'dateFormat',
  pure: false,
})
export class DateFormatPipe implements PipeTransform, OnDestroy {
  private _html!: string;
  private _subscriptions: Subscription = new Subscription();
  private _$template!: HTMLElement;
  private _monthKeys: string[] = [
    'm_list_data_PD_017_1',
    'm_list_data_PD_017_2',
    'm_list_data_PD_017_3',
    'm_list_data_PD_017_4',
    'm_list_data_PD_017_5',
    'm_list_data_PD_017_6',
    'm_list_data_PD_017_7',
    'm_list_data_PD_017_8',
    'm_list_data_PD_017_9',
    'm_list_data_PD_017_10',
    'm_list_data_PD_017_11',
    'm_list_data_PD_017_12',
    'm_list_data_PD_017_1_FULL',
    'm_list_data_PD_017_2_FULL',
    'm_list_data_PD_017_3_FULL',
    'm_list_data_PD_017_4_FULL',
    'm_list_data_PD_017_5_FULL',
    'm_list_data_PD_017_6_FULL',
    'm_list_data_PD_017_7_FULL',
    'm_list_data_PD_017_8_FULL',
    'm_list_data_PD_017_9_FULL',
    'm_list_data_PD_017_10_FULL',
    'm_list_data_PD_017_11_FULL',
    'm_list_data_PD_017_12_FULL',
  ];
  private _dayOfWeekKeys: string[] = [
    'm_list_data_PD_016_SUNDAY',
    'm_list_data_PD_016_MONDAY',
    'm_list_data_PD_016_TUESDAY',
    'm_list_data_PD_016_WEDNESDAY',
    'm_list_data_PD_016_THURSDAY',
    'm_list_data_PD_016_FRIDAY',
    'm_list_data_PD_016_SATURDAY',
  ];
  private _defaultDate = '1970/01/02'; // 深夜判定の際に-1日するため、最古日+1日とする。
  private _months!: Record<string, string>;
  private _dayOfWeeks!: Record<string, string>;
  private _dateString!: string;
  private _date!: Date;
  private _lateNightFlg!: boolean;
  private _lateNightNotationFlg!: boolean;
  private _isMaskedDate!: boolean;
  private _formatType = {
    labelSliderInterval: 'label.slider.interval',
    labelSliderTime: 'label.slider.time',
    flightTotalTime: 'flightTotalTime',
    flightTime: 'flightTime',
  };

  constructor(
    private _datePipe: DatePipe,
    private _changeDetectorRef: ChangeDetectorRef,
    private _common: CommonLibService,
    private _renderer: Renderer2,
    private _translateSvc: TranslateService
  ) {}

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  /**
   * 日付フォーマット
   *
   * @param {string} value 日時
   * @param {string} key 装飾フォーマットキー
   * @param {boolean} lateNightNotationFlg 深夜便表記有無
   * @returns {string}
   */
  transform(value: string, key?: string, lateNightNotationFlg: boolean = false): string {
    // isMaskedDate初期化
    this._isMaskedDate = false;
    // 時間または分が一桁の場合、0埋め
    const editDate = this._zeroPadding(value);
    if (!this._isDateStringValid(editDate, key)) return '';
    this._dateString = this._addDatePart(editDate);
    if (!this._isMaskedDate) {
      this._date = convertStringToDate(this._dateString);
    }
    this._lateNightNotationFlg = lateNightNotationFlg;
    if (key === undefined) {
      key = 'default';
    }
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    const deviceType = this.getDeviceType();
    // 月文言を翻訳
    this._months = this._translateSvc.instant(this._monthKeys);
    // 曜日文言を翻訳
    this._subscriptions.add(
      this._common.aswMasterService
        .getAswMasterByKey$(MasterStoreKey.LISTDATA_PD_016_WEEK_FORMAT)
        .pipe(take(1))
        .subscribe((state: any) => {
          if (state && 14 <= state?.length) {
            this._dayOfWeeks = state.reduce((acc: { [x: string]: any }, cur: { key: string | number; value: any }) => {
              acc[cur.key] = cur.value;
              return acc;
            }, {});
          }
        })
    );
    this._html = '';
    this._subscriptions.add(
      this._common.aswMasterService
        .getAswMasterByKey$(MasterStoreKey.PROPERTY)
        .pipe(take(1))
        .subscribe((state: any) => {
          const format =
            state[`format_${lang}`]?.[`${key}.${deviceType}`]?.[0]?.value ??
            state[`format_${lang}`]?.[`${key}`]?.[0]?.value ??
            '';
          if (!this._isMaskedDate) {
            // 深夜便表記有かつ深夜判定の場合、日付を-1日する
            this._subtractOneDayInCaseOfLateNight(state['servicing']?.['lateNight.to.HHmm']?.[0]?.value ?? '');
          }
          // 置換処理
          this._$template = this._renderer.createElement('ng-template');
          this._renderer.setProperty(this._$template, 'innerHTML', format);
          this._replaceDatesCotainedInElements(this._$template.getRootNode(), key);
          this._html = this._$template.innerHTML;
          this._changeDetectorRef.markForCheck();
        })
    );
    return this._html;
  }

  /**
   * 曜日文言キー取得
   *
   * @param {number} dayOfWeekNum 曜日番号
   * @returns {string}
   */
  private _getDayOfWeekKey(dayOfWeekNum: number): string {
    if (dayOfWeekNum < 0 || 7 <= dayOfWeekNum) return '';
    return this._dayOfWeekKeys[dayOfWeekNum];
  }

  /**
   * 月文言キー取得
   *
   * @param {number} monthNum 月番号
   * @returns {string}
   */
  private _getMonthKey(monthNum: number): string {
    if (monthNum < 0 || 12 <= monthNum) return '';
    return this._monthKeys[monthNum];
  }

  /**
   * 深夜便表記有かつ深夜判定の場合、日付を-1日する
   *
   * @param {string} lateNightTimeString 深夜判定文字列(hhmmss)
   */
  private _subtractOneDayInCaseOfLateNight(lateNightTimeString: string): void {
    // 深夜判定
    this._lateNightFlg = this._isLateNight(this._date, lateNightTimeString);
    // 深夜便表記有かつ深夜判定の場合、日付を-1日する。
    if (this._lateNightNotationFlg && this._lateNightFlg) {
      this._date.setDate(this._date.getDate() - 1);
      this._dateString = this._convertDateToString(this._date);
    }
  }

  /**
   * Node内の日付文字列置換
   *
   * @param {Node} node
   * @param {string} key  装飾フォーマットキー
   * @returns {void}
   */
  private _replaceDatesCotainedInElements(node: Node, key?: string): void {
    if (!node.hasChildNodes()) {
      if (!this._isMaskedDate) {
        node.textContent = this._replaceDate(node.textContent ?? '', key);
      } else {
        node.textContent = this._replaceDateWithMaskedDate(node.textContent ?? '');
      }
      return;
    }
    node.childNodes.forEach((child) => {
      this._replaceDatesCotainedInElements(child, key);
    });
  }

  /**
   * 日付文字列置換
   *
   * @param {string} format 変換対象文字列
   * @param {string} key  装飾フォーマットキー
   * @returns {string}
   */
  private _replaceDate(format: string, key?: string): string {
    const dayOfWeekKey = this._getDayOfWeekKey(this._date.getDay());
    const monthKey = this._getMonthKey(this._date.getMonth());
    const _keys = ['a.m.', 'p.m.', 'a', 'EEEE', 'E', 'MMMM', 'MMM'];
    const _temps = ['#0', '#1', '#2', '#3', '#4', '#5', '#6']; // 標準のフォーマットでは置換されない文字
    const _vals = [
      this._checkAMPM(),
      this._checkAMPM(),
      this._checkAMPM(),
      this._dayOfWeeks[dayOfWeekKey + '_FULL'],
      this._dayOfWeeks[dayOfWeekKey],
      this._months[monthKey + '_FULL'],
      this._months[monthKey],
    ];

    // 深夜便表記有かつ深夜判定の場合、時間のみ別途置換する。
    if (this._lateNightFlg && this._lateNightNotationFlg) {
      const hour = (this._date.getHours() + 24).toString();
      format = format.replace('HH', hour).replace('H', hour);
    }

    if (
      key === this._formatType.labelSliderInterval ||
      key === this._formatType.labelSliderTime ||
      key?.includes(this._formatType.flightTotalTime) ||
      key?.includes(this._formatType.flightTime)
    ) {
      format = this._replaceTime(format);
      format = format.replace(/'/g, '');
    } else {
      // シングルクォーテーションの処理
      const _firstSingleQuatationIndex = format.indexOf("'");
      let _singleQuatationBundleList: string[] = [];
      if (_firstSingleQuatationIndex >= 0) {
        // シングルクォーテーションを含む場合
        const _singleQuatationSplitArray = format.split("'");
        _singleQuatationSplitArray.forEach((word, i) => {
          if (i % 2 === 1) {
            // シングルクォーテーションに囲まれる文字列を格納
            // (yyyy'年'mm'月'dd'日' の場合、[yyyy, 年, mm, 月, dd, 日]となるので[年, 月, 日]を抽出する)
            _singleQuatationBundleList.push(word);
          }
        });
      }

      // シングルクォーテーションに囲まれた文字列を退避させる（$0 $1 ・・・）
      _singleQuatationBundleList.forEach((word, i) => (format = format.replace(word, '$' + i)));
      // 標準のdatePipeで置換させたくないフォーマットを一度退避させる
      _keys.forEach((_key, i) => (format = format.replace(_key, _temps[i])));
      // 標準のdatePipeで置換
      format = this._datePipe.transform(this._dateString, format) ?? '';
      // 退避させた文字を置換
      _temps.forEach((_key, i) => (format = format.replace(_key, _vals[i])));
      // シングルクォーテーションに囲まれた文字列を戻す
      _singleQuatationBundleList.forEach((word, i) => (format = format.replace('$' + i, word)));
    }

    return format;
  }

  /**
   * 時間文字列置換
   *
   * @param {string} format 変換対象文字列
   * @returns {string}
   */
  private _replaceTime(format: string): string {
    // HH:mm
    const _regexPattern = new RegExp(/(\d{2}):(\d{2})/);
    const _match = this._dateString.match(_regexPattern);
    if (_match) {
      // "min"の"m"が置換されるので一度退避
      format = format.replace('min', 'TEMP');
      // 時部分のフォーマット変換
      format = this.formatTime(format, _match[1], 'H');
      // 分部分のフォーマット変換
      format = this.formatTime(format, _match[2], 'm');
      // 退避した文字列を戻す
      format = format.replace('TEMP', 'min');
    }
    return format;
  }

  /**
   * 時分のフォーマット変換を行う。
   * @param time フォーマット変換する時分秒
   * @param replace 置換する値
   * @param target 時間：'H' / 分：'m'
   * @returns フォーマット変換後の文字列
   */
  private formatTime(time: string, replace: string, target: string): string {
    let value = '';
    if (time.includes(target + target)) {
      // フォーマットが2桁の場合
      value = time.replace(target + target, replace);
    } else {
      // フォーマットが1桁の場合
      if (replace.startsWith('0')) {
        // 01など0で始まる場合は先頭の0を除去
        value = time.replace(target, replace.charAt(1));
      } else {
        value = time.replace(target, replace);
      }
    }
    return value;
  }

  /**
   * マスキング文字列を用いた日付文字列置換
   *
   * @param {string} format 変換対象文字列
   * @returns {string}
   */
  private _replaceDateWithMaskedDate(format: string): string {
    const [year, month, day] = this._dateString.includes('/')
      ? this._dateString.split('/')
      : this._dateString.split('-');
    return format
      .replace('yyyy', year ?? '')
      .replace('MM', month ?? '')
      .replace('M', month ?? '')
      .replace('dd', day ?? '')
      .replace('d', day ?? '');
  }

  /**
   * am/pmのチェック \
   * 00:00-11:59はam (00:00 = 12:00am) \
   * 12:00-23:59はpm (12:00 = 12:00pm)
   * @returns {string} "a.m."または"p.m."
   */
  private _checkAMPM(): string {
    const hour = this._date.getHours();
    if (hour < 12) {
      return 'a.m.';
    } else {
      return 'p.m.';
    }
  }

  /**
   * 日付文字列有効チェック
   *
   * @param {string} dateString 日付文字列
   * @param {string} key  装飾フォーマットキー
   * @returns {boolean}
   */
  private _isDateStringValid(dateString: string, key?: string): boolean {
    //キーが_labelSliderIntervalまたは_labelSliderTimeまたは_defaultFlightTotalTimeまたは_defaultFlightTimeの場合99:59まで許容する
    if (
      key === this._formatType.labelSliderInterval ||
      key === this._formatType.labelSliderTime ||
      key?.includes(this._formatType.flightTotalTime) ||
      key?.includes(this._formatType.flightTime)
    ) {
      // HH:mm
      if (new RegExp('^([0-9][0-9]):[0-5][0-9]$').test(dateString)) return true;

      // HH:mm:ss
      if (new RegExp('^([0-9][0-9]):[0-5][0-9]:[0-5][0-9]$').test(dateString)) return true;

      return false;
    }
    // HH:mm
    if (new RegExp('^([01][0-9]|2[0-3]):[0-5][0-9]$').test(dateString)) return true;
    // HH:mm:ss
    if (new RegExp('^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$').test(dateString)) return true;
    // yyyy/MM/dd
    if (new RegExp('^[0-9]{4}/(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])$').test(dateString)) return true;
    // yyyy-MM-dd
    if (new RegExp('^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$').test(dateString)) return true;
    // yyyy/MM/dd HH:mm
    if (
      new RegExp('^[0-9]{4}/(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01]) ([01][0-9]|2[0-3]):[0-5][0-9]$').test(dateString)
    )
      return true;
    // yyyy/MM/dd HH:mm:ss
    if (
      new RegExp('^[0-9]{4}/(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01]) ([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$').test(
        dateString
      )
    )
      return true;
    // yyyy-MM-ddTHH:mm:ss
    if (
      new RegExp('^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$').test(
        dateString
      )
    )
      return true;
    // ****/**/**(マスキング済 年月日)
    if (new RegExp('^[*]{4}/[*]{2}/[*]{2}$').test(dateString)) {
      this._isMaskedDate = true;
      return true;
    }
    // ****-**-**(マスキング済 年月日)
    if (new RegExp('^[*]{4}-[*]{2}-[*]{2}$').test(dateString)) {
      this._isMaskedDate = true;
      return true;
    }
    return false;
  }

  /**
   * 日付(yyyy/MM/dd)追加
   *
   * @param {string} dateString 日付文字列
   * @returns {string}
   */
  private _addDatePart(dateString: string): string {
    // HH:mm
    if (new RegExp('^([01][0-9]|2[0-3]):[0-5][0-9]$').test(dateString)) return `${this._defaultDate} ${dateString}`;
    // HH:mm:ss
    if (new RegExp('^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$').test(dateString))
      return `${this._defaultDate} ${dateString}`;
    return dateString;
  }

  /**
   * 深夜判定
   *
   * @param {Date} date 日付
   * @param {string} lateNightTimeString 最遅深夜時間
   * @returns {boolean}
   */
  private _isLateNight(date: Date, lateNightTimeString: string): boolean {
    // HHmm
    if (!new RegExp('^([01][0-9]|2[0-3])[0-5][0-9]$').test(lateNightTimeString)) return false;
    const timeString = `0${date.getHours()}`.slice(-2) + `0${date.getMinutes()}`.slice(-2);
    return timeString <= lateNightTimeString;
  }

  /**
   * 日付→文字列変換
   *
   * @param {Date} date 日付
   * @returns {string}
   */
  private _convertDateToString(date: Date): string {
    const year = date.getFullYear().toString();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    const hour = `0${date.getHours()}`.slice(-2);
    const min = `0${date.getMinutes()}`.slice(-2);
    return `${year}/${month}/${day} ${hour}:${min}`;
  }

  /**
   * 時間または分が一桁の場合0埋め
   *
   * @param {string} value 日時
   * @returns {string} 0埋めした日付
   */
  private _zeroPadding(value: string): string {
    const condition = value.indexOf('/') > -1 || value.indexOf('-') > -1;
    // 「/」か「-」が存在する場合最初の11桁を削除
    const editValue = condition ? value.substring(11) : value;
    const yearValue = condition ? value.substring(0, 11) : '';
    const dateSplit = editValue.split(':');
    if (dateSplit.length < 2) return value;

    const hour = dateSplit[0].padStart(2, '0');
    const minutes = dateSplit[1].padStart(2, '0');

    let second = '';
    if (dateSplit.length > 2) {
      second = ':' + dateSplit[2];
    }

    return `${yearValue}${hour}:${minutes}${second}`;
  }

  /** 現在の画面サイズから端末種別を取得する */
  private getDeviceType(): DeviceType {
    if (isSP()) {
      return DeviceType.SMART_PHONE;
    } else if (isTB()) {
      return DeviceType.TABLET;
    } else {
      return DeviceType.PC;
    }
  }
}
