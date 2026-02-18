/**
 * AMCログイン画面
 *
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { AmcLoginService } from './amc-login.service';
import { AmcLoginPayload } from './amc-login.state';
import { Router } from '@angular/router';
import { CommonLibService } from '@lib/services/common-lib/common-lib.service';
import { AswServiceStoreService } from '@lib/services/asw-service-store/asw-service-store.service';
import { PageInitService, PageLoadingService } from '@lib/services';
import { PageIdType } from '@lib/interfaces/page-id';
import { FunctionIdType } from '@lib/interfaces/function-id';
import { SupportModalIdComponent } from '@lib/components/support-class/support-modal-id-component';
import { AswValidators } from '@lib/helpers/validate/validators';
import { AuthLoginRequest } from 'src/sdk-member';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponseModel } from '@lib/interfaces/api-error-response';
import { CommonConstants } from '@conf/app.constants';
import { SignalService } from './signal.service';

@Component({
  selector: 'asw-amc-login',
  templateUrl: './amc-login.component.html',
  styleUrls: ['./amc-login.scss'], //ログインボダン用のCSSを追加
  providers: [AmcLoginService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmcLoginComponent extends SupportModalIdComponent {
  subPageId: string = PageIdType.LOGIN;
  subFunctionId: string = FunctionIdType.LOGIN;
  public idName = '';
  public password = '';
  public idNameFormContrl!: FormControl;
  public passwordFormContrl!: FormControl;
  public isSkipEnable = false;

  public override payload: AmcLoginPayload | null = {};

  constructor(
    private _common: CommonLibService,
    private _service: AmcLoginService,
    private _router: Router,
    private _aswServiceStoreService: AswServiceStoreService,
    private _pageInitService: PageInitService,
    private _signalService: SignalService,
    private _pageLoadingService: PageLoadingService
  ) {
    super(_common, _pageInitService);
    this.subscribeService('GetSignalLoginService', this._signalService.loginSignal$, () => {
      this.clickLogin(null, true);
    });
  }

  init() {
    const idNameRules = CommonConstants.MEMBER_NUMBER_RULES;
    //フォームコントロール作成
    this.idNameFormContrl = new FormControl('', [
      AswValidators.required({ params: { key: 0, value: 'label.amcAccountNumber' } }),
      // 会員番号又はメールアドレスの判定
      (control: AbstractControl): ValidationErrors | null => {
        // 入力コンテンツの＠数を取得
        const countAtSigns = (control.value.match(/@/g) || []).length;
        // @が含まれない会員番号場合、
        if (countAtSigns === 0) {
          const lengthsError = AswValidators.lengths({
            fixed: idNameRules.length,
            params: [
              { key: 0, value: 'label.amcAccountNumber' },
              { key: 1, value: idNameRules.length },
            ],
          });

          // 会員番号の数字と桁数チェックを行う
          const numbericError = AswValidators.numeric({
            params: { key: 0, value: 'label.amcAccountNumber' },
          });

          return numbericError(control) || lengthsError(control) || null;
        } else {
          // @が１つ以上含まれたメールアドレス場合、メールの桁数と文字種チェックを行う
          const emailError = AswValidators.email({
            lengthMsgId: 'E0016',
            patternMsgId: 'E0017',
            params: [{ key: 0, value: 'label.eMailAddress' }],
          });

          return emailError(control) || null;
        }

        return null;
      },
    ]);

    this.passwordFormContrl = new FormControl('', [
      AswValidators.required({ params: { key: 0, value: 'label.password' } }),
      // 文字種類チェック
      AswValidators.pattern({
        pattern: CommonConstants.PASSWORD_RULES.pwRegex,
        params: { key: 0, value: 'label.password' },
      }),
    ]);

    this.isSkipEnable = !!this.payload?.skipEvent;

    this.closeWithUrlChange(this._router);
  }
  destroy() {}
  reload() {}

  /**
   * 処理方法が変わるかもしれないのでラッピングしておく
   * @returns
   */
  isNotLogin() {
    return this._common.isNotLogin();
  }

  /**
   * ログインボタン　クリック
   * @param $event
   * @param verifyLogin ログイン前処理のスキップ有無(true : スキップする false : スキップしない)
   * @returns
   */
  async clickLogin($event: any, verifyLogin: boolean = false) {
    //データ取得
    if (this.isNotLogin()) {
      this.idName = this.idNameFormContrl.value.trim();
      this.idNameFormContrl.updateValueAndValidity();
      if (this.idNameFormContrl.errors != null) {
        this.idNameFormContrl.markAsUntouched;
        return;
      }
    }
    this.passwordFormContrl.updateValueAndValidity;
    if (this.passwordFormContrl.errors != null) {
      return;
    }
    this.password = this.passwordFormContrl.value.trim();
    //入力チェック
    if (this._service.isInvalidPassword(this.password)) {
      return;
    }
    if (this.payload?.beforeLoginEvent && !verifyLogin) {
      this.payload.beforeLoginEvent();
    } else {
      //リクエストパラメータ作成
      const request: AuthLoginRequest = {
        membershipNumber: this.isNotLogin() ? (this.idName.includes('@') ? undefined : this.idName) : undefined,
        preferredEmail: this.isNotLogin() ? (this.idName.includes('@') ? this.idName : undefined) : undefined,
        customerPassword: this.password,
        reauthorizationPassward: false,
        orderId: this._aswServiceStoreService.aswServiceData.orderId || undefined,
        lastName: this._aswServiceStoreService.aswServiceData.lastName,
        firstName: this._aswServiceStoreService.aswServiceData.firstName,
        matchesToTraveler: this.payload?.matchesToTraveler ? this.payload.matchesToTraveler : false,
        matchesToMileageRedemptionMember: this.payload?.matchesToMileageRedemptionMember
          ? this.payload.matchesToMileageRedemptionMember
          : false,
      };

      //ログインAPI呼び出し
      this._pageLoadingService.startLoading();
      const req = await this._service.login(request);
      this._pageLoadingService.endLoading();
      //レスポンス処理
      if (req?.status === 200) {
        //正常終了
        if (this.payload?.submitEvent) {
          this.payload.submitEvent();
        }
        this._signalService.sendMergeConfirmSignal();
        this.close();
      } else if ((req.status === 400 || req.status === 401) && this._common.apiError) {
        //APIエラー(400、401)
        this._signalService.isMergeConfirm = false;
        this._signalService.sendMergeConfirmSignal();
        this._service.apiError(this._common.apiError);
      } else {
        this._signalService.isMergeConfirm = false;
        this._signalService.sendMergeConfirmSignal();
      }
    }
  }
  /**
   * ログインなしで進むボタン　クリック
   * @param $event
   */
  clickContinue($event: any) {
    if (this.payload?.skipEvent) {
      this.payload.skipEvent();
    }
    this.close();
  }
}
