import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FindMoreFlightsContComponent } from './find-more-flights-cont.component';
import { RouterModule } from '@angular/router';
import { FindMoreFlightsPresModule } from '../presenter/find-more-flights-pres.module';
import { FindMoreFlightsStoreService } from '@common/services/store/find-more-flights/find-more-flights-store/find-more-flights-store.service';
import { SearchFlightConditionForRequestStoreService } from '@common/services/shopping/search-flight-condition-for-request-store/search-flight-condition-for-request-store.service';
import { FindMoreFlightsPostStoreService } from '@common/services/api-store/sdk-reservation/find-more-flights-store/find-more-flights-store.service';

@NgModule({
  declarations: [FindMoreFlightsContComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: FindMoreFlightsContComponent }]),
    CommonModule,
    FindMoreFlightsPresModule,
  ],
  providers: [
    FindMoreFlightsStoreService,
    SearchFlightConditionForRequestStoreService,
    FindMoreFlightsPostStoreService,
  ],
})
export class FindMoreFlightsContModule {}
