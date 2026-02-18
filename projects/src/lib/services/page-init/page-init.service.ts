import { Injectable, OnDestroy } from '@angular/core';
import { DynamicParams, PageType } from '../../interfaces';
import { Observable, Subscription, combineLatest, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { TealiumService } from '../tealium/tealium.service';
import { DynamicContentService } from '../dynamic-content/dynamic-content.service';
import { AswCommonStoreService } from '../asw-common-store/asw-common-store.service';
import { PageLoadingService } from '../page-loading/page-loading.service';

/**
 * 画面の初期化処理Service
 *
 * @implements OnDestroy
 */
@Injectable({
  providedIn: 'root',
})
export class PageInitService implements OnDestroy {
  private _subscription!: Subscription;

  /** 初期化処理化判定フラグ（ローディング画面表示終了制御用） */
  private _isInit = false;

  constructor(
    private _tealiumSvc: TealiumService,
    private _aswCommonSvc: AswCommonStoreService,
    private _dynamicSvc: DynamicContentService,
    private _loadingSvc: PageLoadingService
  ) {}

  /**
   * 初期化開始処理
   */
  public startInit() {
    this._subscription = new Subscription();

    // ローディング画面(G01-003)表示開始
    this._loadingSvc.startLoadingForPageInit();

    // 初期化処理化判定フラグの設定
    this._isInit = true;
  }

  /**
   * 初期化終了処理
   *
   * @param dynamicParams$ 動的文言判定用情報（各画面固有の情報）※動的文言不要な場合、「null」を指定
   */
  public endInit(dynamicParams$?: Observable<DynamicParams> | null) {
    if (dynamicParams$ !== null) {
      // 動的文言処理
      this._dynamicContentHandle(PageType.PAGE, dynamicParams$);
    } else {
      // ローディング画面表示終了
      this._loadingSvc.endLoading();
      this._isInit = false;
    }
  }

  /**
   * サブ画面の動的文言判定用情報設定
   *
   * @param subDynamicParams$ サブ画面用動的文言判定用情報（各サブ画面固有の情報）
   */
  public subDynamicInit(subDynamicParams$: Observable<DynamicParams>) {
    this._dynamicContentHandle(PageType.SUBPAGE, subDynamicParams$);
  }

  /**
   * 動的文言処理（内部用）
   *
   * @param pageType 画面タイプ
   * @param dynamicParams$ 動的文言判定用情報（各画面固有の情報）
   */
  private _dynamicContentHandle(pageType: PageType, dynamicParams$?: Observable<DynamicParams>) {
    let _functionId = '';
    let _pageId = '';
    this._subscription.add(
      combineLatest([this._aswCommonSvc.getFunctionId$(pageType), this._aswCommonSvc.getPageId$(pageType)])
        .pipe(
          take(1),
          switchMap(([funcId, pageId]) => {
            _functionId = funcId;
            _pageId = pageId;
            // 動的文言判定JavaScriptロード処理
            return this._dynamicSvc.loadScript$(funcId, pageId);
          }),
          switchMap((jsPath) => {
            if (jsPath) {
              // 動的文言パラメータ再取得
              return this._dynamicSvc.getDynamicParams$(dynamicParams$);
            } else {
              return of(null);
            }
          })
        )
        .subscribe((dynamicParams) => {
          const procDynamicContent = () => {
            try {
              this._dynamicSvc.setDynamicContent(
                _functionId,
                _pageId,
                dynamicParams as DynamicParams,
                pageType === PageType.SUBPAGE
              );
            } catch (e) {
              // consoleエラーログを出力する（Datadogのログ転送設定でエラーログがDatadogに転送される）
              console.error(e);
            }
          };
          if (dynamicParams) {
            // 動的文言表示内容設定
            procDynamicContent();
            if (this._loadingSvc.dynamicProcessCompleteTrigger$) {
              this._loadingSvc.dynamicProcessCompleteTrigger$.next(true);
            } else if (this._isInit) {
              // ローディング画面表示終了
              this._loadingSvc.endLoading();
            }
          } else {
            // ローディング画面表示終了
            this._loadingSvc.endLoading();
          }
          this._isInit = false;
        })
    );
  }

  /**
   * 画面の初期化処理subscription解除
   * ※画面から離れる際（componentのngOnDestroy時）に実施する必要がある
   */
  public pageInitUnsubscribe() {
    this._subscription.unsubscribe();
  }

  public ngOnDestroy() {
    this.pageInitUnsubscribe();
  }
}
