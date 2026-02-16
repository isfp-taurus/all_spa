import { Provider } from '@angular/core';
import {
  IRestrictedNavigationServiceConfig,
  RESTRICTED_NAVIGATION_SERVICE_CONFIG,
} from '@lib/interfaces/restricted-navigation';
import { RoutesCommon, RoutesResRoutes } from './routes.config';

const config: IRestrictedNavigationServiceConfig = {
  browserBackOrForward: {
    [RoutesResRoutes.ANABIZ_PAYMENT_INPUT]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesResRoutes.PET_RESERVATION_INFORMATION_REQUEST]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesResRoutes.PAYMENT_INPUT]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesResRoutes.SEATMAP]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesResRoutes.SEAT_ATTRIBUTE_REQUEST]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesResRoutes.BOOKING_COMPLETED]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesResRoutes.PLAN_REVIEW]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesResRoutes.ROUNDTRIP_FLIGHT_AVAILABILITY_DOMESTIC]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesResRoutes.ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesResRoutes.COMPLEX_FLIGHT_CALENDAR]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesResRoutes.FLIGHT_SEARCH]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesResRoutes.CAPTCHA]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesResRoutes.COMPLEX_FLIGHT_AVAILABILITY]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesCommon.SERVICE_ERROR]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesCommon.SYSTEM_ERROR]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesCommon.SESSION_TIMEOUT_ERROR]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesCommon.BROWSER_BACK_ERROR]: RoutesCommon.BROWSER_BACK_ERROR,
  },
  directAccessOrReload: {
    //    [RoutesResRoutes.PAYMENT_INPUT]: RoutesCommon.BROWSER_BACK_ERROR,
    //    [RoutesResRoutes.ANABIZ_PAYMENT_INPUT]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesResRoutes.PET_RESERVATION_INFORMATION_REQUEST]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesResRoutes.SEATMAP]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesResRoutes.SEAT_ATTRIBUTE_REQUEST]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesResRoutes.BOOKING_COMPLETED]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesResRoutes.ROUNDTRIP_FLIGHT_AVAILABILITY_DOMESTIC]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesResRoutes.ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesCommon.SERVICE_ERROR]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesCommon.SYSTEM_ERROR]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesCommon.SESSION_TIMEOUT_ERROR]: RoutesCommon.BROWSER_BACK_ERROR,
    [RoutesCommon.BROWSER_BACK_ERROR]: RoutesCommon.BROWSER_BACK_ERROR,
  },
};

/**
 *
 * @description provider for `AppModule`
 * @export
 * @type {Provider}
 */
export const RESTRICTED_NAVIGATION_SERVICE_CONFIG_PROVIDER: Provider = {
  provide: RESTRICTED_NAVIGATION_SERVICE_CONFIG,
  useValue: config,
};
