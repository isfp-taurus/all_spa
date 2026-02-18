import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import {
  initialPassengerInformationRequestInputCompleteOperationparts,
  PassengerInformationRequestInputCompleteOperationparts,
} from './passenger-input-complete-operation-area.state';

/**
 * passenger-information-request
 * 入力完了操作エリア
 */

@Component({
  selector: 'asw-passenger-information-request-input-complete-operation-area',
  templateUrl: './passenger-input-complete-operation-area.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassengerInformationRequestInputCompleteOperationComponent extends SubComponentModelComponent<
  {},
  PassengerInformationRequestInputCompleteOperationparts
> {
  protected _data: {} = {};
  protected _parts: PassengerInformationRequestInputCompleteOperationparts =
    initialPassengerInformationRequestInputCompleteOperationparts();
  setDataEvent(): void {}
  setPartsEvent(): void {
    this.change.markForCheck();
  }

  @Output()
  public nextEvent: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  public saveEvent: EventEmitter<void> = new EventEmitter<void>();

  constructor(protected _common: CommonLibService, public change: ChangeDetectorRef) {
    super(change, _common);
  }

  reload() {}
  init() {}
  destroy() {}

  /**
   * 次へボタンが押された時の処理
   */
  clickNextButton() {
    this.nextEvent.emit();
  }

  /**
   * 保存・プラン確認画面へ戻るボタンが押された時の処理
   */
  clickSaveButton() {
    this.saveEvent.emit();
  }
}
