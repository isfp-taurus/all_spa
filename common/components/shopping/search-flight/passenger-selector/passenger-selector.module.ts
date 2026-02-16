import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PassengerSelectorComponent } from './passenger-selector.component';
import { TranslateModule } from '@ngx-translate/core';
import { PassengerSelectorModalModule } from './passenger-selector-modal.module';
import { PassengerSelectorModalService } from './passenger-selector-modal.service';
import { ShoppingLibService } from '@common/services/shopping/shopping-lib/shopping-lib.service';
import { StaticMsgModule } from '@lib/pipes';
import { ValidationErrorModule } from '@lib/components';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [PassengerSelectorComponent],
  imports: [
    CommonModule,
    PassengerSelectorModalModule,
    TranslateModule,
    StaticMsgModule,
    ValidationErrorModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [PassengerSelectorComponent],
  providers: [PassengerSelectorModalService, ShoppingLibService],
})
export class PassengerSelectorModule {}
