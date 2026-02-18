/**
 * サブヘッダー
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonLibService } from '@lib/services';
import { SupportComponent } from '@lib/components/support-class';

/**
 * ご紹介ネット入り口サブヘッダー
 *
 */
@Component({
  selector: 'asw-goshokai-net-login-sub-header',
  templateUrl: './goshokai-net-login-sub-header.component.html',
  styleUrls: [],
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoshokaiNetLoginSubHeaderComponent extends SupportComponent {
  /** 画面タイトル */
  public displayTitle: string = 'label.introduce.title';

  constructor(private _common: CommonLibService, private changeDetectorRef: ChangeDetectorRef) {
    super(_common);
  }

  reload(): void {}
  init(): void {}
  destroy(): void {}
}
