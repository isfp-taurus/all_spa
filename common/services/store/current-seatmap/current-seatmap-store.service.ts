import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import {
  CurrentSeatmapStore,
  selectCurrentSeatmapState,
  updateCurrentSeatmap,
  setCurrentSeatmap,
  resetCurrentSeatmap,
  CurrentSeatmapState,
} from '@common/store';
import { SupportClass } from '@lib/components/support-class';
import { retrieveCurrentSeatmap, preserveCurrentSeatmap } from '../../../store/current-seatmap/current-seatmap.actions';
import { SeatForServicingSeatmapScreen, SeatInfoPassengers } from '@common/interfaces';
import { deepCopyArray } from '@common/helper';
import { distinctUntilChanged } from 'rxjs/operators';
import { convertCouchSeatNumberToSeatNumberList } from '@common/helper/common/seatmap.helper';

// TODO: CurrentSeatmap IF決定待ち（仮実装）
/**
 * CurrentSeatmap Storeを操作するService
 */
@Injectable()
export class CurrentSeatmapService extends SupportClass {
  destroy(): void {}
  private _CurrentSeatmap$: Observable<CurrentSeatmapState>;
  public CurrentSeatmapData: CurrentSeatmapState = { retrieve: {} };

  constructor(private _store: Store<CurrentSeatmapStore>) {
    super();
    this._CurrentSeatmap$ = this._store.pipe(
      select(selectCurrentSeatmapState),
      filter((data) => !!data)
    );
    this.subscribeService('CurrentSeatmapServiceData', this._CurrentSeatmap$, (data) => {
      this.CurrentSeatmapData = data;
    });
  }

  public getCurrentSeatmap$() {
    return this._CurrentSeatmap$;
  }

  public updateCurrentSeatmap(value: Partial<CurrentSeatmapState>) {
    this._store.dispatch(updateCurrentSeatmap(value));
  }

  public setCurrentSeatmap(value: CurrentSeatmapState) {
    this._store.dispatch(setCurrentSeatmap(value));
  }

  public resetCurrentSeatmap() {
    this._store.dispatch(resetCurrentSeatmap());
  }

  public retrieveCurrentSeatmap() {
    this._store.dispatch(retrieveCurrentSeatmap());
  }

  public preserveCurrentSeatmap() {
    this._store.dispatch(preserveCurrentSeatmap());
  }

  /**
   * 搭乗者順番番号を返す関数
   *
   * @param passengerId 搭乗者ID
   * @param segmentId セグメントID
   * @returns 搭乗者順番番号
   */
  public getPassengerIndex(passengerId: string, segmentId: string): number | undefined {
    const tempIndex = this.CurrentSeatmapData.selectedSeatInfoList
      ?.find((value) => value.segmentId === segmentId)
      ?.passengerList.findIndex((passenger) => passenger.id === passengerId);
    return tempIndex === -1 ? undefined : tempIndex;
  }

  /**
   * 搭乗者IDリストを取得する関数
   *
   * currentSeatmapStoreのpassengersの初期化が必要
   * @returns 搭乗者IDリスト
   */
  public getPassengerIdList(): string[] {
    return this.CurrentSeatmapData.selectedSeatInfoList?.[0]?.passengerList.flatMap((passenger) => passenger.id) ?? [];
  }

  /**
   * 特定の搭乗者が連れている席無し幼児の名前を返却する関数
   *
   * @param parentPassengerId 同伴搭乗者ID
   * @returns 席無し幼児の名前
   */
  public getInfantName(parentPassengerId?: string): string | undefined {
    return (
      parentPassengerId && (this.CurrentSeatmapData.passengers?.get(parentPassengerId)?.accompanyingInfant?.name ?? '')
    );
  }

  /**
   * 座席情報更新関数
   *
   * @param seatNumber 座席番号
   * @param seatInfo 更新内容
   */
  public updateSeatMap(seatNumber: string, seatInfo: Partial<SeatForServicingSeatmapScreen>) {
    const tempSeatMap = this.CurrentSeatmapData.seatmap;
    const seatBlockNumber = convertCouchSeatNumberToSeatNumberList(seatNumber);
    if (seatBlockNumber?.[0]) {
      const tempSeatmapInfo = this.CurrentSeatmapData.seatmap?.get(seatBlockNumber?.[0]);
      if (tempSeatmapInfo) {
        tempSeatMap?.set(seatNumber, {
          ...tempSeatmapInfo,
          ...seatInfo,
        });
      }
    }

    this.updateCurrentSeatmap({ seatmap: tempSeatMap });
  }

  /**
   * 選択中座席情報更新関数
   *
   * @param segmentId セグメントID
   * @param passengerIdList 搭乗者IDリスト
   * @param seatInfoPassenger 更新内容
   */
  public updateSelectedSeatInfo(
    segmentId: string,
    passengerIdList: string[],
    seatInfoPassenger: Partial<SeatInfoPassengers>
  ) {
    const selectedSeatInfo = this.CurrentSeatmapData.selectedSeatInfoList;
    let tempSeatInfo = deepCopyArray(selectedSeatInfo ?? []);
    const tempSegmentIndex = tempSeatInfo?.findIndex((seatInfo) => seatInfo.segmentId === segmentId);
    if (tempSeatInfo && tempSegmentIndex !== undefined && tempSegmentIndex !== -1) {
      const tempSeatInfoPaX = tempSeatInfo[tempSegmentIndex];
      passengerIdList.forEach((passengerId) => {
        const PaxIndex = tempSeatInfoPaX.passengerList.findIndex((passenger) => passenger.id === passengerId);
        if (PaxIndex !== -1) {
          const tempSeatInfoPaxPassenger = tempSeatInfo[tempSegmentIndex].passengerList[PaxIndex];
          tempSeatInfo[tempSegmentIndex].passengerList[PaxIndex] = {
            ...tempSeatInfoPaxPassenger,
            ...seatInfoPassenger,
            seatNumberList: seatInfoPassenger.seatNumber ? [{ seatNumber: seatInfoPassenger.seatNumber }] : undefined,
          };
        }
      });
    }

    if (tempSeatInfo && tempSeatInfo.length !== 0) {
      this.updateCurrentSeatmap({ selectedSeatInfoList: tempSeatInfo });
    } else {
      console.log('failed to update selectedSeatInfo');
    }
  }

  /**
   * 特定のセグメントの座席指定状態を取得する関数
   *
   * @param segmentId セグメントID
   * @return 特定のセグメントの座席指定状態
   */
  public findSegmentSeatInfo(segmentId?: string): SeatInfoPassengers[] | undefined {
    return this.CurrentSeatmapData.selectedSeatInfoList?.find((seatInfo) => seatInfo.segmentId === segmentId)
      ?.passengerList;
  }

  /**
   * 与えられたセグメントIDと搭乗者IDで座席指定状態を引く関数
   *
   * @param segmentId セグメントId
   * @param passengerId 搭乗者Id
   * @return 指定された搭乗者が当セグメントでの指定状態
   */
  public findSegmentPassengerSeatInfo(segmentId: string, passengerId?: string): SeatInfoPassengers | undefined {
    if (passengerId) {
      return this.findSegmentSeatInfo(segmentId)?.find((passenger) => passenger.id === passengerId);
    } else {
      return this.findSegmentSeatInfo(segmentId)?.find(
        (passenger) => passenger.id === this.CurrentSeatmapData.selectingPassengerId
      );
    }
  }

  /**
   * 座席番号から選択中座席情報を引く関数
   *
   * @param seatNumber 座席番号
   * @returns 選択中座席情報
   */
  public findSegmentPassengerSeatInfoFromSeatNumber(
    segmentId: string,
    seatNumber: string
  ): SeatInfoPassengers[] | undefined {
    return this.findSegmentSeatInfo(segmentId)?.filter((passenger) => passenger.seatNumber === seatNumber);
  }

  /**
   * 座席番号から座席情報を割り出す関数
   *
   * @param seatNumber 座席番号（36A または 36ABC形式）
   * @returns 座席情報
   */
  public findSeatInfoFromSeatNumber(seatNumber?: string): SeatForServicingSeatmapScreen[] | undefined {
    return convertCouchSeatNumberToSeatNumberList(seatNumber)?.map(
      (seatBlockNumber) => this.CurrentSeatmapData.seatmap?.get(seatBlockNumber) ?? {}
    );
  }

  /**
   * セグメント切り替え時ストア情報を流す関数
   *
   * @returns current seatmap store
   */
  public getSegmentDistinctCurrentSeatmap$(): Observable<CurrentSeatmapState> {
    return this.getCurrentSeatmap$().pipe(
      distinctUntilChanged(
        (prev, curr) =>
          prev.displayTargetSegmentArrayId === curr.displayTargetSegmentArrayId &&
          prev.displayTargetBoundArrayId === curr.displayTargetBoundArrayId
      ),
      filter((v) => v.displayTargetSegmentArrayId !== undefined)
    );
  }

  /**
   * 特定のセグメントにおいて座席の選択状態に変更があるかどうかを返却
   *
   * @param segmentId セグメントID
   * @returns 判定結果
   */
  public isSegmentSeatReservationStatusChanged(segmentId: string | undefined): boolean | undefined {
    return this.findSegmentSeatInfo(segmentId)?.some(
      (passenger) => passenger.seatNumber !== passenger.ssrInformation?.ssrSeatNumber
    );
  }
}
