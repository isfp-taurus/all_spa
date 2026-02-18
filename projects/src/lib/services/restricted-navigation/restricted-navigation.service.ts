import {
  inject,
  Inject,
  Injectable,
  OnDestroy,
  Optional,
  SkipSelf,
  type Provider,
  APP_INITIALIZER,
} from '@angular/core';
import { PathLocationStrategy } from '@angular/common';
import { Router, type Event as Event$, ActivationEnd, NavigationStart, NavigationEnd } from '@angular/router';
import { type Observable, Subscription, BehaviorSubject, from as from$ } from 'rxjs';
import { filter, concatMap, tap, take, skipUntil } from 'rxjs/operators';
import { RoutesCommon } from '@conf/routes.config';
import {
  type IRestrictedNavigationServiceConfig,
  RESTRICTED_NAVIGATION_SERVICE_CONFIG,
} from '@lib/interfaces/restricted-navigation';

/**
 *
 * @author ASY
 * @package G03_共通部品_共通・汎用処理（520_ブラウザバック・直リンク・F5制御機能）
 * @export
 * @description service for restricted navigation, control browser-back/forward, direct-access/reload.
 * @class RestrictedNavigationService
 * @implements {OnDestroy}
 */
@Injectable({
  providedIn: 'root',
})
export class RestrictedNavigationService implements OnDestroy {
  /**
   * @description router
   * @private
   * @readonly
   * @type {Router}
   * @memberof RestrictedNavigationService
   */
  private readonly _router: Router = inject(Router);

  /**
   *
   * @description path location strategy
   * @private
   * @type {PathLocationStrategy}
   * @memberof RestrictedNavigationService
   */
  private readonly _path: PathLocationStrategy = inject(PathLocationStrategy);

  /**
   *
   * @description managed `Subscription`.
   * @private
   * @readonly
   * @type {Subscription}
   * @memberof RestrictedNavigationService
   */
  private readonly _subscription: Subscription = new Subscription();

  /**
   *
   * @description get base href
   * @readonly
   * @private
   * @type {string}
   * @memberof RestrictedNavigationService
   */
  private get _baseHref(): string {
    // return this._document.querySelector('base')?.getAttribute('href') ?? '';
    return this._path.getBaseHref();
  }

  /**
   *
   * @description get nagiagtion type via using `PerformanceNavigationTiming` interface.
   * @see https://developer.mozilla.org/ja/docs/Web/API/PerformanceEntry/entryType
   * @readonly
   * @private
   * @type {NavigationTimingType}
   * @memberof RestrictedNavigationService
   */
  private get _navigationType(): NavigationTimingType {
    const entries = window.performance.getEntriesByType('navigation');
    const [$0] = entries.map((e: PerformanceEntry) => (e as PerformanceNavigationTiming).type);

    return $0;
  }

  /**
   *
   * @description detect browser-back/forward for hard-navigation. `window.performance.navigation` is polyfills for older browsers. don't use this method after `APP_INITIALIZER`.
   * @readonly
   * @private
   * @type {boolean}
   * @memberof RestrictedNavigationService
   */
  private get _isBackOrforward(): boolean {
    // return window.performance.navigation && window.performance.navigation.type === window.performance.navigation.TYPE_BACK_FORWARD;
    return this._navigationType === 'back_forward';
  }

  /**
   *
   * @description detect reload for hard-navigation. `window.performance.navigation` is polyfills for older browsers. don't use this method after `APP_INITIALIZER`.
   * @readonly
   * @private
   * @type {boolean}
   * @memberof RestrictedNavigationService
   */
  private get _isReload(): boolean {
    // return window.performance.navigation && window.performance.navigation.type === window.performance.navigation.TYPE_RELOAD;
    return this._navigationType === 'reload';
  }

  /**
   *
   * @description return current path.
   * @readonly
   * @private
   * @type {string}
   * @memberof RestrictedNavigationService
   */
  private get _currentPath(): string {
    const { pathname } = new URL(location.href);

    return pathname.replace(this._baseHref, '');
  }

  /**
   *
   * @description return boolean whether path matched or not.
   * @private
   * @param {(IRestrictedNavigationServiceConfig['browserBackOrForward'] | IRestrictedNavigationServiceConfig['directAccessOrReload'])} config
   * @return {boolean}
   * @memberof RestrictedNavigationService
   */
  private _pathMatched(
    config:
      | IRestrictedNavigationServiceConfig['browserBackOrForward']
      | IRestrictedNavigationServiceConfig['directAccessOrReload']
  ): boolean {
    return Object.keys(config).some((path) => this._currentPath === path);
  }

  /**
   *
   * @description return boolean whether can be browser-back/forward or not.
   * @private
   * @readonly
   * @return {boolean}
   * @memberof RestrictedNavigationService
   */
  private get _canBackOrForward(): boolean {
    return !this._pathMatched(this._config.browserBackOrForward);
  }

  /**
   *
   * @description return boolean whether can direct-access/reload or not.
   * @private
   * @readonly
   * @return {boolean}
   * @memberof RestrictedNavigationService
   */
  private get _canDirectAccessOrReload(): boolean {
    return !this._pathMatched(this._config.directAccessOrReload);
  }

  /**
   *
   * @description return error page url.
   * @private
   * @readonly
   * @return {string}
   * @memberof RestrictedNavigationService
   */
  private get _errorPageUrl(): string {
    const isBackOrForward = !this._canBackOrForward && (this._isBackOrforward || this._isPopstate);
    const config = isBackOrForward ? this._config.browserBackOrForward : this._config.directAccessOrReload;
    const [, errorPageUrl] = Object.entries(config).find(([key]) => key === this._currentPath) ?? [];

    return errorPageUrl ?? RoutesCommon.BROWSER_BACK_ERROR;
  }

  /**
   *
   * @description treat `isPopstate` flag as `Observable` stream.
   * @private
   * @type {BehaviorSubject<boolean>}
   * @memberof RestrictedNavigationService
   */
  private readonly _isPopstateSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   *
   * @description getter for `isPopstate`.
   * @readonly
   * @private
   * @type {boolean}
   * @memberof RestrictedNavigationService
   */
  private get _isPopstate(): boolean {
    return this._isPopstateSubject.getValue();
  }

  /**
   *
   * @description setter for `isPopstate`.
   * @private
   * @memberof RestrictedNavigationService
   */
  private set _isPopstate(isPopstate: boolean) {
    this._isPopstateSubject.next(isPopstate);
  }

  /**
   *
   *
   * @description treat `isDirectAccess` flag as `Observable` stream.
   * @private
   * @type {BehaviorSubject<boolean>}
   * @memberof RestrictedNavigationService
   */
  private readonly _isDirectAccessSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  /**
   *
   * @description getter for `isDirectAccess`.
   * @readonly
   * @private
   * @type {boolean}
   * @memberof RestrictedNavigationService
   */
  private get _isDirectAccess(): boolean {
    return this._isDirectAccessSubject.getValue();
  }

  /**
   *
   * @description setter for `isDirectAccess`.
   * @private
   * @memberof RestrictedNavigationService
   */
  private set _isDirectAccess(isDirectAccess: boolean) {
    this._isDirectAccessSubject.next(isDirectAccess);
  }

  /**
   *
   * @description creates an instance of `RestrictedNavigationService`
   * @param {IRestrictedNavigationServiceConfig} _config config for `RestrictedNavigationService` injected from `AppModule`.
   * @param {RestrictedNavigationService} [_self] to check self instance for singleton.
   * @memberof RestrictedNavigationService
   */
  public constructor(
    @Inject(RESTRICTED_NAVIGATION_SERVICE_CONFIG) private readonly _config: IRestrictedNavigationServiceConfig,
    @Optional() @SkipSelf() private readonly _self?: RestrictedNavigationService
  ) {
    if (_self) {
      throw Error(`[RestrictedNavigationService]: this service should be a singleton.`);
    }
  }

  /**
   *
   * @description initialize behavior of `RestrictedNavigationService`
   * @memberof RestrictedNavigationService
   */
  public init() {
    this._detectNextNavigation();
    const isBackOrForward = !this._canBackOrForward && this._isBackOrforward;
    const isDirectAccessOrReload = !this._canDirectAccessOrReload && (this._isReload || this._isDirectAccess);
    if (isBackOrForward || isDirectAccessOrReload) {
      this._subscription.add(this._redirectToErrorPage$().subscribe());
    }

    this._watchEvents();
  }

  /**
   *
   * @description skip until soft-navigation detected.
   * @private
   * @memberof RestrictedNavigationService
   */
  private _detectNextNavigation() {
    const events$ = this._router.events;
    const start$ = events$.pipe(filter((e): e is NavigationStart => e instanceof NavigationStart));
    const end$ = events$.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      take(1)
    );
    const next$ = start$.pipe(
      skipUntil(end$),
      tap(() => (this._isDirectAccess = false)),
      take(1)
    );

    this._subscription.add(next$.subscribe());
  }

  /**
   *
   * @description when angular app raised router events like soft-navigation, check whether browser-back or not, and handle to redirect to error page.
   * @private
   * @memberof RestrictedNavigationService
   */
  private _watchEvents() {
    const events$: Observable<Event$> = this._router.events;
    const start$ = events$.pipe(
      filter((e): e is NavigationStart => e instanceof NavigationStart),
      tap(({ navigationTrigger: trigger }) => (this._isPopstate = trigger === 'popstate'))
    );
    const end$ = events$.pipe(
      filter((e): e is ActivationEnd => e instanceof ActivationEnd),
      filter(() => !this._canBackOrForward),
      filter(() => this._isPopstate),
      concatMap(() => this._redirectToErrorPage$())
    );

    this._subscription.add(start$.subscribe());
    this._subscription.add(end$.subscribe());
  }

  /**
   *
   * @description redirect to error page as `Observable`.
   * @private
   * @return {Observable<boolean>}
   * @memberof RestrictedNavigationService
   */
  private _redirectToErrorPage$(): Observable<boolean> {
    return from$(this._router.navigate([this._errorPageUrl]));
  }

  /**
   *
   * @description destructor behavior of `RestrictedNavigationService` as lifecycle hook.
   * @memberof RestrictedNavigationService
   */
  public ngOnDestroy() {
    this._isPopstateSubject.complete();
    this._isDirectAccessSubject.complete();
    this._subscription.unsubscribe();
  }
}

/**
 *
 *
 * @description factory function for `APP_INITIALIZER`
 * @return {Function}
 */
const factory = (svc: RestrictedNavigationService) => () => svc.init();

/**
 *
 * @description provider for `AppModule`
 * @export
 * @type {Provider}
 */
export const RESTRICTED_NAVIGATION_INITIALIZER_PROVIDER: Provider = {
  provide: APP_INITIALIZER,
  useFactory: factory,
  deps: [RestrictedNavigationService],
  multi: true,
};
