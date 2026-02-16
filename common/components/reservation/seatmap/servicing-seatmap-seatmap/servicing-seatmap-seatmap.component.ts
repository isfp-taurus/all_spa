import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  Renderer2,
} from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { PassengerForServicingSeatmapScreen, SeatForServicingSeatmapScreen, SeatInfo } from '@common/interfaces';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService } from '@lib/services';
import { SeatmapHelperService } from '../../../../services/seatmap/seatmap-helper.service';
import {
  GetSeatmapsResponse,
  GetSeatmapsResponseDataSeatmapsDecksInner,
  GetSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInner,
  GetSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInnerColumnsInner,
  GetSeatmapsResponseDataSeatmapsDecksInnerSeatsRowsInnerRowFacilities,
  Type1,
} from 'src/sdk-servicing';
import { GetSeatmapsStoreService } from '@common/services/api-store/sdk-servicing/get-seatmaps-store/get-seatmaps-store.service';
import { splitArray } from '@common/helper/array';
import { splitCouchSeatNumber } from '@common/helper/common/seatmap.helper';
import { NumberOfColumnsInDeck } from '@common/interfaces/servicing-seatmap';
import { getClassNameByCabinCodeByDynamic } from '../../../../helper/common/seatmap.helper';
import { CabinClasses } from '@common/interfaces/common/cabinClasses';
import { ServicingSeatmapSeatmapService } from './servicing-seatmap-seatmap.service';
import { AppConstants } from '@conf/app.constants';

@Component({
  selector: 'asw-servicing-seatmap-seatmap',
  templateUrl: './servicing-seatmap-seatmap.component.html',
  styleUrls: ['./servicing-seatmap-seatmap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicingSeatmapSeatmapComponent extends SupportComponent {
  /** 2階デッキが存在するか */
  @Input() isExistUpper = true;

  /** 1階デッキが存在するか */
  @Input() isExistMain = false;

  /** 搭乗者IDリスト */
  @Input() passengerIdList?: string[];

  /** 搭乗者リスト */
  @Input() passengers?: Map<string, PassengerForServicingSeatmapScreen>;

  /** セグメント表示対象 */
  @Input() displayTargetSegment?: Type1;

  /** 座席情報マップ */
  @Input() seatInformationMap?: Map<string, SeatForServicingSeatmapScreen>;

  /** 選択中の搭乗者のID */
  @Input() selectingPassengerId?: string;

  /** 選択中の座席情報リスト */
  @Input() selectedSeatInfoList?: SeatInfo[];

  /** 表示対象セグメントID */
  @Input() displayTargetSegmentId?: string;

  /** Informative かどうか */
  @Input() isInformative = false;

  /** キャビンクラス */
  @Input() cabinClasses?: CabinClasses;

  //ブッキングクラス
  @Input() bookingClass?: string;

  /** 初期表示デッキ */
  @Input() initialDeckType?: GetSeatmapsResponseDataSeatmapsDecksInner.DeckTypeEnum;

  /** 座席変更不可かどうか */
  @Input() isChangeRestrictedAllSeat: boolean = false;

  /** 座席のクリックイベント */
  @Output() clickSeat = new EventEmitter<string>();

  /** 選択中のデッキ */
  selectedDeckType?: GetSeatmapsResponseDataSeatmapsDecksInner.DeckTypeEnum;

  /** シートマップAPIのレスポンス */
  private _seatmapResponse?: GetSeatmapsResponse;
  /** シートマップAPIのレスポンス */
  set seatmapResponse(value: GetSeatmapsResponse | undefined) {
    this._seatmapResponse = value;

    // デッキの列数を算出する
    this.numberOfColumnsInDecks.clear();
    if (!!this._seatmapResponse?.data?.seatmaps.decks) {
      for (const deck of this._seatmapResponse?.data.seatmaps.decks) {
        const numberOfColumns = this.numberOfColumnsInDeck(deck);
        if (!!numberOfColumns) {
          this.numberOfColumnsInDecks.set(deck.deckType, numberOfColumns);
        }
      }
    }

    this._changeDetector.markForCheck();
  }
  get seatmapResponse(): GetSeatmapsResponse | undefined {
    return this._seatmapResponse;
  }

  /** デッキの左列、中央列、右列の列数 */
  private numberOfColumnsInDecks: Map<
    GetSeatmapsResponseDataSeatmapsDecksInner.DeckTypeEnum | undefined,
    NumberOfColumnsInDeck
  > = new Map();

  /** 画像ファイルパス定数用 */
  public appConstants = AppConstants;

  constructor(
    private _common: CommonLibService,
    private _staticMsgPipe: StaticMsgPipe,
    private _seatmapSeatmapService: ServicingSeatmapSeatmapService,
    private _renderer: Renderer2,
    private _getSeatmapsStoreService: GetSeatmapsStoreService,
    private _changeDetector: ChangeDetectorRef
  ) {
    super(_common);
  }

  reload(): void {}
  init(): void {
    this.subscribeService(
      'seatmapSeatmapGetSeatmap',
      this._getSeatmapsStoreService.getGetSeatmapsObservable(),
      (response) => {
        this.seatmapResponse = response;
      }
    );
  }
  destroy(): void {}

  /**
   * デッキタブ選択ハンドラ
   * @param deckType デッキタイプ
   */
  public selectDeckType(deckType: GetSeatmapsResponseDataSeatmapsDecksInner.DeckTypeEnum) {
    this.selectedDeckType = deckType;
  }

  /**
   * 左右矢印キーによるタブの切り替え
   * @param event
   */
  public switchTab(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const targetId = (event.target as HTMLButtonElement).id === 'tab1' ? '#tab2' : '#tab1';
      const focusTarget = this._renderer.selectRootElement(targetId, true) as HTMLButtonElement;
      focusTarget.focus();
    }
  }

  /**
   * 座席のクリックイベントハンドラ
   * @param seatNumber 座席番号
   */
  public onClickSeat(seatNumber: string) {
    this.clickSeat.emit(seatNumber);
  }

  /**
   * 左翼の開始行かどうか
   * @param deck デッキ情報
   * @param currentIndex 現在処理中の行のインデックス
   * @returns 判定結果
   */
  public isLeftWingsStart(deck: GetSeatmapsResponseDataSeatmapsDecksInner, currentIndex: number): boolean | undefined {
    // 当該rows（currentIndex）より前に、trueと判定されたseatsが存在しない
    return deck.seats.rows?.slice(0, currentIndex)?.every((row) => !row?.rowFacilities?.wings?.left);
  }

  /**
   * 右翼の開始行かどうか
   * @param deck デッキ情報
   * @param currentIndex 現在処理中の行のインデックス
   * @returns 判定結果
   */
  public isRightWingsStart(deck: GetSeatmapsResponseDataSeatmapsDecksInner, currentIndex: number) {
    // 当該rows（currentIndex）より前に、trueと判定されたseatsが存在しない
    return deck.seats.rows?.slice(0, currentIndex)?.every((row) => !row?.rowFacilities?.wings?.right);
  }

  /**
   * キャビンコードからキャビンクラスの名称 (ex. エコノミークラス)を取得する。
   * @returns 表示キャビンクラス名
   */
  public getCabinClass(): string {
    return getClassNameByCabinCodeByDynamic(
      this._staticMsgPipe,
      this.isInformative,
      this.displayTargetSegment,
      this.cabinClasses,
      this.bookingClass
    );
  }

  /**
   * 通路で区切った際に左側のシート情報に含まれる列数を返却する関数
   * @param deck デッキ情報
   * @returns 列数
   */
  public getNumberOfLeftColumns(deck: GetSeatmapsResponseDataSeatmapsDecksInner): number {
    const numberOfColumnsInDeck = this.numberOfColumnsInDecks.get(deck.deckType);
    if (!!numberOfColumnsInDeck?.left) {
      return numberOfColumnsInDeck.left;
    } else {
      return 0;
    }
  }

  /**
   * 通路で区切った際に中央のシート情報に含まれる列数を返却する関数
   * ※左側と右側しかないシートマップではこの関数は呼び出されない
   *
   * @param deck デッキ情報
   * @returns 列数
   */
  public getNumberOfCenterColumns(deck: GetSeatmapsResponseDataSeatmapsDecksInner): number {
    const numberOfColumnsInDeck = this.numberOfColumnsInDecks.get(deck.deckType);
    if (!!numberOfColumnsInDeck?.center) {
      return numberOfColumnsInDeck.center;
    } else {
      return 0;
    }
  }

  /**
   * 通路で区切った際に右側のシート情報に含まれる列数を返却する関数
   * @param deck デッキ情報
   * @return 列数
   */
  public getNumberOfRightColumns(deck: GetSeatmapsResponseDataSeatmapsDecksInner): number {
    const numberOfColumnsInDeck = this.numberOfColumnsInDecks.get(deck.deckType);
    if (!!numberOfColumnsInDeck?.right) {
      return numberOfColumnsInDeck.right;
    } else {
      return 0;
    }
  }

  /**
   * 選択中のデッキがメインデッキ（1F）かどうか
   * @returns 判定結果
   */
  public isMainDeck(): boolean {
    return this.getCurrentDeckType() === 'main';
  }

  /**
   * 選択中デッキタイプ（mainまたはupper）を返却する関数
   * @returns デッキタイプ
   */
  public getCurrentDeckType(): GetSeatmapsResponseDataSeatmapsDecksInner.DeckTypeEnum | undefined {
    let deckType = !!this.selectedDeckType ? this.selectedDeckType : this.initialDeckType;
    return deckType;
  }

  /**
   * 列数によってスタイルが切り替わる要素のCSSクラスを返す
   * @param column 列数
   * @returns CSSクラス名
   */
  public getMultiColumnClass(column?: number): string {
    return !!column && column > 1 ? `p-seatmap__col--${column}col` : '';
  }

  /**
   * 処理中の座席がカウチ席かどうか
   * @param column 列情報
   * @returns 判定結果
   */
  public isCouchSeat(
    column: GetSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInnerColumnsInner
  ): boolean | undefined {
    return !!column.seatNumber ? this.seatInformationMap?.get(column.seatNumber)?.isCouchSeat : undefined;
  }

  /**
   * 座席がバシネット席かどうか
   * @param seatCharacteristicsCodes
   * @returns 判定結果
   */
  public isBassinetSeat(seatCharacteristicsCodes?: string[]): boolean {
    return this._seatmapSeatmapService.isBassinetSeat(seatCharacteristicsCodes);
  }

  /**
   * 3列カウチシート始点の座席かどうか
   * @param column 列情報
   * @returns 判定結果
   */
  public isStartOfThreeColumnCouchSeat(
    column: GetSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInnerColumnsInner
  ): boolean | undefined {
    const { rowNumber, columnNumbers } = splitCouchSeatNumber(
      this.seatInformationMap?.get(column.seatNumber)?.coutNumber
    );
    let couchInfo =
      this.seatmapResponse?.data?.seatmaps[this.seatInformationMap?.get(column.seatNumber)?.coutNumber ?? ''];

    // 3列か
    if (!!couchInfo && couchInfo.couchNumberOfSeats === 3) {
      // 始点か
      const couchSeatStartNumber = `${rowNumber}${columnNumbers?.[0]}`;
      if (column.seatNumber === couchSeatStartNumber) {
        return true;
      }
    }

    return false;
  }

  /**
   * 4列カウチシート始点の座席かどうか
   * @param column 列情報
   * @returns 判定結果
   */
  public isStartOfFourColumnCouchSeat(
    column: GetSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInnerColumnsInner
  ) {
    const { rowNumber, columnNumbers } = splitCouchSeatNumber(
      this.seatInformationMap?.get(column.seatNumber)?.coutNumber as string
    );

    let couchInfo =
      this.seatmapResponse?.data?.seatmaps[this.seatInformationMap?.get(column.seatNumber)?.coutNumber as string];

    // 4列か
    if (!!couchInfo && couchInfo.couchNumberOfSeats === 4) {
      // 始点か
      const couchSeatStartNumber = `${rowNumber}${columnNumbers?.[0]}`;
      if (column.seatNumber === couchSeatStartNumber) {
        return true;
      }
    }

    return false;
  }

  /**
   * 通路より左側の席かどうか
   * @param deck デッキ情報
   * @param seatNumber 座席番号
   * @returns 判定結果
   */
  public isLeftSide(deck: GetSeatmapsResponseDataSeatmapsDecksInner, seatNumber: string): boolean {
    let colNum: string = seatNumber?.replace(/[^A-Za-z]/g, '');
    for (let column of deck.columns) {
      // 通路の場合ループ終了
      if (column.isAisle) {
        break;
      }
      switch (column.columnNumber) {
        case colNum:
          return true;
        case '':
          return false;
      }
    }
    return false;
  }

  /**
   * デッキの左・中央・右それぞれの列数を算出する
   *
   * @param deck デッキ情報
   * @return デッキの左・中央・右それぞれの列数
   */
  private numberOfColumnsInDeck(deck: GetSeatmapsResponseDataSeatmapsDecksInner): NumberOfColumnsInDeck {
    const result: NumberOfColumnsInDeck = {};
    if (!deck.columns) {
      return result;
    }

    // 通路のデータにて配列を分割する
    const splitted = splitArray(deck.columns, (value) => !!value.isAisle);

    // 通路数による処理分岐
    switch (Number(deck.numberOfAisle)) {
      case 0:
        result.center = deck.columns.length;
        break;
      case 1:
        result.left = splitted[0].length;
        result.right = splitted[1].length;
        break;
      case 2:
        result.left = splitted[0].length;
        result.center = splitted[1].length;
        result.right = splitted[2].length;
        break;
      default:
        break;
    }

    return result;
  }

  /**
   * 指定した座席が属するカウチシート座席番号を取得する
   * @param seatNumber 席番号
   * @returns カウチ席の座席番号
   */
  public getCouchSeatNumber(seatNumber?: string): string | undefined {
    if (!seatNumber) {
      return undefined;
    }

    const { rowNumber, columnNumbers } = splitCouchSeatNumber(
      this.seatInformationMap?.get(seatNumber)?.coutNumber as string
    );
    if (!!rowNumber && !!columnNumbers) {
      for (const columnNumber of columnNumbers) {
        const couchSeatStartNumber = `${rowNumber}${columnNumber}`;
        if (seatNumber === couchSeatStartNumber) {
          return this.seatInformationMap?.get(seatNumber)?.coutNumber as string;
        }
      }
    }
    return undefined;
  }

  /**
   * カウチ座席の「行方向へのずれ」を取得する。
   * 各座席の値が同一となる想定のため、同じ値の場合のみ先頭の値を返却する。
   * @param row 行情報
   * @param col 列情報
   * @returns 取得できた場合：sideMisalignmentの値、取得できなかった場合：0
   */
  public getCouchSideMisalignment(
    row: GetSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInner | undefined,
    col: GetSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInnerColumnsInner | undefined
  ): number {
    let isSameVal = false;
    if (!!row && row.rowType === 'seat' && !!col) {
      const { rowNumber, columnNumbers } = splitCouchSeatNumber(
        this.seatInformationMap?.get(col?.seatNumber)?.coutNumber as string
      );
      const targetSeatNumbers =
        columnNumbers?.map((colNum) => {
          return rowNumber + colNum;
        }) || [];
      const targetCouchColumns = row?.columns.filter((c) => c && targetSeatNumbers.includes(c.seatNumber));
      isSameVal = targetCouchColumns.every(
        (targetCol) => targetCol.correction.sideMisalignment === col.correction.sideMisalignment
      );
    }
    return isSameVal ? col!.correction.sideMisalignment : 0;
  }

  /**
   * カウチ座席の「列方向へのずれ」を取得する。
   * 各座席の値が同一となる想定のため、同じ値の場合のみ先頭の値を返却する。
   * @param row 行情報
   * @param col 列情報
   * @returns 取得できた場合：rearMisalignmentの値、取得できなかった場合：0
   */
  public getCouchRearMisalignment(
    row: GetSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInner | undefined,
    col: GetSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInnerColumnsInner | undefined
  ): number {
    let isSameVal = false;
    if (!!row && row.rowType === 'seat' && !!col) {
      const { rowNumber, columnNumbers } = splitCouchSeatNumber(
        this.seatInformationMap?.get(col?.seatNumber)?.coutNumber as string
      );
      const targetSeatNumbers =
        columnNumbers?.map((colNum) => {
          return rowNumber + colNum;
        }) || [];
      const targetCouchColumns = row?.columns.filter((c) => c && targetSeatNumbers.includes(c.seatNumber));
      isSameVal = targetCouchColumns.every(
        (targetCol) => targetCol.correction.rearMisalignment === col.correction.rearMisalignment
      );
    }
    return isSameVal ? col!.correction.rearMisalignment : 0;
  }

  /**
   * 表示対象セグメントのキャビン情報および、
   * ファーストクラスの座席列数に応じて適用するデザインパターンを返却する。
   * @returns 適用するデザインパターン
   */
  public getSeatDesignName() {
    let seatDesignName: string = '';
    let existsDecks =
      !!this.seatmapResponse?.data?.seatmaps?.decks && this.seatmapResponse?.data?.seatmaps?.decks.length > 0;
    let targetDeck = existsDecks ? this.seatmapResponse?.data?.seatmaps?.decks[0] : undefined;
    let seatCount = targetDeck?.columns.filter((c) => !c.isAisle).length || 0;

    let cabin = this.displayTargetSegment?.cabin;

    // 当該セグメント.キャビンクラス="first"かつisAisle=trueである列を除いた列数>=5の場合、
    // 「business」相当のデザインを適用する
    if (cabin === 'first' && seatCount >= 5) {
      seatDesignName = 'business';

      //上記以外の場合、対応するキャビンクラスのデザインを適用する
    } else {
      seatDesignName = cabin || '';
    }
    return seatDesignName;
  }

  /**
   * 設備コードにパーテーションが含まれているか判定
   *
   * @param facilityCodes 設備コードリスト
   * @returns true:パーテーションが含まれる、false:パーテーションが含まれない
   */
  public isPartition(facilityCodes?: string[]): boolean {
    return !!facilityCodes?.find((code) => code === 'KN');
  }

  /**
   * パーティション行に表示する列情報を返却する
   * @param deckType デッキの位置情報
   * @param numberOfAisle 通路数
   * @param rowFacilities 行設備情報
   * @return パーティション行に表示する列情報配列
   */
  getPartitionRowColumns(
    deckType: GetSeatmapsResponseDataSeatmapsDecksInner.DeckTypeEnum | undefined,
    numberOfAisle: number | undefined,
    rowFacilities?: GetSeatmapsResponseDataSeatmapsDecksInnerSeatsRowsInnerRowFacilities
  ) {
    // デッキのcolumn数を保持
    const numberOfColumnsInDeck = this.numberOfColumnsInDecks.get(deckType);
    if (!numberOfColumnsInDeck || !deckType || numberOfAisle === undefined || !rowFacilities) {
      return [];
    }

    // 通路column
    const aisleColumns = { columnType: 'aisle' };
    // 左設備
    const leftFacilities = rowFacilities.leftFacilityCodes;
    // 中央設備
    const centerFacilities = rowFacilities.centerFacilityCodes;
    // 右設備
    const rightFacilities = rowFacilities.rightFacilityCodes;

    // 通路数による処理分岐
    switch (numberOfAisle) {
      // 通路が存在しない場合
      case 0:
        return this._createPartitions(centerFacilities, numberOfColumnsInDeck.center || 0);
      // 通路が1本の場合。左設備と右設備をみて返却
      case 1:
        return [
          ...this._createPartitions(leftFacilities, numberOfColumnsInDeck.left || 0),
          aisleColumns,
          ...this._createPartitions(rightFacilities, numberOfColumnsInDeck.right || 0),
        ];
      // 通路が2本の場合。左設備と中央設備と右設備をみて返却
      case 2:
        return [
          ...this._createPartitions(leftFacilities, numberOfColumnsInDeck.left || 0),
          aisleColumns,
          ...this._createPartitions(centerFacilities, numberOfColumnsInDeck.center || 0),
          aisleColumns,
          ...this._createPartitions(rightFacilities, numberOfColumnsInDeck.right || 0),
        ];
      default:
        return [];
    }
  }

  /**
   * ブロックの設備情報とブロックの長さから、そのブロックに表示される列情報を作成して返却する
   * @param facilities 当該ブロックの設備情報
   * @param blockLength 当該ブロックの列数
   * @returns そのブロックに配置される列情報配列
   */
  private _createPartitions(facilities: string[], blockLength: number) {
    // 設備コードにパーティションを示すコード(KN)が含まれていれば、ブロック数分のパーティション配列を返却
    const fillElement = facilities?.includes('KN') ? { columnType: 'partition' } : { columnType: '' };

    return new Array(blockLength).fill(fillElement);
  }
}
