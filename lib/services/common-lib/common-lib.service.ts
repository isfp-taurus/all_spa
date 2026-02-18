/**
 * 汎用サービス
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '../../components/support-class';
import { AswServiceStoreService } from '../asw-service-store/asw-service-store.service';
import { AswCommonStoreService } from '../asw-common-store/asw-common-store.service';
import { AswContextStoreService } from '../asw-context-store/asw-context-store.service';
import { AMCMemberStoreService } from '../amc-member-store/amc-member-store.service';
import { AlertMessageStoreService } from '../alert-message-store/alert-message-store.service';
import { ErrorsHandlerService } from '../errors-handler/errors-handler.service';
import { NotificationStoreService } from '../notification-store/notification-store.service';
import { ApiErrorResponseService } from '../api-error-response/api-error-response.service';
import { AswMasterService } from '../asw-master/asw-master.service';
import { AnaBizContextStoreService } from '../ana-biz-context-store/ana-biz-context-store.service';
import { DynamicContentService } from '../dynamic-content/dynamic-content.service';
import { ApiErrorResponseModel, LoginStatusType, AnaBizLoginStatusType } from '../../interfaces';
import { LoggerDatadogService } from '../logger-datadog/logger-datadog.service';
import { ConfidentialStoreService } from '../confidential-store/confidential-store.service';
import { CommonConstants } from '@conf/app.constants';
import { LoginInfoStoreService } from '../login-info-store/login-info-store.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

/**
 * 汎用サービス
 *
 * ユーザー共通情報などよく使うサービスをひとまとまりにしたサービス
 *
 * 以下のサービスを内部に持つ　BaseComponentを使用したコンポーネントで以下のサービスを直接使おうとすると循環参照になって動かないのでCommonLibServiceを使うこと
 * @param alertMessageStoreService @see AlertMessageStoreService
 * @param apiErrorResponseService @see ApiErrorResponseService,
 * @param aswContextStoreService @see AswContextStoreService
 * @param aswCommonStoreService @see AswCommonStoreService
 * @param aswServiceStoreService @see AswServiceStoreService
 * @param amcMemberStoreService @see AMCMemberStoreService
 * @param anaBizContextStoreService @see AnaBizContextStoreService
 * @param dynamicContentService @see DynamicContentService
 * @param errorsHandlerService @see ErrorsHandlerService
 * @param notificationStoreService: @see NotificationStoreService
 * @param confidentialStoreService @see ConfidentialStoreService
 */
@Injectable()
export class CommonLibService extends SupportClass {
  constructor(
    public alertMessageStoreService: AlertMessageStoreService,
    public apiErrorResponseService: ApiErrorResponseService,
    public aswContextStoreService: AswContextStoreService,
    public aswCommonStoreService: AswCommonStoreService,
    public aswServiceStoreService: AswServiceStoreService,
    public amcMemberStoreService: AMCMemberStoreService,
    public anaBizContextStoreService: AnaBizContextStoreService,
    public dynamicContentService: DynamicContentService,
    public errorsHandlerService: ErrorsHandlerService,
    public notificationStoreService: NotificationStoreService,
    public aswMasterService: AswMasterService,
    public confidentialStoreService: ConfidentialStoreService,
    public loggerDatadogService: LoggerDatadogService,
    private _loginInfoStoreService: LoginInfoStoreService
  ) {
    super();
    this.subscribeService(
      'CommonLibService_getApiErrorResponse',
      this.apiErrorResponseService.getApiErrorResponse$(),
      (state) => {
        this.apiError = state;
      }
    );
  }

  destroy() {}

  //　判定したいときobservableでは使えないのでcommonにデータを保持しておく
  public apiError: ApiErrorResponseModel | null = null;

  /**
   * 未ログインチェック
   * @returns ログインステータスがNOT_LOGINであればtrue
   */
  isNotLogin() {
    return this.aswContextStoreService.aswContextData.loginStatus === LoginStatusType.NOT_LOGIN;
  }

  /**
   * 日本オフィスチェック
   * @returns 日本オフィスであればtrue　統合オフィスコードが日本であるかを判定
   *
   * 参考
   * 有償日本オフィス "CommonConstants.OFFICE_CODE_JP_R";
   * 有償日本オフィスAPF "CommonConstants.OFFICE_CODE_JP_R_APF";
   * 特典日本オフィス "CommonConstants.OFFICE_CODE_JP_A";
   * 日本統合オフィスコード "CommonConstants.OFFICE_CODE_JP";
   *
   */
  isJapaneseOffice() {
    return this.aswContextStoreService.aswContextData.pointOfSaleId.startsWith(CommonConstants.OFFICE_CODE_JP);
  }

  /**
   * APFオフィスチェック
   * @returns APFであればtrue
   *
   * 参考
   * 有償APFオフィス "CommonConstants.OFFICE_CODE_JP_R_APF"
   */
  isApfOffice() {
    return this.aswContextStoreService.aswContextData.pointOfSaleId === CommonConstants.OFFICE_CODE_JP_R_APF;
  }

  /**
   * セッションストレージ情報操作 読み取り
   * @param sessionName セッションストレージ名
   * @param isJson Jsonデータの場合true
   * @returns セッションストレージの値　存在しない場合null
   */
  public loadSessionStorage(sessionName: string, isJson = false): any {
    const session = sessionStorage.getItem(sessionName);
    if (session) {
      if (isJson) {
        return JSON.parse(session); // errorにしてあげたほうが良いのでtry catchしない
      } else {
        return session;
      }
    }
    return null;
  }

  /**
   * セッションストレージ情報操作 書き込み
   * @param item 保存するデータ
   * @param sessionName セッションストレージ名
   * @param isJson Jsonデータの場合true
   */
  public saveSessionStorage(item: any, sessionName: string, isJson = false): void {
    sessionStorage.setItem(sessionName, isJson ? JSON.stringify(item) : item);
  }

  /**
   * 提携サイトへのURLを取得する
   * 法人、会員、非会員によって異なるURLをマスタから取得する。
   * @returns 提携サイトへのURL
   */
  public getAllSiteUrl(): string {
    let url = '';
    const returnUrl = this.aswContextStoreService.aswContextData.returnUrl;
    if (CommonConstants.RETURN_URL_SWITCH_ENABLED && returnUrl !== null && returnUrl !== '') {
      //提携社サイトに戻る際のURL切り替え機能が有効かつ、returnUrlが指定されている場合、そのURLを返す。
      url = returnUrl;
    } else if (this.aswContextStoreService.aswContextData.anaBizLoginStatus === AnaBizLoginStatusType.LOGIN) {
      //法人の場合
      if (this.aswContextStoreService.aswContextData.lang === 'ja') {
        url = this.aswMasterService.getMPropertyByKey('application', 'url.bizTop.redirect.ja');
      } else {
        url = this.aswMasterService.getMPropertyByKey('application', 'url.bizTop.redirect.en');
      }
    } else if (this.aswContextStoreService.aswContextData.loginStatus === LoginStatusType.REAL_LOGIN) {
      //個札（法人ではない）かつ、会員の場合
      if (this.aswContextStoreService.aswContextData.lang === 'ja') {
        url = this.aswMasterService.getMPropertyByKey('application', 'url.memberTop.redirect.ja');
      } else {
        url = this.aswMasterService.getMPropertyByKey('application', 'url.memberTop.redirect.en');
      }
    } else {
      //個札（法人ではない）かつ、非会員の場合
      if (this.aswContextStoreService.aswContextData.lang === 'ja') {
        url = this.aswMasterService.getMPropertyByKey('application', 'url.nonMemberTop.redirect.ja');
      } else {
        url = this.aswMasterService.getMPropertyByKey('application', 'url.nonMemberTop.redirect.en');
      }
    }
    return url;
  }

  /**
   * 提携サイトに遷移する。
   *
   */
  public navigateAllSite() {
    const url = this.getAllSiteUrl();

    //ログイン情報連携機能が無効、または未ログインの場合、そのまま遷移する。
    const isLoggedIn = this.aswContextStoreService.aswContextData.loginStatus === LoginStatusType.REAL_LOGIN;
    const isBusinessLoggedIn =
      this.aswContextStoreService.aswContextData.anaBizLoginStatus === AnaBizLoginStatusType.LOGIN;
    if (!CommonConstants.LOGIN_INFO_INTEGRATION_ENABLED || (!isLoggedIn && !isBusinessLoggedIn)) {
      //ログイン情報連携機能が無効の場合と未ログインの場合はそのまま遷移する。
      window.location.href = url;
      return;
    }

    //暗号化されたログイン情報を取得して、POSTで遷移する。
    this.subscribeService(
      'CommonLibService_getEncryptedLoginInfo',
      this._loginInfoStoreService.getEncryptedLoginInfo$().pipe(take(1)),
      (state) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;
        form.target = '_self';

        const data = state?.model?.data;
        const jsonData = JSON.parse(JSON.stringify(data));
        Object.keys(jsonData).forEach((key) => {
          //値が存在しない場合は送信しない。
          if (jsonData[key] === null || jsonData[key] === '') {
            return;
          }
          const input = document.createElement('input');
          input.type = 'hidden';
          if (key == 'connectionKind') {
            input.name = 'CONNECTION_KIND';
          } else if (key == 'lang') {
            input.name = 'LANG';
          } else {
            input.name = key;
          }
          input.value = jsonData[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      }
    );
  }
}
