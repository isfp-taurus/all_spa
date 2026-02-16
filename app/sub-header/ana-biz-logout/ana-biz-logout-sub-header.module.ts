import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StaticMsgModule } from '@lib/pipes';
import { AnaBizLogoutSubHeaderComponent } from './ana-biz-logout-sub-header.component';

@NgModule({
  declarations: [AnaBizLogoutSubHeaderComponent],
  imports: [CommonModule, StaticMsgModule],
  exports: [AnaBizLogoutSubHeaderComponent],
})
export class AnaBizLogoutSubHeaderModule {}
