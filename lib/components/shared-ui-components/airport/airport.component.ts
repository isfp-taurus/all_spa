/**
 * 空港選択部品
 *
 * */
// Angular
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
  DoCheck,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MasterStoreKey } from '@conf/asw-master.config';
import { SupportModalUiComponent } from '../../../components/support-class';
import { MOffice } from '../../../interfaces/m_office';
import { StaticMsgPipe } from '../../../pipes';
import { AswMasterService } from '../../../services';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { throttleTime } from 'rxjs/internal/operators/throttleTime';
import { Subject } from 'rxjs/internal/Subject';
import { delay, take } from 'rxjs/operators';
import { isPC, isSP, isTB, parameterSort } from 'src/lib/helpers';
import { Airport, breakpointPc, breakpointSp } from 'src/lib/interfaces';
import { CommonLibService } from 'src/lib/services/common-lib/common-lib.service';
import { AirportListParts, ComponentAirport, TerminalType } from './airport.state';

/**
 * 空港選択部品
 *
 * @param id HTMLに設定するID
 * @param required 必須設定
 * @param onChange 変更時実行処理
 * @param selectedAirport 選択した空港
 * @param airportListParts 空港リスト @see {@link AirportListParts}
 * @param airportFormControl フォームコントロール
 * @param oldAswTerm 旧国内ASW取扱検索条件フラグ true=フォーム非活性
 * @param ariaLabel 読み上げ用ラベル
 * @param innerHTML 埋め込み文字
 *
 * */
@Component({
  selector: 'asw-airport',
  templateUrl: './airport.component.html',
  styleUrls: ['./airport.scss'], //アニメーション用のCSSを追加
  providers: [StaticMsgPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AirportComponent extends SupportModalUiComponent implements AfterViewInit, DoCheck {
  constructor(
    private _common: CommonLibService,
    public changeDetector: ChangeDetectorRef,
    private _staticMsg: StaticMsgPipe,
    private _aswMasterService: AswMasterService
  ) {
    super(_common);
  }

  reload(): void {}
  init(): void {
    this.subscribeService('DateSelectorResize', fromEvent(window, 'resize').pipe(throttleTime(500)), this.resizeEvent);

    this.forkJoinService(
      'AirportMajorCityTrans',
      [this._staticMsg.get(this.staticMessage.majorCity), this._staticMsg.get(this.staticMessage.city)],
      (str) => {
        this._majorCityTrans = str[0];
        this._cityTrans = str[1];
        if (this._airportListParts) {
          //言語が変わった場合、空港リストを作り直し
          this.loadCache(); //言語別なのでcacheの取り直し
        }
      }
    );

    this.sendAirportListToParent();
  }

  ngAfterViewInit(): void {
    // 初期表示時にエラーがある場合にフォームのスタイルを変更する
    this.setInitFormStatus();
    if (this.selectedCompAirport) {
      this.airportFormControl.setValue(this.selectedCompAirport.displayName);
    } else {
      this.airportFormControl.setValue(null);
    }
    this.changeDetector.detectChanges();
  }

  ngDoCheck(): void {
    if (this.airportFormControl && this.airportFormControl.touched) {
      this.changeDetector.markForCheck();
    }
  }

  destroy(): void {}

  public loadCache() {
    const langPrefix = '_' + this._common.aswContextStoreService.aswContextData.lang;
    this.subscribeService('airportAkamaiData', this._aswMasterService.getAswMaster$(), (data) => {
      this.airportListAkamai = data[MasterStoreKey.DEPARTUREAIRPORT_ALL] || [];
      this.airportDepartureListAkamai = data[MasterStoreKey.DEPARTUREAIRPORT_ALL] || [];
      this.airporDestinationListAkamai = data[MasterStoreKey.DESTINATIONAIRPORT_ALL] || [];
      this.officeAll = data[MasterStoreKey.OFFICE_ALL] || [];
      this.currentOffice = this.officeAll.find(
        (office) => office.office_code === this._common.aswContextStoreService.aswContextData.pointOfSaleId
      );
      this.initAkamai = true;
      if (this._airportListParts) {
        this.refreshList(this._airportListParts);
      }
    });
  }

  detectScreenSize: any = (): boolean => document.body.offsetWidth < breakpointPc;

  /**
   * 画面サイズ変更時のイベント
   */
  private resizeEvent = () => {
    this.isSP = isSP();
    this.isPC = isPC();
    this.isTB = isTB();
    if (this.isModalOpen) {
      if (!this.isSP) {
        if (this.modalInitialHeight === 0) {
          const modalBodyContents = this.isTB ? this.modalBody : this.modalAirportListArea;
          if (modalBodyContents) {
            //参考 modal02のmax-height: calc(100vh - 64px - 64px);
            this.modalInitialHeight = modalBodyContents.nativeElement.height;
          }
        }
        this.resize();
      } else {
        this.resizeSp();
      }
      this.changeDetector.markForCheck();
    }
  };

  /**
   * viewChild定義
   */
  @ViewChild('modalContents') modalContents!: ElementRef; //PC版空港一覧モーダル サイズの参照に使用
  @ViewChild('modalHead') modalHead!: ElementRef; //PC版空港一覧モーダルのヘッダ サイズの参照に使用
  @ViewChild('modalFooter') modalFooter!: ElementRef; //PC版空港一覧フッタ サイズの参照に使用 ※存在しないがサンプルで記載があったので
  @ViewChild('modalBody') modalBody!: ElementRef; //PC版空港一覧モーダル コンテンツ部分 スクロールバー表示用の高さを指定
  @ViewChild('modalAirportListArea') modalAirportListArea!: ElementRef; //PC版空港一覧リスト サイズの参照に使用
  @ViewChild('inputAirport') inputAirport!: ElementRef; //インプットフィールド フォーカスセットに使用

  /**
   * 組み込み元からの設定、受け渡し
   */

  @Input() public required = false;

  // 変更時実行処理
  @Output() changeEvent = new EventEmitter<Airport>();

  // 選択した空港
  @Input() set selectedAirport(value: Airport | null) {
    this.setAirport(value);
  }
  get selectedAirport(): Airport | null {
    return this.selectedCompAirport;
  }

  @Output() selectedAirportChange = new EventEmitter<Airport | null>();

  // 選択した空港 内部用
  public _selectedCompAirport: ComponentAirport | null = null;
  get selectedCompAirport(): ComponentAirport | null {
    return this._selectedCompAirport;
  }
  set selectedCompAirport(value: ComponentAirport | null) {
    this._selectedCompAirport = value;
    this.selectedAirportChange.emit(value);
  }

  // 組み込み元からの設定 受け取り時、内部で処理したい＆HTMLの記述を減らしたいのでまとめて1つのオブジェクトにしている
  public _airportListParts!: AirportListParts;
  @Input() get airportListParts() {
    return this._airportListParts;
  }
  set airportListParts(data: AirportListParts) {
    this._airportListParts = data;
    this.refreshList(data); // 設定された場合内部で使用するリストを作成
  }

  // フォーム
  @Input() public airportFormControl = new FormControl('');

  // 空港一覧を親コンポーネントへ提供
  @Output() private airportListToParent = new EventEmitter<any>();

  // 旧国内ASW取扱検索条件フラグ
  @Input() public oldAswTerm = false;

  // 読み上げ用ラベル
  @Input() public ariaLabel = '';

  // 埋め込み文字
  @Input() public innerHTML = '';

  // 区間番号
  @Input() public boundIndex = -1;

  // 読み上げ用ラベル（区間番号）
  @Input() public ariaLabelSectionNumber = '';

  // フォームの状態変更イベント
  @Output() public airportFormControlChanged = new EventEmitter<any>();
  @Output() public showErrorStatusChanged = new EventEmitter<boolean>();
  @Output() public blurredStatusChanged = new EventEmitter<boolean>();
  @Output() public isInvalidStatusChanged = new EventEmitter<boolean>();
  @Output() public isFocusStatusChanged = new EventEmitter<boolean>();
  @Output() public touchedStatusChanged = new EventEmitter<boolean>();
  @Output() public isModalOpenStatusChanged = new EventEmitter<boolean>();
  @Output() public errorsStatusChanged = new EventEmitter<string[]>();

  /**
   * 内部で使用する変数
   */
  public inputLabel = ''; // テキストボックスのラベル
  private isRound = false; // 往復かどうか airport-roundへエラーを渡すために使用
  public isModalOpen = false; // 空港一覧モーダルの表示フラグ
  public suggestOpen = false; // サジェストリストの表示フラグ
  public windowWidth = 0; // ブラウザの画面幅
  public isPC = false; // PCかどうか
  public isTB = false; // タブレットかどうか
  public isSP = false; // スマホかどうか
  public modalInitialHeight = 0; // 空港一覧モーダルの初期高さ。スクロールバーの表示判定に使用
  public suggestFocusId = ''; // 現在サジェスト空港でフォーカスされている空港のID、サジェストのキー移動で使用
  public isFocus = false; // テキストボックスのフォーカス状態の判定 ngClassに使用
  public blurred = false; // テキストボックスがフォーカスアウトされたかの判定 バリデーション表示に使用
  public touched = false; // テキストボックスがtouchedかの判定 バリデーション表示に使用
  public isInvalid = false; // テキストボックスが有効な値かの判定 バリデーション表示に使用
  public initAkamai = false; //akamaiキャッシュの初回取得フラグ
  public focusElement?: any; //focus要素
  private _beforeAiportFormControlValue: string | null = null; // フォームの値を一時格納 モーダル表示時に使用
  private _suggestKeep: number = 0; //サジェストの比較検証用に使用

  //　初期化完了通知
  public initAirport$ = new Subject();
  private _setAirportRes: { airport?: Airport | null } = {};
  public initAirport = false;

  /**翻訳後の文字列 */
  private _majorCityTrans = '';
  private _cityTrans = '';

  /**
   * 内部で保持するリスト
   */
  public airportList: ComponentAirport[] = []; // 空港リスト
  public airportListView: ComponentAirport[] = []; // 空港一覧表示用リスト
  public suggestAirportList: ComponentAirport[] = []; // サジェスト表示用の空港リスト

  // デフォルトデータ
  public airportListAkamai: Airport[] = [];
  public airportDepartureListAkamai: Airport[] = [];
  public airporDestinationListAkamai: Airport[] = [];
  public officeAll: MOffice[] = [];
  public currentOffice?: MOffice;

  // 静的文言
  public staticMessage = {
    inputLabel: 'label.departureLocation',
    majorCity: 'heading.majorAirports',
    city: 'heading.cities',
    selectMessage: 'heading.pleaseSelectLocation',
    inputPlaceholder: 'placeholder.pleaseSelectOrInputCity',
    howToOpenAirportList: 'reader.howToOpenAirportList',
    suggestMessage: 'reader.numberOfResults',
    viewAirportList: 'alt.viewAirportList',
    toggle: 'alt.toggle',
    clear: 'reader.clearInputInformation',
    close: 'alt.closeModal',
  };

  public staticMessageModalTitle = '';

  /**
   * 組み込み元からの設定に基づき内部保持用のリストを作成
   */
  public refreshList(data: AirportListParts) {
    //AKAMAI初期化完了、または外部から空港が渡されない限り初期化を行わない
    if (!this.initAkamai && data.airportList === undefined) {
      return;
    }

    this.inputLabel = data.inputLabel ?? '';

    //空港の絞り込み
    const _airportList =
      data.airportList ||
      (data.terminalType === TerminalType.DEPARTURE
        ? this.airportDepartureListAkamai
        : data.terminalType === TerminalType.DESTINATION
        ? this.airporDestinationListAkamai
        : this.airportListAkamai);

    this.inputLabel = data.inputLabel ?? '';

    if (data.inputLabel === this._staticMsg.transform('label.departureLocation')) {
      // 出発地
      this.staticMessageModalTitle = 'heading.pleaseSelectDepartureLocation';
      this.ariaLabelSectionNumber = 'reader.departureLocation.number';
    } else if (data.inputLabel === this._staticMsg.transform('label.arrivalLocation')) {
      // 到着地
      this.staticMessageModalTitle = 'heading.pleaseSelectArrivalLocation';
      this.ariaLabelSectionNumber = 'reader.arrivalLocation.number';
    }

    // 区間ありの場合
    if (Number.isFinite(Number(this.id.slice(-1)))) {
      this.boundIndex = Number(this.id.slice(-1));
    }

    // 内部で使用する、空港リストに加工
    const compAirport = _airportList.map((airport, index) => {
      return <ComponentAirport>{
        ...airport,
        displayName: airport.name,
        id: this.id + 'suggestpc' + index,
      };
    });

    this.airportList = compAirport;

    // 項目ラベルの設定
    if (data.terminalType === TerminalType.DEPARTURE) {
      this.staticMessage.inputLabel = 'label.departureLocation';
    } else if (data.terminalType === TerminalType.DESTINATION) {
      this.staticMessage.inputLabel = 'label.arrivalLocation';
    } else {
      this.staticMessage.inputLabel = '';
    }

    //表示用の空港リストを作成
    const filteredAirports = compAirport.filter((airport) => !airport.low_frequency_flag);
    this.airportListView = parameterSort(filteredAirports, 'order');

    /** AKAMAIのキャッシュ取得待ちを行うため、リスト作成前に初期値がセットされる場合がある
     * そのため内部用の初期化フラグを持ち、リスト作成前に初期値がセットされていたらこのタイミングで再実施する。
     */
    this.initAirport = true;
    if (this._setAirportRes.airport) {
      this.setAirport(this._setAirportRes.airport);
      if (this.initAkamai) {
        //AKAMAIの設定が完了するまで初期化のたびにセットする
        this._setAirportRes = {};
      }
    }
    this.initAirport$.next(null);
    this.changeDetector.markForCheck();
  }

  /**
   * サジェストリストの方向キー操作
   * @param add サジェストリストのフォーカスを現在地からいくつ動かすか(+:下方向 -:上方向)
   *
   */
  private suggestUpdate(add: number) {
    if (!this.suggestOpen || add === 0) {
      // サジェストが開いていない、0の場合処理せず終了
      return;
    }
    const index = this.suggestAirportList.findIndex((air) => air.id === this.suggestFocusId);
    let nextIndex = index;

    if (index < 0) {
      //フォーカスがまだ当たっていないときの処理(初期)
      if (0 < add) {
        nextIndex = 0;
      } else {
        nextIndex = nextIndex = this.suggestAirportList.length - 1;
      }
    } else {
      nextIndex = index + add;
      if (nextIndex < 0) {
        nextIndex = this.suggestAirportList.length - 1;
      } else if (this.suggestAirportList.length <= nextIndex) {
        nextIndex = 0;
      }
    }
    // フォーカスをあてるDOMにaria-selectedを付与し元のDOMからは削除する
    const elBefore = index < 0 ? null : document.getElementById(this.suggestAirportList[index].id);
    const elNext = document.getElementById(this.suggestAirportList[nextIndex].id);
    if (elNext) {
      if (elBefore?.id === this.suggestFocusId) {
        elBefore.removeAttribute('aria-selected');
      }
      elNext.setAttribute('aria-selected', 'true');
      this.suggestFocusId = this.suggestAirportList[nextIndex].id;
    }
  }

  /**
   * サジェストリストの方向キー操作
   * @param event キーボードイベント
   * @return キーの有効フラグ
   */
  public inputKeyDown(event: KeyboardEvent): boolean {
    let add = 0;
    let enter = false;
    switch (event.key) {
      case 'ArrowUp':
        add = -1;
        break;
      case 'ArrowDown':
        add = 1;
        break;
      case 'Enter':
        enter = true;
        break;
      default:
        break;
    }
    if (enter) {
      const airport = this.suggestAirportList.find((air) => air.id === this.suggestFocusId);
      if (airport !== undefined) {
        this.clickAirport(airport);
      } else {
        this.suggestEvent();
      }
    }
    if (add === 0) {
      return true;
    }
    this.suggestUpdate(add);
    return false;
  }

  /**
   * 空港一覧モーダルの表示
   */
  public openAirport() {
    this.isModalOpen = true;
    this.focusElement = document.activeElement;
    this.isModalOpenStatusChanged.emit(this.isModalOpen);
    this._beforeAiportFormControlValue = this.airportFormControl.value;
    this.airportFormControl.patchValue('');
    this.airportFormControl.markAsTouched();
    this.touchedStatusChanged.emit(this.airportFormControl.touched);
    this.windowWidth = window.innerWidth;
    this.isPC = isPC();
    this.isTB = isTB();
    this.isSP = isSP();
    //描画後に処理を行う
    const resizeObserver = new ResizeObserver(() => {
      if (!this.isSP) {
        if (this.modalInitialHeight === 0) {
          const modalBodyContents = this.isTB ? this.modalBody : this.modalAirportListArea;
          if (modalBodyContents) {
            //参考 modal02のmax-height: calc(100vh - 64px - 64px);
            this.modalInitialHeight = modalBodyContents.nativeElement.height;
          }
        }
        this.resize();
      } else {
        this.resizeSp();
      }
      //処理を行うのは1度のみでいいのでunobserveする
      resizeObserver.unobserve(this.modalHead.nativeElement);
    });
    resizeObserver.observe(this.modalHead.nativeElement);
  }

  /**
   * 空港一覧モーダルを閉じる
   */
  public closeAirport() {
    this.isModalOpen = false;
    this.isModalOpenStatusChanged.emit(this.isModalOpen);
    this._selectedCompAirport
      ? this.airportFormControl.patchValue(this._selectedCompAirport.displayName)
      : this.airportFormControl.patchValue(this._beforeAiportFormControlValue);
    // モーダル起動時にした設定をクリア 消しておかないとSPモーダル表示⇒閉じる⇒ウィンドウ幅変更（PC）でサジェストが出ない
    this.isPC = false;
    this.isTB = false;
    this.isSP = false;
    if (this.focusElement) {
      this.focusElement.focus();
    }
    this.changeDetector.markForCheck();
  }

  public onEscapeEvent(): void {
    this.closeAirport();
  }

  /**
   * テキストボックスに入力があった場合の処理
   */
  public changeInput(event: Event) {
    this.selectedCompAirport = null;
    const inputValue = (event.target as HTMLInputElement).value;
    this.airportFormControl.setValue(inputValue);
    this.suggestEvent();
  }

  /**
   * テキストボックスがフォーカスされた時
   */
  public focusInput() {
    this.suggestEvent();
    this.isFocus = true;
    this.blurred = false;
    this.isFocusStatusChanged.emit(this.isFocus);
    this.blurredStatusChanged.emit(this.blurred);
  }

  /**
   * サジェストの表示非表示切替処理
   */
  public suggestEvent() {
    this.suggestFocusId = '';
    // フォームに前回のサジェストの内容が含まれている場合はサジェストを表示しない
    if (this.airportFormControl.value === this.selectedCompAirport?.displayName) {
      return;
    }
    //　全角文字があるまたは半角３文字以上の時
    if (
      this.airportFormControl.value &&
      (this.airportFormControl.value.match(/^[^\x01-\x7E\uFF61-\uFF9F]+$/) || 3 <= this.airportFormControl.value.length)
    ) {
      this.suggestAirportList = this.getSuggestAirportList();
      if (0 < this.suggestAirportList.length) {
        this.suggestOpen = true;
        const el = document.getElementById(this.id + 'suggest-list');
        if (el) {
          //すでについているaria-selectedを削除
          for (let i = 0; i < el.children.length; i++) {
            el.children[i].removeAttribute('aria-selected');
          }
        }
        //取得したサジェスト件数と保持しているサジェスト件数に差異がある場合、suggstKeepに代入
        if (this._suggestKeep !== this.suggestAirportList.length) {
          this._suggestKeep = this.suggestAirportList.length;
        }
        //suggestKeepが0以外の場合、以下の処理を実施。
        if (this._suggestKeep !== 0) {
          this._common.notificationStoreService.updateNotification({
            politeMessage: '',
          });
        }
        // 一覧表示件数の読み上げ
        this.subscribeService(
          'AirportUpdateNotification',
          this._staticMsg
            .get(this.staticMessage.suggestMessage, { 0: this.suggestAirportList.length.toString() })
            .pipe(take(1), delay(1000)),
          (str) => {
            this._common.notificationStoreService.updateNotification({
              politeMessage: str,
            });
          }
        );
      } else {
        this.suggestOpen = false;
      }
    } else {
      this.suggestOpen = false;
    }
  }

  /**
   * テキストボックスのフォーカスが外れた時の処理
   */
  public blurInput(isClose?: boolean) {
    if (this.selectedCompAirport !== null && this.airportFormControl.value !== this.selectedCompAirport.displayName) {
      // 選択後文字を削除したなどの場合選択空港は無効
      this.selectedCompAirport = null;
    }
    if (this.selectedCompAirport === null && !this.suggestOpen) {
      // 空港を選択していないかつサジェストが表示されていない場合
      this.changeEvent?.emit();
    }
    if (this.selectedCompAirport === null && this.suggestOpen) {
      if (this.suggestAirportList.length !== 0 && this.airportFormControl.value) {
        // 空港を選択していないかつサジェストが表示している場合は一番上を自動選択
        this.clickAirport(this.suggestAirportList[0], isClose);
      }
    }
    this.isFocus = false;
    this.suggestOpen = false;
    this.blurred = true;

    // 往復の場合はもう片方のフォームのバリデーションを再評価する
    this.airportFormControlChanged.emit();

    this.isFocusStatusChanged.emit(this.isFocus);
    this.blurredStatusChanged.emit(this.blurred);
    this.touchedStatusChanged.emit(true);
  }

  /**
   * クリアボタンフォーカスアウト時の処理
   */
  public blurClear() {
    this.isFocus = false;
  }

  /**
   * クリアボタンフォーカスイン時の処理
   */
  public focusClear() {
    this.isFocus = true;
  }

  /**
   * テキストボックスクリア時の処理
   */
  public onClickClear() {
    this.airportFormControl.patchValue('');
    this.selectedCompAirport = null;
    this.changeEvent?.emit();
    this.airportFormControlChanged.emit();
    this.blurClear();
  }

  /**
   * サジェスト空港を取得する
   */
  public getSuggestAirportList(): ComponentAirport[] {
    const lowerStr = this.airportFormControl.value?.toLowerCase().replace(/ /g, '') ?? '';
    if (lowerStr.length === 0) {
      return [];
    }
    const filteredAirportList = this.airportList.filter(
      (airport) =>
        airport.name.toLowerCase().includes(lowerStr) ||
        airport.english_name.toLowerCase().includes(lowerStr) ||
        airport.search_for_airport_code.toLowerCase().includes(lowerStr) ||
        airport.displayName.toLowerCase().includes(lowerStr)
    );
    // 入力値と一致する3レターの空港にフィルタリングする
    const matchedAirport = filteredAirportList.filter((airport) => airport.airport_code.toLowerCase() === lowerStr);
    // 名称に入力値を含む主要空港のみにフィルタリングし、表示順に並び替える
    const primaryAirports = filteredAirportList
      .filter((airport) => airport.frequency_used >= 1 && airport.airport_code.toLowerCase() !== lowerStr)
      .sort((a, b) => a.frequency_used - b.frequency_used);
    // 名称に入力値を含む主要空港以外の空港のみにフィルタリングする
    const notPrimaryAirports = filteredAirportList.filter(
      (airport) => airport.frequency_used === 0 && airport.airport_code.toLowerCase() !== lowerStr
    );

    return [...matchedAirport, ...primaryAirports, ...notPrimaryAirports];
  }

  /**
   * 空港選択時、空港一覧、サジェスト共用
   * @param airport 選択した空港
   */
  public clickAirport(airport: ComponentAirport, isClose = true) {
    this.airportFormControl.patchValue(airport.displayName);
    this.selectedCompAirport = airport;
    this.changeEvent?.emit(airport);
    if (isClose) {
      this.closeAirport();
    }
    this.suggestOpen = false;
    this.suggestAirportList = [];

    // 往復の場合はもう片方のフォームのバリデーションを再評価する
    this.airportFormControlChanged.emit();
  }

  /**
   * 指定した空港が当部品で選択可能か
   * @param airport 選択した空港
   * @return true:選択可能 false:選択不可
   */
  public checkAirport(airport: ComponentAirport | Airport | null): boolean {
    if (airport === null) return true;
    return this.airportList.some((data) => data.airport_code === airport.airport_code); //HACK any matchライブラリをインストールしたほうがいいかも
  }

  /**
   * 指定した空港を当部品に設定する
   * @param airport 選択した空港
   */
  public setCompAirport(airport: ComponentAirport | null, isClose = true) {
    if (this.checkAirport(airport)) {
      if (airport) {
        this.airportFormControl.patchValue(airport.displayName, { onlySelf: true, emitEvent: false });
        this.airportFormControl.updateValueAndValidity();
        this.selectedCompAirport = airport;
      } else {
        this.airportFormControl.patchValue('');
        this.airportFormControl.updateValueAndValidity();
        this.selectedCompAirport = null;
      }
    }
  }

  /**
   * 指定した空港を当部品に設定する 組み込み元指定用
   * @param airport 選択した空港
   */
  public setAirport(airport: Airport | null, isClose = true) {
    if (!this.initAirport) {
      //初期化前にセットされた場合いったん保留
      this._setAirportRes = { airport: airport };
      return;
    }
    this.setCompAirport(this.airportList.find((data) => data.airport_code === airport?.airport_code) || null, isClose);
    this.changeDetector.markForCheck();
  }

  /**
   * 指定したフォームにフォーカスを設定する 組み込み元指定用
   */
  public setFocusAirportField(): void {
    this.inputAirport.nativeElement.focus();
  }

  /**
   * PC,TAB用 スクロールバー表示切替処理
   */
  private resize() {
    const windowH = window.innerHeight;
    const modalH = this.modalContents ? this.modalContents.nativeElement.offsetHeight : 0;
    const headerH = this.modalHead ? this.modalHead.nativeElement.offsetHeight : 0;
    const footerH = this.modalFooter ? this.modalFooter.nativeElement.offsetHeight : 0;
    const marginVal = windowH == modalH && !window.matchMedia('(max-width: ' + breakpointSp + 'px)').matches ? 0 : 64;
    const margin = window.matchMedia('(max-width: ' + breakpointSp + 'px)').matches ? marginVal : marginVal * 2;
    const setVal = windowH - margin - headerH - footerH;
    const windowWidth = window.innerWidth; //ｊQueryコードではWidthだけどとれない・・・

    const modalBodyEl: HTMLDivElement = this.modalBody.nativeElement;
    const modalAirportListAreaEl: HTMLDivElement = this.modalAirportListArea.nativeElement;
    const modalBodyContentsEl = this.isTB ? modalBodyEl : modalAirportListAreaEl;

    if (modalBodyContentsEl && modalAirportListAreaEl) {
      const setHeight = (element: HTMLDivElement, value: string) => {
        element.style.height = value;
      };
      const setScrollHeight = (element: HTMLDivElement, height: number) => {
        element.style.height = element && element.scrollHeight >= height ? `${height}px` : 'auto';
      };
      // コンテンツ領域の高さがモーダルの初期値を超えた場合
      if (setVal > this.modalInitialHeight) {
        setHeight(modalBodyContentsEl, `${this.modalInitialHeight}px`);
        // TAB版の場合
        if (windowWidth < breakpointPc) {
          setHeight(modalAirportListAreaEl, 'auto');
          // PC版の場合、モーダルの高さを与えることでスクロールを表示する
        } else {
          setScrollHeight(modalAirportListAreaEl, this.modalInitialHeight);
        }
      } else {
        setHeight(modalBodyContentsEl, `${setVal}px`);
        if (windowWidth < breakpointPc) {
          setHeight(modalAirportListAreaEl, 'auto');
        } else {
          setScrollHeight(modalAirportListAreaEl, setVal);
          // PC版の場合、モーダル本体の高さを初期化する
          setHeight(modalBodyEl, '');
        }
      }
    }
  }

  /**
   * SP用 スクロールバー表示切替処理
   */
  private resizeSp() {
    const windowH = window.innerHeight;
    const headerH = this.modalHead.nativeElement.offsetHeight;
    const marginVal = 48;
    const margin = marginVal;
    const setVal = windowH - margin - headerH;
    this.modalBody.nativeElement.style.height = setVal + 'px';
  }

  /**
   * 空港一覧を親コンポーネントへ渡す
   */
  private sendAirportListToParent() {
    const data = this.airportList;
    this.airportListToParent.emit(data);
  }

  /**
   * エラー表示判定
   * - controlがinvalid（チェックエラー）かつフォーカスが外された場合に表示
   */
  public get showError(): boolean {
    if (!this.airportFormControl || !this.airportFormControl.errors) {
      return false;
    }
    const error = this.invalid;
    this.showErrorStatusChanged.emit(error);
    return error;
  }

  /**
   * controlのinvalid（チェックエラー）状態
   */
  private get invalid(): boolean {
    return this.airportFormControl ? !!this.airportFormControl.invalid : false;
  }

  /**
   * controlよりエラー情報取得
   */
  public get errors(): string[] {
    if (!this.airportFormControl || !this.airportFormControl.errors) {
      return [];
    }
    const { errors } = this.airportFormControl;

    // 往復の場合はエラー文言をairport-roundに渡す
    if (this.isRound) {
      this.errorsStatusChanged.emit(Object.values(errors));
      return [];
    } else {
      return Object.values(errors);
    }
  }

  /**
   * フォームが往復用であることの通知 \
   * airport-roundへエラー文言を渡すために使用
   */
  public changeToRound(): void {
    this.isRound = true;
  }

  /**
   * フォームの初期状態の設定 \
   * airport-roundへ状態を渡す
   */
  private setInitFormStatus(): void {
    const formStatus = () => {
      this.touched = this.airportFormControl.touched;
      this.isInvalid = this.airportFormControl.invalid;
      this.touchedStatusChanged.emit(this.touched);
      this.isInvalidStatusChanged.emit(this.isInvalid);
    };

    this.airportFormControl.valueChanges.subscribe(formStatus);
    this.airportFormControl.statusChanges.subscribe(formStatus);
  }
}
