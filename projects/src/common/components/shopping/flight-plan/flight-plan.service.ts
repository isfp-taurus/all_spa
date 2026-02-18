import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { AswMasterService, CommonLibService, LoggerDatadogService, SystemDateService } from '@lib/services';
import { MasterStoreKey, MASTER_TABLE } from '@conf/asw-master.config';
import { Bound } from 'src/sdk-search';
import {
  AcvItem,
  FlightSummary,
} from '@app/roundtrip-flight-availability-international/presenter/roundtrip-flight-availability-international-pres.state';
import { Subject } from 'rxjs/internal/Subject';
import { M_AIRCRAFT_CABIN, M_AIRCRAFT_CABIN_MAPS } from '@common/interfaces/common/m_aircraft_cabin.interface';
import { M_AIRLINE, M_AIRLINES } from '@common/interfaces/common/m_airline.interface';
import { RoundtripFlightAvailabilityInternationalService } from '@common/services/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.service';
import { RoundtripFlightAvailabilityInternationalState } from '@common/store/roundtripFlightAvailabilityInternational';
import { M_AIRPORT } from '@common/interfaces/common/m_airport.interface';
import { AirportI18nJoinByAirportCodeCache } from '@common/services/shopping/shopping-lib/shopping-lib.state';
import { RoundtripFlightAvailabilityInternationalPresService } from '@app/roundtrip-flight-availability-international/presenter/roundtrip-flight-availability-international-pres.service';
import { DcsDateService } from '@common/services';
import { AppConstants } from '@conf/app.constants';

@Injectable()
export class FlightPlanService extends SupportClass {
  public appConstants = AppConstants;

  // キャビンクラス別機材情報のキャッシューデータ取得
  private aircraftCabinAkamai: M_AIRCRAFT_CABIN_MAPS = {};
  // 空港情報キャッシューデータ取得
  private airportAkamai: AirportI18nJoinByAirportCodeCache = {};
  // キャリアマスト情報のキャッシューデータ取得
  private airlineListAkamai: M_AIRLINES = {};
  // キャリア名称のキャッシューデータ取得
  private airlineI18nAkamai: M_AIRLINES = {};
  // 空港のキャッシューデータ取得
  private airportAllAkamai = [];
  /** 往復空席照会結果(国際)画面のStore */
  private _R01P030Store: RoundtripFlightAvailabilityInternationalState = {};

  constructor(
    private _common: CommonLibService,
    private _aswMasterSvc: AswMasterService,
    private _roundtripFlightAvailabilityInternationalService: RoundtripFlightAvailabilityInternationalService,
    private _systemDateSvc: SystemDateService,
    private _roundtripInternationalPresService: RoundtripFlightAvailabilityInternationalPresService,
    private _loggerSvc: LoggerDatadogService,
    private _dcsDateService: DcsDateService
  ) {
    super();
    this._subject = new Subject<string[]>();
  }

  destroy(): void {}

  private _subject!: Subject<string[]>;
  public asObservableSubject() {
    return this._subject.asObservable();
  }
  /**
   * 運航キャリア名称リスト作成処理
   * @param bound
   */
  public getOperatingAirlineNameList(bound: Bound) {
    this.airlineListAkamai = this._aswMasterSvc.aswMaster[MasterStoreKey.AIRLINE_I18N_JOINALL] || {};
    this.airlineI18nAkamai = this._aswMasterSvc.aswMaster[MasterStoreKey.AIRLINE_I18N_JOINALL] || {};
    let operatingAirlineNameList: string[] = [];
    let operationDate = this._systemDateSvc.getSystemDate().toISOString().slice(0, 10).split('-').join('');
    bound.operatingAirlines?.map((tmp) => {
      if (tmp.airlineCode === '' || tmp.airlineCode === undefined) {
        operatingAirlineNameList.push('|' + tmp.airlineName ?? '');
      } else if (tmp.airlineCode !== this.appConstants.CARRIER.TWO_LETTER) {
        let airlineLists = this.airlineListAkamai[tmp.airlineCode];
        if (airlineLists && airlineLists.length > 0) {
          airlineLists = airlineLists.filter(
            (list) => list.apply_from_date <= operationDate && operationDate <= list.apply_to_date
          );
          airlineLists.forEach((data: M_AIRLINE) => {
            if (data.airline_code === tmp.airlineCode) {
              if (!this.airlineI18nAkamai[data.airline_code]) {
                // キャリアコードに該当するデータが取得できないか空だった場合、運用確認ログを出力する
                this._loggerSvc.operationConfirmLog('MST0003', {
                  0: MASTER_TABLE.AIRLINE_I18NJOINALL.fileName,
                  1: data.airline_code,
                });
              }
              if (data.operating_airline_url) {
                let airlines = this.airlineI18nAkamai[data.airline_code];
                for (let i = 0; i < airlines.length; i++) {
                  if (airlines[i].airline_code === data.airline_code) {
                    operatingAirlineNameList.push(data.operating_airline_url + '|' + airlines[i].airline_name);
                    break;
                  }
                }
              } else {
                let airlines = this.airlineI18nAkamai[data.airline_code];
                for (let i = 0; i < airlines.length; i++) {
                  if (airlines[i].airline_code === data.airline_code) {
                    operatingAirlineNameList.push('|' + airlines[i].airline_name);
                    break;
                  }
                }
              }
            } else {
              operatingAirlineNameList.push('|' + tmp.airlineName ?? '');
            }
          });
        } else {
          operatingAirlineNameList.push('|' + tmp.airlineName ?? '');
          // 運航キャリアコードに該当するデータが取得できないか空だった場合、運用確認ログを出力する
          this._loggerSvc.operationConfirmLog('MST0003', {
            0: MASTER_TABLE.AIRLINE_I18NJOINALL.fileName,
            1: tmp.airlineCode,
          });
        }
      }
    });
    return operatingAirlineNameList;
  }

  /**
   * フライトサマリ描写処理
   *
   * @param bound 旅程中のバウンド情報
   * @param boundIndex バウンドインデックス
   * @param fareFamilyInTsList TS別FF情報リスト
   * @param flightDetailList フライト詳細リスト
   */
  public getFlightSummary(bound: Bound, boundIndex: number) {
    this.aircraftCabinAkamai = this._aswMasterSvc.aswMaster[MasterStoreKey.AIRCRAFTCABIN_I18NJOIN_BYPK];
    // フライトサマリで空港コードのみなのでJoinByAirportCode
    this.airportAkamai = this._aswMasterSvc.aswMaster[MASTER_TABLE.AIRPORT_I18N_JOIN_BY_AIRPORT_CODE.key];
    this.airportAllAkamai = this._aswMasterSvc.aswMaster[MasterStoreKey.Airport_All];
    // 往復画面のstore取得
    this._R01P030Store =
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData;
    // マルチエアポートであるかどうか判定
    // 検索条件の出発地
    const originLocationCode = this._R01P030Store?.roundtripOwdRequest?.itineraries[boundIndex].originLocationCode;
    // 検索条件の到着地
    const destinationLocationCode =
      this._R01P030Store?.roundtripOwdRequest?.itineraries[boundIndex].destinationLocationCode;

    // 出発地がマルチエアポート判定フラグ
    const departureMultiAirportFlg = this.airportAllAkamai.some((mAirportAll: M_AIRPORT) => {
      return mAirportAll.search_for_airport_code === originLocationCode && mAirportAll.multi_airport_type === '2';
    });
    // 到着地がマルチエアポート判定フラグ
    const arrivalMultiAirportFlg = this.airportAllAkamai.some((mAirportAll: M_AIRPORT) => {
      return mAirportAll.search_for_airport_code === destinationLocationCode && mAirportAll.multi_airport_type === '2';
    });

    // 空港名取得処理
    let departureAirport = '';
    let arrivalAirport = '';
    if (
      bound.originLocationCode &&
      this.airportAkamai[bound.originLocationCode] &&
      this.airportAkamai[bound.originLocationCode].length !== 0
    ) {
      let departureAirports = this.airportAkamai[bound.originLocationCode];
      for (let i = 0; i < departureAirports.length; i++) {
        if (departureAirports[i].airport_code === bound.originLocationCode) {
          departureAirport = departureAirports[i].airport_name;
          break;
        }
      }
    } else {
      // 空港コードに該当するデータが取得できないか空だった場合、運用確認ログを出力する
      this._loggerSvc.operationConfirmLog('MST0003', {
        0: MASTER_TABLE.AIRPORT_I18N_JOIN_BY_AIRPORT_CODE.fileName,
        1: bound.originLocationCode ?? '',
      });
    }

    if (
      bound.destinationLocationCode &&
      this.airportAkamai[bound.destinationLocationCode] &&
      this.airportAkamai[bound.destinationLocationCode].length !== 0
    ) {
      let arrivalAirports = this.airportAkamai[bound.destinationLocationCode];
      for (let i = 0; i < arrivalAirports.length; i++) {
        if (arrivalAirports[i].airport_code === bound.destinationLocationCode) {
          arrivalAirport = arrivalAirports[i].airport_name;
          break;
        }
      }
    } else {
      // 空港コードに該当するデータが取得できないか空だった場合、運用確認ログを出力する
      this._loggerSvc.operationConfirmLog('MST0003', {
        0: MASTER_TABLE.AIRPORT_I18N_JOIN_BY_AIRPORT_CODE.fileName,
        1: bound.destinationLocationCode ?? '',
      });
    }

    const durationTime = bound.duration != null ? String(bound.duration) : '';
    const destinationArrivalDateTime = bound.destinationArrivalDateTime ?? '';
    const destinationArrivalEstimatedDateTime = bound.destinationArrivalEstimatedDateTime ?? undefined;
    const destinationArrivalDaysDifference = bound.destinationArrivalDaysDifference?.toString() ?? '';
    const isAllNhGroupOperated = bound.isAllNhGroupOperated ?? false;
    const isAllStarAllianceOperated = bound.isAllStarAllianceOperated ?? false;
    // 深夜出発日時表示設定
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    let isLateNightDeparture = false;
    if (bound.flights && bound.flights[0]?.isLateNightDeparture && (lang === 'ja' || lang === 'cn' || lang === 'ko')) {
      isLateNightDeparture = true;
    }
    // ACVに応じたラベル、または画像のリスト
    let labelFromAcvList: AcvItem[] = [];
    bound.flights?.map((flight) => {
      if (flight.aircraftConfigurationVersion) {
        let requestCabinClass = this._R01P030Store?.roundtripOwdRequest?.fare?.cabinClass;
        if (
          this.aircraftCabinAkamai &&
          this.aircraftCabinAkamai[flight.aircraftConfigurationVersion] &&
          this.aircraftCabinAkamai[flight.aircraftConfigurationVersion][requestCabinClass ?? '']
        ) {
          let acvLabels = this.aircraftCabinAkamai[flight.aircraftConfigurationVersion][requestCabinClass ?? ''];
          acvLabels.forEach((aircraftCabin: M_AIRCRAFT_CABIN) => {
            // ユーザ共通.POS国コード="MX"(メキシコ)、かつカウチ対象便ACVコードリストに
            // 当該TS.flights.aircraftConfigurationVersionが含まれる場合、ACVリストへの追加は行わない
            let isContain: boolean = false;
            if (this._common.aswContextStoreService.aswContextData.posCountryCode === 'MX') {
              this._R01P030Store.couchAcvCodeList?.forEach((couchAcvCode: string) => {
                if (flight.aircraftConfigurationVersion) {
                  if (couchAcvCode.includes(flight.aircraftConfigurationVersion)) {
                    isContain = true;
                  }
                }
              });
            }
            if (
              !isContain &&
              aircraftCabin.acv === flight.aircraftConfigurationVersion &&
              aircraftCabin.cabin === requestCabinClass &&
              aircraftCabin.acv_characteristic_message_key
            ) {
              const acvKey = aircraftCabin.acv_characteristic_message_key;
              const result = this._roundtripInternationalPresService.convertToAcvItem(acvKey);
              labelFromAcvList.push(result);
            }
          });
        } else if (this._dcsDateService.isAfterDcs(flight.departure?.dateTime ?? '') || !flight.isJapanDomesticFlight) {
          // ACVに該当するデータが取得できないか空だった場合、運用確認ログを出力する
          this._loggerSvc.operationConfirmLog('MST0003', {
            0: MASTER_TABLE.AIRCRAFTCABIN_I18NJOIN_BYPK.fileName,
            1: flight.aircraftConfigurationVersion,
          });
        }
      }
    });
    // フライトサマリ
    const flightSummary: FlightSummary = {
      boundIndex: boundIndex,
      travelSolutionId: bound.travelSolutionId ?? '',
      isSelected: false,
      // 出発地
      departureAirport: departureAirport !== '' ? departureAirport : bound.originLocationName!,
      // 到着地
      arrivalAirport: arrivalAirport !== '' ? arrivalAirport : bound.destinationLocationName!,
      // 遅延情報
      isContainedDelayedFlight: bound.isContainedDelayedFlight ?? false,
      // 早発情報
      isContainedEarlyDepartureFlight: bound.isContainedEarlyDepartureFlight ?? false,
      // 出発時刻
      originDepartureDateTime: bound.originDepartureDateTime ?? '',
      // 最新出発時刻
      originDepartureEstimatedDateTime: bound.originDepartureEstimatedDateTime ?? '',
      // 深夜出発日時
      isLateNightDeparture: isLateNightDeparture,
      // 乗継回数
      numberOfConnections: bound.numberOfConnections ?? 0,
      // 所要時間
      durationTime: durationTime,
      // 到着時間
      destinationArrivalDateTime: destinationArrivalDateTime ?? '',
      // 最新到着時間
      destinationArrivalEstimatedDateTime: destinationArrivalEstimatedDateTime ?? '',
      // 到着日付差
      destinationArrivalDaysDifference: destinationArrivalDaysDifference,
      // 運航キャリア識別
      isAllNhGroupOperated: isAllNhGroupOperated,
      isAllStarAllianceOperated: isAllStarAllianceOperated,
      // 運航キャリア名称
      operatingAirlineNameList: this.getOperatingAirlineNameList(bound),
      // 政府認可申請中情報
      isContainedSubjectToGovernmentApproval: bound.isContainedSubjectToGovernmentApproval ?? false,
      labelFromAcvList: labelFromAcvList,
      // Wi-Fiサービス
      wifiType: bound.wiFiType,
      lowestPrice: 0,
      departureMultiAirportFlg: departureMultiAirportFlg,
      arrivalMultiAirportFlg: arrivalMultiAirportFlg,
    };

    return flightSummary;
  }

  /** 数値型の秒を時分表記(XhXXmin)の文字列に変換する */
  private convertSecondToHourSecond(second: number): string {
    return String(Math.floor(second / 3600)) + 'h' + (String(Math.floor((second % 3600) / 60)) + 'min');
  }
}
