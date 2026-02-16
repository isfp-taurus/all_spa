import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AmountFormatModule, DateFormatModule, StaticMsgModule } from '@lib/pipes';
import { NextActionComponent } from './next-action.component';
import { AcknowledgeComponent } from './sub-actions/acknowledge/acknowledge.component';
import { AdvanceSeatSelectionComponent } from './sub-actions/advance-seat-selection/advance-seat-selection.component';
import { ImmigrationInformationRegistrationComponent } from './sub-actions/immigration-information-registration/immigration-information-registration.component';
import { OnlineCheckInComponent } from './sub-actions/online-check-in/online-check-in.component';
import { PaymentComponent } from './sub-actions/payment/payment.component';
import { RegisterEmailComponent } from './sub-actions/register-email/register-email.component';
import { RegisterEvidenceDisabledPersonsComponent } from './sub-actions/register-evidence-disabled-person/register-evidence-disabled-person.component';
import { RegisterEvidenceIslandComponent } from './sub-actions/register-evidence-island/register-evidence-island.component';
import { SelfReaccommodationComponent } from './sub-actions/self-reaccommodation/self-reaccommodation.component';
import { TicketingComponent } from './sub-actions/ticketing/ticketing.component';
import { JuniorPilotComponent } from './sub-actions/junior-pilot/junior-pilot.component';
import { PaymentMethodModalModule } from './sub-components/payment-method-modal';
import { NextActionItemComponent } from './sub-components/next-action-item/next-action-item.component';
import { NextActionItemContentComponent } from './sub-components/next-action-item-content/next-action-item-content.component';
import { NextActionItemContentAttentionComponent } from './sub-components/next-action-item-content-attention/next-action-item-content-attention.component';
import { NextActionItemContentDirective } from './sub-directives/next-action-item-content.directive';
import { NextActionItemContentAttentionDirective } from './sub-directives/next-action-item-content-attention.directive';

@NgModule({
  declarations: [
    NextActionComponent,
    RegisterEmailComponent,
    PaymentComponent,
    TicketingComponent,
    AcknowledgeComponent,
    SelfReaccommodationComponent,
    OnlineCheckInComponent,
    AdvanceSeatSelectionComponent,
    ImmigrationInformationRegistrationComponent,
    RegisterEvidenceDisabledPersonsComponent,
    RegisterEvidenceIslandComponent,
    JuniorPilotComponent,
    NextActionItemComponent,
    NextActionItemContentComponent,
    NextActionItemContentAttentionComponent,
    NextActionItemContentDirective,
    NextActionItemContentAttentionDirective,
  ],
  imports: [CommonModule, StaticMsgModule, AmountFormatModule, DateFormatModule, PaymentMethodModalModule],
  exports: [NextActionComponent],
})
export class NextActionModule {}
