import { Injectable } from '@angular/core';
import { fixedArrayCache, getApplyListData, getKeyListData } from '@common/helper';
import { MListData } from '@common/interfaces';
import { AgreementMasterData } from '@common/interfaces/reservation/id-modal/agreement/agreement-master-data';
import { SupportClass } from '@lib/components/support-class';
import { AswMasterService, CommonLibService, SystemDateService } from '@lib/services';
import { AgreementLangItem } from './agreement.state';

@Injectable({
  providedIn: 'root',
})
export class AgreementService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _masterSvc: AswMasterService,
    private _sysDate: SystemDateService
  ) {
    super();
  }

  destroy(): void {}

  /**
   * キャッシュ取得
   * @param next 取得後処理
   */
  getMasterData(next: (master: AgreementMasterData) => void): void {
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    this.subscribeService(
      'AgreementMasterDataLoad',
      this._masterSvc.load(
        [
          { key: 'm_office', fileName: 'Office_All' },
          { key: 'ListData_All', fileName: 'ListData_All' },
        ],
        true
      ),
      ([office, listData]) => {
        const appListData = getApplyListData(listData, this._sysDate.getSystemDate());
        this.deleteSubscription('AgreementMasterDataLoad');
        next({
          office: fixedArrayCache(office),
          pd065: getKeyListData(appListData, 'PD_065', lang),
        });
      }
    );
  }

  /**
   * 言語選択肢取得
   * @param thirdLanguageCode 第3言語コード
   * @returns 言語選択肢
   */
  public getLangList(thirdLanguageCode?: string, pd065?: Array<MListData>): Array<AgreementLangItem> {
    const ret = [
      { code: 'ja', disp: pd065?.find((list) => list.value === 'ja')?.display_content ?? '' },
      { code: 'en', disp: pd065?.find((list) => list.value === 'en')?.display_content ?? '' },
    ];
    if (thirdLanguageCode) {
      ret.push({
        code: thirdLanguageCode,
        disp: pd065?.find((list) => list.value === thirdLanguageCode)?.display_content ?? '',
      });
    }
    return ret;
  }
}
