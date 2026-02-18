import { SupportClass } from '@lib/components/support-class';
import { Injectable } from '@angular/core';
import { SearchFlightStoreService } from '@common/services/store/search-flight/search-flight-store/search-flight-store.service';
import { SearchFlightState } from '@common/store/search-flight/search-flight.state';
import { DataServiceInterface } from './interface.state';
import {
  CreateCartStoreService,
  CurrentCartStoreService,
  DeliveryInformationStoreService,
  FindMoreFlightsStoreService,
  PaymentInputStoreService,
  SearchFlightConditionForRequestService,
} from '@common/services';
import { CreateCartState } from '@common/store/create-cart/create-cart.state';
import { CreateCartRequest } from 'src/sdk-reservation/model/createCartRequest';
import { ResponseError } from '../helper/exceptions/response-error.class';
import { ErrorType, LoginStatusType, PageType, RetryableError } from '@lib/interfaces';
import { CommonLibService, ErrorsHandlerService } from '@lib/services';
import { CurrentCartState } from '@common/store/current-cart/current-cart.state';
import { FindMoreFlightsState, PaymentInputState } from '@common/store';
import { AswContextState } from '@lib/store/asw-context/asw-context.state';
import { AswCommonState } from '@lib/store/asw-common/asw-common.state';
import { DeliveryInformationModel, AirOfferUpgradeInfo, UpgradeInfoMap } from '@common/interfaces';
import { RoundtripFlightAvailabilityInternationalService } from '@common/services/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.service';
import { AirportCache, SearchForAirportCodeList } from '../sub-components/flight-bound/flight-bound.state';
import { fareOptionCacheList } from '../presenter/complex-flight-availability-pres.state';
import { ComplexRequest } from 'src/sdk-search';
import { ComplexFlightAvailabilityPageStoreService } from '@common/services/store/complex-flight-availability/complex-flight-availability-store/complex-flight-availability-store.service';
import { ComplexFlightAvailabilityState } from '@common/store/complex-flight-availability';
import { deepCopy } from '@common/helper';

@Injectable()
export class ComplexFlightAvailabilityStoreService extends SupportClass implements DataServiceInterface {
  protected $SearchFlightStoreService = 'SearchFlightStoreService' as const;
  protected $createCartStoreServiceStoreCall = 'createCartStoreServiceStoreCall' as const;
  protected $fetchCurrentCart = 'getCurrentCart' as const;
  protected $fetchPaymentInputStoreService = 'fetchPaymentInputStoreService' as const;
  protected $fetchDeliveryInformation = 'fetchDeliveryInformation' as const;
  protected $fetchRoundtripFlightAvailabilityInternationalService =
    'fetchRoundtripFlightAvailabilityInternationalService' as const;
  protected $fetchIsUserLogin = 'fetchIsUserLogin' as const;
  protected $getFindMoreFlights = '$getFindMoreFlights' as const;
  protected $getUpgradeInfoList = '$getUpgradeInfoList' as const;
  protected $getComplexFlightAvailability = '$getComplexFlightAvailability' as const;
  protected $getComplexFlightAvailabilityErr = '$getComplexFlightAvailabilityErr' as const;

  public eventsList: Array<string> = [];

  constructor(
    protected _common: CommonLibService,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _createCartStoreService: CreateCartStoreService,
    private _cartStoreService: CurrentCartStoreService,
    private _paymentInputStoreService: PaymentInputStoreService,
    private _deliveryInformationStoreService: DeliveryInformationStoreService,
    private _commonLibService: CommonLibService,
    private _roundtripFlightAvailabilityInternationalService: RoundtripFlightAvailabilityInternationalService,
    private _searchFlightConditionForRequestService: SearchFlightConditionForRequestService,
    private _findMoreFlightsStoreService: FindMoreFlightsStoreService,
    private _complexFlightAvailabilityPageStoreService: ComplexFlightAvailabilityPageStoreService,
    private _errorsHandlerService: ErrorsHandlerService
  ) {
    super();
    this.createEventsList();
  }

  destroy() {
    this.removeAllSubscription();
  }

  // "$"から始まるpropertyをリスト化
  public createEventsList() {
    const propertiesList: string[] = Object.keys(this);
    this.eventsList = propertiesList.filter((name: string) => name.startsWith('$'));
  }

  // remove subscription
  public removeAllSubscription() {
    this.eventsList.forEach((name: string) => this.deleteSubscription(name));
  }

  /**
   * - StoreでSearchFlightを取得
   * - フライト検査のストアから、リクエストデータを取得 => complexRequestData
   */
  public async fetchSearchFlightData(): Promise<SearchFlightState> {
    return await new Promise((resolve, _) => {
      this.subscribeService(this.$SearchFlightStoreService, this._searchFlightStoreService.searchFlight$, (data) =>
        resolve(data)
      );
    });
  }

  /**
   * storeでfavoriteStateを設置
   * - RoundtripFlightAvailabilityInternationalServiceを活かし
   */
  public updateFavoriteState(isRegisteredFavorite: boolean, isNotFavoriteAnimation: boolean) {
    this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
      isRegisteredFavorite: isRegisteredFavorite,
      isNotFavoriteAnimation: isNotFavoriteAnimation,
    });
  }

  /**
   * StoreでupgradeInfoListを取得
   * - RoundtripFlightAvailabilityInternationalServiceを活かし
   */
  public async fetchUpgradeInfoList(): Promise<Array<AirOfferUpgradeInfo>> {
    return await new Promise((resolve, _) => {
      this.subscribeService(
        this.$getUpgradeInfoList,
        this._roundtripFlightAvailabilityInternationalService.getRoundtripFlightAvailabilityInternationalObservable(),
        (data) => resolve(data.upgradeInfoList ?? [])
      );
    });
  }

  /**
   * storeでupgradeInfoListを設置
   * - RoundtripFlightAvailabilityInternationalServiceを活かし
   */
  public updateUpgradeInfoList(upgradeInfoList: Array<AirOfferUpgradeInfo>) {
    this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
      upgradeInfoList: upgradeInfoList,
    });
  }

  /**
   * storeでupgradeInfoMapを設置
   * - RoundtripFlightAvailabilityInternationalServiceを活かし
   */
  public updateUpgradeInfoMap(upgradeInfoMap: UpgradeInfoMap) {
    this._complexFlightAvailabilityPageStoreService.updateComplexFlightAvailability({
      upgradeInfoMap: upgradeInfoMap,
    });
  }

  /**
   * CartStateを作成
   */
  public async createCartState(params: CreateCartRequest): Promise<CreateCartState> {
    this._createCartStoreService.setCreateCartFromApi(params);

    return await new Promise((resolve, reject) => {
      this.subscribeService(
        this.$createCartStoreServiceStoreCall,
        this._createCartStoreService.getCreateCart$(),
        (res: CreateCartState) => {
          if (res.isFailure && this._common.apiError?.['errors']![0].code === 'xxx5') {
            return reject(new ResponseError(ErrorType.BUSINESS_LOGIC, 'E00xx'));
          }
          if (res.isFailure) {
            return reject(new ResponseError(ErrorType.SYSTEM, ''));
          }
          resolve(res);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  /**
   * CurrentCartを取得
   */
  public async fetchCurrentCart(): Promise<CurrentCartState> {
    return await new Promise((resolve, reject) => {
      this.subscribeService(
        this.$fetchCurrentCart,
        this._cartStoreService.getCurrentCart$(),
        (res: CurrentCartState) => resolve(res),
        (err) => reject(err)
      );
    });
  }

  /**
   * CurrentCartを更新
   * @param params
   */
  public updateCurrentCart(params: Partial<CurrentCartState>) {
    this._cartStoreService.updateCurrentCart(params);
  }

  /**
   * プラン確認画面のstore
   * @description プラン確認画面 store サービスを使って、データを取得
   * @returns {Promise<PaymentInputState>}
   */
  public async fetchPaymentInput(): Promise<PaymentInputState> {
    return await new Promise((resolve, _) => {
      this.subscribeService(
        this.$fetchPaymentInputStoreService,
        this._paymentInputStoreService.getPaymentInput$(),
        (data: PaymentInputState) => resolve(data)
      );
    });
  }

  /**
   * deliveryInformationストアを取得
   * @returns {DeliveryInformationModel}
   */
  public async fetchDeliveryInformation(): Promise<DeliveryInformationModel> {
    return await new Promise((resolve, reject) => {
      this.subscribeService(
        this.$fetchDeliveryInformation,
        this._deliveryInformationStoreService.getDeliveryInformation$(),
        (res) => resolve(res),
        (err) => reject(err)
      );
    });
  }

  /**
   * AswCommonStateを更新
   * @param {Partial<AswCommonState>} params
   */
  public updateAswCommon(params: Partial<AswCommonState>) {
    this._commonLibService.aswCommonStoreService.updateAswCommon(params);
  }

  /**
   * DeliveryInformationのストアを更新
   * カート情報取得要否更新処理
   * @param isNeedGetCart カート情報取得要否
   * @param {DeliveryInformationState} value
   */
  public updateDeliveryInformation(obj: Partial<DeliveryInformationModel>) {
    this._deliveryInformationStoreService.setDeliveryInformation({
      ...this._deliveryInformationStoreService.deliveryInformationData,
      ...obj,
    });
  }

  /**
   * ユーザーの情報
   * @returns {Promise<boolean>}
   */
  public async fetchIsUserLogin(): Promise<boolean> {
    return new Promise((resolve, _) => {
      this.subscribeService(
        this.$fetchIsUserLogin,
        this._common.aswContextStoreService.getAswContext$(),
        (data: AswContextState) => {
          resolve(data.loginStatus !== LoginStatusType.NOT_LOGIN);
        }
      );
    });
  }

  /**
   * 検索条件の取得
   * @returns
   */
  public fetchFlightConditionData(): ComplexRequest {
    const data = this._searchFlightConditionForRequestService.getData();
    return deepCopy(data.request as ComplexRequest);
  }

  /**
   * Find-More-Flights画面のストア
   * @returns
   */
  public async fetchFindMoreFlights(): Promise<FindMoreFlightsState> {
    return await new Promise((resolve, reject) => {
      this.subscribeService(
        this.$getFindMoreFlights,
        this._findMoreFlightsStoreService.getFindMoreFlights$(),
        (res) => resolve(res),
        (err) => reject(err)
      );
    });
  }

  /**
   * StoreでComplexFlightAvailabilityStateを取得
   */
  public async fetchComplexFlightAvailabilityState(): Promise<ComplexFlightAvailabilityState> {
    return await new Promise((resolve, reject) => {
      this.subscribeService(
        this.$getComplexFlightAvailability,
        this._complexFlightAvailabilityPageStoreService.getComplexFlightAvailability$(),
        (data) => resolve(data),
        (err) => reject(err)
      );
    });
  }

  /**
   * storeでComplexFlightAvailabilityStateを設置
   */
  public setComplexFlightAvailabilityState(value: Partial<ComplexFlightAvailabilityState>) {
    this._complexFlightAvailabilityPageStoreService.setComplexFlightAvailability(value);
  }

  /**
   * storeでComplexFlightAvailabilityStateを更新
   */
  public updateComplexFlightAvailabilityState(value: Partial<ComplexFlightAvailabilityState>) {
    this._complexFlightAvailabilityPageStoreService.updateComplexFlightAvailability(value);
  }

  /**
   * 空席照会エラー情報を取得
   */
  public async fetchComplexFlightAvailabilityErr(): Promise<RetryableError | null> {
    return await new Promise((resolve, reject) => {
      this.subscribeService(
        this.$getComplexFlightAvailabilityErr,
        this._errorsHandlerService.getRetryableError$(PageType.PAGE),
        (data) => resolve(data),
        (err) => reject(err)
      );
    });
  }
}
