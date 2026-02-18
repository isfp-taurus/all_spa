import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetaUrlPipe } from './meta-url.pipe';

@NgModule({
  declarations: [MetaUrlPipe],
  imports: [CommonModule],
  exports: [MetaUrlPipe],
})
export class MetaUrlModule {}
