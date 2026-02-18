import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService } from '@lib/services';

/**
 * フライト検索画面でのルール ローディング画面
 *
 */
@Component({
  selector: 'asw-search-flight-rules-loadding',
  templateUrl: './search-flight-rules-loadding.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFlightRulesLoaddingComponent extends SupportComponent {
  constructor(private _common: CommonLibService, private _staticMsg: StaticMsgPipe, public change: ChangeDetectorRef) {
    super(_common);
  }
  @Input()
  public index!: number;
  reload(): void {}
  init(): void {}
  destroy(): void {}
}
