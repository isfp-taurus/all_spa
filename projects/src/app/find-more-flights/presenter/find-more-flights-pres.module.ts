import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FindMoreFlightsPresComponent } from './find-more-flights-pres.component';
import { FilterConditionModalModule } from '@common/components/shopping/filter-condition/filter-condition-modal.module';
import { FilterConditionModalService } from '@common/components/shopping/filter-condition/filter-condition-modal.service';
import { FlightPlanModule, SortConditionModalModule, SortConditionModalService } from '@common/components';
import { TranslateModule } from '@ngx-translate/core';
import { FmFSearchResultModule } from '../sub-components/fmf-search-result/fmf-search-result.module';
import { DateFormatModule, StaticMsgModule } from '@lib/pipes';
import { FindMoreFlightsStoreService } from '@common/services/store/find-more-flights/find-more-flights-store/find-more-flights-store.service';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [FindMoreFlightsPresComponent],
  imports: [
    CommonModule,
    SortConditionModalModule,
    FilterConditionModalModule,
    TranslateModule,
    FlightPlanModule,
    FmFSearchResultModule,
    StaticMsgModule,
    DateFormatModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [FindMoreFlightsPresComponent],
  providers: [DatePipe, SortConditionModalService, FilterConditionModalService, FindMoreFlightsStoreService],
})
export class FindMoreFlightsPresModule {}
