import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorGuidanceContComponent } from './error-guidance-cont.component';
import { ErrorGuidancePresModule } from '../presenter/error-guidance-pres.module';

/**
 * [SharedUI] 注意喚起エリア（エラー） (container) Module
 */
@NgModule({
  declarations: [ErrorGuidanceContComponent],
  imports: [CommonModule, ErrorGuidancePresModule],
  exports: [ErrorGuidanceContComponent],
})
export class ErrorGuidanceContModule {}
