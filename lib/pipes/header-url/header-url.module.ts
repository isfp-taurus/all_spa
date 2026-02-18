import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HeaderUrlPipe } from './header-url.pipe';

@NgModule({
  declarations: [HeaderUrlPipe],
  imports: [CommonModule],
  exports: [HeaderUrlPipe],
})
export class HeaderUrlModule {}
