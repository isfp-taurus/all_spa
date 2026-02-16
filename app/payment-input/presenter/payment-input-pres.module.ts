import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FareConditionDetailsModalModule } from '@common/components/reservation/plan-review/fare-condition-details/fare-condition-details.module';
import { DeliveryInformationStoreServiceModule, OrdersPaymentRecordsStoreServiceModule } from '@common/services';
import { PlanListServiceModule } from '@common/services/plan-list/plan-list.module';
import {
  AgreementAreaModule,
  ButtonModule,
  CheckboxModule,
  DebugLanguageSwitchModule,
  IndicatorPopupModule,
  InputModule,
  RadiobuttonModule,
  RangeSliderModule,
  SelectDateYmModule,
  SelectModule,
  TextTooltipModule,
  ToggleModule,
} from '@lib/components';
import { ThrottleClickDirectiveModule, TooltipDirectiveModule } from '@lib/directives';
import { PopupIndicatorPipeModule } from '@lib/pipes';
import { DialogDisplayServiceModule } from '@lib/services';
import { TranslateModule } from '@ngx-translate/core';
import { StaticMsgModule } from '../../../lib/pipes/static-msg/static-msg.module';
import {
  PaymentInputAlipayModule,
  PaymentInputCardHolderInfoModule,
  PaymentInputCardInfoModule,
  PaymentInputCardSelectingModule,
  PaymentInputConvenienceStoreModule,
  PaymentInputCreditCardModule,
  PaymentInputCreditCardReceiptModule,
  PaymentInputInternetBankingModule,
  PaymentInputKeepMyFareModule,
  PaymentInputPaymentAmountModule,
  PaymentInputPaymentMethodsModule,
  PaymentInputPaypalModule,
  PaymentInputSkyCoinBallancesModule,
  PaymentInputSkyCoinModule,
  PaymentInputSkyCoinSummaryModule,
  PaymentInputSkyCoinUsageModule,
  PaymentInputUnionpayModule,
} from '../sub-components';
import { PaymentInputPresComponent } from './payment-input-pres.component';
import { PaymentInputPayEasyModule } from '../sub-components/payment-input-pay-easy/payment-input-pay-easy.module';
import { PaymentInputShareholderCouponModule } from '../sub-components/payment-input-shareholder-coupon/payment-input-shareholder-coupon.module';

@NgModule({
  declarations: [PaymentInputPresComponent],
  exports: [PaymentInputPresComponent],
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
    InputModule,
    FormsModule,
    ReactiveFormsModule,
    RadiobuttonModule,
    ToggleModule,
    TextTooltipModule,
    TooltipDirectiveModule,
    CheckboxModule,
    SelectModule,
    RangeSliderModule,
    OverlayModule,
    SelectDateYmModule,
    DebugLanguageSwitchModule,
    IndicatorPopupModule,
    PopupIndicatorPipeModule,
    DialogDisplayServiceModule,
    ThrottleClickDirectiveModule,
    OrdersPaymentRecordsStoreServiceModule,
    DeliveryInformationStoreServiceModule,
    PlanListServiceModule,
    AgreementAreaModule,
    StaticMsgModule,
    //ここから切り分け
    PaymentInputCreditCardModule,
    PaymentInputCardSelectingModule,
    PaymentInputCardInfoModule,
    PaymentInputCardHolderInfoModule,
    PaymentInputCreditCardReceiptModule,
    PaymentInputSkyCoinModule,
    PaymentInputSkyCoinBallancesModule,
    PaymentInputSkyCoinSummaryModule,
    PaymentInputSkyCoinUsageModule,
    PaymentInputPaymentMethodsModule,
    PaymentInputAlipayModule,
    PaymentInputConvenienceStoreModule,
    PaymentInputInternetBankingModule,
    PaymentInputPaypalModule,
    PaymentInputUnionpayModule,
    PaymentInputKeepMyFareModule,
    PaymentInputPaymentAmountModule,
    FareConditionDetailsModalModule,
    PaymentInputPayEasyModule,
    PaymentInputShareholderCouponModule,
  ],
})
export class PaymentInputPresModule {}
