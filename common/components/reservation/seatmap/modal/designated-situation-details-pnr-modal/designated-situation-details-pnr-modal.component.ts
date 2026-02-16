import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonLibService, DialogDisplayService, PageInitService, PageLoadingService } from '@lib/services';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { DeliveryInformationStoreService, GetOrderStoreService } from '@common/services';
import { Type1 } from 'src/sdk-servicing';
import { AnaBizLoginStatusType, AswContextType, DialogClickType, PageType, RetryableError } from '@lib/interfaces';
import { Router } from '@angular/router';
import { RoutesResRoutes } from '@conf/routes.config';
import { GetSeatmapsStoreService } from '@common/services/api-store/sdk-servicing/get-seatmaps-store/get-seatmaps-store.service';
import { apiEventAll, deepCopyArray } from '@common/helper';
import { UpdateServicesStoreService } from '@common/services/api-store/sdk-servicing/update-services-store/update-services-store.service';
import { CurrentSeatmapService } from '@common/services/store/current-seatmap/current-seatmap-store.service';
import {
  MListData,
  PassengerForServicingSeatmapScreen,
  SeatForServicingSeatmapScreen,
  SeatInfo,
} from '@common/interfaces';
import { take } from 'rxjs';
import { SeatmapHelperService } from '@common/services/seatmap/seatmap-helper.service';
import { pnrModalDisplayPassenger } from './designated-situation-details-pnr-modal.state';
import { SeatAttributeRequestService } from '@app/seat-attribute-request/seat-attribute-request-service';
import { splitCouchSeatNumber } from '@common/helper/common/seatmap.helper';
import { DesignedSituationDetailsPnrModalService } from './designated-situation-details-pnr-modal.service';
import { MasterJsonKeyPrefix } from '@conf/asw-master.config';
import { updateServiceResponseWarningsSourceInner } from 'src/sdk-servicing/model/updateServiceResponseWarningsSourceInner';
import { AppConstants } from '@conf/app.constants';
import { ServicingSeatmapService } from '@common/services/seatmap/servicing-seatmap.service';
import { ErrorCodeConstants } from '@conf/app.constants';

// todo：引継ぎ情報はいつクリアされる？
/**
 * designated-situation-details-pnr-modal
 * 指定状況詳細(PNR)モーダル
 */
@Component({
  selector: 'asw-designated-situation-details-pnr-modal',
  templateUrl: './designated-situation-details-pnr-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesignatedSituationDetailsPnrModalComponent extends SupportModalBlockComponent {
  /** 搭乗者マップ */
  travelersMap?: Map<string, PassengerForServicingSeatmapScreen>;

  /** 搭乗者IDリスト */
  passengerIdList: string[] = [];

  /** メキシコオフィスかどうか */
  isPosInMexico: boolean = false;

  /** 選択中座席情報 */
  selectedSeatInfoList?: SeatInfo[];

  /** 全セグメント情報 */
  allSegmentInfo?: Array<Type1>;

  /** 表示用搭乗者リスト */
  displayPassenger?: pnrModalDisplayPassenger;

  /** 座席指定内容 */
  seatAttributeListData?: Array<MListData>;

  /** 座席指定合計金額 */
  totalAmount: number = 0;

  /** 確認ボタン押下かどうか */
  isConfirmClick?: boolean;

  confirmLabelStaticMsgKey: string = '';

  public appConstants = AppConstants;

  constructor(
    private _dialogSvc: DialogDisplayService,
    private _common: CommonLibService,
    public changeDetector: ChangeDetectorRef,
    private _getOrderStoreService: GetOrderStoreService,
    private _updateServicesStoreService: UpdateServicesStoreService,
    private _deliveryInfoStoreService: DeliveryInformationStoreService,
    private _currentSeatmapService: CurrentSeatmapService,
    private _seatmapHelperService: SeatmapHelperService,
    private _router: Router,
    private _getSeatmapsStoreService: GetSeatmapsStoreService,
    private _pnrModalService: DesignedSituationDetailsPnrModalService,
    private _seatAttrService: SeatAttributeRequestService,
    private _pageinitService: PageInitService,
    private _seatmapService: ServicingSeatmapService,
    private _pageLoadingService: PageLoadingService
  ) {
    super(_common);
    this.closeWithUrlChange(this._router);
  }

  /**
   * 初期処理
   */
  init(): void {
    this.subscribeService(
      'pnrModalgetPos',
      this._common.aswContextStoreService.getAswContextByKey$(AswContextType.POS_COUNTRY_CODE).pipe(take(1)),
      (value) => {
        this.deleteSubscription('pnrModalgetPos');
        this.isPosInMexico = value === 'MX';
      }
    );

    this.subscribeService('seatMapSeatAttribute', this._seatAttrService.getCacheMaster$(), (value) => {
      this.seatAttributeListData = value;
      this.changeDetector.markForCheck();
    });

    this.selectedSeatInfoList = this._currentSeatmapService.CurrentSeatmapData.selectedSeatInfoList ?? [];
    this.allSegmentInfo = this._seatmapHelperService.createAllSegmentList();
    this.travelersMap = this._currentSeatmapService.CurrentSeatmapData.passengers ?? new Map();
    this.passengerIdList = this._currentSeatmapService.getPassengerIdList() ?? [];
    this.isConfirmClick = this._currentSeatmapService.CurrentSeatmapData.isConfirmClick;

    this.displayPassenger = this.getSegmentChangeList()?.map((segment) => {
      let tempArray: Array<Array<{ id: string; accompanyingInfantId?: string }>> = [];
      let passengerIdList = deepCopyArray(this.passengerIdList);
      this.passengerIdList.forEach((passengerId) => {
        // 搭乗者IDがリストにあればリストから削除
        if (passengerIdList.includes(passengerId)) {
          this.getSameSeatPassengersId(segment.id, passengerId)?.forEach((seatPassengerId) => {
            passengerIdList.splice(
              passengerIdList.findIndex((value) => value === seatPassengerId),
              1
            );
          });

          // 各座席を選択している搭乗者をtempArrayにいれる
          tempArray.push(
            this.getSameSeatPassengersId(segment.id, passengerId)?.map((seatPassengerId) => {
              if (this.travelersMap?.get(seatPassengerId)?.accompanyingInfant?.id) {
                return {
                  id: seatPassengerId,
                  accompanyingInfantId: this.travelersMap?.get(seatPassengerId)?.accompanyingInfant?.id,
                };
              } else {
                return { id: seatPassengerId };
              }
            }) ?? []
          );
        }
      });
      return tempArray;
    });

    this.selectedSeatInfoList.forEach((segemntSeatInfo) => {
      // セグメントごと計算済み座席リスト
      let caculateedSeatNumberList: string[] = [];
      segemntSeatInfo.passengerList.forEach((passengerSeatInfo) => {
        if (passengerSeatInfo.seatNumber !== passengerSeatInfo.ssrInformation?.ssrSeatNumber) {
          if (!caculateedSeatNumberList.includes(passengerSeatInfo.seatNumber ?? '')) {
            if (passengerSeatInfo.seatNumber) {
              caculateedSeatNumberList.push(passengerSeatInfo.seatNumber);
              this.totalAmount += passengerSeatInfo.specifiedAmount ?? 0;
            }
          }
        }
      });
    });
    this.confirmLabelStaticMsgKey = this.getConfirmLabelStaticMsgKey();
    this._pageinitService.endInit();
  }

  /**
   * 内容確定・購入へボタンクリック
   */
  public clickApply() {
    let paymentDisplayErrorList: Array<RetryableError> = [];
    let paymentDisplayWarningList: Array<RetryableError> = [];
    if (this.getSegmentChangeList()?.length) {
      // 指定状態に変更がある場合
      this._pageLoadingService.startLoading();

      apiEventAll(
        () =>
          this._updateServicesStoreService.setupdateServicesFromApi(
            this._pnrModalService.createUpdateServicesRequestParameter()
          ),
        this._updateServicesStoreService.getupdateServicesObservable(),
        (response) => {
          this._pageLoadingService.endLoading();

          // 選択した座席がすべてワーニングで返却された
          let seatWarningAll: boolean | undefined =
            this._currentSeatmapService.CurrentSeatmapData.selectedSeatInfoList?.every((seatInfo) =>
              seatInfo.passengerList.every((seatInfoPassenger) => {
                if (seatInfoPassenger.seatNumber) {
                  return response.warnings?.some((warning) => {
                    return (
                      (warning?.source as updateServiceResponseWarningsSourceInner | undefined)?.items[0].flightId ===
                        seatInfo.segmentId &&
                      (
                        warning?.source as updateServiceResponseWarningsSourceInner | undefined
                      )?.items[0].travelerIds.includes(seatInfoPassenger.id)
                    );
                  });
                } else if (seatInfoPassenger.seatAttribute?.ssrCode) {
                  return false;
                } else {
                  return true;
                }
              })
            );

          if (seatWarningAll) {
            const errorInfo = {
              errorMsgId: 'E0442',
            };
            this._common.errorsHandlerService.setRetryableError(PageType.PAGE, errorInfo);
            this.closeEvent();
            return;
          }

          // 支払情報入力画面側で表示するワーニングを追加
          if (this._pnrModalService.createPaymentDisplayWarningInfoFromUpdateService(response.warnings)) {
            paymentDisplayErrorList.push(
              this._pnrModalService.createPaymentDisplayWarningInfoFromUpdateService(response.warnings)!
            );
          }

          if (this.createPaymentDisplayWarningInfoFromGetOrderAndSeatmap()) {
            paymentDisplayWarningList.push(this.createPaymentDisplayWarningInfoFromGetOrderAndSeatmap()!);
          }
          this._deliveryInfoStoreService.updateDeliveryInformation({
            passToPayment: {
              ...this._deliveryInfoStoreService.deliveryInformationData.passToPayment,
              errInfo: paymentDisplayErrorList,
              warningInfo: paymentDisplayWarningList,
            },
          });
          const routerUrl =
            this._common.aswContextStoreService.aswContextData.anaBizLoginStatus === AnaBizLoginStatusType.LOGIN
              ? RoutesResRoutes.ANABIZ_PAYMENT_INPUT
              : RoutesResRoutes.PAYMENT_INPUT;
          // 支払情報入力画面へ遷移
          this._router.navigate([routerUrl]);
        },
        (error) => {
          this._pageLoadingService.endLoading();

          const errorCode = this._common.apiError?.errors?.[0].code;
          this._pnrModalService.handleUpdateServiceApiError(errorCode);
          // エラーコードEBAZ000252返却時、指定状況詳細(PNR)モーダルを閉じる
          if (errorCode === ErrorCodeConstants.ERROR_CODES.EBAZ000252) {
            this.closeEvent();
          }
        }
      );
    }

    if (!this.getSegmentChangeList()?.length) {
      const routerUrl =
        this._common.aswContextStoreService.aswContextData.anaBizLoginStatus === AnaBizLoginStatusType.LOGIN
          ? RoutesResRoutes.ANABIZ_PAYMENT_INPUT
          : RoutesResRoutes.PAYMENT_INPUT;
      // 指定状況に変更がない場合は支払情報入力画面へ遷移
      this._router.navigate([routerUrl]);
    }
  }

  /**
   * 有料席のタイプを返却する関数。カウチならc、有料席ならp、その他の座席は空の文字列を返却
   * @param passengerId 搭乗者ID
   * @param segmentId セグメントID
   * @returns 有料席のタイプを表す文字列
   */
  public getSeatType(passengerId: string, segmentId: string | undefined) {
    if (!!this.selectedSeatInfoList) {
      const tempPassenger = this._currentSeatmapService.findSegmentPassengerSeatInfo(segmentId ?? '', passengerId);

      if (!!tempPassenger?.specifiedAmount && tempPassenger?.specifiedAmount > 0) {
        if (this._currentSeatmapService.findSeatInfoFromSeatNumber(tempPassenger.seatNumber)?.[0].isCouchSeat) {
          return 'c';
        } else {
          return 'p';
        }
      }
    }

    return '';
  }

  /**
   * 席なし幼児の搭乗者IDからその名前を返却する関数
   * @param passengerId 搭乗者ID
   * @returns 席なし幼児の名前
   */
  public getInfantName(passengerId?: string): string | undefined {
    return this._currentSeatmapService.getInfantName(passengerId) ?? '';
  }

  /**
   * 特定の搭乗者がとあるセグメントでの申込金額をストアから取得する関数
   * @param passengerId 搭乗者ID
   * @param flightId セグメントID
   * @returns 申込金額
   */
  public getSeatPrice(passengerId: string, flightId: string | undefined) {
    let tempPassenger = this.selectedSeatInfoList
      ?.find((s) => s.segmentId === flightId)
      ?.passengerList.find((p) => p.id === passengerId);

    if (!!tempPassenger?.specifiedAmount) {
      return tempPassenger.specifiedAmount;
    }

    return 0;
  }

  /**
   * 同じカウチ席の搭乗者を取得する関数
   * @param flightId セグメントID
   * @param passengerId 搭乗者ID
   * @return 同じカウチ席の搭乗者のIDリスト
   */
  private getSameSeatPassengersId(flightId: string | undefined, passengerId: string): string[] | undefined {
    const segmentSeatInfo = this.selectedSeatInfoList?.find((s) => s.segmentId === flightId);
    const seatNumber = segmentSeatInfo?.passengerList.find((p) => p.id === passengerId)?.seatNumber;
    if (
      splitCouchSeatNumber(seatNumber).columnNumbers?.length === undefined ||
      splitCouchSeatNumber(seatNumber).columnNumbers?.length === 1
    ) {
      return [passengerId ?? ''];
    } else {
      const sameCouchPassengerIdList = segmentSeatInfo?.passengerList
        .filter((passenger) => passenger.seatNumber === seatNumber)
        .map((passenger) => passenger.id);

      return sameCouchPassengerIdList;
    }
  }

  /**
   * 特定の搭乗者がとあるセグメントでの座席指定状況を返却する関数
   * @param passengerId 搭乗者ID
   * @param flightId セグメントID
   * @return 座席指定状況
   */
  public getSeatDesignatedSituation(passengerId: string, flightId: string | undefined): string | undefined {
    let tempPassenger = this.selectedSeatInfoList
      ?.find((s) => s.segmentId === flightId)
      ?.passengerList.find((p) => p.id === passengerId);

    if (!!flightId) {
      // 選択中座席情報.当該セグメント.当該選択している座席情報.座席番号≠””
      if (!!tempPassenger?.seatNumber) {
        // 選択中座席情報.当該セグメント.当該選択している座席情報.座席番号リスト.座席番号[0]
        return tempPassenger?.seatNumber;

        // 選択中座席情報.当該セグメント.当該選択している座席情報.座席属性.SSRコード≠””
      } else if (!!tempPassenger?.seatAttribute?.ssrCode) {
        // 選択中座席情報.当該セグメント.当該選択している座席情報.座席属性.SSRコードに紐づく座席属性名
        return this.seatAttributeListData?.find((listData) => listData.value === tempPassenger?.seatAttribute?.ssrCode)
          ?.display_content;
      }
    }
    return '';
  }

  /**
   * 初期申込状態から変更があるセグメントを取得する
   * @returns 変更があるセグメント情報
   */
  public getSegmentChangeList(): Type1[] | undefined {
    let changedSegmentIdList: string[] =
      this._currentSeatmapService.CurrentSeatmapData.selectedSeatInfoList
        ?.filter(
          (segment) =>
            !!segment.passengerList.find(
              (passenger) =>
                passenger.seatNumber != passenger.ssrInformation?.ssrSeatNumber || passenger.seatAttribute?.ssrCode
            )
        )
        .map((segment) => segment.segmentId) ?? [];
    return this.allSegmentInfo?.filter((segment) => changedSegmentIdList.includes(segment.id ?? ''));
  }

  /**
   * 支払情報入力画面で表示するワーニングをセットする
   *
   * @returns 継続可能エラーメッセージ
   */
  private createPaymentDisplayWarningInfoFromGetOrderAndSeatmap(): RetryableError | null {
    // 選択中座席情報リストからNH運航の国際線またはNH便名の国内線のセグメントを割り出す
    const isNHoperateOrMarketingSeatInfoList =
      this._currentSeatmapService.CurrentSeatmapData.selectedSeatInfoList?.filter((segment) => {
        const listId = this._seatmapHelperService.convertSegmentToBoundFlightListId(segment.segmentId);
        if (listId) {
          return (
            (this._getOrderStoreService.getOrderData.data?.air?.bounds?.[listId.boundListId].flights?.[
              listId.flightListId
            ].operatingAirlineCode === this.appConstants.CARRIER.TWO_LETTER &&
              this._getOrderStoreService.getOrderData.data?.air?.tripType === 'international') ||
            (this._getOrderStoreService.getOrderData.data?.air?.bounds?.[listId.boundListId].flights?.[
              listId.flightListId
            ].marketingAirlineCode === this.appConstants.CARRIER.TWO_LETTER &&
              this._getOrderStoreService.getOrderData.data?.air?.tripType === 'domestic')
          );
        } else {
          return false;
        }
      });
    // NH運航の国際線またはNH便名の国内線がない場合
    if (!isNHoperateOrMarketingSeatInfoList || isNHoperateOrMarketingSeatInfoList.length === 0) {
      return null;
    }
    // NH運航の国際線またはNH便名の国内線がある場合
    if (
      isNHoperateOrMarketingSeatInfoList?.some(
        (segment) =>
          segment.passengerList.some((passenger) => passenger.specifiedAmount > 0) &&
          Object.keys(
            this._getOrderStoreService.getOrderData.data?.seats?.[segment.segmentId]?.[segment.passengerList[0].id]
              ?.couchCatalogue
          ).length !== 0 &&
          (this._getOrderStoreService.getOrderData.data?.seats?.[segment.segmentId]?.[segment.passengerList[0].id]
            ?.couchCatalogue).constructor === Object
      )
    ) {
      // カウチカタログが存在し、なおかつ有料席を選択している
      return { errorMsgId: 'E0445' };
    } else if (
      // カウチカタログが存在しないが、有料席を選択している
      isNHoperateOrMarketingSeatInfoList?.some(
        (segment) =>
          segment.passengerList.some((passenger) => passenger.specifiedAmount > 0) &&
          Object.keys(
            this._getOrderStoreService.getOrderData.data?.seats?.[segment.segmentId]?.[segment.passengerList[0].id]
              ?.couchCatalogue
          ).length === 0 &&
          (this._getOrderStoreService.getOrderData.data?.seats?.[segment.segmentId]?.[segment.passengerList[0].id]
            ?.couchCatalogue).constructor === Object
      )
    ) {
      return { errorMsgId: 'E0446' };
    }
    // 該当しない場合
    return null;
  }

  /**
   * 内容確定・購入確認文言ラベルで使う静的文言keyを取得する
   */
  getConfirmLabelStaticMsgKey(): string {
    // keyの初期値は「座席を確定する旨」とする
    let msgKey: string = 'm_static_message-label.confirmToApplySeats';
    // 有料ASR席、またはカウチ席のいずれかを指定している場合、座席の購入手続きへ進む旨
    let segments = this._seatmapService.getSegmentChangeList(
      this._currentSeatmapService.CurrentSeatmapData,
      this.allSegmentInfo,
      this.selectedSeatInfoList,
      this._getOrderStoreService.getOrderData.data
    );

    for (let segment of segments) {
      // 変更されているセグメントをループ処理
      let existsChargeableAsrSeatOrCouchSeat = this.passengerIdList.some((passengerId) => {
        // 対象セグ・搭乗者の座席が「有料ASR席 or カウチ席」であれば、trueが返却される。
        return this.isChargeableAsrSeat(passengerId, segment.id) || this.isCouchSeat(passengerId, segment.id);
      });

      if (existsChargeableAsrSeatOrCouchSeat) {
        // 「有料ASR席 or カウチ席」が1つでも含まれる場合
        msgKey = 'm_static_message-label.ConfirmToPurchaseSeats';
        break;
      }
    }

    // 上記以外の場合、座席を確定する旨
    return msgKey;
  }

  /**
   * 指定したセグメントID・搭乗者IDに対応する、選択中の座席が有料ASRかどうか
   * @param passengerId 対象搭乗者
   * @param segmentId 対象セグメント
   * @returns true：カウチ座席、false：カウチ座席以外（判定不可の場合も含む）
   */
  isChargeableAsrSeat(passengerId: string, segmentId: string | undefined): boolean {
    // 有料ASRかどうか判定フラグを返却する（判定できない場合はfalse）
    return this._getSeatInformationByPassengerId(passengerId, segmentId)?.isChargeableAsrSeat || false;
  }

  /**
   * 指定したセグメントID・搭乗者IDに対応する、選択中の座席情報を取得
   * @param passengerId 対象搭乗者
   * @param segmentId 対象セグメント
   * @returns 取得できた場合：座席情報、取得できなかった場合：undefined
   */
  private _getSeatInformationByPassengerId(
    passengerId: string,
    segmentId: string | undefined
  ): SeatForServicingSeatmapScreen | undefined {
    // 画面選択時の座席番号に一致する、APIで取得した座席情報を取得します
    // カウチ座席の場合、参照したい情報の特性に応じて呼び出し側で考慮が必要です
    if (!!segmentId) {
      let targetSegment = this.selectedSeatInfoList?.find((s) => s.segmentId === segmentId);
      let targetPassenger = targetSegment?.passengerList.find((p) => p.id === passengerId);
      if (!!targetPassenger && !!targetPassenger.seatNumber) {
        return this._seatmapService.getSeatInformation(
          segmentId,
          targetPassenger.seatNumber,
          this._currentSeatmapService.CurrentSeatmapData
        );
      }
    }
    return undefined;
  }

  /**
   * 指定したセグメントID・搭乗者IDに対応する、選択中の座席がカウチ座席かどうか
   * @param passengerId 対象搭乗者
   * @param segmentId 対象セグメント
   * @returns true：カウチ座席、false：カウチ座席以外（判定不可の場合も含む）
   */
  isCouchSeat(passengerId: string, segmentId: string | undefined): boolean {
    // 座席情報のカウチ判定フラグを返却する（判定できない場合はfalse）
    return this._getSeatInformationByPassengerId(passengerId, segmentId)?.isCouchSeat || false;
  }

  /**
   * 他の有料サービスを選択しているか判定
   * @return true: 申込有 / false:申込無
   */
  isOtherPaidServices(): boolean {
    const requestInfo = this._getOrderStoreService.getOrderData.data?.serviceSummary?.hasRequested;
    if (
      requestInfo?.firstBaggage || // 事前追加手荷物
      requestInfo?.chargeableLounge || // 国際線有料ラウンジ
      requestInfo?.chargeableMeal // 有料機内食
    ) {
      return true;
    }
    return false;
  }

  destroy(): void {}

  reload(): void {}

  /**
   * 指定状況詳細(PNR)モーダルを閉じる
   */
  closeEvent() {
    this._currentSeatmapService.updateCurrentSeatmap({ isConfirmClick: false });
    this.close();
  }
}
