import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { FareTypeModalInput, FareTypeOption } from './fare-type-selector.state';

/** 運賃オプション選択モーダル サービスクラスを介して呼び出し */
@Component({
  selector: 'asw-fare-type-selector-modal',
  templateUrl: './fare-type-selector-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FareTypeSelectorModalComponent extends SupportModalBlockComponent {
  constructor(protected _common: CommonLibService) {
    super(_common);
    this.selected = '';
  }

  init(): void {
    this.selected = this.payload.selectedFareType;
    this.fareTypeOptionList = this.payload.fareTypeOptionList;
    this.formGroupFareType.setControl(this.FORM_GROUP_NAME, new FormControl(this.selected));
  }
  reload(): void {}
  destroy(): void {}

  public readonly FORM_GROUP_NAME = 'radioFareType';

  override payload!: FareTypeModalInput;

  /** radioボタンのvalue値にあたる選択値を呼び出し元から設定*/
  public selected: string | null;

  /** radioボタンのグループ radioボタンの入力をバインドするので選択中の要素番号としても使用する*/
  public formGroupFareType: FormGroup = new FormGroup({
    radioFareType: new FormControl(),
  });

  /** 画面描画用のパラメータ */
  public fareTypeOptionList: Array<FareTypeOption> = [];

  /** モーダルを閉じる */
  closeModal() {
    this.close();
  }

  /** イベント定義 */

  /** INTERNAL_DESIGN_EVENT  適用ボタン押下時処理 */
  public applyFareTypeSelector() {
    //モーダル展開前の値と確定値が異なる場合、選択確定値を変更しSubjectで値を返却する
    if (this.selected !== this.formGroupFareType.value.radioFareType) {
      this.selected = this.formGroupFareType.value.radioFareType;
      this.payload.subject.next({
        selectedFareType: this.selected,
      });
    }
    this.closeModal();
  }

  /** INTERNAL_DESIGN_EVENT 閉じる(×)ボタン押下時処理 */
  public cancelFareTypeSelector() {
    this.closeModal();
  }
}
