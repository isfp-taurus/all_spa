import { Pipe, PipeTransform } from '@angular/core';
import { SessionStorageName } from '../../interfaces';
import { CommonLibService } from '../../services';
import { MasterStoreKey } from '@conf/asw-master.config';
import { MOffice } from '../../interfaces/m_office';
import { take } from 'rxjs';

@Pipe({
  name: 'linkUrl',
})
export class LinkUrlPipe implements PipeTransform {
  constructor(private _common: CommonLibService) {}

  /**
   * 現行ASWへのリンク出力
   *
   * @param {string} url リンクURL
   * @returns {string}
   */
  transform(url: string): string {
    const connectionKind = this.getConnectionKind();
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    const identificationId = this._common.loadSessionStorage(SessionStorageName.IDENTIFICATION_ID);
    return `${url}${
      url.indexOf('?') === -1 ? '?' : '&'
    }CONNECTION_KIND=${connectionKind}&LANG=${lang}&identificationId=${identificationId}`;
  }

  /**
   * ASW TOP識別 : CONNECTION_KIND
   * @returns
   */
  private getConnectionKind(): string {
    // ユーザ共通.操作オフィスコード=オフィスコードとなるASWDB(マスタ)のオフィス.ASWTOP識別
    let result = '';
    this._common.aswMasterService
      .getAswMasterByKey$(MasterStoreKey.OFFICE_ALL)
      .pipe(take(1))
      .subscribe((_officeAll) => {
        _officeAll.forEach((officeAll: MOffice) => {
          if (officeAll.office_code === this._common.aswContextStoreService.aswContextData.pointOfSaleId) {
            result = officeAll.connection_kind ?? '';
          }
        });
      });
    return result;
  }
}
