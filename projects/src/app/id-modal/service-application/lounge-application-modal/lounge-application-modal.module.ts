import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LoungeApplicationModalHeaderComponent } from './lounge-application-modal-header.component';
import { LoungeApplicationModalFooterComponent } from './lounge-application-modal-footer.component';
import { LoungeApplicationModalComponent } from './lounge-application-modal.component';
import { AmountFormatModule, StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { DialogDisplayServiceModule } from '@lib/services';
import { ButtonModule } from '@lib/components';
import { CancelPrebookServiceModule } from '@common/services/cancel-prebook/cancel-prebook.module';
import { LoungeApplicationModalService } from './lounge-application-modal.service';
import {
  CartsUpdateServicesStoreServiceModule,
  CurrentCartStoreServiceModule,
  DeliveryInformationStoreServiceModule,
  GetMealStoreServiceModule,
} from '@common/services';
import { TooltipDirectiveModule } from '@lib/directives';
@NgModule({
  declarations: [
    LoungeApplicationModalComponent,
    LoungeApplicationModalHeaderComponent,
    LoungeApplicationModalFooterComponent,
  ],
  providers: [LoungeApplicationModalService, StaticMsgPipe],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    StaticMsgModule,
    DialogDisplayServiceModule,
    CurrentCartStoreServiceModule,
    ButtonModule,
    CancelPrebookServiceModule,
    CartsUpdateServicesStoreServiceModule,
    GetMealStoreServiceModule,
    AmountFormatModule,
    TooltipDirectiveModule,
    DeliveryInformationStoreServiceModule,
  ],
  exports: [
    LoungeApplicationModalComponent,
    LoungeApplicationModalHeaderComponent,
    LoungeApplicationModalFooterComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoungeApplicationModalModule {}
