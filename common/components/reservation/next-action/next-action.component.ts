import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GetOrderResponseData } from 'src/sdk-servicing';
import { Subscription } from 'rxjs';
import { NEXT_ACTION_LOAD_MASTERS } from '@common/services/next-action/master/next-action-master';
import { AswMasterService } from '@lib/services/asw-master/asw-master.service';

@Component({
  selector: 'asw-next-action',
  templateUrl: './next-action.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextActionComponent implements OnInit, OnDestroy {
  readonly DISABLED_NEXT_ACTIONS = {
    emailAddressRegistration: false,
    acknowledge: false,
    selfReaccommodation: false,
    ticketing: false,
    payment: false,
    registrationOfEvidenceForDisabledPerson: false,
    registrationOfEvidenceForIslandsTicket: false,
    juniorPilotApplication: false,
    onlineCheckin: false,
    advancedSeatSelection: false,
    immigrationInformationRegistration: false,
  };
  @Input() canClickNextAction = true;
  /**
   * Ecluded next actions:
   * Fill with next action keys that you want to exclude
   * Values are from enum NextActionKeys
   */
  @Input() set excludeNextActions(excludeNextActions: (keyof typeof this.DISABLED_NEXT_ACTIONS)[]) {
    const displayDisabledNextActions = { ...this.DISABLED_NEXT_ACTIONS };
    excludeNextActions.forEach((nextActionKey) => (displayDisabledNextActions[nextActionKey] = true));
    this.displayDisabledNextActions = { ...displayDisabledNextActions };
  }
  @Input() pnrInfo?: GetOrderResponseData;
  _subscription: Subscription = new Subscription();
  displayDisabledNextActions = { ...this.DISABLED_NEXT_ACTIONS };

  constructor(private readonly _aswMasterService: AswMasterService) {}

  ngOnInit(): void {
    this._subscription.add(
      this._aswMasterService
        .load(
          [
            NEXT_ACTION_LOAD_MASTERS.FUNCTION_INELIGIBLE_REASON_PK,
            NEXT_ACTION_LOAD_MASTERS.BANK_LANG,
            NEXT_ACTION_LOAD_MASTERS.BANK_ALL,
          ],
          true
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }
}
