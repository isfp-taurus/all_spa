import { Injectable } from '@angular/core';
import { FlightDetail } from '@app/roundtrip-flight-availability-international/presenter/roundtrip-flight-availability-international-pres.state';
import { ModalType } from '@lib/components';
import { SupportClass } from '@lib/components/support-class';
import { ModalBlockParts, ModalService } from '@lib/services';
import { FlightDetailModalComponent } from './flight-detail-modal.component';

/**
 * フライト詳細モーダル呼び出しサービス
 */
@Injectable()
export class FlightDetailModalService extends SupportClass {
  constructor(public _modalService: ModalService) {
    super();
    this._modalBlockParts = this._modalService.defaultBlockPart(FlightDetailModalComponent);
    this._modalBlockParts.closeBackEnable = true;
    this._modalBlockParts.type = ModalType.TYPE4;
  }

  destroy(): void {}

  private _modalBlockParts: ModalBlockParts;

  /** モーダルの表示 */
  public openModal(data: FlightDetail) {
    /** ペイロードを介して引数を渡す */
    this._modalBlockParts.payload = data;
    /** モーダルの表示 */
    this._modalService.showSubModal(this._modalBlockParts);
  }
}
