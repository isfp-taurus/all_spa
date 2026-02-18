import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoundtripFlightAvailabilityInternationalPresComponent } from './roundtrip-flight-availability-international-pres.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FareTypeSelectorModule } from '@common/components/shopping/search-flight/fare-type-selector/fare-type-selector.module';
import { SearchFlightAgainModalModule } from 'src/common/components/shopping/search-flight-again/search-flight-again-modal.module';
import { SortConditionModalModule } from '@common/components/shopping/sort-condition/sort-condition-modal.module';
import { FilterConditionModalModule } from '@common/components/shopping/filter-condition/filter-condition-modal.module';
import { SearchResultFunctionModule } from '@common/components/shopping/search-result-function/search-result-function.module';
import { AmountFormatModule, DateFormatModule } from '@lib/pipes';
import { FlightDetailModule } from '@common/components/shopping/flight-detail/flight-detail.module';
import { FlightDetailModalService } from '@common/components/shopping/flight-detail/flight-detail-modal.service';
import { FlightPlanModule } from '@common/components/shopping/flight-plan/flight-plan.module';
import { FareFamilySelectorModalModule } from '../../../common/components/shopping/fare-family-selector/fare-family-selector-modal.module';
import { CheapestCalendarMatrixModalModule } from '../sub-components/cheapest-calendar-matrix/cheapest-calendar-matrix-modal.module';
import { CheapestCalendarMatrixModalService } from '../sub-components/cheapest-calendar-matrix/cheapest-calendar-matrix-modal.service';
import { ModalModule } from '@lib/components';
import { FlightSummaryAndFareFamilyModule } from '@common/components/shopping/flight-summary-and-fare-family/flight-summary-and-fare-family.module';
import { CabinClassSelectorModalModule } from '@common/components/shopping/cabin-class-selector/cabin-class-selector-modal.module';
import { CabinClassSelectorModalService } from '@common/components/shopping/cabin-class-selector/cabin-class-selector-modal.service';
import { FareFamilySelectorModalService } from '../../../common/components/shopping/fare-family-selector/fare-family-selector-modal.service';
import { FilterConditionModalService } from '@common/components/shopping/filter-condition/filter-condition-modal.service';
import { SortConditionModalService } from '@common/components/shopping/sort-condition/sort-condition-modal.service';
import { PaymentDetailModalService } from '@common/components/shopping/payment-detail/payment-detail-modal.service';
import { PaymentDetailModalModule } from '@common/components/shopping/payment-detail/payment-detail-modal.module';
import { CreateCartStoreServiceModule } from '@common/services/api-store/sdk-reservation/create-cart-store/create-cart-store.module';
import { CurrentCartStoreServiceModule } from '@common/services/store/common/current-cart-store/current-cart-store.module';
import { RoundtripFlightAvailabilityInternationalStoreServiceModule } from '@common/services/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.module';
import { AddToFavoriteModule } from '../sub-components/add-to-favorite/add-to-favorite.module';
import { FlightPlanService } from '@common/components/shopping/flight-plan/flight-plan.service';
import { LottieModule } from 'ngx-lottie';
import { CommonSliderModule } from '@common/components/shopping/common-slider/common-slider.module';
import { CriteoAlignmentModule } from '@common/components/shopping/criteo-alignment/criteo-alignment.module';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [RoundtripFlightAvailabilityInternationalPresComponent],
  imports: [
    CommonModule,
    ModalModule,
    ReactiveFormsModule,
    DateFormatModule,
    AmountFormatModule,
    SearchResultFunctionModule,
    FareTypeSelectorModule,
    SortConditionModalModule,
    FilterConditionModalModule,
    SearchFlightAgainModalModule,
    FlightDetailModule,
    FlightPlanModule,
    FareFamilySelectorModalModule,
    CheapestCalendarMatrixModalModule,
    FlightSummaryAndFareFamilyModule,
    CabinClassSelectorModalModule,
    PaymentDetailModalModule,
    CreateCartStoreServiceModule,
    CurrentCartStoreServiceModule,
    RoundtripFlightAvailabilityInternationalStoreServiceModule,
    AddToFavoriteModule,
    FlightPlanModule,
    LottieModule,
    CommonSliderModule,
    CriteoAlignmentModule,
    StaticMsgModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [RoundtripFlightAvailabilityInternationalPresComponent],
  providers: [
    CabinClassSelectorModalService,
    FareFamilySelectorModalService,
    FlightDetailModalService,
    CheapestCalendarMatrixModalService,
    SortConditionModalService,
    FilterConditionModalService,
    PaymentDetailModalService,
    FlightPlanService,
  ],
})
export class RoundtripFlightAvailabilityInternationalPresModule {}
