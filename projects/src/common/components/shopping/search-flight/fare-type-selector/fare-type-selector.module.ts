import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FareTypeSelectorComponent } from './fare-type-selector.component';
import { TranslateModule } from '@ngx-translate/core';
import { FareTypeSelectorModalService } from './fare-type-selector-modal.service';
import { FareTypeSelectorModalModule } from './fare-type-selector-modal.module';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [FareTypeSelectorComponent],
  imports: [CommonModule, TranslateModule, FareTypeSelectorModalModule, StaticMsgModule, ThrottleClickDirectiveModule],
  exports: [FareTypeSelectorComponent],
  providers: [FareTypeSelectorModalService],
})
export class FareTypeSelectorModule {}
