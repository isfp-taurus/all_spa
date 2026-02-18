import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OrganizationSelectFilterComponentModule } from '@app/id-modal/organization-select-filter';
import { OrganizationSelectSearchStoreServiceModule, SelectCompanyAccountStoreServiceModule } from '@common/services';
import { ButtonModule } from '@lib/components';
import { StaticMsgModule } from '@lib/pipes';
import { TranslateModule } from '@ngx-translate/core';
import { OrganizationSelectPresComponent } from './organization-select-pres.component';
import { ThrottleClickDirectiveModule } from '@lib/directives';

/**
 * ANA Biz組織選択PresModule
 */
@NgModule({
  declarations: [OrganizationSelectPresComponent],
  imports: [
    CommonModule,
    TranslateModule,
    StaticMsgModule,
    ButtonModule,
    OrganizationSelectFilterComponentModule,
    SelectCompanyAccountStoreServiceModule,
    OrganizationSelectSearchStoreServiceModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [OrganizationSelectPresComponent],
})
export class OrganizationSelectPresModule {}
