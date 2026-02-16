import { ChangeDetectionStrategy, Component, Inject, Renderer2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SupportPageComponent } from '@lib/components/support-class/support-page-component';
import { AlertMessageStoreService, PageInitService } from '@lib/services';
import { CommonLibService } from '@lib/services/common-lib/common-lib.service';
import { DOCUMENT } from '@angular/common';
import { StaticMsgPipe } from '@lib/pipes';

@Component({
  selector: 'asw-search-flight-cont',
  templateUrl: './search-flight-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFlightContComponent extends SupportPageComponent {
  //プロパティ定義
  /** ページID */
  public pageId = 'P010';
  /** 機能ID */
  public functionId = 'R01';

  // 初期化処理自動完了をオフにする
  override autoInitEnd = false;

  /** コンストラクタ */
  constructor(
    protected _common: CommonLibService,
    private _pageInitService: PageInitService,
    protected _alertMessageStoreService: AlertMessageStoreService,
    private _titleService: Title,
    @Inject(DOCUMENT) private _document: Document,
    private _renderer: Renderer2,
    private _staticMsgPipe: StaticMsgPipe
  ) {
    super(_common, _pageInitService);
    // 画面情報への機能ID、ページID設定
    this._common.aswCommonStoreService.updateAswCommon({
      functionId: this.functionId,
      pageId: this.pageId,
      subFunctionId: '',
      subPageId: '',
    });
    this.forkJoinService(
      'SearchFlightContComponentTitleGet',
      [this._staticMsgPipe.get('label.searchFlight.title'), this._staticMsgPipe.get('label.aswPageTitle')],
      ([str1, str2]) => {
        this._titleService.setTitle(str1 + str2);
      }
    );
  }

  /** INTERNAL_DESIGN_EVENT 初期表示処理 */
  init() {
    // 画面下部固定フローティングナビの高さを取得
    const bottomFloat = this._document.getElementsByClassName('l-bottom-float');
    const bottomFloatHeight = window.getComputedStyle(bottomFloat[0]).height;
    // 取得した値 + 8pxをdiv.l-containerのpadding-bottom値として設定
    const containerEl = this._document.getElementsByClassName('l-container');
    this._renderer.setStyle(
      containerEl[0],
      'padding-bottom',
      `${(Number(bottomFloatHeight.replace('px', '')) + 8).toString()}px`
    );
  }

  /** 画面終了時処理 */
  destroy() {
    this._common.dynamicContentService.clearDynamicContent();
  }

  /** 画面更新時処理 */
  reload() {}
}
