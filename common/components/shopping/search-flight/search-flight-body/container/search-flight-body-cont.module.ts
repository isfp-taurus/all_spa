import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchFlightBodyContComponent } from './search-flight-body-cont.component';
import { SearchFlightBodyPresModule } from '../presenter/search-flight-body-pres.module';
import { LinkUrlModule } from '@lib/pipes/link-url/link-url.module';
import { ShoppingLibModule } from '@common/services/shopping/shopping-lib/shopping-lib.module';
import { SearchFlightConditionForRequestServiceModule } from '@common/services/store/search-flight/search-flight-condition-for-request-store/search-flight-condition-for-request-store.module';
import { LinkUrlPipe } from '@lib/pipes/link-url/link-url.pipe';
import { DeliverySearchInformationStoreServiceModule } from '@common/services/store/delivery-search-information-store/delivery-search-information-store.module';

@NgModule({
  declarations: [SearchFlightBodyContComponent],
  providers: [LinkUrlPipe],
  imports: [
    CommonModule,
    SearchFlightBodyPresModule,
    SearchFlightConditionForRequestServiceModule,
    DeliverySearchInformationStoreServiceModule,
    LinkUrlModule,
    ShoppingLibModule,
  ],
  exports: [SearchFlightBodyContComponent],
})
export class SearchFlightBodyContModule {}
