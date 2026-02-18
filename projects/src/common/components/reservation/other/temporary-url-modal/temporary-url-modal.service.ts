import { Injectable } from '@angular/core';
import { fixedArrayCache } from '@common/helper';
import { OfficeAllData, ANA_BIZ_OFFICE_CODE, JAPANESE_REVENUE_OFFICE_CODE } from '@common/interfaces';
import { SupportClass } from '@lib/components/support-class';
import { AswMasterService, CommonLibService } from '@lib/services';
import { getOfficeAllMasterKey } from './temporary-url-modal.state';

/**
 * 一時URL表示モーダル用サービス
 */
@Injectable({
  providedIn: 'root',
})
export class TemporaryUrlModalService extends SupportClass {
  constructor(private _common: CommonLibService, private _aswMasterService: AswMasterService) {
    super();
  }

  /**
   * クエリパラメータ付加処理
   * ※一時URLは他ユーザと共有可能なため、付加すべきパラメータが通常のリンクと異なる
   * @param url クエリパラメータを付加するURL
   * @param nextEvent
   */
  addQueryParamsNext(url: string, nextEvent: (urlWithParams: string) => void): void {
    // キャッシュから暗号化されたCONNECTION_KIND、LANGを取得してURLを構成
    const newUrl = new URL(url);
    newUrl.searchParams.set('CONNECTION_KIND', this._getEncryptedConnectionKindValue());
    newUrl.searchParams.set(
      'LANG',
      this._getEncryptedLangValue(this._common.aswContextStoreService.aswContextData.lang)
    );

    nextEvent(newUrl.toString());
  }

  /**
   * プロパティから暗号化済みのCONNECTION_KINDを取得
   * @returns 暗号化済みのCONNECTION_KIND
   */
  private _getEncryptedConnectionKindValue(): string {
    return this._aswMasterService.getMPropertyByKey('plan', 'encryptedConnectionKind.top');
  }

  /**
   * プロパティから暗号化済みのLANGを取得
   * @param lang ユーザー共通情報 操作言語
   * @returns 暗号化済みのLANG
   */
  private _getEncryptedLangValue(lang: string): string {
    if (lang === 'ja') {
      return this._aswMasterService.getMPropertyByKey('plan', 'encryptedLang.ja');
    } else {
      return this._aswMasterService.getMPropertyByKey('plan', 'encryptedLang.en');
    }
  }

  destroy(): void {}
}
