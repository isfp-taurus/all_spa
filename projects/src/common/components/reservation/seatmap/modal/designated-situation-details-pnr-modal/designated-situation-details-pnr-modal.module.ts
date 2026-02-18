import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DesignatedSituationDetailsPnrModalComponent } from './designated-situation-details-pnr-modal.component';
import { StaticMsgModule } from '@lib/pipes';
import { DateFormatModule } from '@lib/pipes/date-format/date-format.module';
import { AmountFormatModule } from '@lib/pipes/amount-format/amount-format.module';
import { DialogModule } from '@lib/components';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import { AirportNameI18nPipeModule } from '@common/pipes/airport-name-i18n/airport-name-i18n.module';
import { DesignedSituationDetailsPnrModalService } from './designated-situation-details-pnr-modal.service';
@NgModule({
  providers: [DesignedSituationDetailsPnrModalService],
  declarations: [DesignatedSituationDetailsPnrModalComponent],
  exports: [DesignatedSituationDetailsPnrModalComponent],
  imports: [
    StaticMsgModule,
    CommonModule,
    DateFormatModule,
    AmountFormatModule,
    DialogModule,
    ThrottleClickDirectiveModule,
    AirportNameI18nPipeModule,
  ],
})
export class DesignatedSituationDetailsPnrModalModule {}
