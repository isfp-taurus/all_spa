import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { fromEvent, zip } from 'rxjs';
import { CurrentSeatmapService, GetOrderStoreService } from '@common/services';
import { GetSeatmapsStoreService } from '@common/services/api-store/sdk-servicing/get-seatmaps-store/get-seatmaps-store.service';
import { createLegendList } from '@common/helper/common/seatmap.helper';
import { SeatLegendDisplayInformation } from '@common/interfaces/servicing-seatmap';
import { AppConstants } from '@conf/app.constants';

@Component({
  selector: 'asw-servicing-seatmap-legends-modal',
  templateUrl: './servicing-seatmap-legends-modal.component.html',
  styleUrls: ['./servicing-seatmap-legends-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicingSeatmapLegendsModalComponent extends SupportModalBlockComponent implements AfterViewInit {
  /** カルーセルのブロックとなる要素を取得 */
  @ViewChildren('panelItem') panelItemRefs!: QueryList<ElementRef>;
  /** カルーセル表示を行うパネルのブロック数 */
  panelNum: number = 0;
  /** 現在スクロールされた要素のindex */
  scrollTargetIndex = 0;
  /** 凡例を表示するための凡例マトリックス */
  legendMatrix: SeatLegendDisplayInformation[][] = [];
  /** 1つのパネルに表示する凡例の数 */
  readonly NUMBER_OF_LEGENDS_PER_COLUMN: number = 4;
  /** スクロールが左端かどうか */
  isLeftEnd = true;
  /** スクロールが右端かどうか */
  isRightEnd = false;
  // カルーセル内に表示できる凡例の列数
  displayLegendColumn = 1;
  /** 画像ファイルパス定数用 */
  public appConstants = AppConstants;

  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _getSeatmapsStoreService: GetSeatmapsStoreService,
    private _currentSeatmapService: CurrentSeatmapService,
    private _getOrderStoreService: GetOrderStoreService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_common);
  }

  override ngAfterViewInit(): void {
    // カルーセルのブロックの数とカルーセルの描画範囲内に収まるパネルの個数の初期化
    this.panelNum = this.panelItemRefs.length;
    this.displayLegendColumn = this.getDisplayLegendColumn();
    // displayLegendColumnが決定された後に再度描画を行い、描画範囲外のパネルに属性の指定を行う
    this._changeDetectorRef.detectChanges();
  }

  init(): void {
    this.subscribeService('LegendsModalResize', fromEvent(window, 'resize'), () => {
      this.onResize(this.scrollTargetIndex, this.panelNum);
    });
    this.closeWithUrlChange(this._router);
    // シートマップ結果と表示対象セグメントのキャビンを受け取り画面の初期化を行う
    const isContainedRearFacingSeat =
      this._getSeatmapsStoreService.getSeatmapsData.data?.seatmaps?.isCotaninedRearFacingSeat;
    const isContainedPaidAsrSeat =
      this._getSeatmapsStoreService.getSeatmapsData.data?.seatmaps.isContainedChargeableAsrSeat;
    const isContainedCouchSeat = this._getSeatmapsStoreService.getSeatmapsData.data?.seatmaps.isContainedCouchSeat;
    const cabin =
      this._getOrderStoreService.getOrderData.data?.air?.bounds?.[
        this._currentSeatmapService.CurrentSeatmapData.displayTargetBoundArrayId ?? 0
      ]?.flights?.[this._currentSeatmapService.CurrentSeatmapData.displayTargetSegmentArrayId ?? 0].cabin;
    if (cabin) {
      const isEconomy = cabin === 'eco';
      const legendList = createLegendList(
        Boolean(isContainedRearFacingSeat),
        isEconomy,
        Boolean(isContainedPaidAsrSeat),
        Boolean(isContainedCouchSeat),
        false
      );
      this.legendMatrix = this.chunkArray(legendList, this.NUMBER_OF_LEGENDS_PER_COLUMN);
    }
  }

  reload(): void {}
  destroy(): void {}

  /**
   * カルーセルボタン（左）押下時の処理
   */
  public onClickLeftCarousel(): void {
    if (this.isLeftEnd) return;
    const panelArray: ElementRef[] = this.panelItemRefs.toArray();
    this.displayLegendColumn = this.getDisplayLegendColumn();
    const nextFocusIndex =
      this.scrollTargetIndex - this.displayLegendColumn < 0 ? 0 : this.scrollTargetIndex - this.displayLegendColumn;

    this.scrollToFocusElement(panelArray, nextFocusIndex);
  }

  /**
   * カルーセルボタン（右）押下時の処理
   */
  public onClickRightCarousel(): void {
    if (this.isRightEnd) return;
    const panelArray: ElementRef[] = this.panelItemRefs.toArray();
    this.displayLegendColumn = this.getDisplayLegendColumn();
    const nextFocusIndex =
      this.scrollTargetIndex + this.displayLegendColumn > panelArray.length - 1
        ? panelArray.length - 1
        : this.scrollTargetIndex + this.displayLegendColumn;

    this.scrollToFocusElement(panelArray, nextFocusIndex);
  }

  /**
   * 1つの配列を、指定要素ごとに切り分けて配列の配列を作成する
   * @param array
   * @param size
   * @returns 指定要素数ごとに配列でグルーピングされた配列
   */
  private chunkArray<T extends any[]>(array: T, size: number) {
    return array.reduce((preArray: T[][], current, index) => {
      if (index % size) {
        return preArray;
      }
      return [...preArray, ...[array.slice(index, index + size)]];
    }, [] as T[][]);
  }

  /**
   * モーダル内に表示している凡例の列数を算出する
   * @returns 表示する凡例の列数
   */
  private getDisplayLegendColumn() {
    const carouselContents = document.getElementById('carousel-contents');
    const carouselItem = document.getElementById('carousel-item');
    if (!carouselContents || !carouselItem) return 1;

    return Math.trunc(carouselContents.clientWidth / carouselItem.clientWidth) === 0
      ? 1
      : Math.trunc(carouselContents.clientWidth / carouselItem.clientWidth);
  }

  /**
   * カルーセル要素へのスクロール
   * @param panelArray カルーセル要素の列配列
   * @param nextFocusIndex フォーカス先要素のindex
   */
  public scrollToFocusElement(panelArray: ElementRef<any>[], nextFocusIndex: number) {
    const nextFocusElement = panelArray[nextFocusIndex].nativeElement;
    nextFocusElement.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
    this.scrollTargetIndex = nextFocusIndex;
    this.isScrollEnd(this.scrollTargetIndex, this.panelNum);
  }

  /**
   * スクロールが端に達しているかの判定
   * @param scrollTargetIndex スクロールする対象となる要素のindex
   * @param panelNum カルーセル表示を行うパネルのブロック数
   */
  private isScrollEnd(scrollTargetIndex: number, panelNum: number) {
    this.isLeftEnd = scrollTargetIndex === 0;
    this.isRightEnd = scrollTargetIndex + this.displayLegendColumn >= panelNum;
  }

  // リサイズが行われた時に左右のカルーセルボタンの表示非表示を判定する
  private onResize(scrollTargetIndex: number, panelNum: number) {
    this.displayLegendColumn = this.getDisplayLegendColumn();
    this.isScrollEnd(scrollTargetIndex, panelNum);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * モーダル内に表示している要素かどうかを判定し、表示していなければ{ aria-hidden: true, tab-index: '-1' }を付与する
   * @param index
   * @returns aria-hidden: true, tab-index: '-1' or undefined
   */
  public areChildrenInView(index: number) {
    return !(this.scrollTargetIndex <= index && index < this.scrollTargetIndex + this.displayLegendColumn)
      ? {
          ariaHidden: true,
          tabIndex: '-1',
        }
      : undefined;
  }
}
