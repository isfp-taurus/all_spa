import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { PasswordInputAuthLoginStoreService } from './password-input-auth-login-store.service';
import { AuthLoginStoreModule } from '../../../lib/store/auth-login/auth-login.module';

@NgModule({
  declarations: [],
  providers: [PasswordInputAuthLoginStoreService],
  imports: [CommonModule, AuthLoginStoreModule, EffectsModule.forRoot()],
})
export class PasswordInputAuthLoginStoreServiceModule {}
