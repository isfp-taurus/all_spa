import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { DATADOG_CONFIG, I18N_CONFIG, LOAD_MASTER_LIST, RESTRICTED_NAVIGATION_SERVICE_CONFIG_PROVIDER } from '@conf';
import {
  apiAmcmemberFactory,
  apiAuthorizationFactory,
  apiInitializationFactory,
  apiReservationFactory,
  apiSearchFactory,
  apiServicingFactory,
  apiSysdateFactory,
  apiUserFactory,
  apiMemberFactory,
  apiCreditFactory,
  roundTripFactory,
} from '@conf/api.config';
import { environment } from '@env/environment';
import {
  AlertAreaModule,
  AnaBizHeaderModule,
  BasicPageLayoutModule,
  ContentsAreaModule,
  DebugAreaModule,
  EmergencyAreaModule,
  ErrorGuidanceContModule,
  FooterModule,
  GuidanceAreaModule,
  HeaderModule,
  ModalModule,
  NotificationAreaModule,
  PageLoadingModule,
} from '@lib/components';
import { ITranslationResource, MultiTranslateHttpLoader } from '@lib/core';
import { ApiInterceptor, CacheInterceptor } from '@lib/interceptor';
import {
  AswMasterService,
  AswMissingTranslationHandler,
  InitialInfluxService,
  InitialInfluxServiceModule,
  LoggerDatadogServiceModule,
  RESTRICTED_NAVIGATION_INITIALIZER_PROVIDER,
  TealiumService,
  LoggerDatadogService,
  GetMemberInformationStoreServiceModule,
} from '@lib/services';
import {
  AMCMemberStoreModule,
  AnaBizContextStoreModule,
  ApiErrorResponseStoreModule,
  AswCommonStoreModule,
  AswContextStoreModule,
  AswMasterStoreModule,
  AswServiceStoreModule,
  DynamicContentStoreModule,
  GetMemberInformationStoreModule,
  NotRetryableErrorStoreModule,
  PageLoadingStoreModule,
  RetryableErrorStoreModule,
  SysdateStoreModule,
  storeSyncMetaReducer,
} from '@lib/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import {
  MissingTranslationHandler,
  TranslateLoader,
  TranslateModule,
  TranslateModuleConfig,
} from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';
import { ApiAmcmemberModule } from 'src/sdk-amcmember';
import { ApiAuthorizationModule } from 'src/sdk-authorization';
import { ApiInitializationModule } from 'src/sdk-initialization';
import { ApiReservationModule } from 'src/sdk-reservation';
import { ApiSearchModule } from 'src/sdk-search';
import { ApiServicingModule } from 'src/sdk-servicing';
import { ApiSysdateModule } from 'src/sdk-sysdate';
import { ApiUserModule } from 'src/sdk-user';
import { ApiMemberModule } from 'src/sdk-member';
import { ApiCreditModule } from 'src/sdk-credit';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HelloWorldContModule } from './hello-world';
import { SampleSubHeaderModule } from './sub-header/sample-sub-header/sample-sub-header.module';
import { TestModule } from './test';
import { TestSsnModule } from './test-ssn/test-ssn.module';

/**
 * 画面側追加
 */
//作成画面
import { BookingCompletedContModule } from './booking-completed/container/booking-completed-cont.module';
import { ComplexFlightAvailabilityContModule } from './complex-flight-availability/container/complex-flight-availability-cont.module';
import { FindMoreFlightsContModule } from './find-more-flights/container/find-more-flights-cont.module';
import { GoshokaiNetLoginContModule } from './goshokai-net-login';
import { PaymentInputContModule } from './payment-input/container/payment-input-cont.module';
import { PlanListContModule } from './plan-list';
import { PlanReviewContModule } from './plan-review/container/plan-review-cont.module';
import { PetInputContModule } from './pet-input/container/pet-input-cont.module';
import { RoundtripFlightAvailabilityInternationalContModule } from './roundtrip-flight-availability-international/container/roundtrip-flight-availability-international-cont.module';
import { SeatmapContModule } from './seatmap';
import { ComplexFlightAvailabilityModule } from './sub-header/complex-flight-availability/complex-flight-availability-sub-header.module';

//subHeader
import {
  PasswordInputAuthLoginStoreServiceModule,
  MemberAvailabilityStoreServiceModule,
  OrdersReservationAvailabilityStoreServiceModule,
  SearchFlightStoreServiceModule,
} from '@common/services';
import { CaptchaAuthenticationPostModule } from '@common/services/captcha-authentication-post/captcha-authentication-post-store.module';
import { CaptchaAuthenticationStatusGetStoreServiceModule } from '@common/services/captcha-authentication-status-get/captcha-authentication-status-get-store.module';
import { SearchFlightConditionForRequestServiceModule } from '@common/services/store/search-flight/search-flight-condition-for-request-store/search-flight-condition-for-request-store.module';
import { AnaBizLoginContModule } from './ana-biz-login';
import { AnaBizLogoutContModule } from './ana-biz-logout';
import { AnaBizLogoutSubHeaderModule } from './sub-header/ana-biz-logout';
import { OrganizationSelectContModule } from './organization-select';
import { AnaBizLoginSubHeaderModule } from './sub-header/ana-biz-login-sub-header';
import { PetInputSubHeaderModule } from './sub-header/pet-input/pet-input-sub-header.module';
import { BookingCompletedSubHeaderModule } from './sub-header/booking-completed/booking-completed-sub-header.module';
import { ComplexFlightCalendarSubHeaderModule } from './sub-header/complex-flight-calendar/complex-flight-calendar-sub-header.module';
import { FindMoreFlightsSubHeaderModule } from './sub-header/find-more-flights/find-more-flights-sub-header.module';
import { SearchFlightSubHeaderModule } from './sub-header/search-flight/search-flight-sub-header.module';
import { GoshokaiNetLoginSubHeaderModule } from './sub-header/goshokai-net-login/goshokai-net-login-sub-header.module';
import { OrganizationSelectSubHeaderModule } from './sub-header/organization-select-sub-header';
import { PaymentInputSubHeaderModule } from './sub-header/payment-input/payment-input-sub-header.module';
import { PlanListSubHeaderModule } from './sub-header/plan-list/plan-list-sub-header.module';
import { PlanReviewSubHeaderModule } from './sub-header/plan-review';
import { RoundtripFlightAvailabilityInternationalSubHeaderModule } from './sub-header/roundtrip-flight-availability-international/roundtrip-flight-availability-international-sub-header.module';
import { SeatmapSubHeaderModule } from './sub-header/seatmap/seatmap-sub-header.module';

//store
import {
  AnaBizLogoutStoreModule,
  AnaBizLoginStoreModule,
  BookingCompletedSubHeaderInformationStoreModule,
  ComplexFlightAvailabilityStoreModule,
  CreateOrderStoreModule,
  CurrentCartStoreModule,
  CurrentPlanStoreModule,
  DeletePrebookedOrderStoreModule,
  DeliveryInformationStoreModule,
  FareConditionsStoreModule,
  FindMoreFlightsPostStoreModule,
  FindMoreFlightsStoreModule,
  GetCartStoreModule,
  GetCompanyAccountsStoreModule,
  GetETicketItineraryReceiptStoreModule,
  GetOrderStoreModule,
  GetPlansStoreModule,
  MemberAvailabilityStoreModule,
  OrdersReservationAvailabilityStoreModule,
  SelectCompanyAccountStoreModule,
  UpdateTravelersStoreModule,
  // credit
  GetCreditPanInformationStoreModule,
} from '@common/store';

//service
import {
  CurrentCartStoreServiceModule,
  GetCartStoreServiceModule,
  PaymentInputStoreServiceModule,
} from '@common/services';

//その他
import { PasswordInputModule } from '@common/components/reservation/id-modal/password-input';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';
import { ApiModule } from './roundtrip-flight-availability-domestic/common/sdk';
import { AppInfoStoreModule, RoundtripFppStoreModule } from './roundtrip-flight-availability-domestic/common/store';
import { WaitlistStoreModule } from './roundtrip-flight-availability-domestic/common/store/waitlist';
import { RoundtripFlightAvailabilityDomesticSubHeaderModule } from './sub-header/roundtrip-flight-availability-domestic/roundtrip-flight-availability-domestic-sub-header.module';
import { AnabizPaymentInputContModule } from './anabiz-payment-input/container/anabiz-payment-input-cont.module';
import { TicketingRequestStoreServiceModule } from '@common/services/api-store/sdk-reservation/ticketing-request/ticketing-request-store.module';
import { GetApproversServiceModule } from '@common/services/api-store/sdk-reservation/get-approvers-store/get-approvers-store.module';
import { SendBackTicketingRequestStoreServiceModule } from '@common/services/api-store/sdk-reservation/send-back-ticketing-request-store/send-back-ticketing-request-store.module';
import { UpdateAirOffersStoreModule } from '@common/store/update-air-offers';

/**
 * 画面側追加 end
 */

/** `MultiTranslateHttpLoader`用のFactory */
export const MultiTranslateHttpLoaderFactory = (httpClient: HttpClient) => {
  // i18n（国際化対応）Configに定義されたファイルリストをもとにLoader用のFactoryを生成
  const {
    baseUrl,
    app: { cache },
  } = environment.spa;
  const resources = I18N_CONFIG.loadFileList.reduce((previous, current) => {
    if (current.suffix) {
      previous.push({
        prefix: `${baseUrl}${cache}/${current.prefix}`,
        suffix: current.suffix,
      });
    } else {
      previous.push({ prefix: `${baseUrl}${cache}/${current.prefix}` });
    }
    return previous;
  }, [] as ITranslationResource[]);
  return new MultiTranslateHttpLoader(httpClient, resources);
};

/** `TranslateModule.forRoot`用Config */
export const ROOT_NGX_TRANSLATE_MODULE_CONFIG: TranslateModuleConfig = {
  loader: {
    provide: TranslateLoader,
    useFactory: MultiTranslateHttpLoaderFactory,
    deps: [HttpClient],
  },
  missingTranslationHandler: {
    provide: MissingTranslationHandler,
    useClass: AswMissingTranslationHandler,
  },
};

/** `StoreModule.forRoot`用routerReducer */
const rootReducers = {
  router: routerReducer,
};
/** `StoreModule.forRoot`用sessionStorage同期指定  */
const metaReducers = [storageSyncWrapper];
export function storageSyncWrapper<T, V extends Action = Action>(reducer: ActionReducer<T, V>): ActionReducer<T, V> {
  // storeとsessionStorageの同期指定
  const storageStates: any = [
    // FIXME: 各APPごとに指定する
    // 例：{ aswService: aswServiceStorageSync },
  ];
  return storeSyncMetaReducer({ keys: storageStates, rehydrate: true, storage: sessionStorage || localStorage })(
    reducer
  );
}

/** デフォルトの初期化処理（一番最初に実行する処理） */
function defaultInitializer(tealiumSvc: TealiumService, loggerSvc: LoggerDatadogService) {
  return async () => {
    // Datadogブラウザログの初期化
    loggerSvc.init();
    // Tealium連携用Global変数の初期化
    tealiumSvc.init();
    // Tealium用JavaScriptロード
    return lastValueFrom(tealiumSvc.loadScript$());
  };
}

// 初期流入処理
function initialize(service: InitialInfluxService, masterService: AswMasterService) {
  return async () => {
    await service.exe();
    await lastValueFrom(masterService.load(LOAD_MASTER_LIST));
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot(ROOT_NGX_TRANSLATE_MODULE_CONFIG),
    StoreModule.forRoot(rootReducers, { metaReducers }),
    EffectsModule.forRoot(),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.envName !== 'prd',
    }),
    StoreRouterConnectingModule.forRoot(),
    // [start] テンプレート用サンプルcomponent
    HelloWorldContModule,
    TestModule,
    TestSsnModule,
    SampleSubHeaderModule,
    // 作成画面
    BookingCompletedSubHeaderModule,
    BookingCompletedContModule,
    GoshokaiNetLoginSubHeaderModule,
    GoshokaiNetLoginContModule,
    OrganizationSelectSubHeaderModule,
    OrganizationSelectContModule,
    PasswordInputModule,
    AnaBizLoginSubHeaderModule,
    AnaBizLoginContModule,
    AnaBizLogoutSubHeaderModule,
    AnaBizLogoutContModule,
    BookingCompletedSubHeaderModule,
    BookingCompletedContModule,
    PlanReviewSubHeaderModule,
    PlanReviewContModule,
    PlanListContModule,
    PlanListSubHeaderModule,
    GoshokaiNetLoginSubHeaderModule,
    GoshokaiNetLoginContModule,
    FindMoreFlightsContModule,
    FindMoreFlightsSubHeaderModule,
    // [end] テンプレート用サンプルcomponent
    BasicPageLayoutModule,
    ContentsAreaModule,
    EmergencyAreaModule,
    HeaderModule,
    AnaBizHeaderModule,
    AlertAreaModule,
    GuidanceAreaModule,
    FooterModule,
    DebugAreaModule,
    NotificationAreaModule,
    ModalModule,
    InitialInfluxServiceModule,
    ErrorGuidanceContModule,
    PageLoadingModule,
    // [start] 共通ストア系
    SysdateStoreModule,
    AswServiceStoreModule,
    AswContextStoreModule,
    AswCommonStoreModule,
    AnaBizLoginStoreModule,
    AnaBizContextStoreModule,
    AMCMemberStoreModule,
    AswMasterStoreModule,
    ApiErrorResponseStoreModule,
    GetCompanyAccountsStoreModule,
    SelectCompanyAccountStoreModule,
    RetryableErrorStoreModule,
    NotRetryableErrorStoreModule,
    DynamicContentStoreModule,
    PageLoadingStoreModule,
    // credit
    GetCreditPanInformationStoreModule,
    // [end] 共通ストア系
    LoggerDatadogServiceModule.forRoot(() => DATADOG_CONFIG),
    // [start] ApiModule
    ApiAmcmemberModule.forRoot(apiAmcmemberFactory),
    ApiAuthorizationModule.forRoot(apiAuthorizationFactory),
    ApiInitializationModule.forRoot(apiInitializationFactory),
    ApiUserModule.forRoot(apiUserFactory),
    ApiSysdateModule.forRoot(apiSysdateFactory),
    ApiServicingModule.forRoot(apiServicingFactory),
    ApiSearchModule.forRoot(apiSearchFactory),
    ApiReservationModule.forRoot(apiReservationFactory),
    ApiMemberModule.forRoot(apiMemberFactory),

    ApiModule.forRoot(roundTripFactory),
    ApiCreditModule.forRoot(apiCreditFactory),
    // [end] ApiModule

    /**
     *  画面側追加
     * */
    FindMoreFlightsContModule,
    RoundtripFlightAvailabilityInternationalContModule,
    ComplexFlightAvailabilityContModule,
    ComplexFlightAvailabilityModule,
    PlanListContModule,
    PlanReviewContModule,
    PetInputContModule,
    SeatmapContModule,
    PaymentInputContModule,
    AnabizPaymentInputContModule,
    BookingCompletedContModule,
    GoshokaiNetLoginContModule,

    //サブヘッダー
    SearchFlightSubHeaderModule,
    FindMoreFlightsSubHeaderModule,
    RoundtripFlightAvailabilityInternationalSubHeaderModule,
    RoundtripFlightAvailabilityDomesticSubHeaderModule,
    ComplexFlightCalendarSubHeaderModule,
    PlanReviewSubHeaderModule,
    PlanListSubHeaderModule,
    PetInputSubHeaderModule,
    SeatmapSubHeaderModule,
    PaymentInputSubHeaderModule,
    BookingCompletedSubHeaderModule,
    GoshokaiNetLoginSubHeaderModule,

    //モーダル
    PasswordInputModule,

    //サービス
    CaptchaAuthenticationStatusGetStoreServiceModule,
    CaptchaAuthenticationPostModule,
    SearchFlightConditionForRequestServiceModule,
    GetCartStoreServiceModule,
    SearchFlightStoreServiceModule,
    PaymentInputStoreServiceModule,
    PasswordInputAuthLoginStoreServiceModule,
    GetMemberInformationStoreServiceModule,
    MemberAvailabilityStoreServiceModule,
    OrdersReservationAvailabilityStoreServiceModule,

    // 追加ストア
    AnaBizLogoutStoreModule,
    CreateOrderStoreModule,
    CurrentCartStoreModule,
    CurrentCartStoreServiceModule,
    CurrentPlanStoreModule,
    DeletePrebookedOrderStoreModule,
    DeliveryInformationStoreModule,
    GetCartStoreModule,
    GetPlansStoreModule,
    UpdateTravelersStoreModule,
    FareConditionsStoreModule,
    GetETicketItineraryReceiptStoreModule,
    GetOrderStoreModule,
    BookingCompletedSubHeaderInformationStoreModule,
    FindMoreFlightsStoreModule,
    FindMoreFlightsPostStoreModule,
    ComplexFlightAvailabilityStoreModule,
    GetApproversServiceModule,
    SendBackTicketingRequestStoreServiceModule,
    TicketingRequestStoreServiceModule,
    // member eapi store
    GetMemberInformationStoreModule,
    MemberAvailabilityStoreModule,
    OrdersReservationAvailabilityStoreModule,

    //その他
    FormsModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    // 作成画面
    // ctc add start
    RoundtripFppStoreModule,
    WaitlistStoreModule,
    AppInfoStoreModule,
    UpdateAirOffersStoreModule,
    // ctc add end
  ],
  providers: [
    // API接続Interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true,
    },
    // Akamai Cache接続Interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor,
      multi: true,
    },
    // デフォルトの初期化処理
    {
      provide: APP_INITIALIZER,
      useFactory: defaultInitializer,
      deps: [TealiumService, LoggerDatadogService],
      multi: true,
    },
    // 初期流入
    {
      provide: APP_INITIALIZER,
      useFactory: initialize,
      deps: [InitialInfluxService, AswMasterService, Router],
      multi: true,
    },
    // G03_共通部品_共通・汎用処理（520_ブラウザバック・直リンク・F5制御機能）
    RESTRICTED_NAVIGATION_SERVICE_CONFIG_PROVIDER,
    RESTRICTED_NAVIGATION_INITIALIZER_PROVIDER,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
