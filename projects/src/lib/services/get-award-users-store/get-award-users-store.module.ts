import { NgModule } from '@angular/core';
import { GetAwardUsersStoreModule } from '../../store';
import { EffectsModule } from '@ngrx/effects';
import { GetAwardUsersStoreService } from './get-award-users-store.service';

@NgModule({
  providers: [GetAwardUsersStoreService],
  imports: [GetAwardUsersStoreModule, EffectsModule.forRoot()],
})
export class GetAwardUsersStoreServiceModule {}
