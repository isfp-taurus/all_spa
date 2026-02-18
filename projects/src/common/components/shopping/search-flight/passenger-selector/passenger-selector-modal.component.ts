import { Component } from '@angular/core';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { CommonLibService, ErrorsHandlerService } from '@lib/services';
import {
  PassengersCount,
  MaxPassengersCount,
  PassengerData,
  OldDomesticAswMaxPassengersCount,
} from './passenger-selector.state';
import { OtherBookingPassengerModalService } from '@common/components/shopping/search-flight/other-booking-passenger/other-booking-passenger-modal.service';
import { SearchFlightState } from '@common/store';
import { SearchFlightStoreService } from '@common/services';
import { ShoppingLibService } from '@common/services/shopping/shopping-lib/shopping-lib.service';
import { filter, take } from 'rxjs/operators';
import { RetryableError } from '@lib/interfaces/errors';
import { PageType } from '@lib/interfaces/page';
import { Subscription } from 'rxjs';

@Component({
  selector: 'asw-passenger-selector-modal',
  templateUrl: './passenger-selector-modal.component.html',
})
export class PassengerSelectorModalComponent extends SupportModalBlockComponent {
  /**
   * ngOnDestroyにunsubscribeを実行
   */
  private _subscriptions: Subscription = new Subscription();

  reload(): void {}
  init(): void {
    this.passengersCount = this.payload?.count ?? null;
    this.isInfantCountShow = this.payload?.infantCountFlag ?? false;
    this.isChild3To11 = this.payload?.childAgeFlag ?? false;
    this.isInfant0To1 = this.payload?.infantAgeFlag ?? false;
  }
  destroy(): void {
    this._subscriptions.unsubscribe();
  }

  constructor(
    protected _common: CommonLibService,
    private _shoppingLibService: ShoppingLibService,
    protected _otherBookingPassengerModalService: OtherBookingPassengerModalService,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _errorsHandlerSvc: ErrorsHandlerService
  ) {
    super(_common);
    const otherPassengerInfo = this._otherBookingPassengerModalService.getBookingPassengerInfo();
    this.subscribeService('otherPassengerInfo', otherPassengerInfo, (data) => {
      if (data) {
        this._passengersCount = this.otherPassengerCount;
        this.close({ value: this._passengersCount, applied: true });
        const state: SearchFlightState = {
          ...this._searchFlightState,
          // 保持している検索条件.別予約同行者情報
          // 別予約同行者有無に値なしを設定する。
          hasAccompaniedInAnotherReservation: data.isOtherBookingPassenger,
        };
        this._searchFlightStoreService.updateStore(state);
        this._clearRetryableError();
      }
    });
    this.payload = null;
    // 流入データ
    this.subscribeService('SearchFlightStoreService-getData', this._searchFlightStoreService.searchFlight$, (data) => {
      this._searchFlightState = data;
    });
  }

  private _passengersCount: PassengersCount | null = null;

  adultCount = 0;
  adultMaxCount = 0;
  childCount = 0;
  infantCount = 0;
  isApplyEnabled = false;
  isAdultMinusButtonEnabled = false;
  isAdultPlusButtonEnabled = false;
  isChildMinusButtonEnabled = false;
  isChildPlusButtonEnabled = false;
  isInfantMinusButtonEnabled = false;
  isInfantPlusButtonEnabled = false;
  isInfantCountShow = false;
  isChild3To11 = false;
  isInfant0To1 = false;
  private _searchFlightState!: SearchFlightState;

  public override payload: PassengerData | null;

  get passengersCount() {
    return this._passengersCount;
  }
  set passengersCount(data: PassengersCount | null) {
    this._passengersCount = data;
    this.refresh();
  }

  private otherPassengerCount: PassengersCount | null = null;

  refresh(): void {
    this.adultCount = this.passengersCount?.adultCount ?? this.adultCount;
    this.childCount = this.passengersCount?.childCount ?? this.childCount;
    this.infantCount = this.passengersCount?.infantCount ?? this.infantCount;
    this.isAdultMinusButtonEnabled = this.adultCount !== 0;
    this.isChildMinusButtonEnabled = this.childCount !== 0;
    this.isInfantMinusButtonEnabled = this.infantCount !== 0;
    if (
      this._shoppingLibService.getOldDomesticAswSearchFlag(
        this._searchFlightState,
        this._common.aswContextStoreService.aswContextData.posCountryCode
      )
    ) {
      this.isAdultPlusButtonEnabled = this.adultCount < OldDomesticAswMaxPassengersCount.ADULT;
      this.isInfantPlusButtonEnabled = this.infantCount < OldDomesticAswMaxPassengersCount.INFANT;
    } else {
      this.isAdultPlusButtonEnabled = this.adultCount < MaxPassengersCount.ADULT;
      this.isInfantPlusButtonEnabled = this.infantCount < MaxPassengersCount.INFANT;
    }
    this.isChildPlusButtonEnabled =
      this.childCount <
      this._shoppingLibService.determineMaxChildCount(
        this._common.aswContextStoreService.aswContextData.posCountryCode,
        this._searchFlightState.dcsMigrationDateStatus,
        this._searchFlightState.isJapanOnly
      );
    this.isApplyEnabled = this.arePassengersPresent();
  }

  override close!: (args?: { value: PassengersCount | null; applied: boolean; companion?: boolean }) => {};

  /** INTERNAL_DESIGN_EVENT 閉じる(×)ボタン押下時処理 */
  private closeDialog(applied: boolean): void {
    this.close({ value: this.passengersCount, applied: applied });
  }

  public clickCancel() {
    this.closeDialog(false);
  }

  private arePassengersPresent(): boolean {
    return this.adultCount > 0 || this.childCount > 0 || this.infantCount > 0;
  }

  /** INTERNAL_DESIGN_EVENT 搭乗者追加ボタン押下時処理 搭乗者削減ボタン押下時処理(大人) */
  addAdultCount(num: number): void {
    const posCountryCode = this._common.aswContextStoreService.aswContextData.posCountryCode;
    const isOldDomesticAsw = this._shoppingLibService.getOldDomesticAswSearchFlag(
      this._searchFlightState,
      posCountryCode
    );
    let changedCount: number = this.adultCount + num;
    let maximum = isOldDomesticAsw ? OldDomesticAswMaxPassengersCount.ADULT : MaxPassengersCount.ADULT;
    if ((num < 0 && changedCount < 0) || (0 < num && maximum < changedCount)) {
      return;
    }
    this.adultCount = changedCount;
    this.isAdultMinusButtonEnabled = this.adultCount !== 0;
    this.isAdultPlusButtonEnabled = this.adultCount < maximum;
    this.isApplyEnabled = this.arePassengersPresent();
  }

  /** INTERNAL_DESIGN_EVENT 搭乗者追加ボタン押下時処理 搭乗者削減ボタン押下時処理(小児) */
  addChildCount(num: number): void {
    const posCountryCode = this._common.aswContextStoreService.aswContextData.posCountryCode;
    const dcsMigrationDateStatus = this._searchFlightState.dcsMigrationDateStatus;
    const isJapanOnly = this._searchFlightState.isJapanOnly;
    let maximum = this._shoppingLibService.determineMaxChildCount(posCountryCode, dcsMigrationDateStatus, isJapanOnly);
    let changedCount: number = this.childCount + num;
    if ((num < 0 && changedCount < 0) || (0 < num && maximum < changedCount)) {
      return;
    }
    this.childCount = changedCount;
    this.isChildMinusButtonEnabled = this.childCount !== 0;
    this.isChildPlusButtonEnabled = this.childCount < maximum;
    this.isApplyEnabled = this.arePassengersPresent();
  }

  /** INTERNAL_DESIGN_EVENT 搭乗者追加ボタン押下時処理 搭乗者削減ボタン押下時処理(幼児) */
  addInfantCount(num: number): void {
    const posCountryCode = this._common.aswContextStoreService.aswContextData.posCountryCode;
    const isOldDomesticAsw = this._shoppingLibService.getOldDomesticAswSearchFlag(
      this._searchFlightState,
      posCountryCode
    );
    let changedCount: number = this.infantCount + num;
    let maximum = isOldDomesticAsw ? OldDomesticAswMaxPassengersCount.INFANT : MaxPassengersCount.INFANT;
    if ((num < 0 && changedCount < 0) || (0 < num && maximum < changedCount)) {
      return;
    }
    this.infantCount = changedCount;
    this.isInfantMinusButtonEnabled = this.infantCount !== 0;
    this.isInfantPlusButtonEnabled = this.infantCount < maximum;
    this.isApplyEnabled = this.arePassengersPresent();
  }

  /** INTERNAL_DESIGN_EVENT 適用ボタン押下時処理 */
  clickApply(): void {
    const event: PassengersCount = {
      adultCount: this.adultCount,
      youngAdultCount: 0,
      childCount: this.childCount,
      infantCount: this.infantCount,
    };
    if (this.adultCount === 0 && this.infantCount === 0 && this.childCount > 0) {
      this.otherPassengerCount = event;
      const { hasAccompaniedInAnotherReservation } = this._searchFlightState;
      this._otherBookingPassengerModalService.openModal({
        isOtherBookingPassenger: hasAccompaniedInAnotherReservation,
      });
    } else {
      this.passengersCount = event;
      //小児以外の搭乗者が存在する、かつ別予約同行者情報.別予約同行者有無が存在する。
      if (
        this.adultCount !== 0 ||
        (this.infantCount !== 0 && this._searchFlightState.hasAccompaniedInAnotherReservation != null)
      ) {
        const state: SearchFlightState = {
          ...this._searchFlightState,
          // 保持している検索条件.別予約同行者情報
          // 別予約同行者有無に値なしを設定する。
          hasAccompaniedInAnotherReservation: null,
        };
        this._searchFlightStoreService.updateStore(state);
        this._clearRetryableError();
      }
      this.closeDialog(true);
    }
  }

  private _clearRetryableError() {
    this._subscriptions.add(
      this._errorsHandlerSvc
        .getRetryableError$()
        .pipe(
          filter((data): data is RetryableError => !!data),
          take(1)
        )
        .subscribe((error: RetryableError) => {
          if (error?.errorMsgId === 'E0931') {
            this._errorsHandlerSvc.clearRetryableError(PageType.PAGE);
          }
        })
    );
  }
}
