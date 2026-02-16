import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { SupportModalIdComponent } from '@lib/components/support-class';
import { CommonLibService, PageInitService } from '@lib/services';
import { CheckboxComponent } from '@lib/components';
import { Router } from '@angular/router';
import { AgreementLangItem, AGREEMENT_PREVIOUS_PAGE_MAP } from './agreement.state';
import { TranslateService } from '@ngx-translate/core';
import { I18N_CONFIG } from '@conf';
import { DOCUMENT } from '@angular/common';
import { CurrentPlanStoreService } from '@common/services';
import { AgreementPayload } from './agreement-payload.state';
import { AgreementService } from './agreement.service';
import {
  AgreementMasterData,
  initialAgreementMasterData,
} from '@common/interfaces/reservation/id-modal/agreement/agreement-master-data';
import { FormControl } from '@angular/forms';
import { ReservationFunctionIdType, ReservationPageIdType } from '@common/interfaces';
import { AgreementHeaderComponent } from './agreement-header.component';
import { AgreementFooterComponent } from './agreement-footer.component';
import { checkAnaBizAndJapaneseOffice } from '@common/helper';

/**
 * R01P043 規約
 */
@Component({
  selector: 'asw-agreement',
  templateUrl: './agreement.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgreementComponent extends SupportModalIdComponent {
  // 初期化処理自動完了をオフにする
  override autoInitEnd = false;

  /** プロパティ定義*/
  //サブページID
  public subPageId: string = ReservationPageIdType.AGREEMENT;
  //サブ機能ID
  public subFunctionId: string = ReservationFunctionIdType.PRIME_BOOKING;

  /** 画面内使用変数 */
  public pointOfSalesId = ''; //オフィスコード
  public isChangeLang = false; //言語切り替え判定の初期値
  public isDisplayAPF: boolean = false; //APF説明表示判定初期値
  public isDisplayTerms: boolean = false; //規約表示判定格納用
  public isCheckedAgree = true; //規約同意チェックの初期値
  public override payload: AgreementPayload | null = {}; //モーダル呼び出し元より受け取るpayload
  public pageTitleKey = ''; //ページタイトルのプロパティキー
  public siteSwitchTitleKey?: string; //サイト切り替えのタイトルのプロパティキー
  public siteSwitchGuidanceKey?: string; //サイト切り替え案内のプロパティキー
  public langRadioList: string = ''; //言語選択のラジオボタン選択肢
  public langList: Array<AgreementLangItem> = []; //言語プルダウンの表示項目
  public master: AgreementMasterData = initialAgreementMasterData(); //規約で使用するマスタ
  public langCodeFc = new FormControl('en');
  //ヘッダーフッター
  public override headerRef: AgreementHeaderComponent | null = null;
  public override footerRef: AgreementFooterComponent | null = null;

  /** コンストラクタ */
  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _common: CommonLibService,
    private _pageInitService: PageInitService,
    private _service: AgreementService,
    private _router: Router,
    private _translateSvc: TranslateService,
    private _currentPlanStoreService: CurrentPlanStoreService,
    public change: ChangeDetectorRef
  ) {
    super(_common, _pageInitService);
    this.closeWithUrlChange(this._router);
  }

  /** INTERNAL_DESIGN_EVENT 初期表示処理 */
  init() {
    this._service.getMasterData((master) => {
      this.master = master;
      this.refresh();
    });
  }

  /** refresh処理　*/
  refresh() {
    if (this.footerRef) {
      this.footerRef.cancelEventExe = () => {
        this.cancelEvent();
      };
      this.footerRef.continueEventExe = () => {
        this.continueEvent();
      };
    }
    //APF説明表示判定、規約表示判定を保持
    this.isDisplayAPF = this.payload?.isDisplayAPF ?? false;
    this.isDisplayTerms = this.payload?.isDisplayTerms ?? false;

    //画面情報へ当画面の情報を設定
    this._common.aswCommonStoreService.updateAswCommon({
      subFunctionId: this.subFunctionId,
      subPageId: this.subPageId,
      isEnabledLogin: false,
      isUpgrade: false,
    });
    //操作中のプランのオフィスコードを保持する
    this.pointOfSalesId = this._currentPlanStoreService.CurrentPlanData.creationPointOfSaleId ?? '';

    //FY25要件 プランの作成オフィスまたは、現在の操作オフィスがANABizオフィスの場合、かつ両方が日本オフィスの場合、プランの作成オフィスを操作オフィスに置き換える。
    if (
      checkAnaBizAndJapaneseOffice(
        this.pointOfSalesId,
        this._common.aswContextStoreService.aswContextData.pointOfSaleId
      )
    ) {
      this._currentPlanStoreService.updateCurrentPlan({
        creationPointOfSaleId: this._common.aswContextStoreService.aswContextData.pointOfSaleId,
      });
      this.pointOfSalesId = this._common.aswContextStoreService.aswContextData.pointOfSaleId;
    }
    // 操作オフィスとプラン確認画面より受け取ったプラン作成オフィスが一致している場合は、モーダルを閉じる
    if (this.pointOfSalesId === this._common.aswContextStoreService.aswContextData.pointOfSaleId) {
      this.close();
    }

    //ユーザ共通.言語情報を取得
    const aswLangCode = this._common.aswContextStoreService.aswContextData.lang;

    //ユーザ共通.言語情報="ja"または"en"の場合、言語切り替え判定としてfalse(言語切り替えなし)を保持
    //上記以外、かつユーザ共通.言語情報≠引数.第3言語コードの場合、言語切り替え判定としてtrue(言語切り替えあり)を保持
    if (aswLangCode !== 'ja' && aswLangCode !== 'en' && aswLangCode !== this.payload?.thirdLanguageCode) {
      this.isChangeLang = true;
      //言語リストを取得
      this.langList = this._service.getLangList(this.payload?.thirdLanguageCode, this.master.pd065);
    }

    this.updateKey();
    this.change.detectChanges();
    this.resizeForce();
  }

  /**
   * 表示するキーの更新処理
   */
  private updateKey() {
    //APFサイトか否かによって、画面表示用のそれぞれのプロパティキーを保持
    if (this.isDisplayAPF) {
      if (this.headerRef) {
        this.headerRef.pageTitleKey = 'm_static_message-label.aboutAnaProFlyersBonus';
      }
      this.siteSwitchTitleKey = 'm_static_message-label.useAnaProFlyersBonus';
      this.siteSwitchGuidanceKey = 'm_static_message-label.siteRedirecton.anaProFlyersBonus';
    } else if (this.isDisplayTerms) {
      if (this.headerRef) {
        this.headerRef.pageTitleKey = `m_static_message-label.aboutAsw.${this.pointOfSalesId.substring(0, 7)}`;
      }
      this.siteSwitchTitleKey = 'm_static_message-label.useInternetGuidance';
      this.siteSwitchGuidanceKey = `m_static_message-label.siteRedirecton.${this.pointOfSalesId.substring(0, 3)}`;
    }
  }

  /** 画面終了時処理 */
  destroy(): void {}

  /** 画面更新時処理 */
  reload(): void {}

  /** 戻るボタン押下時処理 */
  cancelEvent() {
    //規約モーダルを閉じ、遷移元機能IDおよび遷移元画面IDを基に、遷移元画面へ遷移する。
    this.close();
    //遷移元画面情報を取得し、保持
    const preViousPage = (this.payload?.previousFunctionId ?? '') + (this.payload?.previousPageId ?? '');
    const route = AGREEMENT_PREVIOUS_PAGE_MAP.get(preViousPage);
    if (route) {
      this._router.navigate([route]);
    }
  }

  /** チェックボックス押下時処理 */
  clickAgreeChecked(checkBox: CheckboxComponent) {
    if (this.footerRef) {
      this.footerRef.isDisableContinue = !checkBox.checked;
    }
  }

  /** プラン確認表示ボタン押下時の処理 */
  continueEvent() {
    const langCode = this.langCodeFc.value ?? '';
    if (this.isChangeLang) {
      // 利用言語の設定
      this._translateSvc.use(langCode in I18N_CONFIG.supportedLocales ? langCode : I18N_CONFIG.defaultLanguage);
      // html lang属性再設定
      const documentEl: HTMLElement = this._document.documentElement;
      documentEl.lang = I18N_CONFIG.supportedLocales[langCode];
    }

    //オフィス言語更新処理の呼び出し
    this._common.aswContextStoreService.changeLanguage(
      this.isChangeLang ? langCode : null,
      this.pointOfSalesId !== '' ? this.pointOfSalesId : null
    );

    //モーダルを閉じる
    this.close(true);
  }
}
