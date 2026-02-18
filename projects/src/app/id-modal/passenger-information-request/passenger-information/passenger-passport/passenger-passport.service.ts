import { Injectable } from '@angular/core';
import { stringEmptyDefault } from '@common/helper';
import { SupportClass } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { Traveler } from 'src/sdk-reservation';
import {
  PassengerInformationRequestPassengerPassportData,
  PassengerInformationRequestPassengerPassportParts,
} from './passenger-passport.state';
/**
 * パスポート番号 service
 */
@Injectable()
export class PassengerInformationRequestPassengerPassportService extends SupportClass {
  constructor(private _common: CommonLibService) {
    super();
  }

  destroy() {}

  /**
   * パスポート番号 初期値作成
   * @param traveler
   * @returns パスポート番号 初期値
   */
  createData(traveler: Traveler): PassengerInformationRequestPassengerPassportData {
    return {
      passportNumber: stringEmptyDefault(traveler.regulatoryDetails?.passports?.[0]?.number),
      isError: false,
    };
  }

  /**
   * パスポート番号 設定値作成
   * @returns パスポート番号 設定値
   */
  createParts(): PassengerInformationRequestPassengerPassportParts {
    return {};
  }
}
