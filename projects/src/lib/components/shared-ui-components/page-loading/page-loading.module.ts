import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageLoadingComponent } from './page-loading.component';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import { StaticMsgModule } from '../../../pipes';

export function playerFactory() {
  return player;
}

/**
 * [SharedUI] ローディング画面Module
 */
@NgModule({
  declarations: [PageLoadingComponent],
  imports: [CommonModule, StaticMsgModule, LottieModule.forRoot({ player: playerFactory })],
  exports: [PageLoadingComponent],
})
export class PageLoadingModule {}
