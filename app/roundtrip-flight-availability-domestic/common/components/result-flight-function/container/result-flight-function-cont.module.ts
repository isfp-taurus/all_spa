import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultFlightFunctionContComponent } from './result-flight-function-cont.component';
import { ResultFlightFunctionPresModule } from '../presenter/result-flight-function-pres.module';
import { FilterFlightModalModule } from '../../../components/filter-flight-modal/filter-flight-modal.module';
import { SortModalModule } from '../../../components/sort-modal/sort-modal.module';
import { FareOptionModalModule } from '../../../components/fare-option-modal/fare-option-modal.module';

/**
 * 検索結果操作部ContModule
 */
@NgModule({
  declarations: [ResultFlightFunctionContComponent],
  imports: [
    CommonModule,
    ResultFlightFunctionPresModule,
    FilterFlightModalModule,
    SortModalModule,
    FareOptionModalModule,
  ],
  exports: [ResultFlightFunctionContComponent],
})
export class ResultFlightFunctionContModule {}
