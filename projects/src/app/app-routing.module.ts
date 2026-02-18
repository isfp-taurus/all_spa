import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoutesCommon, RoutesHelloWorld, RoutesResRoutes } from '@conf';
import { ErrorsHandlerGuard } from '@lib/guards/errors-handler.guard';
import { PageLeaveModule } from './payment-input/sub-components/page-leave';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: `${RoutesCommon.COMMON}/:type`,
        canActivate: [ErrorsHandlerGuard],
        loadChildren: () =>
          import('@lib/components/shared-ui-components/common-error/container/common-error-cont.module').then(
            (m) => m.CommonErrorContModule
          ),
      },
      {
        path: RoutesResRoutes.PLAN_REVIEW,
        loadChildren: () =>
          import('./plan-review/container/plan-review-cont.module').then((m) => m.PlanReviewContModule),
      },
      {
        path: RoutesResRoutes.PAYMENT_INPUT,
        loadChildren: () =>
          import('./payment-input/container/payment-input-cont.module').then((m) => m.PaymentInputContModule),
      },
      {
        path: RoutesResRoutes.ANABIZ_PAYMENT_INPUT,
        loadChildren: () =>
          import('./anabiz-payment-input/container/anabiz-payment-input-cont.module').then(
            (m) => m.AnabizPaymentInputContModule
          ),
      },
      {
        path: RoutesResRoutes.BOOKING_COMPLETED,
        loadChildren: () =>
          import('./booking-completed/container/booking-completed-cont.module').then(
            (m) => m.BookingCompletedContModule
          ),
      },
      {
        path: RoutesResRoutes.SEATMAP,
        loadChildren: () => import('./seatmap/container/seatmap-cont.module').then((m) => m.SeatmapContModule),
      },
      {
        path: RoutesResRoutes.SEAT_ATTRIBUTE_REQUEST,
        loadChildren: () =>
          import('./seat-attribute-request/container/seat-attribute-cont.module').then(
            (m) => m.SeatAttributeContModule
          ),
      },
      {
        path: RoutesResRoutes.FLIGHT_SEARCH,
        loadChildren: () =>
          import('./search-flight/container/search-flight-cont.module').then((m) => m.SearchFlightContModule),
      },
      {
        path: RoutesResRoutes.ROUNDTRIP_FLIGHT_AVAILABILITY_DOMESTIC,
        loadChildren: () =>
          import(
            './roundtrip-flight-availability-domestic/container/roundtrip-flight-availability-domestic-cont.module'
          ).then((m) => m.RoundtripFlightAvailabilityDomesticContModule),
      },
      {
        path: RoutesResRoutes.CAPTCHA,
        loadChildren: () =>
          import('./captcha-authentication/container/captcha-authentication-cont.module').then(
            (m) => m.CaptchaAuthenticationContModule
          ),
      },
      {
        path: RoutesResRoutes.COMPLEX_FLIGHT_CALENDAR,
        loadChildren: () =>
          import('./complex-flight-calendar/container/complex-flight-calendar-cont.module').then(
            (m) => m.ComplexFlightCalendarContModule
          ),
      },
      {
        path: RoutesResRoutes.COMPLEX_FLIGHT_AVAILABILITY,
        loadChildren: () =>
          import('./complex-flight-availability/container/complex-flight-availability-cont.module').then(
            (m) => m.ComplexFlightAvailabilityContModule
          ),
      },
      {
        path: RoutesResRoutes.COMPLEX_MORE_FLIGHTS,
        loadChildren: () =>
          import('./find-more-flights/container/find-more-flights-cont.module').then(
            (m) => m.FindMoreFlightsContModule
          ),
      },
      {
        path: '**',
        redirectTo: `/${RoutesResRoutes.FLIGHT_SEARCH}`,
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes), PageLeaveModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
