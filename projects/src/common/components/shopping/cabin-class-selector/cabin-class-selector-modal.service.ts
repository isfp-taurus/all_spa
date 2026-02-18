import { Injectable } from '@angular/core';
import { ModalType } from '@lib/components';
import { SupportClass } from '@lib/components/support-class';
import { ModalBlockParts, ModalService } from '@lib/services';
import { Subject } from 'rxjs';
import { CabinClassSelectorModalComponent } from './cabin-class-selector-modal.component';
import {
  CabinClassSelectorData,
  CabinClassSelectorInput,
  CabinClassSelectorOutput,
} from './cabin-class-selector.state';

@Injectable()
export class CabinClassSelectorModalService extends SupportClass {
  constructor(public _modalService: ModalService) {
    super();
    this._modalBlockParts = this._modalService.defaultBlockPart(CabinClassSelectorModalComponent);
    this._modalBlockParts.closeBackEnable = true;
    this._modalBlockParts.type = ModalType.TYPE1;
    this._subject = new Subject<CabinClassSelectorOutput>();
  }

  destroy(): void {}

  private _modalBlockParts: ModalBlockParts;

  private _subject!: Subject<CabinClassSelectorOutput>;

  public asObservableSubject() {
    return this._subject.asObservable();
  }

  /** モーダルの表示 */
  public openModal(data: CabinClassSelectorData | null) {
    const input_data: CabinClassSelectorInput = {
      data: data!,
      subject: this._subject,
    };
    /** ペイロードを介して引数を渡す */
    this._modalBlockParts.payload = input_data;
    /** モーダルの表示 */
    this._modalService.showSubModal(this._modalBlockParts);
  }
}
