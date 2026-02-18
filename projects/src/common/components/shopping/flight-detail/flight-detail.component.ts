import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import {
  FlightDetailHeader,
  FlightDetailSegment,
} from '@app/roundtrip-flight-availability-international/presenter/roundtrip-flight-availability-international-pres.state';
import { StaticMsgPipe } from '@lib/pipes';
import { isSP, isTB } from '@lib/helpers';
import { DeviceType } from '@lib/interfaces';
import { AppConstants } from '@conf/app.constants';

/** 乗継情報部に設定するstyleのデータ */
type connectionLineStyle = {
  /** styleのtop 単位:px */
  topPx: string;
  /** styleのheight 単位:px */
  heightPx: string;
};

/**
 * フライト詳細部描画コンポーネント
 */
@Component({
  selector: 'asw-flight-detail',
  templateUrl: './flight-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightDetailComponent extends SupportComponent implements AfterViewInit {
  /** モーダルかどうか */
  @Input()
  modalFlg: boolean = false;

  @Input()
  flightDetailHeader: FlightDetailHeader = {};

  @Input()
  flightDetailSegment: FlightDetailSegment[] = [];

  //乗継情報部の縦ラインの高さ取得のため、DOMを取得
  /** 出発地部 */
  @ViewChildren('departureParts') departureParts!: QueryList<ElementRef>;
  /** 到着地部 */
  @ViewChildren('arrivalParts') arrivalParts!: QueryList<ElementRef>;
  /** 乗継情報部 */
  @ViewChildren('connectionParts') connectionParts!: QueryList<ElementRef>;

  //innerHTML制御のためDOM取得
  @ViewChildren('departureEstimatedDateTimeList') departureEstimatedDateTimeList!: QueryList<ElementRef>;

  /** 乗継情報部のスタイルリスト 要素番地:そのフライト詳細での乗継情報の番地 */
  public connectionLineStyleList: Array<connectionLineStyle> = [];

  /** 乗継情報部DOMの状態を監視するオブサーバ */
  private connectionObserver: ResizeObserver[] = [];

  public deviceType: string = '';

  /** 羽田用ターミナル未確定文言 */
  public outputTerminalLabel: string = '';

  /** キャリア識別アイコン */
  public appConstants = AppConstants;

  constructor(
    _common: CommonLibService,
    private _changeDetecterRef: ChangeDetectorRef,
    private _staticMsgPipe: StaticMsgPipe
  ) {
    super(_common);
  }

  reload(): void {}
  init(): void {
    //フライト区間分、乗継情報のスタイル情報の配列を生成
    for (let i = 0; i < this.flightDetailSegment.length; i++) {
      this.connectionLineStyleList.push({
        topPx: '0',
        heightPx: '0',
      });
      /** 羽田用ターミナル未確定文言(2/3)取得 */
      if (
        this.flightDetailSegment[i].departureTerminal === 'pending' ||
        this.flightDetailSegment[i].arrivalTerminal === 'pending'
      ) {
        this.outputTerminalLabel = this._staticMsgPipe.transform('label.airportTerminalPending');
      }
    }
    this.deviceType = this.getDeviceType();
  }
  destroy(): void {
    //値監視の停止
    this.connectionObserver.forEach((v) => {
      v.disconnect();
    });
  }

  ngAfterViewInit(): void {
    //ResizeObserverでDOM要素のサイズ変更を監視し、変更の度に縦ラインの長さ設定処理を実行する
    this.connectionParts.forEach((connect, index) => {
      const callbackFunc = () => {
        //スタイルの更新
        this.setConnectionLine(index);
        //画面の再描画
        this._changeDetecterRef.detectChanges();
      };
      const obsever = new ResizeObserver(callbackFunc);
      obsever.observe(connect.nativeElement);
      this.connectionObserver.push(obsever);
    });
  }

  /** 端末種別を取得する */
  public getDeviceType(): DeviceType {
    if (isSP()) {
      return 'SP';
    }
    if (isTB()) {
      return 'TAB';
    }
    return 'PC';
  }

  /**
   * 指定番地の乗継情報部の縦ラインの開始位置、高さを設定する
   * @param index : 乗継情報部の位置
   */
  private setConnectionLine(index: number) {
    //最後のフライト区間には表示しないため、長さを-1する
    if (index < this.flightDetailSegment.length - 1) {
      //到着地部品の表示開始位置を取得
      const arriveTop = this.arrivalParts.get(index)?.nativeElement.getBoundingClientRect().top + window.pageYOffset;
      //次のフライト区間での出発地部品の表示開始位置を取得
      const departureButtom =
        this.departureParts.get(index + 1)?.nativeElement.getBoundingClientRect().top +
        this.departureParts.get(index + 1)?.nativeElement.getBoundingClientRect().height +
        window.pageYOffset;
      //到着地部品の開始位置 - 乗継部品の開始位置で縦ラインの開始位置オフセットを算出
      const offsetTop =
        this.arrivalParts.get(index)?.nativeElement.getBoundingClientRect().top -
        this.connectionParts.get(index)?.nativeElement.getBoundingClientRect().top;
      this.connectionLineStyleList[index] = {
        topPx: offsetTop.toString(),
        heightPx: (departureButtom - arriveTop).toString(),
      };
    }
  }

  /** 出発/到着時刻、最新出発/到着時刻の比較 */
  public compareStringDate(DateTime: String, EstimatedDateTime: String) {
    let result: boolean = false;

    // 日付(yyyy-MM-dd)が一致しない場合、true
    if (EstimatedDateTime) {
      if (DateTime.substring(0, 10) !== EstimatedDateTime.substring(0, 10)) {
        result = true;
      }
    }

    return result;
  }

  /**
   * 時間、時刻の日付文字列
   *
   * @param data 時間/時刻
   * @returns
   */
  public dateString(data: string | undefined): string {
    const date = Number(data);
    const hours = String(Math.trunc(date / 3600)).padStart(2, '0');
    const min = String(Math.trunc((date % 3600) / 60)).padStart(2, '0');
    return hours + ':' + min;
  }
}
