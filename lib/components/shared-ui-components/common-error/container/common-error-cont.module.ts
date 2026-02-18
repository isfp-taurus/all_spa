import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonErrorContComponent } from '../container/common-error-cont.component';
import { CommonErrorPresModule } from '../presenter/common-error-pres.module';
import { RouterModule } from '@angular/router';

/**
 * [SharedUI] 共通エラー画面 (container) Module
 */
@NgModule({
  declarations: [CommonErrorContComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: CommonErrorContComponent }]),
    CommonModule,
    CommonErrorPresModule,
  ],
  exports: [CommonErrorContComponent],
})
export class CommonErrorContModule {}
