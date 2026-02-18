import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchResultFunctionComponent } from './search-result-function.component';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchResultFunctionItemModule } from './search-result-function-item/search-result-function-item.module';
import { StaticMsgModule } from '@lib/pipes';
import { CacheGetServiceModule } from '@common/services/cache-get/cache-get.module';
import { LottieModule } from 'ngx-lottie';
import { CommonSliderModule } from '@common/components/shopping/common-slider/common-slider.module';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [SearchResultFunctionComponent],
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    SearchResultFunctionItemModule,
    StaticMsgModule,
    CacheGetServiceModule,
    LottieModule,
    CommonSliderModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [SearchResultFunctionComponent],
})
export class SearchResultFunctionModule {}
