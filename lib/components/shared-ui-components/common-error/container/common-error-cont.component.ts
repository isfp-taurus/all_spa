import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import {
  AswContextStoreService,
  AswMasterService,
  AswServiceStoreService,
  ErrorsHandlerService,
} from '../../../../services';
import { DeviceType, ErrorPageRoutes, NotRetryableErrorModel } from '../../../../interfaces';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@env/environment';
import { CommonConstants } from '@conf/app.constants';
import { CommonLibService } from '../../../../services';
import { Title } from '@angular/platform-browser';
import { StaticMsgPipe } from '@lib/pipes';

/**
 * ボタンの種類
 * - top: TOPへボタン
 * - confirm: 確認ボタン
 */
type BtnType = (typeof BtnType)[keyof typeof BtnType];
const BtnType = {
  TOP: 'top',
  CONFIRM: 'confirm',
} as const;

/** 予約詳細画面(S01-P030)への遷移時情報 */
const PostMyBooking = {
  URL: 'servicing/mybooking',
  SITE_ID: 'ALL_APP',
  CONNECTION_KIND: 'ZZZ',
};

/** ページタイトル用静的文言キー */
const COMMON_ERROR_TITLE_KEY = 'heading.information';

/**
 * [SharedUI] 共通エラー画面 (container)
 *
 * @implements {OnInit}
 */
@Component({
  selector: 'asw-common-error',
  templateUrl: './common-error-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommonErrorContComponent implements OnInit, OnDestroy {
  /** エラー情報 */
  public errorInfo?: NotRetryableErrorModel | null;

  /** 表示用エラー文言ID */
  public displayErrorKey$?: Observable<string | null>;

  /** 固定のエラー文言キー */
  public fixedErrorMsgKey?: string;

  /** ボタンラベルの文言キー */
  public get buttonLabelMsgKey() {
    return this._navigateBtnType === BtnType.TOP ? 'label.backToTop' : 'label.confirmError1';
  }

  /** popup画面の場合の閉じるボタン表示制御 */
  public showCloseBtn = false;

  /**
   * ボタンの種類
   * - top: TOPへボタン
   * - confirm: 確認ボタン
   */
  private _navigateBtnType: BtnType = BtnType.TOP;

  /** 遷移先情報 */
  private _routingInfo?: { params?: any; path: string };

  private _subscription: Subscription = new Subscription();

  constructor(
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _aswServiceSvc: AswServiceStoreService,
    private _activatedRoute: ActivatedRoute,
    private _aswMasterSvc: AswMasterService,
    private _aswContextStoreSvc: AswContextStoreService,
    private _common: CommonLibService,
    private _titleSvc: Title,
    private _staticMsg: StaticMsgPipe
  ) {
    this._titleSvc.setTitle(this._staticMsg.transform(COMMON_ERROR_TITLE_KEY));
  }

  public ngOnInit(): void {
    // エラー画面ごとの処理ロジック
    const pageType = this._activatedRoute.snapshot.paramMap.get('type');
    switch (pageType) {
      // 共通エラー
      case ErrorPageRoutes.SERVICE:
        this._serviceErrorHandle();
        break;
      // システムエラー
      case ErrorPageRoutes.SYSTEM:
        this._systemErrorHandle();
        break;
      // セッションタイムアウトエラー
      case ErrorPageRoutes.SESSION_TIMEOUT:
        this._sessionTimeoutHandle();
        break;
      // ブラウザバックエラー
      case ErrorPageRoutes.BROWSER_BACK:
        this._browserBackHandle();
        break;
      default:
        break;
    }
  }

  public ngOnDestroy() {
    this._subscription.unsubscribe();
    this._errorsHandlerSvc.clearNotRetryableError();
  }

  /**
   * 確認ボタンとTOPへボタンの処理
   */
  public confirmNavigate() {
    if (this._navigateBtnType === BtnType.TOP) {
      this._common.navigateAllSite();
    } else {
      this._linkToPagePost(this._routingInfo?.path!, this._routingInfo?.params);
    }
  }

  /**
   * 閉じるボタンの処理（popup画面の場合）
   */
  public popupClose() {
    (window as any).close();
  }

  /**
   * 共通エラー
   */
  private _serviceErrorHandle() {
    this.displayErrorKey$ = this._errorsHandlerSvc.getDisplayErrorKey$();

    this._subscription.add(
      combineLatest([this._errorsHandlerSvc.getNotRetryableError$(), this._aswServiceSvc.getAswService$()])
        .pipe(take(1))
        .subscribe(([errorInfo, aswService]) => {
          this.errorInfo = errorInfo;
          // ポップアップ表示の場合
          if (errorInfo.isPopupPage) {
            this.showCloseBtn = true;
          }
          // routingPath指定された場合
          if (errorInfo.routingPath) {
            this._navigateBtnType = BtnType.CONFIRM;
            this._routingInfo = { path: errorInfo.routingPath };
          } else {
            // PNR無効扱いエラーリストに該当するエラーメッセージIDかを判定
            const isNotApply = this._aswMasterSvc
              .getMPropertyByKey('otherSystemSettings', 'notApplyBehaviorMessageIdList')
              .split(',')
              .includes(errorInfo.errorMsgId || '');

            // orderId（予約番号）もしくはtravelDocumentId（航空券番号）のいずれかの値が存在する場合
            if ((aswService.orderId || aswService.travelDocumentId) && !isNotApply) {
              // 確認ボタンを表示する
              this._navigateBtnType = BtnType.CONFIRM;
              // 遷移先を予約詳細画面(S01-P030)に指定
              const pagePostParams = {
                orderId: aswService.orderId,
                firstName: aswService.firstName,
                lastName: aswService.lastName,
                SITE_ID: PostMyBooking.SITE_ID,
                CONNECTION_KIND: PostMyBooking.CONNECTION_KIND,
              };
              this._routingInfo = { path: PostMyBooking.URL, params: pagePostParams };
            } else {
              // TOPへボタンを表示する
              this._navigateBtnType = BtnType.TOP;
            }
          }
        })
    );
  }

  /**
   * セッションタイムアウトエラー
   */
  private _sessionTimeoutHandle() {
    const msgKey = 'message.error.session';
    this.displayErrorKey$ = this._errorsHandlerSvc.getDisplayErrorKey$(undefined, msgKey);
    this.fixedErrorMsgKey = msgKey;
    // TOPへボタンを表示する
    this._navigateBtnType = BtnType.TOP;
  }

  /**
   * システムエラー
   */
  private _systemErrorHandle() {
    const msgKey = 'message.error.fatalError';
    this.displayErrorKey$ = this._errorsHandlerSvc.getDisplayErrorKey$(undefined, msgKey);
    this.fixedErrorMsgKey = msgKey;
    this._setDisplayButton();
  }

  /**
   * ブラウザバックエラー
   */
  private _browserBackHandle() {
    const msgKey = 'message.error.browserBack';
    this.displayErrorKey$ = this._errorsHandlerSvc.getDisplayErrorKey$(undefined, msgKey);
    this.fixedErrorMsgKey = msgKey;
    this._setDisplayButton();
  }

  /**
   * 表示ボタン・ボタン遷移先設定
   */
  private _setDisplayButton() {
    this._subscription.add(
      this._aswServiceSvc
        .getAswService$()
        .pipe(take(1))
        .subscribe((aswService) => {
          // orderId（予約番号）もしくはtravelDocumentId（航空券番号）のいずれかの値が存在する場合
          if (aswService.orderId || aswService.travelDocumentId) {
            // 確認ボタンを表示する
            this._navigateBtnType = BtnType.CONFIRM;
            // 遷移先を予約詳細画面(S01-P030)に指定
            const pagePostParams = {
              orderId: aswService.orderId,
              firstName: aswService.firstName,
              lastName: aswService.lastName,
              SITE_ID: PostMyBooking.SITE_ID,
              CONNECTION_KIND: PostMyBooking.CONNECTION_KIND,
            };
            this._routingInfo = { path: PostMyBooking.URL, params: pagePostParams };
          } else {
            // TOPへボタンを表示する
            this._navigateBtnType = BtnType.TOP;
          }
        })
    );
  }

  /**
   * ASWTOPのURL取得
   */
  private _getTopUrl() {
    let topUrl = this._aswMasterSvc.getMPropertyByKey('application', 'topServer');
    if (this._aswContextStoreSvc.aswContextData.deviceType === DeviceType.PC && this._isJapanOrApfWebsite()) {
      topUrl += this._aswMasterSvc.getMPropertyByKey('application', 'topPath.pc.revenue');

      if (this._aswContextStoreSvc.aswContextData.lang !== 'ja') {
        topUrl += 'e';
      }
    } else {
      topUrl += this._aswMasterSvc.getMPropertyByKey('application', 'topPath');
    }

    return topUrl;
  }

  /**
   * 日本サイト（有償・特典）または APFサイトかの判定
   */
  private _isJapanOrApfWebsite() {
    const officeCode = this._aswContextStoreSvc.aswContextData.pointOfSaleId;
    return (
      officeCode === CommonConstants.OFFICE_CODE_JP_R ||
      officeCode === CommonConstants.OFFICE_CODE_JP_A ||
      officeCode === CommonConstants.OFFICE_CODE_JP_R_APF
    );
  }

  /**
   * ページ遷移処理（POST）
   * @param path パス
   * @param params パラメータ
   */
  private _linkToPagePost(path: string, params?: { [key: string]: any }) {
    const form = document.createElement('form');
    form.method = 'post';
    form.action = this._convertToFullPath(path);
    form.target = '_self';

    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = key;
        hiddenField.value = params[key];
        form.appendChild(hiddenField);
      }
    }

    document.body.appendChild(form);
    form.submit();
  }

  private _convertToFullPath(path: string) {
    const isFullPath = path.includes('https:') || path.includes('http:');
    const origin = window.location.origin;
    const baseUrl = environment.spa.baseUrl;
    return isFullPath ? path : `${origin}${baseUrl}/${path}`;
  }
}
