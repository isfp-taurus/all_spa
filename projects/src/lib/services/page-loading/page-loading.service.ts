import { Injectable, OnDestroy } from '@angular/core';
import { NavigationCancel, Router, Scroll, Event, NavigationStart } from '@angular/router';
import { LOADING_MODE_PROMOTION_ROUTES } from '@conf/routes.config';
import { LoadingDisplayMode, PageLoadingModel, PageLoadingType } from '../../interfaces';
import { PageLoadingStore, selectPageLoadingState, updatePageLoading } from '../../store';
import { Store, select } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription, combineLatest } from 'rxjs';
import { delay, distinctUntilChanged, filter, map, take } from 'rxjs/operators';

/**
 * ローディング表示制御Service
 *
 * @implements OnDestroy
 */
@Injectable({
  providedIn: 'root',
})
export class PageLoadingService implements OnDestroy {
  private _subscription: Subscription = new Subscription();

  /** ローディング画面表示制御用Store */
  private _pageLoading$: Observable<PageLoadingModel>;

  /** 動的文言処理完了トリガー */
  private _dynamicProcessCompleteTrigger$?: BehaviorSubject<boolean>;

  /** 動的文言処理完了トリガー */
  public get dynamicProcessCompleteTrigger$(): BehaviorSubject<boolean> | undefined {
    return this._dynamicProcessCompleteTrigger$;
  }
  public set dynamicProcessCompleteTrigger$(dynamicParams$: BehaviorSubject<boolean> | undefined) {
    this._dynamicProcessCompleteTrigger$ = dynamicParams$;
  }

  constructor(private _store: Store<PageLoadingStore>, private _router: Router) {
    this._pageLoading$ = this._store.pipe(
      select(selectPageLoadingState),
      filter((data) => !!data)
    );
  }

  /**
   * ローディング表示イベント開始
   *
   * @param isDynamicUpdate 動的文言更新要否フラグ（true：動的文言更新要／false：動的文言更新不要（デフォルト））
   * @param loadingDisplayMode ローディング画面の表示モード（未指定の場合は「通常モード」とする）
   */
  public startLoading(isDynamicUpdate?: boolean, loadingDisplayMode?: LoadingDisplayMode) {
    if (isDynamicUpdate) {
      this._dynamicProcessCompleteTrigger$ = new BehaviorSubject(false);
    } else {
      this._dynamicProcessCompleteTrigger$ = undefined;
    }
    this._updatePageLoading({ isLoading: true, loadingDisplayMode: loadingDisplayMode || LoadingDisplayMode.NORMAL });
  }

  /**
   * ローディング表示イベント終了
   *
   * @param isDynamicUpdate 動的文言更新要否フラグ（true：動的文言更新要／false：動的文言更新不要（デフォルト））
   */
  public endLoading(isDynamicUpdate?: boolean) {
    if (isDynamicUpdate) {
      this._subscription.add(
        this._dynamicProcessCompleteTrigger$
          ?.pipe(
            filter((remove) => remove),
            take(1)
          )
          .subscribe(() => {
            this._updatePageLoading({ isLoading: false });
            this.dynamicProcessCompleteTrigger$ = undefined;
          })
      );
    } else {
      this._updatePageLoading({ isLoading: false });
      this.dynamicProcessCompleteTrigger$ = undefined;
    }
  }

  /**
   * ローディング画面のローディング状態取得（アプリケーションレベルコントロール用）
   *
   * - NavigationStart時のローディング画面表示モードをStoreに更新し、
   * Routerのペンディング状態およびStoreのisLoading状態を合わさった状態を取得する
   *
   * @returns
   */
  public getPageLoadingState$(): Observable<boolean> {
    this._subscription.add(
      this._getRouteLoadingDisplayMode$().subscribe((mode: LoadingDisplayMode) => this._updateLoadingDisplayMode(mode))
    );
    const isLoading$ = this._getPageLoadingByKey$('isLoading') as Observable<boolean>;
    return combineLatest([this._getRoutePendingState$(), isLoading$]).pipe(
      map((arePending: boolean[]) => arePending.some((isPending: boolean) => isPending)),
      distinctUntilChanged(),
      delay(0)
    );
  }

  /**
   * ローディング画面の表示モードが
   * プロモーションモードかの判定結果を取得（アプリケーションレベルコントロール用）
   *
   * @returns
   */
  public getIsPromotionMode$(): Observable<boolean> {
    return this._getPageLoadingByKey$('loadingDisplayMode').pipe(
      map((mode) => (mode as LoadingDisplayMode) === LoadingDisplayMode.PROMOTION),
      delay(0)
    );
  }

  /**
   * ローディング表示イベント開始（画面の初期化開始処理用）
   */
  public startLoadingForPageInit() {
    this._dynamicProcessCompleteTrigger$ = undefined;
    this._updatePageLoading({ isLoading: true });
  }

  /**
   * ローディング画面の表示モード設定
   *
   * @param loadingDisplayMode ローディング画面の表示モード（未指定の場合は「通常モード」とする）
   */
  private _updateLoadingDisplayMode(loadingDisplayMode?: LoadingDisplayMode) {
    this._updatePageLoading({ loadingDisplayMode: loadingDisplayMode || LoadingDisplayMode.NORMAL });
  }

  /**
   * NavigationStart時のローディング画面表示モード取得
   *
   * - NavigationのURLに、プロモーションモードでローディング画面を表示する対象が含まれた場合、
   * モードを「promotion」とし、それ以外の場合「normal」とする
   *
   * @returns
   */
  private _getRouteLoadingDisplayMode$(): Observable<LoadingDisplayMode> {
    return this._router.events.pipe(
      filter((e) => e instanceof NavigationStart),
      map((e: Event) => {
        return LOADING_MODE_PROMOTION_ROUTES.includes((e as NavigationStart).url.slice(1))
          ? LoadingDisplayMode.PROMOTION
          : LoadingDisplayMode.NORMAL;
      })
    );
  }

  /**
   * Routerのペンディング状態を取得する
   *
   * @returns
   */
  private _getRoutePendingState$(): Observable<boolean> {
    return this._router.events.pipe(
      map((e) => !(e instanceof Scroll || e instanceof NavigationCancel)),
      distinctUntilChanged()
    );
  }

  /**
   * （共通）ローディング画面表示制御用Store情報取得（by key）
   *
   * @param key
   * @returns
   */
  private _getPageLoadingByKey$(key: PageLoadingType) {
    return this._pageLoading$.pipe(map((data) => data[key]));
  }

  /**
   * （共通）ローディング画面表示制御用Store情報更新
   *
   * @param value
   */
  private _updatePageLoading(value: Partial<PageLoadingModel>) {
    this._store.dispatch(updatePageLoading(value));
  }

  public ngOnDestroy() {
    this._subscription.unsubscribe();
    this.endLoading();
  }
}
