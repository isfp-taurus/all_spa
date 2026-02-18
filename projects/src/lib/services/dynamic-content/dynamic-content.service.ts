import { formatDate } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { environment } from '@env/environment';
import { PageType, DynamicParams, DynamicContent, DynamicContentDetail } from '../../interfaces';
import {
  DynamicContentStore,
  selectSubPageDynamicContent,
  selectPageDynamicContent,
  resetSubPageDynamicContent,
  resetPageDynamicContent,
  resetAllDynamicContent,
  setSubPageDynamicContent,
  setPageDynamicContent,
} from '../../store';
import { Store, select } from '@ngrx/store';
import { Observable, combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AswContextStoreService } from '../asw-context-store/asw-context-store.service';
import { AnaBizContextStoreService } from '../ana-biz-context-store/ana-biz-context-store.service';
import { LoadScriptService } from '../load-script/load-script.service';
import { SystemDateService } from '../system-date/system-date.service';
import { AMCMemberStoreService } from '../amc-member-store/amc-member-store.service';
import { getFingerprintsVersion } from '../../helpers';

/**
 * 動的文言取得Service
 */
@Injectable({
  providedIn: 'root',
})
export class DynamicContentService {
  /**
   * 動的文言判定JavaScriptファイル名のprefix
   * - JavaScriptは「動的文言条件判定スクリプト作成バッチ」より作成
   */
  private _prefixJsFileName = 'dynamicMessage_';

  /**
   * 動的文言判定JavaScript内function名のprefix
   * - JavaScriptは「動的文言条件判定スクリプト作成バッチ」より作成
   */
  private _prefixJsFuncName = 'getDynamicContentFor';

  /**
   * 動的文言判定JavaScriptファイルの格納先ディレクトリー
   */
  private _jsFileDir = `${environment.spa.baseUrl}${environment.spa.app.cache}`;

  /** window object */
  private _window = window as any;

  constructor(
    private _loadScriptSvc: LoadScriptService,
    private _sysTimeSvc: SystemDateService,
    private _store: Store<DynamicContentStore>,
    private _aswContextSvc: AswContextStoreService,
    private _anaBizContextSvc: AnaBizContextStoreService,
    private _amcmemberSvc: AMCMemberStoreService,
    @Inject(LOCALE_ID) private _localeId: string
  ) {}

  /**
   * 動的文言判定JavaScriptロード
   *
   * @param functionId 機能ID（例：CHG01）
   * @param pageId 画面ID（例：P010）
   * @returns ロード結果（Observable<動的文言判定JavaScriptファイルパス>）
   */
  public loadScript$(functionId: string, pageId: string): Observable<string> {
    // 動的文言判定jsのファイルパス
    let loadJsPath = `${this._jsFileDir}/${this._prefixJsFileName}${functionId}_${pageId}.js`;
    // Fingerprints.jsから動的文言判定jsのバージョンを取得
    const jsVersion = getFingerprintsVersion(loadJsPath);
    if (jsVersion) {
      loadJsPath = `${loadJsPath}?${jsVersion}`;
    }
    return this._loadScriptSvc.load$(loadJsPath);
  }

  /**
   * 動的文言パラメータ再取得
   *
   * @param dynamicParams$ 動的文言判定用情報（各画面固有で設定した情報）
   * @returns 共通の動的文言判定用情報に各画面固有で設定した情報をマージした結果
   */
  public getDynamicParams$(dynamicParams$?: Observable<DynamicParams> | undefined): Observable<DynamicParams> {
    const params$ = combineLatest([
      // ユーザ共通情報
      this._aswContextSvc.getAswContext$(),
      // ANA Bizログイン情報
      this._anaBizContextSvc.getAnaBizContext$(),
      // 会員情報
      this._amcmemberSvc.getAMCMember$(),
      dynamicParams$ || of({}),
    ]).pipe(
      map(([aswContext, anaBizContext, amcMember, customParams]) => {
        // 空港現地時間
        const airportLocalDate = this._sysTimeSvc.getAirportLocalDate(aswContext.pointOfSaleId);
        // 空港現地時間を空港現地時間(YYYYMMDDハイフン)に変換
        const format = 'yyyy-MM-dd';
        const airportLocalDateYMDHypen = formatDate(airportLocalDate, format, this._localeId);

        return {
          aswContext,
          anaBizContext,
          ...customParams,
          ...{ dynamicAmcmemberReply: amcMember },
          airportLocalDateYMDHypen,
        };
      })
    );
    return params$;
  }

  /**
   * 動的文言表示内容設定
   *
   * @param functionId 機能ID（例：CHG01）
   * @param pageId 画面ID（例：P010）
   * @param dynamicParams 動的文言判定用情報
   * @param isSubPage サブ画面判定フラグ（指定しない場合は「画面」とする）
   */
  public setDynamicContent(functionId: string, pageId: string, dynamicParams: DynamicParams, isSubPage?: boolean) {
    const functionName = `${this._prefixJsFuncName}${functionId}_${pageId}`;
    if (!this._window[functionName]) {
      return;
    }
    // システム日時取得
    const japanDateTime = this._sysTimeSvc.getSystemDate();
    // 動的文言判定JavaScriptのfunctionを実行
    const dynamicContent = this._window[functionName](japanDateTime, dynamicParams);

    // 動的文言表示情報をmessageTypeごとにグルーピングし、
    // messageId をdisplayOrderの昇順に並べ替え、画面タイプに応じてDynamicContentStoreに格納
    // 例：「{messageType1: messageId[], messageType2: messageId[] ... }」
    const dynamicCategorized: DynamicContent = {};
    const compareFun = (before: DynamicContentDetail, after: DynamicContentDetail) =>
      Number(before.displayOrder) - Number(after.displayOrder);
    const sortDynamicFun = (dynamicContent: Array<DynamicContentDetail>) => dynamicContent.sort(compareFun);
    sortDynamicFun(dynamicContent).forEach((content: DynamicContentDetail) => {
      if (!dynamicCategorized[content.messageType]) {
        dynamicCategorized[content.messageType] = [];
      }
      dynamicCategorized[content.messageType].push(content.messageId);
    });

    if (isSubPage) {
      this._store.dispatch(setSubPageDynamicContent(dynamicCategorized));
    } else {
      this._store.dispatch(setPageDynamicContent(dynamicCategorized));
    }
  }

  /**
   * 動的文言表示Storeから情報取得
   *
   * @param isSubPage サブ画面判定フラグ（指定しない場合は「画面」とする）
   * @returns
   */
  public getDynamicContent$(isSubPage?: boolean): Observable<DynamicContent | null> {
    if (isSubPage) {
      return this._store.pipe(select(selectSubPageDynamicContent));
    } else {
      return this._store.pipe(select(selectPageDynamicContent));
    }
  }

  /**
   * 動的文言表示Storeクリア
   * - pageTypeがpageの場合：pageInfo
   * - pageTypeがsubPageの場合：subPageInfo
   * - pageType未指定の場合：pageInfo及びsubPageInfo
   *
   * @param pageType 画面タイプ
   */
  public clearDynamicContent(pageType?: PageType) {
    if (pageType === PageType.SUBPAGE) {
      this._store.dispatch(resetSubPageDynamicContent());
    } else if (pageType === PageType.PAGE) {
      this._store.dispatch(resetPageDynamicContent());
    } else {
      this._store.dispatch(resetAllDynamicContent());
    }
  }
}
