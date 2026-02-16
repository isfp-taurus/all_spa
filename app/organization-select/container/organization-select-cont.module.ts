import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GetCompanyAccountsStoreServiceModule } from '@common/services';
import { InputModule } from '@lib/components';
import { OrganizationSelectPresModule } from '../presenter';
import { OrganizationSelectContComponent } from './organization-select-cont.component';

/**
 * ANA Biz組織選択ContModule
 */
@NgModule({
  declarations: [OrganizationSelectContComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: OrganizationSelectContComponent }]),
    CommonModule,
    OrganizationSelectPresModule,
    GetCompanyAccountsStoreServiceModule,
    InputModule,
  ],
  exports: [OrganizationSelectContComponent],
})
export class OrganizationSelectContModule {}
