import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FareOptionComponent } from './fare-option.component';
import { ThrottleClickDirectiveModule } from '@lib/directives';
@NgModule({
  declarations: [FareOptionComponent],
  imports: [CommonModule, TranslateModule, ThrottleClickDirectiveModule],
  exports: [FareOptionComponent],
  providers: [],
})
export class FareOptionModule {}
