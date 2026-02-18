import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FarePanelSelectComponent } from './fare-panel-select.component';
import { AmountFormatModule, StaticMsgModule } from '@lib/pipes';
import { CommonSliderModule } from '@common/components/shopping/common-slider/common-slider.module';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [FarePanelSelectComponent],
  exports: [FarePanelSelectComponent],
  providers: [],
  imports: [
    CommonModule,
    TranslateModule,
    AmountFormatModule,
    StaticMsgModule,
    CommonSliderModule,
    ThrottleClickDirectiveModule,
  ],
})
export class FarePanelSelectModule {}
