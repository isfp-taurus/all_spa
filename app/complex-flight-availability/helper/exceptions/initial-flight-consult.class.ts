import { InitialBase } from './initial-base.class';
import { ComplexFlightAvailabilityContComponent } from '../container/complex-flight-availability-cont.component';

import { AlertMessageItem, AlertType, ErrorType, RetryableError } from '@lib/interfaces';
import { RoutesResRoutes } from '@conf/routes.config';
import { ComplexResponse } from 'src/sdk-search/model/complexResponse';
import { ComplexFmfFareFamily, ComplexRequest } from 'src/sdk-search';
import { AutoInject, RakuFlow } from './raku-flow';
import { CommonLibService, PageInitService } from '@lib/services';
import { Router } from '@angular/router';
import { ComplexFlightAvailabilityRequestService } from '../service/request.service';
import { ResponseError } from './exceptions/response-error.class';
import {
  ComplexFlightAvailabilityPageStoreService,
  ComplexFlightCalendarStoreService,
  FindMoreFlightsStoreService,
  LocalDateService,
} from '@common/services';
import { ComplexFlightAvailabilityStoreService } from '../service/store.service';
import { RoundtripFlightAvailabilityInternationalState } from '@common/store/roundtripFlightAvailabilityInternational';
import { RoundtripFlightAvailabilityInternationalPresService } from '@app/roundtrip-flight-availability-international/presenter/roundtrip-flight-availability-international-pres.service';
import { ErrorCodeConstants } from '@conf/app.constants';

/**
 * 以下、空席照会処理
 */
export class InitialFlightConsult extends InitialBase {
  override flow?: RakuFlow<InitialBase, ComplexFlightAvailabilityContComponent>;
  private _componentPtr = this.flow?.root;

  /** 往復空席照会結果(国際)画面のStore */
  private _R01P030Store: RoundtripFlightAvailabilityInternationalState = {};

  @AutoInject()
  private _commonLibService?: CommonLibService;

  @AutoInject()
  private _routerService?: Router;

  @AutoInject()
  private _requestService?: ComplexFlightAvailabilityRequestService;

  @AutoInject()
  private _storeService?: ComplexFlightAvailabilityStoreService;

  @AutoInject()
  private _complexFlightCalendarStoreService?: ComplexFlightCalendarStoreService;

  @AutoInject()
  private _complexFlightAvailabilityStoreService?: ComplexFlightAvailabilityPageStoreService;

  @AutoInject()
  private _localDateService?: LocalDateService;

  @AutoInject()
  private _roundtripFlightAvailabilityInternationalPresService?: RoundtripFlightAvailabilityInternationalPresService;

  @AutoInject()
  private _findMoreFlightsStoreService?: FindMoreFlightsStoreService;

  constructor() {
    super();
  }

  // contextをapply
  override bindFlow(
    flow: RakuFlow<InitialBase, ComplexFlightAvailabilityContComponent>
  ): RakuFlow<InitialBase, ComplexFlightAvailabilityContComponent> {
    this.flow = flow;
    this._componentPtr = this.flow.root;
    return flow;
  }

  // メイン
  override async handle(_complexRequestData?: ComplexRequest): Promise<void> {
    // 以下の処理にて空席照会を行う。
    // ##  [以下、空席照会処理] ※当処理は呼び出し元より以下の引数を受け取り、処理を行う。検索条件 --> 未指定
    // ※未指定の場合はリクエスト用検索条件を検索条件とする。
    // ## フライト検索画面(R01-P010)の初期表示処理にて、API呼び出しをそのまま行える構造で検索条件を保持しているため、リクエスト用検索条件をそのまま指定する。
    let _complexRequest = this._storeService?.fetchFlightConditionData();
    if (_complexRequestData) {
      // 引数の検索条件が指定されている場合、リクエスト用検索条件に検索条件を設定する。
      // 上記以外の場合、リクエスト用検索条件に検索条件を設定しない。
      _complexRequest = _complexRequestData;
    }

    if (_complexRequest) this._componentPtr?.setComplexRequest(_complexRequest);

    this._complexFlightAvailabilityStoreService?.updateComplexFlightAvailability({
      complexRequest: _complexRequest,
    });

    // システム日付取得(G03-519)のシステム日時取得処理を呼び出し、取得した値を、空席照会日時(サイト時刻)として保持する。
    // 空席照会日時(サイト時刻)として保持する
    const time = this._localDateService?.getCurrentDateStr() ?? '';
    this._componentPtr?.setSearchedDateTime(time);
    // storeに格納
    this._storeService?.updateComplexFlightAvailabilityState({
      searchedDateTime: time,
    });

    // 検索条件を基に、複雑空席照会結果取得APIを呼び出す。
    if (_complexRequest) await this.getComplexTripPost(_complexRequest);
  }

  // 履歴登録リクエストを設置し、APIを呼び出す。
  private async historyRegister() {
    // 履歴用検索条件の取得
    const searchFlight = await this._storeService?.fetchSearchFlightData();
    this._roundtripFlightAvailabilityInternationalPresService?.historyRegister(searchFlight);
  }

  /**
   * 複雑空席照会結果取得API の実行
   */
  public async getComplexTripPost(_complexRequest?: ComplexRequest) {
    if (!_complexRequest) return;

    this._commonLibService?.apiErrorResponseService.clearApiErrorResponse(); //APIエラー情報を事前にクリア

    try {
      // 複雑空席照会結果取得レスポンスによって以下の処理を実施する。
      const response: ComplexResponse | undefined =
        (await this._requestService?.fetchComplexTripData(_complexRequest)) ?? undefined;

      this._componentPtr?.setComplexResponse(response);

      // 複雑空席照会結果取得レスポンス.isReSearched=が存在するかつその値がtrueの場合、
      // W0837”(指定条件では検索結果がないため運賃を変更して検索した旨)のワーニングメッセージを表示する。
      if (response?.data?.isReSearched) {
        const alertMessageData: AlertMessageItem = {
          contentHtml: 'm_error_message-W0837',
          isCloseEnable: true,
          alertType: AlertType.WARNING,
          errorMessageId: 'W0837',
        };
        this._commonLibService?.alertMessageStoreService.setAlertWarningMessage(alertMessageData);
      }

      // 保持された複雑カレンダー選択金額が存在する場合、以下の処理を実施する。
      const selectedAmount = this._complexFlightCalendarStoreService?.ComplexFlightCalendarData.selectedAmount;
      if (selectedAmount) {
        // 案内済金額有無にfalseを設定する。
        // 当該fareFamilies.airOffer.prices.totalPrice.total=保持された複雑カレンダー選択金額.totalかつ、
        // 当該fareFamilies.airOffer.prices.totalPrice.currencyCode=保持された複雑カレンダー選択金額.currencyCodeの場合、
        // 案内済金額有無にtrueを設定し、繰り返しを終了する。
        const isGuidedAmountExist =
          response?.data?.fareFamilies?.some((fareFamily) => {
            const totalPrice = fareFamily.airOffers?.[0]?.prices?.totalPrice;
            return (
              totalPrice?.total === selectedAmount.total && totalPrice?.currencyCode === selectedAmount.currencyCode
            );
          }) ?? false;

        // 保持された複雑カレンダー選択金額をクリアする
        this._complexFlightCalendarStoreService?.updateComplexFlightCalendar({ selectedAmount: undefined });

        // 案内済金額有無=falseの場合、”W0836”(カレンダー画面で表示されている金額が表示されない場合は、
        // 異なるクラスで検索すれば表示される可能性がある旨)のワーニングメッセージを表示する。
        if (!isGuidedAmountExist) {
          const alertMessageData: AlertMessageItem = {
            contentHtml: 'm_error_message-W0836',
            isCloseEnable: true,
            alertType: AlertType.WARNING,
            errorMessageId: 'W0836',
          };
          this._commonLibService?.alertMessageStoreService.setAlertWarningMessage(alertMessageData);
        }
      }

      // 以下の処理にて初期選択させるFFを求める。
      let fareFamiliaIndex = -1;
      const fareFamilies = response?.data?.fareFamilies ?? [];

      let updateFareFamilies = fareFamilies;

      let initSelectFlg = false;

      let fmfState = await this._storeService?.fetchFindMoreFlights();
      const airOffer = fmfState?.selectedAirOffer;

      if (airOffer) {
        for (let i = 0; i < fareFamilies.length; i++) {
          const fareFamily = fareFamilies[i];
          if (fareFamily.fareFamilyCode === fmfState?.selectedFareFamilyCode) {
            fareFamiliaIndex = i;
            break;
          }
        }
        updateFareFamilies = fareFamilies.map((fareFamily: ComplexFmfFareFamily, index: number) => {
          if (fareFamiliaIndex === index) {
            fareFamily.airOffers = [airOffer];
          }
          return fareFamily;
        });
        this._findMoreFlightsStoreService?.updateFindMoreFlights({
          selectedAirOffer: undefined,
          selectedFareFamilyCode: undefined,
        });
        initSelectFlg = true;
      }

      // ＜以下、複雑空席照会結果取得レスポンス.data.fareFamiliesの要素数分、繰り返す＞
      if (!initSelectFlg) {
        for (let i = 0; i < fareFamilies.length; i++) {
          const fareFamily = fareFamilies[i];
          const airOffer = fareFamilies[i]?.airOffers ?? [];

          // 当該fareFamilies.isAllSoldOut=falseかつ、
          // 当該fareFamilies.airOffer.isUnselectable≠trueかつ、当該fareFamilies.airOffer.complexBoundsについて、
          if (!fareFamily.isAllSoldOut && !airOffer[0].isUnselectable) {
            // 選択中FFインデックスにfareFamiliesの繰り返しインデックスを設定し
            fareFamiliaIndex = i;
            // 繰り返し処理を終了する。
            break;
          }
        }
      }

      // ＜ここまで、複雑空席照会結果取得レスポンス.data.fareFamiliesの要素数分、繰り返す＞"
      if (fareFamiliaIndex !== -1) {
        this._componentPtr?.setSelectedFFIndex(fareFamiliaIndex);
        // storeに格納
        this._storeService?.updateComplexFlightAvailabilityState({
          selectedFFIndex: fareFamiliaIndex,
        });
      }

      // 格納する
      this._componentPtr?.setComplexResponse(response);
      // レスポンスをstoreに格納する
      this._complexFlightAvailabilityStoreService?.updateComplexFlightAvailability({
        complexResponse: response,
        selectedFareFamily: updateFareFamilies[fareFamiliaIndex],
        displayFareFamilies: updateFareFamilies,
      });
    } catch (err) {
      if (err instanceof ResponseError) {
        // フライト検索画面(R01-P010)へ遷移後、空席照会処理を終了する。
        const errId = err.getErrId();
        if (errId === 'E0228') {
          const errorInfo: RetryableError = {
            errorMsgId: 'E0228',
            apiErrorCode: ErrorCodeConstants.ERROR_CODES.WBAZ000198,
          };
          // エラーメッセージID＝”E0228”にて継続可能なエラー情報を前画面引継ぎ情報.空席照会エラー情報に保持し、
          this.setRetryAbleErrorInfoToFlightSearch(errorInfo);
          // フライト検索画面(R01-P010)へ遷移後、空席照会処理を終了する。
          this._routerService?.navigate([RoutesResRoutes.FLIGHT_SEARCH]);
          return;
        } else if (errId === 'E1124') {
          const errorInfo: RetryableError = {
            errorMsgId: 'E1124',
          };
          // エラーメッセージID＝”E1124”にて継続可能なエラー情報を前画面引継ぎ情報.空席照会エラー情報に保持し、
          this.setRetryAbleErrorInfoToFlightSearch(errorInfo);
          // フライト検索画面(R01-P010)へ遷移後、空席照会処理を終了する。
          this._routerService?.navigate([RoutesResRoutes.FLIGHT_SEARCH]);
          return;
        } else if (errId === 'E1060') {
          // プラン確認画面にて保持されたプラン作成失敗判定が存在する場合、エラーメッセージID＝”E1060”にて継続可能なエラー情報を前画面引継ぎ情報.空席照会エラー情報に保持指定し
          const errorInfo: RetryableError = {
            errorMsgId: 'E1060',
          };
          this.setRetryAbleErrorInfoToFlightSearch(errorInfo);
          // フライト検索画面に遷移後、空席照会処理を終了する。
          this._routerService?.navigate([RoutesResRoutes.FLIGHT_SEARCH]);
          return;
        }
      }

      if (this._commonLibService?.apiError?.['errors']?.[0]?.code === ErrorCodeConstants.ERROR_CODES.EBAZ000824) {
        // エラーメッセージID=”E1830”(カナダオフィスでかつ、カナダ発の便 以外)にて継続可能なエラー情報を前画面引継ぎ情報.空席照会エラー情報に保持し
        const errorInfo: RetryableError = {
          errorMsgId: 'E1830',
          apiErrorCode: ErrorCodeConstants.ERROR_CODES.EBAZ000824,
        };
        this.setRetryAbleErrorInfoToFlightSearch(errorInfo);
        // フライト検索画面に遷移後、空席照会処理を終了する。
        this._routerService?.navigate([RoutesResRoutes.FLIGHT_SEARCH]);
        return;
      }

      // エラーが発生した複雑空席照会結果取得レスポンスが通知された場合、
      // 継続不可能エラータイプ＝”system”(システムエラー)にて継続不可能なエラー情報を指定し、空席照会処理を終了する。
      // ※当処理はstoreを介して行う。
      this.setErrorInfo(
        ErrorType.SYSTEM, // ビジネスロジックエラー
        '',
        this._commonLibService?.apiError?.['errors']?.[0]?.code
      );

      // ※以降の処理は、エラーが発生していない複雑空席照会結果取得レスポンスが通知されたことを契機に、処理を行う。当処理はstoreを介して行う。
    }
  }
}
