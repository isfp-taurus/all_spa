import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  RoundtripFppItemAirBoundsDataType,
  RoundtripFppItemAirCalendarDataTypeAirCalendarPeriodDepartureDatesInner,
  RoundtripFppItemAirCalendarDataTypeAirCalendarPeriodReturnDatesInner,
  RoundtripFppItemBoundDetailsDataType,
  RoundtripFppItemFareFamilyDataTypeInner,
  RoundtripFppRequestItinerariesInner,
} from '../../../sdk';
import {
  AirBounDisplayType,
  FlightSearchCondition,
  FareFamilyOutputType,
  ServiceInfoListType,
  travelSolutionDisplayType,
} from '../../../interfaces';
import { Observable, Subject, delay, filter, timer } from 'rxjs';
import { DOCUMENT } from '@angular/common';

/**
 * バウンドリストPresComponent
 */
@Component({
  selector: 'asw-flight-bound-pres',
  templateUrl: './flight-bound-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightBoundPresComponent implements AfterViewInit {
  /**
   * 出発日
   */
  @Input()
  public departureDate?: string;

  /**
   * TS表示タイプ
   */
  private _travelSolutionDisplay: any = [];
  @Input()
  public get travelSolutionDisplay(): Array<travelSolutionDisplayType> {
    return this._travelSolutionDisplay;
  }
  public set travelSolutionDisplay(value: Array<travelSolutionDisplayType>) {
    this._travelSolutionDisplay = value;
    this._changeDetectorRef.markForCheck();
    timer(0).subscribe(() => {
      this.scrollButtonClick('previous');
    });
  }

  /**
   * FF情報
   */
  @Input()
  public fareFamilies?: Array<RoundtripFppItemFareFamilyDataTypeInner>;

  /**
   * 選択状態
   */
  @Input()
  public status?: 'unSelected' | 'selected';

  /**
   * 無料預け入れ手荷物個数表示可否
   */
  @Input()
  public baggageFreeCheckedShow?: boolean;

  /**
   * アANAカウチ利用可が含まれるセグメント
   */
  @Input()
  public anaCouchSegments?: any;

  /**
   * サービス情報リスト
   */
  @Input()
  public svcInfoList?: ServiceInfoListType;

  /**
   * 検索条件.区間毎の情報
   */
  @Input()
  public itinerary?: RoundtripFppRequestItinerariesInner;

  /**
   * FF概要表示切替
   */
  @Input()
  public ffSummaryDisplay?: boolean;

  /**
   * プロモーションが存在する検索結果リスト(FF選択モーダルで使用される)
   */
  @Input()
  public hasPromotionsResult?: boolean;

  /**
   * 選択したAir Bound情報
   */
  @Input()
  public selectedAirBound?: RoundtripFppItemAirBoundsDataType | null;

  /**
   * 出発日ボタン押下処理(選択した往路Air Bound情報が存在する)
   */
  @Input()
  public outSelectedAirBound?: RoundtripFppItemAirBoundsDataType | null;

  /**
   * 選択したTravel Solution情報
   */
  @Input()
  public selectedTS?: RoundtripFppItemBoundDetailsDataType | null;

  /**
   * 出発地
   */
  @Input()
  public departureLocation?: string;

  /**
   * 到着地
   */
  @Input()
  public arrivalLocation?: string;

  /**
   * 乗継空港
   */
  @Input()
  public transferAirport?: Array<string>;

  /**
   * 7日間カレンダー
   */
  @Input()
  public departureDates?: Array<
    | RoundtripFppItemAirCalendarDataTypeAirCalendarPeriodDepartureDatesInner
    | RoundtripFppItemAirCalendarDataTypeAirCalendarPeriodReturnDatesInner
  >;

  /**
   * 全Air Bound情報フィルタ後選択不可
   */
  @Input()
  public isAllUnableFareFamilyCodes?: Array<string>;

  /**
   * 空席待ち不可が存在する検索結果リスト
   */
  @Input()
  public hasNonWaitlistResult?: boolean;

  /**
   * ジュニアパイロット不可が存在する検索結果リスト
   */
  @Input()
  public hasDisallowdedJuniorPilotResult?: boolean;

  /**
   * 指定したキャビンクラス
   */
  @Input()
  public currentCabin?: string;

  /**
   * FF選択ボタンイベント
   */
  @Output()
  public selectFareFamily$: EventEmitter<FareFamilyOutputType> = new EventEmitter<FareFamilyOutputType>();

  /**
   * フライト再選択ボタンイベント
   */
  @Output()
  public showOtherFlights$: EventEmitter<any> = new EventEmitter<any>();

  /**
   * 往復種別
   */
  @Input()
  public type?: 'out' | 'return';

  /**
   * scrollEvent
   */
  @Input()
  public scrollEvent$?: Observable<boolean>;

  /**
   * 検索条件
   */
  @Input()
  public searchCondition?: FlightSearchCondition;

  /**
   * 指定したキャビンクラス以外
   */
  @Input()
  public hasDiffCabinClass?: boolean;

  /**
   * 出発日ボタンイベント
   */
  @Output()
  public selectCalendar$: EventEmitter<string> = new EventEmitter<string>();

  /**
   * FF概要表示切替ボタンイベント
   */
  @Output()
  public changeDisplay$: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * スクロール連動の計算の制御
   */
  public scrollShadow$: Subject<'start' | 'end' | 'none'> = new Subject();

  @ViewChild('scrollElement')
  public scrollElement: ElementRef | undefined;

  /**
   * FF表示用BoundInfo
   */
  @Input()
  public airBoundInfos?: Array<AirBounDisplayType>;

  /**
   * ヘルプアイコンalt文言
   */
  public inside: string = 'alt.helpIcon2';

  /**
   * ウィンドウのサイズ変更イベントをリッスンする
   */
  @HostListener('window:resize')
  public onResize() {
    this.scrollButtonClick('previous');
    this._scrollShadowCalc();
  }

  constructor(@Inject(DOCUMENT) private _document: Document, private _changeDetectorRef: ChangeDetectorRef) {}

  public ngAfterViewInit() {
    if (this.scrollEvent$) {
      this.scrollEvent$
        .pipe(
          filter((scroll) => scroll),
          delay(0)
        )
        .subscribe(() => {
          timer(0).subscribe(() => {
            this.scrollElement?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        });
    }
    this._scrollShadowCalc();
  }

  /**
   * FF概要表示切替ボタン押下
   * @param display 表示要否
   */
  public changeDisplay(display: boolean) {
    this.changeDisplay$.emit(display);
  }

  /**
   * ヘーダ画面は初期表示完了
   */
  public headerAfterViewInit(display: boolean) {
    if (display) {
      this._scrollShadowCalc();
    }
  }

  /**
   * FF選択ボタン押下
   * @param fareFamilyInfo FF情報出力
   */
  public selectFareFamily(fareFamilyInfo: FareFamilyOutputType) {
    this.selectFareFamily$.emit(fareFamilyInfo);
  }

  /**
   * フライト再選択ボタン押下
   */
  public showOtherFlights() {
    this.showOtherFlights$.emit();
  }

  /**
   * 出発日ボタン押下
   * @param date 日時
   */
  public selectCalendar(date: string) {
    this.selectCalendar$.emit(date);
  }

  /**
   * スクロールボタン押下
   * @param type 押下種類
   */
  public scrollButtonClick(type: 'previous' | 'next') {
    // スクロール計算用の
    const calcElement = this._document.getElementById('fare-family-header-cont-heading-list');
    const headingWidth = (this._document.querySelector('.p-vacant-seat01__heading-wrap') as HTMLElement)?.offsetWidth;
    // スクロールする要素の横幅を取得
    let scroll_width = calcElement?.scrollWidth;
    if (scroll_width && headingWidth && scroll_width <= headingWidth) {
      this.scrollShadow$.next('none');
      return;
    }
    // アイテム一つの横幅を取得
    let items_scroll_width = (this._document.querySelector('.p-vacant-seat01__scroll-list') as HTMLElement)
      ?.scrollWidth;
    let items_client_width = (this._document.querySelector('.p-vacant-seat01__scroll-list') as HTMLElement)
      ?.offsetWidth;
    if (items_scroll_width && items_client_width) {
      // ボタン押下時にスクロール
      // スクロール量を設定
      let move_width = items_scroll_width - items_client_width;
      if (type === 'previous') {
        // 前へボタン
        // 右へスクロール
        this._document.querySelectorAll('.p-vacant-seat01__scroll-list')?.forEach((e) => {
          e?.scrollTo({
            left: 0,
            behavior: 'smooth',
          });
        });
        this.scrollShadow$.next('end');
      } else {
        // 次へボタン
        // 右へスクロール
        this._document.querySelectorAll('.p-vacant-seat01__scroll-list')?.forEach((e) => {
          e?.scrollTo({
            left: move_width - 2,
            behavior: 'smooth',
          });
        });
        this.scrollShadow$.next('start');
      }
    }
  }

  /**
   * スクロール連動の計算（国内の場合）
   */
  private _scrollShadowCalc() {
    // スクロール計算用の
    const calcElement = this._document.getElementById('fare-family-header-cont-heading-list');
    const headingWidth = (this._document.querySelector('.p-vacant-seat01__heading-wrap') as HTMLElement)?.offsetWidth;

    // スクロールする要素の横幅を取得
    let scroll_width = calcElement?.scrollWidth;
    if (scroll_width && headingWidth && scroll_width <= headingWidth) {
      this.scrollShadow$.next('none');
    } else {
      // 表示されている領域の横幅を取得
      let view_width = calcElement?.offsetWidth;
      // 表示領域以上の場合は影を追加
      if (calcElement && scroll_width && view_width && scroll_width >= view_width) {
        this.scrollShadow$.next('end');
      }
    }
  }
}
