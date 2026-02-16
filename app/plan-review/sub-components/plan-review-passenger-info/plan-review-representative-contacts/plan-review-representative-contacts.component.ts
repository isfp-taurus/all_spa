import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { EmphType, PlanReviewOutputRepContacts } from '@common/interfaces';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { PlanReviewPassengerInfoService } from '../plan-review-passenger-info-service';
import { PageLoadingService } from '@lib/services/page-loading/page-loading.service';
import { AppConstants } from '@conf/app.constants';

/**
 * 代表者連絡先情報
 */
@Component({
  selector: 'asw-plan-review-representative-contacts',
  templateUrl: './plan-review-representative-contacts.component.html',
  styleUrls: ['./plan-review-representative-contacts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewRepresentativeContactsComponent extends SupportComponent {
  public appConstants = AppConstants;

  @Input() isPlanValid = false;

  constructor(
    private _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _passengerInfoService: PlanReviewPassengerInfoService,
    private _loadingSvc: PageLoadingService
  ) {
    super(_common);
  }

  @Input()
  set data(value: PlanReviewOutputRepContacts) {
    this._data = value;
    this.refresh();
  }
  get data(): PlanReviewOutputRepContacts {
    return this._data;
  }
  private _data: PlanReviewOutputRepContacts = {
    email: {
      value: '',
      type: EmphType.NL,
    },
    phone: {
      value: '',
      type: EmphType.NL,
    },
  };

  refresh(): void {
    this._changeDetectorRef.markForCheck();
  }

  reload(): void {}
  init(): void {}
  destroy(): void {}

  /**
   * 搭乗者情報入力モーダル表示処理
   */
  openPassengerInfoRequest(section: number): void {
    //PageInitService.endInitを使用しているため、endLoadingは入れない。
    this._loadingSvc.startLoading();
    this._passengerInfoService.openPassengerInfoRequest(section);
  }
}
