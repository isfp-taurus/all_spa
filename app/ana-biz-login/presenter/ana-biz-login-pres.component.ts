import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { apiEventAll } from '@common/helper';
import { AnaBizLoginCookieType } from '@common/interfaces';
import { AnaBizLoginStoreService, AnaBizTopService } from '@common/services';
import { RoutesResRoutes } from '@conf/routes.config';
import { SupportComponent } from '@lib/components/support-class';
import { AswValidators } from '@lib/helpers';
import {
  AnaBizLoginStatusType,
  ErrorType,
  NotRetryableErrorModel,
  PageType,
  RetryableError,
  LoginStatusType,
  SessionStorageName,
} from '@lib/interfaces';
import { StaticMsgPipe } from '@lib/pipes';
import { AswMasterService, CommonLibService, PageLoadingService } from '@lib/services';
import { AuthorizationRequest, BizLoginInfoAnaBizContext } from 'src/sdk-authorization';
import { AnaBizSeamlessLoginQueryParam } from './ana-biz-login-pres-state';
import { HttpClient } from '@angular/common/http';
import { tap, lastValueFrom, take } from 'rxjs';
import { environment } from '@env/environment';
import { AnaBizLoginPresService } from './ana-biz-login-pres.service';
import { DialogConfirmService } from '../sub-components/dialog-confirm';
import { ErrorCodeConstants } from '@conf/app.constants';

@Component({
  selector: 'asw-ana-biz-login-pres',
  templateUrl: './ana-biz-login-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnaBizLoginPresComponent extends SupportComponent {
  /** ANA Bizログイン cookie情報 */
  @Input()
  anaBizLoginCookie: AnaBizLoginCookieType = {};

  public inputFG: FormGroup;
  public connectionTypeTexts: string[] = [];
  /**
   * - 0 : 出張者ログインの場合
   * - 1 : 管理者ログインの場合
   */
  public connectionTypeSelectValue = 0;
  public passwordKeepCheck = new FormControl(false);
  /**
   * - 1 : パスワードを一緒に保存する
   * - 2 : パスワードは保存しない
   */
  public passwordKeepCheckRadioGroup = new FormControl('1');
  public amcLoginKeepCheck = new FormControl(false);

  /** パラメータのgetとpostを格納（不要であれば削除する） */
  private queryParam: any = {};
  private postParam: any = {};

  private _isSeamlessLogin: boolean = false;

  public amcNoReminderUrl: string = '';
  public amcPasswordReminderUrl: string = '';

  constructor(
    public _common: CommonLibService,
    private _http: HttpClient,
    private _router: Router,
    private _staticMsg: StaticMsgPipe,
    private _anaBizLoginStoreService: AnaBizLoginStoreService,
    private _anaBizTopService: AnaBizTopService,
    private _aswMasterService: AswMasterService,
    private _anaBizLoginPresService: AnaBizLoginPresService,
    private _pageLoadingService: PageLoadingService,
    private _dialogConfirmService: DialogConfirmService
  ) {
    super(_common);

    this.connectionTypeTexts = [
      this._staticMsg.transform('label.businessTraveler'),
      this._staticMsg.transform('label.administrator'),
    ];

    this.inputFG = new FormGroup({
      companyAndOrganizationId: new FormControl('', [
        AswValidators.required({ params: { key: 0, value: 'label.companyAndOrganizationId' } }),
        AswValidators.alphaNumeric({ params: { key: 0, value: 'label.companyAndOrganizationId' } }),
      ]),
      password: new FormControl('', [AswValidators.required({ params: { key: 0, value: 'label.password' } })]),
      administratorId: new FormControl(
        '',
        this.connectionTypeSelectValue === 0
          ? [
              AswValidators.required({ params: { key: 0, value: 'label.administratorId' } }),
              AswValidators.alphaNumeric({ params: { key: 0, value: 'label.administratorId' } }),
              AswValidators.lengths({
                min: 6,
                params: [
                  { key: 0, value: 'label.administratorId' },
                  { key: 1, value: 6 },
                ],
              }),
            ]
          : [
              AswValidators.alphaNumeric({ params: { key: 0, value: 'label.administratorId' } }),
              AswValidators.lengths({
                min: 6,
                params: [
                  { key: 0, value: 'label.administratorId' },
                  { key: 1, value: 6 },
                ],
              }),
            ]
      ),
      amcNumber: new FormControl('', [
        AswValidators.numeric({ params: { key: 0, value: 'label.aNAMileageClubNumber' } }),
        AswValidators.lengths({
          fixed: 10,
          params: [
            { key: 0, value: 'label.aNAMileageClubNumber' },
            { key: 1, value: 10 },
          ],
        }),
      ]),
      amcPassword: new FormControl(''),
      anaBizLoginRadioGroup: new FormControl(''),
    });

    const amcNumber = this.inputFG.get('amcNumber');
    const amcPassword = this.inputFG.get('amcPassword');

    if (amcNumber && amcPassword) {
      const amcPasswordValidatorRequired = [AswValidators.required({ params: { key: 0, value: 'label.password' } })];
      this.subscribeService('onChangeAmcNumber', amcNumber.valueChanges, (value) => {
        if (value) {
          amcPassword.addValidators(amcPasswordValidatorRequired);
        } else {
          amcPassword.removeValidators(amcPasswordValidatorRequired);
        }
        amcPassword.updateValueAndValidity({ emitEvent: false });
      });

      const amcNumberValidatorRequired = [
        AswValidators.required({ params: { key: 0, value: 'label.aNAMileageClubNumber' } }),
      ];
      this.subscribeService('onChangeAmcPassword', amcPassword.valueChanges, (value) => {
        if (value) {
          amcNumber.addValidators(amcNumberValidatorRequired);
        } else {
          amcNumber.removeValidators(amcNumberValidatorRequired);
        }
        amcNumber.updateValueAndValidity({ emitEvent: false });
      });
    }
  }

  init(): void {
    // URL取得
    this.amcNoReminderUrl =
      this._common.aswContextStoreService.aswContextData.lang === 'ja'
        ? this._aswMasterService.getMPropertyByKey('application', 'url.cam.amcNoReminder.japanese')
        : this._aswMasterService.getMPropertyByKey('application', 'url.cam.amcNoReminder.notJapanese');
    this.amcPasswordReminderUrl =
      this._common.aswContextStoreService.aswContextData.lang === 'ja'
        ? this._aswMasterService.getMPropertyByKey('application', 'url.cam.amcPasswordReminder.japanese')
        : this._aswMasterService.getMPropertyByKey('application', 'url.cam.amcPasswordReminder.notJapanese');

    // ANA Bizログイン cookie情報をセットする
    this.setAnaBizLoginCookie();

    this.clickPasswordKeepCheck(this.passwordKeepCheck.value ?? false);

    /** パラメータの格納 */
    this.queryParam = (window as any).Asw?.ApiRequestParam?.query ?? {};
    this.postParam = (window as any).Asw?.ApiRequestParam?.post ?? {};
    // パラメータにログインIDとパスワードが設定されていたらログイン処理を行う（画面を表示しない）
    if (this._anaBizLoginPresService.isSeamlessLoginURL(window.location.href)) {
      this._isSeamlessLogin = true;
      this.connectionTypeSelectValue = !!this.postParam.adminUserId ? 1 : 0;
      this.loginprocess(
        AuthorizationRequest.ConnectionTypeEnum.Seamless,
        this.postParam.loginId,
        this.postParam.loginPw,
        this.postParam.adminUserId,
        this.postParam.userId,
        this.postParam.passwd
      );
      return;
    }

    // ANA Bizログイン画面をログイン済みの状態で再訪した場合は、パラメータ指定なしでANA Biz TOPへ遷移
    if (this.isAnaBizLogin()) {
      this.autoRedirectANABizTop();
      return;
    }

    // クエリパラメータ.loginTypeの値に応じ表示モードを切り替える
    const loginType: string | undefined = this.queryParam[AnaBizSeamlessLoginQueryParam.LOGIN_TYPE];
    switch (loginType) {
      case '1':
        // 出張者ログインの場合
        this.connectionTypeSelectValue = 0;
        break;
      case '2':
        // 管理者ログインの場合
        this.connectionTypeSelectValue = 1;
        break;
    }
  }

  reload(): void {}
  destroy(): void {}

  /**
   * 中間JSPページではなく、ANA Biz TOPへ遷移
   */
  autoRedirectANABizTop() {
    const pathVariables = { lang: this._common.aswContextStoreService.aswContextData.lang };
    const url = this._anaBizTopService.formatUrl(
      this._common.aswMasterService.getMPropertyByKey('application', 'url.anaBizTop'),
      pathVariables
    );
    window.location.href = url;
  }

  isAnaBizLogin(): boolean {
    return this._common.aswContextStoreService.aswContextData.anaBizLoginStatus === AnaBizLoginStatusType.LOGIN;
  }

  /**
   * ANA Bizログイン cookie情報をセットする
   */
  setAnaBizLoginCookie() {
    this.inputFG.controls['companyAndOrganizationId'].setValue(this.anaBizLoginCookie.loginId);
    this.inputFG.controls['password'].setValue(this.anaBizLoginCookie.loginPassword);
    this.passwordKeepCheck.setValue(!!this.anaBizLoginCookie.hasBizCompanyCookie);
    this.passwordKeepCheckRadioGroup.setValue(this.anaBizLoginCookie.hasBizCompanyCookiePassword ? '0' : '1');
    this.inputFG.controls['administratorId'].setValue(this.anaBizLoginCookie.adminUserId);
  }

  /**
   * ANA Bizログイン情報保存チェックボックス押下
   * @param checkBox
   */
  clickPasswordKeepCheck(checked: boolean) {
    if (checked) {
      this.inputFG.controls['anaBizLoginRadioGroup'].enable();
    } else {
      this.inputFG.controls['anaBizLoginRadioGroup'].disable();
    }
  }

  /**
   * ANA Bizログイン押下
   */
  clickLoginEvent() {
    // フォームエラーチェック
    this.inputFG.markAllAsTouched();

    const loginErrors =
      this.inputFG.controls['companyAndOrganizationId'].errors || this.inputFG.controls['password'].errors;
    const amcLoginErrors =
      this._common.isNotLogin() &&
      (this.inputFG.controls['amcNumber'].errors || this.inputFG.controls['amcPassword'].errors);

    if (this.connectionTypeSelectValue === 0) {
      if (loginErrors || amcLoginErrors) {
        return;
      }
    } else if (this.connectionTypeSelectValue === 1) {
      if (loginErrors || amcLoginErrors || this.inputFG.controls['administratorId'].errors) {
        return;
      }
    }

    // ログイン処理
    this.loginprocess(
      AuthorizationRequest.ConnectionTypeEnum.Normal,
      this.inputFG.controls['companyAndOrganizationId'].value,
      this.inputFG.controls['password'].value,
      this.inputFG.controls['administratorId'].value,
      this.inputFG.controls['amcNumber'].value,
      this.inputFG.controls['amcPassword'].value
    );
  }

  /**
   * ログイン処理
   * 　パラメータが設定されたときとANA Bizログイン押下時の共通処理
   */
  private loginprocess(
    connectionType: AuthorizationRequest.ConnectionTypeEnum,
    companyOrOrganizationCode: string,
    companyPassword: string,
    adminUserId: string,
    amcNumber: string,
    amcPassword: string
  ) {
    // クエリパラメータの値を取得
    // const postParams = (window as any).Asw?.ApiRequestParam?.post ?? {};
    const postParams = this.postParam ?? {};

    // ANA BizログインAPI リクエスト作成
    let authorizationRequestParam: AuthorizationRequest = {
      connectionType: connectionType,
      companyOrOrganizationCode: companyOrOrganizationCode,
      companyPassword: companyPassword,
      saveCompanyOrOrganizationCode: this.passwordKeepCheck.value ?? false,
      saveCompanyPassword: this.passwordKeepCheckRadioGroup.value === '0' ? true : false,
    };
    const userIdParam = postParams?.[AnaBizSeamlessLoginQueryParam.USER_ID];
    const passwdParam = postParams?.[AnaBizSeamlessLoginQueryParam.PASSWD];
    if (userIdParam) authorizationRequestParam.amcNumber = userIdParam;
    if (passwdParam) authorizationRequestParam.amcPassword = passwdParam;

    // 管理者ログインの場合
    if (this.connectionTypeSelectValue === 1) {
      authorizationRequestParam.adminUserId = adminUserId;
    }

    // 未ログインの場合
    if (this._common.isNotLogin()) {
      const amcNumberValue = amcNumber;
      const amcPasswordValue = amcPassword;
      if (amcNumberValue) authorizationRequestParam.amcNumber = amcNumberValue;
      if (amcPasswordValue) authorizationRequestParam.amcPassword = amcPasswordValue;
      authorizationRequestParam.amcPersistent = this.amcLoginKeepCheck.value ?? false;
    }

    // シームレスログインの場合
    if (this._isSeamlessLogin) {
      authorizationRequestParam.connectionType = AuthorizationRequest.ConnectionTypeEnum.Seamless;
      authorizationRequestParam.amcPersistent = false;
      const companyManagementCd1Param = postParams[AnaBizSeamlessLoginQueryParam?.COMPANY_MANAGEMENT_CD1];
      const companyManagementCd2Param = postParams[AnaBizSeamlessLoginQueryParam?.COMPANY_MANAGEMENT_CD2];
      const companyManagementCd3Param = postParams[AnaBizSeamlessLoginQueryParam?.COMPANY_MANAGEMENT_CD3];
      const companyManagementCd4Param = postParams[AnaBizSeamlessLoginQueryParam?.COMPANY_MANAGEMENT_CD4];
      const dateFlight1Param = postParams[AnaBizSeamlessLoginQueryParam?.DATE_FLIGHT1];
      const dateFlight2Param = postParams[AnaBizSeamlessLoginQueryParam?.DATE_FLIGHT2];
      const sendDataFlgParam = postParams[AnaBizSeamlessLoginQueryParam?.SEND_DATA_FLG];
      const sendDataUrlParam = postParams[AnaBizSeamlessLoginQueryParam?.SEND_DATA_URL];
      const sendDataTypeParam = postParams[AnaBizSeamlessLoginQueryParam?.SEND_DATA_TYPE];

      if (companyManagementCd1Param) authorizationRequestParam.companyManagementCd1 = companyManagementCd1Param;
      if (companyManagementCd2Param) authorizationRequestParam.companyManagementCd2 = companyManagementCd2Param;
      if (companyManagementCd3Param) authorizationRequestParam.companyManagementCd3 = companyManagementCd3Param;
      if (companyManagementCd4Param) authorizationRequestParam.companyManagementCd4 = companyManagementCd4Param;
      if (dateFlight1Param) authorizationRequestParam.dateFlight1 = dateFlight1Param;
      if (dateFlight2Param) authorizationRequestParam.dateFlight2 = dateFlight2Param;
      if (sendDataFlgParam) authorizationRequestParam.sendDataFlg = sendDataFlgParam;
      if (sendDataUrlParam) authorizationRequestParam.sendDataUrl = sendDataUrlParam;
      if (sendDataTypeParam) authorizationRequestParam.sendDataType = sendDataTypeParam;
    }

    const validationErrorInfo = this._anaBizLoginPresService.validateSeamlessLoginParam(authorizationRequestParam);
    if (validationErrorInfo !== null) {
      const errorInfo: NotRetryableErrorModel = {
        errorType: ErrorType.BUSINESS_LOGIC,
        ...validationErrorInfo,
      };
      this._common.errorsHandlerService.setNotRetryableError(errorInfo);
      this._anaBizLoginStoreService.resetAnaBizLogin();
      return;
    }

    this.callAnaBizLoginApi(authorizationRequestParam);
  }

  /**
   * ANA BizログインAPI実行
   */
  callAnaBizLoginApi(request: AuthorizationRequest) {
    this._pageLoadingService.startLoading();
    apiEventAll(
      () => {
        this._anaBizLoginStoreService.setAnaBizLoginFromApi(request);
      },
      this._anaBizLoginStoreService.getAnaBizLogin$(),
      (response) => {
        this._pageLoadingService.endLoading();
        //aswContextを更新する
        const anaBizLoginStatus = response.data?.aswContext?.anaBizLoginStatus;
        const loginStatus = response.data?.aswContext?.loginStatus;
        this._common.aswContextStoreService.updateAswContext({
          loginStatus: loginStatus as LoginStatusType | undefined,
          anaBizLoginStatus: anaBizLoginStatus as AnaBizLoginStatusType | undefined,
        });
        // ANA BizログインAPI実行後の処理
        const _afterAnaBizLoginApi = () => {
          // 組織選択必要の場合
          if (anaBizLoginStatus === AnaBizLoginStatusType.ORGANIZATION_SELECT_REQUIRED) {
            // 組織選択画へ遷移する
            this._router.navigate([RoutesResRoutes.ORGANIZATION_SELECT]);
          } else {
            // anaBizContextを更新する
            this._common.anaBizContextStoreService.updateAnaBizContext({
              ...response.data.anaBizContext,
            });

            const accessToken = this._common.loadSessionStorage(SessionStorageName.ACCESS_TOKEN);
            const anaBizContext: BizLoginInfoAnaBizContext = response.data?.anaBizContext ?? {};
            const encryptedAnaBizAccessToken = anaBizContext?.encryption?.anaBizAccessToken || '';

            // リクエストヘッダとして送付したaccessTokenとAPIレスポンスのanaBizAccessTokenをlocalStorageに保存する
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('encryptedAnaBizAccessToken', encryptedAnaBizAccessToken);

            // ANA Biz TOPへ遷移を行う
            this._anaBizTopService.sendAnaBizTop(anaBizContext);
          }
        };
        // ANA Biz / AMC同時ログイン時に、子会員でのAMCログインが出来なかった(業務ワーニング:WBAZ000601)
        if (
          response.warnings &&
          response.warnings.length > 0 &&
          response.warnings[0].code === ErrorCodeConstants.ERROR_CODES.WBAZ000601
        ) {
          this._dialogConfirmService
            .open()
            .buttonClick$.pipe(take(1))
            .subscribe(() => {
              _afterAnaBizLoginApi();
            });
        } else {
          _afterAnaBizLoginApi();
        }
      },
      (error) => {
        this._pageLoadingService.endLoading();
        const errorCodeMap: { [key: string]: string } = {
          [ErrorCodeConstants.ERROR_CODES.EAPZ000034]: 'E0862', // 企業ログイン認証が失敗した旨
          [ErrorCodeConstants.ERROR_CODES.EAPZ000035]: 'E1073', // 企業用管理コード1～3が不整合である旨
          [ErrorCodeConstants.ERROR_CODES.EAPZ000036]: 'E1074', // 企業用管理コード4が不整合である旨
          [ErrorCodeConstants.ERROR_CODES.EAPZ000037]: 'E1104', // データ連携送信パラメータ設定が不整合である旨
          [ErrorCodeConstants.ERROR_CODES.EAPZ000038]: 'E1104', // データ連携送信パラメータ設定が不整合である旨
          [ErrorCodeConstants.ERROR_CODES.EAPZ000039]: 'E1105', // 搭乗予定日(往路、復路)が不整合である旨
          [ErrorCodeConstants.ERROR_CODES.EAPZ000040]: 'E1105', // 搭乗予定日(往路、復路)が不整合である旨
          [ErrorCodeConstants.ERROR_CODES.EAPZ000041]: 'E1105', // 搭乗予定日(往路、復路)が不整合である旨
          [ErrorCodeConstants.ERROR_CODES.EAPZ000042]: 'E0865', // 企業情報が利用開始前である旨
          [ErrorCodeConstants.ERROR_CODES.EAPZ000043]: 'E0865', // 企業情報が利用開始前である旨
          [ErrorCodeConstants.ERROR_CODES.EAPZ000044]: 'E1075', // 企業情報が失効後である旨
          [ErrorCodeConstants.ERROR_CODES.EAPZ000045]: 'E0867', // パーチェシング型契約以外で企業精算単位のログイン設定である旨
          [ErrorCodeConstants.ERROR_CODES.EAPZ000046]: 'E0868', // イントラネット接続限定でシームレス接続でない旨
          [ErrorCodeConstants.ERROR_CODES.EAPZ000057]: 'E1106', // シームレス接続未使用でシームレス接続である旨
          [ErrorCodeConstants.ERROR_CODES.EAPZ000047]: 'E1107', // 利用可能な管理対象企業精算CDまたは承認対象企業精算CDなし旨
          [ErrorCodeConstants.ERROR_CODES.EAPZ000049]: 'E1108', // 管理対象企業精算情報(C票)なしの旨
          [ErrorCodeConstants.ERROR_CODES.EAPZ000011]: 'E0863', // AMC会員番号が存在しない、またはパスワード間違いの旨
          [ErrorCodeConstants.ERROR_CODES.EAPZ000012]: 'E0871', // MINDSから返却された処理結果がアカウントロックの旨
          [ErrorCodeConstants.ERROR_CODES.EAPZ000013]: 'E0872', // MINDSから返却された処理結果が同時接続数制限の旨
        };

        const apiCode = this._common.apiError?.errors?.[0]?.code ?? '';
        const code = errorCodeMap[apiCode];

        // ANA Bizシームレスログインに失敗した場合、共通部品に処理があるので、こちら処理必要がありません(errors-handler.service.ts)
        if (!this._isSeamlessLogin) {
          const errorInfo: RetryableError = {
            apiErrorCode: apiCode,
            errorMsgId: code,
          };
          this._common.errorsHandlerService.setRetryableError(PageType.PAGE, errorInfo);
        }

        this._anaBizLoginStoreService.resetAnaBizLogin();
      }
    );
  }
}
