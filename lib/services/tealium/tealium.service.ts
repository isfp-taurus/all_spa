import { Inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { LoadScriptService } from '../load-script/load-script.service';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { environment } from '@env/environment';
import {
  TealiumData,
  TealiumDataKey,
  TealiumMode,
  NotRetryableErrorModel,
  RetryableError,
  PageType,
  ErrorCommonInfo,
  AlertMessageItem,
} from '../../interfaces';
import { SystemDateService } from '../system-date/system-date.service';
import { AswCommonStoreService } from '../asw-common-store/asw-common-store.service';
import { AswContextStoreService } from '../asw-context-store/asw-context-store.service';
import { AswMasterService } from '../asw-master/asw-master.service';
import { AnaBizContextStoreService } from '../ana-biz-context-store/ana-biz-context-store.service';
import {
  NotRetryableErrorStore,
  RetryableErrorStore,
  selectNotRetryableError,
  selectPageRetryableError,
  selectSubPageRetryableError,
} from '../../store';
import { Store, select } from '@ngrx/store';
import { MasterStoreKey } from '@conf';
import { AlertMessageStoreService } from '../alert-message-store/alert-message-store.service';
import { CommonConstants } from '@conf/app.constants';

/**
 * Tealium連携Service
 */
@Injectable({
  providedIn: 'root',
})
export class TealiumService implements OnDestroy {
  private _subscription: Subscription = new Subscription();
  /** window object */
  private _window = window as any;
  /** 継続不可能エラー情報 */
  private _notRetryableError$!: Observable<NotRetryableErrorModel | null>;
  /** 継続可能エラー情報（page用） */
  private _pageRetryableError$!: Observable<RetryableError | null>;
  /** 継続可能エラー情報（subPage用） */
  private _subPageRetryableError$!: Observable<RetryableError | null>;

  public constructor(
    private _loadScriptSvc: LoadScriptService,
    @Inject(NgZone) private _ngZone: NgZone,
    private _systemDateSvc: SystemDateService,
    private _aswCommonSvc: AswCommonStoreService,
    private _aswContextSvc: AswContextStoreService,
    private _aswMasterSvc: AswMasterService,
    private _anaBizContextSvc: AnaBizContextStoreService,
    private _alertMessageStoreSvc: AlertMessageStoreService,
    private _store: Store<NotRetryableErrorStore | RetryableErrorStore>
  ) {
    // 継続不可能エラー情報
    this._notRetryableError$ = this._store.pipe(select(selectNotRetryableError));
    // 継続可能エラー情報（page用）
    this._pageRetryableError$ = this._store.pipe(select(selectPageRetryableError));
    // 継続可能エラー情報（subPage用）
    this._subPageRetryableError$ = this._store.pipe(select(selectSubPageRetryableError));
  }

  public ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  /**
   * Tealium用JavaScriptロード
   *
   * @returns
   */
  public loadScript$(): Observable<string> {
    if (this._isDisableTealium) {
      return of('');
    }
    const loadJsPath = environment.tealium.url;
    return this._loadScriptSvc.load$(loadJsPath);
  }

  /**
   * Tealium初期化処理
   */
  public init() {
    // Tealium連携用Global変数の初期化
    const tealiumInit = {
      BaseOutput: {},
      PageOutput: {},
      ApiReplyOutput: {},
    };
    this._window.Asw = { ...(this._window.Asw || {}), ...tealiumInit };
  }

  /**
   * Tealium用グローバル変数格納処理
   *
   * @param data Tealium連携用情報
   * @param mode グローバル変数の値を格納する際のモード
   */
  public setTealiumGlobalVariable(data: TealiumData, mode?: TealiumMode) {
    if (mode === TealiumMode.ADD) {
      this._window.Asw[data.key] = { ...this._window.Asw[data.key], ...data.value };
    } else {
      this._window.Asw[data.key] = data.value;
    }
  }

  /**
   * Tealium連携用基本情報JSON設定
   */
  public setTealiumBaseOutput() {
    // 基本情報JSON取得
    const baseOutput = this._getBaseOutput();
    this.setTealiumGlobalVariable({
      key: TealiumDataKey.BASE_OUTPUT,
      value: baseOutput,
    });
  }

  /**
   * Tealium連携用画面情報JSON設定
   *
   * @param data 画面情報JSON
   */
  public setTealiumPageOutput(data: Record<string, any>) {
    this.setTealiumGlobalVariable({
      key: TealiumDataKey.PAGE_OUTPUT,
      value: data,
    });
  }

  /**
   * Tealium発火処理
   *
   * @returns
   */
  public triggerTealiumEvent() {
    if (this._isDisableTealium) {
      return;
    }
    return this._ngZone.runOutsideAngular(() => {
      const callable: any = this._window.spa_pageview;
      if (typeof callable === 'function') {
        callable();
        // cid情報を一度Tealiumに連携した後、削除する
        if (this._window.Asw.AdobeAnalyticsOutput) {
          delete this._window.Asw.AdobeAnalyticsOutput;
        }
      }
    });
  }

  /**
   * Tealium連携制御用環境変数
   * - true: Tealium連携しない／false: Tealium連携する
   */
  private get _isDisableTealium(): boolean {
    return environment.tealium.disable;
  }

  /**
   * 基本情報JSON出力
   */
  private _getBaseOutput() {
    const { aswCommonData } = this._aswCommonSvc;
    const { aswContextData } = this._aswContextSvc;
    const { anaBizContextData } = this._anaBizContextSvc;
    let langAdobe = '';
    this._aswMasterSvc
      .getAswMasterByKey$(MasterStoreKey.LANGCODECONVERT_ALL)
      .pipe(take(1))
      .subscribe((state: any) => {
        state.forEach((record: any) => {
          if (record.lang === aswContextData.lang) {
            langAdobe = record.adobe_analytics;
            return;
          }
        });
      });
    return {
      charSet: 'UTF-8',
      currentDateTime: this._systemDateSvc.getFormattedSystemDate("yyyy-MM-dd'T'HH:mm:ss"),
      pageInformation: {
        functionId: aswCommonData.functionId ?? '',
        pageId: aswCommonData.pageId ?? '',
        subFunctionId: aswCommonData.subFunctionId ?? '',
        subPageId: aswCommonData.subPageId ?? '',
        isEnabledLogin: aswCommonData.isEnabledLogin ?? false,
        isUpgrade: aswCommonData.isUpgrade ?? false,
        pageName: this._getPageName(),
      },
      aswContext: { ...aswContextData, langForAdobeAnalytics: langAdobe },
      anaBizContext: anaBizContextData,
      errorMessageIds: this._getErrorMessageIds(),
      warningMessageIds: this._getWarningMessageIds(),
    };
  }

  /**
   * サイト情報取得
   */
  private _getSiteInfo(): string {
    const { pointOfSaleId, posCountryCode, bookingType } = this._aswContextSvc.aswContextData;
    return pointOfSaleId === CommonConstants.OFFICE_CODE_JP_R_APF
      ? 'APF'
      : posCountryCode === 'JP' && bookingType === 'R'
      ? 'ASW'
      : posCountryCode === 'JP' && bookingType === 'A'
      ? 'AWARD'
      : posCountryCode;
  }

  /**
   * レポートスイート取得
   */
  private _getReportSuite(): string {
    const { posCountryCode, lang } = this._aswContextSvc.aswContextData;
    return posCountryCode === 'JP' && lang === 'ja'
      ? 'INT'
      : posCountryCode === 'JP' && lang === 'en'
      ? 'ENG'
      : 'GLOBAL';
  }

  /**
   * ページ名称取得
   */
  private _getPageName() {
    const { aswContextData } = this._aswContextSvc;
    let adobeAnalytics: string = '';
    let pageName: string = '';
    this._subscription.add(
      forkJoin([
        this._aswMasterSvc.getAswMasterByKey$(MasterStoreKey.LANGCODECONVERT_ALL).pipe(take(1)),
        this._aswMasterSvc.getAswMasterByKey$(MasterStoreKey.LISTDATA_PD_001).pipe(take(1)),
      ]).subscribe(([langList, pageListByLang]) => {
        // Analytics向け言語コード取得
        adobeAnalytics = langList.filter((lang: any) => lang.lang === aswContextData.lang)?.[0]?.adobe_analytics ?? '';
        // ページ名称を取得
        const pageList = aswContextData.lang === 'ja' ? pageListByLang.ja : pageListByLang.en;
        pageName =
          pageList.filter(
            (page: any) => page.value === `${this._aswCommonSvc.getFunctionId()}_${this._aswCommonSvc.getPageId()}`
          )?.[0]?.display_content ?? '';
      })
    );
    return `${this._getReportSuite()}_BE_${this._getSiteInfo()}_${adobeAnalytics}_${pageName}`;
  }

  /**
   * ワーニングメッセージIDリスト取得
   */
  private _getWarningMessageIds(): string[] {
    const { warningMessage, subWarningMessage } = this._alertMessageStoreSvc.alertMessageData;
    const warningMessageIds = warningMessage.map(
      (item) => `${this._getFuncPageId(PageType.PAGE)}-${this._getWarningMsgIdApiCode(item)}`
    );
    const subWarningMessageIds = subWarningMessage.map(
      (item) => `${this._getFuncPageId(PageType.SUBPAGE)}-${this._getWarningMsgIdApiCode(item)}`
    );
    return [...warningMessageIds, ...subWarningMessageIds];
  }

  /**
   * ワーニングメッセージID・APIエラーコード取得
   *
   * @param alertMessageItem ワーニング共通情報
   */
  private _getWarningMsgIdApiCode(alertMessageItem: AlertMessageItem): string {
    if (alertMessageItem?.apiErrorCode) {
      return `${alertMessageItem?.errorMessageId || ''}-${alertMessageItem.apiErrorCode}`;
    }
    return `${alertMessageItem?.errorMessageId || ''}`;
  }

  /**
   * エラーメッセージIDリスト取得
   */
  private _getErrorMessageIds(): string[] {
    const errorIds: string[] = [];
    this._subscription.add(
      forkJoin([
        this._notRetryableError$.pipe(take(1)),
        this._pageRetryableError$.pipe(take(1)),
        this._subPageRetryableError$.pipe(take(1)),
      ]).subscribe(([notRetryableError, pageRetryableError, subPageRetryableError]) => {
        if (notRetryableError) {
          errorIds.push(`${this._getFuncPageId()}-${this._getErrorMsgIdApiCode(notRetryableError)}`);
        }
        if (pageRetryableError) {
          errorIds.push(`${this._getFuncPageId(PageType.PAGE)}-${this._getErrorMsgIdApiCode(pageRetryableError)}`);
        }
        if (subPageRetryableError) {
          errorIds.push(
            `${this._getFuncPageId(PageType.SUBPAGE)}-${this._getErrorMsgIdApiCode(subPageRetryableError)}`
          );
        }
      })
    );
    return errorIds;
  }

  /**
   * ファンクションID・ページID取得
   *
   * @param pageType 画面タイプ
   */
  private _getFuncPageId(pageType?: PageType): string {
    return `${this._aswCommonSvc.getFunctionId(pageType)}${this._aswCommonSvc.getPageId(pageType)}`;
  }

  /**
   * エラーメッセージID・APIエラーコード取得
   *
   * @param errorCommonInfo 継続不可能/継続可能エラー共通情報
   */
  private _getErrorMsgIdApiCode(errorCommonInfo: ErrorCommonInfo): string {
    if (errorCommonInfo?.apiErrorCode) {
      return `${errorCommonInfo?.errorMsgId || ''}-${errorCommonInfo.apiErrorCode}`;
    }
    return `${errorCommonInfo?.errorMsgId || ''}`;
  }
}
