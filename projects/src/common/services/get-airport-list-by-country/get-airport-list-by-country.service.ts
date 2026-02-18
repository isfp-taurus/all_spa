import { Injectable } from '@angular/core';
import { AirportAllData } from '@common/interfaces';
import { SupportClass } from '@lib/components/support-class';
import { AswMasterService, CommonLibService } from '@lib/services';
import { Observable } from 'rxjs';

/**
 * 国を指定して空港リストを取得するサービス
 */
@Injectable({
  providedIn: 'root',
})
export class GetAirportListByCountryService extends SupportClass {
  constructor(private _common: CommonLibService, private _aswMasterService: AswMasterService) {
    super();
  }

  getAirportListByCountry$(country2LetterCode: string): Observable<string[]> {
    return new Observable((observer) => {
      const lang = this._common.aswContextStoreService.aswContextData.lang;
      this._aswMasterService.load([{ key: 'airport_all', fileName: 'Airport_All' }], true),
        ([airportAll]: [Array<AirportAllData>]) => {
          const res = this.getAirportListByCountry(country2LetterCode, airportAll);
          observer.next(res);
        };
    });
  }

  getAirportListByCountry(country2LetterCode: string, airportAll: Array<AirportAllData>): Array<string> {
    return airportAll
      .filter((airport) => airport.country_2letter_code === country2LetterCode)
      .map((airport) => airport.airport_code);
  }

  destroy(): void {}
}
