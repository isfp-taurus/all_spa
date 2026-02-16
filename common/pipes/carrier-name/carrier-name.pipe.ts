import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { MasterStoreKey } from '@conf/index';
import { CommonLibService } from '@lib/services';
import { Subscription, forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';

/**
 * キャリアコードからキャリア名に変換するPIPE
 *
 * ASWDB(キャリアテーブル)から取得できなかった場合の指定があれば、オプショナルに指定できます。
 */
@Pipe({
  name: 'carrierName',
  pure: false,
})
export class CarrierNamePipe implements PipeTransform, OnDestroy {
  private _html!: string;
  private _subscriptions: Subscription = new Subscription();

  constructor(private _changeDetectorRef: ChangeDetectorRef, private _common: CommonLibService) {}

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  /**
   * キャリアコードからキャリア名に変換するPIPE
   *
   * キャリアコードが指定されていない場合 surrogateNameを返しますが、surrogateNameも
   * 指定省略された場合は空文字列を返します。
   * @param {string} code キャリアコード
   * @param {string} surrogateName ASWDBから名称が取得できない場合に表示するべき名称(省略可)
   * @returns {string} キャリア名(多言語対応を含む)
   */
  transform(code: string | undefined, surrogateName: string = ''): string {
    if (!code) {
      return surrogateName;
    }
    this._html = '';
    this._subscriptions.add(
      forkJoin([
        this._common.aswMasterService.getAswMasterByKey$(MasterStoreKey.M_AIRLINE_I18N).pipe(take(1)),
        this._common.aswMasterService.getAswMasterByKey$(MasterStoreKey.AIRLINE_I18NJOIN_BYAIRLINECODE).pipe(take(1)),
      ]).subscribe((state) => {
        // URL
        const tmpCarrierUrl = state[1][code];
        let carrierUrl = undefined;

        // キャリア名
        let airlineI18n: Array<{ airline_code: string; airline_name: string }> = state[0];
        let carrierName = airlineI18n.find((item) => item.airline_code === code)?.airline_name;

        if (!!carrierName) {
          // URLが見つかった場合は設定
          if (tmpCarrierUrl?.length && tmpCarrierUrl[0].operating_airline_url) {
            carrierUrl = tmpCarrierUrl[0].operating_airline_url;
          }
        } else {
          // 該当データが見つからない場合
          if (!!surrogateName) {
            carrierName = surrogateName;
          } else {
            carrierName = code;
          }
        }

        this._html = this.getCarrierTag(carrierName, carrierUrl);

        this._changeDetectorRef.markForCheck();
      })
    );
    return this._html;
  }

  getCarrierTag(carrierName: string, carrierUrl?: string): string {
    let tag: string = '';
    if (!!carrierUrl) {
      tag += '<a class="c-asam-icon02__link" href="' + carrierUrl + '" target="_blank">';
    }
    tag += carrierName;
    return tag;
  }
}
