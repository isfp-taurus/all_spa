import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { PassengerForServicingSeatmapScreen } from '@common/interfaces/reservation/current-seatmap/passenger-for-seatmap-screen';
import { Router } from '@angular/router';
import { GetOrderResponseData } from 'src/sdk-servicing';
import { ListDataAllData } from '@common/interfaces/master/ListDataAllData';
import { MasterStoreKey, MASTER_TABLE } from '@conf/asw-master.config';
import { ChildSeatRequestInfo, SeatInfo } from '@common/interfaces';
import { GetOrderStoreService } from '@common/services';
import { CurrentSeatmapService } from '@common/services';
import { NotSelectableChildSeatInfo } from '@common/interfaces/reservation/current-seatmap';
import { childSeatModalSelectionStatus } from './servicing-seatmap-select-child-seat-modal-passenger/servicing-seatmap-select-child-seat-modal-passenger.state';
import { UpdateSeatsChildSeatsInner } from '@common/interfaces/servicing-seatmap';
import { SeatmapHelperService } from '@common/services/seatmap/seatmap-helper.service';

@Component({
  selector: 'asw-servicing-seatmap-select-child-seat-modal',
  templateUrl: './servicing-seatmap-select-child-seat-modal.component.html',
  styleUrls: ['./servicing-seatmap-select-child-seat-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicingSeatmapSelectChildSeatModalComponent extends SupportModalBlockComponent {
  /** チャイルドシート申込情報 */
  applyingStatusMap = new Map<string, boolean>();

  /** チャイルドの搭乗者IDリスト */
  childIdList: string[] = [];

  /** PNR情報 */
  pnrInfo?: GetOrderResponseData;

  /** 選択中座席情報 */
  selectingSeatInfo?: SeatInfo[] = [];

  /** 選択不可搭乗者リスト */
  notSelectableChildSeatInfoMap = new Map<string, NotSelectableChildSeatInfo>();

  /** 変更前チャイルドシート申込リスト */
  originalChildSeatAppliedList: ChildSeatRequestInfo[] = [];

  /** 変更後チャイルドシート申込リスト */
  childSeatAppliedList: ChildSeatRequestInfo[] = [];

  /** チャイルドシート種類 */
  childSeatTypes?: Array<ListDataAllData>;

  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _currentSeatmapService: CurrentSeatmapService,
    private _seatmapHelperService: SeatmapHelperService,
    private _getOrderStoreService: GetOrderStoreService,
    private _changeDetector: ChangeDetectorRef
  ) {
    super(_common);
  }

  init(): void {
    // チェックインシートマップ画面にてStoreに格納された、搭乗者情報リストと座席情報マップを受け取り、各種変数の初期化
    this.subscribeService(
      'ServicingSeatmapSelectChildSeatModalComponent-init',
      this._common.aswMasterService.load(
        [{ key: MasterStoreKey.LISTDATA_ALL, fileName: MASTER_TABLE.LISTDATA_ALL.fileName }],
        true
      ),
      ([listDatas]) => {
        this.selectingSeatInfo = this._currentSeatmapService.CurrentSeatmapData.selectedSeatInfoList;
        this.pnrInfo = this._getOrderStoreService.getOrderData.data;
        this.originalChildSeatAppliedList = this._currentSeatmapService.CurrentSeatmapData.childSeatAppliedList ?? [];
        this.childSeatAppliedList = this.originalChildSeatAppliedList;
        console.log(this.originalChildSeatAppliedList);

        // チャイルドシートの選択対象となる搭乗者情報の抽出
        // 搭乗者種別が小児、席あり幼児、または搭乗者種別不明(搭乗者種別が大人、かつ幼児情報不明)の搭乗者が存在する場合
        this._currentSeatmapService.CurrentSeatmapData.passengers?.forEach((passenger, passengerId) => {
          if (
            passenger.passengerTypeCode === 'CHD' ||
            passenger.passengerTypeCode === 'INS' ||
            (passenger.passengerTypeCode === 'ADT' && !!passenger.hasNamelessInfant)
          ) {
            this.childIdList.push(passengerId);
            this.childSeatAppliedList = [
              ...this.childSeatAppliedList,
              { childSeatType: '', passengerId: passengerId, updateCategory: '' },
            ];
          }
        });

        // チャイルドシート種類取得
        if (listDatas) {
          this.childSeatTypes = (listDatas as Array<ListDataAllData>).filter(
            (data) =>
              data.data_code === 'PD_021' && data.lang === this._common.aswContextStoreService.aswContextData.lang
          );
        }
        this._changeDetector.markForCheck();
      }
    );

    // URL変化時に自動でモーダルが閉じられるように修正
    this.closeWithUrlChange(this._router);
  }

  reload(): void {}

  destroy(): void {}

  /**
   * チャイルドシートチェックボックス状態変更時時処理
   * @param value 選択状態
   */
  public checkboxChange(value: childSeatModalSelectionStatus) {
    this.applyingStatusMap?.set(value.passengerId, value.isChecked ?? false);
    this.childSeatAppliedList = this.childSeatAppliedList?.map((requestInfo) => {
      if (requestInfo.passengerId === value.passengerId) {
        return { ...requestInfo, childSeatType: value.seatType ?? '' };
      } else {
        return { ...requestInfo };
      }
    });
  }

  /**
   * チャイルドシート種別変更時処理
   * @param value チャイルドシート種別
   */
  public seatTypeChange(value: childSeatModalSelectionStatus) {
    this.childSeatAppliedList = this.childSeatAppliedList?.map((requestInfo) => {
      if (requestInfo.passengerId === value.passengerId) {
        return { ...requestInfo, childSeatType: value.seatType ?? '' };
      } else {
        return { ...requestInfo };
      }
    });
  }

  /**
   * 適用ボタンクリックイベント
   */
  public onApply() {
    const selectingSeatInfoPassengerList = this.selectingSeatInfo?.find(
      (seatInfo) => seatInfo.segmentId === this._seatmapHelperService.getCurrentSelectedSegment()?.id
    )?.passengerList;
    const currentSegment =
      this.pnrInfo?.air?.bounds?.[this._currentSeatmapService.CurrentSeatmapData.displayTargetBoundArrayId ?? 0]
        .flights?.[this._currentSeatmapService.CurrentSeatmapData.displayTargetSegmentArrayId ?? 0];

    if (!!this.pnrInfo?.air?.bounds) {
      // 1	チャイルドシート選択可否判定処理として、以下の処理を行う。
      // ＜以下、画面.チャイルドシート選択搭乗者リスト(以下、チャイルドシート選択搭乗者とする)の要素数分、繰り返し＞
      let appliedChildSeatRequestInfo: ChildSeatRequestInfo[] = [];
      for (let childId of this.childIdList) {
        // チャイルドシートが選択されているかつ当該座席が装着不能席の場合
        const seatInfoPassenger = selectingSeatInfoPassengerList?.find((passenger) => passenger.id === childId);
        const passengerId = seatInfoPassenger?.id;

        if (
          this.applyingStatusMap?.get(childId) &&
          seatInfoPassenger?.seatNumber &&
          !this._currentSeatmapService
            .findSeatInfoFromSeatNumber(seatInfoPassenger?.seatNumber)
            ?.find((seatInfo) => seatInfo.isChildSeatAttachable)
        ) {
          // チャイルドシート選択不可情報リストに、チャイルドシート選択搭乗者.当該搭乗者IDをキーとして、当所巣や別茶いるデオシート選択不可情報をマップ形式で以下を追加する。
          if (passengerId) {
            this.notSelectableChildSeatInfoMap.set(passengerId, <NotSelectableChildSeatInfo>{
              segmentId: this._seatmapHelperService.getCurrentSelectedSegment()?.id,
              departureAirportCode: currentSegment?.departure?.locationCode,
              departureSurrogateName: currentSegment?.departure?.locationName,
              arrivalAirportCode: currentSegment?.arrival?.locationCode,
              arrivalSurrogateName: currentSegment?.arrival?.locationName,
              seatNumber: seatInfoPassenger.seatNumber,
            });
          }
        } else {
          // チャイルドシート選択内容更新処理
          // 適用後チャイルドシート申し込み数
          let appliedChildSeatCount = 0;

          const passengerId = childId;
          const seatRequestInfo = this.getDisplayChildRequestInfo(childId);
          // チェックしていてなおかつシートを選択している
          if (this.applyingStatusMap?.get(childId) && !!seatRequestInfo?.childSeatType) {
            appliedChildSeatRequestInfo.push({
              passengerId: passengerId,
              childSeatType: seatRequestInfo?.childSeatType ?? '',
              updateCategory: UpdateSeatsChildSeatsInner.OperationEnum.Request,
            });

            this.applyingStatusMap?.set(passengerId, true);

            appliedChildSeatCount++;
            // チェックを外したもしくはチェックしていてシートを選択していない
          } else {
            appliedChildSeatRequestInfo.push({
              passengerId: passengerId,
              childSeatType: '',
              updateCategory: UpdateSeatsChildSeatsInner.OperationEnum.Cancel,
            });
          }
        }
      }

      if (this.notSelectableChildSeatInfoMap.size) {
        this._currentSeatmapService.updateCurrentSeatmap({
          notSelectableChildSeatInfoMap: this.notSelectableChildSeatInfoMap,
        });
      } else {
        // チャイルドシート選択不可である搭乗者が存在しない場合、チャイルドシート選択後の搭乗者情報とチャイルドシート申し込み数を更新してモーダルを閉じる
        this._currentSeatmapService.updateCurrentSeatmap({
          childSeatAppliedList: appliedChildSeatRequestInfo,
        });
      }
      this.close();
    }
  }

  /**
   * 特定の搭乗者のリクエスト情報を返却する関数
   * @param passengerId 搭乗者ID
   * @returns 特定の搭乗者のリクエスト情報
   */
  getDisplayChildRequestInfo(passengerId: string): ChildSeatRequestInfo | undefined {
    return this.childSeatAppliedList?.find((value) => value.passengerId === passengerId);
  }

  /**
   * 特定の搭乗者の初期リクエスト情報を返却する関数
   * @param passengerId 搭乗者ID
   * @returns 特定の搭乗者の初期リクエスト情報
   */
  getOriginalDisplayChildRequestInfo(passengerId: string): ChildSeatRequestInfo | undefined {
    return this.originalChildSeatAppliedList?.find((value) => value.passengerId === passengerId);
  }

  /**
   * 搭乗者が選択している座席の番号を返却する関数
   * @param passengerId 搭乗者ID
   * @returns 当該搭乗者が選択している座席の番号
   */
  public getSeatNumber(passengerId: string): string | undefined {
    return this._currentSeatmapService.findSegmentPassengerSeatInfo(
      this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? '',
      passengerId
    )?.seatNumber;
  }
}
