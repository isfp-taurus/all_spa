import { InjectionToken } from '@angular/core';

/**
 *
 *
 * @export
 * @property {Record<string, string>} browserBackOrForward specify key-value pair which you want to control browser-back/forward, key sould be target path, value sould be error page path.
 * @property {Record<string, string>} directAccessOrReload specify key-value pair which you want to control direct-access/reload, key sould be target path, value sould be error page path.
 * @interface IRestrictedNavigationServiceConfig
 */
export interface IRestrictedNavigationServiceConfig {
  readonly browserBackOrForward: Record<string, string>;
  readonly directAccessOrReload: Record<string, string>;
}

/**
 *
 *
 * @export
 * @type {InjectionToken}
 * @interface RESTRICTED_NAVIGATION_SERVICE_CONFIG
 */
export const RESTRICTED_NAVIGATION_SERVICE_CONFIG = new InjectionToken<IRestrictedNavigationServiceConfig>(
  'RESTRICTED_NAVIGATION_SERVICE_CONFIG'
);
