import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CabinClassSelectorModalComponent } from './cabin-class-selector-modal.component';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [CabinClassSelectorModalComponent],
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, StaticMsgModule, ThrottleClickDirectiveModule],
  exports: [CabinClassSelectorModalComponent],
})
export class CabinClassSelectorModalModule {}
