import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import {
  AswMasterService,
  CommonLibService,
  ErrorsHandlerService,
  PageLoadingService,
  SystemDateService,
} from '@lib/services';
import { Subject } from 'rxjs';
import {
  AirCalendarCell,
  CheapestCalendarModalInput,
  CheapestCalendarModalOutput,
  NotEnabledCell,
} from './cheapest-calendar-matrix-modal.state';
import { RoundtripOwdService } from '@common/services/roundtrip-owd/roundtrip-owd-store.service';
import { RoundtripOwdRequest } from 'src/sdk-search/model/roundtripOwdRequest';
import { RoundtripOwdResponse } from 'src/sdk-search/model/roundtripOwdResponse';
import { CommonSliderComponent } from '@common/components/shopping/common-slider/common-slider.component';
import { convertStringToDate, isSP, isTB } from '@lib/helpers';
import { DeviceType, ErrorType, PageType, RetryableError } from '@lib/interfaces';
import { ViewChildren } from '@angular/core';
import { QueryList } from '@angular/core';
import { RoundtripFlightAvailabilityInternationalService } from '@common/services/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.service';
import { ErrorCodeConstants } from '@conf/app.constants';

/**
 * マトリクス形式7日間カレンダーモーダル
 */
@Component({
  selector: 'asw-cheapest-calendar-matrix-modal',
  templateUrl: './cheapest-calendar-matrix-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RoundtripOwdService, CommonSliderComponent],
})
export class CheapestCalendarMatrixModalComponent extends SupportModalBlockComponent implements AfterViewInit {
  /** マトリクス用カレンダー日付 往路出発日*/
  public departureDateList!: string[];
  public departureDateListWeek: string[] = [];
  /** マトリクス用カレンダー日付 復路出発日*/
  public returnDateList!: string[];
  public returnDateListWeek: string[] = [];
  /** マトリクス用カレンダーデータ APIレスポンスのairCalendarより取得  */
  public airCalendarCellList!: AirCalendarCell[][];

  /** 表示範囲の往路出発日リスト 1週間分のデータを出発日リストから取得*/
  public selectionDepartureDateList!: string[];
  /** 表示範囲の復路出発日リスト 1週間分のデータを出発日リストから取得*/
  public selectionReturnDateList!: string[];

  /** 選択中の往路出発日の番地 */
  public selectedRowIndex!: number;
  /** 選択中の復路出発日の番地 */
  public selectedColIndex!: number;

  /** 選択中の往路出発日 */
  public selectedDepartureDate!: string;
  /** 選択中の復路出発日 */
  public selectedReturnDate!: string;
  /** 選択中の往路・復路出発日に該当する金額 */
  public selectedPrice!: number;
  /** 旅行者の合計数 */
  public totalTravelers?: number;

  private _subject!: Subject<CheapestCalendarModalOutput>;

  /** 画面表示の切り替えフラグ PCの場合true */
  public isPcDevice: boolean = true;
  /** 端末種別 画面サイズで判定 */
  private deviceTypeFromSize: DeviceType = 'PC';

  // マトリクス用カレンダースクロールの有無
  public isCCMSlider: boolean = true;
  // 右スクロールボタン押下時
  public isRightClicked: boolean = false;
  // 右スクロールボタンの表示形式
  public hideRightBtn: boolean = false;
  // 左スクロールボタンの表示形式
  public hideLeftBtn: boolean = false;
  // 指定要素のLeft値を取得
  public elementLeft: number = 0;
  //操作日
  public operationDate?: Date;
  //往路の前の週ボタン表示
  public showOutLastWeek = false;
  //往路の次の週ボタン表示
  public showOutNextWeek = false;
  //復路の前の週ボタン表示
  public showReturnLastWeek = false;
  //復路の次の週ボタン表示
  public showReturnNextWeek = false;

  private cheapestCalendarData: CheapestCalendarModalInput = {};
  private _roundtripOwdData: RoundtripOwdResponse = {};

  /** マトリクス形式7日間カレンダースクロールの要素を取得する変数 */
  @ViewChild('scrollPanel') scrollPanel?: ElementRef;
  @ViewChildren('scrollItemList') scrollItemList?: QueryList<ElementRef>;

  // 静的文言 曜日
  public weekShortName = [
    'label.sunday',
    'label.monday',
    'label.tuesday',
    'label.wednesday',
    'label.thursday',
    'label.friday',
    'label.saturday',
  ];

  constructor(
    private _common: CommonLibService,
    private _roundtripOwdService: RoundtripOwdService,
    private _commonSliderComponent: CommonSliderComponent,
    private _changeDetectorRef: ChangeDetectorRef,
    private _roundtripFlightAvailabilityInternationalService: RoundtripFlightAvailabilityInternationalService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _sysDateSvc: SystemDateService,
    private _masterSvc: AswMasterService,
    private _pageLoadingService: PageLoadingService
  ) {
    super(_common);
  }

  reload(): void {}
  init(): void {
    this.cheapestCalendarData = this.payload;
    this._subject = this.payload.outputSubject;
    // 往路出発日
    this.departureDateList = this.cheapestCalendarData.data?.departureDateList ?? [];
    // 復路出発日
    this.returnDateList = this.cheapestCalendarData.data?.returnDateList ?? [];
    this.airCalendarCellList = this.cheapestCalendarData.data?.airCalendarCellList ?? [];
    this.totalTravelers = this.cheapestCalendarData.data?.totalTravelers;

    let row: number = -1;
    let col: number = -1;

    // 往路曜日の取得
    for (let i = 0; i < this.departureDateList.length; i++) {
      this.departureDateListWeek.push(this.weekShortName[new Date(this.departureDateList[i]).getDay()]);
      // 検索条件で指定した往路出発日の初期選択位置の取得
      if (row < 0) {
        row = this.departureDateList[i] === this.cheapestCalendarData.data?.selectedDepartureDate ? i : -1;
      }
    }
    // 復路曜日の取得
    for (let i = 0; i < this.returnDateList.length; i++) {
      this.returnDateListWeek.push(this.weekShortName[new Date(this.returnDateList[i]).getDay()]);
      // 検索条件で指定した復路出発日の初期選択位置の取得
      if (col < 0) {
        col = this.returnDateList[i] === this.cheapestCalendarData.data?.selectedReturnDate ? i : -1;
      }
    }

    // 検索条件で指定した往路出発日と復路出発日の組み合わせとなる場合、初期選択する。
    this.selectedRowIndex = row;
    this.selectedColIndex = col;
    if (row >= 0 && col >= 0) {
      this.updateSelectedValue();
    }

    // 往復路の次週・前週ボタン表示切替
    this.isCalendarbtnDisplay();
  }
  destroy(): void {}

  override ngAfterViewInit(): void {
    if (this._commonSliderComponent) {
      this._commonSliderComponent.scrollPanel = this.scrollPanel;
      this._commonSliderComponent.scrollItemList = this.scrollItemList;
      this._commonSliderComponent.isCCMSlider = this.isCCMSlider;

      if (this.scrollPanel) {
        const scrollPanelRect = this.scrollPanel.nativeElement.getBoundingClientRect();
        this.elementLeft = scrollPanelRect.left;
        this._commonSliderComponent.elementLeft = scrollPanelRect.left;
      }
    }
    this.resize();
    this._changeDetectorRef.detectChanges();
  }

  /**
   * 閉じるボタン押下時処理※マトリクス形式7日間カレンダーモーダル画面
   */
  public closeModal() {
    this.close();
  }

  /**
   * 前の週ボタン押下時処理※マトリクス形式7日間カレンダーモーダル画面の往路日付リスト
   * 前の週ボタン
   */
  public async clickDepartPreviousWeek() {
    // 	リクエスト用検索条件を、テンポラリの検索条件とする。
    const temporaryRequest = this.getTemporaryRequest();
    // 	テンポラリの検索条件.itineraries[0].departureDateを-7日の日付とする。
    if (temporaryRequest && this.departureDateList) {
      let _departureDate = convertStringToDate(this.departureDateList[3]);
      _departureDate.setDate(_departureDate.getDate() - 7);

      const itineraries = temporaryRequest.itineraries;
      if (itineraries[0]) {
        itineraries[0].departureDate = this.convertDateToFormatDateString(_departureDate);
        itineraries[1].departureDate = this.returnDateList[3];
      }
      // [以下、カレンダー表示期間変更処理]
      await this.changeCalenderPeriod(temporaryRequest);
    }
  }

  /**
   * 次の週ボタン押下時処理※マトリクス形式7日間カレンダーモーダル画面の往路日付リスト
   * 次の週ボタン
   */
  public async clickDepartNextWeek() {
    // 	リクエスト用検索条件を、テンポラリの検索条件とする。
    const temporaryRequest = this.getTemporaryRequest();
    // 	テンポラリの検索条件.itineraries[0].departureDateを+7日の日付とし、
    if (temporaryRequest && this.departureDateList) {
      let _departureDate = convertStringToDate(this.departureDateList[3]);
      _departureDate.setDate(_departureDate.getDate() + 7);

      const itineraries = temporaryRequest.itineraries;
      if (itineraries[0]) {
        itineraries[0].departureDate = this.convertDateToFormatDateString(_departureDate);
        itineraries[1].departureDate = this.returnDateList[3];
      }

      // [以下、カレンダー表示期間変更処理]
      await this.changeCalenderPeriod(temporaryRequest);
    }
  }

  /**
   * 前の週ボタン押下時処理※マトリクス形式7日間カレンダーモーダル画面の復路日付リスト
   * 前の週ボタン
   */
  public async clickReturnPreviousWeek() {
    // リクエスト用検索条件を、テンポラリの検索条件とする。
    const temporaryRequest = this.getTemporaryRequest();
    // テンポラリの検索条件.itineraries[1].departureDateを-7日の日付とし
    if (temporaryRequest && this.returnDateList) {
      let _returnDate = convertStringToDate(this.returnDateList[3]);
      _returnDate.setDate(_returnDate.getDate() - 7);

      const itineraries = temporaryRequest.itineraries;
      if (itineraries[1]) {
        itineraries[0].departureDate = this.departureDateList[3];
        itineraries[1].departureDate = this.convertDateToFormatDateString(_returnDate);
      }

      // [以下、カレンダー表示期間変更処理]
      await this.changeCalenderPeriod(temporaryRequest);
    }
  }

  /**
   * 次の週ボタン押下時処理※マトリクス形式7日間カレンダーモーダル画面の復路日付リスト
   * 次の週ボタン
   */
  public async clickReturnNextWeek() {
    // リクエスト用検索条件を、テンポラリの検索条件とする。
    const temporaryRequest = this.getTemporaryRequest();
    // テンポラリの検索条件.itineraries[1].departureDateを+7日の日付とし
    if (temporaryRequest && this.returnDateList) {
      let _returnDate = convertStringToDate(this.returnDateList[3]);
      _returnDate.setDate(_returnDate.getDate() + 7);

      const itineraries = temporaryRequest.itineraries;
      if (itineraries[1]) {
        itineraries[0].departureDate = this.departureDateList[3];
        itineraries[1].departureDate = this.convertDateToFormatDateString(_returnDate);
      }

      // [以下、カレンダー表示期間変更処理]
      await this.changeCalenderPeriod(temporaryRequest);
    }
  }

  /** リクエスト用検索条件をテンポラリの検索条件として取得(複製する。) */
  private getTemporaryRequest(): RoundtripOwdRequest | undefined {
    const request =
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData
        .roundtripOwdRequest;
    if (!request) {
      return undefined;
    }
    return JSON.parse(JSON.stringify(request)) as RoundtripOwdRequest;
  }

  /** カレンダー表示期間変更処理 */
  private async changeCalenderPeriod(temporaryRequest: RoundtripOwdRequest) {
    // 	テンポラリの検索条件.追加処理情報.getAirCalendarOnlyをtrue(照会結果としてカレンダー情報のみ返却する)に設定する。
    const searchPreferences = temporaryRequest.searchPreferences;
    if (searchPreferences) {
      searchPreferences.getAirCalendarOnly = true;
    }
    // 	テンポラリの検索条件を基に、往復指定日空席照会(OWD)用APIを呼び出す。
    await this.getRoundtripOwdAPI(temporaryRequest);
    //	マトリクス用カレンダー日付に往復指定日空席照会(OWD)用レスポンス.data.airCalendarPeriod、マトリクス用カレンダーに往復指定日空席照会(OWD)用レスポンス.data.airCalendarを設定する。
    this.createCalendar();
    // カレンダーの変更を内部選択状態に反映させる
    this.updateSelectedValue();
    // 往復路の次週・前週ボタン表示切替
    this.isCalendarbtnDisplay();
    // カレンダーの変更を画面に反映させる
    this._changeDetectorRef.detectChanges();
  }

  /** Dateオブジェクトを日付文字列のフォーマットへ変換する yyyy-MM-dd */
  private convertDateToFormatDateString(date: Date): string {
    if (date !== undefined) {
      return (
        date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
      );
    }
    return '';
  }

  /**
   * 往復指定日空席照会(OWD)用API呼び出し
   */
  private async getRoundtripOwdAPI(roundtripOwdRequest: RoundtripOwdRequest) {
    this._pageLoadingService.startLoading();
    // 往復指定日空席照会(OWD)用API
    const responseObservable = this._roundtripOwdService.getRoundtripOwdFromApi(roundtripOwdRequest);

    // 往復指定日空席照会(OWD)用API実行後処理
    await new Promise<void>((resolve) => {
      this.subscribeService(
        'CheapestCalendarMatrixModalComponent getRoundtripOwd',
        responseObservable,
        (response) => {
          this._pageLoadingService.endLoading();
          // ※以降の処理は、エラーが発生していない往復指定日空席照会(OWD)用レスポンスが通知された場合、処理を行う。当処理はstoreを介して行う。
          // 往復指定日空席照会(OWD)用レスポンス.warnings[0].code="WBAZ000198"(検索結果なし)の場合、以下の処理を行い、カレンダー表示期間変更処理を終了する。
          if (response?.warnings?.some((warning) => warning.code === ErrorCodeConstants.ERROR_CODES.WBAZ000198)) {
            // エラーメッセージID＝”E0228”にて継続可能なエラー情報を指定する。
            this.setRetryableErrorInfo(PageType.PAGE, {
              errorMsgId: 'E0228',
              apiErrorCode: ErrorCodeConstants.ERROR_CODES.WBAZ000198,
            });
            // マトリクス形式7日間カレンダーモーダルを非表示とする。
            this.closeModal();
            resolve();
          }
          // 正常系
          // マトリクス用カレンダー日付に往復指定日空席照会(OWD)用レスポンス.data.airCalendarPeriod、
          this.departureDateList = response?.data?.airCalendarPeriod?.departureDates ?? [];
          this.returnDateList = response?.data?.airCalendarPeriod?.returnDates ?? [];
          // マトリクス用カレンダーに往復指定日空席照会(OWD)用レスポンス.data.airCalendarを設定する。
          this._roundtripOwdData = response;
          // [ここまで、カレンダー表示期間変更処理]
          resolve();
        },
        (responseError) => {
          this._pageLoadingService.endLoading();
          if (this._common.apiError?.errors?.[0].code === ErrorCodeConstants.ERROR_CODES.EBAZ000824) {
            // エラーメッセージID＝”E1830”にて継続可能なエラー情報を指定する。
            this.setRetryableErrorInfo(PageType.PAGE, {
              errorMsgId: 'E1830',
              apiErrorCode: ErrorCodeConstants.ERROR_CODES.EBAZ000824,
            });
            // マトリクス形式7日間カレンダーモーダルを非表示とする。
            this.closeModal();
            resolve();
            return;
          }
          if (responseError) {
            // エラーが発生した往復指定日空席照会(OWD)用レスポンスが通知された場合、
            // 継続不可能エラータイプ＝”system”(システムエラー)にて継続不可能なエラー情報を指定し、カレンダー表示期間変更処理を終了する。
            // ※当処理はstoreを介して行う。
            this.setErrorInfo(ErrorType.SYSTEM, this._common.apiError?.errors?.[0].code);
            // マトリクス形式7日間カレンダーモーダルを非表示とする。
            this.closeModal();
            resolve();
          }
        }
      );
    });
  }

  /**
   * カレンダーの作成
   */
  private createCalendar() {
    /** マトリクス形式7日間カレンダーモーダル画面描画用データの生成 */
    const airCalendar = this._roundtripOwdData.data?.airCalender;
    const airCalendarDepartureList = Object.entries(airCalendar!);
    const airCalendarCellMap: Map<string, Map<string, AirCalendarCell>> = new Map<
      string,
      Map<string, AirCalendarCell>
    >();

    /** airCalendarから[[キー(往路日付),復路情報],]となる配列を生成し、
     * ループ処理で往路日付⇒復路日付の順にキー指定で価格を得るマップを作成する */
    airCalendarDepartureList?.forEach((dep) => {
      const retList = Object.entries(dep[1]);
      const retMap: Map<string, AirCalendarCell> = new Map<string, AirCalendarCell>();
      retList.forEach((ret: [string, any]) => {
        const cell: AirCalendarCell = {
          isDisplay: true,
          isAvaliable: ret[1].prices !== undefined,
          departureDate: dep[0],
          returnDate: ret[0],
          currencySymbol: ret[1]?.prices?.totalPrices?.currencyCode ?? '',
          price: ret[1]?.prices?.totalPrices?.total ?? 0,
          isLowestPrice: ret[1]?.prices?.isCheapest ?? false,
        };
        retMap.set(ret[0], cell);
      });
      airCalendarCellMap.set(dep[0], retMap);
    });

    const departureDateList = this._roundtripOwdData.data?.airCalendarPeriod?.departureDates!;
    const returnDateList = this._roundtripOwdData.data?.airCalendarPeriod?.returnDates!;

    /** 出発日のソート関数 */
    const sortFunc = function (a: string, b: string) {
      const a_date = new Date(a).getTime();
      const b_date = new Date(b).getTime();
      if (a_date < b_date) {
        return -1;
      } else if (a_date > b_date) {
        return 1;
      } else {
        return 0;
      }
    };

    /** 往路・復路出発日配列のソート */
    departureDateList.sort(sortFunc);
    returnDateList.sort(sortFunc);

    /** ソート済みの出発日配列を巡回し、生成したマップから値を取得して配列に格納 */
    const airCalendarCellList: AirCalendarCell[][] = [];
    departureDateList.forEach((dep) => {
      airCalendarCellList.push([]);
      returnDateList.forEach((ret) => {
        const airCalendarCell = airCalendarCellMap.get(dep)?.get(ret) ?? null;
        if (airCalendarCell != null && airCalendarCell.isDisplay) {
          // 利用可能
          airCalendarCellList[airCalendarCellList.length - 1].push(airCalendarCell);
        } else {
          // 存在しない場合、選択不可の項目
          airCalendarCellList[airCalendarCellList.length - 1].push(NotEnabledCell);
        }
      });
    });

    /** マトリクス用カレンダー日付 往路出発日リスト */
    this.departureDateList = this._roundtripOwdData.data?.airCalendarPeriod?.departureDates!;
    /** マトリクス用カレンダー日付 復路出発日リスト */
    this.returnDateList = this._roundtripOwdData.data?.airCalendarPeriod?.returnDates!;
    /** マトリクス用カレンダーデータ APIレスポンスのairCalendarより取得 */
    this.airCalendarCellList = airCalendarCellList;
  }

  /**
   * 次へボタン押下時処理※マトリクス形式7日間カレンダーモーダル画面
   */
  public applyModal() {
    if (this.selectedDepartureDate !== '' && this.selectedReturnDate !== '') {
      this._subject.next({
        departureDate: this.selectedDepartureDate,
        returnDate: this.selectedReturnDate,
      });
    }
    this.closeModal();
  }

  /**
   * 行列番号を基にカレンダーを選択
   * @param event イベントオブジェクト
   * @param row 往路出発日の番号
   * @param col 復路出発日の番号
   */
  public selectDate(event: Event, row: number, col: number) {
    if (this.departureDateList.length > row && this.returnDateList.length > col) {
      this.selectedRowIndex = row;
      this.selectedColIndex = col;
      this.updateSelectedValue();
    }
  }

  /** 選択中の番地から実際の値を取得する */
  private updateSelectedValue() {
    this.selectedDepartureDate = this.departureDateList[this.selectedRowIndex];
    this.selectedReturnDate = this.returnDateList[this.selectedColIndex];
    this.selectedPrice = this.airCalendarCellList[this.selectedRowIndex][this.selectedColIndex].price;
  }

  /** 現在の画面サイズから端末種別を取得する */
  private getDeviceTypeFromSize(): DeviceType {
    if (isSP()) {
      return 'SP';
    } else if (isTB()) {
      return 'TAB';
    } else {
      return 'PC';
    }
  }

  /**
   * 画面サイズを基に表示を変更する
   */
  private updateViewByDeviceType() {
    const device = this.getDeviceTypeFromSize();
    if (this.deviceTypeFromSize != device) {
      this.deviceTypeFromSize = device;
      if (this.isPcDevice == false && this.deviceTypeFromSize == 'PC') {
        //PC表示にして再描画
        this.isPcDevice = true;
        this._changeDetectorRef.detectChanges();
      } else if (this.isPcDevice == true && this.deviceTypeFromSize != 'PC') {
        //SP・TAB表示にして再描画
        this.isPcDevice = false;
        this._changeDetectorRef.detectChanges();
      }
    }
  }

  /**
   * スクロール左方向クリック
   */
  public leftSlider() {
    if (this.scrollPanel) {
      // 右スクロールボタンの表示
      this.hideRightBtn = false;

      // 共通のスクロール処理へ
      this._commonSliderComponent.scrollLeft();

      // 最左端(左ボタン表示有無)
      this.hideLeftBtn = this._commonSliderComponent.isLeftEnd ? true : false;

      // 右スクロールボタンの表示有無
      this.isRightClicked = this._commonSliderComponent.isLeftEnd ? false : true;
    }
  }

  /**
   * スクロール右方向クリック
   */
  public rightSlider() {
    if (this.scrollPanel) {
      // 右スクロールボタンが押された際に、左スクロールボタンの表示有無
      this.isRightClicked = true; // 右ボタン表示(is-active追加、z-index: 1を付与)

      // 共通のスクロール処理へ
      this._commonSliderComponent.scrollRight();

      // 最右端(右ボタン表示有無)
      this.hideRightBtn = this._commonSliderComponent.isRightEnd ? true : false;
    }
  }

  /**
   * エラー情報設定
   * @param errorType エラー種別
   * @param apiErrorCode APIより返却されたエラーコード
   */
  // 継続不可能エラー情報設定
  private setErrorInfo(errorType: ErrorType, apiErrorCode?: string) {
    this._errorsHandlerSvc.setNotRetryableError({
      errorType: errorType,
      apiErrorCode: apiErrorCode,
    });
  }

  // 継続可能エラー情報設定
  private setRetryableErrorInfo(pageType: PageType, errorInfo?: RetryableError) {
    this._errorsHandlerSvc.setRetryableError(pageType, errorInfo);
  }

  /**
   * resizeイベントのカスタム
   */
  override resize(): void {
    // デフォルトの処理を先に呼び出し
    super.resize();
    // リサイズ時にこのモーダル用の更新処理を追加呼び出し
    this.updateViewByDeviceType();
  }

  /**往復路の次週・前週ボタン表示切替処理 */
  private isCalendarbtnDisplay() {
    // システム日付取得(G03-519)の空港現地時間取得処理を、引数にユーザ共通.操作オフィスコードを指定し、操作日とする。
    this.operationDate = this._sysDateSvc.getAirportLocalDate(
      this._common.aswContextStoreService.aswContextData.pointOfSaleId
    );
    // 操作日をyyyy-mm-ddに変換
    let convertOperationDate = this.convertDateToFormatDateString(this.operationDate);
    // 表示可能最大日数
    let selectableDate = Number(this._masterSvc.getMPropertyByKey('search', 'searchableDays'));
    // 操作日＋表示可能最大日数
    let futureDate = new Date(this.operationDate);
    futureDate.setDate(this.operationDate.getDate() + selectableDate);
    // 操作日＋表示可能最大日数をyyyy-mm-ddに変換
    let convertfutureDate = this.convertDateToFormatDateString(futureDate);

    // マトリクス用カレンダー日付.departureDates[0]-1日
    let minDepartureDate = new Date(this.departureDateList[0]);
    let minDepartureDateMinus1 = new Date(minDepartureDate.getTime() - 24 * 60 * 60 * 1000);
    let convertMinDepartureDateMinus1 = this.convertDateToFormatDateString(minDepartureDateMinus1);

    // 往路の次の週ボタンと復路の前の週ボタンは、2パターンのボタン非表示になる条件があるため、判定前にfalseにする。
    this.showOutNextWeek = false;
    this.showReturnLastWeek = false;

    // 往路の前の週ボタン表示判定
    this.showOutLastWeek = convertMinDepartureDateMinus1 >= convertOperationDate ? true : false;

    if (this.selectedDepartureDate && this.selectedReturnDate) {
      // 選択中のカレンダー情報.往路出発日＋7日
      let selectedDepartureDate = new Date(this.selectedDepartureDate);
      let selectedDeparturatePlus7 = new Date(selectedDepartureDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      let convertSelectedDeparturatePlus7 = this.convertDateToFormatDateString(selectedDeparturatePlus7);
      // 選択中のカレンダー情報.復路出発日-7日
      let selecteReturnDate = new Date(this.selectedReturnDate);
      let selectedReturnDateMinus7 = new Date(selecteReturnDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      let convertSelectedReturnDateMinus7 = this.convertDateToFormatDateString(selectedReturnDateMinus7);

      // 往路の次の週ボタン表示判定
      if (convertSelectedDeparturatePlus7 <= this.selectedReturnDate) {
        this.showOutNextWeek = true;
      }

      // 復路の前の週ボタン表示判定
      if (convertSelectedReturnDateMinus7 >= this.selectedDepartureDate) {
        this.showReturnLastWeek = true;
      }
    }

    //復路の次の週ボタン表示判定
    let maxRetrunDate = new Date(this.returnDateList[this.returnDateList.length - 1]);
    let maxRetrunDatePlus1 = new Date(maxRetrunDate.getTime() + 24 * 60 * 60 * 1000);
    let convertMaxRetrunDatePlus1 = this.convertDateToFormatDateString(maxRetrunDatePlus1);
    this.showReturnNextWeek = convertMaxRetrunDatePlus1 <= convertfutureDate ? true : false;
  }

  /**
   * 往路出発日のId(HTML用)を生成
   * @param departureDateIndex 往路出発日のインデックス(表示順)
   * @return 往路出発日のId(HTML用)
   */
  public getDepartureDateId(departureDateIndex: number): string {
    return `dep${departureDateIndex + 1}`;
  }

  /**
   * 復路出発日のId(HTML用)を生成
   * @param returnDateIndex 復路出発日のインデックス(表示順)
   * @return 復路出発日のId(HTML用)
   */
  public getReturnDateId(returnDateIndex: number): string {
    return `ret${returnDateIndex + 1}`;
  }
}
