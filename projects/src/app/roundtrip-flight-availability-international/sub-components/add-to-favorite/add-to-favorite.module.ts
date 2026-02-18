import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AddToFavoriteComponent } from './add-to-favorite.component';
import { LottieModule } from 'ngx-lottie';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [AddToFavoriteComponent],
  imports: [CommonModule, TranslateModule, LottieModule, StaticMsgModule, ThrottleClickDirectiveModule],
  exports: [AddToFavoriteComponent],
  providers: [],
})
export class AddToFavoriteModule {}
