import { InitialBase } from './initial-base.class';
import { ComplexFlightAvailabilityContComponent } from '../container/complex-flight-availability-cont.component';
import { AutoInject, RakuFlow } from './raku-flow';
import { ComplexFlightAvailabilityStoreService } from '../service/store.service';
import { SearchFlightHistoryState } from '@common/store/search-flight-history/search-flight-history.state';
import {
  ComplexFlightAvailabilityPageStoreService,
  FindMoreFlightsStoreService,
  SearchFlightHistoryStoreService,
  SearchFlightStoreService,
} from '@common/services';
import { ComplexFlightAvailabilityRequestService } from '../service/request.service';
import { SearchFlightState } from '@common/store/search-flight/search-flight.state';
import { AswCommonStoreService } from '@lib/services/asw-common-store/asw-common-store.service';
import { DataAdapterService } from '../service/data-adapter.service';
import { FlightType } from '@common/components';
import { ComplexFmfFareFamily } from 'src/sdk-search';
import { deepCopy } from '@common/helper';
import { RoundtripFlightAvailabilityInternationalService } from '@common/services/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.service';
import { BoundUpgradeInfo, CabinClassUpgradeInfoList, FlightUpgradeInfo } from '@common/interfaces';
import { AlertMessageItem, AlertType } from '@lib/interfaces';
import { AlertMessageStoreService } from '@lib/services';

/**
 * 画面情報に以下の内容を設定する。
 */
export class InitialInformation extends InitialBase {
  override flow?: RakuFlow<InitialBase, ComplexFlightAvailabilityContComponent>;
  private _componentPtr = this.flow?.root;

  @AutoInject()
  private _storeService?: ComplexFlightAvailabilityStoreService;

  @AutoInject()
  private _searchFlightStoreService?: SearchFlightStoreService;

  @AutoInject()
  private _aswCommonStoreService?: AswCommonStoreService;

  @AutoInject()
  private _dataAdapterService?: DataAdapterService;

  @AutoInject()
  private _findMoreFlightsStoreService?: FindMoreFlightsStoreService;

  @AutoInject()
  private _roundtripFlightAvailabilityInternationalService?: RoundtripFlightAvailabilityInternationalService;

  @AutoInject()
  private _alertMessageStoreService?: AlertMessageStoreService;

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

  override async handle(): Promise<void> {
    // 画面情報に以下の内容を設定する。
    this._aswCommonStoreService?.updateAswCommon({
      functionId: this._componentPtr?.functionId ?? '',
      pageId: this._componentPtr?.pageId ?? '',
      subFunctionId: '',
      subPageId: '',
      isEnabledLogin: this._componentPtr?.getIsEnabledLogin(),
      isUpgrade: false,
    });

    // ## ヘッダーログイン可能フラグ --> false(非表示)
    this._componentPtr?.setIsEnabledLogin(false);

    // フライト検索画面(R01-P010)で保持された空席照会リクエスト用検索条件を、リクエスト用検索条件とする
    let _searchFlight = this._searchFlightStoreService?.getData() as SearchFlightState;
    this._searchFlightStoreService?.updateStore(_searchFlight);

    // 検索要否=trueの場合、以下の情報を保持する。
    if (this._componentPtr?.getShouldSearch()) {
      this._componentPtr?.setComplexResponse(undefined);
      this._storeService?.updateComplexFlightAvailabilityState({
        complexResponse: undefined,
        displayFareFamilies: undefined,
        selectedFFIndex: 0,
        selectedFareFamily: undefined,
      });
    }

    // 検索要否=false、かつFind more Flights選択情報.AirOfferが存在する場合、以下の処理を行う。
    const fmfState = await this._storeService?.fetchFindMoreFlights();
    if (!this._componentPtr?.getShouldSearch() && fmfState?.selectedAirOffer) {
      // 選択中FF情報.airOfferをFind more Flights選択情報.AirOfferで上書きし、
      await this.renewComplexResponse();

      // 画面表示内容に従い画面表示を行う。
      // 選択中FF情報.airOffers[0].isOtherBoundChanged=trueの場合、
      // ”W0255”(指定されたバウンド以外のバウンドに変更が生じるフライトが選択されたため、
      // 遷移先の画面で別バウンドの運賃ルールが変更された場合)のワーニングメッセージを表示する。
      const isOtherBoundChangedFlag =
        (await this._storeService?.fetchComplexFlightAvailabilityState())?.selectedFareFamily?.airOffers?.[0]
          .isOtherBoundChanged ?? false;
      if (isOtherBoundChangedFlag) {
        const warningIsOtherBoundChanged: AlertMessageItem = {
          contentHtml: 'm_error_message-W0255',
          isCloseEnable: true,
          alertType: AlertType.WARNING,
          errorMessageId: 'W0255',
        };
        this._alertMessageStoreService?.setAlertWarningMessage(warningIsOtherBoundChanged);
      }

      // 初期表示処理を終了する。
      this.endFlow();
      return;
    }

    // 当画面の各種状態(true：可能、false：不可)について、以下の内容を保持する。
    // ※当画面の各エリアの表示状態をstoreで管理し、
    // これらの状態を  変更することによって 各エリアの表示状態を切り替える。

    const searchFlightObj = await this._storeService?.fetchSearchFlightData();

    // フライト検索画面(R01-P010)の[日本国内単独旅程判定処理]を行い、
    // trueの場合は“domestic”、falseの場合は“international”を設定する。
    const _japanOnlyFlag = this._dataAdapterService?.selectUtils().checkJapanOnlyTrip(_searchFlight) ?? false;
    const _flightType: FlightType = _japanOnlyFlag ? 'domestic' : 'international';
    this._componentPtr?.setJapanOnlyFlag(_japanOnlyFlag);
    this._componentPtr?.setSearchResultTripType(_flightType);
    // storeに格納
    this._storeService?.updateComplexFlightAvailabilityState({
      japanOnlyFlag: _japanOnlyFlag,
      searchResultTripType: _flightType,
    });
  }

  // set airOffer
  public async renewComplexResponse() {
    const P033State = deepCopy((await this._storeService?.fetchComplexFlightAvailabilityState()) ?? {});
    const selectedIndex = P033State?.selectedFFIndex;
    const fmfState = await this._storeService?.fetchFindMoreFlights();
    const airOffer = fmfState?.selectedAirOffer;
    if (!airOffer || !P033State?.selectedFareFamily) return;
    // airOffer表示用FFリスト内の選択中FF情報のairOfferを更新
    let updateFareFamilies = P033State?.displayFareFamilies?.map((fareFamily: ComplexFmfFareFamily, index: number) => {
      if (selectedIndex === index) {
        fareFamily.airOffers = [airOffer];
      }
      return fareFamily;
    });
    // 選択中FF情報のairOfferを更新
    let updateFareFamily = P033State?.selectedFareFamily;
    updateFareFamily.airOffers = [airOffer];

    // storeに格納
    this._storeService?.updateComplexFlightAvailabilityState({
      displayFareFamilies: updateFareFamilies,
      selectedFareFamily: updateFareFamily,
    });
    // Find more Flights選択情報.AirOfferをクリアする。
    this._findMoreFlightsStoreService?.updateFindMoreFlights({
      selectedAirOffer: undefined,
      complexResponseData: undefined,
    });
  }
}
