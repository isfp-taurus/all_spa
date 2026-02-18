import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SupportModalIdSubComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

/**
 * 搭乗者情報入力画面　フッター
 */
@Component({
  selector: 'asw-passenger-information-request-footer',
  templateUrl: './passenger-information-request-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassengerInformationRequestFooterComponent extends SupportModalIdSubComponent {
  reload() {}
  init() {}
  destroy() {}

  constructor(private _common: CommonLibService) {
    super(_common);
  }

  /** 更新するボタン押下時処理 */
  public clickApply() {
    this.applyEvent();
  }

  //メインコンポーネントによって渡される
  public applyEvent: () => void = () => {};
}
