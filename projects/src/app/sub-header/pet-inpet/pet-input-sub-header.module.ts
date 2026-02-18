import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StaticMsgModule } from '@lib/pipes';
import { PetInputSubHeaderComponent } from './pet-input-sub-header.component';
import { PetInputStoreServiceModule } from '@common/services';

@NgModule({
  declarations: [PetInputSubHeaderComponent],
  imports: [CommonModule, TranslateModule, StaticMsgModule, PetInputStoreServiceModule],
  exports: [PetInputSubHeaderComponent],
})
export class PetInputSubHeaderModule {}
