import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AnaBizLoginCookieType, ReservationFunctionIdType, ReservationPageIdType } from '@common/interfaces';
import { SupportPageComponent } from '@lib/components/support-class';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService, PageInitService } from '@lib/services';

@Component({
  selector: 'asw-ana-biz-login-cont',
  templateUrl: './ana-biz-login-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnaBizLoginContComponent extends SupportPageComponent {
  /** ページID */
  pageId: string = ReservationPageIdType.ANA_BIZ_LOGIN;
  /** 機能ID */
  functionId: string = ReservationFunctionIdType.LOGIN;
  /** ANA Bizログイン cookie情報*/
  anaBizLoginCookie: AnaBizLoginCookieType = {};

  constructor(
    private _common: CommonLibService,
    private _pageInitService: PageInitService,
    private _staticMsg: StaticMsgPipe,
    private _title: Title
  ) {
    super(_common, _pageInitService);
    this.setInitialAswCommon();
    // ANA Bizログイン cookie情報の設定
    this.setConfidentialData();
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
      'AnaBizLoginTitle',
      [this._staticMsg.get('heading.anaBizLogin'), this._staticMsg.get('label.aswPageTitle')],
      ([str1, str2]) => {
        this._title.setTitle(str1 + str2);
      }
    );
  }

  /**
   * ANA Bizログイン cookie情報の設定
   */
  private setConfidentialData() {
    this.anaBizLoginCookie.loginId = this._common.confidentialStoreService.confidentialData.loginId;
    this.anaBizLoginCookie.loginPassword = this._common.confidentialStoreService.confidentialData.loginPassword;
    this.anaBizLoginCookie.adminUserId = this._common.confidentialStoreService.confidentialData.adminUserId;
    this.anaBizLoginCookie.hasBizCompanyCookie = this.getHasBizCompanyCookieValueOnInitializationAPI();
    this.anaBizLoginCookie.hasBizCompanyCookiePassword = this.getHasBizCompanyCookiePasswordValueOnInitializationAPI();
  }

  /**
   * 初期流入API情報：hasBizCompanyCookieの取得
   * @returns
   */
  private getHasBizCompanyCookieValueOnInitializationAPI(): string {
    return this._common.confidentialStoreService.confidentialData.loginId ?? '';
  }

  /**
   * 初期流入API情報：hasBizCompanyCookiePasswordの取得
   * @returns
   */
  private getHasBizCompanyCookiePasswordValueOnInitializationAPI(): boolean {
    return !!this._common.confidentialStoreService.confidentialData.loginPassword;
  }

  /**
   * Cookie情報：hasBizCompanyCookieの取得
   * @returns
   */
  private getHasBizCompanyCookieValue(): string {
    return this.getCookieValue('hasBizCompanyCookie');
  }

  /**
   * Cookie情報：hasBizCompanyCookiePasswordの取得
   * @returns
   */
  private getHasBizCompanyCookiePasswordValue(): boolean {
    if (this.getCookieValue('hasBizCompanyCookiePassword') === 'true') {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Cookie情報の取得
   * @param cookieName
   * @returns
   */
  private getCookieValue(cookieName: string): string {
    const cookieAry = document.cookie.split('; ');
    const l = cookieName.length + 1;
    let str: string = '';
    for (const cookie of cookieAry) {
      if (cookie.substring(0, l) === cookieName + '=') {
        str = cookie.substring(l, cookie.length);
        break;
      }
    }
    return str;
  }

  /**
   * 初期表示処理
   */
  init(): void {
    this.setPageTitle();
  }

  reload(): void {}
  destroy(): void {}
}
