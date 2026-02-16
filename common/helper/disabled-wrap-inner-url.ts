import { RoutesResRoutes } from '@conf/routes.config';

/**
 * コンテンツ領域にて l-wrap__inner を無効にするURL
 */
export const DISABLED_WRAP_INNER_URLS = [
  `/${RoutesResRoutes.BOOKING_COMPLETED}`,
  `/${RoutesResRoutes.SEATMAP}`,
  `/${RoutesResRoutes.SEAT_ATTRIBUTE_REQUEST}`,
] as string[];
