import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { apiEventAll } from '@common/helper';
import { ReservationFunctionIdType, ReservationPageIdType } from '@common/interfaces';
import { GetCompanyAccountsStoreService } from '@common/services';
import { SupportPageComponent } from '@lib/components/support-class';
import { ErrorType } from '@lib/interfaces';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService, PageInitService } from '@lib/services';
import { BehaviorSubject } from 'rxjs';
import { GetCompanyAccountsResponseDataCompanyInfoCsInner } from 'src/sdk-authorization';
import {
  OrganizationSelectDynamicParams,
  defaultOrganizationSelectDynamicParams,
} from './organization-select-cont.state';
import { ErrorCodeConstants } from '@conf/app.constants';

/**
 * ANA Biz組織選択
 */
@Component({
  selector: 'asw-organization-select-cont',
  templateUrl: './organization-select-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationSelectContComponent extends SupportPageComponent {
  /** ページID */
  pageId: string = ReservationPageIdType.ORGANIZATION_SELECT;
  /** 機能ID */
  functionId: string = ReservationFunctionIdType.LOGIN;

  /**　初期化処理自動完了をオフにする */
  override autoInitEnd = false;
  /** 組織リストデータ */
  public companyAccountsData?: GetCompanyAccountsResponseDataCompanyInfoCsInner[];

  /** コンストラクタ */
  constructor(
    private _common: CommonLibService,
    private _pageInitService: PageInitService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _staticMsg: StaticMsgPipe,
    private _title: Title,
    public _getCompanyAccountsStoreService: GetCompanyAccountsStoreService
  ) {
    super(_common, _pageInitService);
    this.setInitialAswCommon();
  }

  /**
   * 初期表示の画面情報をセット
   */
  setInitialAswCommon() {
    // 画面情報への機能ID、ページID設定
    this._common.aswCommonStoreService.updateAswCommon({
      functionId: this.functionId,
      pageId: this.pageId,
      subFunctionId: '',
      subPageId: '',
      isEnabledLogin: false,
      isUpgrade: false,
    });
  }

  /**
   * 初期表示処理
   */
  init(): void {
    this.setPageTitle();

    // 組織一覧情報storeをリセット
    this._getCompanyAccountsStoreService.resetGetCompanyAccounts();

    // ANA Biz組織リスト取得API実行
    this.callGetCompanyAccountsApi();
  }

  /**
   * タイトルをセット
   */
  setPageTitle() {
    // タブバーに画面タイトルを設定する
    this.forkJoinService(
      'OrganizationSelectTitle',
      [this._staticMsg.get('heading.selectOrganization'), this._staticMsg.get('label.aswPageTitle')],
      ([str1, str2]) => {
        this._title.setTitle(str1 + str2);
      }
    );
  }

  /**
   * ANA Biz組織リスト取得API実行
   */
  callGetCompanyAccountsApi() {
    apiEventAll(
      () => {
        this._getCompanyAccountsStoreService.setGetCompanyAccountsFromApi();
      },
      this._getCompanyAccountsStoreService.getCompanyAccounts$(),
      (response) => {
        // 動的文言
        const dynamicSubject = new BehaviorSubject<OrganizationSelectDynamicParams>(
          defaultOrganizationSelectDynamicParams(response)
        );
        this._pageInitService.endInit(dynamicSubject.asObservable());

        this.companyAccountsData = response.data?.companyInfoCs;
        this._changeDetectorRef.markForCheck();
      },
      (error) => {
        this._pageInitService.endInit();
        const errorCodeMap: { [key: string]: string } = {
          [ErrorCodeConstants.ERROR_CODES.EAPZ000029]: 'E0846', // リクエストパラメータが形式不正
          [ErrorCodeConstants.ERROR_CODES.EAPZ000028]: 'E0848', // ログインステータスが不正
        };

        const apiCode = this._common.apiError?.errors?.[0]?.code ?? '';
        const code = errorCodeMap[apiCode];

        this._common.errorsHandlerService.setNotRetryableError({
          errorType: ErrorType.BUSINESS_LOGIC,
          apiErrorCode: apiCode,
          errorMsgId: code,
        });
        this._getCompanyAccountsStoreService.resetGetCompanyAccounts();
      }
    );
  }

  reload(): void {}
  destroy(): void {}
}
