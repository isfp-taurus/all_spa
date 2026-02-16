import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { CommonLibService, SystemDateService } from '@lib/services';

/**
 * 操作中オフィスの現在日時string取得サービス
 */
@Injectable({
  providedIn: 'root',
})
export class LocalDateService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _datePipe: DatePipe,
    private _systemDateService: SystemDateService
  ) {
    super();
  }

  /**
   * 操作オフィスの現在日時取得処理
   * @returns 操作オフィスの現在日時のDateオブジェクト
   */
  getCurrentDate(): Date {
    const pointOfSaleId = this._common.aswContextStoreService.aswContextData.pointOfSaleId;
    return this._systemDateService.getAirportLocalDate(pointOfSaleId);
  }

  /**
   * 操作オフィスの現在日時string取得処理
   * @param format DatePipeの同名パラメータ。未指定の場合'yyyy-MM-ddTHH:mm:ss'
   * @returns 操作オフィスの現在日時のstring
   */
  getCurrentDateStr(format?: string): string {
    const currentDate = this.getCurrentDate();
    const currentDateStr = this._datePipe.transform(currentDate, format || 'yyyy-MM-ddTHH:mm:ss');
    return currentDateStr ?? '';
  }

  destroy(): void {}
}
