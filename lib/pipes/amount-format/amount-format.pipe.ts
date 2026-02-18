import { CurrencyPipe, registerLocaleData } from '@angular/common';
import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { MasterStoreKey } from '@conf/asw-master.config';
import { CommonLibService } from '../../services';
import { DeviceType, MLangCodeConvert } from '../../interfaces';
import { isSP, isTB } from '../../helpers';
import { Subscription } from 'rxjs/internal/Subscription';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { take } from 'rxjs/operators';
import localeEn from '@angular/common/locales/en';
import localeCn from '@angular/common/locales/zh';
import localeTw from '@angular/common/locales/zh-Hant';
import localeHk from '@angular/common/locales/zh-Hant-HK';
import localeKo from '@angular/common/locales/ko';
import localeFr from '@angular/common/locales/fr';
import localeDe from '@angular/common/locales/de';
import localeTh from '@angular/common/locales/th';
import localeVn from '@angular/common/locales/vi';
import localeId from '@angular/common/locales/id';
import localeEs from '@angular/common/locales/es';
import localeRu from '@angular/common/locales/ru';
import localeIt from '@angular/common/locales/it';
import localeSv from '@angular/common/locales/sv';
import localeTr from '@angular/common/locales/tr';
import localeJa from '@angular/common/locales/ja';

const locales = [
  localeEn,
  localeCn,
  localeTw,
  localeHk,
  localeKo,
  localeFr,
  localeDe,
  localeTh,
  localeVn,
  localeId,
  localeEs,
  localeRu,
  localeIt,
  localeSv,
  localeTr,
  localeJa,
];

locales.forEach((locale) => registerLocaleData(locale));

/** 整数で表示する通貨コード */
const INT_CURRENCY_CODE = {
  MIL: 'MIL',
  UPP: 'UPP',
  CNY: 'CNY',
  HKD: 'HKD',
  IDR: 'IDR',
  INR: 'INR',
  MXN: 'MXN',
  MYR: 'MYR',
  RUB: 'RUB',
  SEK: 'SEK',
  THB: 'THB',
  TWD: 'TWD',
  JPY: 'JPY',
  KRW: 'KRW',
  VND: 'VND',
};

@Pipe({
  name: 'amountFormat',
  pure: false,
})
export class AmountFormatPipe implements PipeTransform, OnDestroy {
  private _html!: string;
  private _subscriptions: Subscription = new Subscription();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _common: CommonLibService,
    private _currencyPipe: CurrencyPipe
  ) {}

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  /**
   * 金額フォーマット
   *
   * @param {number} value 金額
   * @param {string} key 装飾フォーマットキー
   * @param {string} currencyCode 通貨コード
   * @returns {string}
   */
  transform(value: number, key?: string, currencyCode?: string): string {
    if (key === undefined) {
      key = 'default';
    }
    if (currencyCode === undefined) {
      currencyCode = this._common.aswContextStoreService.aswContextData.currencyCode;
    }
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    const deviceType = this.getDeviceType();
    this._html = '';
    this._subscriptions.add(
      forkJoin([
        this._common.aswMasterService.getAswMasterByKey$(MasterStoreKey.CURRENCY_FORMAT_ALL).pipe(take(1)),
        this._common.aswMasterService.getAswMasterByKey$(MasterStoreKey.PROPERTY).pipe(take(1)),
        this._common.aswMasterService.getAswMasterByKey$(MasterStoreKey.LANGCODECONVERT_ALL).pipe(take(1)),
      ]).subscribe((state) => {
        // フォーマット文字列を取得
        const format = state[0].filter(
          (cf: any) =>
            cf.format_name === key &&
            cf.lang === lang &&
            cf.currency_code === currencyCode &&
            cf.device_type === deviceType
        )[0].format;
        // ロケールを取得
        const locale = state[2].find((el: MLangCodeConvert) => el.lang === lang)?.locale || 'en-US';
        // 金額を通貨コードに応じて変換(INT_CURRENCY_CODEに含まれる通貨は整数で表示)
        const amount =
          currencyCode && currencyCode in INT_CURRENCY_CODE
            ? this._currencyPipe.transform(value, currencyCode, '', '1.0-0', locale)
            : this._currencyPipe.transform(value, currencyCode, '', '', locale);
        // 通貨文字列を取得
        const currency = state[1][`format_${lang}`][`currencyUnit.${currencyCode}`][0].value;
        this._html = format.replace('{0}', amount!).replace('{1}', currency);
        this._changeDetectorRef.markForCheck();
      })
    );
    if (this._html === '') {
      this._html = currencyCode + value;
    }
    return this._html;
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
