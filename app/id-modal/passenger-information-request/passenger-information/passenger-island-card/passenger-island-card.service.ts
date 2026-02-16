/**
 * 搭乗者情報入力　離島カード番号 サービス
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { Traveler } from 'src/sdk-reservation';
import {
  PassengerInformationRequestIslandCardData,
  PassengerInformationRequestIslandCardParts,
} from './passenger-island-card.state';
/**
 * passenger-island-card
 */
@Injectable()
export class PassengerInformationRequestIslandCardService extends SupportClass {
  constructor(private _common: CommonLibService) {
    super();
  }
  /**
   * 搭乗者情報入力　離島カード番号 初期値を作成する
   * @param traveler 搭乗者データ
   * @return 初期値
   */
  createData(traveler: Traveler): PassengerInformationRequestIslandCardData {
    return {
      number: traveler.islandCard?.number ?? '',
      isError: false,
    };
  }
  /**
   * 搭乗者情報入力　離島カード番号 設定値を作成する
   * @return 設定値
   */
  createParts(): PassengerInformationRequestIslandCardParts {
    return {};
  }
  destroy() {}
}
