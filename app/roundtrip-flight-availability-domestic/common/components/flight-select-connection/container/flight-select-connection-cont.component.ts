import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MasterDataService } from '../../../services';
import { AswCommonStoreService, AswContextStoreService } from '@lib/services';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Items11 } from '../../../sdk';
import { getFormatHourTime } from '@app/roundtrip-flight-availability-domestic/common/helpers';

/**
 * 乗継情報ContComponent
 */
@Component({
  selector: 'asw-flight-select-connection-cont',
  templateUrl: './flight-select-connection-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightSelectConnectionContComponent implements OnInit, OnDestroy {
  /**
   * セグメント情報
   */
  @Input()
  public segment?: Items11;

  /**
   * タイトル
   */
  @Input()
  public title?: string;

  /**
   * 他アプリケーションからの遷移
   */
  @Input()
  public transitionSource?: boolean;

  /**
   * セグメント間の乗継時間
   */
  public connectionTime?: string;

  /**
   * セグメント間背景色オレンジ/青
   */
  public isMultiAirportConnection?: boolean;

  /**
   * 到着地空港名称
   */
  public arrivalLocationName?: string;

  /**
   * 機能画面ID
   */
  private _funcPageId?: string;

  /**
   * ngOnDestroyにunsubscribeを実行
   */
  private _subscriptions: Subscription = new Subscription();

  constructor(
    private _aswContextSvc: AswContextStoreService,
    private _masterDataService: MasterDataService,
    private _translateSvc: TranslateService,
    private _aswCommonSvc: AswCommonStoreService
  ) {
    const { functionId, pageId } = this._aswCommonSvc.aswCommonData;
    this._funcPageId = `${functionId}_${pageId}`;
  }

  /**
   * 初期化処理
   */
  ngOnInit() {
    const lang = this._aswContextSvc.aswContextData.lang;
    if (this.segment?.connectionTime && this.segment?.connectionTime > 0) {
      this.connectionTime = getFormatHourTime(this.segment?.connectionTime);
    }

    // 到着地空港名称
    this.arrivalLocationName = this._masterDataService.getAirportName(
      this.segment?.arrival?.locationCode,
      this.segment?.arrival?.locationName
    );
    // 空港間移動発生
    this.isMultiAirportConnection = this.segment?.isMultiAirportConnection;

    this._translateSvc.onLangChange.subscribe(() => {
      // 到着地空港名称
      this.arrivalLocationName = this._masterDataService.getAirportName(
        this.segment?.arrival?.locationCode,
        this.segment?.arrival?.locationName
      );

      if (this.segment?.connectionTime && this.segment?.connectionTime > 0) {
        this.connectionTime = getFormatHourTime(this.segment?.connectionTime);
      }
    });
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  /**
   * セグメント表示判定
   * @returns
   */
  public getSegmentDisplay(): boolean {
    return true;
  }
}
