import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoundtripFlightAvailabilityInternationalContComponent } from './roundtrip-flight-availability-international-cont.component';
import { RoundtripFlightAvailabilityInternationalPresModule } from '../presenter/roundtrip-flight-availability-international-pres.module';
import { FavoriteStoreServiceModule } from '@common/services/favorite/favorite-store.module';
import { HistoryStoreServiceModule } from '@common/services/history/history-store.module';
import { MyBookingStoreServiceModule } from '@common/services/myBooking-store/myBooking-store.module';
import { RoundtripOwdStoreServiceModule } from '@common/services/roundtrip-owd/roundtrip-owd-store.module';
import { UpdateAirOffersStoreServiceModule } from '@common/services/api-store/sdk-reservation/update-air-offers-store/update-air-offers-store.module';
import { UpgradeAvailabilityStoreServicePostModule } from '@common/services/upgrade-availability/upgrade-availability-store.module';
import { UpgradeWaitlistStoreServiceModule } from '@common/services/upgrade-waitlist/upgrade-waitlist-store.module';
import { RoundtripFlightAvailabilityInternationalStoreServiceModule } from '@common/services/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.module';
import { RoundtripOwdDisplayStoreServiceModule } from '@common/services/roundtrip-owd-display/roundtrip-owd-display-store.module';
import { SearchFlightConditionForRequestServiceModule } from '@common/services/store/search-flight/search-flight-condition-for-request-store/search-flight-condition-for-request-store.module';
import { GetUnavailablePaymentByOfficeCodeServiceModule } from '@common/services';

@NgModule({
  declarations: [RoundtripFlightAvailabilityInternationalContComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: RoundtripFlightAvailabilityInternationalContComponent }]),
    RoundtripFlightAvailabilityInternationalPresModule,
    CommonModule,
    FavoriteStoreServiceModule,
    HistoryStoreServiceModule,
    MyBookingStoreServiceModule,
    RoundtripOwdStoreServiceModule,
    RoundtripOwdDisplayStoreServiceModule,
    RoundtripFlightAvailabilityInternationalStoreServiceModule,
    UpdateAirOffersStoreServiceModule,
    UpgradeAvailabilityStoreServicePostModule,
    UpgradeWaitlistStoreServiceModule,
    SearchFlightConditionForRequestServiceModule,
    GetUnavailablePaymentByOfficeCodeServiceModule,
  ],
  exports: [RoundtripFlightAvailabilityInternationalContComponent],
})
export class RoundtripFlightAvailabilityInternationalContModule {}
