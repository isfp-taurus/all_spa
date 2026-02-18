import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MealApplicationModalHeaderComponent } from './meal-application-modal-header.component';
import { MealApplicationModalFooterComponent } from './meal-application-modal-footer.component';
import { MealApplicationModalComponent } from './meal-application-modal.component';
import { AmountFormatModule, StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import {
  CancelPrebookServiceModule,
  CartsUpdateServicesStoreServiceModule,
  CurrentCartStoreServiceModule,
  DeliveryInformationStoreServiceModule,
  GetMealStoreServiceModule,
} from '@common/services';
import { ButtonModule } from '@lib/components';
import { DialogDisplayServiceModule, ModalServiceModule } from '@lib/services';
import { MealApplicationModalService } from './meal-application-modal.service';
import { MealApplicationSelectModalContModule } from './meal-application-select-modal/meal-application-select-modal.module';
import { ThrottleClickDirectiveModule, TooltipDirectiveModule } from '@lib/directives';
import { SysdateStoreModule } from '@lib/store';
@NgModule({
  declarations: [
    MealApplicationModalComponent,
    MealApplicationModalHeaderComponent,
    MealApplicationModalFooterComponent,
  ],
  providers: [MealApplicationModalService, StaticMsgPipe],
  imports: [
    MealApplicationSelectModalContModule,
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
    ModalServiceModule,
    AmountFormatModule,
    TooltipDirectiveModule,
    SysdateStoreModule,
    DeliveryInformationStoreServiceModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [MealApplicationModalComponent, MealApplicationModalHeaderComponent, MealApplicationModalFooterComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MealApplicationModalModule {}
