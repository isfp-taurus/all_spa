import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BaggageApplicationModalHeaderComponent } from './baggage-application-modal-header.component';
import { BaggageApplicationModalFooterComponent } from './baggage-application-modal-footer.component';
import { BaggageApplicationModalComponent } from './baggage-application-modal.component';
import { AmountFormatModule, StaticMsgModule } from '@lib/pipes';
import { ButtonModule } from '@lib/components';
import {
  CurrentCartStoreServiceModule,
  CancelPrebookServiceModule,
  CartsUpdateServicesStoreServiceModule,
  DeliveryInformationStoreServiceModule,
} from '@common/services';
import { DialogDisplayServiceModule } from '@lib/services';
import { BaggageApplicationModalService } from './baggage-application-modal.service';
import { TooltipDirectiveModule } from '@lib/directives';
@NgModule({
  declarations: [
    BaggageApplicationModalComponent,
    BaggageApplicationModalHeaderComponent,
    BaggageApplicationModalFooterComponent,
  ],
  providers: [BaggageApplicationModalService],
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
    AmountFormatModule,
    TooltipDirectiveModule,
    DeliveryInformationStoreServiceModule,
  ],
  exports: [
    BaggageApplicationModalComponent,
    BaggageApplicationModalHeaderComponent,
    BaggageApplicationModalFooterComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BaggageApplicationModalModule {}
