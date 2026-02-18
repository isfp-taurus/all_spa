import { formatDate } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { SysdateApiService, Type } from 'src/sdk-sysdate';
import {
  NotRetryableErrorStore,
  SysdateStore,
  selectSysdateIsFailureStatus,
  selectSysdateState,
  setNotRetryableError,
  setSysdateFromApi,
} from '../../store';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { ApiErrorResponseModel, ErrorType, MOffice } from '../../interfaces';
import { ApiErrorResponseService } from '../api-error-response/api-error-response.service';
import { AswMasterService } from '../asw-master/asw-master.service';
import { MasterStoreKey } from '@conf/asw-master.config';
import { environment } from '@env/environment';
import { LoggerDatadogService } from '../logger-datadog/logger-datadog.service';

/**
 * システム日付取得Service
 */
@Injectable({
  providedIn: 'root',
})
export class SystemDateService {
  /**
   * デフォルトの日時フォーマット(例：YYYY/MM/DD HH24:MI)
   *
   * @see {@link https://angular.io/api/common/DatePipe}
   */
  private _defaultDateFormat = 'yyyy/MM/dd HH:mm';

  /** サーバ時刻取得時点のクライアント時刻 */
  private _localTimeStart?: number;

  /** サーバ時刻とクライアント時刻の差 */
  private _timeDiff: number = 0;

  /** サーバ時刻（yyyyMMddHHmmss） */
  private _systemDate$: Observable<Type>;

  /** API呼び出し失敗判定フラグ */
  private _isFailure$: Observable<boolean>;

  /** APIエラーレスポンス */
  private _apiErrorRes$: Observable<ApiErrorResponseModel | null>;

  public constructor(
    private _store: Store<SysdateStore | NotRetryableErrorStore>,
    @Inject(LOCALE_ID) private _localeId: string,
    private _sysDateSvc: SysdateApiService,
    private _apiErrorResSvc: ApiErrorResponseService,
    private _aswMasterSvc: AswMasterService,
    private _loggerSvc: LoggerDatadogService
  ) {
    this._systemDate$ = this._store.pipe(
      select(selectSysdateState),
      map((data) => data.model),
      filter((data): data is Type => !!data),
      take(1)
    );
    this._isFailure$ = this._store.pipe(
      select(selectSysdateIsFailureStatus),
      filter((isFailure) => isFailure),
      take(1)
    );
    this._apiErrorRes$ = this._apiErrorResSvc.getApiErrorResponse$().pipe(
      filter((data) => !!data),
      take(1)
    );
  }

  /**
   * 初期化処理
   */
  public init() {
    if (environment.envName === 'local') {
      return;
    }
    // 日付返却API（sysdate eapi）を利用してサーバ時刻を取得し、クライアント時刻との差を計算する
    const call = this._sysDateSvc.sysdateGet();
    this._store.dispatch(setSysdateFromApi({ call }));
    this._systemDate$.subscribe((sysdate) => {
      const _sysdate = sysdate.systemDate;
      const year = parseInt(_sysdate.substring(0, 4));
      const month = parseInt(_sysdate.substring(4, 6));
      const day = parseInt(_sysdate.substring(6, 8));
      const hour = parseInt(_sysdate.substring(8, 10));
      const min = parseInt(_sysdate.substring(10, 12));
      const second = parseInt(_sysdate.substring(12));

      const systemDateForApi = new Date(year, month - 1, day, hour, min, second).getTime();
      this._localTimeStart = new Date().getTime();
      this._timeDiff = systemDateForApi - this._localTimeStart;
    });

    // APIからエラーのHTTPステータスコードが回答された場合、NotRetryableErrorStoreに以下の情報を設定する
    this._isFailure$
      .pipe(
        switchMap(() => {
          return this._apiErrorRes$;
        })
      )
      .subscribe((error) => {
        this._store.dispatch(
          setNotRetryableError({
            errorType: ErrorType.SYSTEM,
            apiErrorCode: error?.['error']?.['errorCode']?.[0],
          })
        );
      });
  }

  /**
   * システム時間（JST）取得
   *
   * @returns
   */
  public getSystemDate(): Date {
    return new Date(new Date().getTime() + this._timeDiff);
  }

  /**
   * システム時間（JST）取得（フォーマット指定）
   *
   * @param dateFormat 日付フォーマット (https://angular.io/api/common/DatePipe)
   * @returns
   */
  public getFormattedSystemDate(dateFormat?: string): string {
    return formatDate(this.getSystemDate(), dateFormat || this._defaultDateFormat, this._localeId);
  }

  /**
   * 空港現地時間取得（操作オフィスコードをもとに）
   *
   * @param pointOfSaleId 操作オフィスコード
   * @returns 空港現地時間（サマータイム考慮あり）
   */
  public getAirportLocalDate(pointOfSaleId: string): Date {
    // 操作オフィスコードに該当するタイムゾーン空港コードを取得する
    // 取得できない場合、システム時間（JST）を返却する
    const officeAll: MOffice[] = this._aswMasterSvc.aswMaster?.[MasterStoreKey.OFFICE_ALL] || [];
    let timeZoneAirportCode = '';
    if (officeAll.length > 0) {
      timeZoneAirportCode =
        officeAll.find((office) => office.office_code === pointOfSaleId)?.time_zone_airport_code || '';
    }
    if (!timeZoneAirportCode) {
      return this.getSystemDate();
    }

    // タイムゾーン空港コードをもとに空港現地時間を取得
    return this.getAirportLocalDateByAirportCode(timeZoneAirportCode);
  }

  /**
   * 空港現地時間取得（空港コードをもとに）
   *
   * @param airportCode 空港コード
   * @returns 空港現地時間（サマータイム考慮あり）
   */
  public getAirportLocalDateByAirportCode(airportCode: string): Date {
    // システム時間（JST）のUTC時間を取得する
    // （システム時間（JST）はGMT+0900のため、UTC時間はシステム時間（JST）からマイナス9時間になる）
    const systemDate = this.getSystemDate();
    const utcDate = new Date(systemDate.getTime() - 9 * 60 * 60 * 1000);

    // 空港の時差マスタから空港コードに該当する空港時差情報リストを取得する
    // （サマータイム開始日時単位のリスト）
    // 取得できない場合、システム時間（JST）を返却する
    const airportTimeDiffList: AirportTimeDiffByAirportData[] =
      this._aswMasterSvc.aswMaster?.[MasterStoreKey.AIRPORT_TIMEDIFF][airportCode] || [];
    if (airportTimeDiffList.length === 0) {
      // 空港コードに該当するデータが取得できないか空だった場合、運用確認ログを出力する
      this._loggerSvc.operationConfirmLog('MST0003', { 0: MasterStoreKey.AIRPORT_TIMEDIFF, 1: airportCode });
      return systemDate;
    }

    // 現地時間（サマータイム考慮なし）を取得する
    // 空港時差情報リストの標準時差は空港ごとに差異がないことを想定し、1件目の値を標準時差とする
    let localDate = new Date(utcDate.getTime() + airportTimeDiffList[0].time_diff);

    // サマータイムの繰り上げ時間を取得する
    const summerTimeDiff = this._getSummerTimeDiff(airportTimeDiffList, localDate);

    // 現地時間（サマータイム考慮なし）にサマータイムを適用する
    localDate.setMilliseconds(localDate.getMilliseconds() + summerTimeDiff);

    return localDate;
  }

  /**
   * サマータイムの繰り上げ時間を取得する
   *
   * @param airportTimeDiffList 空港時差マスタ
   * @param localDate 現地時間（サマータイム考慮なし）
   * @returns サマータイムの繰り上げ時間（ミリ秒）
   */
  private _getSummerTimeDiff(airportTimeDiffList: AirportTimeDiffByAirportData[], localDate: Date): number {
    // サマータイムの繰り上げ時間（ミリ秒）
    let diffTime = 0;

    // 現地時間（サマータイム考慮なし）を「YYYYMMDDhhmmss」形式に変換する
    // （サマータイム開始/終了日時はキャッシュ上「YYYYMMDDhhmmss」形式で登録されるため）
    const pad2 = (n: number) => {
      return n < 10 ? '0' + n : n;
    };
    const localDateFormatted = +`${localDate.getFullYear()}${pad2(localDate.getMonth() + 1)}${pad2(
      localDate.getDate()
    )}${pad2(localDate.getHours())}${pad2(localDate.getMinutes())}${pad2(localDate.getSeconds())}`;

    for (const airportTimeDiff of airportTimeDiffList) {
      const fromDate = +airportTimeDiff.apply_summertime_from_date;
      // サマータイム開始日時 > 現地時間（サマータイム考慮なし）の場合、以降の処理をスキップする
      if (fromDate > localDateFormatted) {
        break;
      }

      const toDate = +airportTimeDiff.apply_summertime_to_date;
      // サマータイム終了日時が存在し、かつサマータイム終了日時 > 現地時間（サマータイム考慮なし）の場合、サマータイムの繰り上げ時間を設定
      if (airportTimeDiff.apply_summertime_to_date && toDate > localDateFormatted) {
        diffTime = airportTimeDiff.summertime_diff;
        break;
      }
    }

    return diffTime;
  }
}

/**
 * 空港別時差マスタから空港コードで検索したキャッシュの型
 */
interface AirportTimeDiffByAirportData {
  apply_summertime_from_date: string;
  apply_summertime_to_date: string;
  time_diff: number;
  summertime_diff: number;
}
