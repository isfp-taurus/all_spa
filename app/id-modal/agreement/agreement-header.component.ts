import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { SupportModalIdSubComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

/**
 * R01P043 規約 ヘッダー
 */
@Component({
  selector: 'asw-agreement-header',
  templateUrl: './agreement-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgreementHeaderComponent extends SupportModalIdSubComponent {
  constructor(private _common: CommonLibService, public change: ChangeDetectorRef) {
    super(_common);
  }
  reload(): void {}
  destroy(): void {}
  init() {}

  /**
   * ヘッダーに表示するタイトル
   */
  public _pageTitleKey?: string;
  set pageTitleKey(value: string | undefined) {
    this._pageTitleKey = value;
    this.change.detectChanges();
  }
  get pageTitleKey() {
    return this._pageTitleKey;
  }
}
