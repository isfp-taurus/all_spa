import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgreementComponent } from './agreement.component';
import { ButtonModule, CheckboxModule, RadiobuttonModule } from '@lib/components';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StaticMsgModule } from '@lib/pipes';
import { AgreementService } from './agreement.service';
import { AswMasterStoreModule, SysdateStoreModule } from '@lib/store';
import { CurrentPlanStoreServiceModule } from '@common/services';
import { CommonLibModule } from '@lib/services';
import { AgreementHeaderComponent } from './agreement-header.component';
import { AgreementFooterComponent } from './agreement-footer.component';

@NgModule({
  declarations: [AgreementComponent, AgreementHeaderComponent, AgreementFooterComponent],
  providers: [AgreementService],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    //部品
    CheckboxModule,
    RadiobuttonModule,
    ButtonModule,
    TranslateModule,
    StaticMsgModule,
    //サービス
    CommonLibModule,
    AswMasterStoreModule,
    CurrentPlanStoreServiceModule,
    SysdateStoreModule,
  ],
  exports: [AgreementComponent, AgreementHeaderComponent, AgreementFooterComponent],
})
export class AgreementModule {}
