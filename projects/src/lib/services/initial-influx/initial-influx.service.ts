/**
 * 初期流入処理（SPA） サービス
 */
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SupportClass } from '../../components/support-class';
import { uniqueId } from '../../helpers';
import {
  AnaBizLoginStatusType,
  AswServiceModel,
  BookingType,
  BrowserType,
  DeviceType,
  ErrorType,
  GenderCodeType,
  LoginStatusType,
  MemberKindCodeType,
  MobileDeviceType,
  NotRetryableErrorModel,
  IFlyAddressType,
  IFlyGenderType,
  IFlyPhoneNumberType,
  PremiumStatusCodeType,
  SessionStorageName,
  TierLevelType,
} from '../../interfaces';
import { InitialInfluxRequest } from '../../model';
import {
  InitializationApiService,
  InitializationResponse,
  InitializationResponseDataAnaBizContext,
  InitializationResponseDataAswContext,
  InitializationResponseDataConfidential,
  InitializationResponseDataMemberInfo,
} from 'src/sdk-initialization';
import { CommonLibService } from '../common-lib/common-lib.service';
import { Router } from '@angular/router';
import { RoutesCommon } from '@conf/routes.config';
import { AnaCardTypeCodeType } from '@lib/interfaces/ana-card-type-code';
import { DatePipe, DOCUMENT } from '@angular/common';
import { I18N_CONFIG } from '@conf/i18n.config';
import { TranslateService } from '@ngx-translate/core';
import { ErrorCodeConstants } from '@conf/app.constants';
import { lastValueFrom } from 'rxjs';

/**
 * 初期流入処理 サービス
 */
@Injectable()
export class InitialInfluxService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _initializationService: InitializationApiService,
    private _router: Router,
    private _translateSvc: TranslateService,
    private _datePipe: DatePipe,
    @Inject(DOCUMENT) private _document: Document
  ) {
    super();
  }

  destroy(): void {}

  public async exe() {
    // UUIDがなければ作成しセッションストレージに保存
    this.createIdentificationId();
    const requestParameters = this.getRequestParameter();
    // デフォルト言語を設定
    await this._setLang(I18N_CONFIG.defaultLanguage);
    // companyReal CookieおよびlocalStorageのaccessTokenの有無に応じ、accessTokenを調整
    this._adjustAccessToken();

    this._common.apiErrorResponseService.clearApiErrorResponse(); //APIエラー情報を事前にクリア　初期流入でも一応しておく
    await new Promise<void>((resolve) => {
      //　初期流入API呼び出し、受信後処理
      this.subscribeService(
        'InitialInfluxServiceApiCall',
        this._initializationService.initializationPost(requestParameters, 'response'),
        async (response: HttpResponse<InitializationResponse>) => {
          //正常終了
          if (requestParameters.jSessionId) {
            this._common.saveSessionStorage(requestParameters.jSessionId, SessionStorageName.JSESSION_ID);
          }
          if (requestParameters.returnUrl) {
            this._common.saveSessionStorage(requestParameters.returnUrl, SessionStorageName.RETURN_URL);
          }
          if (response.body) {
            this._common.saveSessionStorage(response.body.accessToken, SessionStorageName.ACCESS_TOKEN);
          }
          const xCorrelationId = response.headers.get('X-Correlation-ID');
          if (xCorrelationId) {
            this._common.saveSessionStorage(xCorrelationId, SessionStorageName.X_CORRELATION_ID);
          }
          if (response.body?.data?.aswContext) {
            this.setAswContextStore(response.body.data.aswContext);
          }
          // ログインステータスがNOT_LOGIN以外の場合、storeに保存する
          if (response?.body?.data?.aswContext?.loginStatus !== LoginStatusType.NOT_LOGIN) {
            if (response.body?.data?.memberInfo) {
              this.setAmcMemberStore(response.body.data.memberInfo);
            }
          }
          // ANA BizログインステータスがNOT_LOGIN以外の場合、storeに保存する
          if (response.body?.data?.aswContext?.anaBizLoginStatus !== AnaBizLoginStatusType.NOT_LOGIN) {
            if (response.body?.data?.anaBizContext) {
              this.setAnaBizStore(response.body.data.anaBizContext);
            }
          }
          // confidentialをstoreに保存する
          if (response.body?.data?.confidential) {
            this.setConfidentialStore(response.body.data.confidential);
          }
          // aswContextのlangを利用言語に設定
          await this._setLang(response.body?.data?.aswContext?.lang);
          this.setAswServiceStore();
          resolve();
        },
        (error: HttpErrorResponse) => {
          if (error.status === 400) {
            const errorCodeMap: { [key: string]: string } = {
              [ErrorCodeConstants.ERROR_CODES.EAPZ000050]: 'E0876', // Cookie情報(companyReal)とアクセストークンとの状態不正
              [ErrorCodeConstants.ERROR_CODES.EAPZ000051]: 'E0876', // Cookie情報、アクセストークン、DynamoDBとの状態不正
            };
            const apiCode = this._common.apiError?.errors?.[0]?.code ?? '';
            const code = errorCodeMap[apiCode];

            if (code) {
              const errorInfo: NotRetryableErrorModel = {
                errorType: ErrorType.BUSINESS_LOGIC,
                errorMsgId: code,
                apiErrorCode: apiCode,
                isPopupPage: false,
              };
              this._common.errorsHandlerService.setNotRetryableError(errorInfo);
            } else {
              // システムエラーへ
              this._common.errorsHandlerService.setNotRetryableError({
                errorType: ErrorType.SYSTEM, // システムロジックエラー
                apiErrorCode: apiCode, // APIエラーレスポンス情報
              });
            }
          }
          resolve();
        }
      );
    });
  }

  /** 利用言語の設定 */
  private async _setLang(langValue?: string) {
    let lang = langValue;
    if (lang) {
      lang = lang in I18N_CONFIG.supportedLocales ? lang : I18N_CONFIG.defaultLanguage;
    } else {
      lang = I18N_CONFIG.defaultLanguage;
    }
    await lastValueFrom(this._translateSvc.use(lang));
    // html lang属性再設定
    this._document.documentElement.lang = I18N_CONFIG.supportedLocales[lang];
  }

  /** window object */
  private _window = window as any;

  /**
   * ASWユーザIDがなければ発行
   *
   */
  private createIdentificationId() {
    const identificationId = this._common.loadSessionStorage(SessionStorageName.IDENTIFICATION_ID);
    if (!identificationId) {
      this._common.saveSessionStorage(uniqueId(), SessionStorageName.IDENTIFICATION_ID);
    }
  }

  /**
   * 初期流入へ送るリクエストパラメータを作成
   */
  private getRequestParameter(): InitialInfluxRequest {
    // グローバル変数からqueryデータを取り出し
    const dataQuery = this._window.Asw.ApiRequestParam?.query ?? '{}';
    const requestQuery = this.parseJson(dataQuery);
    // グローバル変数からpostデータを取り出し
    const dataPost = this._window.Asw.ApiRequestParam?.post ?? '{}';
    const requestPost = this.parseJson(dataPost);
    const initialInfluxRequest: InitialInfluxRequest = {
      ...requestQuery,
      ...requestPost,
      userAgent: navigator.userAgent, // ユーザーエージェント情報
    };
    return initialInfluxRequest;
  }

  /**
   * 初期流入へ送るリクエストパラメータを作成
   */
  private parseJson(targetData: any): any {
    if (Object.keys(targetData).length !== 0) {
      const parsedData: any = {};
      if (targetData.hasOwnProperty('CONNECTION_KIND')) {
        parsedData.connectionKind = targetData.CONNECTION_KIND;
      }
      if (targetData.hasOwnProperty('LANG')) {
        parsedData.lang = targetData.LANG;
      }
      if (targetData.hasOwnProperty('TIMESTAMP')) {
        parsedData.timestamp = targetData.TIMESTAMP;
      }
      if (targetData.hasOwnProperty('apfCode')) {
        parsedData.apfCode = targetData.apfCode;
      }
      if (targetData.hasOwnProperty('jSessionId')) {
        parsedData.jSessionId = targetData.jSessionId;
      }
      if (targetData.hasOwnProperty('referer')) {
        parsedData.referer = targetData.referer;
      }
      if (targetData.hasOwnProperty('returnUrl')) {
        parsedData.returnUrl = targetData.returnUrl;
      }
      if (targetData.hasOwnProperty('membershipNumber')) {
        parsedData.membershipNumber = targetData.membershipNumber;
      }
      if (targetData.hasOwnProperty('companyId')) {
        parsedData.companyId = targetData.companyId;
      }
      if (targetData.hasOwnProperty('loginUserID')) {
        parsedData.loginUserID = targetData.loginUserID;
      }
      if (targetData.hasOwnProperty('companyName')) {
        parsedData.companyName = targetData.companyName;
      }
      if (targetData.hasOwnProperty('creditId')) {
        parsedData.creditId = targetData.creditId;
      }
      if (targetData.hasOwnProperty('isIssuable')) {
        parsedData.isIssuable = targetData.isIssuable;
      }
      if (targetData.hasOwnProperty('commercialFareFamilyList')) {
        parsedData.commercialFareFamilyList = targetData.commercialFareFamilyList;
      }
      if (targetData.hasOwnProperty('issueType')) {
        parsedData.issueType = targetData.issueType;
      }
      if (targetData.hasOwnProperty('familyName')) {
        parsedData.familyName = targetData.familyName;
      }
      if (targetData.hasOwnProperty('givenName')) {
        parsedData.givenName = targetData.givenName;
      }
      if (targetData.hasOwnProperty('emailAddress')) {
        parsedData.emailAddress = targetData.emailAddress;
      }
      if (targetData.hasOwnProperty('dateOfBirth')) {
        parsedData.dateOfBirth = targetData.dateOfBirth;
      }
      if (targetData.hasOwnProperty('gender')) {
        parsedData.gender = targetData.gender;
      }
      if (targetData.hasOwnProperty('passengerMembershipNumber')) {
        parsedData.passengerMembershipNumber = targetData.passengerMembershipNumber;
      }
      if (targetData.hasOwnProperty('addressType')) {
        parsedData.addressType = targetData.addressType;
      }
      if (targetData.hasOwnProperty('phoneISDCode')) {
        parsedData.phoneISDCode = targetData.phoneISDCode;
      }
      if (targetData.hasOwnProperty('phoneNumber')) {
        parsedData.phoneNumber = targetData.phoneNumber;
      }
      if (targetData.hasOwnProperty('customerId')) {
        parsedData.customerId = targetData.customerId;
      }
      if (targetData.hasOwnProperty('departmentId')) {
        parsedData.departmentId = targetData.departmentId;
      }
      if (targetData.hasOwnProperty('departmentName')) {
        parsedData.departmentName = targetData.departmentName;
      }
      if (targetData.hasOwnProperty('userSeq')) {
        parsedData.userSeq = targetData.userSeq;
      }
      if (targetData.hasOwnProperty('agentSeq')) {
        parsedData.agentSeq = targetData.agentSeq;
      }
      if (targetData.hasOwnProperty('bizGeneralItem1')) {
        parsedData.bizGeneralItem1 = targetData.bizGeneralItem1;
      }
      if (targetData.hasOwnProperty('bizGeneralItem2')) {
        parsedData.bizGeneralItem2 = targetData.bizGeneralItem2;
      }
      if (targetData.hasOwnProperty('bizGeneralItem3')) {
        parsedData.bizGeneralItem3 = targetData.bizGeneralItem3;
      }
      return parsedData;
    } else {
      return {};
    }
  }

  /**
   * ユーザ共通情報をstoreに格納
   *
   */
  private setAswContextStore(aswContext: InitializationResponseDataAswContext) {
    this._common.aswContextStoreService.setAswContext({
      ...aswContext,
      bookingType: aswContext.bookingType as BookingType,
      deviceType: aswContext.deviceType as DeviceType,
      browserType: aswContext.browserType as BrowserType,
      mobileDeviceType: aswContext.mobileDeviceType as MobileDeviceType,
      loginStatus: aswContext.loginStatus as LoginStatusType,
      isViaGoshokaiNet: aswContext.isViaGoshokaiNet ?? false,
      isAnaApl: aswContext.isAnaApl ?? false,
      anaBizLoginStatus: aswContext.anaBizLoginStatus as AnaBizLoginStatusType,
      isDummyOffice: aswContext.isDummyOffice ?? false,
      returnUrl: aswContext.returnUrl,
    });
  }

  /**
   * 会員情報をstoreに格納
   *
   */
  private setAmcMemberStore(amcMember: InitializationResponseDataMemberInfo) {
    this._common.amcMemberStoreService.setAMCMember({
      ...amcMember,
      memberKindCode: amcMember.memberKindCode as MemberKindCodeType,
      gender: amcMember.gender as GenderCodeType,
      premiumStatus: amcMember.premiumStatus as PremiumStatusCodeType,
      tierLevel: amcMember.tierLevel as TierLevelType,
      anaCardTypeCode: amcMember.anaCardTypeCode as AnaCardTypeCodeType,
      iFlyMemberInfo: {
        ...amcMember.iFlyMemberInfo,
        profileDetails: {
          ...amcMember.iFlyMemberInfo?.profileDetails,
          individualInfo: {
            ...amcMember.iFlyMemberInfo?.profileDetails?.individualInfo,
            preferredEmailAddress: amcMember.iFlyMemberInfo?.profileDetails?.individualInfo
              ?.preferredEmailAddress as IFlyAddressType,
            preferredPhoneNumber: amcMember.iFlyMemberInfo?.profileDetails?.individualInfo
              ?.preferredPhoneNumber as IFlyPhoneNumberType,
            gender: amcMember.iFlyMemberInfo?.profileDetails?.individualInfo?.gender as IFlyGenderType,
            memberContactInfos: amcMember.iFlyMemberInfo?.profileDetails?.individualInfo?.memberContactInfos?.map(
              (memberContactInfo) => ({
                ...memberContactInfo,
                addressType: memberContactInfo?.addressType as IFlyAddressType,
              })
            ),
          },
        },
      },
    });
  }

  /**
   * ANA Bizログイン情報をstoreに格納
   *
   */
  private setAnaBizStore(anaBizContext: InitializationResponseDataAnaBizContext) {
    this._common.anaBizContextStoreService.setAnaBizContext({
      ...anaBizContext,
    });
  }

  /**
   * ANA Bizログイン情報(Confidential)をstoreに格納
   */
  private setConfidentialStore(confidential: InitializationResponseDataConfidential) {
    this._common.confidentialStoreService.setConfidential({
      ...confidential,
    });
  }

  /**
   * サービス共通情報をstoreに格納
   */
  private setAswServiceStore() {
    // セッションストレージを参照してデータが存在する場合
    const data = this._common.loadSessionStorage(SessionStorageName.ASW_SERVICE, true);
    const aswService: AswServiceModel = {
      orderId: data?.orderId ?? '',
      travelDocumentId: data?.travelDocumentId ?? '',
      lastName: data?.lastName ?? '',
      firstName: data?.firstName ?? '',
    };

    if (aswService.orderId || aswService.travelDocumentId || aswService.firstName || aswService.lastName) {
      this._common.aswServiceStoreService.setAswService(aswService);
    }
  }

  /**
   * accessTokenを調整
   */
  private _adjustAccessToken() {
    // localStorageのaccessTokenをsessionStorageに格納
    const accessTokenLS = localStorage.getItem(SessionStorageName.ACCESS_TOKEN) ?? '';

    if (accessTokenLS) {
      // accessTokenが存在する場合localStorageのaccessTokenを削除
      localStorage.removeItem(SessionStorageName.ACCESS_TOKEN);
    }
  }

  /**
   * cookie有効判定
   */
  private isCookieEnable() {
    const nowDateStr = this._datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ssZ');
    const testName = 'test-cookie-name';
    const testValue = uniqueId() + nowDateStr; //前回値が残っているパターンもあるので毎回違う値にする
    //cookie書き込み
    document.cookie = testName + '=' + testValue + ';';
    //cookie読み込み
    const l = testName.length + 1;
    const cookieAry = document.cookie.split('; ');
    let str = '';
    for (const cookie of cookieAry) {
      if (cookie.substring(0, l) === testName + '=') {
        str = cookie.substring(l, cookie.length);
        document.cookie = testName + '=; max-age=0'; // テスト用に書き込んだcookieを削除
        break;
      }
    }

    if (str === testValue) {
      return true;
    } else {
      return false;
    }
  }
}
