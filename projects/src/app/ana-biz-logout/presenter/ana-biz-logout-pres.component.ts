import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { apiEventAll } from '@common/helper';
import { AnaBizLogoutStoreService } from '@common/services';
import { SupportComponent } from '@lib/components/support-class';
import { AnaBizLoginStatusType, ErrorType } from '@lib/interfaces';
import { LinkUrlPipe } from '@lib/pipes';
import { CommonLibService, PageInitService } from '@lib/services';
@Component({
  selector: 'asw-ana-biz-logout-pres',
  templateUrl: './ana-biz-logout-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnaBizLogoutPresComponent extends SupportComponent {
  constructor(
    private _common: CommonLibService,
    private _linkUrl: LinkUrlPipe,
    private _anaBizLogoutStoreService: AnaBizLogoutStoreService,
    private _router: Router,
    private _pageInitService: PageInitService
  ) {
    super(_common);
  }

  init(): void {
    this.callAnaBizLogoutApi();
  }

  /**
   * ANA BizログアウトAPI実行
   */
  callAnaBizLogoutApi() {
    apiEventAll(
      () => {
        this._anaBizLogoutStoreService.setAnaBizLogoutFromApi({});
      },
      this._anaBizLogoutStoreService.getAnaBizLogout$(),
      (response) => {
        this._pageInitService.endInit();
        // ANA Bizログインステータスを未ログインに更新
        this._common.aswContextStoreService.updateAswContext({ anaBizLoginStatus: AnaBizLoginStatusType.NOT_LOGIN });

        // ANA Bizログイン情報を削除
        this._common.anaBizContextStoreService.resetAnaBizContext();
      },
      (error) => {
        const apiCode = this._common.apiError?.errors?.[0]?.code ?? '';
        const code = 'E1043';

        this._common.errorsHandlerService.setNotRetryableError({
          errorType: ErrorType.BUSINESS_LOGIC,
          apiErrorCode: apiCode,
          errorMsgId: code,
        });
        this._anaBizLogoutStoreService.resetAnaBizLogout();
      }
    );
  }

  clickGoToAswTopEvent() {
    const url = this._common.aswMasterService.getMPropertyByKey('application', 'topServer');
    window.location.href = this._linkUrl.transform(url);

    this._router.navigate([window]);
  }

  reload(): void {}
  destroy(): void {}
}
