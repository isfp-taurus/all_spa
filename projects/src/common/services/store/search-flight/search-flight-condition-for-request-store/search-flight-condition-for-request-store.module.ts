import { NgModule } from '@angular/core';
import { SearchFlightConditionForRequestStoreModule } from '@common/store/search-flight-condition-for-request';
import { EffectsModule } from '@ngrx/effects';
import { SearchFlightConditionForRequestService } from './search-flight-condition-for-request-store.service';

@NgModule({
  imports: [SearchFlightConditionForRequestStoreModule, EffectsModule.forRoot()],
  providers: [SearchFlightConditionForRequestService],
})
export class SearchFlightConditionForRequestServiceModule {}
