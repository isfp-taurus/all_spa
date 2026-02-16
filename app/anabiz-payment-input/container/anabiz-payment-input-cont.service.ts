import { Inject, Injectable, NgZone } from '@angular/core';
import { PreviousScreenHandoverInformation } from '@app/payment-input';
import { DeliveryInformationStoreService } from '@common/services';
import { SupportClass } from '@lib/components/support-class';
import { PageType } from '@lib/interfaces';
import { AswMasterService, CommonLibService, ErrorsHandlerService, LoadScriptService } from '@lib/services';
import { GetOrderResponseDataOrderEligibilitiesPayment } from 'src/sdk-servicing';
import { DOCUMENT } from '@angular/common';

// 予約詳細画面へ連携する検索方法選択
const SEARCH_METHOD_SELECTION = 'order'; // 予約番号で検索
// 予約詳細画面へ連携する連携サイトID
const COLLABORAITION_SITE_ID = 'ALL_APP'; // ASW内の他アプリからの遷移

@Injectable({ providedIn: 'root' })
export class AnabizPaymentInputContService extends SupportClass {
  // device ID
  public deviceId: string = '';

  destroy(): void {}
  constructor(
    @Inject(DOCUMENT) private _document: Document,
    @Inject(NgZone) private _ngZone: NgZone,
    private _common: CommonLibService,
    private _aswMasterService: AswMasterService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _deliveryInformationStoreService: DeliveryInformationStoreService,
    private _loadScriptService: LoadScriptService
  ) {
    super();
  }

  /**
   * 予約詳細画面への連携パラメータ作成
   * @param errorId 利用不可理由を返還したエラーコード
   * @return 連携パラメータ
   */
  saveLinkageParametersInStore(errorId: string, prevScreenInfo: PreviousScreenHandoverInformation): object {
    // BookingSearchModelに従いパラメータ作成
    const queryParams = {
      previousFuncId: 'R01', // (遷移元画面機能ID)
      previousPageId: 'P083', // (遷移元画面画面ID)
      searchType: SEARCH_METHOD_SELECTION, // 検索方法選択
      cooperationNo: '', // (企業ID)
      orderId: prevScreenInfo.orderId, // 予約番号
      eticketNo: '', // (航空券番号)
      lastName: prevScreenInfo.credential.lastName, // 搭乗者名(姓)
      firstName: prevScreenInfo.credential.firstName, // 搭乗者名(名)
      amcMemberNo: '', // (AMC会員番号)
      SITE_ID: COLLABORAITION_SITE_ID, // 連携サイトID
      JSessionId: '', // (セクションID)
      errorId: errorId, // エラーID
      warningId: '', // (ワーニングID)
      nextAction: '', // (次に必要な行うアクション)
    };
    return queryParams;
  }

  /**
   * 支払情報入力機能利用不可理由取得
   * @param reasons 支払情報入力機能利用不可理由（PNR情報）
   * @returns エラーコード
   */
  orderEligibilitiesToErrorId(
    reasons: Array<GetOrderResponseDataOrderEligibilitiesPayment.NonEligibilityReasonsEnum> | undefined
  ): string {
    const code = GetOrderResponseDataOrderEligibilitiesPayment.NonEligibilityReasonsEnum;
    if (
      reasons?.some(
        (value) =>
          value === code.NotNhPnr || // 直営PNRでない
          value === code.CallCenterCreated || // PNRオーナーオフィスコードが、オフィスマスタに登録されているWebオフィスではない
          value === code.NdcPnr || // NDC PNR
          value === code.NeedMedicalSupport || // 日本国内単独旅程かつ操作オフィスのPOSがアメリカ以外で、SSR MEDA、STCR、DPNAのいずれかが存在（医療系サポートが必要）
          value === code.HasInfantAndNeedSupport || // 日本国内単独旅程かつ操作オフィスのPOSがアメリカ以外で、SSR WCHC、SSR CKIN EXMO、SK EXMOのいずれかが存在し、かつ席あり、席なしを問わず幼児が存在する
          value === code.SegmentNotConfirmed || // セグメントステータスが確定ステータス(設定ファイルにて管理)以外である便が含まれる
          value === code.HasOpenSegment || // OPEN便が含まれる
          value === code.OfflineRemark // RMエレメントにWEB発券不可を示す所定の文字列が存在する
      )
    ) {
      return 'E0550'; // 購入発券ができない旨
    }
    if (reasons?.some((value) => value === code.PassedTicketIssuanceDeadline)) {
      // 発券期限切れ
      return 'E0564'; // 発券期限切れの旨
    }
    return ''; // その他の利用不可理由
  }

  /**
   * Reputation Managerのインストール
   */
  reputationManagerInstall() {
    this._ngZone.runOutsideAngular(() => {
      // 実IP情報収集利用フラグ
      const ioEnableRip = this._aswMasterService.getMPropertyByKey(
        'paymentInformationInput',
        'reputationManager.ioEnableRip'
      );
      // Flash8インストール判定フラグ
      const ioInstallFlash = this._aswMasterService.getMPropertyByKey(
        'paymentInformationInput',
        'reputationManager.ioInstallFlash'
      );
      // Active X controlインストール判定フラグ
      const ioInstallStm = this._aswMasterService.getMPropertyByKey(
        'paymentInformationInput',
        'reputationManager.ioInstallStm'
      );
      // ActiveXIE最低ブラウザバージョン
      const ioExcludeStm = this._aswMasterService.getMPropertyByKey(
        'paymentInformationInput',
        'reputationManager.ioExcludeStm'
      );
      // 内部コンテンツ設定
      const _window = window as any;
      _window.io_enable_rip = ioEnableRip;
      _window.io_install_flash = ioInstallFlash;
      _window.io_install_stm = ioInstallStm;
      _window.io_exclude_stm = ioExcludeStm;
      _window.io_bb_callback = (bb: any, complete: any) => {
        if (complete) {
          this.deviceId = bb;
        }
      };
      // snare.js のURL
      const snareUrl = this._aswMasterService.getMPropertyByKey(
        'paymentInformationInput',
        'reputationManager.snareUrl'
      );
      // snare.js インストール
      this._loadScriptService.load$(snareUrl, true).subscribe();
    });
  }

  /**
   * PNR情報取得APIのリクエストパラメータ取得
   * @returns PNR情報取得APIのリクエストパラメータ
   */
  serviceCommonInformationAcuquisition(cartId: string, prevScreenInfo: PreviousScreenHandoverInformation) {
    // 6.操作中のカートが存在しない場合、サービス共通情報を前画面の引継ぎ情報とする
    return {
      orderId: prevScreenInfo.orderId,
      credential: {
        firstName: prevScreenInfo.credential.firstName,
        lastName: prevScreenInfo.credential.lastName,
      },
      mask: false,
      cartId: cartId || undefined, // ※空文字回避のため、|| undefinedを使う
    };
  }

  /**
   * 前画面引継ぎ情報エラーの処理
   */
  previousScreenError() {
    let errInfo = this._deliveryInformationStoreService.deliveryInformationData.passToPayment?.errInfo;

    // 前画面引継情報.エラー情報がある場合、以下の処理を行う
    if (errInfo && errInfo?.length > 0) {
      errInfo.forEach((info) => {
        // 継続可能エラー
        this._errorsHandlerSvc.setRetryableError(PageType.PAGE, info);
      });
    }
  }
}
