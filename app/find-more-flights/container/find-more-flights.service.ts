import { Injectable } from '@angular/core';
import { BoundFilterItem, FareTypeItem } from '@common/interfaces';
import { AirportI18nSearchForAirportCodeCache } from '@common/services/shopping/shopping-lib/shopping-lib.state';
import { MASTER_TABLE } from '@conf/asw-master.config';
import { SupportClass } from '@lib/components/support-class';
import { ErrorType } from '@lib/interfaces';
import { AswMasterService, ErrorsHandlerService } from '@lib/services';
import { ComplexFmfFareFamilyAirOffersInner, Type9 } from 'src/sdk-search';

@Injectable({
  providedIn: 'root',
})
export class FindMoreFlightsService extends SupportClass {
  constructor(private _aswMasterSvc: AswMasterService, private _errorsHandlerSvc: ErrorsHandlerService) {
    super();
    this.subscribeService(
      'FmF GetAirportNameList',
      this._aswMasterSvc.load(
        [MASTER_TABLE.AIRPORT_I18N_SEARCH_FOR_AIRPORT_CODE, MASTER_TABLE.AIRPORT_I18N_JOIN_BY_AIRPORT_CODE],
        true
      ),
      ([airportCacheForSearch, airportCacheByCode]) => {
        // 出発地
        this._airportI18NList = airportCacheByCode;
        this._airportI18NForSearch = airportCacheForSearch;
      }
    );
  }

  /** 照会用空港キャッシュ */
  private _airportI18NList: AirportI18nSearchForAirportCodeCache = {};
  /** 空港コード用キャッシュ */
  private _airportI18NForSearch: AirportI18nSearchForAirportCodeCache = {};

  destroy(): void {}

  /** Dateオブジェクトを日付文字列のフォーマットへ変換する yyyy-MM-dd */
  public convertDateToFormatDateString(date: Date | null): string {
    let formatDateString: string = '';
    if (date !== null) {
      formatDateString = `${date.getFullYear()}-${`0${date.getMonth() + 1}`.slice(-2)}-${`0${date.getDate()}`.slice(
        -2
      )}T${`0${date.getHours()}`.slice(-2)}:${`0${date.getMinutes()}`.slice(-2)}:${`0${date.getSeconds()}`.slice(-2)}`;
    }
    return formatDateString;
  }

  /** HH:mm:ss 変換メソッド */
  public getDateMinutes(hhmmss: string | null | undefined, defaultValue = 0): number {
    if (hhmmss === undefined || hhmmss === null) return defaultValue;
    const [hour, minute] = hhmmss.split(':');
    return Number(hour) * 60 + Number(minute) || defaultValue;
  }

  /** 空港名キャッシュ取得 */
  public getAirportName(airportCode: string | undefined, defaultValue = '') {
    if (!airportCode) return defaultValue;
    return (
      this._airportI18NList[airportCode]?.find((o) => o.airport_code === airportCode)?.airport_name || defaultValue
    );
  }
  /** 照会用空港名キャッシュ取得 */
  public getForSearchAirportName(airportCode: string | undefined, defaultValue = '') {
    if (!airportCode) return defaultValue;
    return (
      this._airportI18NForSearch[airportCode]?.find((o) => o.search_for_airport_code === airportCode)?.airport_name ||
      defaultValue
    );
  }
  /** マルチエアポート判定 */
  public isMultiAirport(AirportCode: string, defaultValue = false): boolean {
    if (!AirportCode) return defaultValue;
    if (this._airportI18NForSearch[AirportCode]?.some((o) => o.multi_airport_type === '2')) return true;
    return false;
  }

  /**
   * 出発時間帯フィルター条件設置
   * @param boundFilterItem
   * @returns
   */
  public departureTimeFilter(boundFilterItem: BoundFilterItem | undefined) {
    // フィルタ条件入力情報.出発時間帯.最小値が存在する、かつフィルタ条件入力情報.出発時間帯.現在選択中の最小値≠フィルタ条件入力情報.出発時間帯.最小値
    // フィルタ条件入力情報.出発時間帯.最小値が存在しない、かつフィルタ条件入力情報.出発時間帯.現在選択中の最小値≠0
    // フィルタ条件入力情報.出発時間帯.最大値が存在する、かつフィルタ条件入力情報.出発時間帯.現在選択中の最大値≠フィルタ条件入力情報.出発時間帯.最大値
    // フィルタ条件入力情報.出発時間帯.最大値が存在しない、かつフィルタ条件入力情報.出発時間帯.現在選択中の最大値≠1439
    if (!boundFilterItem || !boundFilterItem.departureTimeRange) return false;
    const departureTimeRange = boundFilterItem.departureTimeRange;
    if (
      departureTimeRange.limitMinValue &&
      Number(departureTimeRange.selectedMinValue) !== Number(departureTimeRange.limitMinValue)
    ) {
      return true;
    }
    if (!departureTimeRange.limitMinValue && Number(departureTimeRange.selectedMinValue) !== 0) {
      return true;
    }
    if (
      departureTimeRange.limitMaxValue &&
      Number(departureTimeRange.selectedMaxValue) !== Number(departureTimeRange.limitMaxValue)
    ) {
      return true;
    }
    if (!departureTimeRange.limitMaxValue && Number(departureTimeRange.selectedMaxValue) !== 1439) {
      return true;
    }
    return false;
  }

  /**
   * エラー情報設定
   * @param errorType エラー種別
   * @param errorMsgId エラーメッセージID
   * @param apiErrorCode APIより返却されたエラーコード
   */
  public setErrorInfo(errorType: ErrorType, errorMsgId?: string, apiErrorCode?: string) {
    this._errorsHandlerSvc.setNotRetryableError({
      errorType, // ビジネスロジックエラー
      errorMsgId, // E00xx: 出発時間6時間以内エラー
      apiErrorCode, // APIエラーレスポンス情報
    });
  }

  /**
   * CPDランクソートボタン押下時処理
   * @param airOffersList
   * @param currentBoundIndex
   */
  public sortAirOffersListByCpdRank(
    airOffersList: Array<ComplexFmfFareFamilyAirOffersInner>,
    currentBoundIndex: number
  ) {
    airOffersList.sort((a, b) => {
      const bound1 = a.bounds?.[currentBoundIndex];
      const bound2 = b.bounds?.[currentBoundIndex];
      if (bound1?.ranking && bound2?.ranking) {
        return Number(bound1.ranking) - Number(bound2.ranking);
      }
      if (bound1?.ranking) {
        return -1;
      }
      if (bound2?.ranking) {
        return 1;
      }
      return 0;
    });
  }

  /**
   * 運賃差額ソートボタン押下時処理
   * @param airOffersList
   * @returns
   */
  public sortAirOffersListByPriceDifference(
    airOffersList: Array<ComplexFmfFareFamilyAirOffersInner>
  ): Array<ComplexFmfFareFamilyAirOffersInner> {
    airOffersList.sort(
      (a, b) =>
        (a?.prices?.previousSelectionPriceDifference?.priceDifference?.value ?? 0) -
        (b?.prices?.previousSelectionPriceDifference?.priceDifference?.value ?? 0)
    );
    return airOffersList;
  }

  /**
   * 出発時刻ソートボタン押下時処理
   * @param airOffersList
   * @param currentBoundIndex
   */
  public sortAirOffersListByDepartureTime(
    airOffersList: Array<ComplexFmfFareFamilyAirOffersInner>,
    currentBoundIndex: number
  ) {
    airOffersList.sort((a, b) => {
      const bound1 = a.bounds?.[currentBoundIndex];
      const bound2 = b.bounds?.[currentBoundIndex];
      if (bound1?.originDepartureDateTime && bound2?.originDepartureDateTime) {
        const dateA = new Date(bound1.originDepartureDateTime).getTime();
        const dateB = new Date(bound2.originDepartureDateTime).getTime();
        return dateA - dateB;
      }
      if (bound1?.originDepartureDateTime) {
        return -1;
      }
      if (bound2?.originDepartureDateTime) {
        return 1;
      }
      return 0;
    });
  }

  /**
   * 到着時刻ソートボタン押下時処理
   * @param airOffersList
   * @param currentBoundIndex
   */
  public sortAirOffersListByArrivalTime(
    airOffersList: Array<ComplexFmfFareFamilyAirOffersInner>,
    currentBoundIndex: number
  ) {
    airOffersList.sort((a, b) => {
      const bound1 = a.bounds?.[currentBoundIndex];
      const bound2 = b.bounds?.[currentBoundIndex];
      if (bound1?.destinationArrivalDateTime && bound2?.destinationArrivalDateTime) {
        const dateA = new Date(bound1.destinationArrivalDateTime).getTime();
        const dateB = new Date(bound2.destinationArrivalDateTime).getTime();
        return dateA - dateB;
      }
      if (bound1?.destinationArrivalDateTime) {
        return -1;
      }
      if (bound2?.destinationArrivalDateTime) {
        return 1;
      }
      return 0;
    });
  }

  /**
   * 所要時間ソートボタン押下時処理
   * @param airOffersList
   * @param currentBoundIndex
   */
  public sortAirOffersListByDuration(
    airOffersList: Array<ComplexFmfFareFamilyAirOffersInner>,
    currentBoundIndex: number
  ) {
    airOffersList.sort((a, b) => {
      const bound1 = a.bounds?.[currentBoundIndex];
      const bound2 = b.bounds?.[currentBoundIndex];
      if (bound1?.duration && bound2?.duration) {
        return bound1.duration - bound2.duration;
      }
      if (bound1?.duration) {
        return -1;
      }
      if (bound2?.duration) {
        return 1;
      }
      return 0;
    });
  }

  /**
   * 運航キャリアと機種フィルター確認処理
   * @param flight
   * @param nhGroupOperationFilter
   * @param operationAirlineList
   * @returns
   */
  public checkFlightOfBounds(
    flight: Type9,
    nhGroupOperationFilter: boolean,
    operationAirlineList: Array<FareTypeItem>
  ): boolean {
    // 以下のいずれかに合致する場合、運航キャリアフィルター可=trueとする。
    // NHグループ運航フィルタ要否=trueかつ、当該flight.isNhGroupOperate=true
    if (nhGroupOperationFilter && flight.isNhGroupOperated) {
      return true;
    }
    // 選択他社運航キャリアリストについて、以下いずれかに合致する選択他社運航キャリアが1つでも存在する
    // 当該選択他社運航キャリア.airlineCode=当該flight.operatingAirlineCode
    if (operationAirlineList.some((operationAirline) => operationAirline.value === flight.operatingAirlineCode)) {
      return true;
    }
    // 当該flight.operatingAirlineCode=””(空欄)、
    // かつ当該選択他社運航キャリア.airlineName=当該flight.operatingAirlineName
    if (
      flight.operatingAirlineCode === '' &&
      operationAirlineList.some((operationAirline) => operationAirline.name === flight.operatingAirlineName)
    ) {
      return true;
    }
    return false;
    // <ここまで、当該bounds.flightの要素数分、繰り返し>
  }
}
