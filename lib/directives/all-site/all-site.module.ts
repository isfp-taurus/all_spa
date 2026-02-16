import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllSiteDirective } from './all-site.directive';
import { LoginInfoStoreServiceModule } from '@lib/services';

@NgModule({
  declarations: [AllSiteDirective],
  imports: [CommonModule, LoginInfoStoreServiceModule],
  exports: [AllSiteDirective],
})
export class AllSiteDirectiveModule {}
