import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { AswMasterService, CommonLibService, DialogDisplayService } from '@lib/services';
import { AlertMessageItem, AlertType, DialogClickType, DialogSize, DialogType } from '@lib/interfaces';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { MasterJsonKeyPrefix, MasterStoreKey } from '@conf/asw-master.config';
import { StaticMsgPipe } from '@lib/pipes';
import { SeatmapHelperService } from '@common/services/seatmap/seatmap-helper.service';
import { SeatForServicingSeatmapScreen, SeatInfo } from '@common/interfaces';
import { CurrentSeatmapService } from '@common/services/store/current-seatmap/current-seatmap-store.service';
import { PassengerForServicingSeatmapScreen } from '@common/interfaces/reservation/current-seatmap/passenger-for-seatmap-screen';
import {
  CouchSeatAppliedPassengerInfo,
  CHARGABLE_DESCRIPTION_KEY,
  CHARGABLE_ATTENTION_KEY,
} from './servicing-seatmap-paid-seat-detail-confirmation.state';
import { GetOrderStoreService } from '@common/services';
import { GetSeatmapsStoreService } from '../../../../../services/api-store/sdk-servicing/get-seatmaps-store/get-seatmaps-store.service';
import { PaidSeatDetailConfirmationService } from './servicing-seatmap-paid-seat-detail-confirmation.service';
import { SeatmapPresService } from '@app/seatmap/presenter/seatmap-pres.service';
import { differenceArray } from '@common/helper/array';
import { convertCouchSeatNumberToSeatNumberList } from '@common/helper/common/seatmap.helper';

const SEATMAP_PROPETRY_CATEGORY = 'seatMap';

@Component({
  selector: 'asw-servicing-seatmap-paid-seat-detail-confirmation',
  templateUrl: './servicing-seatmap-paid-seat-detail-confirmation.component.html',
  styleUrls: ['./servicing-seatmap-paid-seat-detail-confirmation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicingSeatmapPaidSeatDetailConfirmationComponent extends SupportModalBlockComponent {
  /** 座席情報マップ */
  seatInformationMap?: Map<string, SeatForServicingSeatmapScreen>;

  /** 搭乗者マップ */
  travelersMap?: Map<string, PassengerForServicingSeatmapScreen>;

  /** 搭乗者IDリスト */
  passengerIdList: string[] = [];

  /** 表示対象セグメントID */
  displayTargetSegmentId?: string;

  /** 選択中座席情報リスト */
  selectedSeatInfoList: SeatInfo[] = [];

  /** 座席番号 */
  seatNumber?: string;

  /** 座席ブロック番号 */
  seatBlockNumber: string[] = [];

  /** 選択中搭乗者ID */
  selectingPassengerId?: string;

  /** カウチ席利用搭乗者IDリスト */
  couchSeatAppliedPassengerList = new Map<string, CouchSeatAppliedPassengerInfo>();

  /** カウチ席指定中人数 */
  couchSeatReservedPassengerCount: number = 0;

  /** カウチ席指定料金合計金額 */
  reservedCouchSeatTotalAmount: number | undefined = 0;

  /** シートマップ（参照）かどうか */
  isInformative: boolean = false;

  /** カウチ席 かどうか */
  isCouchSeat?: boolean;

  /** 通常席の画像 */
  chargeASRSeatImage?: string;

  /** カウチ席の画像 */
  couchSeatImage?: string;

  /** 通常席のシート画像alt文言のための静的文言キー */
  chargeASRSeatImgAltStaticMsgKey: string = '';

  /** 請求案内 */
  chargableDescription: string = '';

  /** 適用条件 */
  chargableAttention: string = '';

  /** 座席変更不可かどうか */
  isChangeRestrictedAllSeat?: boolean;

  reload(): void {}
  init(): void {
    this.subscribeService(
      'ServicingSeatmapPaidSeatDetailConfirmationModalComponent-init',
      this._masterService.getAswMasterByKey$(MasterStoreKey.AIRCRAFT_CABIN_I18N_JOIN_ACV_AND_CABIN).pipe(take(1)),
      (mAircraftCabin) => {
        this.seatInformationMap = this._currentSeatmapService.CurrentSeatmapData.seatmap;
        this.seatNumber = this._currentSeatmapService.CurrentSeatmapData.selectingSeatNumber;
        this.seatBlockNumber = convertCouchSeatNumberToSeatNumberList(this.seatNumber) ?? [];
        this.isChangeRestrictedAllSeat =
          this._getSeatmapStoreService.getSeatmapsData?.data?.travelersSummary.isChangeRestrictedAllSeat;

        this.travelersMap = this._currentSeatmapService.CurrentSeatmapData.passengers;
        this.passengerIdList = this._currentSeatmapService.getPassengerIdList();
        this.displayTargetSegmentId = this._seatmapHelperService.getCurrentSelectedSegment()?.id;
        this.selectedSeatInfoList = this._currentSeatmapService.CurrentSeatmapData.selectedSeatInfoList!;
        this.selectingPassengerId = this._currentSeatmapService.CurrentSeatmapData.selectingPassengerId;

        this.passengerIdList.forEach((id) => {
          this.couchSeatAppliedPassengerList?.set(id, { isChecked: false, hasAvailabilityToCheck: true });
        });

        // カウチ席かどうか
        this.isCouchSeat = this.seatInformationMap?.get(this.seatBlockNumber[0] ?? '')?.isCouchSeat || false;

        const contentsServerUrl = this._masterService.getMPropertyByKey(
          SEATMAP_PROPETRY_CATEGORY,
          'contents.server.url'
        );

        let displayTargetSegment = this._seatmapHelperService.getCurrentSelectedSegment();
        if (displayTargetSegment) {
          let seatCharacteristicsCodes = this.seatInformationMap?.get(this.seatNumber || '')?.seatCharacteristicsCodes;
          if (
            this._getSeatmapStoreService.getSeatmapsData.data?.seatmaps.isCotaninedRearFacingSeat &&
            seatCharacteristicsCodes &&
            !seatCharacteristicsCodes?.includes('1W') &&
            !seatCharacteristicsCodes?.includes('1D') &&
            !seatCharacteristicsCodes?.includes('E') &&
            seatCharacteristicsCodes?.includes('J')
          ) {
            // マスタから後ろ向き席とカウチ席のシート画像とコンテンツリンクを取得
            const rearFacingSeatImage = this._masterService.getMPropertyByKey(
              SEATMAP_PROPETRY_CATEGORY,
              'seatProduct.image.rearFacingSeat'
            );
            this.chargeASRSeatImage = `${contentsServerUrl}${rearFacingSeatImage}.png`;
            this.chargeASRSeatImgAltStaticMsgKey = 'label.rearFacingSeat';
          } else {
            // キャビン別機材情報マスタから対象のレコードを取得
            const version = displayTargetSegment.aircraftConfigurationVersion;
            const cabinName = displayTargetSegment.cabin ? displayTargetSegment.cabin : undefined;
            if (!!version && !!cabinName) {
              const targetCabinRecord = mAircraftCabin?.[version]?.[cabinName]?.[0];

              if (targetCabinRecord?.seat_type_image) {
                // マスタから通常席のシート画像を取得
                this.chargeASRSeatImage = `${contentsServerUrl}${targetCabinRecord.seat_type_image}.png`;

                // 通常席のシート画像alt文言のための静的文言キーを設定
                this.chargeASRSeatImgAltStaticMsgKey =
                  'alt.seatProductExplanation.' + targetCabinRecord.seat_type_image;
              }
            }
          }
        }

        // マスタからカウチ席のシート画像を取得
        const couchSeatImage = this._masterService.getMPropertyByKey(
          SEATMAP_PROPETRY_CATEGORY,
          'seatProduct.image.couch'
        );
        this.couchSeatImage = `${contentsServerUrl}${couchSeatImage}.png`;

        // 座席種別説明、請求案内を取得
        this.getSeatTypeInformation();
      }
    );
    // URL変化時に自動でモーダルが閉じられるように修正
    this.closeWithUrlChange(this._router);
  }

  destroy(): void {}

  constructor(
    private _common: CommonLibService,
    private _currentSeatmapService: CurrentSeatmapService,
    private _dialogDisplayService: DialogDisplayService,
    private _getOrderStoreService: GetOrderStoreService,
    private _getSeatmapStoreService: GetSeatmapsStoreService,
    private _seatmapHelperService: SeatmapHelperService,
    private _seatmapPresService: SeatmapPresService,
    private _paidSeatDetailConfirmationService: PaidSeatDetailConfirmationService,
    private _router: Router,
    private _masterService: AswMasterService,
    private _staticMsgPipe: StaticMsgPipe
  ) {
    super(_common);
  }

  /**
   * 指定ボタンのクリックイベント
   */
  public onSelectClick() {
    // カウチ席指定取消同時操作かどうかにfalse(同時操作なし)を設定する。
    let isCancelReserveCouchSeat = false;

    // 当該座席.カウチ席かどうか=trueの場合、カウチ席指定変更処理として、以下の処理を行う。
    if (!!this.seatNumber && this.seatInformationMap?.get(this.seatBlockNumber[0] ?? '')?.isCouchSeat) {
      // カウチ席申込可否判定処理として、以下の処理を行う。
      let registeredPassengerIdList: string[] = [];
      this._currentSeatmapService.findSeatInfoFromSeatNumber(this.seatNumber)?.forEach((seatInfo) => {
        if (seatInfo.registedPassengerID) {
          registeredPassengerIdList.push(seatInfo.registedPassengerID);
        }
      });
      // カウチ席を選択している搭乗者が一人以上、かつ登録済みの搭乗者がカウチ席を選択していない
      if (
        this.getApplyingPassengerIdList().length &&
        differenceArray(registeredPassengerIdList, this.getApplyingPassengerIdList()).length
      ) {
        isCancelReserveCouchSeat = true;
      }
      // カウチ席指定取消同時操作かどうか=trueの場合、エラーメッセージID="E0739"
      // (カウチ席の取消と座席の指定は同時に行えない旨)にて継続可能なエラー情報を指定し、処理を終了する。
      if (isCancelReserveCouchSeat) {
        const message: AlertMessageItem = {
          contentHtml: 'E0739',
          isCloseEnable: false,
          alertType: AlertType.ERROR,
        };
        this._common.alertMessageStoreService.setAlertWarningMessage(message);
        return;
      }

      // カウチ席申込人数制限超過かどうかおよびカウチ席安全規定未満かどうかの判定処理として、以下の処理を行う。
      const couchPassengerIdList = this.getApplyingPassengerIdList();
      const isCompanionExist: boolean = !!couchPassengerIdList.find(
        (couchPassengerId) =>
          this.travelersMap?.get(couchPassengerId)?.passengerTypeCode === 'ADT' ||
          this.travelersMap?.get(couchPassengerId)?.passengerTypeCode === 'B15'
      );
      const isInfantExist: boolean = !!couchPassengerIdList.find(
        (couchPassengerId) => !!this.travelersMap?.get(couchPassengerId)?.accompanyingInfant
      );
      const infantCount: number = couchPassengerIdList.filter(
        (couchPassengerId) => !!this.travelersMap?.get(couchPassengerId)?.accompanyingInfant
      ).length;
      const couchNumberOfSeats = this.getCouchNumberOfSeats(this.seatNumber) || 0;
      const couchSeatAppliedPassengerCount = couchPassengerIdList.length ?? 0;

      // 以下の条件に応じたエラーメッセージIDにて継続可能なエラー情報を指定する。
      // 以下のいずれかに該当する場合、申込人数制限フラグに true を設定し、申込人数制限フラグがtrueである場合、“E0582”（申込人数に制限がある旨）にて継続可能なエラー情報を設定する
      // 当該カウチ席を指定する搭乗者のうち、席なし幼児を除くカウチ席搭乗者の人数 > 当該座席.カウチ席数(3 or 4)の場合
      // 当該カウチ席を指定する搭乗者のうち、席なし幼児を含む登場者の総人数 > 当該座席.カウチの座席数(3 or 4) + 2の場合
      if (
        couchNumberOfSeats < couchSeatAppliedPassengerCount ||
        infantCount + couchSeatAppliedPassengerCount > couchNumberOfSeats + 2
      ) {
        const message: AlertMessageItem = {
          contentHtml: 'E0582',
          isCloseEnable: false,
          alertType: AlertType.ERROR,
        };
        this._common.alertMessageStoreService.setAlertWarningMessage(message);
        return;
      }

      // 幼児が存在する、かつ搭乗者種別が大人またはヤングアダルトの搭乗者が存在しないまたは3人以上の幼児が存在する場合、”E0583”(安全規定の制限がある旨)
      if (infantCount > 2 || (!!isInfantExist && !isCompanionExist)) {
        const message: AlertMessageItem = {
          contentHtml: 'E0583',
          isCloseEnable: false,
          alertType: AlertType.ERROR,
        };
        this._common.alertMessageStoreService.setAlertWarningMessage(message);
        return;
      }

      // ＜以下、カウチ席指定対象搭乗者リストの要素数分、繰り返し表示＞
      for (let passengerId of couchPassengerIdList) {
        // 表示対象セグメントID、カウチ席指定対象搭乗者リスト.当該搭乗者IDをキー名とする、
        // PNR情報.data.seats.＜当該表示対象セグメントID＞.＜当該搭乗者ID＞.bassinet=trueの場合、以下の処理を行う。
        if (this.travelersMap?.get(passengerId)?.isRequestBassinet) {
          // 確認ダイアログ(G02-005)を表示する。
          this._dialogDisplayService
            .openDialog({
              size: DialogSize.L, // size: large
              type: DialogType.WARN,
              message: `${MasterJsonKeyPrefix.DYNAMIC}MSG0638`,
            })
            .buttonClick$.subscribe((result) => {
              if (result.clickType === DialogClickType.CONFIRM) {
                this._paidSeatDetailConfirmationService.updateStore(
                  true,
                  this.getSeatPrice(),
                  this.getApplyingPassengerIdList()
                );
                this.close();
              } else {
                this.close();
              }
            });
          // 当繰り返し処理を終了する。
          return;
        }
      } // ＜ここまで、カウチ席指定対象搭乗者リストの要素数分、繰り返し表示＞

      // 有料席詳細モーダルを閉じる。
      couchPassengerIdList.length
        ? this._paidSeatDetailConfirmationService.updateStore(
            true,
            this.getSeatPrice(),
            this.getApplyingPassengerIdList()
          )
        : this._paidSeatDetailConfirmationService.updateStore(true);
      this.close();
      return;

      // 上記以外の場合、有料ASR席指定処理として以下の処理を実施する。
    } else {
      // 登録済み座席情報が空ではない場合
      if (
        this._currentSeatmapService.CurrentSeatmapData.seatmap?.get(this.seatBlockNumber[0] ?? '')
          ?.registedPassengerID &&
        this._currentSeatmapService.CurrentSeatmapData.seatmap?.get(this.seatBlockNumber[0] ?? '')
          ?.registedPassengerID !== this.selectingPassengerId
      ) {
        // エラーメッセージID="E0738"(有料ASR席の取消と座席の指定は同時に行えない旨)とし、継続可能なエラー情報を指定する。
        const message: AlertMessageItem = {
          contentHtml: 'E0738',
          isCloseEnable: false,
          alertType: AlertType.ERROR,
        };
        this._common.alertMessageStoreService.setAlertWarningMessage(message);

        // 指定する（有料席詳細確認モーダル）ボタン押下処理を終了し、有料席詳細確認モーダルを閉じる。
        this._paidSeatDetailConfirmationService.updateStore(false);
        this.close();
      } else {
        this._paidSeatDetailConfirmationService.updateStore(false, this.getSeatPrice());
      }
    }

    // 有料席詳細確認モーダルを閉じる。
    this.close();
  }

  /**
   * 搭乗者欄のクリックイベントハンドラ
   *
   * 座席選択中の搭乗者を切り替える
   */
  public onClickPassenger(id: string) {
    if (this.isUnchangeable(id)) {
      return;
    }
    // 画面.カウチ席利用搭乗者一覧.当該チェックあり=trueである場合、
    // 画面.カウチ席利用搭乗者一覧.当該搭乗者IDをチェック対象搭乗者IDとして保持する。
    this.selectingPassengerId = id;

    if (this.couchSeatAppliedPassengerList?.get(id)?.isChecked) {
      this.couchSeatAppliedPassengerList.set(id, { isChecked: false });
    } else {
      this.couchSeatAppliedPassengerList?.set(id, { isChecked: true });
    }

    // 画面.カウチ席利用搭乗者一覧.チェックあり=trueである要素数を、カウチ席指定中人数として保持する。
    this.couchSeatReservedPassengerCount = 0;
    this.couchSeatAppliedPassengerList?.forEach((value) => {
      if (value.isChecked) {
        this.couchSeatReservedPassengerCount! += 1;
      }
    });

    let isUnableToReserveCouchSeat = false;
    // 座席情報.travelers.当該seatAvailabilityStatus=blockedの場合、カウチ席指定不可エラー処理として、以下の処理を行う。
    this.seatInformationMap?.get(this.seatBlockNumber[0] ?? '')?.travelers?.forEach((t) => {
      // 当該搭乗者がカウチ席を選択している場合
      if (this.couchSeatAppliedPassengerList?.get(t.id)?.isChecked) {
        if (t.seatAvailabilityStatus === 'blocked') {
          // 画面.カウチ席利用搭乗者一覧.当該チェック有無にfalseを設定する。
          this.couchSeatAppliedPassengerList?.delete(id);
          this.couchSeatAppliedPassengerList?.set(id, { hasAvailabilityToCheck: false });
          isUnableToReserveCouchSeat = true;
        }
      }
    });

    if (isUnableToReserveCouchSeat) {
      // メッセージIDに”W0586”(当該座席は指定できない旨)を指定し、処理を終了する。
      const errorMessageId = 'W0586';
      const message: AlertMessageItem = {
        contentHtml: errorMessageId,
        isCloseEnable: false,
        alertType: AlertType.ERROR,
      };
      this._common.alertMessageStoreService.setAlertWarningMessage(message);
      return;
    }

    this.reservedCouchSeatTotalAmount = this.getCouchSeatLowestPrice() ?? 0;

    // 画面.カウチ席指定料金合計金額にチェック対象搭乗者ID.全搭乗者IDをキーに取得した選択中座席情報.
    // 当該選択している座席情報.指定金額を設定する。↑

    // カウチ席指定人数=0の場合、画面.カウチ席指定料金合計金額に0を設定する。
    if (this.couchSeatReservedPassengerCount === 0) {
      this.reservedCouchSeatTotalAmount = 0;
    }
  }

  /**
   * 請求案内、注意案内、適用条件を取得
   */
  private getSeatTypeInformation() {
    // 請求案内対象
    const dedicatedChargeableSeatPromotion = this._masterService.getMPropertyByKey(
      SEATMAP_PROPETRY_CATEGORY,
      'characteristic.dedicatedChargeableSeatPromotion'
    );
    const seatPromotion = dedicatedChargeableSeatPromotion.split('|');

    let seatCharacteristicsCodes: string[] | undefined;
    let seatCharacteristicsCode: string | undefined;
    if (this.seatNumber && this.seatInformationMap) {
      seatCharacteristicsCodes = this.seatInformationMap.get(
        convertCouchSeatNumberToSeatNumberList(this.seatNumber)?.[0] ?? ''
      )?.seatCharacteristicsCodes;
      seatCharacteristicsCode = seatPromotion.find((code) => seatCharacteristicsCodes?.includes(code));
    }

    // 座席属性が存在しない場合
    // ※座席特性が存在する場合はそのまま seatCharacteristicsCode を使用
    if (!seatCharacteristicsCode && !!seatCharacteristicsCodes && seatCharacteristicsCodes.length > 0) {
      seatCharacteristicsCode = seatCharacteristicsCodes?.find((code) => code === 'CH');
    }

    if (!!seatCharacteristicsCode) {
      let chargableDescriptionKey = CHARGABLE_DESCRIPTION_KEY[seatCharacteristicsCode];
      let chargableAttentionKey = CHARGABLE_ATTENTION_KEY[seatCharacteristicsCode];

      // 請求案内
      this.chargableDescription = !!chargableDescriptionKey
        ? this._staticMsgPipe.transform(chargableDescriptionKey)
        : '';
      // 適用条件
      this.chargableAttention = !!chargableAttentionKey ? this._staticMsgPipe.transform(chargableAttentionKey) : '';
    }
  }

  /**
   * 座席指定料金
   * @returns 座席指定料金
   */
  public getSeatPrice(): number {
    /** 有料ASR席 */
    if (
      !!this.seatNumber &&
      this.seatInformationMap?.get(this.seatBlockNumber[0] ?? '')?.isChargeableAsrSeat &&
      !!this.selectingPassengerId
    ) {
      return (
        this.seatInformationMap
          .get(this.seatBlockNumber[0])
          ?.travelers?.find((traveler) => traveler.id === this.selectingPassengerId)?.price ?? 0
      );
    } else {
      return this.getCouchSeatLowestPrice() ?? 0;
    }
  }

  /**
   * カウチ席指定金額
   * @returns カウチ席指定金額
   */
  public getCouchSeatLowestPrice(): number | undefined {
    let couchBlockCount = this.getCouchNumberOfSeats(this.seatNumber ?? '');
    let couchSeatReservedPassengerCount = Array.from(this.couchSeatAppliedPassengerList.entries()).filter(
      ([_, applyInfo]) => applyInfo.isChecked
    ).length;
    /** カウチ席３人席・４人席 */
    if (couchBlockCount === 3) {
      switch (couchSeatReservedPassengerCount) {
        case 1:
          return this._getOrderStoreService.getOrderData.data?.seats?.[
            this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? ''
          ]?.[this._currentSeatmapService.getPassengerIdList()[0]]?.couchCatalogue.threeSeats?.oneTraveler?.catalogue
            ?.prices?.total;
        case 2:
          return this._getOrderStoreService.getOrderData.data?.seats?.[
            this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? ''
          ]?.[this._currentSeatmapService.getPassengerIdList()[0]]?.couchCatalogue.threeSeats?.twoTraveles?.catalogue
            ?.prices?.total;
        case 3:
          return this._getOrderStoreService.getOrderData.data?.seats?.[
            this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? ''
          ]?.[this._currentSeatmapService.getPassengerIdList()[0]]?.couchCatalogue.threeSeats?.threeTravelers?.catalogue
            ?.prices?.total;
        default:
          break;
      }
    } else if (couchBlockCount === 4) {
      switch (couchSeatReservedPassengerCount) {
        case 1:
          return this._getOrderStoreService.getOrderData.data?.seats?.[
            this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? ''
          ]?.[this._currentSeatmapService.getPassengerIdList()[0]]?.couchCatalogue?.fourSeats?.oneTraveler?.catalogue
            ?.prices?.total;
        case 2:
          return this._getOrderStoreService.getOrderData.data?.seats?.[
            this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? ''
          ]?.[this._currentSeatmapService.getPassengerIdList()[0]]?.couchCatalogue?.fourSeats?.twoTraveles?.catalogue
            ?.prices?.total;
        case 3:
          return this._getOrderStoreService.getOrderData.data?.seats?.[
            this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? ''
          ]?.[this._currentSeatmapService.getPassengerIdList()[0]]?.couchCatalogue?.fourSeats?.threeTravelers?.catalogue
            ?.prices?.total;
        case 4:
          return this._getOrderStoreService.getOrderData.data?.seats?.[
            this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? ''
          ]?.[this._currentSeatmapService.getPassengerIdList()[0]]?.couchCatalogue?.fourSeats?.fourTravelers?.catalogue
            ?.prices?.total;
        default:
          break;
      }
    }
    return undefined;
  }

  /**
   * 座席を選択している搭乗者が有料ASR座席料金免除対象であるかどうかを返却する関数
   * @return 判定結果
   */
  public hasFreePermission(): boolean | undefined {
    if (this.isInformative && !!this.seatNumber) {
      return !!this.seatInformationMap?.get(this.seatNumber)?.travelers?.find((t) => t.isExempted);
    } else {
      return !!this.seatNumber
        ? this.seatInformationMap?.get(this.seatNumber)?.travelers?.find((t) => t.id === this.selectingPassengerId)
            ?.isExempted
        : false;
    }
  }

  /**
   * カウチシート番号からカウチ席数を割り出す関数
   * @returns カウチ席数
   */
  private getCouchNumberOfSeats(couchSeatNumber: string): number | undefined {
    return convertCouchSeatNumberToSeatNumberList(couchSeatNumber)?.length;
  }

  /**
   * 座席指定済みかどうか
   * @param passengerId 搭乗者ID
   * @returns 判定結果
   */
  public isSelected(passengerId: string) {
    return this.couchSeatAppliedPassengerList.get(passengerId)?.isChecked;
  }

  /**
   * 搭乗者毎に該当するボタンの読み上げ文言を取得。
   * @param id 搭乗者ID
   * @returns 該当する静的文言キー
   */
  public getButtonReaderStaticMsgKey(id: string): string {
    if (this.isUnchangeable(id)) {
      // 座席変更不可の場合
      return 'reader.notSelectableCouchiiSeatsPassenger';
    } else if (this.isSelected(id)) {
      // 座席を指定済みの場合
      return 'reader.selectingCouchiiSeatsPassenger';
    } else if (!!this.selectedSeatInfoList && !!this.displayTargetSegmentId) {
      let selectedSeatInfo = this.selectedSeatInfoList.find((info) => info.segmentId === this.displayTargetSegmentId);
      let seatInfoPassenger = selectedSeatInfo?.passengerList?.find((passenger) => passenger.id === id);
      if (!!seatInfoPassenger?.seatNumber) {
        // 座席を指定済みの場合
        return 'reader.selectableCouchiiSeatsPassenger';
      }
    }
    // 座席未指定の場合
    return 'reader.selectableCouchiiSeatsPassenger';
  }

  /**
   * 席なし幼児の搭乗者IDからその名前を返却する関数
   * @param passengerId 搭乗者ID
   * @returns 席なし幼児の名前
   */
  public getInfantName(passengerId?: string) {
    return this._currentSeatmapService.getInfantName(passengerId) ?? '';
  }

  /**
   * 特定の搭乗者が座席選択変更不可かどうか
   * 以下のいずれかの条件を満たす：
   * 1.選択中の旅客に紐づくEMDが存在する
   * 2.他のカウチ席を登録済み
   * 3.他の有料席を登録済み
   *
   * @param passengerId 搭乗者ID
   * @returns 判定結果
   */
  public isUnchangeable(passengerId: string): boolean {
    if (!!this.displayTargetSegmentId) {
      let pnrSeat = !!this._getOrderStoreService.getOrderData.data?.seats?.[this.displayTargetSegmentId]?.[passengerId]
        ? this._getOrderStoreService.getOrderData.data?.seats?.[this.displayTargetSegmentId]?.[passengerId]
            ?.seatSelection.seatNumbers[0]
        : undefined;

      if (
        !!pnrSeat &&
        (this.seatInformationMap?.get(convertCouchSeatNumberToSeatNumberList(pnrSeat)?.[0] ?? '')?.isCouchSeat ||
          this.seatInformationMap?.get(convertCouchSeatNumberToSeatNumberList(pnrSeat)?.[0] ?? '')?.isChargeableAsrSeat)
      ) {
        return true;
      }

      if (!!this.seatNumber) {
        // 座席利用不可の場合
        const seatAvailabilityStatus = this.seatInformationMap
          ?.get(convertCouchSeatNumberToSeatNumberList(this.seatNumber)?.[0] ?? '')
          ?.travelers?.find((t) => t.id === passengerId)?.seatAvailabilityStatus;
        if (!!seatAvailabilityStatus && seatAvailabilityStatus !== 'available') {
          return true;
        }
      }

      // 選択中の旅客に紐づくカウチのEMDが存在する場合
      const hasCouchSeatEMD: boolean =
        this._getOrderStoreService.getOrderData.data?.seats?.[this.displayTargetSegmentId]?.[passengerId].seatSelection
          ?.hasCouchSeatEMD || false;
      if (hasCouchSeatEMD) {
        return true;
      }
    }
    return false;
  }

  /**
   * 申込中搭乗者IDリストを返す関数
   * @return 搭乗者IDリスト
   */
  private getApplyingPassengerIdList(): string[] {
    return Array.from(this.couchSeatAppliedPassengerList.entries())
      .filter(([_, applyInfo]) => applyInfo.isChecked)
      .flatMap((entry) => entry[0]);
  }

  /**
   * 特定の搭乗者が選択している座席番号を返す関数
   * @param passengerId 搭乗者ID
   * @return 座席番号
   */
  public getSeatNumber(passengerId: string): string | undefined {
    return this._currentSeatmapService.findSegmentPassengerSeatInfo(
      this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? '',
      passengerId
    )?.seatNumber;
  }
}
