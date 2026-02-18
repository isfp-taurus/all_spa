import { NgModule } from '@angular/core';
import { AswContextStoreModule } from '../../store';
import { EffectsModule } from '@ngrx/effects';
import { AswContextStoreService } from './asw-context-store.service';

@NgModule({
  providers: [AswContextStoreService],
  imports: [AswContextStoreModule, EffectsModule.forRoot()],
})
export class AswContextStoreServiceModule {}
