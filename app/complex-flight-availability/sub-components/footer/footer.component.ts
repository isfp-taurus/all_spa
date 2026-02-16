import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  Renderer2,
} from '@angular/core';
import { Router } from '@angular/router';
import { fetchComplexRequestData } from '@app/complex-flight-availability/helper/data';
import { Travelers } from '@app/complex-flight-availability/presenter/complex-flight-availability-pres.state';
import { ComplexFlightAvailabilityStoreService } from '@app/complex-flight-availability/service/store.service';
import { RoundtripFlightAvailabilityInternationalPresService } from '@app/roundtrip-flight-availability-international/presenter/roundtrip-flight-availability-international-pres.service';
import { PaymentDetailModalService } from '@common/components/shopping/payment-detail/payment-detail-modal.service';
import { UnitPrice } from '@common/components/shopping/payment-detail/payment-detail.state';
import { CancelPrebookService, SearchFlightStoreService, UpdateAirOffersStoreService } from '@common/services';
import { CreateCartStoreService } from '@common/services/api-store/sdk-reservation/create-cart-store/create-cart-store.service';
import { CurrentCartStoreService } from '@common/services/store/common/current-cart-store/current-cart-store.service';
import { DeliveryInformationStoreService } from '@common/services/store/common/delivery-information-store/delivery-information-store.service';
import { SearchFlightConstant } from '@common/store';
import { DialogComponent } from '@lib/components';
import { AmcLoginHeaderComponent } from '@lib/components/shared-ui-components/amc-login/amc-login-header.component';
import { AmcLoginComponent } from '@lib/components/shared-ui-components/amc-login/amc-login.component';
import { SupportComponent } from '@lib/components/support-class';
import { isSP } from '@lib/helpers';
import { DialogClickType, LoginStatusType, PageType } from '@lib/interfaces';
import { CommonLibService, DialogDisplayService, ErrorsHandlerService, ModalService } from '@lib/services';
import { fromEvent } from 'rxjs';
import {
  CreateCartRequest,
  CreateCartRequestSearchAirOfferItinerariesInner,
  PatchUpdateAirOffersRequest,
} from 'src/sdk-reservation';
import { CreateCartRequestSearchAirOfferFare } from 'src/sdk-reservation/model/createCartRequestSearchAirOfferFare';
import { ComplexFmfFareFamily } from 'src/sdk-search/model/complexFmfFareFamily';

@Component({
  selector: 'asw-footer',
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent extends SupportComponent {
  public _fareFamily: ComplexFmfFareFamily = {};

  public currencyCode?: string;
  public totalPrice: number = 0;
  public originalTotalPrice: number = 0;
  public isPromotionApplied: boolean = false;

  //端末認識処理
  public isSp = isSP();
  public isSpPre = isSP();

  // フローティングナビ用el
  private readonly containerEl = this._document.getElementsByClassName('l-container');

  /** 検索ボタン押下時出力 */
  @Output()
  public nextFlow = new EventEmitter<Event>();

  @Input()
  set fareFamily(data: ComplexFmfFareFamily) {
    this._fareFamily = data;
    this._setInitialData(data);
  }
  get fareFamily(): ComplexFmfFareFamily {
    return this._fareFamily;
  }

  @Input()
  public isPc: boolean = false;

  @Input()
  public isMilesDisplay: boolean = false;

  @Input()
  public travelers?: Travelers;

  /** コンストラクタ */
  constructor(
    protected _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _deliveryInfoStoreService: DeliveryInformationStoreService,
    private _router: Router,
    private _dialogSvc: DialogDisplayService,
    private _paymentDetailModalService: PaymentDetailModalService,
    private _storeService: ComplexFlightAvailabilityStoreService,
    private _createCartStoreService: CreateCartStoreService,
    @Inject(DOCUMENT) private _document: Document,
    private _cancelPrebookService: CancelPrebookService,
    private _renderer: Renderer2,
    private _updateAirOffersStoreService: UpdateAirOffersStoreService,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _roundtripFlightAvailabilityInternationalPresService: RoundtripFlightAvailabilityInternationalPresService,
    private _modalService: ModalService
  ) {
    super(_common);
  }

  /** 初期表示処理 */
  init() {
    this.subscribeService('FooterResizeSp', fromEvent(window, 'resize'), this.resizeEvent);
    // 画面下部固定フローティングナビの高さを取得
    const bottomFloat = this._document.getElementsByClassName('l-bottom-float');
    const bottomFloatHeight = window.getComputedStyle(bottomFloat[0]).height;
    // 取得した値 + 70pxをdiv.l-containerのpadding-bottom値として設定
    this._renderer.setStyle(
      this.containerEl[0],
      'padding-bottom',
      `${(Number(bottomFloatHeight.replace('px', '')) + 70).toString()}px`
    );
  }

  /** 画面終了時処理 */
  destroy() {
    this.deleteSubscription('FooterResizeSp');
    this._renderer.removeAttribute(this.containerEl[0], 'style');
  }

  /** 画面更新時処理 */
  reload() {}

  // 画面サイズの変更検知
  private resizeEvent = () => {
    this.isSpPre = this.isSp;
    this.isSp = isSP();
    if (this.isSpPre !== this.isSp) {
      this._changeDetectorRef.markForCheck();
    }
  };

  /** 表示に必要な値設定 */
  private _setInitialData(data: ComplexFmfFareFamily) {
    this.currencyCode = data.airOffers?.[0]?.prices?.totalPrice?.currencyCode;
    this.totalPrice = data.airOffers?.[0].prices?.totalPrice?.total ?? 0;
    this.originalTotalPrice = data.airOffers?.[0]?.prices?.totalPrice?.discount?.originalTotal ?? 0;
    this.isPromotionApplied = !!data.airOffers?.[0]?.prices?.totalPrice?.discount ?? false;
  }

  /**
   * 金額内訳リンク押下
   */
  public details(event: Event) {
    event.preventDefault();
    const selectedPrices = this._fareFamily.airOffers?.[0]?.prices;
    const passengerCount = this.travelers;
    const isPromotion = selectedPrices?.totalPrice?.discount ? true : false;
    let selectedUnitPriceList: UnitPrice[] = [];
    selectedPrices?.unitPrices &&
      selectedPrices.unitPrices.forEach((unitPrice) => {
        let passengerType = unitPrice.passengerTypeCode!;
        let selectedUnitPrice: UnitPrice = {
          passengerTypeCode: passengerType,
          totalPrice: unitPrice.prices?.total ?? 0,
          basePrice: unitPrice.prices?.base ?? 0,
          tax: unitPrice.prices?.totalTaxes ?? 0,
        };
        selectedUnitPriceList.push(selectedUnitPrice);
      });
    this._paymentDetailModalService.openModal({
      price: selectedPrices?.totalPrice?.total?.toString() ?? '0',
      originalPrice: selectedPrices?.totalPrice?.discount?.originalTotal?.toString() ?? '0',
      isPromotionApplied: isPromotion,
      passengerCount: {
        adt: passengerCount?.ADT ?? 0,
        b15: passengerCount?.B15 ?? 0,
        chd: passengerCount?.CHD ?? 0,
        inf: passengerCount?.INF ?? 0,
      },
      unitPriceList: selectedUnitPriceList,
    });
  }

  /**
   * 継続可能エラー情報設定
   * @param pageType 画面タイプ
   * @param errorMsgId エラーメッセージID
   * @param apiErrorCode APIより返却されたエラーコード
   */
  private setRetryableErrorInfo(pageType: PageType, errorMsgId?: string, apiErrorCode?: string) {
    this._errorsHandlerSvc.setRetryableError(pageType, {
      errorMsgId: errorMsgId,
      apiErrorCode: apiErrorCode,
    });
  }

  /**
   *  ダイアログ
   */
  private async _openDialog(): Promise<DialogComponent> {
    return await new Promise((resolve, _) => {
      this._dialogSvc
        .openDialog({ message: 'm_dynamic_message-MSG1003' })
        .buttonClick$.subscribe((result: DialogComponent) => {
          resolve(result);
        });
    });
  }

  /***
   * 空席待ち予約チェック
   */
  public isWaitlisted() {
    // FFを取得
    const fareFamily = this._fareFamily;
    const bounds = fareFamily.airOffers?.[0].bounds ?? [];
    for (let i = 0; i < bounds.length; i++) {
      if (bounds[i].isContainedWaitlisted) return true;
    }
    return false;
  }

  /**
   * 次へボタン押下
   */
  public async clickNextButton(event: Event) {
    event.preventDefault();

    // FFを取得
    const fareFamily = this._fareFamily;
    let isSmallAircraft = false;

    // airOffer.unavailableReason=“incorrectChildFareCalculation”場合、エラーメッセージID＝”E0068”(選択旅程が利用不可)
    if (fareFamily.airOffers?.[0].reasonForRestriction === 'incorrectChildFareCalculation') {
      this.setRetryableErrorInfo(PageType.PAGE, 'E0068');
      return;
    }

    // airOffer.unavailableReason=” unavailbleOnlyCHD”の場合、エラーメッセージID＝”E0071”(旅程選択不可)
    if (fareFamily?.airOffers?.[0].reasonForRestriction === 'unavailbleOnlyCHD') {
      this.setRetryableErrorInfo(PageType.PAGE, 'E0071');
      return;
    }

    const bounds = fareFamily.airOffers?.[0].bounds ?? [];
    // airOffer.bounds、当該bounds.flightsの要素数分二重で繰り返し、
    for (let i = 0; i < bounds.length; i++) {
      const flights = bounds[i]?.flights ?? [];
      for (let j = 0; j < flights.length; j++) {
        const _flight = flights[j];
        // 当該flights.isSmallAircraft=trueとなるflightsが1つでも存在する場合
        if (_flight.isSmallAircraft) {
          isSmallAircraft = true;
          break;
        }
      }
    }

    if (!isSmallAircraft) {
      this._setAmcLoginHandle(fareFamily.airOffers?.[0].id ?? '');
      return;
    }

    const dialog = await this._openDialog();
    if (dialog.clickType === DialogClickType.CLOSE) return;

    this._setAmcLoginHandle(fareFamily.airOffers?.[0].id ?? '');
  }

  /**
   * AMC会員ログイン処理
   */
  private _setAmcLoginHandle(airOfferId: string) {
    const loginStatus = this._common.aswContextStoreService.aswContextData.loginStatus;
    if (loginStatus !== LoginStatusType.REAL_LOGIN) {
      const diarogPart = this._modalService.defaultIdPart(AmcLoginComponent, AmcLoginHeaderComponent);
      diarogPart.closeBackEnable = true;
      diarogPart.payload = {
        submitEvent: () => {
          this.clickNextFlowProcess(airOfferId);
        },
        skipEvent: () => {
          this.clickNextFlowProcess(airOfferId);
        },
      };
      this._modalService.showSubPageModal(diarogPart);
    } else {
      this.clickNextFlowProcess(airOfferId);
    }
  }

  // 往復空席照会結果(国際)画面(R01-P030)の次へボタン時処理
  private async clickNextFlowProcess(airOfferId: string) {
    // カート作成API通信用パラメータを作成
    let hasAccompaniedInAnotherReservation: boolean | undefined = undefined;
    const searchFlightConditionRequest = await fetchComplexRequestData(this._storeService);
    if (
      searchFlightConditionRequest.hasAccompaniedInAnotherReservation ||
      searchFlightConditionRequest.hasAccompaniedInAnotherReservation === false
    ) {
      hasAccompaniedInAnotherReservation = searchFlightConditionRequest.hasAccompaniedInAnotherReservation;
    }
    const itinerariesList: Array<CreateCartRequestSearchAirOfferItinerariesInner> = [];
    if (searchFlightConditionRequest.itineraries) {
      searchFlightConditionRequest.itineraries.forEach((v) => {
        itinerariesList.push({
          departureDate: v.departureDate ? v.departureDate : undefined,
          departureTimeWindowFrom: v.departureTimeWindowFrom ? v.departureTimeWindowFrom : undefined,
          departureTimeWindowTo: v.departureTimeWindowTo ? v.departureTimeWindowTo : undefined,
          destinationLocationCode: v.destinationLocationCode ? v.destinationLocationCode : undefined,
          originLocationCode: v.originLocationCode ? v.originLocationCode : undefined,
        });
      });
    }

    // カート作成API用fare作成
    const fareObj: CreateCartRequestSearchAirOfferFare = {
      isMixedCabin: false,
      fareOptionType: searchFlightConditionRequest.fare.fareOptionType ?? SearchFlightConstant.UNSPECIFIED_FARE_OPTION,
    };

    // プラン確認画面(R01-P040)で作成済みの保持している操作中カート情報が存在するかどうか、判断する
    // ※ 保持している操作中カート情報が存在する場合
    if (!this._currentCartStoreService.CurrentCartData.data?.cartId) {
      // プラン確認画面(R01-P040)受け渡し情報として、以下の初期値を設定する。
      this._deliveryInfoStoreService.setDeliveryInformation({
        // プラン確認画面：前画面引継ぎ情報
        ...this._deliveryInfoStoreService.deliveryInformationData,
        planReviewInformation: {
          isNeedGetCart: false, // カート取得要否
          supportRegisterErrorCode: undefined, // サポート情報登録エラーコード
        },
      });

      // カート情報が存在しない場合の処理
      // カート作成API実行のためのパラメータを作成
      const createCartRequest: CreateCartRequest = {
        airOfferId: airOfferId,
        searchAirOffer: {
          itineraries: itinerariesList,
          fare: fareObj,
          promotion: searchFlightConditionRequest.promotion,
          hasAccompaniedInAnotherReservation: hasAccompaniedInAnotherReservation,
        },
      };

      this._roundtripFlightAvailabilityInternationalPresService.createCart(createCartRequest);
    }

    // ※ プラン確認画面(R01-P040)で作成済みの保持している操作中カート情報が存在しない場合
    if (this._currentCartStoreService.CurrentCartData.data?.cartId) {
      // プラン確認画面(R01-P040)受け渡し情報として、以下の初期値を設定する。
      this._deliveryInfoStoreService.setDeliveryInformation({
        ...this._deliveryInfoStoreService.deliveryInformationData,
        planReviewInformation: {
          isNeedGetCart: false, // カート取得要否
          supportRegisterErrorCode: undefined, // サポート情報登録エラーコード
        },
      });

      const cartId: string | undefined = this._currentCartStoreService.CurrentCartData.data?.cartId;
      const param: PatchUpdateAirOffersRequest = {
        cartId: cartId ?? '',
        postAirOfferBody: {
          airOfferId: airOfferId,
        },
        searchAirOffer: {
          itineraries: itinerariesList,
          fare: fareObj,
          promotion: searchFlightConditionRequest.promotion,
          hasAccompaniedInAnotherReservation: hasAccompaniedInAnotherReservation,
        },
      };
      this._roundtripFlightAvailabilityInternationalPresService.updateAirOffers(param);
    }
  }
}
