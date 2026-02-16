import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { SupportInformationInputSpecialAssistanceModel } from '@common/interfaces';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

/**
 * サポート情報入力モーダル
 */
@Component({
  selector: 'asw-support-information-input-special-assistance.',
  templateUrl: './support-information-input-special-assistance.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportInformationInputSpecialAssistanceComponent extends SupportComponent {
  constructor(private _common: CommonLibService, public changeDetectorRef: ChangeDetectorRef) {
    super(_common);
  }

  @Input()
  set data(value: SupportInformationInputSpecialAssistanceModel) {
    this._data = value;
  }
  get data(): SupportInformationInputSpecialAssistanceModel {
    return this._data;
  }
  private _data: SupportInformationInputSpecialAssistanceModel = {
    degreeOfWalking: false,
    blind: false,
    deaf: false,
    pregnant: false,
  };
  @Output()
  dataChange = new EventEmitter<SupportInformationInputSpecialAssistanceModel>();

  public degreeOfWalking = false;
  public blind = false;
  public deaf = false;
  public pregnant = false;

  /**
   * 初期表示処理
   */

  init(): void {
    this.refresh();
  }

  reload(): void {}

  destroy(): void {
    this.apply();
  }

  apply() {
    const value: SupportInformationInputSpecialAssistanceModel = {
      degreeOfWalking: this.degreeOfWalking,
      blind: this.blind,
      deaf: this.deaf,
      pregnant: this.pregnant,
    };
    this.data = value;
    this.dataChange.emit(value);
  }

  refresh() {
    this.degreeOfWalking = this.data.degreeOfWalking;
    this.blind = this.data.blind;
    this.deaf = this.data.deaf;
    this.pregnant = this.data.pregnant;
  }

  /**
   * 歩行障害チェック時イベント
   * 次へ進むボタンの切り替えのため更新する
   */
  changeDegreeOfWalking() {
    this.apply();
  }
}
