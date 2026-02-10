import { NgModule } from '@angular/core'; 
import { CommonModule } from '@angular/common' ;
import { PaymentInputContComponent } from './payment-input-cont.component';
import { RouterModule } from '@angular/router';
import { PaymentInputPresModule } from '../presenter/payment-input-pres.module';
import { PasswordInputModule } from '@common/components/reservation/id-modal/password-input';
import {
CurrentCartStoreServiceModule, 
DeliveryInformationStoreServiceModule, 
GetOrderStoreServiceModule, 
GetMemberInformationStoreServiceModule, 
OrdersRepriceOrderStoreServiceModule, 
PaymentInputStoreServiceModule, 
PlansCreatePlansStoreServiceModule, 
RefreshAmcmemberBalanceStoreServiceModule,
} from '@common/services';
import { AmcLoginModule } from '@lib/components/shared-ui-components/amc-login'; 
import { PaymentTermsModule } from '../sub-components/modal/payment-terms';
import { PaymentDetailsModule } from '../sub-components/modal/payment-details';
import { GetAwardUsersStoreServiceModule } from '@lib/services';
import { UseCouponsModule } from '../sub-components/modal/use-coupons';
import { LinkUrlModule, LinkUrlPipe, StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
@NgModule({
declarations: [PaymentInputContComponent], 
imports: [
RouterModule. forChild([{path: '', component: PaymentInputContComponent }]), 
CommonModule, 
PaymentInputPresModule, 
PasswordInputModule, 
AmcLoginModule,
UseCouponsModule,
PaymentTermsModule,
GetOrderStoreServiceModule, 
CurrentCartStoreServiceModule, 
DeliveryInformationStoreServiceModule, 
RefreshAmcmemberBalanceStoreServiceModule,
PlansCreatePlansStoreServiceModule, 
OrdersRepriceOrderStoreServiceModule, 
PaymentInputStoreServiceModule, 
GetAwardUsersStoreServiceModule, 
PaymentDetailsModule, 
StaticMsgModule,
LinkUrlModule, 
GetMemberInformationStoreServiceModule,
],
exports: [PaymentInputContComponent], 
providers: [StaticMsgPipe, LinkUrlPipe],
})
export class PaymentInputContModule {}