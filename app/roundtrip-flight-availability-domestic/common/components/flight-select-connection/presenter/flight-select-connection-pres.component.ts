import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * 乗継情報PresComponent
 */
@Component({
  selector: 'asw-flight-select-connection-pres',
  templateUrl: './flight-select-connection-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightSelectConnectionPresComponent {
  /**
   * セグメント間の乗継時間
   */
  @Input()
  public connectionTime?: string;

  /**
   * セグメント間背景色オレンジ/青
   */
  @Input()
  public isMultiAirportConnection?: boolean;

  /**
   * 到着地空港名称
   */
  @Input()
  public arrivalLocationName?: string;

  /**
   * 背景色Class
   * @returns
   */
  public get backColorClass(): string {
    if (this.isMultiAirportConnection) {
      return 'transfer';
    }
    return 'transit';
  }
}
