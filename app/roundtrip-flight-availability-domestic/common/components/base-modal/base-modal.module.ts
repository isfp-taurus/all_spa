import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseModalComponent } from './base-modal.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { StaticMsgModule } from '@lib/pipes';
import { AlertAreaModule, GuidanceAreaModule, EmergencyAreaModule } from '@lib/components';

/**
 * ベースモーダルModule
 */
@NgModule({
  declarations: [BaseModalComponent],
  imports: [CommonModule, OverlayModule, StaticMsgModule, AlertAreaModule, GuidanceAreaModule, EmergencyAreaModule],
  exports: [BaseModalComponent],
})
export class BaseModalModule {}
