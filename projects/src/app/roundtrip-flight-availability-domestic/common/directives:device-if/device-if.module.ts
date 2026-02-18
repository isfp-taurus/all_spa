import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DeviceIfDirective } from './device-if.directive';
import { LayoutModule } from '@angular/cdk/layout';

/**
 * DeviceIfDirectiveModule
 */
@NgModule({
  imports: [CommonModule, LayoutModule],
  declarations: [DeviceIfDirective],
  exports: [DeviceIfDirective],
})
export class DeviceIfDirectiveModule {}
