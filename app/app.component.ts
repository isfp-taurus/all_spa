import { AfterViewInit, ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { I18N_CONFIG } from '@conf';
import {
  AswCommonStoreService,
  AswContextStoreService,
  ErrorsHandlerService,
  PageLoadingService,
  SystemDateService,
} from '@lib/services';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, take } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { LOAD_MASTER_LIST } from '@conf';
import { environment } from '@env/environment';
import { AswMasterService } from '@lib/services';
import { lastValueFrom } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { PlanReviewSubHeaderComponent } from 'src/app/sub-header/plan-review/plan-review-sub-header.component';
import { AnaBizLoginSubHeaderComponent } from './sub-header/ana-biz-login-sub-header/ana-biz-login-sub-header.component';
import { AnaBizLogoutSubHeaderComponent } from './sub-header/ana-biz-logout/ana-biz-logout-sub-header.component';
import { BookingCompletedSubHeaderComponent } from './sub-header/booking-completed/booking-completed-sub-header.component';
import { ComplexFlightAvailabilityHeaderComponent } from './sub-header/complex-flight-availability/complex-flight-availability-sub-header.component';
import { ComplexFlightCalendarSubHeaderComponent } from './sub-header/complex-flight-calendar/complex-flight-calendar-sub-header.component';
import { PetInputSubHeaderComponent } from './sub-header/pet-input/pet-input-sub-header.component';
import { FindMoreFlightsSubHeaderComponent } from './sub-header/find-more-flights/find-more-flights-sub-header.component';
import { SearchFlightSubHeaderComponent } from './sub-header/search-flight/search-flight-sub-header.component';
import { GoshokaiNetLoginSubHeaderComponent } from './sub-header/goshokai-net-login/goshokai-net-login-sub-header.component';
import { OrganizationSelectSubHeaderComponent } from './sub-header/organization-select-sub-header/organization-select-sub-header.component';
import { PaymentInputSubHeaderComponent } from './sub-header/payment-input/payment-input-sub-header.component';
import { PlanListSubHeaderComponent } from './sub-header/plan-list/plan-list-sub-header.component';
import { RoundtripFlightAvailabilityDomesticSubHeaderComponent } from './sub-header/roundtrip-flight-availability-domestic/roundtrip-flight-availability-domestic-sub-header.component';
import { RoundtripFlightAvailabilityInternationalSubHeaderComponent } from './sub-header/roundtrip-flight-availability-international/roundtrip-flight-availability-international-sub-header.component';
import { SeatmapSubHeaderComponent } from './sub-header/seatmap/seatmap-sub-header.component';

@Component({
  selector: 'asw-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  /**
   * ローディング画面表示制御 - 表示モード
   */
  public isPromotion$!: Observable<boolean>;
  /**
   * ローディング画面表示制御 - プロモーションモード判定フラグ
   */
  public isLoading$!: Observable<boolean>;

  constructor(
    private _aswCommonStoreService: AswCommonStoreService,
    private _aswContextStoreSvc: AswContextStoreService,
    private _errorHandlerSvc: ErrorsHandlerService,
    private _systemDateSvc: SystemDateService,
    private _loadingSvc: PageLoadingService,
    private _change: ChangeDetectorRef,
    private _aswMasterService: AswMasterService,
    private _translateSvc: TranslateService,
    private router: Router,
    @Inject(NgZone) private _ngZone: NgZone,
    @Inject(DOCUMENT) private _document: Document
  ) {
    // ローディング画面の表示モードがプロモーションモードかの判定結果を取得
    this.isPromotion$ = this._loadingSvc.getIsPromotionMode$();
    // ローディング画面のローディング状態取得
    this.isLoading$ = this._loadingSvc.getPageLoadingState$();
  }

  // 言語（変更前の比較用）
  private lang = '';

  ngOnInit(): void {
    // エラーハンドリングServiceの初期化
    this._errorHandlerSvc.init();

    // システム日付Serviceの初期化
    this._systemDateSvc.init();

    //サブヘッダーを指定
    this.subPageSubscription = this._aswCommonStoreService
      .getPagefuncId$('page')
      .subscribe((data: { functionId: string | undefined; pageId: string | undefined }) => {
        // 各業務画面で必要なサブヘッダーを追加
        const funcPageId = (data.functionId ? data.functionId : '') + '-' + (data.pageId ? data.pageId : '');
        switch (funcPageId) {
          case 'R01-P010':
            this.subHeader = SearchFlightSubHeaderComponent;
            break;
          case 'R01-P030':
            this.subHeader = RoundtripFlightAvailabilityInternationalSubHeaderComponent;
            break;
          case 'R01-P031':
            this.subHeader = RoundtripFlightAvailabilityDomesticSubHeaderComponent;
            break;
          case 'R01-P032':
            this.subHeader = ComplexFlightCalendarSubHeaderComponent;
            break;
          case 'R01-P033':
            this.subHeader = ComplexFlightAvailabilityHeaderComponent;
            break;
          case 'R01-P034':
            this.subHeader = FindMoreFlightsSubHeaderComponent;
            break;
          case 'R01-P040':
            this.subHeader = PlanReviewSubHeaderComponent;
            break;
          case 'R01-P042':
            this.subHeader = PlanListSubHeaderComponent;
            break;
          case 'R01-P054':
            this.subHeader = PetInputSubHeaderComponent;
            break;
          case 'R01-P070':
            this.subHeader = SeatmapSubHeaderComponent;
            break;
          case 'R01-P071':
            this.subHeader = SeatmapSubHeaderComponent;
            break;
          case 'R01-P080':
            this.subHeader = PaymentInputSubHeaderComponent;
            break;
          case 'R01-P083':
            this.subHeader = PaymentInputSubHeaderComponent;
            break;
          case 'R01-P090':
            this.subHeader = BookingCompletedSubHeaderComponent;
            break;
          case 'R02-P010':
            this.subHeader = AnaBizLoginSubHeaderComponent;
            break;
          case 'R02-P012':
            this.subHeader = AnaBizLogoutSubHeaderComponent;
            break;
          case 'R02-P020':
            this.subHeader = GoshokaiNetLoginSubHeaderComponent;
            break;
          case 'R02-P011':
            this.subHeader = OrganizationSelectSubHeaderComponent;
            break;
          default:
            this.subHeader = null;
            break;
        }
        this._change.detectChanges();
      });

    // 言語が変更された際にキャッシュをロードする。
    this._aswContextStoreSvc.getAswContext$().subscribe((data) => {
      if (data.lang && this.lang && data.lang !== this.lang) {
        // 利用言語の再設定とキャッシュ再ロード
        this._setLangAndloadCache(data.lang);
      }
      this.lang = data.lang;
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      //計測タグスクリプトの画面遷移時の処理を実行
      if (event instanceof NavigationEnd && (window as any).trackingTags?.onPageTransition !== undefined) {
        const url = event.urlAfterRedirects;
        const title = document.title;
        (window as any).trackingTags.onPageTransition(url, title);
      }
    });
  }

  /** 利用言語の設定とキャッシュ再ロード */
  private _setLangAndloadCache(langValue?: string) {
    let lang = langValue;
    if (lang) {
      lang = lang in I18N_CONFIG.supportedLocales ? lang : 'ja';
    } else {
      lang = I18N_CONFIG.defaultLanguage;
    }
    this._translateSvc
      .use(lang)
      .pipe(take(1))
      .subscribe(() => {
        // キャッシュ再ロード
        lastValueFrom(this._aswMasterService.load(LOAD_MASTER_LIST));
      });
    // html lang属性再設定
    this._document.documentElement.lang = I18N_CONFIG.supportedLocales[lang];
  }

  ngOnDestroy(): void {
    if (this.subPageSubscription) {
      this.subPageSubscription.unsubscribe();
    }

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this._ngZone.runOutsideAngular(() => {
      this._setDynatraceTag();
    });
  }

  /**
   * Dynatrace用scriptタグを設置
   */
  private _setDynatraceTag() {
    let key: 'res' | 'srv' | 'exc' | 'cki';
    const URL = window.location.href;
    switch (true) {
      case URL.includes(`${environment.spa.baseUrl}${environment.spa.app.res}`):
        key = 'res';
        break;
      case URL.includes(`${environment.spa.baseUrl}${environment.spa.app.srv}`):
        key = 'srv';
        break;
      case URL.includes(`${environment.spa.baseUrl}${environment.spa.app.exc}`):
        key = 'exc';
        break;
      case URL.includes(`${environment.spa.baseUrl}${environment.spa.app.cki}`):
        key = 'cki';
        break;
      default:
        return;
    }

    if (environment.dynatrace[key].disable || !environment.dynatrace[key].url) {
      return;
    }

    const $script: HTMLScriptElement = this._document.createElement('script');
    $script.async = true;
    $script.type = 'text/javascript';
    $script.src = environment.dynatrace[key].url;
    $script.crossOrigin = 'anonymous';
    const $head: HTMLHeadElement = this._document.getElementsByTagName('head')[0];
    if ($head) {
      $head.appendChild($script);
    }
  }

  subPageSubscription?: Subscription;
  public subHeader: any;

  routerSubscription?: Subscription;
}
