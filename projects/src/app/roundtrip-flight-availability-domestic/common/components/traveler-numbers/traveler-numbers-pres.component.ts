import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { NumberOfTravelers } from '../../sdk';

// 静的文言鍵
const TRANSLATE_KEY = {
  ADT: 'label.passengerAdult',
  B15: 'label.passengerYoungAdult',
  CHD: 'label.passengerChild',
  INF: 'label.passengerInfant',
  INS: 'label.passengerIns',
};

/**
 * 搭乗者人数リストPresComponent
 */
@Component({
  selector: 'asw-traveler-numbers-pres',
  templateUrl: './traveler-numbers-pres.component.html',
  styleUrls: ['./traveler-numbers-pres.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TravelerNumbersPresComponent implements OnInit {
  /**
   * 搭乗者
   */
  public passengers?: { number: number; key: string }[];

  /** 搭乗者数 */
  @Input()
  public travelers?: NumberOfTravelers;

  constructor() {}

  /**
   * 初期化処理
   */
  public ngOnInit(): void {
    this.passengers = this._getNumberOfPassengersByPassengerTypeArray(this.travelers);
  }

  /**
   * 旅客種別ごとの人数リストを取得する
   * @param travelerNumbers 搭乗者人数リスト
   * @returns
   */
  private _getNumberOfPassengersByPassengerTypeArray(
    travelerNumbers?: NumberOfTravelers
  ): { number: number; key: string }[] {
    const numberOfPassengersByPassengerType = [];
    const ADT = (travelerNumbers && travelerNumbers.ADT) || 0;
    const CHD = (travelerNumbers && travelerNumbers.CHD) || 0;
    const INF = (travelerNumbers && travelerNumbers.INF) || 0;
    if (ADT > 0) {
      numberOfPassengersByPassengerType.push({
        number: ADT,
        key: TRANSLATE_KEY.ADT,
      });
    }
    if (CHD > 0) {
      numberOfPassengersByPassengerType.push({
        number: CHD,
        key: TRANSLATE_KEY.CHD,
      });
    }
    if (INF > 0) {
      numberOfPassengersByPassengerType.push({
        number: INF,
        key: TRANSLATE_KEY.INF,
      });
    }
    return numberOfPassengersByPassengerType;
  }
}
