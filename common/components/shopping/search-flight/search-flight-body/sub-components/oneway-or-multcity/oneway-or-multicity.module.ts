import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { OnewayOrMultiCityComponent } from './oneway-or-multicity.component';
import { AirportModule, ToggleModule, CheckboxModule, InputModule, SelectModule } from '@lib/components';
import { DateSelectorModule } from '@lib/components';
import { ModalModule } from '@lib/components/shared-ui-components/modal/modal.module';
import { FareTypeSelectorModule } from '@common/components/shopping/search-flight/fare-type-selector/fare-type-selector.module';
import { OtherBookingPassengerModalModule } from '@common/components/shopping/search-flight/other-booking-passenger/other-booking-passenger-modal.module';
import { PassengerSelectorModule } from '@common/components/shopping/search-flight/passenger-selector/passenger-selector.module';
import { RangeSliderModule } from '@lib/components/base-ui-components/form/range-slider/range-slider.module';
import { StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [OnewayOrMultiCityComponent],
  exports: [OnewayOrMultiCityComponent],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    AirportModule,
    DateSelectorModule,
    CheckboxModule,
    ToggleModule,
    SelectModule,
    RangeSliderModule,
    InputModule,
    ModalModule,
    FareTypeSelectorModule,
    OtherBookingPassengerModalModule,
    PassengerSelectorModule,
    StaticMsgModule,
  ],
})
export class OnewayOrMulticityModule {}
