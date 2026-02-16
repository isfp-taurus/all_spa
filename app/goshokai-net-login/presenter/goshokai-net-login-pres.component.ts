import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AnabizAuthorizationService } from '@common/services/anabiz-authorization/anabiz-authorization.service';
import { RoutesResRoutes } from '@conf/routes.config';
import { SupportComponent } from '@lib/components/support-class';
import { AswValidators } from '@lib/helpers';
import { AnaBizLoginStatusType, DynamicParams, ErrorType } from '@lib/interfaces';
import { CommonLibService, AuthorizationService, PageLoadingService, PageInitService } from '@lib/services';
import { defer, Observable, of, Subject, take } from 'rxjs';

@Component({
  selector: 'asw-goshokai-net-login-pres',
  templateUrl: './goshokai-net-login-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoshokaiNetLoginPresComponent extends SupportComponent {
  reload(): void {}

  init(): void {
    //ユーザ共通. anaBizLoginStatus ≠ “NOT_LOGIN”の場合、ANA Biz ログアウトAPIを呼び出す
    if (this._common.aswContextStoreService.aswContextData.anaBizLoginStatus !== AnaBizLoginStatusType.NOT_LOGIN) {
      this._anaBizAuthorizationService.anaBizLogoutNext(
        {},
        (data) => {
          this._pageInitService.endInit(this.params);
        },
        (error) => {
          //ANA Biz ログアウトAPIからエラーが返却された場合、エラータイプに” system”(システムエラー)を、継続不可能なエラー情報として設定する。
          this._common.errorsHandlerService.setNotRetryableError({ errorType: ErrorType.SYSTEM });
        }
      );
    } else {
      this._pageInitService.endInit(this.params);
    }
    this.checkvalidation();
  }

  destroy(): void {}

  @Input() params: Observable<DynamicParams> = of({});

  @Output()
  event$!: Observable<any>;
  click$: Subject<any> = new Subject<any>();
  //inputのフォーム
  public inputFG!: FormGroup;
  public inputFG_2!: FormGroup;

  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _authorizationService: AuthorizationService,
    private _anaBizAuthorizationService: AnabizAuthorizationService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _pageLoadingService: PageLoadingService,
    private _pageInitService: PageInitService
  ) {
    super(_common);
  }

  //バリデーションチェック
  checkvalidation() {
    this.inputFG = new FormGroup({
      inputFC: new FormControl('', [
        AswValidators.required({ params: { key: 0, value: 'label.introduce.introduceNumber' } }),
        AswValidators.lengths({
          min: 8,
          params: [
            { key: 0, value: 'label.introduce.introduceNumber' },
            { key: 1, value: 8 },
          ],
        }),
        AswValidators.pattern({
          // 数字の入力の制限がない
          pattern: '^[A-Za-z]{3}[0-9]+$',
          // 数字の制限があります
          // pattern: '^[A-Za-z]{3}[0-9]{4}$',
          errorMsgId: 'E0250',
        }),
      ]),
    });
    this.inputFG_2 = new FormGroup({
      firstName: new FormControl('', [
        AswValidators.required({ params: { key: 0, value: 'label.firstName' } }),
        AswValidators.pattern({
          pattern: '^[\u30A0-\u30FF]+$',
          errorMsgId: 'E0251',
        }),
        AswValidators.pattern({
          pattern: '[^ヵヶヮ]+$',
          errorMsgId: 'E0252',
        }),
      ]),
      lastName: new FormControl('', [
        AswValidators.required({ params: { key: 0, value: 'label.lastName' } }),
        AswValidators.pattern({
          pattern: '^[\u30A0-\u30FF]+$',
          errorMsgId: 'E0251',
        }),
        AswValidators.pattern({
          pattern: '[^ヵヶヮ]+$',
          errorMsgId: 'E0252',
        }),
      ]),
    });
  }

  /**
   * 各入力を更新して未入力エラーを検出
   */
  checkmarkAllAsTouched() {
    this.inputFG.controls['inputFC'].markAllAsTouched();
    this.inputFG_2.controls['firstName'].markAllAsTouched();
    this.inputFG_2.controls['lastName'].markAllAsTouched();
  }

  /**
   * `click`イベント
   *
   */
  public async onClickEvent(): Promise<void> {
    //1	個別入力チェックの結果、エラーが1件以上存在している場合、エラータイプ＝”xxx”(継続可能)、エラーメッセージの指定なしにてエラー情報を指定し、処理を終了する。
    this.checkmarkAllAsTouched();
    if (
      this.inputFG.controls['inputFC'].errors ||
      this.inputFG_2.controls['firstName'].errors ||
      this.inputFG_2.controls['lastName'].errors
    ) {
      // WCAG エラー項目へのフォーカス
      this._changeDetectorRef.detectChanges();
      const el = document.getElementById('goshokainet-login-form-area');
      const tagStr = 'input:not([disabled]), select:not([disabled])';
      if (el) {
        const elements = el.querySelectorAll<HTMLElement>(tagStr);
        // 入力項目から最初のエラー項目を探す
        const elForm = Array.from(elements).find((elm) => {
          return elm.getAttribute('aria-invalid') === 'true';
        });
        elForm?.focus();
      }
      return;
    }
    //画面から入力するデータを習得
    const requestParameter = {
      introduceNumber: this.inputFG.controls['inputFC']?.value ?? '',
      introducerFirstName: this.inputFG_2.controls['firstName']?.value ?? '',
      introducerLastName: this.inputFG_2.controls['lastName']?.value ?? '',
    };
    this._pageLoadingService.startLoading();
    //2 APIをコール
    const ret = await this._authorizationService.initializeGoshokaiNet(requestParameter);
    this._pageLoadingService.endLoading();
    //レスポンス処理
    if (ret.status === 200) {
      //正常終了
      //3	ユーザ共通に紹介番号、(名)、(姓)を設定する。
      this._common.aswContextStoreService.updateAswContext(requestParameter);

      //4 フライト検索画面に遷移します。
      this._router.navigate([RoutesResRoutes.FLIGHT_SEARCH]);
    } else if (ret.status === 400 && this._common.apiError) {
      //APIエラー(400)
    }
  }
}
