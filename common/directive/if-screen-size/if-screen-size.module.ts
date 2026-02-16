import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IfScreenSizeDirective } from './if-screen-size.directive';

@NgModule({
  declarations: [IfScreenSizeDirective],
  imports: [CommonModule],
  exports: [IfScreenSizeDirective],
})
export class IfScreenSizeModule {}
