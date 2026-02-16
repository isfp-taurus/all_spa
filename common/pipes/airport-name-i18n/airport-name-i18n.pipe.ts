import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { MasterStoreKey } from '@conf/index';
import { CommonLibService } from '@lib/services';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

/**
 * 空港コードから空港名に変換するPIPE
 *
 * ASWDB(空港テーブル)から取得できなかった場合の指定があれば、オプショナルに指定できます。
 */
@Pipe({
  name: 'airportNameI18n',
  pure: false,
})
export class AirportNameI18nPipe implements PipeTransform, OnDestroy {
  private _html!: string;
  private _subscriptions: Subscription = new Subscription();

  constructor(private _changeDetectorRef: ChangeDetectorRef, private _common: CommonLibService) {}

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  /**
   * 空港コードから空港名に変換するPIPE
   *
   * 空港コードが指定されていない場合 surrogateNameを返しますが、surrogateNameも
   * 指定省略された場合は空文字列を返します。
   * @param {string} code 空港コード
   * @param {string} surrogateName ASWDBから名称が取得できない場合に表示するべき名称(省略可)
   * @returns {string} 空港名(多言語対応を含む)
   */
  transform(code: string | undefined, surrogateName: string = ''): string {
    if (!code) {
      return surrogateName;
    }
    this._html = '';
    this._subscriptions.add(
      this._common.aswMasterService
        .getAswMasterByKey$(MasterStoreKey.M_AIRPORT_I18N)
        .pipe(take(1))
        .subscribe((airportNameI18n: Array<{ key: string; value: string }>) => {
          // キャッシュのプレフィックスを付与しておく
          const prefix_key = 'm_airport_i18n_' + code;

          // 該当データが見つからない場合はデフォルト値とする
          // 該当データが見つかった場合は空港名を設定
          this._html = airportNameI18n.find((item) => item.key === prefix_key)?.value || surrogateName;
          this._changeDetectorRef.markForCheck();
        })
    );
    return this._html;
  }
}
