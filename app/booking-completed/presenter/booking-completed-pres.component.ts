import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MybookingBaggageRulesInput } from '@common/components/servicing/mybooking/mybooking-baggage-rules/mybooking-baggage-rules.state';
import { fixedArrayCache } from '@common/helper';
import { DeliveryInformationPaymentInformation } from '@common/interfaces';
import { SearchFlightStoreService } from '@common/services';
import { SupportComponent } from '@lib/components/support-class';
import { isPC } from '@lib/helpers';
import { StaticMsgPipe } from '@lib/pipes';
import { AswMasterService, CommonLibService } from '@lib/services';
import { __importDefault } from 'tslib';
import { BookingCompletedMastarData, initialBookingCompletedMastarData } from './booking-completed.state';
import { fromEvent, throttleTime } from 'rxjs';
import { BookingCompletedPresService } from './booking-completed-pres.service';
import { GetOrderResponseData } from 'src/sdk-servicing';

/**
 * 予約・購入完了
 */
@Component({
  selector: 'asw-booking-completed-pres',
  templateUrl: './booking-completed-pres.component.html',
  styleUrls: ['./booking-completed-pres.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingCompletedPresComponent extends SupportComponent {
  /** 画面タイトル */
  @Input()
  displayTitleLabel: string = '';

  @Input()
  set paymentInformation(value: DeliveryInformationPaymentInformation) {
    this._paymentInformation = value;
    this.orderStatusLabel = this.service.getOrderStatusLabel(value?.orderStatus ?? '', value.paymentMethod);
    this.travelerNumText = this.service.getTravelerNumText(
      value?.beforePaymentOrder.data?.travelersSummary?.travelerNumbers ?? {}
    );
    this.change.markForCheck();
  }
  get paymentInformation(): DeliveryInformationPaymentInformation {
    return this._paymentInformation;
  }
  _paymentInformation: DeliveryInformationPaymentInformation = {
    orderStatus: '',
    is3DSPayment: false,
    paymentMethod: '',
    beforePaymentOrder: {},
    warnings: [],
  };

  /** 手荷物ルール情報取得完了フラグ */
  @Input()
  isBaggageRuleExist: boolean = false;

  /** 手荷物ルールエリア表示フラグ */
  @Input() displayBaggageRulesArea: boolean = false;

  @Input() pnrInfo?: GetOrderResponseData;

  /** 予約詳細へボタン押下時イベントのためのOutput */
  @Output()
  returnToMyBooking: EventEmitter<string> = new EventEmitter<string>();

  /** ASW TOPへボタン押下時イベントのためのOutput */
  @Output()
  returnToAswTop: EventEmitter<void> = new EventEmitter<void>();

  /** Eチケットボタン押下時イベントのためのOutput */
  @Output()
  eTicketPdfCall: EventEmitter<void> = new EventEmitter<void>();

  /** コンストラクタ */
  constructor(
    private _common: CommonLibService,
    public change: ChangeDetectorRef,
    public aswMaster: AswMasterService,
    public staticMsg: StaticMsgPipe,
    public router: Router,
    public service: BookingCompletedPresService,
    public searchFlightStoreService: SearchFlightStoreService
  ) {
    super(_common);
    this.subscribeService(
      'aswMasterBookingCompletedPres',
      aswMaster.load([{ key: 'Office_All', fileName: 'Office_All' }], true),
      ([office]) => {
        this.deleteSubscription('aswMasterBookingCompletedPres');
        this.master.office = fixedArrayCache(office);
      }
    );
  }

  @Input()
  set mybookingBaggageRulesData(value: MybookingBaggageRulesInput | undefined) {
    this._mybookingBaggageRulesData = value;
    this.eTicketEmdLabel = this.service.getETicketEmdLabel(value?.getOrder);
    this.change.markForCheck();
  }
  get mybookingBaggageRulesData() {
    return this._mybookingBaggageRulesData;
  }
  private _mybookingBaggageRulesData?: MybookingBaggageRulesInput;

  public orderStatusLabel = '';
  public travelerNumText = '';
  public eTicketEmdLabel = 'label.displayTicket';
  public master: BookingCompletedMastarData = initialBookingCompletedMastarData();

  /** 画面サイズ判定(PC) */
  public isPC = isPC();

  /** 画面サイズ比較用変数(PC) */
  public isPCPre = this.isPC;

  /** 画面サイズチェック用関数 */
  private _resizeEvent = () => {
    this.isPCPre = this.isPC;
    this.isPC = isPC();
    if (this.isPCPre !== this.isPC) {
      this.change.markForCheck();
    }
  };

  /** 初期表示処理 */
  init() {
    // 画面サイズチェック開始
    this.subscribeService(
      'BookingCompletedResizeEvent',
      fromEvent(window, 'resize').pipe(throttleTime(500)),
      this._resizeEvent
    );
  }

  /** 画面終了時処理 */
  destroy() {}

  /** 画面更新時処理 */
  reload() {}

  /**
   * 予約詳細へボタンのクリックイベント
   */
  clickGoToMyBookingEvent() {
    this.returnToMyBooking.emit('');
  }

  /**
   * Asw Topへボタンのクリックイベント
   */
  clickGoToAswTopEvent() {
    this.returnToAswTop.emit();
  }

  /**
   * E-チケットボタンのクリックイベント
   */
  eTicketEvent() {
    if (this.eTicketEmdLabel === 'label.showETicketAndEmd') {
      this.returnToMyBooking.emit('ETICKET_AND_EMD');
    } else if (this.eTicketEmdLabel === 'label.displayTicket') {
      this.eTicketPdfCall.emit();
    }
  }

  /**
   *　手荷物ルールリンククリック時のイベント
   */
  clickLinkEvent() {
    this.returnToMyBooking.emit('FIRST_BAGGAGE');
  }
}
