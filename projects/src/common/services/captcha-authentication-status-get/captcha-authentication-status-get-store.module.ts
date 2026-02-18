import { NgModule } from '@angular/core';
import { CaptchaAuthenticationStatusGetStoreModule } from '@common/store/Captcha-authentication-status-get';
import { CaptchaAuthenticationStatusGetStoreService } from './captcha-authentication-status-get-store.service';

@NgModule({
  providers: [CaptchaAuthenticationStatusGetStoreService],
  imports: [CaptchaAuthenticationStatusGetStoreModule],
})
export class CaptchaAuthenticationStatusGetStoreServiceModule {}
