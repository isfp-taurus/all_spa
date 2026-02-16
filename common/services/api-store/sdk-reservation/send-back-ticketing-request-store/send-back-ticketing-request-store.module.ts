import { NgModule } from '@angular/core';
import { SendBackTicketingRequestStoreModule } from '@common/store/send-back-ticketing-request/send-back-ticketing-request.module';
import { EffectsModule } from '@ngrx/effects';
import { SendBackTicketingRequestStoreService } from './send-back-ticketing-request-store.service';

@NgModule({
  providers: [SendBackTicketingRequestStoreService],
  imports: [SendBackTicketingRequestStoreModule, EffectsModule.forRoot()],
})
export class SendBackTicketingRequestStoreServiceModule {}
