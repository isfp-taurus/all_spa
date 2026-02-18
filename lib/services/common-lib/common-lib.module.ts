import { NgModule } from '@angular/core';
import { AlertMessageStoreServiceModule } from '../alert-message-store/alert-message-store.module';
import { AMCMemberStoreServiceModule } from '../amc-member-store/amc-member-store.module';
import { AnaBizContextStoreServiceModule } from '../ana-biz-context-store/ana-biz-context-store.module';
import { AswCommonStoreServiceModule } from '../asw-common-store/asw-common-store.module';
import { AswContextStoreServiceModule } from '../asw-context-store/asw-context-store.module';
import { NotificationStoreServiceModule } from '../notification-store/notification-store.module';
import { ConfidentialStoreServiceModule } from '../confidential-store/confidential-store.module';
import { CommonLibService } from './common-lib.service';

@NgModule({
  imports: [
    AlertMessageStoreServiceModule,
    AswCommonStoreServiceModule,
    AswContextStoreServiceModule,
    AMCMemberStoreServiceModule,
    NotificationStoreServiceModule,
    AnaBizContextStoreServiceModule,
    ConfidentialStoreServiceModule,
  ],
  providers: [CommonLibService],
  exports: [],
})
export class CommonLibModule {}
