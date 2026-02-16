import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { ModalBlockParts, ModalService } from '@lib/services';
import { Subject } from 'rxjs/internal/Subject';
import { OtherBookingPassengerModalComponent } from './other-booking-passenger-modal.component';
import { OtherBookingPassengerModalInput, OtherBookingPassengerModalOutput } from './other-booking-passenger.state';
import { ShoppingLibService } from '@common/services/shopping/shopping-lib/shopping-lib.service';

@Injectable()
export class OtherBookingPassengerModalService extends SupportClass {
  constructor(private _modalService: ModalService, private _shoppingLibService: ShoppingLibService) {
    super();
    this._modalBlockParts = this._modalService.defaultBlockPart(OtherBookingPassengerModalComponent);
    this._modalBlockParts.closeBackEnable = true;
    this._selectedIsBookingPassenger = new Subject<OtherBookingPassengerModalOutput>();
  }

  destroy(): void {
    this._selectedIsBookingPassenger.unsubscribe();
  }

  private _modalBlockParts: ModalBlockParts;

  private _selectedIsBookingPassenger: Subject<OtherBookingPassengerModalOutput>;

  /** 実行結果の受け取り用関数型プロパティ */
  private closeEvent = (applied?: boolean) => {
    if (typeof applied === 'boolean') {
      this._selectedIsBookingPassenger.next({ isOtherBookingPassenger: applied });
    }
  };

  public getBookingPassengerInfo() {
    return this._selectedIsBookingPassenger.asObservable();
  }

  public openModal(data?: OtherBookingPassengerModalInput) {
    this._modalBlockParts.payload = data;
    this._modalBlockParts.closeEvent = this.closeEvent;
    this._modalService.showSubModal(this._modalBlockParts);
  }
}
