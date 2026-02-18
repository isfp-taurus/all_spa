import { Injectable } from '@angular/core';
import {
  Bound,
  SearchFlightState,
  TripType,
  SearchFlightConstant,
} from '@common/store/search-flight/search-flight.state';
import { MASTER_TABLE, MasterStoreKey } from '@conf/asw-master.config';
import { SupportClass } from '@lib/components/support-class';
import { AswContextStoreService, AswMasterService, CommonLibService } from '@lib/services';
import {
  AirportI18nSearchForAirportCode,
  FareTypeOptionListByCabinClassMap,
  FareTypeOption,
  CabinClassOptionList,
  CabinClass,
  AirportRegionCacheDataKey,
  AirportListKey,
  AwardOptionList,
  AwardOption,
} from './shopping-lib.state';
import { StaticMsgPipe } from '@lib/pipes/static-msg/static-msg.pipe';
import { fareOptionList } from '@common/interfaces/shopping/fareOption';
import { InitializationResponseDataAnaBizContextAuthInfoCompanyInfoA } from 'src/sdk-initialization/model/initializationResponseDataAnaBizContextAuthInfoCompanyInfoA';
import { InitializationResponseDataAnaBizContextAuthInfoCompanyInfoC } from 'src/sdk-initialization/model/initializationResponseDataAnaBizContextAuthInfoCompanyInfoC';
import {
  MaxPassengersCount,
  NewDomesticAswMaxPassengersCount,
  OldDomesticAswMaxPassengersCount,
} from '@common/components/shopping/search-flight/passenger-selector/passenger-selector.state';
import { DcsDateService } from '@common/services/dcs-date/dcs-date.service';
import { ValidationErrorInfo } from '@lib/interfaces';

/**
 * ショッピング系画面の共通関数サービスクラス
 */
@Injectable()
export class ShoppingLibService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _aswContextStoreSvc: AswContextStoreService,
    private _staticMsg: StaticMsgPipe,
    private _aswMasterSvc: AswMasterService,
    private _dcsDateSvc: DcsDateService
  ) {
    super();
  }
  destroy(): void {}
  /** 日本の地域コード文字列 */
  readonly COUNTRY_CODE_JAPAN = 'JP';

  /** 空港と地域リストキー */
  private airportListKey = <AirportListKey>{};

  //Akamaiキャッシュキー
  /** 出発地用空港リストキー */
  private _airportDepartureListAkamaiKey: string = '';
  /** 到着地用空港リストキー */
  private _airporDestinationListAkamaiKey: string = '';
  /** 空港と地域キャッシュリストキーデータ */
  private _airportRegionCacheKeyData = <AirportRegionCacheDataKey>{};

  private _cabinListMap = new Map<string, Array<CabinClassOptionList>>();
  private _awardListMap = new Map<string, Array<AwardOptionList>>();
  /** キャビンクラスリストの言語種別 */
  private _cabinListMapLang = '';

  /**
   * キャビンクラスリスト取得
   * @param isJapanOnly:boolean
   * @returns:Array<CabinClassOptionList>
   */
  public getCabinList(isJapanOnly: boolean): Array<CabinClassOptionList> {
    // 未初期化、或は言語切替発生する場合、再初期化
    if (this._cabinListMap.size === 0 || this._cabinListMapLang !== this._aswContextStoreSvc.aswContextData.lang) {
      this.initCabinList();
    }
    if (this.isAnaBizLogin()) {
      return this._cabinListMap.get('anaBiz')!;
    } else {
      // 国内判断
      if (isJapanOnly) {
        // キャビンクラスからデータ国内キャビンクラスデータを抽出
        return this._cabinListMap.get('domestic')!;
      } else {
        // キャビンクラスデータから国際キャビンクラスデータを抽出
        return this._cabinListMap.get('international')!;
      }
    }
  }

  public getAwardList(): Array<CabinClassOptionList> {
    if (this._awardListMap.size === 0) {
      this.initAwardList();
    }

    return this._awardListMap.get('domestic')!;
  }

  /**
   * キャビンクラスリスト初期化
   */
  public initCabinList() {
    // キャビンクラスデータを取得する
    const cabinListCash = this._aswMasterSvc.aswMaster[MasterStoreKey.M_LIST_DATA_930];
    // 言語種別も保存する
    this._cabinListMapLang = this._aswContextStoreSvc.aswContextData.lang;
    this._cabinListMap.set(
      'anaBiz',
      this.createAnaBizCabinClassList(
        cabinListCash.domestic.map((v: CabinClass) => {
          return { value: v.value, textContent: v.label };
        })
      )
    );
    this._cabinListMap.set(
      'domestic',
      cabinListCash.domestic.map((v: CabinClass) => {
        return { value: v.value, textContent: v.label };
      })
    );
    this._cabinListMap.set(
      'international',
      cabinListCash.international.map((v: CabinClass) => {
        return { value: v.value, textContent: v.label };
      })
    );
  }

  public initAwardList() {
    // キャビンクラスデータを取得する
    const awardListCache = this._aswMasterSvc.aswMaster[MasterStoreKey.M_LIST_DATA_931];
    this._awardListMap.set(
      'domestic',
      awardListCache.domestic.map((v: AwardOption) => {
        return { value: v.value, textContent: v.label };
      })
    );
  }

  /**
   * 運賃オプションリスト取得
   * @param CffType:string
   * @returns:Map<string, FareTypeOptionListByCabinClassMap[]>
   */
  public getCabinFareTypeListMap(CffType: string): Map<string, FareTypeOptionListByCabinClassMap[]> {
    // キャビンクラスデータを取得する
    const fareTypeList = this._aswMasterSvc.aswMaster[MasterStoreKey.M_LIST_DATA_940];
    // 指定されたCffTypeでオプションデータを取得する、国内は"1"、国際は"0"
    const cffFareTypeList = fareTypeList?.[CffType];
    // 国際運賃オプション選択モーダル用に編集
    const fareTypeOptionListByCabinClassMap = new Map<string, FareTypeOptionListByCabinClassMap[]>();
    Object.keys(cffFareTypeList).forEach((key: string) => {
      fareTypeOptionListByCabinClassMap.set(
        key,
        cffFareTypeList[key].map((entry: FareTypeOption) => {
          return {
            commercial_fare_family_code: entry.commercial_fare_family_code,
            commercial_fare_family_type: entry.commercial_fare_family_type,
            cabin: entry.cabin,
            value: entry.value,
            fareType: entry.first_label,
            description: entry.second_label,
          };
        })
      );
    });
    if (this.isAnaBizLogin()) {
      return this.filteredAnaBizFareOptionMap(fareTypeOptionListByCabinClassMap);
    }
    // 編集後の運賃オプションリスト
    return fareTypeOptionListByCabinClassMap;
  }

  /**
   * CFF状態取得
   * @param isJapanOnly:boolean
   * @param searchFlightData 検索条件
   * @returns:string
   */
  public getCommercialFareFamily(searchFlightData: SearchFlightState | Date[], fareCategory: string | null): string {
    let commercialFareFamily: string = '0';
    if (this.isAnaBizLogin()) {
      // ANA Biz
      commercialFareFamily = '3';
    } else if (fareCategory === 'award') {
      commercialFareFamily = '6';
    } else if (fareCategory === 'priced/award') {
      commercialFareFamily = '7';
    } else {
      commercialFareFamily = '2';
    }
    return commercialFareFamily;
  }

  /**
   * 搭乗者人数を１つのテキストに結合する
   * @param adult:number
   * @param youngAdult:number
   * @param child:number
   * @param infant:number
   * @returns: string
   */
  public getPassengersText(adult: number, youngAdult?: number, child?: number, infant?: number): string {
    const textArray = [];

    if (adult > 0) {
      const text = this._staticMsg.transform('label.selectedAdult', { '0': adult.toString() });
      textArray.push(text);
    }
    if (youngAdult != null && youngAdult > 0) {
      const text = this._staticMsg.transform('label.selectedYoungAdult', { '0': youngAdult.toString() });
      textArray.push(text);
    }
    if (child != null && child > 0) {
      const text = this._staticMsg.transform('label.selectedChild', { '0': child.toString() });
      textArray.push(text);
    }
    if (infant != null && infant > 0) {
      const text = this._staticMsg.transform('label.selectedInfant', { '0': infant.toString() });
      textArray.push(text);
    }
    return textArray.join(`${this._staticMsg.transform('label.paxNumberDelimiter')} `);
  }

  /**
   * 日本国内単独旅程判定処理
   * @param tripType: TripType 必須
   * @param parmRoundTrip: 往復旅程
   *         departureOriginLocationCode: 往路出発地
   *         departureConnectionLocationCode: 往路乗継地
   *         departureDestinationLocationCode: 往路到着地
   *         returnConnectionLocationCode: 複路乗継地
   * @param onewayOrMulticity: []　複雑旅程
   *         originLocationCode: 出発地
   *         destinationLocationCode: 到着地
   */
  public checkJapanOnlyTrip(
    parmRoundTrip?: {
      departureOriginLocationCode: string | null;
      departureConnectionLocationCode: string | null;
      departureDestinationLocationCode: string | null;
      returnConnectionLocationCode: string | null;
    },
    parmOnewayOrMultiCity?: {
      originLocationCode: string | null;
      destinationLocationCode: string | null;
    }[]
  ): boolean {
    //国内旅程フラグ
    let japanOnlyFlag: boolean = false;
    if (parmRoundTrip) {
      const roundTrip = parmRoundTrip;
      //往路出発到着地と往復路乗継地の地域コードが日本の場合、日本国内単独とする
      if (
        roundTrip.departureOriginLocationCode &&
        roundTrip.departureDestinationLocationCode &&
        this.getAirportByRefCode(roundTrip.departureOriginLocationCode)?.country_2letter_code ===
          this.COUNTRY_CODE_JAPAN &&
        (!roundTrip.departureConnectionLocationCode ||
          this.getAirportByRefCode(roundTrip.departureConnectionLocationCode)?.country_2letter_code ===
            this.COUNTRY_CODE_JAPAN) &&
        this.getAirportByRefCode(roundTrip.departureDestinationLocationCode)?.country_2letter_code ===
          this.COUNTRY_CODE_JAPAN &&
        (!roundTrip.returnConnectionLocationCode ||
          this.getAirportByRefCode(roundTrip.returnConnectionLocationCode)?.country_2letter_code ===
            this.COUNTRY_CODE_JAPAN)
      ) {
        japanOnlyFlag = true;
      }
    } else if (parmOnewayOrMultiCity) {
      const onewayOrMultiCity = parmOnewayOrMultiCity;
      japanOnlyFlag = false;
      for (const bound of onewayOrMultiCity) {
        if (!bound.originLocationCode || !bound.destinationLocationCode) {
          continue;
        }
        if (this.getAirportByRefCode(bound.originLocationCode)?.country_2letter_code !== this.COUNTRY_CODE_JAPAN) {
          japanOnlyFlag = false;
          break;
        }
        if (this.getAirportByRefCode(bound.destinationLocationCode)?.country_2letter_code !== this.COUNTRY_CODE_JAPAN) {
          japanOnlyFlag = false;
          break;
        }
        japanOnlyFlag = true;
      }
    }
    return japanOnlyFlag;
  }
  /** 空港コードから空港オブジェクトを取得する */
  public getAirportByRefCode(code: string): AirportI18nSearchForAirportCode | null {
    const referenceAirportList = this._aswMasterSvc.aswMaster[MasterStoreKey.AirportI18n_SearchForAirportCode];
    const airportRef = referenceAirportList[code];
    if (airportRef && airportRef.length > 0) {
      return airportRef[0];
    } else {
      return null;
    }
  }

  /**
   * 運賃オプションリスト作成処理
   * @param commercialFareFamilyClassification Commercial Fare Family区分
   * @param key キャビンクラス
   * @returns 運賃オプションリスト
   *  */
  public createFareOptionList(commercialFareFamilyClassification: string, key: string) {
    let _fareOption: fareOptionList = this._aswMasterSvc.aswMaster[MASTER_TABLE.M_LIST_DATA_940.key];
    const itineraryType = _fareOption?.[commercialFareFamilyClassification];
    return itineraryType?.[key];
  }

  /**
   * AnaBizログイン状態判定処理
   * @returns AnaBizログイン状態判定結果、true:ログイン、false：未ログイン
   *  */
  public isAnaBizLogin(): boolean {
    const anaBizLoginStatus = this._common.aswContextStoreService.aswContextData.anaBizLoginStatus;
    return anaBizLoginStatus === 'LOGIN';
  }

  /**
   * AnaBiz運賃オプションリスト作成処理
   * @param fareOptionAnaBizListMap AnaBiz運賃オプションマップ
   * @returns AnaBiz運賃オプションリスト
   *  */
  private filteredAnaBizFareOptionMap(
    fareOptionAnaBizMap: Map<string, FareTypeOptionListByCabinClassMap[]>
  ): Map<string, FareTypeOptionListByCabinClassMap[]> {
    let anaBizFareTypeOptionList: Map<string, FareTypeOptionListByCabinClassMap[]> = fareOptionAnaBizMap;

    const fareFamilyList =
      this._common.anaBizContextStoreService.anaBizContextData.allBizContext?.commercialFareFamilyList;
    let commercialFareFamilyData: Array<string> | undefined = fareFamilyList?.split(',');

    const ecoFareOptionAnaBizList = fareOptionAnaBizMap.get('eco');
    let eco;
    if (ecoFareOptionAnaBizList && commercialFareFamilyData && commercialFareFamilyData.length >= 1) {
      eco = ecoFareOptionAnaBizList.filter((item) => commercialFareFamilyData?.includes(item.value));
    }
    if (eco != undefined) {
      anaBizFareTypeOptionList.set('eco', eco);
    }
    return anaBizFareTypeOptionList;
  }

  /**
   * AnaBizキャビンクラスリスト作成処理
   * @param domestic 国内キャビンクラスリスト
   * @returns AnaBizキャビンクラスリスト
   *  */
  public createAnaBizCabinClassList(domesticClassOptionList: CabinClassOptionList[]): CabinClassOptionList[] {
    let anaBizCabinClassList: CabinClassOptionList[] = [];

    const fareFamilyList =
      this._common.anaBizContextStoreService.anaBizContextData.allBizContext?.commercialFareFamilyList;
    let commercialFareFamilyData: Array<string> | undefined = fareFamilyList?.split(',');

    if (commercialFareFamilyData && commercialFareFamilyData.length >= 1) {
      let anaBizCabinClass = domesticClassOptionList.filter((cabinClass) => cabinClass.value === 'eco');
      anaBizCabinClassList.push(anaBizCabinClass[0]);
    }
    return anaBizCabinClassList;
  }

  /** [複雑旅程の入力済み区間数取得処理] */
  public getBoundInputCount(onewayOrMultiCity: Array<Bound>): number {
    let count = 0;
    if (onewayOrMultiCity && onewayOrMultiCity.length > 0) {
      onewayOrMultiCity.forEach((item) => {
        if (
          this.isNotEmpty(item.originLocationCode) ||
          this.isNotEmpty(item.destinationLocationCode) ||
          this.isNotEmpty(item.departureDate) ||
          item.departureTimeWindowFrom !== SearchFlightConstant.TIME_WINDOW_MIN ||
          item.departureTimeWindowTo !== SearchFlightConstant.TIME_WINDOW_MAX
        ) {
          count++;
        }
      });
    }
    return count;
  }
  /** [Mixed Cabin・前後日付表示オプション利用可否判定&リセット] */
  public checkMixCabinAndReset(searchFlightData: SearchFlightState): SearchFlightState {
    // Mixed Cabinの利用再設定
    // Mixed Cabin利用可否
    let mixCabinFlg = true;

    // 複雑旅程区間を受け取り処理
    const boundCount = this.getBoundInputCount(searchFlightData.onewayOrMultiCity);
    // 以下のいずれかを満たす場合、Mixed Cabin利用可否=false
    // 保持している検索条件.tripType=1(片道または複雑旅程)、かつ入力済み区間数≠2
    // 引数.国内旅程かどうか=true
    // かつDCS移行開始日前後状態="Before"
    const { dcsMigrationDateStatus } = searchFlightData;
    if (
      (searchFlightData.tripType === TripType.ONEWAY_OR_MULTI_CITY && boundCount !== 2) ||
      (searchFlightData.isJapanOnly && dcsMigrationDateStatus === 'Before')
    ) {
      mixCabinFlg = false;
    }
    // Mixed Cabin利用可否=falseの場合、保持している検索条件.運賃情報.Mixed Cabin利用有無にfalse
    if (!mixCabinFlg) {
      searchFlightData = {
        ...searchFlightData,
        fare: {
          ...searchFlightData.fare,
          isMixedCabin: false,
        },
      };
    }
    // 保持している検索条件.tripType=1(片道または複雑旅程)、かつ入力済み区間数<2
    if (searchFlightData.tripType === TripType.ONEWAY_OR_MULTI_CITY && boundCount < 2) {
      searchFlightData = {
        ...searchFlightData,
        displayInformation: {
          ...searchFlightData.displayInformation,
          compareFaresNearbyDates: false,
        },
      };
    }
    // 国内単独旅程かつ、往復旅程または複雑旅程で入力済み区画数が2以下、前後日付表示オプションをチェックなしとし、非活性表示にする。
    if (
      searchFlightData.isJapanOnly &&
      (searchFlightData.tripType === TripType.ROUND_TRIP ||
        (searchFlightData.tripType === TripType.ONEWAY_OR_MULTI_CITY && searchFlightData.onewayOrMultiCity.length < 3))
    ) {
      searchFlightData = {
        ...searchFlightData,
        displayInformation: {
          ...searchFlightData.displayInformation,
          compareFaresNearbyDates: false,
        },
      };
    }
    return searchFlightData;
  }

  public isNotEmpty(value: any): boolean {
    return value !== '' && value !== null && value !== undefined;
  }

  public getAirportListKey(tripType?: number): AirportListKey {
    // ユーザ共通.POS国コードを取得する
    const posCountryCode = this._aswContextStoreSvc.aswContextData.posCountryCode;
    // Akamai出発地用空港リスト
    this._airportDepartureListAkamaiKey = MasterStoreKey.DEPARTUREAIRPORT_ALL;
    // Akamai到着地用空港リスト
    this._airporDestinationListAkamaiKey = MasterStoreKey.DESTINATIONAIRPORT_ALL;
    // 空港と地域キャッシュリストデータ
    this._airportRegionCacheKeyData = {
      // 日本のみの地域情報リスト
      japanOnlyRegionKey: MasterStoreKey.REGION_JAPAN,
      // アメリカサイトの出発地用空港情報リスト
      departureExceptCubaAirportKey: MasterStoreKey.DEPARTURE_AIRPORT_EXCEPT_CUBA,
      // 日本のみの出発地空港情報リスト
      japanOnlyDepartureAirportKey: MasterStoreKey.DEPARTURE_AIRPORT_JAPAN,
      // 日本のみの到着地空港情報リスト
      japanOnlyDestinationAirportKey: MasterStoreKey.DESTINATION_AIRPORT_JAPAN,
      // アメリカサイトの到着地用空港情報リスト
      destinationExceptCubaAirportKey: MasterStoreKey.DESTINATION_AIRPORT_EXCEPT_CUBA,
      // 日本以外の地域情報リスト
      abroadRegionKey: MasterStoreKey.REGION_ABROAD,
      // 日本以外の到着地空港情報リスト
      abroadDestinationAirportKey: MasterStoreKey.DESTINATION_AIRPORT_ABROAD,
    };
    let listKey: AirportListKey = {
      /** 出発地空港リスト */
      departureAirportListKey: '',
      /** 到着地空港リスト */
      destinationAirportListKey: '',
      /** 出発地地域リスト */
      departureRegionListKey: '',
      /** 到着地地域リスト */
      destinationRegionListKey: '',
    };
    // 全空港
    // 出発地空港リスト:Akamai到着地空港リスト
    this.airportListKey.departureAirportListKey = this._airportDepartureListAkamaiKey;
    // 到着地空港リスト:Akamai到着地空港リスト
    this.airportListKey.destinationAirportListKey = this._airporDestinationListAkamaiKey;

    listKey = this.airportListKey;
    return listKey;
  }

  /** DCS移行開始日前後判定 */
  public getDcsMigrationDateStatus(param: SearchFlightState | Date[]): string {
    let dcsMigrationDateStatus: string = '';
    let departureDateList: Date[] = [];
    if (param instanceof Array) {
      departureDateList = param;
    } else {
      if (param.tripType === TripType.ROUND_TRIP) {
        if (param.roundTrip.departureDate) {
          departureDateList.push(param.roundTrip.departureDate);
        }
        if (param.roundTrip.returnDate) {
          departureDateList.push(param.roundTrip.returnDate);
        }
      } else {
        param.onewayOrMultiCity.forEach((bound) => {
          if (bound.departureDate) {
            departureDateList.push(bound.departureDate);
          }
        });
      }
    }

    let dateList = departureDateList.map((item) =>
      this._dcsDateSvc.isAfterDcs(this.convertDateToFormatDateString(item))
    );
    let newDateList = dateList.filter((item) => !item);
    if (newDateList.length === 0) {
      // すべての出発日がDCS移行開始日以降の場合
      dcsMigrationDateStatus = 'After';
    } else if (newDateList.length === dateList.length) {
      // すべての出発日がDCS移行開始日前の場合
      dcsMigrationDateStatus = 'Before';
    } else {
      // ミックスの場合
      dcsMigrationDateStatus = 'Mixed';
    }
    return dcsMigrationDateStatus;
  }

  /** Dateオブジェクトを日付文字列のフォーマットへ変換する yyyy-MM-dd */
  private convertDateToFormatDateString(date: Date | null): string {
    if (date != null) {
      return (
        date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
      );
    } else {
      return '';
    }
  }

  /** 旧国内ASW取扱検索条件フラグを取得する */
  public getOldDomesticAswSearchFlag(param: SearchFlightState, posCountryCode: string) {
    // DCS移行開始日前後状態の取得
    let flag = false;
    const { isJapanOnly, dcsMigrationDateStatus } = param;
    if (posCountryCode === 'JP' && isJapanOnly && dcsMigrationDateStatus === 'Before') {
      flag = true;
    }
    return flag;
  }

  /** 小児上限人数設定*/
  public determineMaxChildCount(posCountryCode: string, dcsMigrationDateStatus: string, isJapanOnly: boolean): number {
    if (isJapanOnly) {
      if (dcsMigrationDateStatus === 'Before') {
        if (posCountryCode === 'JP') {
          // 旧国内条件
          return OldDomesticAswMaxPassengersCount.CHILD;
        } else {
          // 海外POSの移行前国内条件
          return MaxPassengersCount.CHILD;
        }
      } else {
        // 新国内条件
        return NewDomesticAswMaxPassengersCount.CHILD;
      }
    } else {
      // 国際条件
      return MaxPassengersCount.CHILD;
    }
  }

  /** カウチ対象便ACVコードリスト作成 */
  public getcouchAcvCodeList() {
    let couchAcvCode = this._aswMasterSvc.getMPropertyByKey('serviceRequest', 'couch.availableAcvList');
    let couchAcvCodeList = couchAcvCode.split('|');
    return couchAcvCodeList;
  }

  /** 搭乗者種別入力チェック処理 */
  public checkTraveler(adt: number, chd: number, inf: number, isJapanOnly: boolean, departureDate: Date) {
    let errorMessage: string | ValidationErrorInfo = '';
    const dcsDateStr = this._aswMasterSvc.getMPropertyByKey('migration', 'uiuxs2.transitionDate.domesticDcs');
    const dcsDate = new Date(dcsDateStr);
    const posCountryCode = this._aswContextStoreSvc.aswContextData.posCountryCode;
    if (adt === 0 && chd === 0 && inf === 0) {
      errorMessage = {
        errorMsgId: 'E0002',
        params: {
          key: 0,
          value: this._staticMsg.transform('label.paxNumber'),
          dontTranslate: true,
        },
      };
    } else if (adt + chd >= 10) {
      errorMessage = 'E0229';
    } else if (inf > adt) {
      errorMessage = 'E0235';
    } else if (isJapanOnly && inf > 0 && departureDate < dcsDate && posCountryCode !== 'JP') {
      errorMessage = 'E0233';
    }
    return errorMessage;
  }
}
