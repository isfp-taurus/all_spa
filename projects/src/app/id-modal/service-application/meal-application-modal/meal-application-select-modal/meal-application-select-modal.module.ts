import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MealApplicationSelectModalComponent } from './meal-application-select-modal.component';
import { AmountFormatModule, DateFormatModule, StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { MealApplicationSelectChargeableComponent } from './meal-application-select-chargeable/meal-application-select-chargeable.component';
import { MealApplicationSelectPreorderComponent } from './meal-application-select-preorder/meal-application-select-preorder.component';
import { MealApplicationSelectSpecialComponent } from './meal-application-select-special/meal-application-select-special.component';
import { ThrottleClickDirectiveModule } from '@lib/directives';
@NgModule({
  declarations: [
    MealApplicationSelectModalComponent,
    MealApplicationSelectChargeableComponent,
    MealApplicationSelectPreorderComponent,
    MealApplicationSelectSpecialComponent,
  ],
  imports: [StaticMsgModule, CommonModule, AmountFormatModule, ThrottleClickDirectiveModule],
  providers: [StaticMsgPipe],
  exports: [MealApplicationSelectModalComponent],
})
export class MealApplicationSelectModalContModule {}
