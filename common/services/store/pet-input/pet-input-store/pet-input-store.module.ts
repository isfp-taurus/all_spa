import { NgModule } from '@angular/core';
import { PetInputStoreModule } from '@common/store';
import { EffectsModule } from '@ngrx/effects';
import { PetInputStoreService } from './pet-input-store.service';

@NgModule({
  providers: [PetInputStoreService],
  imports: [PetInputStoreModule, EffectsModule.forRoot()],
})
export class PetInputStoreServiceModule {}
