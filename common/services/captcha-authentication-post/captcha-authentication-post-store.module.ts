import { NgModule } from '@angular/core';
import { CaptchaAuthenticationPostStoreModule } from '@common/store/captcha-authentication-post';
import { CaptchaAuthenticationPostService } from './captcha-authentication-post-store.service';

@NgModule({
  providers: [CaptchaAuthenticationPostService],
  imports: [CaptchaAuthenticationPostStoreModule],
})
export class CaptchaAuthenticationPostModule {}
