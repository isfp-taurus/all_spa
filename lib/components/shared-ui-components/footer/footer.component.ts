/**
 * フッターエリア
 */
import { ChangeDetectionStrategy, Component, ChangeDetectorRef } from '@angular/core';
import { AswContextType, MOffice } from '../../../interfaces';
import { SupportComponent } from '../../../components/support-class';
import { CommonLibService, HeaderService } from '../../../services';
import { distinctUntilKeyChanged } from 'rxjs';

/**
 * フッターエリア
 */
@Component({
  selector: 'asw-footer',
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['footer.scss'],
})
export class FooterComponent extends SupportComponent {
  constructor(
    protected _common: CommonLibService,
    public _headerService: HeaderService,
    private _changeDetector: ChangeDetectorRef
  ) {
    super(_common);
  }

  /** クッキーポリシーリンク表示有無 */
  public isDisplayCookieLink = false;

  /** 企業情報リンク表示有無 */
  public isDisplayImprintLink = false;

  init() {
    this._getCacheMaster((data) => {
      this._addContextSubscription(data);
    });
  }

  /**
   * Office_All のキャッシュされたマスターデータを取得
   * @param callback - 読み込まれたマスターデータを受け取るコールバック関数
   */
  private _getCacheMaster(callback: (master: MOffice[]) => void): void {
    this.subscribeService(
      'getAllOffice',
      this._common.aswMasterService.load([{ key: 'Office_All', fileName: 'Office_All' }], true),
      ([value]) => {
        this.deleteSubscription('getAllOffice');
        callback(value);
      }
    );
  }

  /**
   * リンク表示非表示判定
   * @param officeAll 全オフィスリスト
   */
  private _addContextSubscription(officeAll: MOffice[]) {
    this.subscribeService(
      'footerAswContext',
      this._common.aswContextStoreService
        .getAswContext$()
        .pipe(distinctUntilKeyChanged(AswContextType.POINT_OF_SALE_ID)),
      (data) => {
        const pointOfSaleId = data.pointOfSaleId;
        const currentOffice = officeAll.find((office) => office.office_code === pointOfSaleId);
        // クッキーポリシーリンク表示非表示判定
        this.isDisplayCookieLink = !!currentOffice?.available_ensighten_tag;
        // 企業情報リンク表示非表示判定
        this.isDisplayImprintLink = currentOffice?.pos_country_code === 'DE';
        this._changeDetector.markForCheck();
      }
    );
  }

  destroy() {}
  reload() {}

  /**
   * 上へ戻るボタン押下
   */
  onClickPageTop() {
    const tagStr =
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, [tabindex="0"], [contenteditable]';
    const elements = document.querySelectorAll(tagStr) as NodeListOf<HTMLElement>;
    for (let el of Array.from(elements)) {
      if (el.offsetWidth > 0 && el.offsetHeight > 0 && window.getComputedStyle(el).visibility !== 'hidden') {
        el.focus();
        break;
      }
    }
    elements[0].focus();
    window.scrollTo(0, 0);
  }
}
