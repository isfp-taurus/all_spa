import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Subject, timer } from 'rxjs';
import { FareFamiliesDetailsType } from '../../interfaces';
import { TranslatePrefix } from '@conf/index';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { RoundtripFppItemFareFamilyDataTypeInner, RoundtripFppRequestItinerariesInner } from '../../sdk';
import { MasterDataService } from '../../services';

/** 静的文言鍵 */
const TRANSLATE_KEY = {
  ECONOMY: 'label.economy',
  PREMIUMECONOMY: 'label.premiumEconomy',
  BUSINESS: 'label.business',
  FIRST: 'label.first',
};
/** 文言キーprefix */
const TRANSLATE_KEY_PREFIX = {
  FF_PRIORTY_CODE_I18N: 'm_ff_priority_code_i18n_',
};
/** 予約変更種別 */
const CONDITIONS_TYPE = {
  UNAVAILABLE: 'label.notPermit',
  AVAILABLE: 'label.permittedWithFee',
  FREE: 'label.permitted',
};

/** データコード */
const DATA_CODE = 'PD_002_';

/**
 * FFヘッダContComponent
 */
@Component({
  selector: 'asw-fare-family-header-cont',
  templateUrl: './fare-family-header-cont.component.html',
  styleUrls: ['./fare-family-header-cont.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FareFamilyHeaderContComponent implements OnInit, AfterViewInit {
  /**
   * Fare Family情報
   */
  @Input()
  public fareFamilies?: Array<RoundtripFppItemFareFamilyDataTypeInner>;

  /**
   * 無料預け入れ手荷物個数表示可否
   */
  @Input()
  public baggageFreeCheckedShow?: boolean;

  /**
   * プロモーションが存在する検索結果リスト(FF選択モーダルで使用される)
   */
  @Input()
  public hasPromotionsResult?: boolean;

  /**
   * 往復種別
   */
  @Input()
  public type?: 'out' | 'return';

  /**
   * 初期表示処理: FF概要表示切替=true(FF概要を表示する)とする
   */
  private _isOpen = true;
  @Input()
  public get isOpen(): boolean {
    return this._isOpen;
  }
  public set isOpen(value: BooleanInput) {
    this._isOpen = coerceBooleanProperty(value);
    if (this._isOpen) {
      timer(0).subscribe(() => {
        this._headHeightCalc();
      });
    }
  }

  /**
   * 全Air Bound情報フィルタ後選択不可
   */
  private _isAllUnableFareFamilyCodes: Array<string> = [];
  @Input()
  public get isAllUnableFareFamilyCodes(): Array<string> {
    return this._isAllUnableFareFamilyCodes;
  }
  public set isAllUnableFareFamilyCodes(value: Array<string> | undefined) {
    this._isAllUnableFareFamilyCodes = value || [];
    this._fareFamilyInit();
    if (this.fareFamilies && this._isAllUnableFareFamilyCodes?.length < this.fareFamilies.length) {
      timer(0).subscribe(() => {
        this._headCalc();
        this._headHeightCalc();
      });
    }
  }

  /**
   * 検索条件.区間毎の情報
   */
  @Input()
  public itineraries?: Array<RoundtripFppRequestItinerariesInner>;

  /**
   * 指定したキャビンクラス
   */
  @Input()
  public cabinClass?: string;

  /**
   * スクロール連動の計算の制御
   */
  @Input()
  public scrollShadow$?: Subject<'start' | 'end' | 'none'>;

  /**
   * FF概要表示切替ボタンイベント
   */
  @Output()
  public changeDisplay$: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * FF概要表示切替ボタンイベント
   */
  @Output()
  public headerAfterViewInit$: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * FFキャビンクラスヘッダの要素
   */
  @ViewChild('tsClassHead')
  public tsClassHead!: ElementRef;

  /**
   * FFヘッダ
   */
  public fareFamiliesHeader = new Set<string>();

  /**
   * FF詳細情報
   */
  public fareFamiliesDetails: Array<FareFamiliesDetailsType> = [];

  /**
   * 指定したキャビンクラス以外
   */
  public hasDiffCabinClass: boolean = false;

  constructor(private _renderer: Renderer2, private _el: ElementRef, private _masterDataService: MasterDataService) {}

  public ngAfterViewInit(): void {
    this.scrollShadow$?.subscribe((scroll) => {
      if (scroll === 'none') {
        // 左端の影
        const shadowStart = this._el.nativeElement.querySelector('.p-vacant-seat01__scroll-list');
        // 右端の影
        const shadowEnd = this._el.nativeElement.querySelector('.p-vacant-seat01__scroll-item--end');
        if (shadowEnd) {
          this._renderer.removeClass(shadowEnd, 'p-vacant-seat01__scroll-item--shadow');
        }
        if (shadowStart) {
          this._renderer.removeClass(shadowStart, 'p-vacant-seat01__scroll-item--shadow-right');
        }
        return;
      }
      // 左端の影
      const shadowStart = this._el.nativeElement.querySelector('.p-vacant-seat01__scroll-list');
      // 右端の影
      const shadowEnd = this._el.nativeElement.querySelector('.p-vacant-seat01__scroll-item--end');
      if (!(shadowStart && shadowEnd)) {
        return;
      }
      if (scroll === 'end') {
        // 次へボタンを表示
        this._renderer.removeClass(shadowStart, 'p-vacant-seat01__scroll-item--shadow-right');
        // 表示領域以上の場合は影を追加
        this._renderer.addClass(shadowEnd, 'p-vacant-seat01__scroll-item--shadow');
      } else if (scroll === 'start') {
        this._renderer.removeClass(shadowEnd, 'p-vacant-seat01__scroll-item--shadow');
        this._renderer.addClass(shadowStart, 'p-vacant-seat01__scroll-item--shadow-right');
      }
    });
    this.headerAfterViewInit$.emit(true);
  }

  /**
   * 初期化処理
   */
  public ngOnInit() {
    this._fareFamilyInit();
  }

  /**
   * ウィンドウのサイズ変更イベントをリッスンする
   */
  @HostListener('window:resize')
  public onResize() {
    this._headCalc();
    this._headHeightCalc();
  }

  /**
   * FF概要表示切替ボタン押下
   */
  public fareOverviewChange() {
    this.changeDisplay$.emit(!this.isOpen);
  }

  /**
   * キャビンクラス名称キーを取得する
   * ユーザ共通.言語情報毎の、データコード＝“PD_002”(表示用クラス名称)とvalue＝クラス名称コード(※)に紐づく、汎用マスターデータ(リスト).表示内容
   *
   * Fare Family情報.fareFamilyWithService.groupId
   *
   * @param cabin キャビンクラス
   * @returns クラス名称多言語キー
   */
  public getCabinClassKey(groupId: any): string {
    return `${TranslatePrefix.LIST_DATA}${DATA_CODE}${groupId}`;
  }

  /**
   * キャビンクラス読み上げ用ラベルキーを取得する
   *
   * @param cabin キャビンクラス
   * @returns クラス名称読み上げ用ラベル多言語キー
   */
  public getReaderCabinClassKey(cabin: any): string {
    switch (cabin) {
      case 'eco': {
        return TRANSLATE_KEY.ECONOMY;
      }
      case 'ecoPremium': {
        return TRANSLATE_KEY.PREMIUMECONOMY;
      }
      case 'business': {
        return TRANSLATE_KEY.BUSINESS;
      }
      case 'first': {
        return TRANSLATE_KEY.FIRST;
      }
      default:
        return TRANSLATE_KEY.ECONOMY;
    }
  }

  /**
   * FF名称キーを取得する
   *
   * @param priorityCode プライオリティコード
   * @returns プライオリティコード多言語キー
   */
  public getFFNameKey(priorityCode: string): string {
    return `${TRANSLATE_KEY_PREFIX.FF_PRIORTY_CODE_I18N}${priorityCode}`;
  }

  /**
   * priorityCodeに紐づくFF Priority Code.国内用FF URLを取得する
   *
   * @param priorityCode プライオリティコード
   * @returns 国内用FF URL
   */
  public getFFUrl(priorityCode: string) {
    return this._masterDataService.getFFUrlByPriorityCode(priorityCode);
  }

  /**
   * 予約変更可否キーを取得する
   *
   * @param changeConditionsType 予約変更種別
   * @returns 予約変更可否多言語キー
   */
  public getChangeConditionsKey(
    changeConditionsType: RoundtripFppItemFareFamilyDataTypeInner.ChangeConditionsTypeEnum
  ): string {
    /*
     Fare Family情報.changeConditionsType＝"withPenalty"(予約変更可能(手数料あり))	予約変更可(手数料有り)である旨
     Fare Family情報.changeConditionsType＝"free"(予約変更可能(手数料なし))	予約変更可(手数料無し)である旨
     上記以外	予約変更不可である旨
    */
    switch (changeConditionsType) {
      case 'withPenalty': {
        return CONDITIONS_TYPE.AVAILABLE;
      }
      case 'free': {
        return CONDITIONS_TYPE.FREE;
      }
      default:
        return CONDITIONS_TYPE.UNAVAILABLE;
    }
  }

  /**
   * 払戻可否キーを取得する
   *
   * @param refundConditionsType 払戻種別
   * @returns 払戻可否多言語キー
   */
  public getRefundConditionsKey(
    refundConditionsType: RoundtripFppItemFareFamilyDataTypeInner.RefundConditionsTypeEnum
  ): string {
    /*
     Fare Family情報.refundConditionsType＝"chargeable"(払戻可能(手数料あり))	払戻可(手数料有り)である旨
     Fare Family情報.refundConditionsType＝"free"(払戻可能(手数料なし))	払戻可(手数料無し)である旨
     上記以外	払戻不可である旨
    */
    switch (refundConditionsType) {
      case 'chargeable': {
        return CONDITIONS_TYPE.AVAILABLE;
      }
      case 'free': {
        return CONDITIONS_TYPE.FREE;
      }
      default:
        return CONDITIONS_TYPE.UNAVAILABLE;
    }
  }

  /**
   * FF情報初期化
   */
  private _fareFamilyInit() {
    this.fareFamiliesHeader.clear();
    this.fareFamiliesDetails = [];
    // 提携独自 SMDI_137-9183
    // s2との仕様gapにより横スクロールボタンが表示されないため、hasDiffCabinClassは無条件でtrueとする。
    this.hasDiffCabinClass = true;
    // FFヘッダのキャビンクラスを同じキャビンクラス同士で結合する。
    this.fareFamilies?.forEach((ff: any) => {
      if (!this._isAllUnableFareFamilyCodes.includes(ff.fareFamilyCode)) {
        const headerSize = this.fareFamiliesHeader.size;
        const isTop = !(headerSize === this.fareFamiliesHeader.size);
        this.fareFamiliesDetails.push({
          isTop: isTop,
          fareFamily: ff,
        });
      }
    });
  }

  /**
   * FFヘッダ位置の計算
   */
  private _headCalc() {
    const elementClass = this._el.nativeElement.querySelectorAll('.ts-class-top');
    const elementLength = Array.from(elementClass).length;
    Array.from(elementClass).forEach((element, i) => {
      const next = i + 1;
      if (next !== elementLength) {
        const targetLeft = (element as any).offsetLeft;
        const nextLeft = (elementClass[next] as any).offsetLeft;
        const targetWidth = nextLeft - targetLeft;
        this._renderer.setStyle(
          this.tsClassHead.nativeElement.querySelectorAll('.p-vacant-seat01__heading-title')[i],
          'width',
          `${targetWidth}px`
        );
      }
    });
  }

  /**
   * FFヘッダ高さの計算
   */
  private _headHeightCalc() {
    const overviewContents = this._el.nativeElement.querySelectorAll('.p-vacant-seat01__overview-contents');
    const overviewContentsLength = overviewContents.length;
    if (overviewContentsLength > 0) {
      const childrenLength = overviewContents[0].children.length;
      let heights: Array<number> = Array(childrenLength).fill(0);
      for (let i = 0; i < overviewContentsLength; i++) {
        for (let j = 0; j < childrenLength; j++) {
          if (overviewContents[i]?.children?.[j]?.children?.[1]?.offsetHeight > heights[j]) {
            heights[j] = overviewContents[i]?.children?.[j]?.children?.[1]?.offsetHeight;
          }
        }
      }
      const overviewHead = this._el.nativeElement.querySelector('.p-vacant-seat01__overview-heading');
      heights.forEach((height, i) => {
        if (height > 0) {
          this._renderer.setStyle(overviewHead.children?.[i], 'height', `${height}px`);
          for (let j = 0; j < overviewContentsLength; j++) {
            this._renderer.setStyle(overviewContents[j]?.children?.[i], 'height', `${height}px`);
          }
        }
      });
    }
  }
}
