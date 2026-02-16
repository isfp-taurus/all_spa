import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonModule,
  CheckboxModule,
  DebugLanguageSwitchModule,
  IndicatorPopupModule,
  InputModule,
  RadiobuttonModule,
  SelectModule,
  ToggleModule,
  TextTooltipModule,
} from '@lib/components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { PopupIndicatorPipeModule, StaticMsgModule } from '@lib/pipes';
import { DialogDisplayServiceModule } from '@lib/services';
import { PaymentInputPaymentMethodsComponent } from './payment-input-payment-methods.component';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [PaymentInputPaymentMethodsComponent],
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
    InputModule,
    FormsModule,
    ReactiveFormsModule,
    RadiobuttonModule,
    ToggleModule,
    TextTooltipModule,
    CheckboxModule,
    SelectModule,
    OverlayModule,
    DebugLanguageSwitchModule,
    IndicatorPopupModule,
    PopupIndicatorPipeModule,
    DialogDisplayServiceModule,
    StaticMsgModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [PaymentInputPaymentMethodsComponent],
})
export class PaymentInputPaymentMethodsModule {}
