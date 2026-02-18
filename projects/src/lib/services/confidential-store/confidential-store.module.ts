import { NgModule } from '@angular/core';
import { ConfidentialStoreService } from './confidential-store.service';
import { ConfidentialStoreModule } from '../../store/confidential/confidential.module';

@NgModule({
  providers: [ConfidentialStoreService],
  imports: [ConfidentialStoreModule],
})
export class ConfidentialStoreServiceModule {}
