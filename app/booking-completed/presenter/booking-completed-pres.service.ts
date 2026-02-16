import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { getPassengerLabel } from '@common/helper';
import { CriteoData, PassengerType, TripType } from '@common/interfaces';
import { GetOrderState, SearchFlightState } from '@common/store';
import { SupportClass } from '@lib/components/support-class';
import { DeviceType, LoginStatusType } from '@lib/interfaces';
import { StaticMsgPipe } from '@lib/pipes';
import { AswContextState } from '@lib/store';
import {
  GetOrderResponse,
  GetOrderResponseData,
  GetOrderResponseDataTravelersSummaryTravelerNumbers,
} from 'src/sdk-servicing';
import { BookingCompletedMastarData } from './booking-completed.state';
/**
 * 予約購入完了画面 サービス
 */
@Injectable({
  providedIn: 'root',
})
export class BookingCompletedPresService extends SupportClass {
  constructor(public staticMsg: StaticMsgPipe, public datePipe: DatePipe) {
    super();
  }
  destroy(): void {}

  /**
   * 予約ヘッダに表示するステータスをのラベル文字列取得
   * @param value 支払情報.購入発券結果
   * @returns ラベル文字列
   */
  getOrderStatusLabel(value: string, paymentMethod: string) {
    switch (value) {
      case GetOrderResponseData.OrderStatusEnum.Ticketed:
        return 'label.ticketed.bokkingComplete';
      case GetOrderResponseData.OrderStatusEnum.Unticketed:
        return 'label.notTicketed';
      case GetOrderResponseData.OrderStatusEnum.PaymentAccepted:
        if (paymentMethod === 'CV') {
          return 'label.paymentType.uncompleted.cv'; // コンビニ振込み
        } else {
          return 'label.paymentType.uncompleted.ib'; // ネット振り込み
        }
      case GetOrderResponseData.OrderStatusEnum.Unpurchased:
        return 'label.notPurchased';
      case GetOrderResponseData.OrderStatusEnum.reservationOnly:
        return 'label.notPurchased';
      case GetOrderResponseData.OrderStatusEnum.waitlisted:
        return 'label.bookingStatus.waiting';
      case GetOrderResponseData.OrderStatusEnum.applyingForTicketing:
        return 'label.bookingStatus.applyingForTicketing';
      default:
        return 'label.notPurchased';
    }
  }

  /**
   * Eチケットボタンに表示するラベルを取得
   * @param getOrder PNR情報取得レスポンス
   * @returns ラベル文字列
   */
  getETicketEmdLabel(getOrder?: GetOrderState) {
    const eticketAndEmd = getOrder?.data?.orderEligibilities?.eticketAndEmd ?? {};
    if (
      eticketAndEmd.isEligibleToForward &&
      eticketAndEmd.numberOfDocuments === 1 &&
      getOrder?.data?.travelDocuments?.[0]?.documentType === 'eticket'
    ) {
      return 'label.displayTicket';
    } else if (
      eticketAndEmd.isEligibleToForward &&
      (getOrder?.data?.travelDocuments?.[0]?.documentType === 'services' || 2 <= (eticketAndEmd.numberOfDocuments ?? 0))
    ) {
      return 'label.showETicketAndEmd';
    }
    return '';
  }

  /**
   * 予約ヘッダに表示する搭乗者文字列取得
   * @param travelers PNR情報取得レスポンスの搭乗者情報
   * @returns 表示文字列
   */
  getTravelerNumText(travelers: GetOrderResponseDataTravelersSummaryTravelerNumbers) {
    let str = '';
    //INSとINFはまとめる INSはいないはずですが一応
    let infNum: number = (
      Object.entries(travelers)
        .filter(([key]) => key === PassengerType.INF || key === PassengerType.INS)
        .map(([, value]) => {
          return value;
        }) ?? [0]
    ).reduce(function (sum, element) {
      return sum + element;
    }, 0);
    str = Object.entries(travelers)
      .filter(
        ([key, value]) =>
          ([PassengerType.ADT, PassengerType.B15, PassengerType.CHD] as string[]).includes(key) && value !== 0
      )
      .map(([key, value]) => {
        return `${value} ${this.staticMsg.transform(getPassengerLabel(key))}`;
      })
      .join(', ');

    if (infNum !== 0) {
      if (str !== '') {
        str += ', ';
      }
      str += infNum + ' ' + this.staticMsg.transform(getPassengerLabel(PassengerType.INF));
    }
    return str;
  }

  /**
   * criteo連携用データ作成
   * @param getOrder PNR情報取得API
   * @param searchFlight 検索情報
   * @param aswContext ユーザー共通情報
   * @param master マスターデータ
   * @returns criteo連携用データ
   */
  makeCriteoData(
    getOrder: GetOrderResponse,
    searchFlight: SearchFlightState,
    aswContext: AswContextState,
    master: BookingCompletedMastarData
  ) {
    const criteo: CriteoData = {
      segmentCode: '',
      deviceType: '',
      departureDate: '',
      arrivalDate: '',
      connectionKind: '',
      languageCode: '',
      searchMode: '',
      adultCount: 0,
      childCount: 0,
      infantCount: 0,
      boardingClass: '',
      boardingClassOption: '',
      totalAmount: 0,
      transactionId: '',
      customerType: '',
    };
    return this.makeCriteoDataExc(criteo, getOrder, searchFlight, aswContext, master);
  }

  /**
   * criteo連携用データ作成　実行
   * @param criteo criteo連携用データ
   * @param getOrder PNR情報取得API
   * @param searchFlight 検索情報
   * @param aswContext ユーザー共通情報
   * @param master マスターデータ
   * @returns criteo連携用データ
   */
  makeCriteoDataExc(
    criteo: CriteoData,
    getOrder: GetOrderResponse,
    searchFlight: SearchFlightState,
    aswContext: AswContextState,
    master: BookingCompletedMastarData
  ) {
    const roundtrip = searchFlight.roundTrip;
    const onewayOrMultiCity = searchFlight.onewayOrMultiCity;
    const isRoundTrip = searchFlight?.tripType === TripType.ROUND_TRIP;
    const isMulticity = searchFlight?.tripType === TripType.ONEWAY_OR_MULTICITY;
    const criteoDateFormat = 'yyyyMMdd';
    if (isRoundTrip) {
      criteo.segmentCode = `${roundtrip?.departureOriginLocationCode ?? ''}_${
        roundtrip?.returnOriginLocationCode ?? ''
      }`;
      criteo.departureDate = this.datePipe.transform(roundtrip.departureDate, criteoDateFormat) ?? '';
      criteo.arrivalDate = this.datePipe.transform(roundtrip.returnDate, criteoDateFormat) ?? '';
    } else if (isMulticity) {
      criteo.segmentCode = `${onewayOrMultiCity?.[0]?.originLocationCode ?? ''}_${
        onewayOrMultiCity?.[0]?.destinationLocationCode ?? ''
      }`;
      criteo.departureDate = this.datePipe.transform(onewayOrMultiCity?.[0]?.departureDate, criteoDateFormat) ?? '';
      criteo.arrivalDate = this.datePipe.transform(onewayOrMultiCity?.[1]?.departureDate, criteoDateFormat) ?? '';
    }
    criteo.deviceType = aswContext.deviceType === DeviceType.SMART_PHONE ? 'm' : 'd';
    const office = master.office.find((off) => off.office_code === aswContext.pointOfSaleId);
    criteo.connectionKind = office?.connection_kind ?? '';
    criteo.languageCode = aswContext.lang;
    criteo.searchMode = isMulticity && (onewayOrMultiCity ?? []).length === 1 ? 'ONE_WAY' : 'ROUND_TRIP';
    const travelerNumbers = getOrder.data?.travelersSummary?.travelerNumbers;
    criteo.adultCount = (travelerNumbers?.ADT ?? 0) + (travelerNumbers?.B15 ?? 0);
    criteo.childCount = travelerNumbers?.CHD ?? 0;
    criteo.infantCount = travelerNumbers?.INF ?? 0;
    if (searchFlight.fare?.isMixedCabin) {
      const departureCabinClass = searchFlight.fare?.cabinClass ?? '';
      const returnCabinClass = searchFlight.fare?.returnCabinClass ?? '';
      const departCabinRank = this.getCabinClassRank(departureCabinClass);
      const destCabinRank = this.getCabinClassRank(returnCabinClass);
      criteo.boardingClass = departCabinRank >= destCabinRank ? departureCabinClass : returnCabinClass;
      criteo.boardingClassOption = '';
    } else {
      criteo.boardingClass = searchFlight.fare?.cabinClass ?? '';
      criteo.boardingClassOption = searchFlight.fare?.fareOptionType ?? '';
    }
    criteo.totalAmount = getOrder.data?.prices?.totalPrices?.ticketPrices?.total?.[0]?.value ?? 0;
    criteo.transactionId = getOrder.data?.criteoTransactionId ?? '';
    criteo.customerType = aswContext.loginStatus === LoginStatusType.NOT_LOGIN ? '0' : '1';
    return criteo;
  }

  /**
   * キャビンクラスをcriteo連携用数値に変換する
   * @param cabinClass
   * @returns criteo連携用数値
   */
  getCabinClassRank(cabinClass: string) {
    switch (cabinClass) {
      case 'first':
        return 3;
      case 'business':
        return 2;
      case 'ecoPremium':
        return 1;
      case 'eco':
        return 0;
      default:
        return 0;
    }
  }
}
