import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeatMapModalComponent } from './seat-map-modal.component';
import { SeatMapModalService } from './seat-map-modal.service';
import { BaseModalModule } from '../base-modal/base-modal.module';
import { StaticMsgModule } from '@lib/pipes';
import { IndicatorPopupModule } from '@lib/components';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import { DeviceIfDirectiveModule } from '../../directives';
import { DateFormatModule } from '@lib/pipes/date-format/date-format.module';

/**
 * 運賃別シートマップ表示モーダルModule
 */
@NgModule({
  declarations: [SeatMapModalComponent],
  providers: [SeatMapModalService],
  imports: [
    CommonModule,
    BaseModalModule,
    StaticMsgModule,
    IndicatorPopupModule,
    ThrottleClickDirectiveModule,
    DeviceIfDirectiveModule,
    DateFormatModule,
  ],
})
export class SeatMapModalModule {}
