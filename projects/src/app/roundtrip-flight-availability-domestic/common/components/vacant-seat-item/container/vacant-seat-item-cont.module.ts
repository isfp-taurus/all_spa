import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VacantSeatItemContComponent } from './vacant-seat-item-cont.component';
import { VacantSeatItemPresModule } from '../presenter/vacant-seat-item-pres.module';
import { FareFamilySelectModalModule } from '../../fare-family-select-modal/fare-family-select-modal.module';
import { SeatMapModalModule } from '../../../components/seat-map-modal/seat-map-modal.module';

/**
 * フライトサマリContModule
 */
@NgModule({
  declarations: [VacantSeatItemContComponent],
  imports: [CommonModule, VacantSeatItemPresModule, FareFamilySelectModalModule, SeatMapModalModule],
  exports: [VacantSeatItemContComponent],
})
export class VacantSeatItemContModule {}
