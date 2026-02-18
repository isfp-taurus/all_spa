/**
 * ヘッダーエリア
 */
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  Renderer2,
} from '@angular/core';
import { Event as AngularRouterEvent, NavigationEnd, Router, RouterEvent } from '@angular/router';
import { filter } from 'rxjs';
import { AmcLoginHeaderComponent } from '../../../components/shared-ui-components/amc-login/amc-login-header.component';
import { AmcLoginComponent } from '../../../components/shared-ui-components/amc-login/amc-login.component';
import { AnaBizLoginStatusType } from '../../../interfaces';
import { SupportComponent } from '../../../components/support-class';
import {
  AuthorizationService,
  CommonLibService,
  HeaderService,
  ModalService,
  PageLoadingService,
} from '../../../services';
import { LinkUrlPipe, HeaderUrlPipe } from '../../../pipes';
import { RoutesResRoutes, RoutesCommon } from '@conf/routes.config';
import { environment } from '@env/environment';
import { AmcLoginPayload } from '../amc-login/amc-login.state';
import { CommonConstants } from '@conf/app.constants';

/**
 * ヘッダーエリア
 */
@Component({
  selector: 'asw-header',
  templateUrl: './header.component.html',
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent extends SupportComponent implements AfterViewInit {
  /** 会員情報 */
  get amcMemberData() {
    return this._common.amcMemberStoreService.amcMemberData;
  }
  /** 会員マイル数 */
  get amcMemberPoints() {
    let points = 0;
    const pointDetails =
      this._common.amcMemberStoreService.amcMemberData.iFlyMemberInfo?.programDetails?.[0]?.pointDetails;
    if (!!pointDetails) {
      pointDetails.forEach((detail) => (points += Number(detail.points) || 0));
    }
    return points;
  }

  constructor(
    public _common: CommonLibService,
    public _headerService: HeaderService,
    private _router: Router,
    private _modalService: ModalService,
    private _authorizationService: AuthorizationService,
    private _changeDetector: ChangeDetectorRef,
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    private _linkUrl: LinkUrlPipe,
    private _pageLoadingService: PageLoadingService,
    private _headerUrl: HeaderUrlPipe
  ) {
    super(_common);
  }

  public assertiveMessage = '';
  public politeMessage = '';
  public isLoginEnable = true;
  public isAriaHidden = false;
  public isMenuOpen = false;
  public readonly routesResRoutes = RoutesResRoutes;
  public isAnaBizHeader = false;
  public isInformativeSeatmapHeader = false;
  public planReviewUrl =
    environment.spa.baseUrl + (environment.envName !== 'local' ? environment.spa.app.res : '') + '/plan-review';
  public bookingSearchUrl =
    environment.spa.baseUrl + (environment.envName !== 'local' ? environment.spa.app.srv : '') + '/booking-search';
  public logoFilePath = CommonConstants.LOGO_FILE_PATH;
  private previousLoginStatus = '';
  public isError = false;

  @Output() menuOpenEvent = new EventEmitter<boolean>();

  init() {
    // モーダル画面の判定
    this.subscribeService('lContainerAriaHiddenToTrue', this._modalService.onModalOpen$, () => {
      this.isAriaHidden = true;
      this._changeDetector.detectChanges();
    });
    this.subscribeService('lContainerAriaHiddenToFalse', this._modalService.onModalClose$, () => {
      this.isAriaHidden = false;
      this.isMenuOpen = false;
      this._changeDetector.detectChanges();
    });
    this.subscribeService('isLoginEnableCheckUpgrade', this._common.aswCommonStoreService.getAswCommon$(), (data) => {
      this.isLoginEnable = !!data.isEnabledLogin;
      this._changeDetector.markForCheck();
    });
    // 標準ヘッダー以外の判定
    this.subscribeService(
      'headerComponentGetPagefuncId',
      this._common.aswCommonStoreService.getPagefuncId$('page'),
      (data) => {
        const funcPageId = (data.functionId ? data.functionId : '') + '-' + (data.pageId ? data.pageId : '');
        // S03-P030_シートマップ（参照）画面用ヘッダー判定フラグ初期化
        this.isInformativeSeatmapHeader = false;
        // ANA Bizヘッダー対象画面の判定
        if (funcPageId === 'R02-P010' || funcPageId === 'R02-P011' || funcPageId === 'R02-P012') {
          this.isAnaBizHeader = true;
        }
        // S03-P030_シートマップ（参照）画面用ヘッダーの対象画面の判定
        else if (funcPageId === 'S03-P030') {
          this.isInformativeSeatmapHeader = true;
        }
        this._changeDetector.markForCheck();
      }
    );
    // ANA Bizログイン判定 & AMCログイン変化判定
    this.subscribeService('headerAswContext', this._common.aswContextStoreService.getAswContext$(), (data) => {
      this.isAnaBizHeader = data.anaBizLoginStatus === AnaBizLoginStatusType.LOGIN;
      // ログイン状態が変わったらモーダルを閉じる
      if (this.previousLoginStatus !== data.loginStatus) {
        this.previousLoginStatus = data.loginStatus;
        this.isMenuOpen = false;
      }
      this._changeDetector.markForCheck();
    });

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

        //URLが変更したらモーダルを閉じる
        this.isMenuOpen = false;
        this._changeDetector.markForCheck();
        this.closeMenu();
      }
    );
  }
  ngAfterViewInit(): void {
    this.toggleHeaderListInert(this.isMenuOpen);
  }
  destroy() {
    this.isMenuOpen = false;
    this.closeMenu();
  }
  reload() {
    this.isMenuOpen = false;
    this.closeMenu();
  }

  /**
   * アカウント名クリック時
   */
  clickAccountEvent() {
    this.isMenuOpen = true;
    this.menuOpen(this.isMenuOpen);
    this.toggleHeaderListInert(this.isMenuOpen);
  }

  /**
   * SP版メニュークリック
   */
  clickMenuSpEvent() {
    this.isMenuOpen = !this.isMenuOpen;
    this.menuOpen(this.isMenuOpen);
    this.toggleHeaderListInert(this.isMenuOpen);
  }

  /**
   * メニューを閉じる処理
   */
  closeMenu() {
    this.isMenuOpen = false;
    this.menuOpen(this.isMenuOpen);
    this.toggleHeaderListInert(this.isMenuOpen);
  }

  /**
   * メニュー開閉イベント処理
   */
  changeMenuOpen(value: boolean) {
    this.isMenuOpen = value;
  }

  /**
   * ログインボタン押下
   */
  clickLoginEvent() {
    const dialogPart = this._modalService.defaultIdPart(AmcLoginComponent, AmcLoginHeaderComponent);
    dialogPart.closeBackEnable = true;

    // マージ確認モーダル対応
    const beforeLoginEvent = this._common.aswCommonStoreService.aswCommonData.beforeLoginEvent;
    const payload: AmcLoginPayload = { beforeLoginEvent: beforeLoginEvent };
    dialogPart.payload = payload;

    this._modalService.showSubPageModal(dialogPart);
  }

  /**
   * ログアウトボタン押下
   */
  async clickLogoutEvent() {
    this._pageLoadingService.startLoading();
    //　レスポンスが来てから次の処理を行うためawaitする
    await this._authorizationService.logout();
    this._pageLoadingService.endLoading();
    // ASWTOPに遷移
    const url = this._common.aswMasterService.getMPropertyByKey('application', 'topServer');
    window.location.href = this._linkUrl.transform(url);
  }

  /**
   * ヘッダー開閉時にヘッダーリストの中の
   * ボタンやリンクのフォーカス可否を切り替える
   */
  private toggleHeaderListInert(isMenuOpen: boolean): void {
    const headerList = '.l-header__sub-list';
    const sideListWhenLogin = '.p-drawer-menu-member';
    const sideListWhenLogout = '.p-drawer-menu-non-member';
    const toggle = (selector: string, setInert: boolean) => {
      const element: HTMLElement = this._elementRef.nativeElement.querySelector(selector);
      if (element) {
        setInert ? this._renderer.setAttribute(element, 'inert', '') : this._renderer.removeAttribute(element, 'inert');
      }
    };
    toggle(headerList, isMenuOpen);
    toggle(sideListWhenLogin, !isMenuOpen);
    toggle(sideListWhenLogout, !isMenuOpen);
  }

  /**
   * ヘッダー開閉情報通知
   * @param {boolean} open ヘッダー開閉
   */
  private menuOpen(open: boolean): void {
    this.menuOpenEvent.emit(open);
  }

  /**
   * ANAロゴ押下イベント
   */
  onClickAnaLogo(event: Event) {
    event.preventDefault();
    window.location.href = this._headerService.getTopUrl();
  }

  /**
   * プラン詳細押下イベント
   */
  onClickPlanReviewUrl(event: Event) {
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
   * tab押下イベント
   */
  public tabKeyEvent(event: KeyboardEvent) {
    const el = document.getElementById('drawer-menu');
    const closeBtn = document.getElementById('header-member-drawer-close-button');
    const closeNonBtn = document.getElementById('header-non-member-drawer-close-button');
    const closeErrorBtn = document.getElementById('header-non-member-drawer-close-button-isError');
    if (el && event.key === 'Tab') {
      const tabElements = Array.from(
        el.querySelectorAll(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element: any) => {
        return element.offsetHeight > 0;
      });
      if (tabElements && event.target === tabElements[tabElements.length - 1]) {
        if (closeErrorBtn && closeErrorBtn.offsetHeight > 0) {
          closeErrorBtn.focus();
        }
        if (closeNonBtn && closeNonBtn.offsetHeight > 0) {
          closeNonBtn.focus();
        }
        if (closeBtn && closeBtn.offsetHeight > 0) {
          closeBtn.focus();
        }
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }
}
