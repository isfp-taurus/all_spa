import { SeatLegendDisplayInformation } from '@common/interfaces/servicing-seatmap/seat-legend-display-information';
import { Type1 } from 'src/sdk-servicing';
import { StaticMsgPipe } from '@lib/pipes';
import { CabinClasses } from '@common/interfaces/common/cabinClasses';
import { AppConstants } from '@conf/app.constants';

/**
 * キャビンコード、ブッキングクラス等からキャビンクラスの名称 (ex. エコノミークラス)を取得する。
 * ※マスタ(V_LIST_DATA_CABIN_CLASS)から取得した名称を仕様
 * @param isInformative Informative かどうか
 * @param displayTargetSegment セグメント表示対象
 * @param cabinClasses キャビンクラス
 * @param bookingClass ブッキングクラス
 * @returns キャビンクラスの名称
 */
export function getClassNameByCabinCodeByDynamic(
  staticMsgPipe: StaticMsgPipe,
  isInformative: boolean,
  displayTargetSegment?: Type1,
  cabinClasses?: CabinClasses,
  bookingClass?: string
) {
  if (!displayTargetSegment?.cabin || !cabinClasses) {
    return '';
  }

  let isJapanDomesticFlight = displayTargetSegment?.isJapanDomesticFlight || false;

  // キャビンクラス取得
  let cabinClass: string | undefined = undefined;
  let key: string = isJapanDomesticFlight ? 'domestic' : 'international';
  cabinClass = cabinClasses?.[key]?.find((c) => c.value === displayTargetSegment?.cabin)?.label;

  // キャビンクラスが取得できない場合
  if (!cabinClass) {
    return '';
  }

  if (isInformative) {
    // 参照の場合

    // 特典対象ブッキングクラス
    const awards = ['O', 'R', 'I', 'X'];

    // 特典か否か
    let isAward = bookingClass ? awards.includes(bookingClass) : false;

    // 特典ではない、かつ、当該セグメントが日本国内区間でない場合、ブッキングクラスを追加
    if (!isAward && !isJapanDomesticFlight) {
      if (bookingClass) {
        cabinClass = [cabinClass, staticMsgPipe.transform('label.colon'), bookingClass].join('');
      }
    }
  } else {
    // 参照以外の場合
    // キャビンクラス名称の後ろに補足が必要な場合
    if (displayTargetSegment?.isNeededToSupplementBookingClass) {
      if (displayTargetSegment?.bookingClass) {
        cabinClass = [cabinClass, staticMsgPipe.transform('label.colon'), displayTargetSegment?.bookingClass].join('');
      }
    }
  }

  return cabinClass;
}

/**
 * 表示すべき凡例の情報を格納したリストを作成する
 * @param isContainedRearFacingSeat
 * @param isEconomy キャビンがエコノミークラスかどうか
 */
export function createLegendList(
  isContainedRearFacingSeat: boolean,
  isEconomy: boolean,
  isContainedPaidAsrSeat: boolean,
  isContainedCouchSeat: boolean,
  isInformative?: boolean
) {
  const legendList: SeatLegendDisplayInformation[] = [];
  /** 画像ファイルパス定数用 */
  const appConstants = AppConstants;

  /** 後ろ向き席を含む場合、 */
  if (isContainedRearFacingSeat) {
    // 後ろ向き席
    legendList.push({
      staticMessageKey: 'm_static_message-label.backSeat',
      imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_BACK_SEAT_24,
    });
  } else {
    // 無料席
    legendList.push({
      staticMessageKey: 'm_static_message-label.freeSeat',
      imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_FREE_SEAT_24,
    });
  }

  // 非常口席
  legendList.push({
    staticMessageKey: 'm_static_message-label.exitSeat',
    imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_EMERGENCY_EXIT_SEAT_24,
  });

  // 選択不可席
  legendList.push({
    staticMessageKey: 'm_static_message-label.unselectable',
    imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_UNAVAILABLE_24,
  });

  // 幼児あり席
  legendList.push({
    staticMessageKey: 'm_static_message-label.infant',
    imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_INFANT_24,
  });

  // isInfomativeなら非表示
  if (!isInformative) {
    // 選択中席
    legendList.push({
      staticMessageKey: 'm_static_message-label.selecting',
      imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_SELECTED_24,
    });

    // 変更前無料席
    legendList.push({
      staticMessageKey: 'm_static_message-label.changeBeforeFreeSeat',
      imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_BEFORE_CHANGE_FREE_SEAT_24,
    });
  }

  // 指定済み変更不可席
  legendList.push({
    staticMessageKey: 'm_static_message-label.unalterableSoSelected',
    imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_UNCHANGEABLE_24,
  });

  // 窓なし席
  legendList.push({
    staticMessageKey: 'm_static_message-label.nonWindow',
    imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_NO_WINDOW_24,
  });
  // リクライニング制限席
  legendList.push({
    staticMessageKey: 'm_static_message-label.impossibleReclining',
    imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_NO_RECLINING_24,
  });
  // バジネット
  legendList.push({
    staticMessageKey: 'm_static_message-label.bassinetSeat',
    imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_BASSINET_24,
  });
  // テーブル
  legendList.push({
    staticMessageKey: 'm_static_message-label.table',
    imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_TABLE_24,
  });
  // 化粧室
  legendList.push({
    staticMessageKey: 'm_static_message-label.restroom',
    imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_LAVATORY_24,
  });
  // 多目的ルーム
  legendList.push({
    staticMessageKey: 'm_static_message-label.multipurposeRoom',
    imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_MULTI_PURPOSE_ROOM_24,
  });
  // 通路
  legendList.push({
    staticMessageKey: 'm_static_message-label.passage',
    imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_AISLE_24,
  });
  // 非常口
  legendList.push({
    staticMessageKey: 'm_static_message-label.exit',
    imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_EMERGENCY_EXIT_24,
  });
  // 翼
  legendList.push({
    staticMessageKey: 'm_static_message-label.wing',
    imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_WING_24,
  });
  // ギャレー
  legendList.push({
    staticMessageKey: 'm_static_message-label.galley',
    imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_GALLEY_24,
  });
  // パーティション
  legendList.push({
    staticMessageKey: 'm_static_message-label.partition',
    imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_PARTITION_24,
  });
  // バー
  legendList.push({
    staticMessageKey: 'm_static_message-label.barCounter',
    imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_BAR_24,
  });
  // 階段
  legendList.push({
    staticMessageKey: 'm_static_message-label.stairs',
    imageUrl: appConstants.IMG.R01_P070_S01_U__SEAT_STAIR_24,
  });
  return legendList;
}

/**
 * シートマップレイアウトに表示すべき凡例の情報を格納したリストを作成する
 */
export function createLegendListForSeatmapLayout() {
  const legendList: SeatLegendDisplayInformation[] = [];
  // ギャレー
  legendList.push({
    staticMessageKey: 'm_static_message-label.galley',
    imageUrl: 'assets/images/seatlayout_galley_29.png',
  });
  // バーコーナー
  legendList.push({
    staticMessageKey: 'm_static_message-label.barCounter',
    imageUrl: 'assets/images/seatlayout_bar_29.png',
  });
  // モニター
  legendList.push({
    staticMessageKey: 'm_static_message-label.monitor',
    imageUrl: 'assets/images/seatlayout_monitor_29.png',
  });
  // 非常口
  legendList.push({
    staticMessageKey: 'm_static_message-label.exit',
    imageUrl: 'assets/images/seatlayout_emergency_exit_29.png',
  });
  // 化粧室
  legendList.push({
    staticMessageKey: 'm_static_message-label.restroom',
    imageUrl: 'assets/images/seatlayout_lavatory_29.png',
  });
  // 化粧室 車いす可
  legendList.push({
    staticMessageKey: 'm_static_message-label.restroomWheelchairAvailable',
    imageUrl: 'assets/images/seatlayout_lavatory_wheelchair_29.png',
  });
  // 化粧室 おむつ交換台付き
  legendList.push({
    staticMessageKey: 'm_static_message-label.restroomWithDiaperStand',
    imageUrl: 'assets/images/seatlayout_lavatory_infant_29.png',
  });
  // 温水洗浄機能付き化粧室
  legendList.push({
    staticMessageKey: 'm_static_message-label.restroomWithMultifunctionBidet',
    imageUrl: 'assets/images/seatlayout_lavatory_hotwater_29.png',
  });
  // 多目的ルーム
  legendList.push({
    staticMessageKey: 'm_static_message-label.multipurposeRoom',
    imageUrl: 'assets/images/seatlayout_multi_room_29.png',
  });
  // 非常口座席
  legendList.push({
    staticMessageKey: 'm_static_message-label.exitSeat',
    imageUrl: 'assets/images/seatlayout_emergency_exit_seat_29.png',
  });
  // 窓なし席
  legendList.push({
    staticMessageKey: 'm_static_message-label.noWindowSeat',
    imageUrl: 'assets/images/seatlayout_no_window_seat_29.png',
  });
  // リクライニングしない席
  legendList.push({
    staticMessageKey: 'm_static_message-label.impossibleReclining',
    imageUrl: 'assets/images/seatlayout_no_reclining_seat_29.png',
  });
  // アームレストが上がらない席
  legendList.push({
    staticMessageKey: 'm_static_message-label.armrestNotMovableSeat',
    imageUrl: 'assets/images/seatlayout_no_uparm_seat_29.png',
  });
  // テーブル
  legendList.push({
    staticMessageKey: 'm_static_message-label.table',
    imageUrl: 'assets/images/seatlayout_table_29.png',
  });
  // 可動式パーテション
  legendList.push({
    staticMessageKey: 'm_static_message-label.movablePartition',
    imageUrl: 'assets/images/seatlayout_partition_29.png',
  });
  // 階段
  legendList.push({
    staticMessageKey: 'm_static_message-label.stairs',
    imageUrl: 'assets/images/seatlayout_stairs_29.png',
  });
  return legendList;
}

/**
 * カウチシート座席番号を、行番号と列番号部分に分解する
 *
 * 例）'39HJK' → { rowNumber: '39', columnNumbers: ['H', 'J', 'K'] }
 * @param key
 * @returns
 */
export function splitCouchSeatNumber(key?: string) {
  // 先頭文字の連続した数字を１つの値として抜き出し
  const regexNumber = /^[0-9]+/g;
  const rowNumbers = key?.match(regexNumber);

  // アルファベットを１文字ずつ別の値として抜き出し
  const regexAlphabet = /[A-Z]/g;
  const columnNumbers = key?.match(regexAlphabet);
  return { rowNumber: rowNumbers?.[0], columnNumbers: columnNumbers };
}

/**
 * 座席番号のリストをカウチシート座席番号に変換する
 * 例）['39H', '39J', '39K'] → '39HJK'
 * @param key
 * @returns カウチ座席番号
 */
export function convertSeatNumberListToCouchSeatNumber(key?: string[]): string | undefined {
  let rowNumber: string = String(key?.[0].match(/^[0-9]+/g));
  return key?.reduce((prev, curr) => {
    return (prev += curr?.match(/[A-Z]/g));
  }, rowNumber);
}

/**
 * カウチシート座席番号を、座席番号のリストに分解する
 * 例）'39HJK' → ['39H', '39J', '39K']
 * @param key
 * @returns 座席番号のリスト
 */
export function convertCouchSeatNumberToSeatNumberList(key?: string): string[] | undefined {
  const splitCouchSeatNumbers = splitCouchSeatNumber(key);
  return splitCouchSeatNumbers.columnNumbers?.map((column) => splitCouchSeatNumbers.rowNumber + column);
}

/**
 * 配列を指定した条件にて分割し二次元配列にした [シャローコピー](https://developer.mozilla.org/ja/docs/Glossary/Shallow_copy) を作成する。
 *
 * 下記は使用例。
 *
 * ```typescript
 * const originArray = [{ text: 'a' }, { text: 'b' }, { text: 'c' }, { text: 'd' }];
 * const splitted = splitArray(originArray, (value) => value.text === 'c');
 * console.log(splitted)
 * => [[{"text": "a"}, {"text": "b"}], [{"text": "d"}]]
 * ```
 *
 * @param originArray 元となる配列
 * @param separatorFunc 区切りとなる要素を指定するための条件
 * @returns 分割後の二次元配列
 */
export function splitArray<T>(originArray: T[], separatorFunc: (originArrayValue: T) => boolean) {
  const lastIndex = originArray.length - 1;
  const results: T[][] = [];
  let tmp: T[] = [];
  originArray.forEach((value, index) => {
    if (separatorFunc(value)) {
      results.push(tmp);
      tmp = new Array();
    } else {
      tmp.push(value);
      if (lastIndex === index) {
        results.push(tmp);
      }
    }
  });
  return results;
}
