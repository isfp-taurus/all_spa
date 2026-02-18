import { Injectable } from '@angular/core';
import {
  ITINERARY_DIVISION,
  ServiceConditionType,
  ServiceInfoType,
  ServiceType,
  CabinClassList,
  FareOptionList,
  OperatingAirlineType,
} from '../interfaces';
import { MasterStoreKey } from '@conf/asw-master.config';
import { TranslatePrefix } from '@conf/index';
import { AnaBizLoginStatusType } from '@lib/interfaces';
import { AnaBizContextStoreService, AswContextStoreService, AswMasterService, SystemDateService } from '@lib/services';
import { TranslateService } from '@ngx-translate/core';
import { StaticMsgPipe } from '@lib/pipes';
import { RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner, RoundtripFppItemFareFamilyDataTypeInner } from '../sdk';

/** サービスコンテンツ  */
const SERVICE_CONTENT_KEY = {
  // 国際線
  I: 'I',
  // 日本国内線
  D: 'D',
};
/** 時刻形式 */
const DATE_FORMAT = {
  YMD: 'yyyyMMdd',
};

/**
 * マスタデータService
 */
@Injectable({
  providedIn: 'root',
})
export class MasterDataService {
  constructor(
    private _aswMasterSvc: AswMasterService,
    private _translateSvc: TranslateService,
    private _aswContextSvc: AswContextStoreService,
    private _anaBizContextSvc: AnaBizContextStoreService,
    private _systemDateSvc: SystemDateService,
    private _staticMsgSvc: StaticMsgPipe
  ) {}

  /**
   * 機種URL（AIRCRAFT_TYPE_URL）を取得する(関連キャッシュ名: Equipment_I18nJoin_Pk)
   *
   * @param aircraftConfigurationVersion ACV※NHグループ運航便の場合に返却する
   * @returns 機種URL
   */
  public getModelLink(aircraftConfigurationVersion?: string): string {
    let url = '';
    if (aircraftConfigurationVersion) {
      const equipmentPkInfo = this._getMasterData(MasterStoreKey.EQUIPMENT_I18NJOIN_PK);
      url = equipmentPkInfo?.[aircraftConfigurationVersion]?.[0]?.aircraft_type_url;
    }
    return url;
  }

  /**
   * サービスコンテンツのリストを取得する(関連キャッシュ名: ServiceContentsByItineraryType_Cabin)
   *
   * @param serviceCondition 旅程区分とCabin Classの情報
   * @returns サービスコンテンツのリスト
   */
  public getSvcInfo(serviceCondition: ServiceConditionType): ServiceInfoType {
    let changedAfterSvcInfor: ServiceInfoType = {};
    const mServiceContents = this._getMasterData(MasterStoreKey.SERVICE_CONTENTS);
    let serviceList: any[] = [];
    const serviceItineraryDivision =
      serviceCondition.itineraryDivision === ITINERARY_DIVISION.INT ? SERVICE_CONTENT_KEY.I : SERVICE_CONTENT_KEY.D;
    if (serviceCondition?.cabin) {
      serviceList = mServiceContents?.[serviceItineraryDivision]?.[serviceCondition.cabin];
    }
    let serviceTypeList: Array<ServiceType> = [];
    serviceList?.forEach((serviceInfo: any) => {
      serviceTypeList.push({
        serviceType: serviceInfo.service_type,
        serviceMessage: serviceInfo.regexp_replace,
      });
    });
    changedAfterSvcInfor = {
      // 旅程区分
      itineraryDivision: serviceCondition.itineraryDivision,
      serviceTypeList: serviceTypeList,
    };
    return changedAfterSvcInfor;
  }

  /**
   * ACV特性案内文言キーを取得する(関連キャッシュ名: AircraftCabin_I18nJoin_ByPk)
   *
   * @param acv ACV
   * @param cabin キャビンクラス
   * @returns ACV特性案内文言キー
   */
  public getAcvCharacteristicMessageKey(acv: string, cabin: string): string {
    const key = this._aircraftCabinByPk?.[acv]?.[cabin]?.[0]?.acv_characteristic_message_key;
    return key || '';
  }

  /**
   * ACVに設定されたキャビンクラスを取得する(関連キャッシュ名: AircraftCabin_I18nJoin_ByPk)
   *
   * @param acv ACV
   * @returns キャビンクラスリスト
   */
  public getAcvCabin(acv: string, tripType: string): string {
    const cabinList: Array<string> = [];
    const mAircraftCabin = this._aircraftCabinByPk;
    if (mAircraftCabin?.[acv]) {
      Object.keys(mAircraftCabin[acv]).forEach((cabin: string) => {
        cabinList.push(
          this._translateSvc.instant(
            `${TranslatePrefix.LIST_DATA}PD_930_R-${tripType}-${mAircraftCabin[acv]?.[cabin]?.[0]?.cabin}`
          )
        );
      });
    }
    return cabinList.join(',');
  }

  /**
   * マルチエアポート区分種類を取得する(関連キャッシュ名: Airport_All)
   *
   * @param locationCode 出発空港コード
   * @param isSearchFor 照会用空港コード`フラグ
   * @returns マルチエアポート区分
   */
  public getMultiAirportType(locationCode: string, isSearchFor: boolean = false): string {
    let multiAirportType = '';
    const airportInfo = this._airportAll.find((info: any) => {
      if (isSearchFor) {
        return info.search_for_airport_code === locationCode;
      } else {
        return info.airport_code === locationCode;
      }
    });
    if (airportInfo) {
      multiAirportType = airportInfo.multi_airport_type;
    }
    return multiAirportType;
  }

  /**
   * 出発空港名称を取得する(関連キャッシュ名:Airport_All)
   *
   * @param translateKeyPrefix 空港文言キーprefix
   * @param code 出発空港コード
   * @param originName 出発空港名称
   * @returns 出発空港名称
   */
  public getAirportName(code?: string, originName?: string | number): string {
    return this.checkAirportCodeValid(code)
      ? this._translateSvc.instant(`${TranslatePrefix.AIRPORT}${code}`)
      : originName;
  }

  /**
   * 運航航空会社名を取得する(関連キャッシュ名:Airport_All)
   *
   * @param airlineCode 運航キャリアコード
   * @param airlineName DxAPIの運航航空会社名
   * @returns 運航航空会社名
   */
  public getAirlineName(airlineCode?: string, airlineName?: string | number): string {
    return this.checkAirlineCodeValid(airlineCode)
      ? this._translateSvc.instant(`${TranslatePrefix.AIRLINE}${airlineCode}`)
      : airlineName;
  }

  /**
   * 空港コード有効判断(関連キャッシュ名:Airport_All)
   *
   * @param code 出発空港コード
   * @returns 空港コード有効かどうか(有効:true)
   */
  public checkAirportCodeValid(code?: string): boolean {
    const airportInfo = this._airportAll.find((info: any) => {
      return info.airport_code === code;
    });
    return !!airportInfo;
  }

  /**
   * キャリアコード有効判断(関連キャッシュ名:Airport_All)
   *
   * @param code 出発空港コード
   * @returns 空港コード有効かどうか(有効:true)
   */
  public checkAirlineCodeValid(code?: string): boolean {
    const airlineInfo = Object.keys(this._airlineAirlineCode).find((airlineCode: string) => {
      return airlineCode === code;
    });
    return !!airlineInfo;
  }

  /**
   * システム日時により、運航キャリア名称を取得する(関連キャッシュ名: Airline_I18nJoin_ByAirlineCode)
   *
   * @param airlineCode 運航キャリアコード
   * @param airlineName DxAPIの運航航空会社名
   * @returns 運航キャリア名称
   */
  public getInTimeCarrierName(airlineCode: string, airlineName: string): string {
    const nowDate = this._systemDateSvc.getFormattedSystemDate(DATE_FORMAT.YMD);
    const airLineCodeInfo = this._airlineAirlineCode;
    if (
      airLineCodeInfo?.[airlineCode] &&
      Number(nowDate) >= Number(airLineCodeInfo?.[airlineCode]?.[0]?.apply_from_date) &&
      Number(nowDate) <= Number(airLineCodeInfo?.[airlineCode]?.[0]?.apply_to_date)
    ) {
      return this._translateSvc.instant(`${TranslatePrefix.AIRLINE}${airlineCode}`);
    } else {
      return airlineName;
    }
  }

  /**
   * システム日時により、運航キャリア名称のリンクを取得する(関連キャッシュ名: Airline_I18nJoin_ByAirlineCode)
   *
   * @param airlineCode 運航キャリアコード
   * @returns 運航キャリア名称のリンク
   */
  public getInTimeAirlineLink(airlineCode: string): string {
    let airLineLink = '';
    const nowDate = this._systemDateSvc.getFormattedSystemDate(DATE_FORMAT.YMD);
    const airLineCodeInfo = this._airlineAirlineCode;
    if (
      airLineCodeInfo?.[airlineCode] &&
      Number(nowDate) >= Number(airLineCodeInfo?.[airlineCode]?.[0]?.apply_from_date) &&
      Number(nowDate) <= Number(airLineCodeInfo?.[airlineCode]?.[0]?.apply_to_date)
    ) {
      airLineLink = airLineCodeInfo?.[airlineCode]?.[0]?.operating_airline_url;
    }
    return airLineLink;
  }

  /**
   * NHグループ以外の運航キャリア名称が区切り文字「,」（半角カンマ）で連結される
   *
   * @param operatingAirlinesArray 運航キャリア情報
   * @returns カンマで連結された運航キャリア名称
   */
  public contactOperatingAirlinesName(operatingAirlinesArray?: OperatingAirlineType[]): string {
    let array: string[] = [];
    operatingAirlinesArray?.forEach((operatingAirline) => {
      array.push(operatingAirline.name.operatingName);
    });
    return array.join(',');
  }

  /**
   * キャビンクラス情報を作成する。(関連キャッシュ名: Cff_RevenueCffList)
   *
   * @returns キャビンクラス情報
   */
  public getCabinClassList(): CabinClassList[] {
    let cabinClassList: Array<CabinClassList> = [];
    const posCountryCode = this._aswContextSvc.aswContextData.posCountryCode;
    // ユーザ共通.POS国コード(2レター)＝"JP"(日本)
    if (posCountryCode === 'JP') {
      const cffRevenueCff = this._cffListEveryLang?.filter(
        (element: any) =>
          element['parent_main_cff'] === '' &&
          element['commercial_fare_family_type'] === '2' &&
          element['fare_option_type'] !== '9'
      );
      this._addCabinClassListHandle(cffRevenueCff, cabinClassList);
    } else if (posCountryCode !== 'JP') {
      const cffRevenueCff = this._cffListEveryLang?.filter(
        (element: any) =>
          element['parent_main_cff'] === '' &&
          element['commercial_fare_family_type'] === '4' &&
          element['fare_option_type'] !== '9'
      );
      this._addCabinClassListHandle(cffRevenueCff, cabinClassList);
    }
    return cabinClassList;
  }

  /**
   * キャビンクラス情報の処理
   */
  private _addCabinClassListHandle(elements: any, cabinClassList: CabinClassList[]) {
    elements.forEach((element: any) => {
      let aCabinClass = cabinClassList.find((a) => {
        return a.cabinClass === element['cabin'];
      });
      if (!aCabinClass) {
        cabinClassList.push({
          codes: [element['commercial_fare_family_code']],
          cabinClass: element['cabin'],
          label: element['cabin_name'],
        });
      } else {
        if (!aCabinClass.codes?.includes(element['commercial_fare_family_code'])) {
          aCabinClass.codes?.push(element['commercial_fare_family_code']);
        }
      }
    });
  }

  /**
   * 運賃オプションリストを作成する(関連キャッシュ名: Cff_RevenueCffList)
   *
   * @param type 運賃オプションリスト作成タイプ区別(1:change-flight-search,2:change-flight-availability-international)
   * @returns 運賃オプションリスト
   */
  public getFareOptionList(type: string) {
    let cffFareOptinList: FareOptionList[] = [];
    this._cffListEveryLang?.forEach((element: any) => {
      if (type === '1') {
        cffFareOptinList.push({
          fareOptionType: element['fare_option_type'],
          fareOptionValue: element['fare_option_type_name'],
        });
      } else {
        cffFareOptinList.push({
          fareOptionType: element['fare_option_type'],
          fareOptionValue: {
            PD_940: this._translateSvc.instant(`${TranslatePrefix.LIST_DATA}PD_940_${element['fare_option_type']}`),
            PD_003: this._translateSvc.instant(`${TranslatePrefix.LIST_DATA}PD_003_${element['fare_option_type']}`),
          },
        });
      }
    });
    const fareOptionList = cffFareOptinList.filter((obj, index, self) => {
      return index === self.findIndex((o) => o.fareOptionType === obj.fareOptionType);
    });
    return fareOptionList;
  }

  /**
   * 運賃名称ラジオボタンリストを設定する
   * @param airBoundExchangeGroups Travel SolutionとAir Bound情報
   * @param fareFamilies
   */
  public getFareNameList(
    airBoundExchangeGroups?: RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner[],
    fareFamilies?: RoundtripFppItemFareFamilyDataTypeInner[]
  ) {
    let fareNameInfo: any[] = [];
    airBoundExchangeGroups?.forEach((element) => {
      fareFamilies?.forEach((fareFamily) => {
        if (element[fareFamily.fareFamilyCode]) {
          fareNameInfo.push({
            fareCode: element[fareFamily.fareFamilyCode].priorityCode,
            fareName: this._staticMsgSvc.transform(
              'm_ff_priority_code_i18n_' + element[fareFamily.fareFamilyCode].priorityCode
            ),
            value: false,
          });
        }
      });
    });
    // 運賃名称ラジオボタンリストを運賃名称ラジオボタンリスト.FF Priority Codeの重複を削除し、
    fareNameInfo = Array.from(new Set(fareNameInfo.map((item) => JSON.stringify(item)))).map((item) =>
      JSON.parse(item)
    );
    // 運賃名称ラジオボタンリスト.表示順の昇順でソートする(ソート処理にはJavaScriptのソート関数を使用する。)
    fareNameInfo.sort((a, b) => {
      if (a.fareCode > b.fareCode) {
        return 1;
      } else if (a.fareCode < b.fareCode) {
        return -1;
      } else {
        return 0;
      }
    });
    return fareNameInfo;
  }

  /**
   * Safe Travelウィジェット機能有効フラグを取得する(関連キャッシュ名: Property_ForAkamaiCache)
   *
   * @returns Safe Travelウィジェット機能有効フラグ
   */
  public getSafeTravelWidget() {
    const safeTravelWidget =
      this._aswMasterSvc.getMPropertyByKey('application', 'safeTravelWidget').toLowerCase() === 'true';
    return safeTravelWidget;
  }

  /**
   * キャビンに基づいて表示されているラベルを取得する(関連キャッシュ名: Cff_RevenueCffList)
   *
   * @param code キャビンクラスコード
   * @returns 表示ラベル
   */
  public getCabinLabel(cabinCode: string): string {
    let cabinLabel = '';
    const cffInfo = this._cffListEveryLang?.find((info: any) => {
      return info['commercial_fare_family_code'] === cabinCode;
    });
    if (cffInfo) {
      cabinLabel = cffInfo['cabin_name'];
    }
    return cabinLabel;
  }

  /**
   * priorityCodeに紐づくFF Priority Code.国内用FF URLを取得する
   */
  public getFFUrlByPriorityCode(code: string): string {
    const ffUrl = this._ffPriorityCode?.[code.toString()]?.[0]?.['domestic_ff_url'];
    return ffUrl || '';
  }

  /** CFF_LISTEVERYLANG値 */
  private get _cffListEveryLang(): any {
    return this._getMasterData(MasterStoreKey.CFF_LISTEVERYLANG);
    //return this._getMasterData(MasterStoreKey.CFF_REVENUECFFLISTEVERYLANG);
  }

  /** 空港_全リスト値 */
  private get _airportAll() {
    return this._getMasterData(MasterStoreKey.Airport_All);
  }

  /** 航空会社_キャリアコード指定・適用中データ */
  private get _airlineAirlineCode() {
    return this._getMasterData(MasterStoreKey.AIRLINE_I18NJOIN_BYAIRLINECODE);
  }

  /** キャビンクラス別機材情報_ ACV・キャビンクラス指定・全データ（PKで検索） */
  private get _aircraftCabinByPk() {
    return this._getMasterData(MasterStoreKey.AIRCRAFTCABIN_I18NJOIN_BYPK);
  }

  /** FF Priority Code情報 */
  private get _ffPriorityCode() {
    return this._getMasterData(MasterStoreKey.FFPRIORITYCODE_I18NJOIN_BYFFPRIORITYCODE);
  }

  /**
   * Master値取得の共通方法
   *
   * @param masterKey Masterキー
   * @returns 取得されたMaster値
   */
  private _getMasterData(masterKey: string): any {
    return this._aswMasterSvc.aswMaster?.[masterKey];
  }
}
