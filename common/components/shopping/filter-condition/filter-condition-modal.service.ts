import { Injectable } from '@angular/core';
import { FilterConditionData, FilterConditionInput, FilterConditionOutput } from '@common/interfaces';
import { ModalType } from '@lib/components';
import { SupportClass } from '@lib/components/support-class';
import { ModalService, ModalBlockParts } from '@lib/services';
import { Subject } from 'rxjs/internal/Subject';
import { FilterConditionModalComponent } from './filter-condition-modal.component';

@Injectable()
export class FilterConditionModalService extends SupportClass {
  constructor(public _modalService: ModalService) {
    super();
    this._modalBlockParts = this._modalService.defaultBlockPart(FilterConditionModalComponent);
    this._modalBlockParts.closeBackEnable = true;
    this._modalBlockParts.type = ModalType.TYPE5;
    this._subject = new Subject<FilterConditionOutput>();
  }

  destroy(): void {}

  private _modalBlockParts: ModalBlockParts;

  private _subject!: Subject<FilterConditionOutput>;

  public asObservableSubject() {
    return this._subject.asObservable();
  }

  /** モーダルの表示 */
  public openModal(data: FilterConditionData | null, initialData: FilterConditionData | null, boundIndex?: number) {
    const input_data: FilterConditionInput = {
      data: data!,
      initialData: initialData!,
      subject: this._subject,
      boundIndex,
    };
    /** ペイロードを介して引数を渡す */
    this._modalBlockParts.payload = input_data;
    /** モーダルの表示 */
    this._modalService.showSubModal(this._modalBlockParts);
  }
}
