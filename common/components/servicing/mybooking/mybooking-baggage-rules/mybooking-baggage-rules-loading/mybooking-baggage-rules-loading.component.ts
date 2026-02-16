import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonLibService } from '@lib/services';
import { SupportComponent } from '@lib/components/support-class';
import { MybookingBaggageRulesDisp, initialMybookingBaggageRulesDisp } from '../mybooking-baggage-rules.state';
/**
 * 手荷物ルール ローディング画面
 *
 */
@Component({
  selector: 'asw-mybooking-baggage-rules-loading',
  templateUrl: './mybooking-baggage-rules-loading.component.html',
  styleUrls: ['./mybooking-baggage-rules-loading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MybookingBaggageRulesLoadingComponent extends SupportComponent {
  constructor(private _common: CommonLibService, public change: ChangeDetectorRef) {
    super(_common);
  }
  reload(): void {}
  init(): void {}
  destroy(): void {}
  @Input()
  set data(value: MybookingBaggageRulesDisp) {
    this._data = value;
    this.change.markForCheck();
  }
  get data(): MybookingBaggageRulesDisp {
    return this._data;
  }
  public _data: MybookingBaggageRulesDisp = initialMybookingBaggageRulesDisp;
  @Output()
  dataChange = new EventEmitter<MybookingBaggageRulesDisp>();
  public refresh() {}
  public update() {
    this.dataChange.emit(this._data);
  }

  // プラン有効判定（プラン確認画面にて使用）
  @Input() isPlanValid? = true;
}
