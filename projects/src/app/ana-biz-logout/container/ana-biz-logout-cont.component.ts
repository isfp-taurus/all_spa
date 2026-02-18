import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ReservationFunctionIdType, ReservationPageIdType } from '@common/interfaces';
import { SupportPageComponent } from '@lib/components/support-class';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService, PageInitService } from '@lib/services';

@Component({
  selector: 'asw-ana-biz-logout-cont',
  templateUrl: './ana-biz-logout-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnaBizLogoutContComponent extends SupportPageComponent {
  override autoInitEnd = false;
  /** ページID */
  pageId: string = ReservationPageIdType.ANA_BIZ_LOGOUT;
  /** 機能ID */
  functionId: string = ReservationFunctionIdType.LOGIN;

  constructor(
    private _common: CommonLibService,
    private _pageInitService: PageInitService,
    private _staticMsg: StaticMsgPipe,
    private _title: Title
  ) {
    super(_common, _pageInitService);
    this.setInitialAswCommon();
    this.setPageTitle();
  }

  /**
   * 初期表示の画面情報をセット
   */
  setInitialAswCommon() {
    // 画面情報への機能ID、ページID設定
    this._common.aswCommonStoreService.updateAswCommon({
      functionId: this.functionId,
      pageId: this.pageId,
      subFunctionId: '',
      subPageId: '',
      isEnabledLogin: false,
    });
  }

  /**
   * タイトルをセット
   */
  setPageTitle() {
    // タブバーに画面タイトルを設定する
    this.forkJoinService(
      'AnaBizLogoutTitle',
      [this._staticMsg.get('heading.anaBizLogout'), this._staticMsg.get('label.aswPageTitle')],
      ([str1, str2]) => {
        this._title.setTitle(str1 + str2);
      }
    );
  }

  init(): void {}
  reload(): void {}
  destroy(): void {}
}
