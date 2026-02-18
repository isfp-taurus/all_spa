/**
 * AMCパスワード入力画面
 *
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SupportModalIdComponent } from '@lib/components/support-class';
import { CommonLibService, PageInitService, PageLoadingService } from '@lib/services';
import { PasswordInputService } from './password-input.service';
import { apiEventAll, defaultApiErrorEvent } from '@common/helper';
import { PageType } from '@lib/interfaces';
import { AswValidators } from '@lib/helpers/validate/validators';
import { AuthLoginRequest } from 'src/sdk-member';
import { CommonConstants, ErrorCodeConstants } from '@conf/app.constants';
import { ErrorType } from '@lib/interfaces';
import { GetCreditPanInformationApiErrorMap } from './password-input-payload.state';

@Component({
  selector: 'asw-password-input',
  templateUrl: './password-input.component.html',
  providers: [PasswordInputService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordInputComponent extends SupportModalIdComponent {
  override autoInitEnd = false;

  subPageId: string = 'M081';
  subFunctionId: string = 'R01';

  amcNumber: string = '';
  public password: string = '';
  public passwordFormControl!: FormControl;

  constructor(
    private _common: CommonLibService,
    private _pageInitService: PageInitService,
    private _service: PasswordInputService,
    private _pageLoadingService: PageLoadingService
  ) {
    super(_common, _pageInitService);
    this._common.aswCommonStoreService.updateAswCommon({
      subFunctionId: this.subFunctionId,
      subPageId: this.subPageId,
    });
  }

  init() {
    // ユーザ共通storeから会員情報.会員番号を取得
    this.amcNumber = this._common.amcMemberStoreService.amcMemberData.iFlyMemberInfo?.membershipNumber ?? '';
    if (this.amcNumber.length > 4) {
      this.amcNumber = '*'.repeat(this.amcNumber.length - 4) + this.amcNumber.substr(-4);
    }

    this.passwordFormControl = new FormControl('', [
      AswValidators.required({ params: { key: 0, value: 'label.password' } }),
      // 文字種類チェック
      AswValidators.pattern({
        pattern: CommonConstants.PASSWORD_RULES.pwRegex,
        params: { key: 0, value: 'label.password' },
      }),
    ]);

    this._pageInitService.subDynamicInit(this.params);
    this._pageInitService.endInit(null);
  }

  reload() {}

  clickLogin() {
    this.passwordFormControl.updateValueAndValidity;
    if (this.passwordFormControl.errors != null) {
      return;
    }
    this._pageLoadingService.startLoading();
    this.password = this.passwordFormControl.value;
    if (this._service.checkPassword(this.password)) {
      // ローディングレイヤーを終了、継続可能エラーを設定する
      this._pageLoadingService.endLoading();
      this._common.errorsHandlerService.setRetryableError(PageType.SUBPAGE, {
        errorMsgId: 'E0001',
        params: { key: 0, value: 'label.password' },
      });
      return;
    }

    if (this._service.isInvalidPassword(this.password)) {
      // ローディングレイヤーを終了、継続可能エラーを設定する
      this._pageLoadingService.endLoading();
      this._common.errorsHandlerService.setRetryableError(PageType.SUBPAGE, {
        errorMsgId: 'E0327',
      });
      return;
    }

    //リクエストパラメータ作成
    const requestParameter: AuthLoginRequest = {
      customerPassword: this.password,
      reauthorizationPassward: true,
    };

    this.authLogin(requestParameter);
  }

  /**
   * ログイン認証API呼び出し
   * @param requestParameter
   */
  authLogin(requestParameter: AuthLoginRequest) {
    this._service.invokeAuthLoginApi(
      requestParameter,
      (response) => {
        // 正常時、クレジットカードPAN情報取得APIを呼び出す
        this.getCreditPanInfo();
      },
      (error) => {
        // apiErrorが非同期で設定されるのを待つ
        this._common.apiErrorResponseService.getApiErrorResponse$().subscribe((apiError) => {
          if (apiError) {
            // apiErrorがnullでない場合にエラーコードを取得
            const apiErrorCode = apiError.errors?.[0]?.code ?? '';
            // エラー処理
            const messageId = CommonConstants.LOGIN_API_ERROR_MAP[apiErrorCode] ?? 'E0327';

            if (apiErrorCode === ErrorCodeConstants.ERROR_CODES.FIFA000002) {
              this._common.errorsHandlerService.setNotRetryableError({
                errorType: ErrorType.BUSINESS_LOGIC,
                apiErrorCode: apiErrorCode,
                errorMsgId: messageId,
              });
              // 継続不可エラー時はそのままモーダルを閉じる
              this.close();
            } else {
              this._common.errorsHandlerService.setRetryableError(PageType.SUBPAGE, {
                errorMsgId: messageId,
                apiErrorCode: apiErrorCode,
              });
            }
          }
          this._pageLoadingService.endLoading();
        });
      }
    );
  }

  /**
   * クレジットカードPAN情報取得API呼び出し
   */
  getCreditPanInfo() {
    this._service.invokeGetCreditPanInformationApi(
      (response) => {
        // クレジットカードPAN情報取得APIが正常時、受信したクレジットカード情報を元画面に渡し、モーダルを閉じる
        const result = response?.model?.data;
        this._pageLoadingService.endLoading();
        this.close(result);
      },
      (error) => {
        // apiErrorが非同期で設定されるのを待つ
        this._common.apiErrorResponseService.getApiErrorResponse$().subscribe((apiError) => {
          if (apiError) {
            // apiErrorがnullでない場合にエラーコードを取得
            const errorCode = apiError.errors?.[0]?.code ?? '';
            // エラー処理
            defaultApiErrorEvent(
              errorCode,
              GetCreditPanInformationApiErrorMap,
              (retryable) => {
                this._common.errorsHandlerService.setRetryableError(PageType.SUBPAGE, retryable);
                window.scroll({
                  top: 0,
                } as ScrollToOptions);
              },
              (notRetryable) => {
                this._common.errorsHandlerService.setNotRetryableError(notRetryable);
                // 継続不可エラー時はそのままモーダルを閉じる
                this.close();
              }
            );
          }
          this._pageLoadingService.endLoading();
        });
      }
    );
  }

  destroy(): void {
    this.deleteSubscription('paymentInputComponent_authLogin');
    this.deleteSubscription('paymentInputComponent_getCreditPanInformation');
  }
}
