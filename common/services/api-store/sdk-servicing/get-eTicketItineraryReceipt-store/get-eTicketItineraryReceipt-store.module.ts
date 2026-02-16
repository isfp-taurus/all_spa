import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { GetETicketItineraryReceiptStoreModule } from '../../../../store/get-eTicketItineraryReceipt/get-e-ticket-itinerary-receipt.module';
import { GetETicketItineraryReceiptStoreService } from './get-eTicketItineraryReceipt-store.service';

@NgModule({
  providers: [GetETicketItineraryReceiptStoreService],
  imports: [GetETicketItineraryReceiptStoreModule, EffectsModule.forRoot()],
})
export class GetETicketItineraryReceiptStoreServiceModule {}
