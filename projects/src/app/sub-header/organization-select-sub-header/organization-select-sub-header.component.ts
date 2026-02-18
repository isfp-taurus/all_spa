import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

/**
 * ANA Biz組織選択 サブヘッダー
 */
@Component({
  selector: 'asw-organization-select-sub-header',
  templateUrl: './organization-select-sub-header.component.html',
  styleUrls: [],
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationSelectSubHeaderComponent extends SupportComponent {
  /** 画面タイトル */
  public displayTitle: string = 'heading.selectOrganization';

  constructor(private _common: CommonLibService) {
    super(_common);
  }

  reload(): void {}
  init(): void {}
  destroy(): void {}
}
