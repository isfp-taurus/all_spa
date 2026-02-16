import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AnaBizLogoutPresModule } from '../presenter';
import { AnaBizLogoutContComponent } from './ana-biz-logout-cont.component';

@NgModule({
  declarations: [AnaBizLogoutContComponent],
  exports: [AnaBizLogoutContComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: AnaBizLogoutContComponent }]),
    CommonModule,
    AnaBizLogoutPresModule,
  ],
})
export class AnaBizLogoutContModule {}
