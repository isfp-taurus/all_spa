import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { SearchFlightStoreService } from '@common/services';
import { ShoppingLibService } from '@common/services/shopping/shopping-lib/shopping-lib.service';
import { SupportComponent } from '@lib/components/support-class';
import { ValidationErrorInfo } from '@lib/interfaces';
import { AswContextStoreService, CommonLibService } from '@lib/services';
import { PassengerSelectorModalService } from './passenger-selector-modal.service';
import { PassengersCount } from './passenger-selector.state';
import { isSP } from 'src/lib/helpers';
import { SearchFlightState, TripType } from '@common/store/search-flight';
import { StaticMsgPipe } from '@lib/pipes';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'asw-passenger-selector',
  templateUrl: './passenger-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassengerSelectorComponent extends SupportComponent {
  constructor(
    protected _common: CommonLibService,
    private _shoppingLibService: ShoppingLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _passengerSelectorModalService: PassengerSelectorModalService,
    private _aswContextStoreSvc: AswContextStoreService,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _staticMsg: StaticMsgPipe
  ) {
    super(_common);
    const passengersCountSubject = this._passengerSelectorModalService.getPassengersCountSubject();
    const passengersCount$ = passengersCountSubject.asObservable();
    this.subscribeService('PassengerSelectorComponent', passengersCount$, (data) => {
      if (this.isEnabled && data != null) {
        this._passengersCount = data;
        this.setPlaceholderText();
        this.apply$.emit(this._passengersCount);
      }
    });
    this.searchFlightData = this._searchFlightStoreService.getData();
    const { posCountryCode } = this._aswContextStoreSvc.aswContextData;
    this.isInfantCountShow =
      posCountryCode === 'JP' || !this.searchFlightData.isJapanOnly || this.dcsMigrationDateStatus !== 'Before';
    this.isChild3To11 = this.searchFlightData.isJapanOnly && this.dcsMigrationDateStatus === 'Before';
    this.isInfant0To1 = !(
      posCountryCode === 'JP' &&
      this.searchFlightData.isJapanOnly &&
      this.dcsMigrationDateStatus === 'Before'
    );
  }
  /** デバイスを判定する変数 */
  public isSp = isSP();
  public isSpPre = isSP();
  reload(): void {}
  private resizeEvent = () => {
    this.isSpPre = this.isSp;
    this.isSp = isSP();
    if (this.isSpPre !== this.isSp) {
      this._changeDetectorRef.detectChanges();
    }
  };

  init(): void {
    this.subscribeService('passengerSelectorComponentResize', fromEvent(window, 'resize'), this.resizeEvent);
    this._passengersCount = {
      adultCount: this.searchFlightData.traveler.adt,
      youngAdultCount: 0,
      childCount: this.searchFlightData.traveler.chd,
      infantCount: this.searchFlightData.traveler.inf,
    };
    this.setPlaceholderText();

    this.subscribeService('SearchFlightStoreService', this._searchFlightStoreService.searchFlight$, (data) => {
      this.searchFlightData = data;
      this._passengersCount = {
        adultCount: data.traveler.adt,
        youngAdultCount: 0,
        childCount: data.traveler.chd,
        infantCount: data.traveler.inf,
      };
      let departureDate;
      if (data.tripType === 0) {
        departureDate = data.roundTrip.departureDate;
      } else {
        departureDate = data.onewayOrMultiCity[0].departureDate;
      }

      this.passengersErrorMsg = this._shoppingLibService.checkTraveler(
        data.traveler.adt,
        data.traveler.chd,
        data.traveler.inf,
        data.isJapanOnly,
        departureDate!
      );
      this.setPlaceholderText();
      const { posCountryCode } = this._aswContextStoreSvc.aswContextData;
      this.dcsMigrationDateStatus = data.dcsMigrationDateStatus;
      this.isInfantCountShow = posCountryCode === 'JP' || !data.isJapanOnly || this.dcsMigrationDateStatus !== 'Before';
      this.isChild3To11 = data.isJapanOnly && this.dcsMigrationDateStatus === 'Before';
      this.isInfant0To1 = !(posCountryCode === 'JP' && data.isJapanOnly && this.dcsMigrationDateStatus === 'Before');

      this._changeDetectorRef.markForCheck();
    });
  }
  /** コンポーネントの活性状態 */
  @Input()
  public isEnabled: boolean = true;
  destroy(): void {
    this.deleteSubscription('PassengerSelectorComponent');
    this.deleteSubscription('SearchFlightStoreService');
  }

  private _passengersCount!: PassengersCount;
  /** フライト検索画面 Storeに格納しているState */
  public searchFlightData!: SearchFlightState;
  public placeholderText = '';

  @Input()
  get passengersCount() {
    return this._passengersCount;
  }
  set passengersCount(data: PassengersCount) {
    this._passengersCount = data;
  }
  @Input()
  public passengersErrorMsg!: string | ValidationErrorInfo;
  @Input()
  public isInfantCountShow: boolean = false;
  @Input()
  public isChild3To11: boolean = false;
  @Input()
  public isInfant0To1: boolean = false;
  @Input()
  public dcsMigrationDateStatus: string = '';
  public readonly TripType = TripType;
  @Output()
  apply$ = new EventEmitter<PassengersCount>();

  private setPlaceholderText(): void {
    this.placeholderText = this._shoppingLibService.getPassengersText(
      this._passengersCount.adultCount,
      0,
      this._passengersCount.childCount,
      this._passengersCount.infantCount
    );
    if (
      this.searchFlightData.hasAccompaniedInAnotherReservation !== null &&
      this._passengersCount.adultCount === 0 &&
      this._passengersCount.childCount > 0 &&
      this._passengersCount.infantCount === 0
    ) {
      let labelkey = this.searchFlightData.hasAccompaniedInAnotherReservation
        ? 'label.paxAdultsWillAccompanyAnother'
        : 'label.paxUseJuniorPilot';
      this.placeholderText += ' ' + this._staticMsg.transform(labelkey);
    }
  }

  async openPassengerSelectorModal() {
    const data = {
      count: this.passengersCount,
      infantCountFlag: this.isInfantCountShow,
      childAgeFlag: this.isChild3To11,
      infantAgeFlag: this.isInfant0To1,
    };
    this._passengerSelectorModalService.openModal(data);
  }
}
