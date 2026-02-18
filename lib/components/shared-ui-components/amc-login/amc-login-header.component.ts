/**
 * AMCログイン画面　ヘッダー
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonLibService } from '../../../services';
import { AmcLoginService } from './amc-login.service';
import { SupportModalIdSubComponent } from '../../../components/support-class/support-modal-id-sub-component';
import { AmcLoginPayload } from './amc-login.state';

@Component({
  selector: 'asw-amc-login-header',
  templateUrl: './amc-login-header.component.html',
  providers: [AmcLoginService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmcLoginHeaderComponent extends SupportModalIdSubComponent {
  reload() {}
  init() {}
  destroy() {}

  constructor(private _common: CommonLibService, private _service: AmcLoginService) {
    super(_common);
  }

  public override payload: AmcLoginPayload | null = {};

  clickClose() {
    this.close();
    if (this.payload?.closeEvent) {
      this.payload.closeEvent();
    }
  }
}
