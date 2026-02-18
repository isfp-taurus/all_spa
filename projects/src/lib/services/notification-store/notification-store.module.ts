import { NgModule } from '@angular/core';
import { NotificationStoreModule } from '../../store';
import { NotificationStoreService } from './notification-store.service';

@NgModule({
  imports: [NotificationStoreModule],
  providers: [NotificationStoreService],
})
export class NotificationStoreServiceModule {}
