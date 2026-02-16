import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectCompanyAccountStoreServiceModule } from '@common/services';
import { OrganizationSelectSearchStoreModule } from '@common/store';
import { ButtonModule, InputModule } from '@lib/components';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import { StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { OrganizationSelectFilterComponent } from '../organization-select-filter/organization-select-filter.component';

@NgModule({
  declarations: [OrganizationSelectFilterComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    ButtonModule,
    InputModule,
    FormsModule,
    ThrottleClickDirectiveModule,
    ReactiveFormsModule,
    SelectCompanyAccountStoreServiceModule,
    OrganizationSelectSearchStoreModule,
  ],
  exports: [OrganizationSelectFilterComponent],
  providers: [StaticMsgPipe],
})
export class OrganizationSelectFilterComponentModule {}
