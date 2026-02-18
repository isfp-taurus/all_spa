import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Output, Input } from '@angular/core';
import { apiEventAll } from '@common/helper';
import { CurrentPlanStoreService, LocalPlanService, PlansCreatePlansStoreService } from '@common/services';
import { LModalContentsWidthType, ModalType } from '@lib/components';
import { AmcLoginHeaderComponent } from '@lib/components/shared-ui-components/amc-login/amc-login-header.component';
import { AmcLoginComponent } from '@lib/components/shared-ui-components/amc-login/amc-login.component';
import { isSP } from '@lib/helpers';
import { ErrorType } from '@lib/interfaces';
import { CommonLibService, ErrorsHandlerService, ModalService, PageLoadingService } from '@lib/services';
import { PlansCreatePlansRequest } from 'src/sdk-reservation';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import { PaymentInputPaymentMethodsData, PaymentInputPaymentMethodsParts } from './payment-input-payment-methods.state';
import {
  initPaymentInputPaymentMethodsData,
  initPaymentInputPaymentMethodsParts,
} from './payment-input-payment-methods.state';
import { PaymentInputScreenEntryInfo, dynamicSubject, screenEntryData } from '@app/payment-input/container';
import { FormControl } from '@angular/forms';
import { CurrentPlanState } from '@common/store';
import { fromEvent, throttleTime } from 'rxjs';
import { PaymentMethodsType } from '@common/interfaces/common/payment-methods';
import { GetOrderResponseData } from 'src/sdk-servicing';

/**
 * payment-input-payment-methods
 * 支払方法選択エリア
 */
@Component({
  selector: 'asw-payment-input-payment-methods',
  templateUrl: './payment-input-payment-methods.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInputPaymentMethodsComponent extends SubComponentModelComponent<
  PaymentInputPaymentMethodsData,
  PaymentInputPaymentMethodsParts
> {
  _data = initPaymentInputPaymentMethodsData();
  _parts = initPaymentInputPaymentMethodsParts();
  setDataEvent() {
    this.selectedPaymentMethod = this.data.selectedPaymentMethod;
    this.refresh();
  }
  setPartsEvent() {
    this.selectedPaymentMethod = this.parts.selectedPaymentMethod;
    this.refresh();
  }
  // Keep My Fare 選択識別子
  @Input() isKeepMyFare: boolean = false;
  // 支払方法選択表示判定
  @Input() isDisplayPaymentMethodSelection: boolean = false;
  // 画面情報
  @Input() screenEntry: PaymentInputScreenEntryInfo = screenEntryData();
  // 支払い情報利用可否判定マップ
  @Input() paymentMethod: Map<String, boolean> = new Map();
  // SP支払方法変更モード判定
  @Input() isChangePaymentMethod = false;
  // SPクレジットカード変更モード判定
  @Input() isChangeCreditCard = false;
  // クレジットカード決済対象
  @Input() isCreditCardPayment = true;
  // 予約のみ識別子
  @Input() isReservationOnly = false;
  // ANA SKYコインの併用
  @Input() isAnaSkyCoinCombination = true;
  // クレジットカードの併用
  @Input() isCreditCardCombination = true;
  // 端末種別(SP)
  @Input() isSp: boolean = false;
  // 特典フラグ
  @Input() isAwardBooking: boolean = false;
  // ngif制御用PFC徴収あり
  @Input() hasPFC: boolean = false;
  // 会員情報取得処理
  @Output() getMemberInformation = new EventEmitter();
  // 支払方法選択ボタンの押下処理
  @Output() selectPaymentMethodCallback = new EventEmitter();

  // 選択支払方法
  set selectedPaymentMethod(value: string) {
    if (this.isSp && this._selectedPaymentMethod === value) {
      return;
    }
    // 前の支払方法を保存する
    this.screenEntry.prevPaymentMethod = this._selectedPaymentMethod;
    this._selectedPaymentMethod = value;
    if (this.isSp) {
      this.isHandleStoreChanges = !this.isHandleStoreChanges;
      this.isChangePaymentMethod = true;
    } else {
      this.isChangePaymentMethod = false;
    }
    if (value === PaymentMethodsType.CREDIT_CARD) {
      this.isChangeCreditCard = true; // SPクレジットカード変更モード
      this.isCreditCardPayment = true; // クレジットカード決済対象
    }
    if (value === PaymentMethodsType.RESERVATION_ONLY) {
      this.isReservationOnly = true; // 予約のみ識別子
    }
    this._selectedPaymentMethod = value;
    // 動的文言
    const paymentInputDynamicParams = {
      ...dynamicSubject.getValue(),
      pageContext: {
        ...dynamicSubject.getValue().pageContext,
        currentPaymentMethod: value,
      },
    };
    dynamicSubject.next(paymentInputDynamicParams);
    this.update();
  }
  get selectedPaymentMethod(): string {
    return this._selectedPaymentMethod;
  }
  private _selectedPaymentMethod: string = '';
  // sp支払い方法変更ボタン
  public isHandleStoreChanges!: boolean;
  // モーダルの宣言?
  private _createPlansRequestParam: PlansCreatePlansRequest = {} as PlansCreatePlansRequest;
  // チェックボックス状態
  public saveAsUsualCheckboxControl: FormControl = new FormControl();
  // POS国コード
  public posCountryCode = this._common.aswContextStoreService.aswContextData.posCountryCode;

  constructor(
    private _common: CommonLibService,
    private _modalService: ModalService,
    private _currentPlanStoreService: CurrentPlanStoreService,
    private _createPlansStoreService: PlansCreatePlansStoreService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _errorsHandlerService: ErrorsHandlerService,
    private _localPlanService: LocalPlanService,
    private _pageLoadingService: PageLoadingService
  ) {
    super(_changeDetectorRef, _common);
  }

  public refresh() {
    this._changeDetectorRef.markForCheck();
  }

  public update() {
    this._data.isChangeCreditCard = this.isChangeCreditCard;
    this._data.isChangePaymentMethod = this.isChangePaymentMethod;
    this._data.isSaveAsUsualChecked = this.saveAsUsualCheckboxControl.value ?? false;
    this._data.selectedPaymentMethod = this.selectedPaymentMethod;
    this.dataChange.emit(this._data);
  }

  /**
   * 支払方法選択
   * @param store 選択された支払方法
   * @returns
   */
  public handleStore(store: string) {
    this.isReservationOnly = store === PaymentMethodsType.RESERVATION_ONLY;
    this.selectedPaymentMethod = store;
    this.selectPaymentMethodCallback.emit();
  }
  // SP版の場合
  handleStoreChanges() {
    this.isHandleStoreChanges = !this.isHandleStoreChanges;
  }

  /**
   * AMCログイン後処理
   * @param store 選択された支払い方法
   */
  amcLoginPostProcessing(store: string) {
    if (!this._common.isNotLogin()) {
      // ログインできた場合、以下の処理を行う
      const currentPlanData = this._currentPlanStoreService.CurrentPlanData;
      if (currentPlanData.cartId) {
        // 操作中プランが存在する場合
        // プラン作成APIのリクエストパラメータ作成
        this.setCreatePlansRequestParam(currentPlanData);
        // プラン作成APIの実行
        this.execCreatePlans(currentPlanData.cartId);
      } else {
        // 操作中プランが存在しない場合
        // 会員情報取得処理を呼び出す
        this.getMemberInformation.emit();
      }
      this.selectedPaymentMethod = store;
    } else {
      // ログイン状態に変更がなかった場合、変更前支払方法に戻す
      this.selectedPaymentMethod = this.screenEntry.prevPaymentMethod;
    }
    this.update();
  }

  /**
   * プラン作成APIのリクエストパラメータ作成
   * @param currentPlanData 操作中プラン
   */
  setCreatePlansRequestParam(currentPlanData: CurrentPlanState) {
    this._createPlansRequestParam = {
      plans: [
        {
          cartId: currentPlanData.cartId ?? '',
          planName: currentPlanData.planName ?? '',
          isUnsaved: currentPlanData.isUnsaved,
          creationPointOfSaleId: currentPlanData.creationPointOfSaleId ?? '',
        },
      ],
      processType: PlansCreatePlansRequest.ProcessTypeEnum.Merge, // 処理種別
    };
  }

  /**
   * プラン作成APIの実行
   * @param cartId 操作中のカートID
   */
  execCreatePlans(cartId: string) {
    this._pageLoadingService.startLoading();
    apiEventAll(
      () => {
        this._createPlansStoreService.setPlansCreatePlansFromApi(this._createPlansRequestParam);
      },
      this._createPlansStoreService.getPlansCreatePlans$(),
      () => {
        this._pageLoadingService.endLoading();
        this.deletePlan(cartId);
        this.getMemberInformation.emit();
      },
      () => {
        this._errorsHandlerService.setNotRetryableError({
          errorType: ErrorType.SYSTEM, // システムエラー
          apiErrorCode: this._common.apiError?.['errors']![0].code, // APIエラーレスポンス情報
        });
      }
    );
  }

  /**
   * プラン削除
   * @param cartId 操作中のカートID
   */
  private deletePlan(cartId: string) {
    const localPlanList = this._localPlanService.getLocalPlans() ?? {};
    const index = localPlanList?.plans?.findIndex((e) => e.cartId === cartId);
    if (typeof index !== 'undefined' && index !== -1) {
      localPlanList?.plans?.splice(index, 1);
      this._localPlanService.setLocalPlans(localPlanList);
    }
  }

  /**
   * クレジットカード or コンビニ支払い の選択状態を取得する
   * @returns true: 上記いずれかを選択している場合, false: どちらも選択していない場合
   */
  isCreditCardOrConvinienceStoreSelected(): boolean {
    const isRealLogin = this._common.aswContextStoreService.aswContextData.loginStatus === 'REAL_LOGIN';
    const isCdOrCvAvailable = (this.paymentMethod.get('CD') ?? false) || (this.paymentMethod.get('CV') ?? false);
    const isCdOrCvSelected = ['CD', 'CV'].includes(this.selectedPaymentMethod);

    return isRealLogin && isCdOrCvAvailable && isCdOrCvSelected;
  }

  reload(): void {}
  //画面のサイズを切り替えの設定
  private resizeEvent = () => {
    this.isSp = isSP();
    this._changeDetectorRef.markForCheck();
  };

  init(): void {
    this.subscribeService(
      'paymentInputCardSelecting_subHeaderResize',
      fromEvent(window, 'resize').pipe(throttleTime(200)),
      this.resizeEvent
    );
  }

  destroy(): void {}

  /**
   * 画面情報表示処理用
   */
  resetPartsEvent() {
    this.selectedPaymentMethod = this.parts.selectedPaymentMethod;
    this.data.isSaveAsUsualChecked = false;
    this.refresh();
  }
}
