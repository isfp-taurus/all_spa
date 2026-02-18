import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { AuthLoginStoreService } from './auth-login-store.service';
import { AuthLoginStoreModule } from '@lib/store/auth-login';

@NgModule({
  declarations: [],
  providers: [AuthLoginStoreService],
  imports: [CommonModule, AuthLoginStoreModule, EffectsModule.forRoot()],
})
export class AuthLoginStoreServiceModule {}
