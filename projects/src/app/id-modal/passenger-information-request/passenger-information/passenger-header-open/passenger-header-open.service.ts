import { Injectable } from '@angular/core';
import { defaultDispPassengerName, getPassengerLabel2, isStringEmpty } from '@common/helper';
import { SupportClass } from '@lib/components/support-class';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService } from '@lib/services';
import { Traveler } from 'src/sdk-reservation';
import {
  PassengerInformationRequestPassengerOpenHeaderData,
  initialPassengerInformationRequestPassengerOpenHeaderData,
  PassengerInformationRequestPassengerOpenHeaderParts,
} from './passenger-header-open.state';
/**
 * 搭乗者情報ヘッダ オープン時 service
 */
@Injectable()
export class PassengerInformationRequestPassengerOpenHeaderService extends SupportClass {
  constructor(private _common: CommonLibService, private _staticMsg: StaticMsgPipe) {
    super();
  }

  destroy() {}

  /**
   * 搭乗者情報ヘッダオープン 初期値作成
   * @returns 搭乗者情報ヘッダオープン 初期値
   */
  createData(): PassengerInformationRequestPassengerOpenHeaderData {
    return initialPassengerInformationRequestPassengerOpenHeaderData();
  }

  /**
   * 搭乗者情報ヘッダオープン 設定値作成
   * @param traveler 搭乗者情報
   * @param index 搭乗者のインデックス（表示用）
   * @param registrarionLabel 登録状況ラベル
   * @param isDomesticDcsFlight 国内旅程DCS日付前か否か
   * @returns 搭乗者情報ヘッダオープン 設定値
   */
  createParts(
    traveler: Traveler,
    index: number,
    registrarionLabel: string,
    isDomesticDcsFlight: boolean
  ): PassengerInformationRequestPassengerOpenHeaderParts {
    let passengerNameHeader = '';
    if (!isStringEmpty(traveler.names?.[0]?.firstName)) {
      passengerNameHeader = defaultDispPassengerName(traveler?.names?.[0] ?? {});
    } else {
      passengerNameHeader = this._staticMsg.transform('label.passenger.n', { '0': index + 1 });
    }
    return {
      passengerNameHeader: passengerNameHeader,
      passengerTypeLabel: getPassengerLabel2(traveler.passengerTypeCode ?? '', isDomesticDcsFlight),
      registrarionLabel: registrarionLabel,
    };
  }
}
