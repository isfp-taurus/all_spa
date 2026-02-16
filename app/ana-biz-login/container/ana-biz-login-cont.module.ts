import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InputModule } from '@lib/components';
import { AnaBizLoginPresModule } from '../presenter';
import { AnaBizLoginContComponent } from './ana-biz-login-cont.component';

@NgModule({
  declarations: [AnaBizLoginContComponent],
  exports: [AnaBizLoginContComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: AnaBizLoginContComponent }]),
    CommonModule,
    InputModule,
    AnaBizLoginPresModule,
  ],
})
export class AnaBizLoginContModule {}
