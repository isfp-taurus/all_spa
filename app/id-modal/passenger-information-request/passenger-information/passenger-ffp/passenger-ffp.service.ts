import { Injectable } from '@angular/core';
import { stringEmptyDefault } from '@common/helper';
import { MMileageProgram, RamlFrequentFlyerCards } from '@common/interfaces';
import { SupportClass } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import {
  PassengerInformationRequestPassengerFFPData,
  PassengerInformationRequestPassengerFFPParts,
} from './passenger-ffp.state';
import { AppConstants } from '@conf/app.constants';

/**
 * FFP情報 service
 */
@Injectable()
export class PassengerInformationRequestPassengerFFPService extends SupportClass {
  constructor(private _common: CommonLibService) {
    super();
  }

  destroy() {}

  /**
   * FFP情報 初期値作成
   * @param frequentFlyerCard
   * @returns FFP情報 初期値
   */
  createData(frequentFlyerCard?: RamlFrequentFlyerCards): PassengerInformationRequestPassengerFFPData {
    return {
      mileageProgramName: stringEmptyDefault(frequentFlyerCard?.companyCode, AppConstants.CARRIER.TWO_LETTER),
      FFPNumber: stringEmptyDefault(frequentFlyerCard?.cardNumber),
      isError: false,
    };
  }

  /**
   * FFP情報 設定値作成
   * @param mileageProgram
   * @returns FFP情報 設定値
   */
  createParts(mileageProgram: Array<MMileageProgram>): PassengerInformationRequestPassengerFFPParts {
    return {
      mileageProgramMap: mileageProgram,
    };
  }
}
