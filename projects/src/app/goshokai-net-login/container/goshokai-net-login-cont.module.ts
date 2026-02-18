import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoshokaiNetLoginContComponent } from './goshokai-net-login-cont.component';
import { GoshokaiNetLoginPresComponent } from '../presenter/goshokai-net-login-pres.component';
import { RouterModule } from '@angular/router';
import { GoshokaiNetLoginPresModule } from '../presenter/goshokai-net-login-pres.module';
import { InputModule } from '@lib/components';
import { StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [GoshokaiNetLoginContComponent],
  exports: [GoshokaiNetLoginPresComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: GoshokaiNetLoginContComponent }]),
    CommonModule,
    GoshokaiNetLoginPresModule,
    StaticMsgModule,
    InputModule,
  ],
})
export class GoshokaiNetLoginContModule {}
