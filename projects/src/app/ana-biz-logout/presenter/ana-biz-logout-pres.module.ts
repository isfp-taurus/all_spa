import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AnaBizLogoutPresComponent } from './ana-biz-logout-pres.component';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [AnaBizLogoutPresComponent],
  exports: [AnaBizLogoutPresComponent],
  imports: [CommonModule, StaticMsgModule, ThrottleClickDirectiveModule],
})
export class AnaBizLogoutPresModule {}
