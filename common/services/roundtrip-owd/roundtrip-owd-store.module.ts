import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { RoundtripOwdStoreModule } from '@common/store/roundtrip-owd';
import { RoundtripOwdService } from './roundtrip-owd-store.service';

@NgModule({
  providers: [RoundtripOwdService],
  imports: [RoundtripOwdStoreModule, EffectsModule.forRoot()],
})
export class RoundtripOwdStoreServiceModule {}
