import { NgModule } from '@angular/core';
import { TicketingRequestStoreModule } from '@common/store/ticketing-request/ticketing-request.module';
import { EffectsModule } from '@ngrx/effects';
import { TicketingRequestStoreService } from './ticketing-request-store.service';

@NgModule({
  providers: [TicketingRequestStoreService],
  imports: [TicketingRequestStoreModule, EffectsModule.forRoot()],
})
export class TicketingRequestStoreServiceModule {}
