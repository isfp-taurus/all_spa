import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MergeConfirmModalComponent } from './merge-confirm-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { StaticMsgModule } from '@lib/pipes';
import { RadiobuttonModule } from '@lib/components';
import { ReactiveFormsModule } from '@angular/forms';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import { SignalService } from '@lib/components/shared-ui-components/amc-login/signal.service';

@NgModule({
  declarations: [MergeConfirmModalComponent],
  providers: [SignalService],
  imports: [
    CommonModule,
    TranslateModule,
    StaticMsgModule,
    RadiobuttonModule,
    ReactiveFormsModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [MergeConfirmModalComponent],
})
export class MargeConfirmModalModule {}
