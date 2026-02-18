import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { AmountFormatPipe } from './amount-format.pipe';

@NgModule({
  declarations: [AmountFormatPipe],
  providers: [CurrencyPipe],
  imports: [CommonModule],
  exports: [AmountFormatPipe],
})
export class AmountFormatModule {}
