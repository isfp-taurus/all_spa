import { ComplexFlightAvailabilityContComponent } from '../container/complex-flight-availability-cont.component';
import { ComplexFlightAvailabilityStoreService } from '../service/store.service';
import { InitialBase } from './initial-base.class';
import { AutoInject, RakuFlow } from './raku-flow';
import { ReservationFunctionIdType, ReservationPageIdType } from '@common/interfaces';
import { ErrorsHandlerService, PageInitService } from '@lib/services';
import {
  CurrentCartStoreService,
  SearchFlightConditionForRequestService,
  SearchFlightStoreService,
} from '@common/services';
import { RoundtripFlightAvailabilityInternationalContService } from '@app/roundtrip-flight-availability-international/container/roundtrip-flight-availability-international-cont.service';
import { SearchFlightConditionForRequestState, SearchFlightState } from '@common/store';
import { PageType } from '@lib/interfaces';

/**
 * 以下の処理を実施する
 */
export class InitialProcess extends InitialBase {
  override flow?: RakuFlow<InitialBase, ComplexFlightAvailabilityContComponent>;
  private _componentPtr = this.flow?.root;

  @AutoInject()
  private _storeService?: ComplexFlightAvailabilityStoreService;

  @AutoInject()
  private _pageInitService?: PageInitService;

  @AutoInject()
  private _currentCartStoreService?: CurrentCartStoreService;

  @AutoInject()
  private _searchFlightConditionForRequestService?: SearchFlightConditionForRequestService;

  @AutoInject()
  private _roundtripFlightAvailabilityService?: RoundtripFlightAvailabilityInternationalContService;

  @AutoInject()
  private _searchFlightStoreService?: SearchFlightStoreService;

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

  /**
   * プラン確認画面にて保持された戻る操作実施が存在
   * @returns {boolean}
   */
  protected async isBackBtnClicked() {
    const data = await this._storeService?.fetchDeliveryInformation();
    return !!data?.planReviewInformation?.isBackBtnClicked;
  }

  /**
   * 前画面引継ぎ情報エラーの処理
   */
  protected async previousScreenError() {
    const errInfo = await this._storeService?.fetchComplexFlightAvailabilityErr();
    // 前画面引継ぎ情報.空席照会エラー情報が存在する場合、
    if (errInfo) {
      // 前画面引継ぎ情報.空席照会エラー情報を継続可能なエラー情報として指定し、
      this._errorsHandlerService?.setRetryableError(PageType.PAGE, errInfo);
    }
    // 前画面引継ぎ情報.空席照会エラー情報をクリアする。
    this._errorsHandlerService?.clearRetryableError();
  }

  // 保持された戻る操作実施をクリアし
  protected clearIsBackBtnClicked() {
    this._storeService?.updateDeliveryInformation({
      planReviewInformation: { isBackBtnClicked: undefined },
    });
  }

  // 画面情報.機能ID=”R01”かつ画面情報.画面ID=”P032”の場合、以下の処理を行う。
  override async handle(): Promise<void> {
    this._pageInitService?.startInit();

    let isFromComplexCalendar = false;

    const P033State = await this._storeService?.fetchComplexFlightAvailabilityState();

    // 画面情報.機能ID=”R01”かつ画面情報.画面ID=”P032”の場合、以下の処理を行う。
    if (
      P033State?.previousId ===
      ReservationFunctionIdType.PRIME_BOOKING + ReservationPageIdType.COMPLEX_FLIGHT_CALENDAR
    ) {
      // 複雑カレンダー経由かどうかをtrueとする。
      this._componentPtr?.setIsFromComplexCalendar(true);
      isFromComplexCalendar = true;
    }

    // 画面情報.機能ID=”R01”かつ画面情報.画面ID=”P034”の場合、以下の処理を行う。
    if (P033State?.previousId === ReservationFunctionIdType.PRIME_BOOKING + ReservationPageIdType.FIND_MORE_FLIGHTS) {
      // 検索要否をfalseとする。
      const complexStore = await this._storeService?.fetchComplexFlightAvailabilityState();
      if (complexStore?.complexResponse) {
        this._componentPtr?.setShouldSearch(false);
      }
      await this.previousScreenError();
    }

    this._storeService?.updateComplexFlightAvailabilityState({
      isFromComplexCalendar: isFromComplexCalendar,
    });

    const errorInfo = this._deliverySearchInformationStoreService?.GetAndReSetDeliverySearchInformation();
    if (errorInfo !== undefined) {
      this._errorsHandlerService?.setRetryableError(PageType.PAGE, errorInfo);
    }

    // 画面情報.機能ID=”R01”かつ画面情報.画面ID=”P040”の場合、以下の処理を行う。
    if (P033State?.previousId === ReservationFunctionIdType.PRIME_BOOKING + ReservationPageIdType.PLAN_REVIEW) {
      // プラン確認画面にて保持された戻る操作実施が存在する場合、保持された戻る操作実施をクリアし、検索要否をfalseとする。
      const flag = await this.isBackBtnClicked();
      if (flag) {
        this.clearIsBackBtnClicked();
        this._componentPtr?.setShouldSearch(false);
      } else {
        // 上記以外で、フライト検索画面(R01-P010)で保持された空席照会リクエスト用検索条件が存在しない場合、往復空席照会結果(国際)画面(R01-P030)の［カート情報からの検索条件復元処理］を行い、返却された値をフライト検索画面(R01-P010)で保持された空席照会リクエスト用検索条件に設定する。
        if (!P033State?.complexRequest) {
          const cartInfo = this._currentCartStoreService?.CurrentCartData;
          let cartComplexRequest: SearchFlightConditionForRequestState | undefined;
          if (cartInfo) cartComplexRequest = this._roundtripFlightAvailabilityService?.convertData(cartInfo);
          if (cartComplexRequest) this._searchFlightConditionForRequestService?.updateStore(cartComplexRequest);
        }

        // フライト検索画面(R01-P010)で保持された履歴登録用の検索条件が存在しない場合、往復空席照会結果(国際)画面(R01-P030)の［リクエスト用検索条件からの履歴用検索条件復元処理］を行い、返却された値をフライト検索画面(R01-P010)で保持された履歴登録用の検索条件に設定する。
        if (!P033State?.searchFlightHistory) {
          const searchFlightConditionForRequestState = this._searchFlightConditionForRequestService?.getData();
          let searchFlightState: SearchFlightState | undefined;
          if (searchFlightConditionForRequestState)
            searchFlightState = this._roundtripFlightAvailabilityService?.createHistoryConditionFromRequestCondition(
              searchFlightConditionForRequestState
            );
          if (searchFlightState) this._searchFlightStoreService?.updateStore(searchFlightState);
        }
      }
    }

    // 保持された検索フォームより遷移が存在する場合、
    const searchForm = this._searchFlightConditionForRequestService?.getData();
    if (searchForm?.request.displayInformation?.nextPage) {
      // 保持された検索フォームより遷移をクリアし、
      // 更新する
      this._searchFlightConditionForRequestService?.updateStore({
        ...searchForm,
        request: {
          ...searchForm.request,
          displayInformation: {
            ...searchForm.request.displayInformation,
            nextPage: '',
          },
        },
      });
    }
  }
}
