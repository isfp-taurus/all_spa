import { SupportClass } from '@lib/components/support-class';
import { Injectable } from '@angular/core';
import { SearchApiService } from 'src/sdk-search/api/search-api.service';
import {
  ComplexItinerary,
  ComplexRequest,
  ComplexResponse,
  FindMoreFlightsRequest,
  FindMoreFlightsResponse,
  Type3,
  Type5,
} from 'src/sdk-search';
import { DataServiceInterface } from './interface.state';
import { CommonLibService } from '@lib/services';
import { ResponseError } from '../helper/exceptions/response-error.class';
import {
  CreateCartRequest,
  CreateCartResponse,
  PatchUpdateAirOffersRequest,
  PatchUpdateAirOffersResponse,
  ReservationService,
} from 'src/sdk-reservation';
import { HttpResponse } from '@angular/common/http';
import { ErrorType } from '@lib/interfaces/errors';
import {
  ComplexFlightCalendarStoreService,
  DeliveryInformationStoreService,
  FindMoreFlightsStoreService,
} from '@common/services';
import { UpgradeavailabilityResponse } from '@common/interfaces/shopping/upgrade-availability/upgradeavailabilityResponses';
import { ErrorCodeConstants } from '@conf/app.constants';

@Injectable()
export class ComplexFlightAvailabilityRequestService extends SupportClass implements DataServiceInterface {
  protected $ComplexTripApiCall = 'ComplexTripApiCall' as const;
  protected $FindMoreFlightsApiCall = 'FindMoreFlightsApiCall' as const;
  protected $createCartStoreServiceApiCall = 'createCartStoreServiceApiCall' as const;
  protected $FetchHistoryPostApiCall = 'FetchHistoryPostApiCall' as const;
  protected $CartsUpdateAirOffersPatchApiCall = 'CartsUpdateAirOffersPatchApiCall' as const;
  protected $SearchUpgradeWaitlistGet = 'SearchUpgradeWaitlistGet' as const;
  protected $CartsCreateCartPostApiCall = 'CartsCreateCartPostApiCall' as const;

  public eventsList: Array<string> = [];

  constructor(
    protected _common: CommonLibService,
    private _searchApiService: SearchApiService,
    private _reservationService: ReservationService,
    private _complexFlightCalendarStoreService: ComplexFlightCalendarStoreService,
    private _deliveryInformationStoreService: DeliveryInformationStoreService,
    private _findMoreFlightsStoreService: FindMoreFlightsStoreService
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

  public clearApiErr(): void {
    this._common.apiErrorResponseService.clearApiErrorResponse();
  }

  /**
   * 複雑空席照会
   * @abstract 複雑空席照会画面へ表示する有償の空席情報を取得する
   * @param {ComplexRequest} params
   * @returns {ComplexResponse|null} complexTrip
   */
  public async fetchComplexTripData(params: ComplexRequest): Promise<ComplexResponse | null> {
    const _params = {} as ComplexRequest;
    Object.assign(_params, {
      ...params,
      itineraries: params.itineraries.map<ComplexItinerary>((item: ComplexItinerary) => {
        return {
          ...item,
          departureTimeWindowFrom: item.departureTimeWindowFrom ?? undefined,
          departureTimeWindowTo: item.departureTimeWindowTo ?? undefined,
          connection: {
            locationCode: item.connection?.locationCode ?? undefined,
          },
        };
      }),
      fare: {
        cabinClass: params.fare.cabinClass ?? undefined,
        fareOptionType: params.fare.fareOptionType ?? undefined,
      },
      promotion: {
        code: params.promotion?.code ?? undefined,
      },
      searchPreferences: {
        getLatestOperation: params.searchPreferences?.getLatestOperation ?? undefined,
      },
    } as ComplexRequest);

    const res = await new Promise<ComplexResponse | null>((resolve, reject) => {
      this.subscribeService(
        this.$ComplexTripApiCall,
        this._searchApiService.complexTripPost(_params, 'response'),
        (response) => {
          // 複雑空席照会結果取得レスポンス.warningsが存在する、
          // かつ 同レスポンス.warnings[0].code="WBAZ000198"(検索結果なし)の場合、
          const warningList = response.body?.warnings ?? [];
          if (warningList.length && response.body?.warnings?.[0]?.code === ErrorCodeConstants.ERROR_CODES.WBAZ000198) {
            this.storeClear();
            // プラン確認画面にて保持されたプラン作成失敗判定が存在する場合、エラーメッセージID＝”E1060”にて継続可能なエラー情報を前画面引継ぎ情報.空席照会エラー情報に保持指定し
            if (
              this._deliveryInformationStoreService?.deliveryInformationData.planReviewInformation
                ?.isPlanDuplicationFailed
            ) {
              return reject(new ResponseError(ErrorType.SYSTEM, 'E1060'));
            }
            return reject(new ResponseError(ErrorType.SYSTEM, 'E0228'));
          }
          // 全FF満席のチェック
          let allSoldOutFlg = !response.body?.data?.fareFamilies?.some(
            (fareFamily) => fareFamily.isAllSoldOut === false
          );
          if (allSoldOutFlg) {
            this.storeClear();
            // プラン確認画面にて保持されたプラン作成失敗判定が存在する場合、エラーメッセージID＝”E1060”にて継続可能なエラー情報を前画面引継ぎ情報.空席照会エラー情報に保持指定し
            if (
              this._deliveryInformationStoreService?.deliveryInformationData.planReviewInformation
                ?.isPlanDuplicationFailed
            ) {
              return reject(new ResponseError(ErrorType.SYSTEM, 'E1060'));
            }
            // 上記以外の場合、エラーメッセージID＝”E1124”にて継続可能なエラー情報を前画面引継ぎ情報.空席照会エラー情報に保持し、フライト検索画面(R01-P010)へ遷移後、空席照会処理を終了する。
            return reject(new ResponseError(ErrorType.SYSTEM, 'E1124'));
          }
          resolve(response.body);
        },
        (err: Error) => reject(err)
      );
    });
    return res;
  }

  /**
   * find more flights
   * @description
   * @param {FindMoreFlightsRequest} params
   * @returns {Promise<HttpResponse<FindMoreFlightsResponse>>}
   */
  public async fetchFindMoreFlights(params: FindMoreFlightsRequest): Promise<HttpResponse<FindMoreFlightsResponse>> {
    const res = await new Promise<HttpResponse<FindMoreFlightsResponse>>((resolve, reject) => {
      this.subscribeService(
        this.$FindMoreFlightsApiCall,
        this._searchApiService.findMoreFlightsPost(params, 'response'),
        (response) => resolve(response),
        (err: Error) => reject(err)
      );
    });
    return res;
  }

  /**
   *
   * AirOffer更新
   * @description 指定した検索結果を基にカートのAir Offerの入れ替えを行う。
   * @param {PatchUpdateAirOffersRequest} params
   * @returns {Promise<PatchUpdateAirOffersResponse|null>} updateAirOffers
   */
  public async cartsUpdateAirOffersPatch(
    params: PatchUpdateAirOffersRequest
  ): Promise<PatchUpdateAirOffersResponse | null> {
    const res = await new Promise<PatchUpdateAirOffersResponse | null>((resolve, reject) => {
      this.subscribeService(
        this.$CartsUpdateAirOffersPatchApiCall,
        this._reservationService.cartsUpdateAirOffersPatch(params, 'response'),
        (response: HttpResponse<PatchUpdateAirOffersResponse>) => {
          resolve(response.body);
        },
        (err) => {
          reject(err);
        }
      );
    });
    return res;
  }

  /**
   * カート作成
   * @description 指定した検索結果を基にカート・プランの登録を行う。
   * @param {CreateCartRequest} params
   * @returns {Promise<CreateCartResponse|null>} createCart
   */
  public async cartsCreateCartPost(params: CreateCartRequest): Promise<CreateCartResponse | null> {
    const res = await new Promise<CreateCartResponse | null>((resolve, reject) => {
      this.subscribeService(
        this.$CartsCreateCartPostApiCall,
        this._reservationService.cartsCreateCartPost(params, 'response'),
        (response: HttpResponse<CreateCartResponse>) => resolve(response?.body),
        (err: Error) => reject(err)
      );
    });
    return res;
  }

  private storeClear() {
    // 保持された複雑カレンダー選択金額が存在する場合、保持された複雑カレンダー選択金額をクリアする。
    this._complexFlightCalendarStoreService.updateComplexFlightCalendar({ selectedAmount: undefined });
    // FmF選択情報のAirOfferとFareFamilyCodeをクリアする
    this._findMoreFlightsStoreService.updateFindMoreFlights({
      selectedAirOffer: undefined,
      selectedFareFamilyCode: undefined,
    });
  }
}
