import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { AswMasterService } from '@lib/services';

/**
 * DCS移行開始日前後判定判定サービス
 */
@Injectable({
  providedIn: 'root',
})
export class DcsDateService extends SupportClass {
  constructor(private _aswMasterSvc: AswMasterService) {
    super();
  }

  destroy(): void {}

  /**
   * DCS移行開始日前後判定処理
   */
  isAfterDcs(departureDateStr: string): boolean {
    const dcsDateStr = this._aswMasterSvc.getMPropertyByKey('migration', 'uiuxs2.transitionDate.domesticDcs');
    const dcsDate = new Date(dcsDateStr);
    const depDate = this.convertToDate(departureDateStr);
    // NaN判定
    const isComparable = [dcsDate, depDate].every((date) => !Number.isNaN(date.getTime()));
    return isComparable && dcsDate <= depDate;
  }

  /**
   * Date型への変換
   * @param dateString 日付書式文字列
   * @returns Date
   */
  private convertToDate(dateString: string): Date {
    const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (dateOnlyPattern.test(dateString)) {
      return new Date(`${dateString}T00:00:00`);
    } else {
      return new Date(dateString);
    }
  }
}
