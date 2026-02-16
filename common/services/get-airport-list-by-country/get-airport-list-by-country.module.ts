import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetAirportListByCountryService } from './get-airport-list-by-country.service';

@NgModule({
  providers: [GetAirportListByCountryService],
  imports: [CommonModule],
})
export class GetAirportListByCountryServiceModule {}
