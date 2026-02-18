import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { Event as AngularRouterEvent, NavigationEnd, Router, RouterEvent } from '@angular/router';
import { RoutesResRoutes, RoutesCommon } from '@conf/routes.config';
import { AmcLoginHeaderComponent } from '@lib/components/shared-ui-components/amc-login/amc-login-header.component';
import { AmcLoginComponent } from '@lib/components/shared-ui-components/amc-login/amc-login.component';
import { SupportComponent } from '@lib/components/support-class';
import { AnaBizLoginStatusType, BookingType, DeviceType, LoginStatusType, ErrorPageRoutes } from '@lib/interfaces';
import { AuthorizationService, CommonLibService, HeaderService, ModalService, PageLoadingService } from '@lib/services';
import { environment } from '@env/environment';
import { map, distinctUntilChanged, filter } from 'rxjs';
import { LinkUrlPipe, HeaderUrlPipe } from '@lib/pipes';
import { CommonConstants } from '@conf/app.constants';

/**
 * ANA Bizヘッダーエリア
 */
@Component({
  selector: 'asw-ana-biz-header',
  templateUrl: './ana-biz-header.component.html',
  styleUrls: ['./ana-biz-header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnaBizHeaderComponent extends SupportComponent {
  @Output()
  isMenuOpenChange = new EventEmitter<boolean>();
  public isMenuOpen = false;
  public isAnaBizMenuOpen = false;
  public isNotLogin: boolean = false;

  public isError = false;

  /** ANA Bizログインステータス */
  get isAnaBizLogin() {
    return this._common.aswContextStoreService.aswContextData.anaBizLoginStatus === AnaBizLoginStatusType.LOGIN;
  }

  /** 提携 Bizログイン情報 */
  get allBizContext() {
    return this._common.anaBizContextStoreService.anaBizContextData.allBizContext;
  }

  /** 会員情報 */
  get amcMemberData() {
    return this._common.amcMemberStoreService.amcMemberData;
  }

  constructor(
    public _common: CommonLibService,
    public _headerService: HeaderService,
    private _router: Router,
    private _modalService: ModalService,
    private _authorizationService: AuthorizationService,
    private _changeDetector: ChangeDetectorRef,
    private _linkUrl: LinkUrlPipe,
    private _pageLoadingService: PageLoadingService,
    private _headerUrl: HeaderUrlPipe
  ) {
    super(_common);
    this.subscribeService(
      'AnaBizHeaderComponent GetPagefuncId',
      this._common.aswCommonStoreService.getAswCommon$(),
      (data) => {
        const funcPageId = (data.functionId ? data.functionId : '') + '-' + (data.pageId ? data.pageId : '');
        if (funcPageId === 'R02-P010' || funcPageId === 'R02-P011' || funcPageId === 'R02-P012') {
          this.isEnabledLogin = false;
          this.isBizHeader = false;
        } else {
          this.isEnabledLogin = !!data.isEnabledLogin;
        }
        this._changeDetector.markForCheck();
      }
    );
    this.subscribeService(
      'AnaBizHeaderAswContext ChangeLoginStatusEvent',
      this._common.aswContextStoreService.getAswContext$().pipe(
        map((store) => store.loginStatus === LoginStatusType.NOT_LOGIN),
        distinctUntilChanged()
      ),
      (data) => {
        this.isNotLogin = !!data;
        this._changeDetector.markForCheck();
      }
    );

    // エラー画面であるかの判定
    const errorPages: string[] = [
      RoutesCommon.SERVICE_ERROR,
      RoutesCommon.SYSTEM_ERROR,
      RoutesCommon.SESSION_TIMEOUT_ERROR,
      RoutesCommon.BROWSER_BACK_ERROR,
    ];
    this.isError = errorPages.includes(this._router.url?.slice(1));

    //URL検知
    this.subscribeService(
      'PageUrlChangeEvent',
      this._router.events.pipe(filter((e: AngularRouterEvent): e is RouterEvent => e instanceof NavigationEnd)),
      (data) => {
        this.isError = errorPages.includes(data.url?.slice(1));

        this._changeDetector.markForCheck();
      }
    );
  }

  public readonly routesResRoutes = RoutesResRoutes;
  /** 言語情報 */
  public aswLangCode = this._common.aswContextStoreService.aswContextData.lang;
  public planReviewUrl =
    environment.spa.baseUrl + (environment.envName !== 'local' ? environment.spa.app.res : '') + '/plan-review';
  public bookingSearchUrl =
    environment.spa.baseUrl + (environment.envName !== 'local' ? environment.spa.app.srv : '') + '/booking-search';
  /** AMCログインボタンの表示非表示 true = 表示*/
  public isEnabledLogin: boolean = true;
  public isBizHeader: boolean = true;
  public logoFilePath = CommonConstants.LOGO_BIZ_FILE_PATH;
  /**
   * AMCログインボタン押下
   */
  clickAMCLoginEvent() {
    const dialogPart = this._modalService.defaultIdPart(AmcLoginComponent, AmcLoginHeaderComponent);
    dialogPart.closeBackEnable = true;
    this._modalService.showSubPageModal(dialogPart);
  }

  /**
   * AMCログアウトボタン押下
   */
  async clickAMCLogoutEvent() {
    await this._authorizationService.logout();
    const url = this._common.aswMasterService.getMPropertyByKey('application', 'topServer');
    window.location.href = this._linkUrl.transform(url);
  }

  /**
   * ANA Bizログアウトボタン押下
   */
  clickANABizLogoutEvent() {
    this._pageLoadingService.startLoading();
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    const url = this._common.aswMasterService.getMPropertyByKey('application', 'url.anaBizLogout');
    window.location.href = `${url}?LANG=${lang}`;
  }

  /**
   * ANA Bizロゴ押下時
   */
  clickANABizLogoEvent() {
    const url = this._common.aswMasterService.getMPropertyByKey('application', 'url.anaBizTop');
    window.location.href = url.replace(/{{(\w+)}}/g, this._common.aswContextStoreService.aswContextData.lang);
  }

  /**
   * SP版メニュークリック
   */
  clickMenuSpEvent() {
    this.isMenuOpen = !this.isMenuOpen;
    this.isAnaBizMenuOpen = !this.isAnaBizMenuOpen;
    this.isMenuOpenChange?.emit(this.isMenuOpen);
    this._changeDetector.markForCheck();
  }

  /**
   * メニューを開く
   */
  openMenuEvent() {
    this.isAnaBizMenuOpen = true;
    this.isMenuOpenChange?.emit(true);
    this._changeDetector.markForCheck();
  }

  /**
   * メニューを閉じる
   */
  closeMenuEvent() {
    this.isAnaBizMenuOpen = false;
    this.isMenuOpenChange?.emit(false);
    this._changeDetector.markForCheck();
  }

  init(): void {}
  reload(): void {}
  destroy(): void {}

  /**
   * プランリスト押下イベント
   */
  onClickPlanListUrl(event: Event) {
    event.preventDefault();
    window.location.href = this._headerUrl.transform(this.planReviewUrl);
  }

  /**
   * 予約検索押下イベント
   */
  onClickBoolingSearchUrl(event: Event) {
    event.preventDefault();
    window.location.href = this._headerUrl.transform(this.bookingSearchUrl);
  }

  /**
   * トップページへリンク押下処理
   */
  onClickTopPageUrl(event: Event) {
    event.preventDefault();
    window.location.href = '/';
  }
}
