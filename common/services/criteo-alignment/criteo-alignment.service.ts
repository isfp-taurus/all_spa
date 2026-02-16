import { Injectable } from '@angular/core';
import { CriteoAlignmentInfo } from '@common/components';
import { AswMasterService, CommonLibService } from '@lib/services';
import { TripType } from '@common/interfaces';
import { MasterStoreKey } from '@conf/asw-master.config';
import { take } from 'rxjs';
import { M_OFFICE } from '@common/interfaces/common/m_office';
import { RoundtripFlightAvailabilityInternationalState } from '@common/store/roundtripFlightAvailabilityInternational';
import { RoundtripFlightAvailabilityInternationalService } from '../roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.service';

@Injectable({
  providedIn: 'root',
})
export class CriteoAlignmentService {
  /** 往復空席照会結果(国際)画面のStore */
  private _R01P030Store: RoundtripFlightAvailabilityInternationalState = {};

  constructor(
    private _common: CommonLibService,
    private _aswMasterSvc: AswMasterService,
    private _roundtripFlightAvailabilityInternationalService: RoundtripFlightAvailabilityInternationalService
  ) {
    this._R01P030Store =
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData;
  }

  /**
   * criteo連携情報の作成
   */
  public createCriteoAlignmentInfo(): CriteoAlignmentInfo {
    this._R01P030Store =
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData;
    return {
      /** 区間 */
      criteoSegmentCode: this.getSegmentCode(),
      /** 端末種別 */
      criteoDeviceType: this.getDeviceType(),
      /** 往路出発日 */
      criteoDepartureDate: this.getDepartureDate(),
      /** 復路出発日 */
      criteoArrivalDate: this.getArrivalDate(),
      /** CONNECTION_KIND */
      criteoConnectionKind: this.getConnectionKind(),
      /** 言語コード */
      criteoLanguageCode: this._common.aswContextStoreService.aswContextData.lang,
      /** 片道旅程/往復旅程フラグ */
      criteoSearchMode: this.getSearchMode(),
      /** 大人人数 */
      criteoAdultCount: this.getAdultCount(),
      /** 小児人数 */
      criteoChildCount: String(this._R01P030Store.searchFlight?.traveler.chd ?? 0),
      /** 幼児人数 */
      criteoInfantCount: String(this._R01P030Store.searchFlight?.traveler.inf ?? 0),
      /** 運賃種別 */
      criteoBoardingClass: this.getBoardingClass(),
      /** 運賃オプション */
      criteoBoardingClassOption: this._R01P030Store.searchFlight?.fare.isMixedCabin
        ? ''
        : this._R01P030Store.searchFlight?.fare.fareOptionType,
      /** 運賃総額 */
      criteoTotalAmount: '',
      /** トランザクションID */
      criteoTransactionId: '',
      /** 顧客区分 */
      criteoCustomerType: this._common.isNotLogin() ? '0' : '1',
    };
  }

  /**
   * criteo連携情報 : 区間
   * @returns
   */
  private getSegmentCode(): string {
    // 履歴用検索条件.旅程種別=”roundtrip”
    if (this._R01P030Store.searchFlight?.tripType === TripType.ROUND_TRIP) {
      // 履歴用検索条件.往復旅程区間.出発地(照会用空港コード)+“_”(半角アンダースコア)+(照会用空港コード)
      return (
        this._R01P030Store.searchFlight.roundTrip.departureOriginLocationCode +
        '_' +
        this._R01P030Store.searchFlight.roundTrip.returnOriginLocationCode
      );
    }

    // 履歴用検索条件.旅程種別=”onewayOrMultiCity”
    if (this._R01P030Store.searchFlight?.tripType === TripType.ONEWAY_OR_MULTICITY) {
      // 履歴用検索条件.複雑旅程区間[0].出発地(照会用空港コード)+“_”(半角アンダースコア)+履歴用検索条件.複雑旅程区間[0].到着地(照会用空港コード)
      return (
        this._R01P030Store.searchFlight.onewayOrMultiCity[0].originLocationCode +
        '_' +
        this._R01P030Store.searchFlight.onewayOrMultiCity[0].destinationLocationCode
      );
    }
    return '';
  }

  /**
   * criteo連携情報 : 端末種別
   * @returns
   */
  private getDeviceType(): string {
    if (
      this._common.aswContextStoreService.aswContextData.deviceType === 'PC' ||
      this._common.aswContextStoreService.aswContextData.deviceType === 'TAB'
    ) {
      return 'd';
    }
    if (this._common.aswContextStoreService.aswContextData.deviceType === 'SP') {
      return 'm';
    }
    return '';
  }

  /**
   * criteo連携情報 : 往路出発日
   * @returns
   */
  private getDepartureDate(): string {
    // 履歴用検索条件.旅程種別=”roundtrip”
    if (this._R01P030Store.searchFlight?.tripType === TripType.ROUND_TRIP) {
      // 履歴用検索条件.往復旅程区間.往路出発日
      return this.convertDate(this._R01P030Store.searchFlight.roundTrip.departureDate);
    }

    // 履歴用検索条件.旅程種別=”onewayOrMultiCity”
    if (this._R01P030Store.searchFlight?.tripType === TripType.ONEWAY_OR_MULTICITY) {
      // 履歴用検索条件.複雑旅程区間[0].出発日
      return this.convertDate(this._R01P030Store.searchFlight.onewayOrMultiCity[0].departureDate);
    }
    return '';
  }

  /**
   * criteo連携情報 : 復路出発日
   * @returns
   */
  private getArrivalDate(): string {
    // 履歴用検索条件.旅程種別=”roundtrip”
    if (this._R01P030Store.searchFlight?.tripType === TripType.ROUND_TRIP) {
      // 履歴用検索条件.往復旅程区間.復路出発日
      return this.convertDate(this._R01P030Store.searchFlight.roundTrip.returnDate);
    }

    // 履歴用検索条件.旅程種別=”onewayOrMulticity”、かつ履歴用検索条件.複雑旅程区間の要素数≠1
    if (
      this._R01P030Store.searchFlight?.tripType === TripType.ONEWAY_OR_MULTICITY &&
      this._R01P030Store.searchFlight.onewayOrMultiCity.length !== 1
    ) {
      // 履歴用検索条件.複雑旅程区間[1].出発日
      return this.convertDate(this._R01P030Store.searchFlight.onewayOrMultiCity[1].departureDate);
    }

    // 履歴用検索条件.旅程種別=”onewayOrMulticity”、かつ履歴用検索条件.複雑旅程区間の要素数=1
    if (
      this._R01P030Store.searchFlight?.tripType === TripType.ONEWAY_OR_MULTICITY &&
      this._R01P030Store.searchFlight.onewayOrMultiCity.length === 1
    ) {
      return '';
    }

    return '';
  }

  /**
   * criteo連携情報 : CONNECTION_KIND
   * @returns
   */
  private getConnectionKind(): string {
    // ユーザ共通.操作オフィスコード=オフィスコードとなるASWDB(マスタ)のオフィス.ASWTOP識別
    let result = '';
    this._aswMasterSvc
      .getAswMasterByKey$(MasterStoreKey.OFFICE_ALL)
      .pipe(take(1))
      .subscribe((_officeAll) => {
        _officeAll.forEach((officeAll: M_OFFICE) => {
          if (officeAll.office_code === this._common.aswContextStoreService.aswContextData.pointOfSaleId) {
            result = officeAll.connection_kind ?? '';
          }
        });
      });
    return result;
  }

  /**
   * criteo連携情報 : 片道旅程/往復旅程フラグ
   * @returns
   */
  private getSearchMode(): string {
    // 以下の条件を全て満たす
    // 1	履歴用検索条件.旅程種別=”onewayOrMultiCity”
    // 2	履歴用検索条件.複雑旅程区間の要素数=1	”ONE_WAY”
    if (
      this._R01P030Store.searchFlight?.tripType === TripType.ONEWAY_OR_MULTICITY &&
      this._R01P030Store.searchFlight.onewayOrMultiCity.length === 1
    ) {
      return 'ONE_WAY';
    } else {
      return 'ROUND_TRIP';
    }
  }

  /**
   * criteo連携情報 : 大人人数
   * @returns
   */
  private getAdultCount(): string {
    // 履歴用検索条件.搭乗者数.大人人数 + 履歴用検索条件.搭乗者数.ヤングアダルト人数
    let result = this._R01P030Store.searchFlight?.traveler.adt ?? 0;
    result = result + (this._R01P030Store.searchFlight?.traveler.b15 ?? 0);
    return String(result);
  }

  /**
   * criteo連携情報 : 運賃種別
   * @returns
   */
  private getBoardingClass(): string {
    if (this._R01P030Store.searchFlight?.fare.isMixedCabin) {
      // 履歴用検索条件.運賃情報.MixedCabin利用有無=true

      // 1履歴用検索条件.運賃情報.キャビンクラスに応じた以下の数値を往路キャビンランクとする。
      // 1.1“first”(ファースト)の場合、3
      // 1.2“business”(ビジネス)の場合、2
      // 1.3“ecoPremium”(プレミアムエコノミー)の場合、1
      // 1.4“eco”(エコノミー)の場合、0
      // 2履歴用検索条件.運賃情報.復路キャビンクラスについて、往路キャビンランクと同様の処理にて求めた数値を復路キャビンランクとする。
      // 3往路キャビンランク≧復路キャビンランクの場合は履歴用検索条件.運賃情報.キャビンクラス、そうでない場合は履歴用検索条件.運賃情報.復路キャビンクラスを出力する値とする。
      // 上記の処理を以下の関数内で実施
      return this.getCabinClass(
        this._R01P030Store.searchFlight.fare.cabinClass,
        this._R01P030Store.searchFlight.fare.returnCabinClass
      );
    } else {
      // 履歴用検索条件.運賃情報.MixedCabin利用有無=false
      // 履歴用検索条件.キャビンクラス
      return this._R01P030Store.searchFlight?.fare.cabinClass ?? '';
    }
  }

  private getCabinClass(outwardCabinClass: string, returnCabinClass: string): string {
    // 往路キャビンランク
    const OutwardCabinRank = this.getCabinRank(outwardCabinClass);

    // 復路キャビンランク
    const returnCabinRank = this.getCabinRank(returnCabinClass);

    if (OutwardCabinRank >= returnCabinRank) {
      return outwardCabinClass;
    } else {
      return returnCabinClass;
    }
  }

  private getCabinRank(cabinClass: string): string {
    if (cabinClass === 'first') {
      return '3';
    }
    if (cabinClass === 'business') {
      return '2';
    }
    if (cabinClass === 'ecoPremium') {
      return '1';
    }
    if (cabinClass === 'eco') {
      return '0';
    }
    return '';
  }

  /**
   * Date型をyyyymmddに変換する
   * @returns
   */
  private convertDate(date: Date | null): string {
    if (date === null) {
      return '';
    }
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year.toString()}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;
  }
}
