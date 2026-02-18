import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { fromEvent, throttleTime } from 'rxjs';

@Component({
  selector: 'asw-plan-list-plan-header-area',
  templateUrl: './plan-list-plan-header-area.component.html',
  styleUrls: ['./plan-list-plan-header-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanListPlanHeaderAreaComponent extends SupportComponent {
  /** 差分強調表示有無 */
  @Input() isPlanChanged: boolean = false;

  public fullWidth = 0;

  /**
   * コンストラクタ
   */
  constructor(private _common: CommonLibService, private _changeDetectorRef: ChangeDetectorRef) {
    super(_common);
  }

  /**
   * 初期表示処理
   */
  init(): void {
    this.fullWidth = document.body.clientWidth;
    // 画面サイズチェック
    this.subscribeService('SubHeaderResize', fromEvent(window, 'resize').pipe(throttleTime(500)), this._resizeEvent);
  }

  /** 画面サイズ変更時実行関数 */
  private _resizeEvent = () => {
    this.fullWidth = document.body.clientWidth;
    this._changeDetectorRef.markForCheck();
  };

  refresh(): void {}

  reload(): void {}

  destroy(): void {}
}
