import { NgModule } from '@angular/core';
import { SupportInformationInputStoreModule } from '@common/store/support-information-input';
import { SupportInformationInputStoreService } from './support-information-input-store.service';

@NgModule({
  providers: [SupportInformationInputStoreService],
  imports: [SupportInformationInputStoreModule],
})
export class SupportInformationInputStoreServiceModule {}
