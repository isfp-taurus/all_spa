import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService, SystemDateService } from '@lib/services';
import { first, throttleTime } from 'rxjs/operators';
import { Bound } from 'src/sdk-reservation';
import { PlanReviewTripSummaryService } from './plan-review-trip-summary.service';
import {
  deepCopyArray,
  formatSeconds,
  getAirportNameFromCache,
  getApplyDateCache,
  isEmptyObject,
  isStringEmpty,
} from '@common/helper';
import { CurrentCartStoreService, DiffEmphService, DcsDateService } from '@common/services';
import { isPC, isSP } from '@lib/helpers';
import { StaticMsgPipe } from '@lib/pipes';
import { BehaviorSubject, fromEvent } from 'rxjs';
import {
  MListData,
  MServiceContentsI18N,
  EquipmentI18nJoinPk,
  PlanReviewOutputBound,
  PlanReviewOutputFlight,
  PlanReviewOutputFlightEndpoint,
  AirlineI18nJoinAll,
  AirlineI18nJoinAllAirlineCodeData,
} from '@common/interfaces';
import { PlanReviewPresMasterData } from '../../presenter/plan-review-pres.component.state';
import { cjkLangSet } from './plan-review-trip-summary.state';
import { AppConstants } from '@conf/app.constants';

/**
 * 旅程情報
 */
@Component({
  selector: 'asw-trip-summary',
  templateUrl: './plan-review-trip-summary.component.html',
  styleUrls: ['./plan-review-trip-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewTripSummaryComponent extends SupportComponent implements AfterViewChecked {
  /** 取得したマスタデータ */
  @Input() set masterData(value: PlanReviewPresMasterData | undefined) {
    this._masterData = value;
    this._isMasterDataSetSbj.next(!!this._masterData);
  }
  get masterData(): PlanReviewPresMasterData | undefined {
    return this._masterData;
  }
  private _masterData?: PlanReviewPresMasterData;

  /** マスタデータset状況判定用Subject */
  private _isMasterDataSetSbj = new BehaviorSubject<boolean>(false);

  /** キャリア識別アイコン */
  public appConstants = AppConstants;

  /** 運航便識別 */
  public operatingAirline = AppConstants.CARRIER.TWO_LETTER;

  /** プラン有効判定 */
  public isPlanValid = false;

  /** 過去日ブラン有効判定 */
  public isPlanValidForPastDay = false;

  /** 空席待ち有効判定 */
  public isWaitlisted = false;

  /** 初期表示準備完了EventEmitter */
  @Output() readyToShow = new EventEmitter();

  /** 初期表示準備完了フラグ */
  public isShow = false;

  /** セグ間ライン起点 */
  @ViewChildren('interSegLineBegin', { read: ElementRef }) segmentBeginList?: QueryList<ElementRef>;
  /** セグ間ライン終点 */
  @ViewChildren('interSegLineEnd', { read: ElementRef }) segmentEndList?: QueryList<ElementRef>;
  /** セグ間エリア */
  @ViewChildren('interSegArea', { read: ElementRef }) interSegAreaList?: QueryList<ElementRef>;

  /** セグ間ラインスタイルバインディング用の文字列の配列(バウンド毎・セグ毎) */
  public interSegLineStyleListByBound: Array<string[]> = [];

  /** セグ間ラインスタイルバインディング用配列の旧データ */
  public prevInterSegLineStyleListByBound: Array<string[]> = [];

  /** 画面出力用バウンド情報 */
  public outputBounds: Array<PlanReviewOutputBound> = [];

  /** 操作中言語日中韓フラグ */
  public isCjk = false;

  /** 機内サービスツールチップ用画像 */
  public flightServiceTooltipImgs: { [key: string]: string } = {};

  /** FY25: 国内単独旅程フラグ */
  public isDomestic = false;

  /** FY25: DCS移行開始日以降フラグ */
  public isAfterDcs = false;

  /** 画面サイズ判定(PC) */
  public isPC = isPC();

  /** 画面サイズ比較用変数(PC) */
  public isPCPre = this.isPC;

  /** 画面サイズ判定(SP) */
  public isSP = isSP();

  /** 画面サイズ比較用変数(SP) */
  public isSPPre = this.isSP;

  /** 画面サイズチェック用関数 */
  private _resizeEvent = () => {
    [this.isPCPre, this.isSPPre] = [this.isPC, this.isSP];
    [this.isPC, this.isSP] = [isPC(), isSP()];
    if (this.isPCPre !== this.isPC || this.isSPPre !== this.isSP) {
      this._changeDetectorRef.markForCheck();
    }
  };

  constructor(
    private _common: CommonLibService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _tripSummaryService: PlanReviewTripSummaryService,
    private _diffEmphService: DiffEmphService,
    private _dcsDateService: DcsDateService,
    private _staticMsgPipe: StaticMsgPipe,
    private _sysDateService: SystemDateService
  ) {
    super(_common);
  }

  init(): void {
    // 画面サイズチェック開始
    this.subscribeService(
      'PlanReviewTripSummaryResize',
      fromEvent(window, 'resize').pipe(throttleTime(500)),
      this._resizeEvent
    );
    // 機内サービスツールチップ用画像を取得
    this.flightServiceTooltipImgs = this._tripSummaryService.getServiceTooltipImgsAll();

    // マスタが取れ次第refresh
    this.subscribeService(
      'PlanReviewTripSummary isMasterDataSet',
      this._isMasterDataSetSbj.asObservable().pipe(first((isSet) => !!isSet)),
      () => {
        this.deleteSubscription('PlanReviewTripSummary isMasterDataSet');
        this.refresh();
      }
    );
  }

  ngAfterViewChecked() {
    // セグ間ラインにスタイル適用
    this.interSegLineStyleListByBound = this._tripSummaryService.getInterSegLineStyle(
      this._currentCartStoreService.CurrentCartData.data,
      this.isPlanValid,
      this.segmentBeginList,
      this.segmentEndList,
      this.interSegAreaList
    );

    // 旧情報と差異がある場合のみdetectChanges()
    const prevList = this.prevInterSegLineStyleListByBound;
    const isChanged =
      prevList.length === 0 ||
      this.interSegLineStyleListByBound.some((newListBound, boundIndex) => {
        return newListBound.some((newListInterSeg, interSegIndex) => {
          return newListInterSeg !== prevList[boundIndex]?.[interSegIndex];
        });
      });
    if (isChanged) {
      // 現在のスタイルを旧情報として保持
      this.prevInterSegLineStyleListByBound = deepCopyArray(this.interSegLineStyleListByBound);
      this._changeDetectorRef.detectChanges();
    }
  }

  refresh(): void {
    this.subscribeService(
      'PlanReviewTripSummary CurrentCart$',
      this._currentCartStoreService.getCurrentCart$().pipe(first((store) => !store.isPending)),
      (data) => {
        this.deleteSubscription('PlanReviewTripSummary CurrentCart$');

        const currentBounds = data.data?.plan?.airOffer?.bounds ?? [];
        const previousBounds = data.data?.previousPlan?.airOffer?.bounds ?? [];
        this.isPlanValid = !isEmptyObject(data.data?.plan ?? {});

        // 空席待ちフラグ判定
        if (data.data?.plan?.airOffer?.statusType == 'waitlisted') {
          this.isWaitlisted = true;
        }

        // 過去日ブランフラグ判定
        if (
          previousBounds[0]?.originDepartureDateTime &&
          new Date(previousBounds[0]?.originDepartureDateTime).getTime() <=
            this._sysDateService.getSystemDate().getTime()
        ) {
          this.isPlanValidForPastDay = true;
        }

        // 日中韓フラグ判定
        const lang = this._common.aswContextStoreService.aswContextData.lang;
        this.isCjk = cjkLangSet.has(lang);

        // FY25: 国内単独旅程判定
        const displayCartPlan = this.isPlanValid ? data.data?.plan : data.data?.previousPlan;
        this.isDomestic = displayCartPlan?.airOffer?.tripType === 'domestic';

        // FY25: DCS移行開始日前後判定
        const departureDate = displayCartPlan?.airOffer?.bounds?.[0]?.originDepartureDateTime ?? '';
        this.isAfterDcs = this._dcsDateService.isAfterDcs(departureDate);

        this.setOutputLists(currentBounds, previousBounds, () => {
          // 当コンポーネントの初期表示準備完了フラグをtrueにする
          this.isShow = true;
          this.readyToShow.emit();
        });
      }
    );
  }

  /**
   * 画面出力用バウンド情報作成処理
   * @param currentBounds
   * @param previousBounds
   */
  setOutputLists(currentBounds: Bound[], previousBounds: Bound[], afterEvent: () => void): void {
    if (!this.masterData) {
      return;
    }
    const airportCache: { [key: string]: string } = this.masterData.airport;
    const airlineCache: AirlineI18nJoinAll = this.masterData.airline;
    const equipmentCache: EquipmentI18nJoinPk = this.masterData.equipmentPk;
    const serviceDescriptionCache: MServiceContentsI18N = this.masterData.serviceDescription;
    const listDataAll: Array<MListData> = this.masterData.listDataAll;

    // 画面表示のベースとなるカートのバウンド
    const displayBounds = this.isPlanValid ? currentBounds : previousBounds;

    this.outputBounds = displayBounds.map((displayBound, boundIndex) => {
      // バウンド単位の出力情報

      const flights = displayBound.flights?.map((displayFlight, segIndex) => {
        // セグメント単位の出力情報
        const currentSeg = currentBounds[boundIndex]?.flights?.[segIndex];
        const prevSeg = previousBounds[boundIndex]?.flights?.[segIndex];

        // returnするセグ情報
        const outputFlight: PlanReviewOutputFlight = { ...displayFlight };

        // STD・ETD
        const currentStd = currentSeg?.departure?.dateTime;
        const prevStd = prevSeg?.departure?.dateTime;
        const currentEtd = currentSeg?.departure?.estimatedDateTime;
        const prevEtd = prevSeg?.departure?.estimatedDateTime;
        const outputStd = this._diffEmphService.getEmphData(currentStd, prevStd);
        const outputEtd = this._diffEmphService.getEmphData(currentEtd, prevEtd);

        // STA・ETA
        const currentSta = currentSeg?.arrival?.dateTime;
        const prevSta = prevSeg?.arrival?.dateTime;
        const currentEta = currentSeg?.arrival?.estimatedDateTime;
        const prevEta = prevSeg?.arrival?.estimatedDateTime;
        const outputSta = this._diffEmphService.getEmphData(currentSta, prevSta);
        const outputEta = this._diffEmphService.getEmphData(currentEta, prevEta);

        const emphedDepArrDate = {
          std: outputStd,
          etd: outputEtd,
          sta: outputSta,
          eta: outputEta,
        };
        outputFlight.emphedDepArrDate = emphedDepArrDate;

        // 出発空港名・出発ターミナル
        const departure: PlanReviewOutputFlightEndpoint = { ...displayFlight.departure };
        departure.outputLocationName =
          getAirportNameFromCache(displayFlight?.departure?.locationCode ?? '', airportCache) ??
          displayFlight?.departure?.locationName;
        departure.outputTerminal = displayFlight?.departure?.terminal;
        // 羽田用ターミナル未確定文言
        const isHndDeparture = displayFlight?.departure?.locationCode === 'HND';
        if (isStringEmpty(departure.outputTerminal) && isHndDeparture && displayFlight?.isNhGroupOperated) {
          departure.outputTerminal = this._staticMsgPipe.transform('label.terminalName.notReturn');
        }
        outputFlight.departure = departure;

        // 到着空港名・到着ターミナル
        const arrival: PlanReviewOutputFlightEndpoint = { ...displayFlight.arrival };
        arrival.outputLocationName =
          getAirportNameFromCache(displayFlight?.arrival?.locationCode ?? '', airportCache) ??
          displayFlight?.arrival?.locationName;
        arrival.outputTerminal = displayFlight?.arrival?.terminal;
        // 羽田用ターミナル未確定文言
        const isHndArrival = displayFlight?.arrival?.locationCode === 'HND';
        if (isStringEmpty(arrival.outputTerminal) && isHndArrival && displayFlight?.isNhGroupOperated) {
          arrival.outputTerminal = this._staticMsgPipe.transform('label.terminalName.notReturn');
        }
        outputFlight.arrival = arrival;

        // 機材
        const acv = displayFlight?.aircraftConfigurationVersion ?? '';
        const aircraftUrl = equipmentCache?.[acv]?.[0]?.aircraft_type_url ?? '';
        outputFlight.aircraftUrl = aircraftUrl;

        // #2 (No.83) Branded Fare (国際対応): FF名称
        const priorityCode = displayFlight.fareInfos?.priorityCode ?? '';
        const fareFamilyName = this._masterData?.ffPriorityCode[`m_ff_priority_code_i18n_${priorityCode}`] ?? '';
        outputFlight.fareInfos = { ...outputFlight.fareInfos, fareFamilyName };

        // キャビンクラス
        const outputCabinClass = this._tripSummaryService.getOutputCabinClass(displayFlight, listDataAll);
        outputFlight.outputCabinClass = outputCabinClass;

        // 運航キャリア名称
        const currentDate = this._sysDateService.getSystemDate();
        const airlineData: AirlineI18nJoinAllAirlineCodeData = getApplyDateCache(
          airlineCache[displayFlight?.operatingAirlineCode ?? ''] ?? [],
          currentDate
        )?.[0];
        const airlineName = airlineData?.airline_name ?? '';
        const airlineLink = airlineData?.operating_airline_url;

        outputFlight.outputOperatingAirlineName = (airlineName || displayFlight?.operatingAirlineName) ?? '';
        outputFlight.outputOperatingAirlineLink = airlineLink;

        // 途中寄港数・地点名称
        const stopNumber = displayFlight.stops?.length;
        if (stopNumber) {
          const stopNumberStr = this._staticMsgPipe.transform('label.transitFlight', { '0': stopNumber });
          const colon = this._staticMsgPipe.transform('label.colon');
          const separator = this._staticMsgPipe.transform('label.stopSpoSeparator');
          // 寄港地点名称を連結した文字列
          const stopsNameStr =
            displayFlight.stops
              ?.map((stop) => {
                const outputLocationName =
                  getAirportNameFromCache(stop.locationCode ?? '', airportCache) || stop.locationName;
                return outputLocationName ?? '';
              })
              ?.join(separator) ?? '';

          outputFlight.stopsStr = stopNumberStr + colon + stopsNameStr;
        }

        // 総所要時間をHH:mm:ss形式に変換
        const formattedDuration = formatSeconds(displayFlight.duration);
        outputFlight.formattedDuration = formattedDuration;

        // 乗継時間をHH:mm:ss形式に変換
        const formattedConnectionTime = formatSeconds(displayFlight.connectionTime);
        outputFlight.formattedConnectionTime = formattedConnectionTime;

        return outputFlight;
      });

      // 総所要時間をHH:mm:ss形式に変換
      const formattedDuration = formatSeconds(displayBound.duration);

      const outputBound: PlanReviewOutputBound = { ...displayBound };
      outputBound.flights = flights;
      outputBound.formattedDuration = formattedDuration;
      return outputBound;
    });

    // 後続処理を実行
    afterEvent();
  }

  reload(): void {}

  destroy(): void {
    this.deleteSubscription('PlanReviewTripSummaryResize');
  }

  /**
   * 旅程全体再検索ボタン押下時処理
   */
  searchAgain(): void {
    const displayCartPlan = this.isPlanValid
      ? this._currentCartStoreService.CurrentCartData.data?.plan ?? {}
      : this._currentCartStoreService.CurrentCartData.data?.previousPlan ?? {};
    const searchAirOffer = this._currentCartStoreService.CurrentCartData.data?.searchCriteria?.searchAirOffer ?? {};
    this._tripSummaryService.searchAgain(
      displayCartPlan,
      searchAirOffer,
      undefined,
      this.isDomestic && this.isAfterDcs
    );
  }

  /**
   * バウンド変更ボタン押下時処理
   * @param targetBoundIndex
   */
  changeBound(targetBoundIndex: number): void {
    const currentCartPlan = this._currentCartStoreService.CurrentCartData.data?.plan ?? {};
    const searchAirOffer = this._currentCartStoreService.CurrentCartData.data?.searchCriteria?.searchAirOffer ?? {};
    this._tripSummaryService.searchAgain(
      currentCartPlan,
      searchAirOffer,
      targetBoundIndex,
      this.isDomestic && this.isAfterDcs
    );
  }
}
