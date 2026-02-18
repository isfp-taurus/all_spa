import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UseCouponsComponent } from './use-coupons.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, InputModule } from '@lib/components';
import { UseCouponsService } from './use-coupons.service';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [UseCouponsComponent],
  providers: [UseCouponsService],
  exports: [UseCouponsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    InputModule,
    ButtonModule,
    ThrottleClickDirectiveModule,
    StaticMsgModule,
  ],
})
export class UseCouponsModule {}
