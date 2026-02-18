import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StaticMsgModule } from '@lib/pipes';
import { GoshokaiNetLoginSubHeaderComponent } from './goshokai-net-login-sub-header.component';

@NgModule({
  declarations: [GoshokaiNetLoginSubHeaderComponent],
  imports: [CommonModule, TranslateModule, StaticMsgModule],
  exports: [GoshokaiNetLoginSubHeaderComponent],
})
export class GoshokaiNetLoginSubHeaderModule {}
