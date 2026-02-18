import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DateFormatPipe } from './date-format.pipe';

@NgModule({
  declarations: [DateFormatPipe],
  providers: [DatePipe],
  imports: [CommonModule],
  exports: [DateFormatPipe],
})
export class DateFormatModule {}
