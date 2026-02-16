import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FareTypeSelectorModalComponent } from './fare-type-selector-modal.component';
import { ShoppingLibModule } from '@common/services/shopping/shopping-lib/shopping-lib.module';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [FareTypeSelectorModalComponent],
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    ShoppingLibModule,
    StaticMsgModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [FareTypeSelectorModalComponent],
})
export class FareTypeSelectorModalModule {}
