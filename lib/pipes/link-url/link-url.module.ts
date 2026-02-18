import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LinkUrlPipe } from './link-url.pipe';

@NgModule({
  declarations: [LinkUrlPipe],
  imports: [CommonModule],
  exports: [LinkUrlPipe],
})
export class LinkUrlModule {}
