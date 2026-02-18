import { NgModule } from '@angular/core';
import { CommonLibModule } from '../common-lib/common-lib.module';
import { AuthorizationService } from './authorization.service';

@NgModule({
  providers: [AuthorizationService],
  imports: [CommonLibModule],
})
export class AuthorizationServiceModule {}
