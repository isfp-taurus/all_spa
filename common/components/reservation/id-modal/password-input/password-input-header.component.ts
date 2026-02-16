/**
 * AMCパスワード入力画面　ヘッダー
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SupportModalIdSubComponent } from '@lib/components/support-class/support-modal-id-sub-component';
import { CommonLibService } from '@lib/services';
import { PasswordInputService } from './password-input.service';

@Component({
  selector: 'asw-password-input-header',
  templateUrl: './password-input-header.component.html',
  providers: [PasswordInputService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordInputHeaderComponent extends SupportModalIdSubComponent {
  reload() {}
  init() {}
  destroy() {}

  constructor(protected common: CommonLibService, protected service: PasswordInputService) {
    super(common);
  }

  public override payload: {
    submitEvent?: () => void;
    skipEvent?: () => void;
    matchesToTraveler?: boolean; //	組み込み元にて指定された搭乗者に含まれているかチェック要否
    matchesToMileageRedemptionMember?: boolean; //	組み込み元にて指定されたマイル減算者の会員かチェック要否
  } | null = {};

  clickClose() {
    this.close(false);
  }
}
