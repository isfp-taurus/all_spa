import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { PassengerForServicingSeatmapScreen } from '@common/interfaces/reservation/current-seatmap/passenger-for-seatmap-screen';
import { CurrentSeatmapService } from '@common/services/store/current-seatmap/current-seatmap-store.service';
import { SupportComponent } from '@lib/components/support-class';
import {
  AswMasterService,
  CommonLibService,
  DialogDisplayService,
  ErrorsHandlerService,
  ModalService,
} from '@lib/services';
import { debounce, filter, firstValueFrom, map, tap } from 'rxjs';
import { GetOrderResponseData, GetSeatmapsResponseDataSeatmapsDecksInner, Type1 } from 'src/sdk-servicing';
import { SeatmapHelperService } from '@common/services/seatmap/seatmap-helper.service';
import { GetSeatmapsStoreService } from '@common/services/api-store/sdk-servicing/get-seatmaps-store/get-seatmaps-store.service';
import { GetSeatmapsResponseDataSeatmaps } from '../../../sdk-servicing/model/getSeatmapsResponseDataSeatmaps';
import { LModalContentsWidthType, ModalType } from '@lib/components';
import { take, mergeMap } from 'rxjs/operators';
import { ServicingSeatmapLegendsModalComponent } from '@common/components/reservation/seatmap/modal/servicing-seatmap-legends-modal/servicing-seatmap-legends-modal.component';
import {
  ServicingSeatmapLayoutDetailModalComponent,
  ServicingSeatmapSelectChildSeatModalComponent,
} from '@common/components';
import { ServicingSeatmapSeatProductsModalComponent } from '@common/components/reservation/seatmap/modal/servicing-seatmap-seat-products-modal/servicing-seatmap-seat-products-modal.component';
import { SeatForServicingSeatmapScreen, SeatInfo } from '@common/interfaces';
import { ServicingSeatmapChildSeatNotSelectableConfirmationModalComponent } from '@common/components/reservation/seatmap/modal/servicing-seatmap-child-seat-not-selectable-confirmation-modal/servicing-seatmap-child-seat-not-selectable-confirmation-modal.component';
import { ChildSeatNotSelectableConfirmationModalPayload } from '@common/components/reservation/seatmap/modal/servicing-seatmap-select-child-seat-modal/servicing-seatmap-select-child-seat-modal.state';
import { MasterJsonKeyPrefix, MasterStoreKey, MASTER_TABLE } from '@conf/asw-master.config';
import { GetOrderStoreService } from '@common/services';
import { ServicingSeatmapPaidSeatDetailConfirmationComponent } from '@common/components/reservation/seatmap/modal/servicing-seatmap-paid-seat-detail-confirmation/servicing-seatmap-paid-seat-detail-confirmation.component';
import { ServicingSeatmapSeatmapService } from '../../../common/components/reservation/seatmap/servicing-seatmap-seatmap/servicing-seatmap-seatmap.service';
import { DialogClickType, DialogSize, DialogType, PageType } from '@lib/interfaces';
import { SeatmapPresService } from './seatmap-pres.service';
import { AirlineI18nJoinByAirlineCode } from '@common/interfaces/master/airline-i18n-join-by-airline-code';
import { differenceArray } from '@common/helper/array';
import { convertCouchSeatNumberToSeatNumberList, splitCouchSeatNumber } from '@common/helper/common/seatmap.helper';
import { ServicingSeatmapLayoutDetailModal } from '@common/components/reservation/seatmap/modal/servicing-seatmap-layout-detail-modal/servicing-seatmap-layout-detail-modal.state';
import { MListData } from '../../../common/interfaces/master/m_listdata';
import { CabinClasses } from '@common/interfaces/common/cabinClasses';
import { AppConstants } from '@conf/app.constants';
@Component({
  selector: 'asw-seatmap-pres',
  templateUrl: './seatmap-pres.component.html',
  styleUrls: ['./seatmap-pres.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeatmapPresComponent extends SupportComponent {
  @Output()
  public saveAndExit = new EventEmitter<null>();

  @Output()
  public nextFlight = new EventEmitter<null>();
  public displayTargetSegment?: Type1 = {};
  public displayTargetSegmentId?: string = '';
  public seatmaps?: GetSeatmapsResponseDataSeatmaps;
  /** PNR情報 */
  public pnrInfo?: GetOrderResponseData;
  public allSegmentInfo?: Array<Type1>;
  public travelersMap = new Map<string, PassengerForServicingSeatmapScreen>();
  public seatInformationMap = new Map<string, SeatForServicingSeatmapScreen>();
  public selectedSeatInfoList: SeatInfo[] = [];
  public selectingSeatNumber: string = '';
  public numberOfChildSeats: number = 0;
  public isChangeRestrictedAllSeat: boolean = false;

  public segmentId: string = '';
  public passengerIdList: string[] = [];
  public passengers: Map<string, PassengerForServicingSeatmapScreen> = new Map();
  public selectingPassengerId: string = '';
  public isExistUpper: boolean = false;
  public isExistMain: boolean = false;
  public initialDeckType: GetSeatmapsResponseDataSeatmapsDecksInner.DeckTypeEnum =
    GetSeatmapsResponseDataSeatmapsDecksInner.DeckTypeEnum.Main;
  public cabinClasses?: CabinClasses;
  public airlines?: AirlineI18nJoinByAirlineCode;
  public normalSeatImageExist?: boolean;
  public appConstants = AppConstants;
  /** メインコンテンツが表示するかどうか */
  @Input() isdisplayContent: boolean = false;

  constructor(
    private _common: CommonLibService,
    private _changeDetector: ChangeDetectorRef,
    private _getOrderStoreService: GetOrderStoreService,
    private _getSeatmapStoreService: GetSeatmapsStoreService,
    private _currentSeatmapService: CurrentSeatmapService,
    private _seatmapPresService: SeatmapPresService,
    private _seatmapHelperService: SeatmapHelperService,
    private _seatmapSeatmapService: ServicingSeatmapSeatmapService,
    private _modalService: ModalService,
    private _masterService: AswMasterService,
    private _errorHandlerService: ErrorsHandlerService,
    private _dialogService: DialogDisplayService
  ) {
    super(_common);
  }

  /**
   * 初期処理
   */
  init(): void {
    this.subscribeService('seatmapPresDisplayUpdate', this._currentSeatmapService.getCurrentSeatmap$(), (value) => {
      this.displayTargetSegmentId = this._seatmapHelperService.getCurrentSelectedSegment()?.id;
      this.displayTargetSegment = this._seatmapHelperService.getCurrentSelectedSegment();
      this.selectedSeatInfoList = value.selectedSeatInfoList ?? [];
      this.selectingSeatNumber = value.selectingSeatNumber ?? '';
      this.seatInformationMap = value.seatmap ?? new Map();
      this.travelersMap = value.passengers ?? new Map();
      this.passengerIdList = this._currentSeatmapService.getPassengerIdList() ?? [];
      this.selectingPassengerId = value.selectingPassengerId ?? '';
      this.numberOfChildSeats =
        value.childSeatAppliedList?.filter((childSeat) => childSeat.childSeatType !== '').length ?? 0;
      this._changeDetector.markForCheck();
    });

    this.subscribeService(
      'seatmapPresSeatmap',
      this._getSeatmapStoreService.getGetSeatmapsObservable().pipe(filter((data) => !!data)),
      (value) => {
        this.seatmaps = value.data?.seatmaps;
        this.isChangeRestrictedAllSeat = value.data?.travelersSummary?.isChangeRestrictedAllSeat ?? false;

        /** 2階デッキが存在するかどうか。あれば表示階切替タブを表示する。 */
        this.isExistUpper = value.data?.seatmaps.decks.some((deck) => deck.deckType === 'upper') ?? false;
        /** 1階デッキに利用可能席が存在するかどうか判定する（存在しなければ表示階切替タブの初期表示を2階にし、「1階タブ」を非活性とする。） */
        const seatmapsDecks = value.data?.seatmaps.decks.find((item) => item.deckType === 'main');
        const availableSeatmap = seatmapsDecks?.seats.rows.find((row) =>
          row.columns?.find((column) => column.seatAvailabilityStatus === 'available')
        );
        this.isExistMain = !!availableSeatmap;
        if (this.isExistUpper) {
          // 搭乗者情報リストについて、座席情報マップ.<当該搭乗者情報.座席情報.座席番号>.座席情報.デッキが全て”upper”か
          let isUpper = false;
          if (this.passengerIdList && this.passengerIdList.length > 0) {
            isUpper = this.passengerIdList?.every((passengerId) => {
              const seatNumber = this._currentSeatmapService.findSegmentPassengerSeatInfo(
                this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? '',
                passengerId
              )?.seatNumber;
              return (
                !!seatNumber &&
                this.seatInformationMap?.get(seatNumber)?.deckType ===
                  GetSeatmapsResponseDataSeatmapsDecksInner.DeckTypeEnum.Upper
              );
            });
          }
          this.initialDeckType =
            isUpper || !this.isExistMain
              ? GetSeatmapsResponseDataSeatmapsDecksInner.DeckTypeEnum.Upper
              : GetSeatmapsResponseDataSeatmapsDecksInner.DeckTypeEnum.Main;
        } else {
          this.initialDeckType =
            value.data?.seatmaps.decks[0]?.deckType ?? GetSeatmapsResponseDataSeatmapsDecksInner.DeckTypeEnum.Main;
        }

        this._changeDetector.markForCheck();
      }
    );

    this.subscribeService(
      'seatmapPresMasterLoad',
      this._common.aswMasterService.getAswMasterByKey$(MasterStoreKey.M_LIST_DATA_930),
      (value) => {
        this.cabinClasses = value;
      }
    );

    this.subscribeService(
      'seatmapPresGetOrder',
      this._seatmapHelperService.createAllSegmentList$().pipe(
        filter((data) => !!data),
        take(1)
      ),
      (value) => {
        this.allSegmentInfo = value;
        this.pnrInfo = this._getOrderStoreService.getOrderData.data;
        this._changeDetector.markForCheck();
      }
    );

    this.subscribeService(
      'airlineCodeNgxMasterLoad',
      this._common.aswMasterService.load(
        [
          {
            key: MasterStoreKey.AIRLINE_I18NJOIN_BY_AIRLINE_CODE,
            fileName: MASTER_TABLE.AIRLINE_I18NJOIN_BY_AIRLINE_CODE.fileName,
            isCurrentLang: true,
          },
        ],
        true
      ),
      (data) => {
        this.airlines = data[0];
        this._changeDetector.markForCheck();
      }
    );

    this.subscribeService(
      'ServicingSeatmapPresCabinAcvLoad',
      this._masterService.getAswMasterByKey$(MasterStoreKey.AIRCRAFT_CABIN_I18N_JOIN_ACV_AND_CABIN).pipe(
        mergeMap((data) =>
          this._seatmapHelperService.getCurrentSelectedSegment$().pipe(
            map((s) => {
              return { segment: s, mAircraftCabin: data };
            })
          )
        )
      ),
      (data) => {
        const version = data.segment?.aircraftConfigurationVersion;
        const cabinName = data.segment?.cabin;
        this.normalSeatImageExist = !!(
          version &&
          cabinName &&
          data.mAircraftCabin?.[version]?.[cabinName]?.[0].seat_type_image
        );
      }
    );
  }

  /**
   * クリーンアップ処理
   */
  destroy(): void {
    this.deleteSubscription('SeatmapPresResize');
  }
  /**
   * セグメントのクリックイベント
   * @param segmentId セグメントID
   */
  clickSegment(segmentId: string) {
    if (!!segmentId) {
      // 1	セグメント別座席指定状況変更フラグ=trueの場合、以下をパラメータに確認ダイアログ(G02-005)を表示する。
      if (this._currentSeatmapService.isSegmentSeatReservationStatusChanged(this.displayTargetSegmentId)) {
        this._dialogService
          .openDialog({
            size: DialogSize.L,
            type: DialogType.CHOICE,
            message: `${MasterJsonKeyPrefix.DYNAMIC}MSG0535`,
          })
          .buttonClick$.subscribe((result) => {
            if (result.clickType === DialogClickType.CONFIRM) {
              // 選択内容を破棄しセグメントを表示する
              this._currentSeatmapService.retrieveCurrentSeatmap();
              this._currentSeatmapService.updateCurrentSeatmap({
                displayTargetBoundArrayId:
                  this._seatmapHelperService.convertSegmentToBoundFlightListId(segmentId)?.boundListId,
                displayTargetSegmentArrayId:
                  this._seatmapHelperService.convertSegmentToBoundFlightListId(segmentId)?.flightListId,
              });
            } else if (result.clickType === DialogClickType.CLOSE) {
              return;
            }
          });
        return;
      }

      // セグメントを表示する
      this._currentSeatmapService.updateCurrentSeatmap({
        displayTargetBoundArrayId: this._seatmapHelperService.convertSegmentToBoundFlightListId(segmentId)?.boundListId,
        displayTargetSegmentArrayId:
          this._seatmapHelperService.convertSegmentToBoundFlightListId(segmentId)?.flightListId,
      });
    }
  }

  /**
   * 凡例モーダルを開くクリックイベントハンドラ
   */
  onClickLegend() {
    const modalPart = this._modalService.defaultBlockPart(ServicingSeatmapLegendsModalComponent);
    modalPart.type = ModalType.TYPE2;
    this._modalService.showSubModal(modalPart);
  }

  /**
   * シートプロダクト情報モーダルを開くクリックイベントハンドラ
   */
  onClickSeatType() {
    const modalPart = this._modalService.defaultBlockPart(ServicingSeatmapSeatProductsModalComponent);
    modalPart.type = ModalType.TYPE1;
    modalPart.modalWidth = LModalContentsWidthType.MODAL_TAB_W384;
    modalPart.closeBackEnable = false;
    modalPart.payload = this.displayTargetSegment;
    this._modalService.showSubModal(modalPart);
  }

  /** シートマップレイアウト詳細モーダルを開くクリックイベントハンドラ */
  async onClickLayoutDetail() {
    const modalPart = this._modalService.defaultBlockPart(ServicingSeatmapLayoutDetailModalComponent);
    modalPart.type = ModalType.TYPE4;
    modalPart.modalWidth = LModalContentsWidthType.MODAL_PC_W768;
    modalPart.closeBackEnable = false;
    modalPart.payload = <ServicingSeatmapLayoutDetailModal>{
      isInformative: false,
      cabinClasses: await firstValueFrom(this._masterService.getAswMasterByKey$(MasterStoreKey.M_LIST_DATA_930)),
      displayTargetSegment: this.displayTargetSegment,
    };
    this._modalService.showSubModal(modalPart);
  }

  onClickPassenger(passengerId: string) {
    this._currentSeatmapService.updateCurrentSeatmap({ selectingPassengerId: passengerId });
  }

  /** チャイルドシート選択モーダルを開くクリックイベントハンドラ */
  onClickBringChildSeat() {
    const modalPart = this._modalService.defaultBlockPart(ServicingSeatmapSelectChildSeatModalComponent);
    modalPart.type = ModalType.TYPE3;
    modalPart.modalWidth = LModalContentsWidthType.MODAL_TAB_W345;
    modalPart.closeBackEnable = false;
    modalPart.closeEvent = () => {
      if (this._currentSeatmapService.CurrentSeatmapData.notSelectableChildSeatInfoMap?.size) {
        this.openChildSeatNotSelectableConfirmationModal();
      }
    };
    this._modalService.showSubModal(modalPart);
  }

  /** チャイルドシート選択不可確認モーダルを開く */
  openChildSeatNotSelectableConfirmationModal() {
    const modalPart = this._modalService.defaultBlockPart(
      ServicingSeatmapChildSeatNotSelectableConfirmationModalComponent
    );
    modalPart.type = ModalType.TYPE9;
    modalPart.modalWidth = LModalContentsWidthType.MODAL_TAB_W345;
    modalPart.closeBackEnable = false;
    modalPart.payload = this._currentSeatmapService.CurrentSeatmapData
      .notSelectableChildSeatInfoMap as ChildSeatNotSelectableConfirmationModalPayload;
    modalPart.closeEvent = () => {
      this._currentSeatmapService.updateCurrentSeatmap({
        notSelectableChildSeatInfoMap: undefined,
      });
    };
    this._modalService.showSubModal(modalPart);
  }

  /**
   * 座席のクリックイベントハンドラ
   * @param seatNumber 座席番号
   */
  async onClickSeat(seatNumber: string) {
    this._currentSeatmapService.updateCurrentSeatmap({ selectingSeatNumber: seatNumber });

    const seatInfo = this.seatInformationMap.get(convertCouchSeatNumberToSeatNumberList(seatNumber)?.[0] ?? '');
    const selectingPassengerSeatInfo = this._currentSeatmapService.findSegmentPassengerSeatInfo(
      this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? '',
      this._currentSeatmapService.CurrentSeatmapData.selectingPassengerId
    );
    const ssrSeatNumber = this._currentSeatmapService.findSegmentPassengerSeatInfo(
      this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? '',
      this._currentSeatmapService.CurrentSeatmapData.selectingPassengerId
    )?.ssrInformation?.ssrSeatNumber;
    const currentPassengerInfo = this._currentSeatmapService.CurrentSeatmapData.passengers?.get(
      this._currentSeatmapService.CurrentSeatmapData.selectingPassengerId ?? ''
    );

    // 当該座席を指定済み
    // 座席取り消し操作の場合
    if (selectingPassengerSeatInfo?.seatNumber === seatNumber) {
      const seatNumberEdit = seatInfo?.isCouchSeat
        ? convertCouchSeatNumberToSeatNumberList(seatNumber)?.[0] ?? ''
        : seatNumber;
      // 当該座席をSSR登録済み
      if (ssrSeatNumber === seatNumberEdit) {
        // ほかの座席を変更/指定している、かつ選択中の座席が有料席の場合
        if (
          this._currentSeatmapService.CurrentSeatmapData.isOperationOnProgress &&
          (seatInfo?.isChargeableAsrSeat || seatInfo?.isCouchSeat)
        ) {
          this._errorHandlerService.setRetryableError(PageType.PAGE, { errorMsgId: 'E0739' });
          return;
        }
        // 上記以外、かつ有料ASR席である
        else if (seatInfo?.isChargeableAsrSeat) {
          // MSG1107
          const result = await firstValueFrom(
            this._dialogService.openDialog({ message: `${MasterJsonKeyPrefix.DYNAMIC}MSG1107` }).buttonClick$
          );
          if (result.clickType !== DialogClickType.CONFIRM) return;
          this._currentSeatmapService.updateCurrentSeatmap({ isOperationOnProgress: false });
        }
        // 上記以外、かつカウチ席である
        else if (seatInfo?.isCouchSeat) {
          // MSG1108
          const result = await firstValueFrom(
            this._dialogService.openDialog({ message: `${MasterJsonKeyPrefix.DYNAMIC}MSG1108` }).buttonClick$
          );
          if (result.clickType !== DialogClickType.CONFIRM) return;
          this._currentSeatmapService.updateCurrentSeatmap({ isOperationOnProgress: false });
        }
      } else {
        // 当該座席をSSR登録済みではない
        // カウチ席の場合
        if (seatInfo?.isCouchSeat) {
          // 有料席モーダルを表示する
          this.showPaidSeatDetailConfirmation();
          return;
        }
      }

      // 座席状態を戻す
      seatInfo?.isCouchSeat
        ? this._seatmapPresService.updateCurrentSeatmapCouchSeat([], 0, seatNumber)
        : this._seatmapPresService.updateCurrentSeatmapNormalSeat(this.selectingPassengerId, '');
    } else {
      // 上記以外（座席を新たに指定する）
      // 有料席取り消し中で、ほかの座席を選択しようとしている場合
      if (this._currentSeatmapService.CurrentSeatmapData.isOperationOnProgress === false) {
        this._errorHandlerService.setRetryableError(PageType.PAGE, { errorMsgId: 'E0739' });
        return;
      }
      const ssrSeatInfo = this.seatInformationMap.get(convertCouchSeatNumberToSeatNumberList(ssrSeatNumber)?.[0] ?? '');
      // 当該搭乗者が当該座席と異なる有料ASR席、またはカウチ席をSSR登録済み
      if (ssrSeatNumber !== seatNumber && (ssrSeatInfo?.isChargeableAsrSeat || ssrSeatInfo?.isCouchSeat)) {
        // W0575
        this._errorHandlerService.setRetryableError(PageType.PAGE, { errorMsgId: 'E0578' });
        return;
      }
      // 当該搭乗者がチャイルドシート申込済み、かつ当該座席チャイルドシート選択不可
      if (currentPassengerInfo?.isRequestChildSeat && seatInfo?.isChildSeatAttachable === false) {
        // W0586
        this._errorHandlerService.setRetryableError(PageType.PAGE, { errorMsgId: 'W0587' });
        return;
      }
      // 当該搭乗者が当該座席を指定できない
      if (
        seatInfo?.travelers?.find(
          (travelers) => travelers.id === this._currentSeatmapService.CurrentSeatmapData.selectingPassengerId
        )?.seatAvailabilityStatus !== 'available'
      ) {
        // E0586
        this._errorHandlerService.setRetryableError(PageType.PAGE, { errorMsgId: 'E0586' });
        return;
      }
      // 同じ座席ブロックに幼児が存在、もしくはほかの幼児同伴の搭乗者もしくは席あり幼児が当該座席のブロックの座席に変更しようとしている
      // カウチシートは別規定のため除外
      if (!seatInfo?.isCouchSeat) {
        const splitedSeatNumber = splitCouchSeatNumber(
          this._currentSeatmapService.CurrentSeatmapData.selectingSeatNumber
        );
        const seatBlock: string =
          this._seatmapHelperService
            .createSeatBlockColoumNumberList()
            .find((seatBlock) => seatBlock.includes(splitedSeatNumber.columnNumbers?.[0] ?? '')) ?? '';
        const sameBlockSeatNumberList: string[] = differenceArray(
          [...seatBlock].map((seatBlock) => splitedSeatNumber.rowNumber + seatBlock),
          [this._currentSeatmapService.CurrentSeatmapData.selectingSeatNumber ?? '']
        );
        if (
          this._currentSeatmapService.CurrentSeatmapData.passengers?.get(
            this._currentSeatmapService.CurrentSeatmapData.selectingPassengerId ?? ''
          )?.accompanyingInfant &&
          this._isSameBlockInfantSeated(sameBlockSeatNumberList)
        ) {
          // E0586
          this._errorHandlerService.setRetryableError(PageType.PAGE, { errorMsgId: 'E0586' });
          return;
        }
      }

      // 提携便名の国内線、かつ非常口席である
      const currentSelectedSegment = this._seatmapHelperService.getCurrentSelectedSegment();
      const isShowDialogEmergencyExit: boolean | undefined = currentSelectedSegment?.isJapanDomesticFlight
        ? currentSelectedSegment?.isNhGroupMarketing
        : currentSelectedSegment?.isNhGroupOperated &&
          (currentSelectedSegment?.isNhGroupMarketing ||
            this._seatmapPresService.isAdvanceSeatReservationsAvailable(
              currentSelectedSegment?.marketingAirlineCode ?? ''
            ));
      if (this._seatmapSeatmapService.isExitDoorSeat(seatInfo?.seatCharacteristicsCodes) && isShowDialogEmergencyExit) {
        // MSG0476
        const result = await firstValueFrom(
          this._dialogService.openDialog({ message: `${MasterJsonKeyPrefix.DYNAMIC}MSG0476` }).buttonClick$
        );
        if (result.clickType !== DialogClickType.CONFIRM) return;
      }
      // テーブルに隣接する席である
      if (this._seatmapPresService.isNextToTable(seatNumber)) {
        // MSG0477
        const result = await firstValueFrom(
          this._dialogService.openDialog({ message: `${MasterJsonKeyPrefix.DYNAMIC}MSG0477` }).buttonClick$
        );
        if (result.clickType !== DialogClickType.CONFIRM) return;
      }
      // 座席情報.当該座席特性に”1W”(窓なし席)を含む
      let isNoWindow =
        this._seatmapSeatmapService.isLeftNoWindowSeat(seatInfo?.seatCharacteristicsCodes) ||
        this._seatmapSeatmapService.isRightNoWindowSeat(seatInfo?.seatCharacteristicsCodes);
      // 座席情報.当該座席特性に“1D”(リクライニング制限席)を含む
      let isRecliningLimit = this._seatmapSeatmapService.isNoReclineSeat(seatInfo?.seatCharacteristicsCodes);
      // 窓なし席、リクライニング制限席の場合、以下をパラメータに確認ダイアログ(G02-005)を表示する。
      if (isNoWindow || isRecliningLimit) {
        // MSG1651
        const result = await firstValueFrom(
          this._dialogService.openDialog({
            message: `${MasterJsonKeyPrefix.DYNAMIC}MSG1651`,
            // MSG1651の埋め込み文字(MSG0479/MSG0480)
            messageParams: [
              {
                key: 0,
                value: isRecliningLimit ? `${MasterJsonKeyPrefix.DYNAMIC}MSG0479` : '',
                dontTranslate: isRecliningLimit ? false : true,
              },
              {
                key: 1,
                value: isNoWindow ? `${MasterJsonKeyPrefix.DYNAMIC}MSG0480` : '',
                dontTranslate: isNoWindow ? false : true,
              },
            ],
          }).buttonClick$
        );
        if (result.clickType !== DialogClickType.CONFIRM) return;
      }
      // 有料ASR席またはカウチ席である
      if (seatInfo?.isCouchSeat || seatInfo?.isChargeableAsrSeat) {
        // 有料席モーダルを表示する
        this.showPaidSeatDetailConfirmation();
        return;
      }
      // 情報更新
      this._seatmapPresService.updateCurrentSeatmapNormalSeat(this.selectingPassengerId, seatNumber);
      this._currentSeatmapService.updateCurrentSeatmap({ isOperationOnProgress: true });
    }
  }

  /**
   * 同ブロックに幼児が座っているか判定
   * @param sameBlockSeatNumberList 同ブロック座席番号リスト
   */
  private _isSameBlockInfantSeated(sameBlockSeatNumberList: string[]): boolean {
    return !!sameBlockSeatNumberList.find((seatBlockNumber) => {
      const seatSelectingPassengerId =
        this._currentSeatmapService.CurrentSeatmapData.seatmap?.get(seatBlockNumber)?.selectingPassengerID;
      // 当該シートがPNR幼児あり搭乗者に選択されている
      return (
        (seatSelectingPassengerId !== this._currentSeatmapService.CurrentSeatmapData.selectingPassengerId &&
          this._currentSeatmapService.CurrentSeatmapData.passengers?.get(seatSelectingPassengerId ?? '')
            ?.accompanyingInfant) ||
        // 当該シートがSeatmap APIより幼児が座っていると返却された
        this._currentSeatmapService.CurrentSeatmapData.seatmap?.get(seatBlockNumber)?.isInfantSeated
      );
    });
  }

  /**
   * 有料席詳細確認モーダル表示
   */
  showPaidSeatDetailConfirmation() {
    const modalPart = this._modalService.defaultBlockPart(ServicingSeatmapPaidSeatDetailConfirmationComponent);
    modalPart.type = ModalType.TYPE1;
    modalPart.closeBackEnable = false;
    modalPart.payload = this.displayTargetSegment;
    modalPart.closeEvent = () => {};

    this._modalService.showSubModal(modalPart);
  }

  /**
   * 次のセグメントを表示する
   */
  public showNextSegment(): void {
    const displayTargetBoundArrayId = this._currentSeatmapService.CurrentSeatmapData.displayTargetBoundArrayId ?? 0;
    const displayTargetSegmentArrayId = this._currentSeatmapService.CurrentSeatmapData.displayTargetSegmentArrayId ?? 0;
    this._currentSeatmapService.updateCurrentSeatmap({
      displayTargetSegmentArrayId: this._seatmapHelperService.getNextBoundFlightListId(
        displayTargetBoundArrayId,
        displayTargetSegmentArrayId
      )?.flightListId,
      displayTargetBoundArrayId: this._seatmapHelperService.getNextBoundFlightListId(
        displayTargetBoundArrayId,
        displayTargetSegmentArrayId
      )?.boundListId,
    });
  }

  reload(): void {}
}
