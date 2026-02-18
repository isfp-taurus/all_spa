import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { MasterStoreKey } from '@conf/asw-master.config';
import { take } from 'rxjs/operators';
import { ComplexFlightAvailabilityStoreService } from './store.service';
import { TripType } from '@common/store/search-flight';
import { CommonLibService } from '@lib/services';
import { ComplexFlightAvailabilityUntilService } from './utils.service';
import { UtilInterface } from './utils.state';

/**
 * ObjectのKEYが合わない場合は、処理のクラス
 */
@Injectable()
export class DataAdapterService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _storeService: ComplexFlightAvailabilityStoreService,
    private _untilService: ComplexFlightAvailabilityUntilService
  ) {
    super();
  }

  // 終わる処理
  destroy() {}

  /**
   * duration設定
   * @param {number} second
   * @returns {string}
   */
  public convertSecondToHourSecond(second: number): string {
    const date = new Date();
    const yyyy = date.getFullYear();
    const MM = `0${date.getMonth().toString()}`.slice(-2);
    const dd = `0${date.getDate().toString()}`.slice(-2);
    const hh = `0${String(Math.floor(second / 3600))}`.slice(-2);
    const mm = `0${String(Math.floor((second % 3600) / 60))}`.slice(-2);
    const sec = '00';
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${sec}`;
  }

  /**
   * Property_ForAkamaiCache.jsonのデータを取得
   * @return {[key:string]:any} Property_ForAkamaiCache.jsonの型を参照
   */
  protected async getAkaMaiCacheData(): Promise<{ [key: string]: any }> {
    return new Promise((resolve, _) => {
      this._common.aswMasterService
        .getAswMasterByKey$(MasterStoreKey.PROPERTY)
        .pipe(take(1))
        .subscribe((state: { [key: string]: any } | PromiseLike<{ [key: string]: any }>) => {
          resolve(state);
        });
    });
  }

  /**
   * tripTypeは数字を文字に転換
   * @param {TripType} 基本的に数字のタイプ
   * @returns {('roundtrip' | 'onewayOrMulticity')}
   */
  protected getTripTypeByNumber(tripType: TripType): 'roundtrip' | 'onewayOrMulticity' {
    if (tripType === 1) return 'onewayOrMulticity';
    return 'roundtrip';
  }

  // durationをdurationTimeに変換
  protected async convertDuration2DurationTime(duration: number): Promise<string> {
    const _timeConvert = (second: number): string =>
      String(Math.floor(second / 3600)) + 'h' + (String(Math.floor((second % 3600) / 60)) + 'min');
    const time = _timeConvert(duration);
    return time;
  }

  /**
   * UtilsServiceを選択して
   * @returns {UtilInterface}
   */
  public selectUtils(): UtilInterface {
    return this._untilService;
  }
}
