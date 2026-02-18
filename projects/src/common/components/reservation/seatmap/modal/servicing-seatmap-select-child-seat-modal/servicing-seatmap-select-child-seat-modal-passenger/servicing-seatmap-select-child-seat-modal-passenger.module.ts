import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicingSeatmapSelectChildSeatModalPassengerComponent } from './servicing-seatmap-select-child-seat-modal-passenger.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule, RadiobuttonModule } from '@lib/components';
import { StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [ServicingSeatmapSelectChildSeatModalPassengerComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CheckboxModule, RadiobuttonModule, StaticMsgModule],
  exports: [ServicingSeatmapSelectChildSeatModalPassengerComponent],
})
export class ServicingSeatmapSelectChildSeatModalPassengerModule {}
