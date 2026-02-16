import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AmountFormatModule, StaticMsgModule } from '@lib/pipes';
import { SupportInformationInputComponent } from './support-information-input.component';
import { SupportInformationInputFoldingTypeComponent } from './support-information-input-folding-type/support-information-input-folding-type.component';
import { SupportInformationInputSpecialAssistanceComponent } from './support-information-input-special-assistance/support-information-input-special-assistance.component';
import { SupportInformationInputWalkingAbilityComponent } from './support-information-input-walking-ability/support-information-input-walking-ability.component';
import { SupportInformationInputWheelchairTypeComponent } from './support-information-input-wheelchair-type/support-information-input-wheelchair-type.component';
import { SupportInformationInputWheelchairsComponent } from './support-information-input-wheelchairs/support-information-input-wheelchairs.component';
import {
  ButtonModule,
  CheckboxModule,
  InputModule,
  SelectDateYmdModule,
  SelectModule,
  TextTooltipModule,
  ValidationErrorModule,
} from '@lib/components';
import { AswMasterStoreModule, SysdateStoreModule } from '@lib/store';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SupportInformationInputStoreServiceModule } from '@common/services';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import { AlertMessageModule } from '@lib/components/shared-ui-components/alert-area/alert-message/alert-message.module';

@NgModule({
  declarations: [
    SupportInformationInputComponent,
    SupportInformationInputFoldingTypeComponent,
    SupportInformationInputSpecialAssistanceComponent,
    SupportInformationInputWalkingAbilityComponent,
    SupportInformationInputWheelchairTypeComponent,
    SupportInformationInputWheelchairsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    AmountFormatModule,
    StaticMsgModule,
    ButtonModule,
    InputModule,
    SelectModule,
    CheckboxModule,
    TextTooltipModule,
    AswMasterStoreModule,
    SupportInformationInputStoreServiceModule,
    ValidationErrorModule,
    SysdateStoreModule,
    SelectDateYmdModule,
    ThrottleClickDirectiveModule,
    AlertMessageModule,
  ],
  exports: [SupportInformationInputComponent],
})
export class SupportInformationInputModule {}
