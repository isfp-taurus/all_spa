import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemporaryUrlModalComponent } from './temporary-url-modal.component';
import { StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { TemporaryUrlModalService } from './temporary-url-modal.service';

@NgModule({
  providers: [StaticMsgPipe, TemporaryUrlModalService],
  declarations: [TemporaryUrlModalComponent],
  imports: [CommonModule, StaticMsgModule],
  exports: [TemporaryUrlModalComponent],
})
export class TemporaryUrlModalModule {}
