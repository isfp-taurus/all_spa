import { Injectable } from '@angular/core';
import { ModalType } from '@lib/components';
import { SupportClass } from '@lib/components/support-class';
import { ModalBlockParts, ModalService } from '@lib/services';
import { PaymentDetailModalComponent } from './payment-detail-modal.component';
import { PaymentDetailData, PaymentDetailInput } from './payment-detail.state';

@Injectable()
export class PaymentDetailModalService extends SupportClass {
  constructor(public _modalService: ModalService) {
    super();
    this._modalBlockParts = this._modalService.defaultBlockPart(PaymentDetailModalComponent);
    this._modalBlockParts.closeBackEnable = true;
    this._modalBlockParts.type = ModalType.TYPE3;
  }

  destroy(): void {}

  private _modalBlockParts: ModalBlockParts;

  /** モーダルの表示 */
  public openModal(data: PaymentDetailData) {
    const input_data: PaymentDetailInput = {
      data: data,
    };
    /** ペイロードを介して引数を渡す */
    this._modalBlockParts.payload = input_data;
    /** モーダルの表示 */
    this._modalService.showSubModal(this._modalBlockParts);
  }
}
