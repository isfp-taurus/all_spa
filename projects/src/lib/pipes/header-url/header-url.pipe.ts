import { Pipe, PipeTransform } from '@angular/core';
import { AswContextStoreService } from '../../services';

@Pipe({
  name: 'headerUrl',
})
export class HeaderUrlPipe implements PipeTransform {
  constructor(private _aswContextStoreService: AswContextStoreService) {}

  /**
   * ヘッダリンク出力
   *
   * @param {string} url リンクURL
   * @returns {string}
   */
  transform(url: string): string {
    const lang = this._aswContextStoreService.aswContextData.lang;
    return `${url}${url.indexOf('?') === -1 ? '?' : '&'}CONNECTION_KIND=ZZZ&LANG=${lang}`;
  }
}
