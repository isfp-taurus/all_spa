import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StaticMsgModule } from '@lib/pipes';
import { AnaBizLoginSubHeaderComponent } from './ana-biz-login-sub-header.component';

@NgModule({
  declarations: [AnaBizLoginSubHeaderComponent],
  imports: [CommonModule, StaticMsgModule],
  exports: [AnaBizLoginSubHeaderComponent],
})
export class AnaBizLoginSubHeaderModule {}
