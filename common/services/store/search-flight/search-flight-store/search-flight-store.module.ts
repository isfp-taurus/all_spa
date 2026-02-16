import { NgModule } from '@angular/core';
import { SearchFlightStoreModule } from '@common/store/search-flight';
import { SearchFlightStoreService } from './search-flight-store.service';

@NgModule({
  imports: [SearchFlightStoreModule],
  providers: [SearchFlightStoreService],
})
export class SearchFlightStoreServiceModule {}
