import { NgModule } from '@angular/core';
import { CommonLibModule } from '@lib/services';
import { AnabizAuthorizationService } from './anabiz-authorization.service';

@NgModule({
  providers: [AnabizAuthorizationService],
  imports: [CommonLibModule],
})
export class AnabizAuthorizationServiceModule {}
