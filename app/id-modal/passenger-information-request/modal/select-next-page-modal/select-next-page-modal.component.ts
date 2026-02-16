import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { apiEventAll, isStringEmpty } from '@common/helper';
import { AirportAllData, PassengerType } from '@common/interfaces';
import {
  CreateOrderStoreService,
  CurrentCartStoreService,
  DeliveryInformationStoreService,
  GetOrderStoreService,
  PlanReviewStoreService,
} from '@common/services';
import { CreateOrderState, CurrentCartState } from '@common/store';
import { RoutesCommon, RoutesResRoutes } from '@conf/routes.config';
import { SupportModalBlockComponent } from '@lib/components/support-class/support-modal-block-component';
import { AnaBizLoginStatusType, ErrorType, NotRetryableErrorModel } from '@lib/interfaces';
import { CommonLibService, ErrorsHandlerService, PageLoadingService } from '@lib/services';
import { OrdersCreateOrderRequest } from 'src/sdk-reservation';
import { GetOrderRequest } from 'src/sdk-servicing';
import { SelectNextPageModalService } from './select-next-page-modal.service';
import { StaticMsgPipe } from '@lib/pipes';
import { BehaviorSubject, combineLatest, filter, Subscription, take } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { ErrorCodeConstants } from '@conf/app.constants';

@Component({
  selector: 'asw-select-next-page-modal',
  templateUrl: './select-next-page-modal.component.html',
  styleUrls: ['./select-next-page-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectNextPageModalComponent extends SupportModalBlockComponent {
  constructor(
    private _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _router: Router,
    private _createOrderStoreService: CreateOrderStoreService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _getOrderStoreService: GetOrderStoreService,
    private _planReviewStoreService: PlanReviewStoreService,
    private _deliveryInformationStoreService: DeliveryInformationStoreService,
    private _service: SelectNextPageModalService,
    private _pageLoadingService: PageLoadingService,
    private _staticMsg: StaticMsgPipe,
    private _title: Title
  ) {
    super(_common);
    this.closeWithUrlChange(_router);
  }

  public dynamicMessage: string[] = [];
  public isCancel = false;
  public isSubmit = false;
  public isCancelStyle = '';
  public dispEnable = false;
  public airportMaster: Array<AirportAllData> = [];
  /**
   * ngOnDestroyにunsubscribeを実行
   */
  private _subscriptions: Subscription = new Subscription();

  /**
   * カート取得API実行完了の制御
   */
  private _cardControl$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @Output()
  closePassengerInfomationRequestModal = new EventEmitter<Event>();

  reload(): void {}

  init(): void {
    //キャッシュを取得する
    this._service.getCacheMaster((air) => {
      this.airportMaster = air;
      this.dispEnable = true;
      this._changeDetectorRef.markForCheck();
    });
  }

  destroy(): void {
    this._subscriptions.unsubscribe();
  }

  /**
   * シートマップ画面へ進むボタン押下時
   */
  goToSeatmap(): void {
    this.nextPage(false);
  }

  /**
   * 支払情報入力画面へ進むボタン押下時
   */
  public goToPayment(): void {
    this.nextPage(true);
  }

  /**
   * 閉じるボタン押下時処理
   */
  clickClose() {
    this.closeAndRefresh();
  }

  /**
   * カート情報・プラン情報の更新を予約してモーダルを閉じる処理
   */
  closeAndRefresh(): void {
    // 画面情報更新判定をtrueにする
    this._planReviewStoreService.updatePlanReview({ isNeedRefresh: true });
    this._changeDetectorRef.markForCheck();
    this.close();
  }

  /**
   * 「事前予約指定に進む」「支払に進む」ボタン押下時イベント
   * @param skipToPayment 支払スキップフラグ
   */
  public nextPage(skipToPayment: boolean) {
    this._service.nextPageExe(
      (res) => {
        this.isJuniorPilot(res, skipToPayment);
      },
      () => {
        this.close();
      }
    );
  }

  /**
   * ジュニアパイロット申込判定
   * @param res 操作中カート情報
   * @param skipToPayment 支払スキップフラグ
   */
  private isJuniorPilot(res: CurrentCartState, skipToPayment: boolean) {
    this._service.isJuniorPilot(
      res,
      () => {
        this.checkDisability(res, skipToPayment);
      },
      () => {
        this.close();
      }
    );
  }

  /**
   * 障がい介護者判定
   * @param res 操作中カート情報
   * @param skipToPayment 支払スキップフラグ
   */
  private checkDisability(res: CurrentCartState, skipToPayment: boolean) {
    this._service.checkDisability(
      res,
      () => {
        this.isMexicoFlightContain(res, skipToPayment);
      },
      () => {
        this.close();
      }
    );
  }

  /**
   * メキシコセグメント時処理
   * @param res 操作中カート情報
   * @param skipToPayment 支払スキップフラグ
   */
  private isMexicoFlightContain(res: CurrentCartState, skipToPayment: boolean) {
    this._service.isMexicoFlightContain(res, this.airportMaster, () => {
      this.afterUnder21AndConsentFormCheck(res, skipToPayment);
    });
  }

  /**
   * 21歳未満搭乗者チェックおよび同意書記入要否チェック後処理
   * @param res カート情報
   * @param skipToPayment 支払スキップフラグ
   */
  private afterUnder21AndConsentFormCheck(res: CurrentCartState, skipToPayment: boolean) {
    this._service.dialogCheck(
      this._service
        .getNameList(res.data?.plan?.travelers ?? [], this.payload?.order ?? '')
        .map((str) => str.toUpperCase()),
      () => {
        this.preboolApiCall(res, skipToPayment);
      }
    );
  }

  /**
   * prebookApi処理
   * @param cart カート情報
   * @param skipToPayment 支払スキップフラグ
   */
  preboolApiCall(cart: CurrentCartState, skipToPayment: boolean) {
    this._pageLoadingService.startLoading();
    // prebookAPIのリクエストパラメータ作成
    let currentCartId: OrdersCreateOrderRequest = {
      cartId: this._currentCartStoreService.CurrentCartData.data?.cartId ?? '',
    };
    apiEventAll(
      () => {
        this._createOrderStoreService.setCreateOrderFromApi(currentCartId);
      },
      this._createOrderStoreService.getCreateOrder$(),
      (res) => {
        this.preBookeSuccess(cart, skipToPayment, res);
      },
      (error) => {
        this._pageLoadingService.endLoading();
        this._service.createOrderApiError(
          skipToPayment ? 'label.paymentInformation' : 'label.seatMap',
          () => {
            // 搭乗者情報入力モーダルを閉じる
            if (this.payload.closeEvent) {
              this.payload.closeEvent('select end');
            }
            //遷移先分岐モーダルを閉じる
            this.close();
            // プラン確認画面に遷移
            this.closeAndRefresh();
          },
          () => {
            // 搭乗者情報入力モーダルを閉じる
            if (this.payload.closeEvent) {
              this.payload.closeEvent('select end');
            }
            //遷移先分岐モーダルを閉じる
            this.close();
          }
        );
      }
    );
    // カート取得API実行
    this._service.getCartApiCall(this._currentCartStoreService.CurrentCartData.data?.cartId ?? '', false, () => {
      this._cardControl$.next(true);
    });
  }

  /**
   * prebook成功後のイベント
   * @param cart カート情報
   * @param skipToPayment 支払スキップフラグ
   * @param res prebookApiレスポンス
   */
  preBookeSuccess(cart: CurrentCartState, skipToPayment: boolean, res: CreateOrderState) {
    // ユーザ共通情報.ログインステータス=“NOT_LOGIN”(未ログイン)の場合、
    if (this._common.isNotLogin()) {
      this._service.prebookNotLoginEvent(cart, res);
    }

    // PNR取得用情報作成し、引継ぎ情報に詰める
    let pnrParam = this._service.createPnrParam(cart, res.data?.orderId ?? '', this.payload?.isFromPlanView);
    this._deliveryInformationStoreService.updateDeliveryInformation({
      passToPayment: {
        isReserveDeliveryData: true,
        errInfo: this._deliveryInformationStoreService.deliveryInformationData.passToPayment?.errInfo ?? [],
        ...pnrParam,
      },
    });

    if (!skipToPayment) {
      // シートマップ画面に遷移する処理
      this.toSeatMapEvent(cart, pnrParam, (url) => {
        if (res.warnings?.[0]?.code === ErrorCodeConstants.ERROR_CODES.WBAZ000522) {
          //空席待ち状態から全てのセグメントが残席ありになった
          this._deliveryInformationStoreService.setDefaultDeliveryInformation({
            passengerInformationInput: {
              warningInfo: [
                {
                  apiErrorCode: ErrorCodeConstants.ERROR_CODES.WBAZ000522,
                  contentHtml: 'm_error_message-W0858',
                  isCloseEnable: true,
                  errorMessageId: 'W0858',
                },
              ],
              errorInfo: [],
            },
          });
        }
        this.navigateNext(url);
      });
    } else {
      // 別タブでAMOP画面表示中の元タブ（ASW画面）のブラウザバック時、タイトルを復元できないので、事前に設定しています。
      this._subscriptions.add(
        combineLatest([
          this._staticMsg.get('label.paymentInformation.title'),
          this._staticMsg.get('label.aswPageTitle'),
        ])
          .pipe(take(1))
          .subscribe(([str1, str2]) => {
            this._title.setTitle(`${str1}${str2}`);
          })
      );

      // 遷移先URLに支払情報入力画面を指定する
      this.navigateNext(
        this._common.aswContextStoreService.aswContextData.anaBizLoginStatus === AnaBizLoginStatusType.LOGIN
          ? RoutesResRoutes.ANABIZ_PAYMENT_INPUT
          : RoutesResRoutes.PAYMENT_INPUT
      );
    }
  }

  /**
   * シートマップ遷移処理
   * @param cart カート情報
   * @param pnrParam PNR情報取得リクエストパラメータ
   * @param next 次のイベント
   */
  toSeatMapEvent(cart: CurrentCartState, pnrParam: GetOrderRequest, next: (url: string) => void) {
    // PNR情報取得API呼び出し
    let requestParam = {
      ...pnrParam,
      cartId: cart.data?.cartId ?? '', //カートIDを追加する
      getServiceCatalogue: false,
    };

    apiEventAll(
      () => {
        this._getOrderStoreService.setGetOrderFromApi(requestParam);
      },
      this._getOrderStoreService.getGetOrderObservable(),
      (res) => {
        next(RoutesResRoutes.SEATMAP);
      },
      (error) => {
        this._pageLoadingService.endLoading();
        const errorInfo: NotRetryableErrorModel = {
          errorType: ErrorType.SYSTEM,
          errorMsgId: '',
          apiErrorCode: this._common.apiError?.errors?.[0]?.code ?? '',
          isPopupPage: false,
        };
        this._errorsHandlerSvc.setNotRetryableError(errorInfo);
        if (
          this._common.apiError?.errors?.[0]?.code === ErrorCodeConstants.ERROR_CODES.EBAZ000159 &&
          this.payload.closeEvent
        ) {
          this.payload.closeEvent('select end');
        }
        //共通エラー画面へ遷移
        this.close();
        this._router.navigateByUrl(RoutesCommon.SERVICE_ERROR);
      }
    );
  }

  /**
   * 次のページへ向かう共通処理
   * @param url 遷移先URL
   */
  navigateNext(url: string) {
    // 共通
    // カート取得API実行
    this._subscriptions.add(
      this._cardControl$
        .pipe(
          filter((data): boolean => data),
          take(1)
        )
        .subscribe(() => {
          // ボタン押下によって閉じる場合、payloadにcloseEventを設定する
          if (this.payload.closeEvent) {
            this.payload.closeEvent('select end');
          }

          // 遷移先分岐モーダルを閉じる
          this.close();

          // 遷移先画面に遷移する
          this._router.navigate([url]);
        })
    );
  }
}
