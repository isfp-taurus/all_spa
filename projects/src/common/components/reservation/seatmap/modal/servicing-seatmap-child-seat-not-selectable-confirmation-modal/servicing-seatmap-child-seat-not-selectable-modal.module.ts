import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import { ServicingSeatmapChildSeatNotSelectableConfirmationModalComponent } from './servicing-seatmap-child-seat-not-selectable-confirmation-modal.component';
import { AirportNameI18nPipeModule } from '@common/pipes/airport-name-i18n/airport-name-i18n.module';

@NgModule({
  declarations: [ServicingSeatmapChildSeatNotSelectableConfirmationModalComponent],
  imports: [CommonModule, StaticMsgModule, ThrottleClickDirectiveModule, AirportNameI18nPipeModule],
})
export class ServicingSeatmapChildSeatNotSelectableConfirmationModalModule {}
