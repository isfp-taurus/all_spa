import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SeatmapHelperService } from '@common/services/seatmap/seatmap-helper.service';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { GetOrderResponseData, Type1 } from 'src/sdk-servicing';
import { AirlineI18nJoinByAirlineCode } from '../../../../interfaces/master/airline-i18n-join-by-airline-code';
import { AppConstants } from '@conf/app.constants';

@Component({
  selector: 'asw-servicing-seatmap-segments',
  templateUrl: './servicing-seatmap-segments.component.html',
  styleUrls: ['./servicing-seatmap-segments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicingSeatmapSegmentsComponent extends SupportComponent {
  /** 表示対象セグメント情報 */
  @Input() displayTargetSegment?: Type1;

  /** 表示対象セグメントID */
  @Input() set displayTargetSegmentId(value: string | undefined) {
    this._displayTargetSegmentId = value;
    this.allSegmentInfo?.forEach((segmentInfo, index) => {
      if (segmentInfo.id === value) {
        this.displaySegmentIndex = index;
      }
    });
  }
  get displayTargetSegmentId(): string | undefined {
    return this._displayTargetSegmentId;
  }
  private _displayTargetSegmentId?: string = '';

  /** PNR情報 */
  @Input() pnrInfo?: GetOrderResponseData;

  /** キャリア情報 */
  @Input() airlines?: AirlineI18nJoinByAirlineCode;

  /** セグメントのクリックイベントを共通部品に渡す */
  @Output() clickSegment = new EventEmitter<string>();

  /** 全セグメント情報 */
  allSegmentInfo?: Array<Type1>;

  /** 表示セグメント順番 */
  displaySegmentIndex: number = 0;

  /** ドロップダウン表示中かどうか */
  isDropDownDisplay: boolean = false;

  public appConstants = AppConstants;

  constructor(private _common: CommonLibService, private _seatmapHelperService: SeatmapHelperService) {
    super(_common);
  }

  reload(): void {}
  init(): void {
    this.subscribeService(
      'SeatmapSegmentAllSegment',
      this._seatmapHelperService.createAllSegmentList$(),
      (allSegmentList) => {
        this.allSegmentInfo = allSegmentList;
        this.allSegmentInfo?.forEach((segmentInfo, index) => {
          if (segmentInfo.id === this.displayTargetSegmentId) {
            this.displaySegmentIndex = index;
          }
        });
      }
    );
  }
  destroy(): void {}

  /**
   * セグメントのクリックイベント
   * @param segmentId セグメントID
   */
  public onClickSegment(segmentId: string) {
    const elements = document.getElementsByClassName('l-seatmap-container__body');
    if (elements.length !== 0) {
      elements[0].removeEventListener('click', this.handleEvent, true);
      elements[0].removeEventListener('keydown', this.handleEvent, true);
    }
    this.clickSegment.emit(segmentId);
  }

  /**
   * ドロップの選択変更
   * @returns
   */
  public onSelectChange() {
    const select = document.getElementById('segmentShowHide');
    const segmentsButton = document.getElementById('segmentsButton');

    // セグメントが存在しない or 1セグメントのみの場合、処理を中止
    if (this.isOneOrNoneSegment()) {
      return;
    }

    if (this.isDropDownDisplay) {
      select?.style.setProperty('display', 'none');
      segmentsButton?.classList.remove('is-open');
      this.isDropDownDisplay = false;
    } else {
      select?.style.setProperty('display', 'block');
      segmentsButton?.classList.add('is-open');
      this.isDropDownDisplay = true;
    }
    this.toggleEventListeners();

    return;
  }

  /**
   * toggleEventListeners
   */
  private toggleEventListeners(): void {
    const elements = document.getElementsByClassName('l-seatmap-container__body');
    if (elements.length === 0) {
      return;
    }

    if (this.isDropDownDisplay) {
      elements[0].addEventListener('click', this.handleEvent, true);
      elements[0].addEventListener('keydown', this.handleEvent, true);
    } else {
      elements[0].removeEventListener('click', this.handleEvent, true);
      elements[0].removeEventListener('keydown', this.handleEvent, true);
    }
  }

  /**
   * handleEvent
   * @param event
   */
  private handleEvent(event: Event) {
    const targetElement = event.target as HTMLElement;
    if (!targetElement) return;

    if (event.type === 'keydown') {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
      }
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * フライト名取得
   * @param segment セグメント情報
   * @returns フライト名
   */
  public getFlightName(segment?: Type1): string {
    const airlineCode = segment?.marketingAirlineCode || '';
    const flightNumber = segment?.marketingFlightNumber || '';
    return airlineCode + flightNumber;
  }

  /**
   * セグメントが存在しない or 1セグメントか判定
   * @returns 判定結果
   */
  public isOneOrNoneSegment(): boolean | undefined {
    return !this.allSegmentInfo || this.allSegmentInfo.length <= 1;
  }

  /**
   * 出発地コード取得
   * @returns 出発地コード
   */
  public getDepartureLocationCode(): string | undefined {
    return !this.allSegmentInfo
      ? this.displayTargetSegment?.departure?.locationCode
      : this.allSegmentInfo[this.displaySegmentIndex].departure?.locationCode;
  }

  /**
   * 出発地名称取得
   * @returns 出発地名称
   */
  public getDepartureLocationName(): string {
    return this.displayTargetSegment?.departure?.locationName || '';
  }

  /**
   * 到着地コード取得
   * @returns 到着地コード
   */
  public getArrivalLocationCode(): string | undefined {
    return !this.allSegmentInfo
      ? this.displayTargetSegment?.arrival?.locationCode
      : this.allSegmentInfo[this.displaySegmentIndex].arrival?.locationCode;
  }

  /**
   * 到着地名称取得
   * @returns 到着地名称
   */
  public getArrivalLocationName(): string {
    return this.displayTargetSegment?.arrival?.locationName || '';
  }
}
