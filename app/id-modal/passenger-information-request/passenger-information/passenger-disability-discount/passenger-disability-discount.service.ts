/**
 * 搭乗者情報入力　障がい割旅客種別　サービス
 *
 */
import { Injectable } from '@angular/core';
import { defaultDispPassengerName, isStringEmpty } from '@common/helper';
import { DisabilityType, PassengerType } from '@common/interfaces';
import { SupportClass } from '@lib/components/support-class';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService } from '@lib/services';
import { Traveler } from 'src/sdk-reservation';
import {
  PassengerInformationRequestDisabilityDiscountData,
  PassengerInformationRequestDisabilityDiscountDisabilityTypeMapParam,
  PassengerInformationRequestDisabilityDiscountParts,
} from './passenger-disability-discount.state';
/**
 * 搭乗者情報入力　障がい割旅客種別　サービス
 */
@Injectable()
export class PassengerInformationRequestDisabilityDiscountService extends SupportClass {
  constructor(private _common: CommonLibService, private _staticMsg: StaticMsgPipe) {
    super();
  }
  /**
   * 初期値を作成する
   * @param traveler 搭乗者情報
   * @return 初期値
   */
  createData(traveler: Traveler): PassengerInformationRequestDisabilityDiscountData {
    return {
      disabilityType: traveler.disabilityDiscountInfomation?.disabilityType ?? '',
      careReceiverTravelerId: traveler.disabilityDiscountInfomation?.careReceiverTravelerId ?? '',
      isError: false,
    };
  }
  /**
   * 設定値を作成する
   * @param traveler 搭乗者情報
   * @param travelers 全ての搭乗者情報
   * @return 設定値
   */
  createParts(travelerId: string, travelers: Array<Traveler>): PassengerInformationRequestDisabilityDiscountParts {
    //障がい種別リスト
    const disabilityTypeMap: Array<PassengerInformationRequestDisabilityDiscountDisabilityTypeMapParam> = [
      { value: DisabilityType.GRADE1, disp: this._staticMsg.transform('label.disabilityType1'), id: '' },
      { value: DisabilityType.GRADE2, disp: this._staticMsg.transform('label.disabilityType2'), id: '' },
      { value: DisabilityType.MENTAL, disp: this._staticMsg.transform('label.mentalDisorder'), id: '' },
    ];
    travelers
      .filter(
        (traveler) =>
          traveler.id !== travelerId &&
          traveler.passengerTypeCode !== PassengerType.INF &&
          traveler.passengerTypeCode !== PassengerType.INS
      )
      .forEach((traveler) => {
        disabilityTypeMap.push({
          value: `${DisabilityType.CREGIVER}${traveler.id}`,
          disp: this.getDispName(traveler, travelers),
          id: traveler.id,
        });
      });
    return {
      disabilityTypeMap: disabilityTypeMap,
    };
  }

  /**
   * プルダウンに表示する搭乗者名を取得
   * @param traveler
   * @param travelers
   * @returns　表示名
   */
  getDispName(traveler: Traveler, travelers: Array<Traveler>): string {
    if (!isStringEmpty(traveler.names?.[0]?.firstName)) {
      return this._staticMsg.transform('label.caregiver', {
        '0': defaultDispPassengerName(traveler?.names?.[0] ?? {}),
      });
    } else {
      return this._staticMsg.transform('label.caregiver', {
        '0': travelers.findIndex((trav) => trav.id === traveler.id) + 1,
      });
    }
  }

  destroy() {}
}
