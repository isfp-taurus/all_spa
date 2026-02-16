import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalDateService } from './local-date.service';

@NgModule({
  providers: [LocalDateService],
  imports: [CommonModule],
})
export class LocalDateServiceModule {}
