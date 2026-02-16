import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchFlightContComponent } from './search-flight-cont.component';
import { SearchFlightPresModule } from '../presenter';
import { RouterModule } from '@angular/router';
import { ShoppingLibModule } from '@common/services/shopping/shopping-lib/shopping-lib.module';

@NgModule({
  declarations: [SearchFlightContComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: SearchFlightContComponent }]),
    CommonModule,
    ShoppingLibModule,
    SearchFlightPresModule,
  ],
  exports: [SearchFlightContComponent],
})
export class SearchFlightContModule {}
