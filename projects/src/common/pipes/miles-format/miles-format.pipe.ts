import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { MasterStoreKey } from '@conf/asw-master.config';
import { CommonLibService } from '@lib/services';
import { Subscription, take } from 'rxjs';

@Pipe({
  name: 'milesFormat',
})
export class MilesFormatPipe implements PipeTransform {
  private _html!: string;
  private _subscriptions: Subscription = new Subscription();
  constructor(
    private _decimalPipe: DecimalPipe,
    private _changeDetectorRef: ChangeDetectorRef,
    private _common: CommonLibService
  ) {}

  transform(value: number, key?: string): string {
    if (isNaN(value)) return '';
    if (key === undefined) {
      key = 'default';
    }
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    this._html = '';
    this._subscriptions.add(
      this._common.aswMasterService
        .getAswMasterByKey$(MasterStoreKey.PROPERTY)
        .pipe(take(1))
        .subscribe((state) => {
          const format = state[`format_${lang}`]?.[`${key}`]?.[0]?.value;
          const amount = this._decimalPipe.transform(value, '');
          this._html = `${amount} ${format}`;
          this._changeDetectorRef.markForCheck();
        })
    );
    return this._html;
  }
}
