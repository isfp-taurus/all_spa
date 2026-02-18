import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { RoundtripOwdDisplayStoreModule } from '@common/store/roundtrip-owd-display';
import { RoundtripOwdDisplayService } from './roundtrip-owd-display-store.service';

@NgModule({
  providers: [RoundtripOwdDisplayService],
  imports: [RoundtripOwdDisplayStoreModule, EffectsModule.forRoot()],
})
export class RoundtripOwdDisplayStoreServiceModule {}
