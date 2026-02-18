import { CommonModule, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { MilesFormatPipe } from './miles-format.pipe';

@NgModule({
  declarations: [MilesFormatPipe],
  providers: [MilesFormatPipe, DecimalPipe],
  imports: [CommonModule],
  exports: [MilesFormatPipe],
})
export class MilesFormatModule {}
