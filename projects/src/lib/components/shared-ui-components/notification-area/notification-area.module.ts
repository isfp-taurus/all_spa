import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NotificationStoreServiceModule } from '../../../services';
import { NotificationAreaComponent } from './notification-area.component';

@NgModule({
  declarations: [NotificationAreaComponent],
  imports: [CommonModule, NotificationStoreServiceModule],
  exports: [NotificationAreaComponent],
})
export class NotificationAreaModule {}
