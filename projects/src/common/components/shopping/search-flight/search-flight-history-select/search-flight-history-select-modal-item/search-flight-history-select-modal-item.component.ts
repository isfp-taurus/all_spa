import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonLibService } from '@lib/services/common-lib/common-lib.service';
import { SupportComponent } from '@lib/components/support-class';
import { TranslateService } from '@ngx-translate/core';
import { HstFvtModeEnum } from '../search-flight-history-select.state';

/**
 * 検索履歴・お気に入りモーダルの1アイテムのコンポーネント
 * 参照モードではaタグ、削除モードではdivタグに切り替える
 * アイテムの描画内容は親コンポーネントに記述する
 */
@Component({
  selector: 'asw-search-flight-history-select-modal-item',
  templateUrl: './search-flight-history-select-modal-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFlightHistorySelectModalItemComponent extends SupportComponent {
  @Input()
  public historyType!: 'history' | 'favorite';

  /** 参照モードまたは削除モード */
  @Input()
  public mode!: HstFvtModeEnum;
  public readonly HstFvtModeEnum = HstFvtModeEnum;
  /** 参照モード時にクリックした時に親に渡すイベント */
  @Output()
  public clickItem = new EventEmitter<Event>();

  constructor(protected common: CommonLibService, private _translateService: TranslateService) {
    super(common);
  }
  /** 初期表示処理 */
  init() {}

  /** 画面終了時処理 */
  destroy() {}

  /** 画面更新時処理 */
  reload() {}

  /** 参照モード時にクリックした時のイベント */
  public clickItemInReferenceMode(event: Event) {
    //aタグの画面遷移処理をキャンセル
    event.preventDefault();
    this.clickItem.emit(event);
  }
}
