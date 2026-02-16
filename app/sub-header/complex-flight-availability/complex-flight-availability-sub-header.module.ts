import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StaticMsgModule } from '@lib/pipes';
import { ComplexFlightAvailabilityHeaderComponent } from './complex-flight-availability-sub-header.component';
import { ComplexFlightAvailabilityTeleportService } from '@app/complex-flight-availability/service/teleport.service';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [ComplexFlightAvailabilityHeaderComponent],
  imports: [CommonModule, StaticMsgModule, ThrottleClickDirectiveModule],
  providers: [ComplexFlightAvailabilityTeleportService],
  exports: [ComplexFlightAvailabilityHeaderComponent],
})
export class ComplexFlightAvailabilityModule {}
