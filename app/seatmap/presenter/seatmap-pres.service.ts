import { Injectable } from '@angular/core';
import { CurrentSeatmapService } from '@common/services';
import { SeatmapHelperService } from '@common/services/seatmap/seatmap-helper.service';
import { SupportClass } from '@lib/components/support-class';
import { convertCouchSeatNumberToSeatNumberList, splitCouchSeatNumber } from '@common/helper/common/seatmap.helper';
import { CommonLibService } from '@lib/services';

@Injectable()
export class SeatmapPresService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _seatmapHelperService: SeatmapHelperService,
    private _currentSeatmapService: CurrentSeatmapService
  ) {
    super();
  }

  /**
   * ストアにカウチ席選択情報を更新する処理
   */
  updateCurrentSeatmapCouchSeat(
    selectingPassengerIdList: string[] | undefined,
    specifiedAmount: number | undefined,
    seatNumber: string
  ) {
    // 各搭乗者直前選択シート情報取り消し
    selectingPassengerIdList?.forEach((passengerId) => {
      const prevSelectedSeatInfo = this._currentSeatmapService.findSegmentPassengerSeatInfo(
        this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? '',
        passengerId
      );
      if (prevSelectedSeatInfo?.seatNumber) {
        convertCouchSeatNumberToSeatNumberList(prevSelectedSeatInfo?.seatNumber)?.forEach((seatBlockNumber) => {
          if (
            this._currentSeatmapService.CurrentSeatmapData.seatmap?.get(seatBlockNumber)?.selectingPassengerID ===
            passengerId
          ) {
            this._currentSeatmapService.updateSeatMap(seatBlockNumber, {
              selectingPassengerID: '',
            });
          }
        });
      }
    });

    // 選択中カウチシート選択状態を更新
    convertCouchSeatNumberToSeatNumberList(seatNumber)?.forEach((seatBlockNumber, index) => {
      this._currentSeatmapService.updateSeatMap(seatBlockNumber, {
        selectingPassengerID: selectingPassengerIdList?.at(index),
      });
    });

    // 選択済み座席情報更新
    const selectedSeatInfoPassengerList = this._currentSeatmapService.findSegmentPassengerSeatInfoFromSeatNumber(
      this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? '',
      seatNumber
    );
    // すでにほかの搭乗者が選択されている場合、解除
    selectedSeatInfoPassengerList?.forEach((selectedSeatInfoPassenger) => {
      if (selectedSeatInfoPassenger?.seatNumber) {
        this._currentSeatmapService.updateSelectedSeatInfo(
          this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? '',
          [selectedSeatInfoPassenger.id ?? ''],
          {
            seatNumber: '',
            specifiedAmount: 0,
          }
        );
      }
    });

    // 選択した搭乗者の座席選択情報を更新
    selectingPassengerIdList?.forEach((passengerId) => {
      this._currentSeatmapService.updateSelectedSeatInfo(
        this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? '',
        [passengerId ?? ''],
        {
          seatNumber: seatNumber,
          specifiedAmount: specifiedAmount,
        }
      );
    });
  }

  /**
   * ストアに座席番号を更新する処理
   * @param seatNumber シート番号
   * @param specifiedAmount (省略可)指定金額
   */
  updateCurrentSeatmapNormalSeat(selectingPassengerId: string, seatNumber: string, specifiedAmount?: number) {
    // シートマップ情報更新
    const tempSeatInfoPassenger = this._currentSeatmapService.findSegmentPassengerSeatInfoFromSeatNumber(
      this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? '',
      seatNumber
    );
    // 直前選択シート情報取り消し
    const prevSelectedSeatInfo = this._currentSeatmapService.findSegmentPassengerSeatInfo(
      this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? '',
      selectingPassengerId
    );
    if (prevSelectedSeatInfo?.seatNumber) {
      convertCouchSeatNumberToSeatNumberList(prevSelectedSeatInfo?.seatNumber)?.forEach((seatBlockNumber) => {
        if (
          this._currentSeatmapService.CurrentSeatmapData.seatmap?.get(seatBlockNumber)?.selectingPassengerID ===
          selectingPassengerId
        ) {
          this._currentSeatmapService.updateSeatMap(seatBlockNumber, {
            selectingPassengerID: '',
          });
        }
      });
    }
    // すでにほかの搭乗者が選択されている場合、解除
    if (tempSeatInfoPassenger?.[0]?.seatNumber) {
      this._currentSeatmapService.updateSeatMap(tempSeatInfoPassenger?.[0].seatNumber ?? '', {
        selectingPassengerID: '',
      });
    }

    // 選択中シート情報を更新
    this._currentSeatmapService.updateSeatMap(seatNumber, {
      selectingPassengerID: this._currentSeatmapService.CurrentSeatmapData.selectingPassengerId,
    });

    // 選択済み座席情報更新
    // すでにほかの搭乗者が選択されている場合、解除
    if (tempSeatInfoPassenger?.[0]?.seatNumber) {
      this._currentSeatmapService.updateSelectedSeatInfo(
        this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? '',
        [tempSeatInfoPassenger?.[0]?.id ?? ''],
        {
          seatNumber: '',
          specifiedAmount: 0,
        }
      );
    }
    this._currentSeatmapService.updateSelectedSeatInfo(
      this._seatmapHelperService.getCurrentSelectedSegment()?.id ?? '',
      [this._currentSeatmapService.CurrentSeatmapData.selectingPassengerId ?? ''],
      { seatNumber: seatNumber, specifiedAmount: specifiedAmount }
    );
  }

  /**
   * テーブル隣接席かどうか
   * @param seatNumber 座席番号
   * @returns テーブル隣接席かどうか
   */
  public isNextToTable(seatNumber: string): boolean {
    const rowNumber = splitCouchSeatNumber(seatNumber).rowNumber;
    const columnNumbers = splitCouchSeatNumber(seatNumber).columnNumbers;
    const adjacentColumnNumbers = [
      ...new Set(columnNumbers?.map((char) => this.getAdjacentAlphabets(char) ?? '')?.flat()),
    ];
    return !!adjacentColumnNumbers.find((columnNumber) => {
      const adjacentSeatBlockNumber = rowNumber + columnNumber;
      return this._currentSeatmapService.CurrentSeatmapData.seatmap
        ?.get(adjacentSeatBlockNumber)
        ?.facilityCode?.includes('TA');
    });
  }

  /**
   * 隣接するアルファベットを返す関数
   * @param char アルファベット
   * @returns 隣接するアルファベットの配列
   */
  public getAdjacentAlphabets(char: string): string[] | undefined {
    if (char.length !== 1 || !/[A-Za-z]/.test(char)) {
      return undefined;
    }
    const charCode = char.charCodeAt(0);
    let prevChar = '';
    let nextChar = '';

    if (char === 'A') {
      nextChar = String.fromCharCode(charCode + 1);
    } else if (char === 'a') {
      nextChar = String.fromCharCode(charCode + 1);
    } else if (char === 'Z') {
      prevChar = String.fromCharCode(charCode - 1);
    } else if (char === 'z') {
      prevChar = String.fromCharCode(charCode - 1);
    } else {
      prevChar = String.fromCharCode(charCode - 1);
      nextChar = String.fromCharCode(charCode + 1);
    }

    return [prevChar, nextChar].filter((c) => c !== '');
  }

  /**
   * 事前座席指定を許可されているマーケティングキャリアコードかどうか
   * @param marketingAirlineCode
   * @returns true：判定対象コードは許可されている、false：許可されていない
   */
  public isAdvanceSeatReservationsAvailable(marketingAirlineCode: string): boolean {
    let propVal = this._common.aswMasterService.getMPropertyByKey('seatMap', 'marketingCarrierCode.allow.asr');

    return propVal === marketingAirlineCode;
  }

  init() {}
  destroy(): void {}
}
