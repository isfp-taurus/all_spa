import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

@Component({
  selector: 'asw-ana-biz-login-sub-header',
  templateUrl: './ana-biz-login-sub-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnaBizLoginSubHeaderComponent extends SupportComponent {
  /** 画面タイトル */
  public displayTitle: string = 'heading.anaBizLogin';

  constructor(private _common: CommonLibService, private changeDetectorRef: ChangeDetectorRef) {
    super(_common);
  }

  reload(): void {}
  init(): void {}
  destroy(): void {}
}
