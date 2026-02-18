import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

@Component({
  selector: 'asw-ana-biz-logout-sub-header',
  templateUrl: './ana-biz-logout-sub-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnaBizLogoutSubHeaderComponent extends SupportComponent {
  constructor(private _common: CommonLibService) {
    super(_common);
  }

  reload(): void {}
  init(): void {}
  destroy(): void {}
}
