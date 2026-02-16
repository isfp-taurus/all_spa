import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnabizPaymentInputPresComponent } from './anabiz-payment-input-pres.component';
import { StaticMsgModule, LinkUrlModule } from '@lib/pipes';
import { PaymentInputPaymentAmountModule } from '../../payment-input';
import { AnabizPaymentInputPaymentMethodsModule } from '../sub-components/anabiz-payment-input-payment-methods';
import { AnabizPaymentInputCardSelectingModule } from '../sub-components/anabiz-payment-input-card-selecting/anabiz-payment-input-card-selecting.module';
import { AgreementAreaModule, ButtonModule } from '@lib/components';
import { AnabizPaymentInputCardInfoModule } from '../sub-components/anabiz-payment-input-card-info/anabiz-payment-input-card-info.module';
import { AnabizPaymentInputCardHolderModule } from '../sub-components/anabiz-payment-input-card-holder/anabiz-payment-input-card-holder.module';
import { PaymentInputShareholderCouponModule } from '../../payment-input/sub-components/payment-input-shareholder-coupon/payment-input-shareholder-coupon.module';
import { DeliveryInformationStoreServiceModule, GetCreditPanInformationServiceModule } from '@common/services';
import { PaymentDetailsModule } from '../../payment-input/sub-components/modal/payment-details';
import { ModalServiceModule } from '@lib/services';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [AnabizPaymentInputPresComponent],
  exports: [AnabizPaymentInputPresComponent],
  imports: [
    AgreementAreaModule,
    CommonModule,
    StaticMsgModule,
    ButtonModule,
    LinkUrlModule,
    PaymentInputPaymentAmountModule,
    DeliveryInformationStoreServiceModule,
    GetCreditPanInformationServiceModule,
    AnabizPaymentInputPaymentMethodsModule,
    AgreementAreaModule,
    AnabizPaymentInputCardSelectingModule,
    AnabizPaymentInputCardHolderModule,
    AnabizPaymentInputCardInfoModule,
    PaymentInputShareholderCouponModule,
    PaymentDetailsModule,
    ModalServiceModule,
    ThrottleClickDirectiveModule,
  ],
})
export class AnabizPaymentInputPresModule {}
