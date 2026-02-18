import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TranslatePrefix } from '@conf/index';
import { MasterDataService } from '../../services/master-data.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * バウンドヘッダPresComponent
 */
@Component({
  selector: 'asw-flight-bound-heading-pres',
  templateUrl: './flight-bound-heading-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightBoundHeadingPresComponent implements OnInit, OnChanges {
  /**
   * 出発地(codeだけ: 例えば、TYO)
   */
  @Input()
  public flightBoundFrom?: string;

  /**
   * 到着地(codeだけ: 例えば、TYO)
   */
  @Input()
  public flightBoundTo?: string;

  /**
   * 乗継空港
   */
  @Input()
  public transferAirport?: Array<string>;

  /**
   * 出発地名前
   */
  public departureLocationName?: string;

  /**
   * 到着地名前
   */
  public arrivalLocationName?: string;

  /**
   * 空港静的文言キーPrefix
   */
  public airportPrefix = TranslatePrefix.AIRPORT;

  constructor(private _masterDataService: MasterDataService, private _translateSvc: TranslateService) {}

  /**
   * 初期化処理
   */
  public ngOnInit(): void {
    this._translateSvc.onLangChange.subscribe(() => {
      this.departureLocationName = this._masterDataService.getAirportName(this.flightBoundFrom);
      this.arrivalLocationName = this._masterDataService.getAirportName(this.flightBoundTo);
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['flightBoundFrom']) {
      this.departureLocationName = this._masterDataService.getAirportName(this.flightBoundFrom);
    }
    if (changes['flightBoundTo']) {
      this.arrivalLocationName = this._masterDataService.getAirportName(this.flightBoundTo);
    }
  }
}
