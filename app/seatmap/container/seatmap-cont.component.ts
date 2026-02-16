import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DesignatedSituationDetailsPnrModalComponent } from '@common/components';
import { apiEventAll } from '@common/helper';
import { ReservationFunctionIdType } from '@common/interfaces/common/reservation-function-id';
import { ReservationPageIdType } from '@common/interfaces/common/reservation-page-id';
import { CurrentCartStoreService, DeliveryInformationStoreService, GetOrderStoreService } from '@common/services';
import { GetSeatmapsStoreService } from '@common/services/api-store/sdk-servicing/get-seatmaps-store/get-seatmaps-store.service';
import { CurrentSeatmapService } from '@common/services/store/current-seatmap/current-seatmap-store.service';
import { RoutesResRoutes } from '@conf/routes.config';
import { SupportPageComponent } from '@lib/components/support-class';
import { AnaBizLoginStatusType, ErrorType, PageType } from '@lib/interfaces';
import { StaticMsgPipe } from '@lib/pipes';
import { AswMasterService, CommonLibService, ErrorsHandlerService, ModalService, PageInitService } from '@lib/services';
import { BehaviorSubject, take, delay } from 'rxjs';
import { GetSeatmapsRequest, OrderSeatItem } from 'src/sdk-servicing';
import { SeatInfo, SeatInfoPassengers } from '@common/interfaces/reservation/current-seatmap/seat-info';
import {
  AccompanyingInfant,
  PassengerForServicingSeatmapScreen,
} from '@common/interfaces/reservation/current-seatmap/passenger-for-seatmap-screen';
import { LModalContentsWidthType, ModalType } from '@lib/components/shared-ui-components/modal/modal.state';
import { SeatForServicingSeatmapScreen, SeatForServicingSeatmapScreenBySegment } from '@common/interfaces';
import { SeatmapTraveler } from '@common/interfaces/reservation/current-seatmap/seatmap-traveler';
import { SeatmapHelperService } from '@common/services/seatmap/seatmap-helper.service';
import { defaultSeatmapDynamicParams, SeatmapDynamicParams, SegmentPosInfo } from './seatmap-cont.state';
import { GetSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInnerColumnsInner } from '../../../sdk-servicing/model/getSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInnerColumnsInner';
import { GetSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInner } from '../../../sdk-servicing/model/getSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInner';
import { GetSeatmapsResponseDataSeatmapsDecksInner } from '../../../sdk-servicing/model/getSeatmapsResponseDataSeatmapsDecksInner';
import { DisplayInfoJSON } from './seatmap-cont.state';
import { ServicingSeatmapCommonErrorService } from '@common/services/seatmap/servicing-seatmap-common-error.service';
import { filter } from 'rxjs/operators';
import { Type1FareInfosServicesSeat } from '../../../sdk-servicing/model/type1FareInfosServicesSeat';
import {
  convertCouchSeatNumberToSeatNumberList,
  convertSeatNumberListToCouchSeatNumber,
  splitCouchSeatNumber,
} from '@common/helper/common/seatmap.helper';
import { MasterStoreKey } from '@conf/asw-master.config';
import { ErrorCodeConstants } from '@conf/app.constants';

@Component({
  selector: 'asw-seatmap',
  templateUrl: './seatmap-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeatmapContComponent extends SupportPageComponent {
  readonly pageId = ReservationPageIdType.SEATMAP;
  readonly functionId = ReservationFunctionIdType.PRIME_BOOKING;

  /** 搭乗者IDリスト */
  passengerIdList: string[] = [];

  /** 座席情報マップ */
  seatInformationMap = new Map<string, SeatForServicingSeatmapScreen>();

  /** 選択中座席情報リスト */
  selectedSeatInfoList: SeatInfo[] = [];

  /** 選択中の搭乗者Id */
  travelersMap = new Map<string, PassengerForServicingSeatmapScreen>();

  /** 選択中の搭乗者Id */
  selectingPassengerId?: string = '';

  /** branded fare全席指定不可フラグ */
  isAllSeatNotAppliable = false;

  /** 表示対象デッキ配列ID */
  displayTargetDeckArrayId = 0;

  /** スキップセグメントIDリスト */
  skipSegmentIdList: string[] = [];

  /** メインコンテンツが表示されるかどうか（ローディング中表示制御） */
  isdisplayContent: boolean = false;

  private _dynamicSubject = new BehaviorSubject<SeatmapDynamicParams>(defaultSeatmapDynamicParams());
  private isPaypalAvailable = false;

  constructor(
    private _common: CommonLibService,
    private _pageInitService: PageInitService,
    public changeDetector: ChangeDetectorRef,
    private _staticMsg: StaticMsgPipe,
    private _masterService: AswMasterService,
    private _title: Title,
    private _getOrderStoreService: GetOrderStoreService,
    private _deliveryInformationStoreService: DeliveryInformationStoreService,
    private _servicingCommonErrorService: ServicingSeatmapCommonErrorService,
    private _getSeatmapsStoreService: GetSeatmapsStoreService,
    private _currentSeatmapService: CurrentSeatmapService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _currentCartService: CurrentCartStoreService,
    private _seatmapHelperService: SeatmapHelperService,
    private _router: Router,
    private _modalService: ModalService
  ) {
    super(_common, _pageInitService);
    this.autoInitEnd = false;
  }

  init(): void {
    this._pageInitService.startInit();
    // シートマップの初期化
    this._currentSeatmapService.resetCurrentSeatmap();
    this.params = this._dynamicSubject.asObservable();
    this._common.aswCommonStoreService.updateAswCommon({
      functionId: this.functionId,
      pageId: this.pageId,
      isEnabledLogin: false,
      subPageId: '',
      subFunctionId: '',
    });
    // タブバーに画面タイトルを設定するjs-menu-contents
    this.forkJoinService(
      'SeatmapGetTitle',
      [this._staticMsg.get('label.seatMap'), this._staticMsg.get('label.aswPageTitle')],
      ([str1, str2]) => {
        this.deleteSubscription('SeatmapGetTitle');
        this._title.setTitle(str1 + str2);
      }
    );

    // AIRCRAFT_CABIN_I18N_JOIN_ACV_AND_CABINキャッシュロード
    this.subscribeService(
      'ServicingSeatmapProductsModalComponent_zipped',
      this._masterService.load(
        [
          {
            key: MasterStoreKey.AIRCRAFT_CABIN_I18N_JOIN_ACV_AND_CABIN,
            fileName: MasterStoreKey.AIRCRAFT_CABIN_I18N_JOIN_ACV_AND_CABIN,
            isCurrentLang: true,
          },
        ],
        true
      ),
      () => {}
    );

    // 画面保持情報の初期化
    // 1 PNR情報.data.bounds.flights[表示対象セグメント配列ID].idを表示対象セグメントIdとして保持する。[以降、表示対象セグメントId]
    this.setdisplayTargetSegmentId();

    // 申込操作中判定フラグう初期化
    this._currentSeatmapService.updateCurrentSeatmap({ isOperationOnProgress: undefined });

    // 他画面から設定したエラーがある場合、画面上に表示する
    this.previousScreenError();

    // PNR情報取得APIレスポンス受け取り
    this.subscribeService(
      'seatmapContGetOrder',
      this._getOrderStoreService.getGetOrderObservable(),
      (response) => {
        // ストアの表示対象セグメントリストIDもしくはバウンドリストIDに変更があればリロード
        this.subscribeService(
          'seatmapScreenStoreService',
          this._currentSeatmapService.getSegmentDistinctCurrentSeatmap$(),
          (value) => {
            this.isdisplayContent = false;
            this._pageInitService.startInit();
            this._common.alertMessageStoreService.resetAlertMessage();
            const segmentPosInfo: SegmentPosInfo = {
              segmentId: this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? '',
              flightListId: value.displayTargetSegmentArrayId ?? 0,
              boundListId: value.displayTargetBoundArrayId ?? 0,
            };
            const isEligible = response.data?.orderEligibilities?.seatmap?.[segmentPosInfo.segmentId]?.isEligible;
            // PNR情報.data.orderEligibilities.seatmap.[表示対象セグメントId].isEligible=false(シートマップが利用不可)の場合、以下のスキップ処理を行い、【シートマップ表示処理】を終了する。
            if (isEligible != undefined && !isEligible) {
              this.processSkipedSegment(segmentPosInfo);
            } else {
              this.callGetSeatmapsApi(segmentPosInfo);
            }
          }
        );
      },
      (error) => {
        this._errorsHandlerSvc.setNotRetryableError({
          errorType: ErrorType.BUSINESS_LOGIC,
          apiErrorCode: this._common.apiError?.errors?.[0].code,
          errorMsgId: 'E0441',
        });
      }
    );
  }

  /**
   * シートマップ取得APIコール
   * @param segmentPosInfo セグメントアクセス情報
   */
  private callGetSeatmapsApi(segmentPosInfo: SegmentPosInfo): void {
    apiEventAll(
      () => {
        this._getSeatmapsStoreService.setGetSeatmapsFromApi(this.createGetSeatmapsRequest(segmentPosInfo.segmentId));
      },
      this._getSeatmapsStoreService.getGetSeatmapsObservable(),
      () => {
        this.isdisplayContent = true;
        // 前のセグメントがスキップされた場合のワーニング表示
        const prevBoundSegmentListId = this._seatmapHelperService.getPrevBoundFlightListId(
          segmentPosInfo.boundListId,
          segmentPosInfo.flightListId
        );
        const prevSegmentId =
          this._getOrderStoreService.getOrderData.data?.air?.bounds?.[prevBoundSegmentListId.boundListId].flights?.[
            prevBoundSegmentListId.flightListId
          ].id;
        if (this.skipSegmentIdList?.find((skipSegmentId) => skipSegmentId === prevSegmentId)) {
          if (this.isAllSeatNotAppliable) {
            this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'W1047' });
            this.isAllSeatNotAppliable = false;
          } else {
            this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'E0439' });
          }
        }

        // 動的文言設定
        this._dynamicSubject.next({
          getOrderReply: this._getOrderStoreService.getOrderData,
          getSeatmapsReply: this._getSeatmapsStoreService.getSeatmapsData,
          pageContext: this.createDisplayInfoJSON(),
        });

        // 最終表示セグメントID情報保存
        this._currentSeatmapService.updateCurrentSeatmap({
          lastDisplayTargetBoundArrayId: this._currentSeatmapService.CurrentSeatmapData.displayTargetBoundArrayId,
          lastDisplayTargetSegmentArrayId: this._currentSeatmapService.CurrentSeatmapData.displayTargetSegmentArrayId,
        });

        // 表示データ初期化処理
        this.initData();

        this._pageInitService.endInit(this.params);

        // 初期ワーニング表示処理
        const warningDisplayResult = this._servicingCommonErrorService.InitialWarningDisplay(
          this.seatInformationMap,
          this._getOrderStoreService.getOrderData.data,
          this._currentSeatmapService.CurrentSeatmapData.displayTargetBoundArrayId ?? 0,
          this._currentSeatmapService.CurrentSeatmapData.displayTargetSegmentArrayId ?? 0,
          { ...this._getSeatmapsStoreService.getSeatmapsData, model: this._getSeatmapsStoreService.getSeatmapsData },
          undefined,
          undefined,
          this._seatmapHelperService.getCurrentSelectedSegment()?.id,
          this.selectedSeatInfoList,
          this.displayTargetDeckArrayId,
          undefined,
          this.getNhGroupOperatingList()
        );

        // 初期化処理反映次第更新処理実行
        this.subscribeService(
          'seatmapContCurrentSeatmap',
          this._currentSeatmapService.getCurrentSeatmap$().pipe(
            filter((value) => !!value.seatmap && !!value.selectedSeatInfoList),
            take(1)
          ),
          () => {
            warningDisplayResult.messages.forEach((alertMessageItem) =>
              this._common.alertMessageStoreService.setAlertWarningMessage(alertMessageItem)
            );

            const allSelectingPaxIds = new Set<string>();
            const seatNumberToPaxIdsMap = new Map<string, string[]>();

            warningDisplayResult.canceledSeatNumberList?.forEach((seatNumber) => {
              // 座席情報マップ更新
              convertCouchSeatNumberToSeatNumberList(seatNumber)?.forEach((seatBlockNumber) => {
                this._currentSeatmapService.updateSeatMap(seatBlockNumber, {
                  selectingPassengerID: '',
                });
              });

              // 選択中座席情報更新
              const selectingPaxIdList =
                this._currentSeatmapService
                  .findSegmentPassengerSeatInfoFromSeatNumber(
                    this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? '',
                    seatNumber
                  )
                  ?.flatMap((selectedSeatInfoPassenger) => selectedSeatInfoPassenger.id) ?? [];
              selectingPaxIdList.forEach((id) => allSelectingPaxIds.add(id));
              seatNumberToPaxIdsMap.set(seatNumber, selectingPaxIdList);
            });

            if (allSelectingPaxIds.size > 0) {
              this._currentSeatmapService.updateSelectedSeatInfo(
                this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? '',
                Array.from(allSelectingPaxIds),
                { seatNumber: undefined, specifiedAmount: 0 }
              );
            }
          }
        );
      },
      // シートマップ取得APIよりエラーが返却された場合、以下の処理にてエラー情報を設定し、後続の処理は行わない。
      // ※当処理はstoreを介して行う。エラーが発生したAPIエラーレスポンス情報が通知されたことを契機に処理を行うようにする。
      () => {
        this._getSeatmapsStoreService.resetGetSeatmaps();
        this._pageInitService.endInit();
        const errorCode = this._common.apiError?.errors?.[0].code;
        // APIエラーレスポンス情報.エラーコード=”EBAZ000315”(シートマップが無効または、PSS側でロックがかかっている)の場合、属性指定画面(R01-P071)へ遷移する。[1] [2]
        if (errorCode === ErrorCodeConstants.ERROR_CODES.EBAZ000315) {
          // 座席属性指定画面に遷移
          this._router.navigate([RoutesResRoutes.SEAT_ATTRIBUTE_REQUEST]);
        } else if (errorCode === ErrorCodeConstants.ERROR_CODES.EBAZ000674) {
          // APIエラーレスポンス情報.エラーコード=”EBAZ000674”(事前座席指定サービス利用不可の運賃のためシートマップ表示できない)の場合、
          // [スキップ処理]を行う
          this.processSkipedSegment(segmentPosInfo);
        } else if (errorCode === ErrorCodeConstants.ERROR_CODES.EBAZ000675) {
          // 座席属性指定画面に遷移
          this._router.navigate([RoutesResRoutes.SEAT_ATTRIBUTE_REQUEST]);
        } else if (errorCode === ErrorCodeConstants.ERROR_CODES.EBAZ000314) {
          // APIエラーレスポンス情報.エラーコード=”EBAZ000314”(設備情報が取得できない)の場合、
          // [スキップ処理]を行う。
          this.processSkipedSegment(segmentPosInfo);
        } else if (errorCode === ErrorCodeConstants.ERROR_CODES.EBAZ000676) {
          // APIエラーレスポンス情報.エラーコード=”EBAZ000676”(設備情報が取得できない)の場合、
          // [スキップ処理]を行う。
          this.processSkipedSegment(segmentPosInfo);
        } else {
          this._errorsHandlerSvc.setNotRetryableError({
            errorType: ErrorType.BUSINESS_LOGIC,
            apiErrorCode: errorCode,
            errorMsgId: 'E0441',
          });
        }
        this.changeDetector.markForCheck();
      }
    );
  }

  /**
   * 画面保持情報の初期化
   */
  initData() {
    // 選択中座席情報リスト初期化
    this.initSelectedSeatInfoList();

    // 座席情報初期化
    this.initSeatInformationMap();

    // 対象セグメント存在なしキャンセル済有料ASR席EMD有無初期化
    this.initIsTargetSegmentASREMDAvailable();

    // 対象セグメント存在なしキャンセル済カウチ席EMD有無初期化
    this.initIsTargetSegmentCouchEMDAvailable();

    // 表示対象デッキ配列ID初期化
    this.initDisplayTargetDeckArrayId(
      this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? '',
      this.selectedSeatInfoList ?? []
    );

    // 選択搭乗者ID初期化
    this.initSelectingPassengerId(
      this._currentSeatmapService.CurrentSeatmapData.displayTargetSegmentArrayId ?? 0,
      this.selectedSeatInfoList ?? []
    );

    // 搭乗者情報マップ/搭乗者IDリスト初期化
    this.initPassengerMap(this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? '');

    // セグメント別座席情報を設定
    this._currentSeatmapService.updateCurrentSeatmap({
      defaultSeatmapInfoBySegmentList: this._getDefaultSeatmapInfoBySegment(),
    });

    this._currentSeatmapService.preserveCurrentSeatmap();
  }

  /**
   * 選択中座席情報リスト初期化
   */
  initSelectedSeatInfoList() {
    const prevSeatInfo = this._currentSeatmapService.CurrentSeatmapData.selectedSeatInfoList;
    let characteristicRequestSsrCode: string;
    this._getOrderStoreService.getOrderData.data?.air?.bounds?.forEach((bound) => {
      bound.flights?.forEach((flight) => {
        let passengerList: SeatInfoPassengers[] = [];

        this._getOrderStoreService.getOrderData.data?.travelers?.forEach((traveler) => {
          if (!!flight.id && !!traveler.id && traveler.passengerTypeCode !== 'INF') {
            let tempPassengerSeat: OrderSeatItem | undefined = !!this._getOrderStoreService.getOrderData.data?.seats?.[
              flight.id
            ]
              ? this._getOrderStoreService.getOrderData.data?.seats?.[flight.id][traveler.id]
              : undefined;
            let tempSeatNo =
              prevSeatInfo
                ?.find((seatInfo) => seatInfo?.segmentId === flight.id)
                ?.passengerList.find((v) => v.id === traveler.id)?.seatNumber ?? '';
            let seatNumber = tempPassengerSeat?.seatSelection?.seatNumbers ?? [];
            let specifiedAmount = 0;
            if (tempPassengerSeat?.seatSelection?.isCouchRepresentative) {
              seatNumber = [];
              let couchSeatSplit = splitCouchSeatNumber(tempSeatNo);
              let couchSeatNo =
                couchSeatSplit && couchSeatSplit.columnNumbers && couchSeatSplit.columnNumbers?.length > 0
                  ? couchSeatSplit.rowNumber + couchSeatSplit.columnNumbers[0]
                  : '';
              seatNumber.push(couchSeatNo);
              let count = 0;
              prevSeatInfo
                ?.find((seatInfo) => seatInfo?.segmentId === flight.id)
                ?.passengerList.forEach((p) => {
                  if (tempSeatNo === p.seatNumber) count++;
                });
              if (couchSeatSplit.columnNumbers?.length === 3) {
                const threeSeats = tempPassengerSeat?.couchCatalogue?.threeSeats;
                switch (count) {
                  case 1:
                    specifiedAmount = threeSeats?.oneTraveler?.catalogue?.prices?.total ?? 0;
                    break;
                  case 2:
                    specifiedAmount = threeSeats?.twoTraveles?.catalogue?.prices?.total ?? 0;
                    break;
                  case 3:
                    specifiedAmount = threeSeats?.threeTravelers?.catalogue?.prices?.total ?? 0;
                    break;
                }
                specifiedAmount =
                  tempPassengerSeat?.couchCatalogue?.threeSeats?.oneTraveler?.catalogue?.prices?.total ?? 0;
              } else if (couchSeatSplit.columnNumbers?.length === 4) {
                const fourSeats = tempPassengerSeat?.couchCatalogue?.fourSeats;
                switch (count) {
                  case 1:
                    specifiedAmount = fourSeats?.oneTraveler?.catalogue?.prices?.total ?? 0;
                    break;
                  case 2:
                    specifiedAmount = fourSeats?.twoTraveles?.catalogue?.prices?.total ?? 0;
                    break;
                  case 3:
                    specifiedAmount = fourSeats?.threeTravelers?.catalogue?.prices?.total ?? 0;
                    break;
                  case 4:
                    specifiedAmount = fourSeats?.fourTravelers?.catalogue?.prices?.total ?? 0;
                    break;
                }
              }
            }
            passengerList.push({
              id: traveler.id || '',
              seatAttribute: {
                ssrCode:
                  this._currentSeatmapService.findSegmentPassengerSeatInfo(flight.id, traveler.id)?.seatAttribute
                    ?.ssrCode ?? undefined,
              },
              seatNumber:
                this._currentSeatmapService.findSegmentPassengerSeatInfo(flight.id, traveler.id)?.seatNumber ??
                (tempPassengerSeat?.seatSelection?.couchSeatNumber !== ''
                  ? tempPassengerSeat?.seatSelection?.couchSeatNumber
                  : tempPassengerSeat?.seatSelection?.seatNumbers?.[0] ?? ''),
              specifiedAmount:
                this._currentSeatmapService.findSegmentPassengerSeatInfo(flight.id, traveler.id)?.specifiedAmount ?? 0,
              seatNumberList: seatNumber.length > 0 ? [{ seatNumber: seatNumber[0] }] : [],
              couchSeatNumberList: [{ seatNumber: tempSeatNo }],
              ssrInformation: {
                ssrSeatNumber:
                  tempPassengerSeat?.seatSelection?.couchSeatNumber !== ''
                    ? tempPassengerSeat?.seatSelection?.couchSeatNumber
                    : tempPassengerSeat?.seatSelection?.seatNumbers?.[0] ?? '',
              },
            });
            // PNRに登録されている座席属性指定SSRコードの値を取得
            characteristicRequestSsrCode = tempPassengerSeat?.seatSelection?.characteristicRequestSsrCode ?? '';
          }
        });

        const index = this.selectedSeatInfoList.findIndex((seatInfo) => seatInfo.segmentId === flight.id);
        if (index !== -1) {
          let newList = [...this.selectedSeatInfoList];
          newList[index] = {
            ...newList[index],
            passengerList: passengerList,
            characteristicRequestSsrCode: characteristicRequestSsrCode,
          };
          this.selectedSeatInfoList = newList;
        } else {
          this.selectedSeatInfoList = [
            ...this.selectedSeatInfoList,
            {
              passengerList: passengerList,
              segmentId: flight.id || '',
              characteristicRequestSsrCode: characteristicRequestSsrCode,
            },
          ];
        }
      });
    });
    this._currentSeatmapService.updateCurrentSeatmap({ selectedSeatInfoList: this.selectedSeatInfoList });
  }

  /**
   * 座席情報初期化
   */
  initSeatInformationMap() {
    const couchSeatNumberListInitiator = this.initCouchSeatNumberList();
    //  ＜以下、シートマップ情報.data.seatmaps.decks[表示対象デッキ配列ID].seats.rows(以下、行情報とする)の要素数分、繰り返し＞
    this._getSeatmapsStoreService.getSeatmapsData?.data?.seatmaps.decks.forEach(
      (deck) =>
        deck.seats.rows?.forEach((row) => {
          let aisleIndex: number = 0;

          //    ＜以下、行情報.columns(以下、列情報とする)の要素数分、繰り返し＞
          //for (const column of row.columns) {
          if (row.rowType === 'seat') {
            row.columns.forEach((column, columnIndex) => {
              if (!!column) {
                if (column.columnType === 'aisle') {
                  aisleIndex += 1;
                }

                // 座席情報マップ作成処理として、以下の処理を行う。
                // 以下の内容で座席情報を作成し、列情報.当該seatNumberをキーとして座席情報マップに追加する。
                this.seatInformationMap.set(column.seatNumber, {
                  coutNumber: '',
                  seatCharacteristicsCodes: column.seatCharacteristicsCodes,
                  facilityCode: column.facilityCode,
                  blockInformation: this.getBlockInfo(aisleIndex),
                  isChargeableAsrSeat: column.isChargeableAsrSeat,
                  isCouchSeat: column.isCouchSeat,
                  isRearDirectionSeat: !!column.seatCharacteristicsCodes
                    ? column.seatCharacteristicsCodes.includes('J')
                    : undefined,
                  isChildSeatAttachable: column.isChildSeatAttachable,
                  registedPassengerID: '',
                  selectingPassengerID: '',
                  deckType: deck.deckType,
                  seatAvailabilityStatus: column.seatAvailabilityStatus,
                  isInfantSeated: column.isInfantSeated,
                  travelers: column.travelers?.map((traveler) => {
                    return <SeatmapTraveler>{
                      id: traveler.id,
                      seatAvailabilityStatus: traveler.seatAvailabilityStatus,
                      isExempted: traveler.isExempted,
                      price: traveler?.prices?.total,
                    };
                  }),
                });

                couchSeatNumberListInitiator.processCouchList(row, column, columnIndex);
              }
            }); // ＜ここまで、列情報の要素数分、繰り返し＞
          }
        }) // ＜ここまで、行情報の要素数分、繰り返し＞
    );

    // 登録済搭乗者ID 選択中搭乗者ID
    this.selectedSeatInfoList
      .find((segment) => segment.segmentId === this._seatmapHelperService.getCurrentSelectedSegment()?.id)
      ?.passengerList.forEach((passenger) => {
        const ssrSeatNumber =
          this._getOrderStoreService.getOrderData.data?.seats?.[
            this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? ''
          ]?.[passenger.id]?.seatSelection?.seatNumbers?.[0];

        // 登録済み座席情報がある場合、座席情報マップをアップデート
        if (ssrSeatNumber) {
          const seatInfo = this.seatInformationMap.get(ssrSeatNumber);
          this.seatInformationMap.set(ssrSeatNumber, {
            ...seatInfo,
            registedPassengerID: passenger.id,
          });
        }

        // 選択済み座席情報がある場合、座席情報マップをアップデート
        if (passenger.seatNumber) {
          const seatNumberList = convertCouchSeatNumberToSeatNumberList(passenger.seatNumber);
          const selectingSeatInfo = this.seatInformationMap.get(seatNumberList?.[0] ?? '');
          if (selectingSeatInfo?.isCouchSeat) {
            // カウチ席場合の処理
            // 最初の選択情報がない座席インデックスを探索
            const seatIndex =
              seatNumberList?.findIndex(
                (seatNumber) => !this.seatInformationMap.get(seatNumber)?.selectingPassengerID
              ) ?? -1;
            if (seatIndex !== -1 && seatNumberList) {
              const seatInfo = this.seatInformationMap.get(seatNumberList[seatIndex]);
              this.seatInformationMap.set(seatNumberList[seatIndex], {
                ...seatInfo,
                selectingPassengerID: passenger.id,
              });
            }
          } else {
            // カウチ席ではない場合の処理
            const seatInfo = this.seatInformationMap.get(passenger.seatNumber);
            this.seatInformationMap.set(passenger.seatNumber, {
              ...seatInfo,
              selectingPassengerID: passenger.id,
            });
          }
        }
      });

    // カウチシート番号フィールドアップデート
    couchSeatNumberListInitiator.getCouchList().forEach((couchSeatBlockNumberList) => {
      const couchSeatNumber = convertSeatNumberListToCouchSeatNumber(couchSeatBlockNumberList);
      couchSeatBlockNumberList?.forEach((seatBlockNumber) => {
        const seatInfo = this.seatInformationMap.get(seatBlockNumber);
        if (!seatInfo?.coutNumber) {
          this.seatInformationMap.set(seatBlockNumber, {
            ...seatInfo,
            coutNumber: couchSeatNumber,
          });
        }
      });
    });

    this._currentSeatmapService.updateCurrentSeatmap({ seatmap: this.seatInformationMap });
  }

  /**
   * ブロック情報
     行情報.numberOfAisle=2の場合
     1	表示済み通路カウント=0の場合、”left”
     2	表示済み通路カウント=1の場合、”center”
     3	表示済み通路カウント=2の場合、”right”
     上記以外の場合
     1	表示済み通路カウント=0の場合、”left”
     2	表示済み通路カウント=1の場合、”right”
   * @param aisleIndex 通路インデックス
   * @returns ブロック情報
   */
  getBlockInfo(aisleIndex: number): string | undefined {
    let blockInformation;
    if (
      Number(
        this._getSeatmapsStoreService.getSeatmapsData?.data?.seatmaps.decks[this.displayTargetDeckArrayId].numberOfAisle
      ) === 2
    ) {
      switch (aisleIndex) {
        case 0:
          blockInformation = 'left';
          break;
        case 1:
          blockInformation = 'center';
          break;
        case 2:
          blockInformation = 'right';
          break;
        default:
          break;
      }
    } else {
      switch (aisleIndex) {
        case 0:
          blockInformation = 'left';
          break;
        case 1:
          blockInformation = 'right';
          break;
        default:
          break;
      }
    }
    return blockInformation;
  }

  /**
   * カウチシート座席番号リスト初期化
   */
  initCouchSeatNumberList() {
    let currentCouch: Array<string> = [];
    let couchList: Array<Array<string> | undefined> = [];

    return {
      getCouchList: function () {
        return couchList;
      },
      processCouchList: function (
        row: GetSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInner,
        column: GetSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInnerColumnsInner,
        columnIndex: number
      ) {
        // 列情報.isCouchSeatの場合、カウチ席番号を作成する。
        if (column.isCouchSeat) {
          // ブロック開始列フラグにfalseを設定する。
          // ブロック終了列フラグにfalseを設定する。
          let isBlockStartColumn: boolean = false;
          let isBlockEndColumn: boolean = false;

          // 以下の条件全てを満たす場合、ブロック開始列フラグにtrueを設定する。
          // 列情報.当該columnType="seat"
          // 列情報.当該要素番号=0、または列情報.前columnType="aisle"
          if (column.columnType === 'seat') {
            if (columnIndex === 0 || row.columns[columnIndex - 1].columnType === 'aisle') {
              isBlockStartColumn = true;
              currentCouch = [];
            } else {
              isBlockStartColumn = false;
            }
            // 以下の条件を全て満たす場合、ブロック終了列フラグにtrueを設定する。
            // 列情報.当該columnType="seat"
            // 列情報.当該要素番号=列情報の要素数-1、または列情報.次columnType="aisle"
            if (columnIndex === row.columns.length - 1 || row.columns[columnIndex + 1].columnType === 'aisle') {
              isBlockEndColumn = true;
            } else {
              isBlockEndColumn = false;
            }
          }

          // カウチ座席番号リストに列情報.当該seatNumberを追加する。
          currentCouch.push(column.seatNumber); //{5A, 5B}

          // ブロック終了列フラグ=trueの場合、以下の処理を行う。
          if (isBlockEndColumn) {
            couchList.push(currentCouch);
          }
        }
      },
    };
  }

  /**
   * 初期選択デッキインデックス
   * @param displayTargetSegmentId 表示中セグメントID
   * @param selectedSeatInfoList 選択中座席情報
   */
  initDisplayTargetDeckArrayId(displayTargetSegmentId: string, selectedSeatInfoList: SeatInfo[]) {
    // 搭乗者一人でも1階を選択している
    let isAllSelect2fSeat = false;
    if (
      selectedSeatInfoList
        .find((seatInfo) => seatInfo.segmentId === displayTargetSegmentId)
        ?.passengerList.find((passenger) => {
          this.seatInformationMap.get(convertCouchSeatNumberToSeatNumberList(passenger?.seatNumber ?? '')?.[0] ?? '')
            ?.deckType === GetSeatmapsResponseDataSeatmapsDecksInner.DeckTypeEnum.Main;
        })
    ) {
      isAllSelect2fSeat = true;
    }

    // 1階座席が存在するか
    let isExist1fSeatmap = true;
    const firstFloorDeckIndex = this._getSeatmapsStoreService.getSeatmapsData.data?.seatmaps.decks.findIndex(
      (deck) => deck.deckType === GetSeatmapsResponseDataSeatmapsDecksInner.DeckTypeEnum.Main
    );
    isExist1fSeatmap = firstFloorDeckIndex !== -1;

    const upperFloorDeckIndex = this._getSeatmapsStoreService.getSeatmapsData.data?.seatmaps.decks.findIndex(
      (deck) => deck.deckType === GetSeatmapsResponseDataSeatmapsDecksInner.DeckTypeEnum.Upper
    );
    if (isAllSelect2fSeat || !isExist1fSeatmap) {
      this.displayTargetDeckArrayId = Number(upperFloorDeckIndex);
    } else {
      this.displayTargetDeckArrayId = Number(firstFloorDeckIndex);
    }
  }

  /**
   * 対象セグメント存在なしキャンセル済カウチ席EMD有無初期化
   */
  initIsTargetSegmentCouchEMDAvailable() {
    // PNR情報.travelDocuments.documentType="service"、かつPNR情報.travelDocuments.reasonForIssuance.subCode=”COUC”(カウチ)であるPNR情報.data.travelDocumentsを抽出し、カウチドキュメント情報として保持する。
    let couchDocumentInfo = this._getOrderStoreService.getOrderData.data?.travelDocuments?.find(
      (docs) => docs.documentType === 'services' && docs.reasonForIssuance?.subCode === 'COUC'
    );
    // カウチドキュメント情報.flightsIds.flightIdのいずれかをキーとするPNR情報.data.air.bounds.flightsが存在しない場合、対象セグメント存在なしキャンセル済カウチ席EMD有無にtrue(該当するEMDあり)を設定する。
    let isTargetSegmentCouchEMDAvailable = true;
    this._getOrderStoreService.getOrderData.data?.air?.bounds?.filter((bound) => {
      bound.flights?.filter((flight) => {
        let flightId = !!flight.id ? flight.id : '';
        if (couchDocumentInfo?.flightIds?.includes(flightId)) {
          isTargetSegmentCouchEMDAvailable = false;
          return;
        }
      });
    });
    this._currentSeatmapService.updateCurrentSeatmap({
      isTargetSegmentCouchEMDAvailable: isTargetSegmentCouchEMDAvailable,
    });
  }

  /**
   * 対象セグメント存在なしキャンセル済有料ASR席EMD有無初期化
   */
  initIsTargetSegmentASREMDAvailable() {
    // 有料ASRドキュメント情報.flightsIds.flightIdのいずれかをキーとするPNR情報.data.air.bounds.flightsが存在しない場合、対象セグメント存在なしキャンセル済有料ASR席EMD有無にtrue(該当するEMDあり)を設定する。
    let paidASRDocumentInfo = this._getOrderStoreService.getOrderData.data?.travelDocuments?.find(
      (docs) => docs.documentType === 'services' && docs.reasonForIssuance?.subCode === 'SIT-'
    );
    let isTargetSegmentASREMDAvailable = true;
    this._getOrderStoreService.getOrderData.data?.air?.bounds?.filter((bound) => {
      bound.flights?.filter((flight) => {
        let flightId = !!flight.id ? flight.id : '';
        if (paidASRDocumentInfo?.flightIds?.includes(flightId)) {
          isTargetSegmentASREMDAvailable = false;
          return;
        }
      });
    });
    this._currentSeatmapService.updateCurrentSeatmap({
      isTargetSegmentASREMDAvailable: isTargetSegmentASREMDAvailable,
    });
  }

  /**
   * 選択搭乗者ID初期化
   * @param displayTargetSegmentArrayId 選択中セグメントリストID
   * @param selectedSeatInfoList 選択中座席情報リスト
   */
  initSelectingPassengerId(displayTargetSegmentArrayId: number, selectedSeatInfoList: SeatInfo[]) {
    if (this._getSeatmapsStoreService.getSeatmapsData.data?.travelersSummary.isChangeRestrictedAllSeat) return;
    // ＜以下、選択中座席情報リスト[表示対象セグメント配列ID]の要素数分、繰り返し＞
    if (!!selectedSeatInfoList?.[displayTargetSegmentArrayId]?.passengerList) {
      // 座席未指定最初の搭乗者を選択する
      for (const passenger of selectedSeatInfoList?.[displayTargetSegmentArrayId]?.passengerList) {
        this.selectingPassengerId = passenger.id;
        if (!passenger.seatNumber) {
          break;
        }
      } // ＜ここまで、選択中座席情報リスト[表示対象セグメント配列ID]の要素数分、繰り返し＞
    }
    this._currentSeatmapService.updateCurrentSeatmap({ selectingPassengerId: this.selectingPassengerId });
  }

  /**
   * 搭乗者情報マップ/搭乗者IDリスト初期化
   * @param displayTargetSegmentId 選択中セグメントID
   */
  initPassengerMap(displayTargetSegmentId: string) {
    if (!!this._getOrderStoreService.getOrderData.data?.travelers) {
      // ＜以下、PNR情報.data.travelers(以下、搭乗者情報リスト)の要素数分、繰り返し＞
      this._getOrderStoreService.getOrderData.data.travelers.forEach((traveler) => {
        if (!!traveler.id) {
          // 搭乗者情報リスト.当該passengerTypeCode≠"INF"の場合、以下の処理を行う。
          if ((traveler.passengerTypeCode as string) !== 'INF') {
            // 搭乗者IDリストに搭乗者情報リスト.当該idを追加する。
            if (!this.passengerIdList.find((passengerId) => passengerId === traveler.id)) {
              this.passengerIdList.push(traveler.id);
            }

            // 搭乗者情報として以下の項目を作成し、搭乗者情報リスト.当該idをキーに搭乗者情報マップを更新する。
            //          ※該当idをキーとした搭乗者マップの要素が存在しない場合、追加する。

            //座席番号：
            // 1  搭乗者id=当該搭乗者idとなるような選択中座席情報リスト.＜表示対象セグメントID＞.当該搭乗者リストの要素が存在する場合、
            //    搭乗者id=当該搭乗者idとなるような選択中座席情報リスト.＜表示対象セグメントID＞.当該搭乗者リストの要素.座席情報リスト[0].座席番号
            // 2	上記以外の場合、表示対象セグメントID、搭乗者情報リスト.当該idに紐づくPNR情報.data.seats.＜表示対象セグメントID＞.
            // ＜当該orderSeatItems＞.seatSelection.seatNumbers[0]

            this.travelersMap.set(traveler.id, {
              name:
                traveler.names?.[0].title + ' ' + traveler.names?.[0].firstName + ' ' + traveler.names?.[0].lastName,
              passengerTypeCode: traveler.passengerTypeCode,
              accompanyingInfant: undefined,
              isRequestChildSeat:
                !!this._getOrderStoreService.getOrderData.data?.seats?.[displayTargetSegmentId]?.[traveler.id]
                  ?.childSeat,
              isRequestBassinet:
                !!this._getOrderStoreService.getOrderData.data?.seats?.[displayTargetSegmentId]?.[traveler.id]
                  ?.bassinet,
              hasNamelessInfant: traveler.hasNamelessInfant,
            });

            // 上記以外の場合、同伴幼児情報設定処理として以下の処理を行う。
          } else {
            // 同伴幼児情報として以下の項目を作成する。
            let accompanyingInfant: AccompanyingInfant = {
              id: traveler.id,
              name:
                traveler.names?.[0].title + ' ' + traveler.names?.[0].firstName + ' ' + traveler.names?.[0].lastName,
            };

            // 搭乗者情報.accompanyingTravelerIdをキーに取得した搭乗者情報マップ.当該同伴幼児情報に、同伴幼児情報を設定する。
            let accompanyingTravelerId = traveler.accompanyingTravelerId;
            if (!!accompanyingTravelerId) {
              let tempPassenger = this.travelersMap.get(accompanyingTravelerId);
              if (tempPassenger) {
                this.travelersMap.set(accompanyingTravelerId, {
                  ...tempPassenger,
                  accompanyingInfant: accompanyingInfant,
                });
              }
            }
          }
        }
      });
    } // ＜ここまで、搭乗者情報リストの要素数分、繰り返し＞
    this._currentSeatmapService.updateCurrentSeatmap({
      passengers: this.travelersMap,
    });
  }

  /**
   * 選択中セグメントアクセス情報をStoreへ保存する
   */
  setdisplayTargetSegmentId() {
    if (this._currentSeatmapService.CurrentSeatmapData.displayTargetBoundArrayId === undefined) {
      this._currentSeatmapService.updateCurrentSeatmap({
        displayTargetSegmentArrayId: 0,
        displayTargetBoundArrayId: 0,
      });
    }
  }

  /**
   * セグメントスキップ処理
   * @param segmentPosInfo セグメントアクセス情報
   */
  processSkipedSegment(segmentPosInfo: SegmentPosInfo) {
    // スキップセグメントIdリストに[表示対象セグメントId]を追加する。
    // スキップセグメントリストに追加
    if (segmentPosInfo.segmentId) {
      this.skipSegmentIdList.push(segmentPosInfo.segmentId);
    }

    // 最後のセグメントじゃない場合、次のセグメントを選択する
    if (!this._seatmapHelperService.isSelectedLastSegment()) {
      this._currentSeatmapService.updateCurrentSeatmap({
        displayTargetBoundArrayId: this._seatmapHelperService.getNextBoundFlightListId(
          segmentPosInfo.boundListId,
          segmentPosInfo.flightListId
        ).boundListId,
        displayTargetSegmentArrayId: this._seatmapHelperService.getNextBoundFlightListId(
          segmentPosInfo.boundListId,
          segmentPosInfo.flightListId
        ).flightListId,
      });
    } else {
      // 選択中セグメントが最後のセグメントの場合
      // [スキップセグメントIdリスト]の件数=PNR情報.data.bounds.flightsの件数(全てのセグメントがスキップされた)の場合、エラータイプに”retryable”(継続可能)、ワーニングメッセージに”E0441”(すべてのセグメントのシートマップが利用不可である旨)をワーニング情報として指定する。支払情報入力画面(R01-P080)に遷移する。
      const count =
        this._getOrderStoreService.getOrderData.data?.air?.bounds?.flatMap((bound) => bound.flights).length ?? 0;
      if (this.skipSegmentIdList?.length === count) {
        if (this.isAllSeatNotAppliable) {
          this._deliveryInformationStoreService.updateDeliveryInformation({
            passToPayment: {
              ...this._deliveryInformationStoreService.deliveryInformationData.passToPayment,
              errInfo: [{ errorMsgId: 'W1046' }],
            },
          });
        } else {
          this._deliveryInformationStoreService.updateDeliveryInformation({
            passToPayment: {
              ...this._deliveryInformationStoreService.deliveryInformationData.passToPayment,
              errInfo: [{ errorMsgId: 'E0440' }],
            },
          });
        }

        // その際、エラーメッセージIDに”W0919”(事前座席指定利用不可の運賃のためセグメントをスキップした旨) のワーニングメッセージを設定し表示する。
        if (this._common.apiError?.errors?.[0].code === ErrorCodeConstants.ERROR_CODES.EBAZ000674) {
          this._deliveryInformationStoreService.updateDeliveryInformation({
            passToPayment: {
              ...this._deliveryInformationStoreService.deliveryInformationData.passToPayment,
              errInfo: [{ errorMsgId: 'W0919' }],
            },
          });
        }

        const routerUrl =
          this._common.aswContextStoreService.aswContextData.anaBizLoginStatus === AnaBizLoginStatusType.LOGIN
            ? RoutesResRoutes.ANABIZ_PAYMENT_INPUT
            : RoutesResRoutes.PAYMENT_INPUT;
        // 支払情報入力画面に遷移する
        this._router.navigate([routerUrl]);
        return;
      }
      // 上記以外の場合、現在のセグメントのまま指定状況詳細(PNR)モーダルの表示状態をstoreで管理し、表示する旨を通知することによって指定状況詳細(PNR)モーダルを表示する。
      this.showPNRModal();
      this._common.errorsHandlerService.setRetryableError(PageType.PAGE, { errorMsgId: 'E0439' });
    }
    return;
  }

  /**
   * シートマップ取得API用パラメータ作成
   * @param displayTargetSegmentId 選択中のセグメントId（表示対象セグメントId）
   * @returns シートマップ取得API用パラメータ
   */
  private createGetSeatmapsRequest(displayTargetSegmentId: string): GetSeatmapsRequest {
    return {
      orderId: this._getOrderStoreService.getOrderData.data?.orderId,
      flightId: displayTargetSegmentId,
      credential: {
        firstName: this._getOrderStoreService.getOrderData.data?.travelers?.[0].names?.[0].firstName,
        lastName: this._getOrderStoreService.getOrderData.data?.travelers?.[0].names?.[0].lastName,
      },
      cartId: this._currentCartService.CurrentCartData.data?.cartId || undefined,
    };
  }

  /**
   * 指定状況詳細(PNR)モーダル表示
   */
  showPNRModal() {
    const modalPart = this._modalService.defaultBlockPart(DesignatedSituationDetailsPnrModalComponent);
    modalPart.type = ModalType.TYPE4;
    modalPart.modalWidth = LModalContentsWidthType.MODAL_PC_W1000;
    modalPart.closeBackEnable = false;
    modalPart.payload = this._seatmapHelperService.getCurrentSelectedSegment()?.id;
    modalPart.closeEvent = () => {
      // 最後に正常に表示されたセグメントを表示する
      this._currentSeatmapService.updateCurrentSeatmap({
        displayTargetBoundArrayId: this._currentSeatmapService.CurrentSeatmapData.lastDisplayTargetBoundArrayId,
        displayTargetSegmentArrayId: this._currentSeatmapService.CurrentSeatmapData.lastDisplayTargetSegmentArrayId,
      });
    };
    this._modalService.showSubModal(modalPart);
  }

  /**
   * 画面情報JSONの作成
   * @returns
   */
  private createDisplayInfoJSON(): DisplayInfoJSON {
    return {
      /** PayPal使用可否 */
      isPaypalAvailable: this.isPaypalAvailable,
    };
  }

  /**
   * NHグループ運航キャリアリスト取得
   * @returns NHグループ運航キャリアリスト
   */
  private getNhGroupOperatingList() {
    let propVal = this._common.aswMasterService.getMPropertyByKey('application', 'airlines.nhGroupOperating');

    return !!propVal ? propVal.split('|') : new Array<string>();
  }

  /**
   * リロード処理
   */
  reload(): void {}

  /**
   * クリーンアップ処理
   */
  destroy(): void {
    this.deleteSubscription('seatmapScreenStoreService');
  }

  /**
   * セグメント別座席情報を設定
   */
  protected _getDefaultSeatmapInfoBySegment() {
    if (!this.seatInformationMap) {
      return {};
    }

    let newDefaultSeatmapInfoBySegmentList = new Map<string, SeatForServicingSeatmapScreenBySegment>();
    const displayTargetSegmentId = this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? '';
    newDefaultSeatmapInfoBySegmentList.set(displayTargetSegmentId, {
      segmentId: displayTargetSegmentId,
      seatInformations: Object.fromEntries(this.seatInformationMap),
    });

    let defaultSeatmapInfoBySegmentList =
      this._currentSeatmapService.CurrentSeatmapData.defaultSeatmapInfoBySegmentList || undefined;
    if (!!defaultSeatmapInfoBySegmentList) {
      let seatmapInfoBySegmentList = new Map<string, SeatForServicingSeatmapScreenBySegment>(
        Object.entries(defaultSeatmapInfoBySegmentList)
      );

      seatmapInfoBySegmentList.forEach((seatInformations, segmentId) => {
        if (!!segmentId && segmentId !== displayTargetSegmentId) {
          newDefaultSeatmapInfoBySegmentList.set(segmentId, {
            segmentId: segmentId,
            seatInformations: seatInformations.seatInformations,
          });
        }
      });
    }

    return Object.fromEntries(newDefaultSeatmapInfoBySegmentList);
  }

  /**
   * 前画面引継ぎ情報エラーの処理
   */
  private previousScreenError() {
    // ワーニングの表示処理：「WBAZ000522: 空席待ち状態から全てのセグメントが残席ありになった」
    // 「事前座席指定に進む」ボタン押下後のcreate-order APIからのワーニング
    const warningInfo =
      this._deliveryInformationStoreService.deliveryInformationData.passengerInformationInput?.warningInfo;
    if (warningInfo && warningInfo?.length > 0) {
      const info = warningInfo.find((item) => item.apiErrorCode === ErrorCodeConstants.ERROR_CODES.WBAZ000522);
      if (info) {
        this._errorsHandlerSvc.setRetryableError(PageType.PAGE, {
          errorMsgId: info.errorMessageId,
          apiErrorCode: info.apiErrorCode,
        });

        // ワーニングセット後は該当ワーニングのみ削除
        this._deliveryInformationStoreService.setDefaultDeliveryInformation({
          passengerInformationInput: {
            warningInfo:
              this._deliveryInformationStoreService.deliveryInformationData.passengerInformationInput?.warningInfo?.filter(
                (info) => info.apiErrorCode !== ErrorCodeConstants.ERROR_CODES.WBAZ000522
              ) || [],
            errorInfo:
              this._deliveryInformationStoreService.deliveryInformationData.passengerInformationInput?.errorInfo || [],
          },
        });
      }
    }
  }
}
