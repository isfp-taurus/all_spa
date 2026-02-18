import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

@Component({
  selector: 'asw-travel-summary',
  templateUrl: './travel-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TravelSummaryComponent extends SupportComponent {
  // 回数
  @Input()
  public numberOfConnections: number = 0;

  // 時間
  @Input()
  public duration: string = '';

  /** コンストラクタ */
  constructor(protected _common: CommonLibService) {
    super(_common);
  }

  /** 初期表示処理 */
  init() {}

  /** 画面終了時処理 */
  destroy() {}

  /** 画面更新時処理 */
  reload() {}
}
