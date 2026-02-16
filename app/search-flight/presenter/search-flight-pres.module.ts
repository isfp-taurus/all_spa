import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SearchFlightPresComponent } from './search-flight-pres.component';
import { SearchFlightBodyContModule } from '@common/components/shopping/search-flight/search-flight-body/container/search-flight-body-cont.module';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [SearchFlightPresComponent],
  exports: [SearchFlightPresComponent],
  imports: [CommonModule, TranslateModule, SearchFlightBodyContModule, StaticMsgModule, ThrottleClickDirectiveModule],
})
export class SearchFlightPresModule {}
