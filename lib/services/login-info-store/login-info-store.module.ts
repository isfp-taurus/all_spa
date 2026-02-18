import { NgModule } from '@angular/core';
import { GetEncryptedLoginInfoStoreModule } from '@lib/store';
import { EffectsModule } from '@ngrx/effects';
import { LoginInfoStoreService } from './login-info-store.service';

@NgModule({
  providers: [LoginInfoStoreService],
  declarations: [],
  imports: [GetEncryptedLoginInfoStoreModule, EffectsModule.forRoot()],
})
export class LoginInfoStoreServiceModule {}
