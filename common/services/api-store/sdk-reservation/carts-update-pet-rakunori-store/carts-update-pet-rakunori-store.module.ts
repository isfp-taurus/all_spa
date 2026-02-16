import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { CartsUpdatePetRakunoriStoreService } from './carts-update-pet-rakunori-store.service';
import { CartsUpdatePetRakunoriStoreModule } from '../../../../store/carts-update-pet-rakunori/carts-update-pet-rakunori.module';

@NgModule({
  providers: [CartsUpdatePetRakunoriStoreService],
  imports: [CartsUpdatePetRakunoriStoreModule, EffectsModule.forRoot()],
})
export class CartsUpdatePetRakunoriStoreServiceModule {}
