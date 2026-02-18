import { Injectable } from '@angular/core';
import { ModalType } from '@lib/components';
import { SupportClass } from '@lib/components/support-class';
import { ModalService, ModalBlockParts } from '@lib/services';
import { Subject } from 'rxjs/internal/Subject';
import { CheapestCalendarMatrixModalComponent } from './cheapest-calendar-matrix-modal.component';
import {
  CheapestCalendarData,
  CheapestCalendarModalInput,
  CheapestCalendarModalOutput,
} from './cheapest-calendar-matrix-modal.state';

@Injectable()
export class CheapestCalendarMatrixModalService extends SupportClass {
  constructor(public _modalService: ModalService) {
    super();
    this._modalBlockParts = this._modalService.defaultBlockPart(CheapestCalendarMatrixModalComponent);
    this._modalBlockParts.closeBackEnable = true;
    this._modalBlockParts.type = ModalType.TYPE2;
    this._subject = new Subject<CheapestCalendarModalOutput>();
  }

  destroy(): void {}

  private _modalBlockParts: ModalBlockParts;

  private _subject!: Subject<CheapestCalendarModalOutput>;

  /** モーダルの戻り値を受け取るオブサーバルを返す */
  public asObservableSubject() {
    return this._subject.asObservable();
  }

  /** モーダルの表示 */
  public openModal(data: CheapestCalendarData) {
    const inputDate: CheapestCalendarModalInput = {
      data: data,
      outputSubject: this._subject,
    };
    /** ペイロードを介して引数を渡す */
    this._modalBlockParts.payload = inputDate;
    /** モーダルの表示 */
    this._modalService.showSubModal(this._modalBlockParts);
  }
}
