import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { FlightSearchCondition } from '../../../interfaces';
import { timer } from 'rxjs';

/**
 * 検索結果操作部PresComponent
 */
@Component({
  selector: 'asw-result-flight-function-pres',
  templateUrl: './result-flight-function-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultFlightFunctionPresComponent implements AfterViewInit {
  /**
   * 検索条件
   */
  @Input()
  public searchCondition?: FlightSearchCondition;

  /**
   * キャビンクラス切替
   */
  @Input()
  public domesticCabin?: string[];

  /**
   * 現在表示されている運賃オプションタイプ
   */
  @Input()
  public fareButtonLabel?: string;

  /**
   * 現在表示されている並べ替え順序
   */
  @Input()
  public sortButtonLabel?: string;

  /**
   * 検索結果操作部.運賃オプション切替ボタン表示条件
   */
  @Input()
  public isFareOptionDisplay?: boolean;

  /**
   * お気に入り登録済み
   */
  @Input()
  public isRegisteredFavorite?: boolean;

  /**
   * ログインステータス≠未ログイン
   */
  @Input()
  public isNotLogin?: boolean;

  /**
   * 往路:選択中状態
   *
   * unSelected: 未選択
   * selected: 選択済み
   */
  @Input()
  public outStatus?: 'unSelected' | 'selected';

  /**
   * 復路:選択中状態
   *
   * unSelected: 未選択
   * selected: 選択済み
   */
  @Input()
  public returnStatus?: 'unSelected' | 'selected';

  /**
   * フィルターを開く
   */
  @Output()
  public openFilter$: EventEmitter<void> = new EventEmitter<void>();

  /**
   * ソートを開く
   */
  @Output()
  public openSort$: EventEmitter<void> = new EventEmitter<void>();

  /**
   * キャビンクラス切替
   */
  @Output()
  public changeCabin$: EventEmitter<string> = new EventEmitter<string>();

  /**
   * お気に入り追加
   */
  @Output()
  public addToFavorite$: EventEmitter<void> = new EventEmitter<void>();

  /**
   * キャビンクラス切替
   */
  public carouselShow = true;

  @HostListener('window:resize')
  public onResize() {
    this.carouselShowCalc();
  }

  constructor(private _el: ElementRef, private _changeDetectorRef: ChangeDetectorRef) {}

  public ngAfterViewInit() {
    timer(0).subscribe(() => {
      this.carouselShowCalc();
    });
  }

  /**
   * カーソル表示判定
   */
  public carouselShowCalc() {
    const fullCarouselWidth = this._el.nativeElement.querySelector('.carousel-content').offsetWidth;
    const itemsElement = this._el.nativeElement.querySelectorAll('.p-result-function__item');
    let itemsWidth = 0;
    if (itemsElement && itemsElement.length > 0) {
      itemsElement.forEach((element: any) => {
        itemsWidth = itemsWidth + element.offsetWidth;
      });
    }
    itemsWidth = itemsWidth + (itemsElement.length - 1) * 16;
    if (itemsWidth <= fullCarouselWidth) {
      this.carouselShow = false;
    } else {
      this.carouselShow = true;
    }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * フィルタ条件表示ボタン押下処理
   */
  public openFilter() {
    this.openFilter$.emit();
  }

  /**
   * ソート条件表示ボタン押下処理
   */
  public openSort() {
    this.openSort$.emit();
  }

  /**
   * キャビンクラス切替ボタン押下処理
   */
  public changeCabin(cabin: string) {
    this.changeCabin$.emit(cabin);
  }

  /**
   * お気に入り追加ボタン押下処理
   */
  public addToFavorite() {
    this.addToFavorite$.emit();
  }
}
