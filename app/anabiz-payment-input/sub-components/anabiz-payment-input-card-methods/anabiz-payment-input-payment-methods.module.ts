import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnabizPaymentInputPaymentMethodsComponent } from './anabiz-payment-input-payment-methods.component';
import { PopupIndicatorPipeModule, StaticMsgModule } from '@lib/pipes';
import {
  ButtonModule,
  CheckboxModule,
  DebugLanguageSwitchModule,
  IndicatorPopupModule,
  InputModule,
  RadiobuttonModule,
  SelectModule,
  TextTooltipModule,
  ToggleModule,
} from '@lib/components';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogDisplayServiceModule } from '@lib/services';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [AnabizPaymentInputPaymentMethodsComponent],
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
  ],
  exports: [AnabizPaymentInputPaymentMethodsComponent],
})
export class AnabizPaymentInputPaymentMethodsModule {}
