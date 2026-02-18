import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FlightDetail, OperatingAirlineInfo } from '@app/find-more-flights/presenter/find-more-flights-pres.state';
import { RoundtripFlightAvailabilityInternationalPresService } from '@app/roundtrip-flight-availability-international/presenter/roundtrip-flight-availability-international-pres.service';
import { FlightDetailModalService } from '@common/components/shopping/flight-detail/flight-detail-modal.service';
import { FlightPlanService } from '@common/components/shopping/flight-plan/flight-plan.service';
import { MASTER_TABLE } from '@conf/asw-master.config';
import { SupportComponent } from '@lib/components/support-class';
import { isPC, isSP, isTB } from '@lib/helpers';
import { StaticMsgPipe } from '@lib/pipes';
import { AswMasterService, CommonLibService } from '@lib/services';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { debounceTime } from 'rxjs/operators';
import {
  Bound,
  ComplexFmfFareFamilyAirOffersInnerComplexBoundsInner,
  ComplexFmfFareFamilyAirOffersInnerComplexBoundsInnerAircraftConfigurationVersionsInner,
} from 'src/sdk-search';
import { ShoppingLibService } from '@common/services';
import { AppConstants } from '@conf/app.constants';

@Component({
  selector: 'asw-fmf-search-result',
  templateUrl: './fmf-search-result.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FmFSearchResultComponent extends SupportComponent {
  public appConstants = AppConstants;
  constructor(
    private _flightDetailModalService: FlightDetailModalService,
    private _common: CommonLibService,
    private _changeDetector: ChangeDetectorRef,
    private _aswMasterSvc: AswMasterService,
    private _roundtripFlightAvailabilityInternationalPresService: RoundtripFlightAvailabilityInternationalPresService,
    private _flightPlanService: FlightPlanService,
    private _staticMsgPipe: StaticMsgPipe,
    private _shoppingLivService: ShoppingLibService
  ) {
    super(_common);
  }

  public operatingAirlineList: Record<string, string> = {};

  /** バウンド番号 */
  @Input()
  currentBoundIndex: number = 0;
  /** 選択中Offer */
  @Input()
  isSelectedOffer?: boolean;
  /** 選択可能判定 */
  @Input()
  isUnavailable?: boolean;
  /* 選択不可理由 */
  @Input()
  reasonForUnselectable?: string;
  /* バウンドデータリスト */
  @Input()
  bounds!: Bound[];
  /* 複雑バウンドデータ */
  @Input()
  complexBounds?: ComplexFmfFareFamilyAirOffersInnerComplexBoundsInner[];
  /** バウンドデータ */
  @Input()
  public bound?: Bound;
  /** 差額 */
  @Input()
  public priceDifference?: number;
  /** ACVリスト */
  @Input()
  public aircraftConfigurationVersions?: ComplexFmfFareFamilyAirOffersInnerComplexBoundsInnerAircraftConfigurationVersionsInner[];
  /** AirOfferId - FF詳細モーダル用 */
  @Input()
  public airOfferId?: string;
  /** 選択ボタン遷移イベント */
  @Output()
  public airOfferSelectEvent = new EventEmitter<void>();
  /** 運航キャリアリスト */
  public airlineNameList: OperatingAirlineInfo[] = [];
  /** 差額の絶対値 */
  public priceDifferenceAbsoluteValue?: number;
  /** 差額に付与する符号 */
  public priceDifferenSign?: string;
  /** 運航キャリア名 */
  public operatingAirlineName: string = '';
  /** バウンド出発地コード */
  @Input()
  public boundDepartureAirportCode?: string;
  /** バウンド到着地コード */
  @Input()
  public boundArrivalAirportCode?: string;

  //カウチ対象便ACVコードリスト
  public couchAcvCodeList: string[] = [];

  reload(): void {}
  init(): void {
    this.subscribeService('GovApprovalResize', fromEvent(window, 'resize').pipe(debounceTime(100)), this.resizeEvent);
    // 運航キャリアリスト生成
    this._createAirlineList();

    // 区切り文字の取得
    const travelersDivider = this._staticMsgPipe.transform('label.separaterComma');
    // 運航キャリア名称のリスト数分処理
    this.operatingAirlineName = this.airlineNameList
      .map((airlineInfo, index) =>
        this.createOperatingAirlineName(airlineInfo, index, travelersDivider, this.airlineNameList)
      )
      .join('');
    //差額を絶対値に変換
    if (this.priceDifference) {
      this.convertValueToAbsoluteValue(this.priceDifference);
    }
    this.priceDifferenSign = this.priceDifference! >= 0 ? '+' : '-';
    this.couchAcvCodeList = this._shoppingLivService.getcouchAcvCodeList();
    this._changeDetector.markForCheck();
  }
  destroy(): void {
    this.deleteSubscription('GovApprovalResize');
  }

  /**
   * 表示する運航キャリア名称のHTML作成
   * @param airlineInfo 表示データ
   * @param index 運航キャリアリスト内でのインデックス
   * @param travelersDivider 区切り文字
   * @param airlineNameList 航空会社リスト
   * @returns
   */
  private createOperatingAirlineName(
    airlineInfo: OperatingAirlineInfo,
    index: number,
    travelersDivider: string,
    airlineNameList: OperatingAirlineInfo[]
  ): string {
    if (index === airlineNameList.length - 1) {
      travelersDivider = '';
    }
    return `<span class="custom-text01__airlineText">${airlineInfo.name}${travelersDivider}</span>`;
  }

  /**
   * フライト詳細リンク押下時イベント
   */
  public clickFlightDetailLink() {
    // フィルタ条件モーダル用キャッシュ取得
    this.subscribeService(
      'FFDetailModalCacheGet',
      this._aswMasterSvc.load([MASTER_TABLE.AIRLINE_I18NJOINALL], true),
      () => {
        this.deleteSubscription('FFDetailModalCacheGet');
        const flightDetail: FlightDetail = {
          flightDetailHeader: this._roundtripFlightAvailabilityInternationalPresService.createFlightDetailHeader(
            this.bound ?? {}
          ),
          flightDetailSegment: this._roundtripFlightAvailabilityInternationalPresService.createFlightDetailSegment(
            this.bound ?? {},
            this.currentBoundIndex
          ),
        };
        this._flightDetailModalService.openModal(flightDetail);
      }
    );
  }

  /**
   * 選択ボタン押下イベント
   */
  public clickSelectButton() {
    this.airOfferSelectEvent.emit();
  }

  // 端末認識処理
  public isSp = isSP();
  public isPc = isPC();
  public isTb = isTB();
  public isSpPre = isSP();
  public isPcPre = isPC();
  public isTbPre = isTB();

  /**
   * 画面サイズの変更検知
   */
  private resizeEvent = () => {
    this.isSpPre = this.isSp;
    this.isSp = isSP();
    if (this.isSpPre !== this.isSp || this.isPcPre !== this.isPc || this.isTbPre !== this.isTb) {
      this._changeDetector.markForCheck();
    }
  };

  /**
   * 運航キャリアリストの作成
   */
  private _createAirlineList() {
    const operatingAirlineInfos = this._flightPlanService.getOperatingAirlineNameList(this.bound ?? {});
    operatingAirlineInfos &&
      operatingAirlineInfos.forEach((operatingAirlineInfo: string, index: number) => {
        const beforeUrlInfo = operatingAirlineInfo.split('|');
        const urlInfo: OperatingAirlineInfo = {
          url: beforeUrlInfo[0] ?? '',
          name: beforeUrlInfo[1] ?? '',
        };
        this.airlineNameList.push(urlInfo);
      });
  }

  //差額を絶対値に変換する処理
  private convertValueToAbsoluteValue(priceDifference: number) {
    this.priceDifferenceAbsoluteValue = Math.abs(priceDifference);
  }
}
