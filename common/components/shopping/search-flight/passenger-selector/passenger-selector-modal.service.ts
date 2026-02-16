import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { ModalBlockParts, ModalService } from '@lib/services';
import { Subject } from 'rxjs/internal/Subject';
import { PassengerSelectorModalComponent } from './passenger-selector-modal.component';
import { PassengersCount, PassengerData } from './passenger-selector.state';

@Injectable()
export class PassengerSelectorModalService extends SupportClass {
  private _modalBlockParts: ModalBlockParts;

  private _passengersCount: PassengersCount | null = null;

  private _passengersCountSubject: Subject<PassengersCount | null>;

  public get passengerCount() {
    return this._passengersCount;
  }

  public set passengerCount(value: PassengersCount | null) {
    this._passengersCount = value;
  }

  constructor(public _modalService: ModalService) {
    super();
    this._modalBlockParts = this._modalService.defaultBlockPart(PassengerSelectorModalComponent);
    this._modalBlockParts.closeBackEnable = true;
    this._passengersCountSubject = new Subject<PassengersCount | null>();
  }

  destroy(): void {
    this._passengersCountSubject.unsubscribe();
  }

  /** 実行結果の受け取り用関数型プロパティ */
  private closeEvent = (args?: { value: PassengersCount | null; applied: boolean }) => {
    if (args && args.applied) {
      this._passengersCount = args.value ?? null;
      this._passengersCountSubject.next(this._passengersCount);
    }
  };

  public getPassengersCountSubject(): Subject<PassengersCount | null> {
    return this._passengersCountSubject;
  }

  /** モーダルの表示 */
  public openModal(data: PassengerData | null) {
    /** ペイロードを介して引数を渡す */
    this._modalBlockParts.payload = data;
    /** 入力結果の受け取り用に関数を渡す */
    this._modalBlockParts.closeEvent = this.closeEvent;
    /** モーダルの表示 */
    this._modalService.showSubModal(this._modalBlockParts);
  }
}
