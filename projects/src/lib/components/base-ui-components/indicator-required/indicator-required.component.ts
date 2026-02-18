import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * [BaseUI] 入力必須インジケータ
 */
@Component({
  selector: 'asw-indicator-required',
  templateUrl: './indicator-required.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicatorRequiredComponent {
  /**
   * タイプ
   * - input: input単項目のラベルに付与する場合
   * - select: select単項目のラベルに付与する場合
   * - checkbox: checkbox単項目のラベルに付与する場合
   * - block: 複数項目で構成されるグループのラベルに付与する場合
   */
  @Input()
  public type: 'input' | 'select' | 'checkbox' | 'block' = 'input';
}
