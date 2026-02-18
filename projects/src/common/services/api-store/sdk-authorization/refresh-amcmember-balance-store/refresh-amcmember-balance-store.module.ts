import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { RefreshAmcmemberBalanceStoreModule } from '@common/store/refresh-amcmember-balance';
import { RefreshAmcmemberBalanceStoreService } from './refresh-amcmember-balance-store.service';

@NgModule({
  providers: [RefreshAmcmemberBalanceStoreService],
  imports: [RefreshAmcmemberBalanceStoreModule, EffectsModule.forRoot()],
})
export class RefreshAmcmemberBalanceStoreServiceModule {}
