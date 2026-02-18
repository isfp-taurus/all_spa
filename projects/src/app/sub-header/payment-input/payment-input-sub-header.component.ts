/**
 * サブヘッダー
 */
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  CurrentCartStoreService,
  DeliveryInformationStoreService,
  GetOrderStoreService,
  PaymentInputStoreService,
} from '@common/services';
import { RoutesResRoutes } from '@conf/routes.config';
import { environment } from '@env/environment';
import { SupportComponent } from '@lib/components/support-class';
import { PageType, SessionStorageName } from '@lib/interfaces';
import { AswServiceStoreService, CommonLibService } from '@lib/services';
import { fromEvent, throttleTime } from 'rxjs';
import { isPC } from 'src/lib/helpers';
import { submitNavigate, transform } from '@common/helper';

// 予約詳細画面へ連携する検索方法選択
const SEARCH_METHOD_SELECTION = 'order'; // 予約番号で検索
// 予約詳細画面へ連携する連携サイトID
const COLLABORAITION_SITE_ID = 'ALL_APP'; // ASW内の他アプリからの遷移

/**
 * サブヘッダー
 */
@Component({
  selector: 'asw-payment-input-sub-header',
  templateUrl: './payment-input-sub-header.component.html',
  providers: [],
})
export class PaymentInputSubHeaderComponent extends SupportComponent {
  /** ブレッドクラムのステップ数保持のための変数 */
  public stepNum: number = 5;
  public currentStepNum: number = 4;

  /** ANABiz出張者判定 **/
  isTraveler: boolean = false;

  /** 画面サイズ判定(PC) */
  public isPc = isPC();

  /** 画面サイズ比較用変数(PC) */
  public isPcPre = this.isPc;

  /** 画面サイズチェック用関数 */
  private _resizeEvent = () => {
    this.isPcPre = this.isPc;
    this.isPc = isPC();
    if (this.isPcPre !== this.isPc) {
      this._changeDetectorRef.markForCheck();
    }
  };

  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _deliveryInfoStoreService: DeliveryInformationStoreService,
    private _paymentInputStoreService: PaymentInputStoreService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _getOrderStoreService: GetOrderStoreService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _aswServiceService: AswServiceStoreService
  ) {
    super(_common);
  }

  /** 遷移元画面情報 */
  public previousPage: string = '';

  reload(): void {}

  init(): void {
    this.subscribeService('SubHeaderResize', fromEvent(window, 'resize').pipe(throttleTime(500)), this._resizeEvent);
    this.previousPage = this._paymentInputStoreService.paymentInputData.previousPage ?? '';
    this.subscribeService(
      'anabizPaymentSubheaderGetOrder',
      this._getOrderStoreService.getGetOrderObservable(),
      (res) => {
        if (res.data?.orderEligibilities?.payment?.isAnaBizApprovalEligible === false) {
          this.isTraveler = true;
        }

        if (this._common.aswCommonStoreService.getPageId() === 'P083' && this.isTraveler) {
          this.title = 'label.ANABizPaymentInput';
        } else {
          this.title = 'label.paymentInformation.title';
        }
      }
    );
  }

  destroy(): void {}

  title: string = 'Payment';

  /**
   * 戻るボタン押下時処理
   */
  back(): void {
    // 支払情報入力画面取得情報破棄処理
    switch (this.previousPage) {
      case 'R01P040': // プラン確認
        this._paymentInputStoreService.paymentInputInformationDiscard();
        this._router.navigateByUrl(RoutesResRoutes.PLAN_REVIEW);
        break;
      case 'R01P070': // シートマップ
      case 'R01P071': // 座席属性指定
        this._paymentInputStoreService.paymentInputInformationDiscardBackSeatmap();
        this._router.navigateByUrl(RoutesResRoutes.SEATMAP);
        break;
      default: // 予約詳細画面へ遷移
        this._paymentInputStoreService.paymentInputInformationDiscard();
        // BookingSearchModelに従いパラメータ作成
        if (this._currentCartStoreService.CurrentCartData.data?.cartId) {
          const queryParams = {
            previousFuncId: 'R01', // (遷移元画面機能ID)
            previousPageId: this._common.aswCommonStoreService.aswCommonData.pageId, // (遷移元画面画面ID)
            searchType: SEARCH_METHOD_SELECTION, // 検索方法選択
            cooperationNo: '', // (企業ID)
            orderId: this._deliveryInfoStoreService.deliveryInformationData.passToPayment?.orderId ?? '', // 予約番号
            eticketNo: '', // (航空券番号)
            lastName: this._deliveryInfoStoreService.deliveryInformationData.passToPayment?.credential?.lastName, // 搭乗者名(姓)
            firstName: this._deliveryInfoStoreService.deliveryInformationData.passToPayment?.credential?.firstName, // 搭乗者名(名)
            amcMemberNo: '', // (AMC会員番号)
            siteId: COLLABORAITION_SITE_ID, // 連携サイトID
            JSessionId: '', // (セクションID)
            aswIntErrorId: '', // (国際ASWエラーID)
            errorId: '', // エラーID
            warningId: '', // (ワーニングID)
            nextAction: '', // (次に必要な行うアクション)
            CONNECTION_KIND: 'ZZZ', // 接続種別
          };
          // 予約検索画面(S01-P010)へ遷移する予約検索画面から予約詳細画面('mybooking')に遷移する
          const lang = this._common.aswContextStoreService.aswContextData.lang;
          const identificationId = this._common.loadSessionStorage(SessionStorageName.IDENTIFICATION_ID);
          const url = transform(
            environment.spa.baseUrl + environment.spa.app.srv + '/booking-search',
            lang,
            identificationId
          );
          submitNavigate(url, queryParams);
        } else {
          const queryParams = {
            previousFuncId: 'R01', // (遷移元画面機能ID)
            previousPageId: this._common.aswCommonStoreService.aswCommonData.pageId, // (遷移元画面画面ID)
            searchType: SEARCH_METHOD_SELECTION, // 検索方法選択
            cooperationNo: '', // (企業ID)
            orderId: this._aswServiceService.aswServiceData.orderId ?? '', // 予約番号
            eticketNo: '', // (航空券番号)
            lastName: this._aswServiceService.aswServiceData.lastName, // 搭乗者名(姓)
            firstName: this._aswServiceService.aswServiceData.firstName, // 搭乗者名(名)
            amcMemberNo: '', // (AMC会員番号)
            siteId: COLLABORAITION_SITE_ID, // 連携サイトID
            JSessionId: '', // (セクションID)
            aswIntErrorId: '', // (国際ASWエラーID)
            errorId: '', // エラーID
            warningId: '', // (ワーニングID)
            nextAction: '', // (次に必要な行うアクション)
            CONNECTION_KIND: 'ZZZ', // 接続種別
          };
          // 予約検索画面(S01-P010)へ遷移する予約検索画面から予約詳細画面('mybooking')に遷移する
          const lang = this._common.aswContextStoreService.aswContextData.lang;
          const identificationId = this._common.loadSessionStorage(SessionStorageName.IDENTIFICATION_ID);
          const url = transform(
            environment.spa.baseUrl + environment.spa.app.srv + '/booking-search',
            lang,
            identificationId
          );
          submitNavigate(url, queryParams);
        }
        break;
    }
  }
}
