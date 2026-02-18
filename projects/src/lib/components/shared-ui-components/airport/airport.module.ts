import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AirportComponent } from './airport.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AirportRoundComponent } from './airport-round.component';
import { TranslateModule } from '@ngx-translate/core';
import { StaticMsgModule } from '../../../pipes';
import { ValidationErrorModule } from '../../../components/base-ui-components/form/validation-error/validation-error.module';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    StaticMsgModule,
    ValidationErrorModule,
    ThrottleClickDirectiveModule,
  ],
  declarations: [AirportComponent, AirportRoundComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [AirportComponent, AirportRoundComponent],
})
export class AirportModule {}
