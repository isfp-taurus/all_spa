import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { BaggageApplicationModalPayload, baggageApplicationModalPayloadParts } from '@app/id-modal/service-application';
import { DeliveryInformationStoreService, PlanReviewStoreService } from '@common/services';
import { AswCommonStoreService, CommonLibService, ModalService } from '@lib/services';
import { SupportComponent } from '@lib/components/support-class';
import { initialMybookingBaggageRulesDisp, MybookingBaggageRulesDisp } from '../mybooking-baggage-rules.state';
import { submitNavigate, transform } from '@common/helper';
import { environment } from '@env/environment';
import { DeliveryInformationPaymentInformation, ReservationPageIdType } from '@common/interfaces';
import { PageIdType, PageType, SessionStorageName } from '@lib/interfaces';
/**
 * 手荷物ルール USDOT,CADOT表示
 *
 */
@Component({
  selector: 'asw-mybooking-baggage-rules-dot',
  templateUrl: './mybooking-baggage-rules-dot.component.html',
  styleUrls: ['./mybooking-baggage-rules-dot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MybookingBaggageRulesDotComponent extends SupportComponent {
  constructor(
    private _common: CommonLibService,
    private _modalService: ModalService,
    private _planReviewStoreService: PlanReviewStoreService,
    public change: ChangeDetectorRef,
    private _deliveryInformationStoreService: DeliveryInformationStoreService,
    private _commonStoreService: AswCommonStoreService
  ) {
    super(_common);
    this.subscribeService('GetPageID', this._commonStoreService.getPageId$(), (pageID) =>
      pageID === ReservationPageIdType.BOOKING_COMPLEATED
        ? (this.bookingCompletedPageFlg = true)
        : (this.bookingCompletedPageFlg = false)
    );
    // 支払情報入力画面(R01-P080)から渡された決済前PNR情報
    this.paymentInformation =
      this._deliveryInformationStoreService.deliveryInformationData.paymentInformation ?? this.paymentInformation;
  }
  reload(): void {}
  init(): void {}
  destroy(): void {}
  @Input()
  set data(value: MybookingBaggageRulesDisp) {
    this._data = value;
    this.change.markForCheck();
  }
  get data(): MybookingBaggageRulesDisp {
    return this._data;
  }
  public _data: MybookingBaggageRulesDisp = initialMybookingBaggageRulesDisp;
  public isScrollChecked = false;
  public isScrollCarry = false;
  /** 支払情報入力画面(R01-P080)から渡された決済前PNR情報 */
  @Input()
  public paymentInformation: DeliveryInformationPaymentInformation = {
    orderStatus: '',
    is3DSPayment: false,
    paymentMethod: '',
    beforePaymentOrder: {},
    warnings: [],
  };
  // R01-P090_予約・購入完了画面であるか判定フラグ
  @Input()
  public bookingCompletedPageFlg = false;
  @Output()
  dataChange = new EventEmitter<MybookingBaggageRulesDisp>();
  public refresh() {}
  public update() {
    this.dataChange.emit(this._data);
  }

  // プラン有効判定（プラン確認画面にて使用）
  @Input() isPlanValid? = true;

  @Output()
  clickLinkEvent = new EventEmitter<void>();

  openModal() {
    const baggageParts = baggageApplicationModalPayloadParts();
    baggageParts.closeEvent = () => this.refreshPlan();
    this._modalService.showSubPageModal(baggageParts);
  }
  goToMyBooking() {
    const queryParams = {
      searchType: 'order',
      orderId: this.paymentInformation.beforePaymentOrder.data?.orderId ?? '',
      eTicketNumber: '',
      firstName: this.paymentInformation.beforePaymentOrder.data?.travelers?.[0]?.names?.[0]?.firstName ?? '',
      lastName: this.paymentInformation.beforePaymentOrder.data?.travelers?.[0]?.names?.[0]?.lastName ?? '',
      SITE_ID: 'ALL_APP',
      nextAction: 'FIRST_BAGGAGE',
      JourneyId: '',
      flightIdList: '',
      JSessionId: '',
      aswIntErrorId: '',
      errorId: '',
      warningId: '',
      CONNECTION_KIND: 'ZZZ', // 接続種別
    };
    // 予約検索画面(S01-P010)へ遷移
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    const identificationId = this._common.loadSessionStorage(SessionStorageName.IDENTIFICATION_ID);
    const url = transform(
      environment.spa.baseUrl + environment.spa.app.srv + '/booking-search',
      lang,
      identificationId
    );
    submitNavigate(url, queryParams);
  }

  /**
   * プラン確認画面更新処理を呼ぶ
   */
  refreshPlan(): void {
    this._planReviewStoreService.updatePlanReview({ isNeedRefresh: true });
  }

  /**
   * スクロール有無設定処理
   * ※asw-table-sliderから受け取った値を設定するために使用
   * @param table 'checked'(預入) | 'carry'(機内持ち込み)
   * @param value
   * @returns
   */
  setIsScroll(table: 'checked' | 'carry', value: boolean) {
    switch (table) {
      case 'checked':
        this.isScrollChecked = value;
        return;
      case 'carry':
        this.isScrollCarry = value;
        return;
      default:
        return;
    }
  }
}
