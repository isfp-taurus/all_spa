import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StaticMsgModule } from '@lib/pipes';
import { TranslateModule } from '@ngx-translate/core';
import { OrganizationSelectSubHeaderComponent } from './organization-select-sub-header.component';

@NgModule({
  declarations: [OrganizationSelectSubHeaderComponent],
  imports: [CommonModule, TranslateModule, StaticMsgModule],
  exports: [OrganizationSelectSubHeaderComponent],
})
export class OrganizationSelectSubHeaderModule {}
