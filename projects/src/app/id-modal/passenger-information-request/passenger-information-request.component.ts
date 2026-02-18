import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { SupportModalIdComponent } from '@lib/components/support-class';
import { CommonLibService, ErrorsHandlerService, PageInitService, PageLoadingService } from '@lib/services';
import {
  defaultPassengerInformationRequestDynamicParams,
  PassengerInformationRequestDynamicParams,
  PassengerInformationRequestPassengerInformationDataGroup,
  GetOrdersReservationAvailabilityApiErrorMap,
} from './passenger-information-request.state';
import { CurrentCartState, GetCartState } from '@common/store';
import { PassengerInformationRequestHeaderComponent } from './passenger-information-request-header.component';
import { PassengerInformationRequestService } from './passenger-information-request.service';
import { PassengerInformationRequestFooterComponent } from './passenger-information-request-footer.component';
import {
  initialPassengerInformationRequestMastarData,
  PassengerInformationRequestEditType,
  PassengerInformationRequestMastarData,
  PassengerMailDestinationType,
  RegistrationLabelType,
  ReservationFunctionIdType,
  ReservationPageIdType,
} from '@common/interfaces';
import { deepCopyArray, apiEventAll, isStringEmpty, defaultApiErrorEvent } from '@common/helper';
import { PassengerInformationRequestPassengerInformationComponent } from './passenger-information/passenger-information.component';
import { PassengerInformationRequestPassengerInformationData } from './passenger-information/passenger-information.state';
import {
  initialPassengerInformationRequestRepresentativeInformationData,
  initialPassengerInformationRequestRepresentativeInformationParts,
  PassengerInformationRequestRepresentativeInformationData,
  PassengerInformationRequestRepresentativeInformationParts,
} from './representative-information/representative-information.state';
import { PassengerInformationRequestRepresentativeInformationComponent } from './representative-information/representative-information.component';
import { PassengerInformationRequestPayload } from './passenger-information-request.payload.state';
import { Router } from '@angular/router';
import { RoutesResRoutes } from '@conf/routes.config';
import { BehaviorSubject, filter } from 'rxjs';
import {
  PlanReviewStoreService,
  CurrentCartStoreService,
  CurrentPlanStoreService,
  OrdersReservationAvailabilityStoreService,
} from '@common/services';
import { DOCUMENT } from '@angular/common';
import { ApiCommonRequest, PageType } from '@lib/interfaces';
import { ReservationAvailabilityRequest } from 'src/sdk-member';
import { PostGetCartResponseData } from 'src/sdk-reservation';

/**
 * 搭乗者情報入力画面
 * R01-M060 搭乗者情報入力
 */
@Component({
  selector: 'asw-passenger-information-request',
  templateUrl: './passenger-information-request.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassengerInformationRequestComponent extends SupportModalIdComponent implements AfterViewInit {
  /** プロパティ定義*/
  public subPageId: string = ReservationPageIdType.PASSENGER_INFORMATION_REQUEST;
  public subFunctionId: string = ReservationFunctionIdType.PRIME_BOOKING;
  public dynamicSubject = new BehaviorSubject<PassengerInformationRequestDynamicParams>(
    defaultPassengerInformationRequestDynamicParams()
  );

  override autoInitEnd = false;

  /**
   * 搭乗者情報
   * */
  @ViewChildren('passengerComponent')
  public passengerComponent?: QueryList<PassengerInformationRequestPassengerInformationComponent>;
  public passengerInformationList: Array<PassengerInformationRequestPassengerInformationDataGroup> = [];
  public passengerInformationListInit: Array<PassengerInformationRequestPassengerInformationDataGroup> = [];
  passengerInfoChange(value: PassengerInformationRequestPassengerInformationData, index: number) {}
  passengerInfoOpen(value: boolean, index: number) {
    this.passengerInformationList[index].parts.isOpen = value;
    if (value) {
      this.passengerInformationList[index].parts.registrarionLabel = RegistrationLabelType.EDITTING;
      this.updateCompleteArea();
      this.passengerComponent?.find((com) => com.index === index)?.refresh();
    }
  }

  /**
   * 代表者情報
   * */
  @ViewChild('representativeComponent')
  public representativeComponent?: PassengerInformationRequestRepresentativeInformationComponent;
  public representativeInformation: PassengerInformationRequestRepresentativeInformationData =
    initialPassengerInformationRequestRepresentativeInformationData();
  public representativeInformationParts: PassengerInformationRequestRepresentativeInformationParts =
    initialPassengerInformationRequestRepresentativeInformationParts();
  set isOpenRepresentativeInformation(value: boolean) {
    this._isOpenRepresentativeInformation = value;
    if (value) {
      this.representativeInformationParts.registrarionLabel = RegistrationLabelType.EDITTING;
      this.updateCompleteArea();
    }
  }
  get isOpenRepresentativeInformation(): boolean {
    return this._isOpenRepresentativeInformation;
  }
  public _isOpenRepresentativeInformation: boolean = false;

  //ヘッダーフッター
  public override headerRef: PassengerInformationRequestHeaderComponent | null = null;
  public override footerRef: PassengerInformationRequestFooterComponent | null = null;
  //　キャッシュマスターデータ
  public master: PassengerInformationRequestMastarData = initialPassengerInformationRequestMastarData();
  //サイズ変化を検知する箇所のエレメント
  @ViewChild('bodyContent') bodyContent?: ElementRef;

  // 初期化完了フラグ（表示開始フラグ）
  public isInitEnd = false;
  // 多重クリック防止フラグ
  public disablePlanSaveNext = false;
  // 搭乗者モーダルに渡されるペイロード定義
  public override payload: PassengerInformationRequestPayload = {
    isEditMode: false,
    editArea: 0,
  };
  // 特典予約フラグ
  public isAwardBooking: boolean = false;
  // 予約可否フラグ
  public isAvailableToReserve: boolean = false;

  /**
   * コンストラクタ
   */
  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _changeDetectorRef: ChangeDetectorRef,
    private _pageInitService: PageInitService,
    private _common: CommonLibService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _router: Router,
    private _service: PassengerInformationRequestService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _currentPlanStoreService: CurrentPlanStoreService,
    private _planReviewStoreService: PlanReviewStoreService,
    private _pageloadingService: PageLoadingService,
    private _ordersReservationAvailabilityStoreService: OrdersReservationAvailabilityStoreService
  ) {
    super(_common, _pageInitService);
    this._pageloadingService.startLoading();
    this.params = this.dynamicSubject.asObservable().pipe(
      filter((params) => {
        return !!params.getCartReply || !!params.getMemberInformationReply;
      })
    );
    this.closeWithUrlChange(this._router);
  }

  /**
   * 初期表示処理
   */
  init(): void {
    //キャッシュ取得、取得後は画面初期化処理へ
    this._service.getCacheMaster((master) => {
      this._service.initialAswCommon();
      this.master = master;
      this.refresh();
    });
  }

  reload(): void {}
  destroy(): void {}

  /**
   * ビュー初期化後処理　画面サイズ変更がベース側で検知されないパターンがあるので自身でマニュアル通知する
   */
  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    if (this.bodyContent) {
      this._resizeObserver.observe(this.bodyContent.nativeElement);
    }
    if (this.footerRef) {
      this.footerRef.applyEvent = () => {
        this.clickSave();
      };
    }
  }

  /**
   * ResizeObserver作成、指定したコンテンツのサイズが変更したときに起動する
   */
  private _resizeObserver = new ResizeObserver(() => {
    //自動検知に失敗するパターンがあるため手動でリサイズさせる
    this.resizeForce();
  });

  /**
   * 初期化
   */
  refresh() {
    //カート取得APIを呼び出す
    this._service.updateCart((res) => {
      this.refreshData(res);
    });
  }

  /**
   * サブコンポーネントに渡すデータを作成する
   * @param res カートAPIレスポンス
   */
  refreshData(res: GetCartState) {
    //代表者情報作成
    this.representativeInformation = this._service.createRepresentativeInformation(
      res,
      this.master,
      this.payload ?? {}
    );
    this.representativeInformationParts = this._service.createRepresentativeInformationParts(
      res,
      this.payload ?? {},
      this.master
    );
    //搭乗者情報作成
    this.passengerInformationList = this._service.createPassengerInformationGroup(res, this.master, this.payload ?? {});
    this.passengerInformationListInit = deepCopyArray(this.passengerInformationList);
    //初期更新処理
    this.edittingAreaOpen();
    this.updateCompleteArea();

    // 動的文言
    this.dynamicSubject.next({
      getMemberInformationReply: undefined,
      getCartReply: res,
      getMemberInformationReplyMediValdYmd: undefined,
    });
    this._pageInitService.subDynamicInit(this.dynamicSubject.asObservable());
    this._pageInitService.endInit(null);
    // 会員情報取得
    this.getMemberInformation();

    this.isInitEnd = true;

    this.phoneTypeRepresentative({
      code: this.representativeInformation.phoneCountry,
      type: this.representativeInformation.tellType,
      number: this.representativeInformation.phoneNumber,
    });

    // 特典予約の判定
    this.isAwardBooking = this.checkAwardBooking(res?.data);

    this._changeDetectorRef.markForCheck();
  }

  /**
   * 会員情報取得処理
   */
  public getMemberInformation(): void {
    if (!this._common.isNotLogin()) {
      // 会員情報取得APIレスポンス処理
      this.subscribeService(
        'PassengerInformation_getMemberInformation',
        this._common.amcMemberStoreService.saveMemberInformationToAMCMember$(),
        (responseBasic) => {
          // 動的文言更新
          this.deleteSubscription('PassengerInformation_getMemberInformation');
          let updateDynamicParams = { ...this.dynamicSubject.value };
          updateDynamicParams.getMemberInformationReply = responseBasic;
          // MSG1185で必要になる精神障害者福祉手帳有効期限の情報を追加する
          const expiryDate = responseBasic?.model?.data?.document?.filter((v) => v.documentType === 'U')[0]?.expiryDate;
          if (expiryDate) {
            const mediValdYmd = this.convertDateToFormatDateString(new Date(expiryDate));
            updateDynamicParams.getMemberInformationReplyMediValdYmd = mediValdYmd;
          }
          this.dynamicSubject.next(updateDynamicParams);
        }
      );
    }
  }

  /**
   * 予約可否判断API情報取得
   * @param cartId カートID
   * @param res 最新のカート取得情報
   */
  getReservationAvailabilityInformation(cartId: string | undefined, res: CurrentCartState): void {
    if (!cartId) return;

    // 予約可否判断API呼び出し
    this.setReservationAvailabilityFromApi({ cartId }, res);

    this._changeDetectorRef.markForCheck();
  }

  /**
   * 指定IDにスクロール位置を移動する
   * @param id 指定ID
   */
  setScrollId(id: string) {
    const elem = this._document.getElementById(id);
    if (elem) {
      this.setScroll(elem.offsetTop - elem.offsetHeight / 2);
    } else {
      this.setScroll(0);
    }
  }

  /**
   * 代表者情報　次へボタン押下処理
   */
  clickNextRepresentative() {
    this.planSaveNext(() => {
      this.passengerInformationList.forEach((item) => {
        item.parts.contact.isEnableRepresentativeMail = !isStringEmpty(this.representativeInformation.email);
        item.data.contact.passengerMailDestination = item.parts.contact.isEnableRepresentativeMail
          ? PassengerMailDestinationType.REPRESENTATIVE
          : PassengerMailDestinationType.INDIVIDUAL;
      });

      this.setScrollId('passenger-information-request-representative');
      this.clickNextAfter(0);
    });
  }
  /**
   * 搭乗者情報　次へボタン押下処理
   * 次の搭乗者、もしくは現地連絡先情報を指定して処理を実行
   */
  clickNextnPassenger(index: number) {
    const isLastpassenger = index + 1 === this.passengerInformationList.length;
    this.planSaveNext(() => {
      this.setScrollId(`passenger-information-request-passenger-${index}`);
      if (isLastpassenger) {
        //FY25　追加　最後の搭乗者かつ現地滞在先がない
        this.clickNextAfter(PassengerInformationRequestEditType.NOT_EDITTING);
      } else {
        this.clickNextAfter(index + 1);
      }
    });
  }

  /**
   * 次へボタン押下 後処理
   * @param index 次に編集する番号
   */
  clickNextAfter(index: number) {
    //注意喚起エリアをリセット
    this._common.errorsHandlerService.clearRetryableError(PageType.SUBPAGE);
    this._common.alertMessageStoreService.removeAllAlertSubWarningMessage();
    // 編集中のものを登録済みにする
    this._service.editToRegistered(this.representativeInformationParts, this.passengerInformationList);
    //次の編集ブロックを編集中にする
    if (index !== PassengerInformationRequestEditType.NOT_EDITTING) {
      if (this.passengerInformationList[index]) {
        this.passengerInformationList[index].parts.registrarionLabel = RegistrationLabelType.EDITTING;
      }
    }
    // シャッターを閉じる、ただし、次に編集するものは開く
    this.edittingAreaOpen();
    // 情報の更新
    this.passengerInformationListInit = deepCopyArray(this.passengerInformationList);
    this.refreshAll();
    // 編集フラグを通知
    if (this.headerRef) {
      this.headerRef.isUpdateTraveler = true;
    }

    if (index === PassengerInformationRequestEditType.NOT_EDITTING) {
      //　次に開くブロックがない（最後のブロック）
      //遷移先分岐モーダル表示 最新データが必要なためカート取得APIを呼び出した後実行
      this.disablePlanSaveNext = true;
      this._service.updateCart((res) => {
        // 特典予約の判定
        this.isAwardBooking = this.checkAwardBooking(res?.data);
        if (!this.isAwardBooking) {
          this._service.openSelectNextPage(res, this.passengerInformationList, () => {
            this.close();
          });
          return;
        }

        const cartId =
          this._currentCartStoreService.CurrentCartData.data?.cartId ||
          this._currentPlanStoreService.CurrentPlanData.cartId;
        // 予約可否判断API呼び出し
        this.getReservationAvailabilityInformation(cartId, res);
      });
    }
  }

  /**
   * 編集中のブロックのシャッターを開く
   */
  edittingAreaOpen() {
    this.isOpenRepresentativeInformation =
      this.representativeInformationParts.registrarionLabel === RegistrationLabelType.EDITTING;
    this.passengerInformationList.forEach((pass) => {
      pass.parts.isOpen = pass.parts.registrarionLabel === RegistrationLabelType.EDITTING;
    });
  }

  /**
   * 保存・プラン確認画面へ戻るボタン押下処理
   */
  clickSave() {
    this.planSaveNext(() => {
      if (
        !this.payload.isEditMode &&
        this.passengerInformationList.some(
          (pass) => pass.parts.registrarionLabel === RegistrationLabelType.NOT_REGISTERED
        )
      ) {
        // 新規登録モード、かつ登録状況が未登録である搭乗者が存在する場合
        this._common.alertMessageStoreService.setAlertWarningMessage({
          contentHtml: 'm_error_message-W0875',
          isCloseEnable: true,
          errorMessageId: 'W0875',
        });
      }
      this._planReviewStoreService.updatePlanReview({ isNeedRefresh: true });
      this.close();
    });
  }

  /**
   * プラン保存処理
   * @param next 次に行う処理
   */
  planSaveNext(next: () => void) {
    if (this.disablePlanSaveNext) {
      return;
    }
    this.disablePlanSaveNext = true; // 多重クリック防止ON
    this.updateAll();
    this._service.savePlan(
      this.representativeInformationParts,
      this.representativeInformation,
      this.passengerInformationList,
      this.passengerInformationListInit,
      () => {
        next();
        this.disablePlanSaveNext = false;
      },
      () => {
        // エラー時
        ///* エラー項目へのフォーカス　TODO お試し品
        this._changeDetectorRef.detectChanges();
        // 一番外側の要素を取得
        const el = document.getElementById('passenger-information-main-block');
        if (el) {
          //　入力項目を全取得
          const tagStr = 'input:not([disabled]), select:not([disabled])';
          const elements = el.querySelectorAll<HTMLElement>(tagStr);
          // 入力項目から最初のエラー項目を探す
          const elForm = Array.from(elements).find((elm) => {
            return elm.getAttribute('aria-invalid') === 'true';
          });

          if (elForm) {
            /*  廃止予定　一応残しておきます
            //　エラー項目のスクロール位置を計算
            let elParent: HTMLElement | null = elForm.parentElement;
            let max = elParent?.offsetTop ?? 0;
            while (elParent !== el && elParent !== null) {
              //　一番offsetHeightが大きいエレメントを探す ≒ スクロール高さ
              elParent = elParent?.parentElement ?? null;
              max = max < (elParent?.offsetTop ?? 0) ? elParent?.offsetTop ?? 0 : max;
            }
            // エラー項目をフォーカス
            elForm.focus();
            // エラー項目の位置までスクロール
            const fixMax = max - 96; //決め打ちで項目ブロック分高さを引く
            this.setScroll(0 < fixMax ? fixMax : 0);
            */
            // エラー項目をフォーカス
            elForm.focus();
            // エラー項目の位置までスクロール
            elForm.scrollIntoView({ block: 'center' });
          } else {
            this.setScroll(0);
          }
        } else {
          this.setScroll(0);
        } //*/

        this.disablePlanSaveNext = false;
      },
      () => {
        this.disablePlanSaveNext = false;
      }
    );
  }

  /**
   * 代表者電話番号種別値変更処理
   */
  phoneTypeRepresentative(value: { code: string; type: string; number: string }) {
    if (this._service.changeRepresentativePhoneType(value, this.master.country, this.passengerInformationList)) {
      this.updateCompleteArea();
    }
    this.refreshAll();
  }
  /**
   * 入力完了エリアの表示更新処理
   */
  updateCompleteArea() {
    this._service.completedAreaShow(
      this.representativeInformationParts,
      this.passengerInformationList,
      this.payload.isEditMode
    );
    this.passengerComponent?.forEach((com) => com.change.markForCheck());
    this.representativeComponent?.change.markForCheck();
  }
  /**
   *  サブコンポーネントのrefresh
   */
  refreshAll() {
    this.passengerComponent?.forEach((com) => com.refreshForce());
    this.representativeComponent?.refreshForce();
    this._changeDetectorRef.detectChanges();
  }
  /**
   *  サブコンポーネントのアップデート
   */
  updateAll() {
    this.passengerComponent?.forEach((com) => com.updateForce(true));
    this.representativeComponent?.updateForce(true);
  }

  /**
   *  特典予約判別チェック
   *  @param data カート取得APIレスポンスデータ
   *
   *  data.plan.airOffer.bounds[?].flights[?].fareInfos.fareType
   */
  private checkAwardBooking(data: PostGetCartResponseData | undefined): boolean {
    // データが存在しない場合Falseを返す
    if (!data?.plan?.airOffer?.bounds || !Array.isArray(data.plan.airOffer.bounds)) {
      return false;
    }
    // 運賃タイプ取得
    const fareType: string = data?.plan?.airOffer?.bounds?.[0]?.flights?.[0]?.fareInfos?.fareType ?? '';
    // 運賃タイプは特典が含まれた場合Trueを返す
    if (fareType === 'awardFare') {
      return true;
    }
    // 特典予約以外
    return false;
  }

  /**
   * 予約可否判断APIを呼び出す処理
   * @param currentCartId
   * @param res
   */
  setReservationAvailabilityFromApi(currentCartId: ReservationAvailabilityRequest, res: CurrentCartState): void {
    apiEventAll(
      () => this._ordersReservationAvailabilityStoreService.callApi(currentCartId),
      this._ordersReservationAvailabilityStoreService.getOrdersReservationAvailability$(),
      (response) => {
        this.subscribeService(
          'GetMemberInformationApi_passengerInformationRequest',
          this._common.amcMemberStoreService.saveMemberInformationToAMCMember$(),
          (result) => {}
        );

        this.isAvailableToReserve = response.model?.data.isAvailableToReserve ?? false;
        // 特典予約の場合かつ予約可否判断フラグが予約不可Falseの場合、モーダルが閉じてプラン確認画面に表示する
        if (!this.isAvailableToReserve) {
          this.close();
          this._errorsHandlerSvc.setRetryableError(PageType.PAGE, {
            errorMsgId: 'EA033',
          });
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        this._service.openSelectNextPage(res, this.passengerInformationList, () => {
          this.close();
        });
      },
      (error) => {
        // apiErrorが非同期で設定されるのを待つ
        this._common.apiErrorResponseService.getApiErrorResponse$().subscribe((apiError) => {
          if (apiError) {
            // apiErrorがnullでない場合にエラーコードを取得
            const errorCode = apiError.errors?.[0]?.code ?? '';
            // エラー処理
            defaultApiErrorEvent(
              errorCode,
              GetOrdersReservationAvailabilityApiErrorMap,
              (retryable) => {
                this._common.errorsHandlerService.setRetryableError(PageType.PAGE, retryable);
                window.scroll({
                  top: 0,
                } as ScrollToOptions);
              },
              (notRetryable) => {
                this._common.errorsHandlerService.setNotRetryableError(notRetryable);
              }
            );

            // 搭乗者情報入力モーダルを閉じる
            this.close();
            return;
          }
        });
      }
    );
  }

  /** Dateオブジェクトを日付文字列のフォーマットへ変換する yyyy-MM-dd */
  private convertDateToFormatDateString(date: Date | null): string {
    if (date != null) {
      if (typeof date === 'string') {
        date = new Date(date);
      }
      return (
        date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
      );
    } else {
      return '';
    }
  }
}
