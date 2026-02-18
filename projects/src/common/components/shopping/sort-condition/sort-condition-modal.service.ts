import { Injectable } from '@angular/core';
import { RoundtripOwdState } from '@common/store/roundtrip-owd';
import { ModalType } from '@lib/components';
import { SupportClass } from '@lib/components/support-class';
import { ModalService, ModalBlockParts } from '@lib/services';
import { Subject } from 'rxjs/internal/Subject';
import { SortConditionModalComponent } from './sort-condition-modal.component';
import { SortCondition, SortConditionData, SortConditionInput, SortConditionOutput } from './sort-condition.state';

@Injectable()
export class SortConditionModalService extends SupportClass {
  constructor(public _modalService: ModalService) {
    super();
    this._modalBlockParts = this._modalService.defaultBlockPart(SortConditionModalComponent);
    this._modalBlockParts.closeBackEnable = true;
    this._modalBlockParts.type = ModalType.TYPE3;
    this._subject = new Subject<SortConditionOutput>();
  }

  destroy(): void {}

  private _modalBlockParts: ModalBlockParts;

  private _subject!: Subject<SortConditionOutput>;

  public asObservableSubject() {
    return this._subject.asObservable();
  }

  /** モーダルの表示 */
  public openModal(data: SortConditionData | null) {
    const input_data: SortConditionInput = {
      data: data,
      subject: this._subject,
    };
    /** ペイロードを介して引数を渡す */
    this._modalBlockParts.payload = input_data;
    /** モーダルの表示 */
    this._modalService.showSubModal(this._modalBlockParts);
  }

  /**
   * ソート条件より、TS情報の並び順を更新する
   * @param SortCondition
   * @param RoundtripOwdState
   */
  public updateTravelSolutionsBySortCondition(value: SortCondition, data: RoundtripOwdState) {
    let response: RoundtripOwdState = JSON.parse(JSON.stringify(data));
    // ソート条件よりTS情報の並び順を昇順にする
    switch (value) {
      // CPDランクソートボタン押下時sort処理
      case SortCondition.CPD_RANK:
        response.data?.roundtripBounds?.forEach((roundtripBounds) => {
          roundtripBounds.travelSolutions?.sort((a, b) => {
            if (a.travelSolutionId && b.travelSolutionId) {
              return Number(a.travelSolutionId.substring(1)) - Number(b.travelSolutionId.substring(1));
            }
            if (a.travelSolutionId) {
              return -1;
            }
            if (b.travelSolutionId) {
              return 1;
            }
            return 0;
          });
        });
        break;
      // 出発時刻ソートボタン押下時sort処理
      case SortCondition.DEPARTURE_TIME:
        response.data?.roundtripBounds?.forEach((roundtripBounds) => {
          roundtripBounds.travelSolutions?.sort((a, b) => {
            if (a.originDepartureDateTime && b.originDepartureDateTime) {
              const aDate = new Date(a.originDepartureDateTime).getTime();
              const bDate = new Date(b.originDepartureDateTime).getTime();
              return aDate - bDate;
            }
            if (a.originDepartureDateTime) {
              return -1;
            }
            if (b.originDepartureDateTime) {
              return 1;
            }
            return 0;
          });
        });
        break;
      // 到着時刻ソートボタン押下時sort処理
      case SortCondition.ARRIVAL_TIME:
        response.data?.roundtripBounds?.forEach((roundtripBounds) => {
          roundtripBounds.travelSolutions?.sort((a, b) => {
            if (a.destinationArrivalDateTime && b.destinationArrivalDateTime) {
              const aDate = new Date(a.destinationArrivalDateTime).getTime();
              const bDate = new Date(b.destinationArrivalDateTime).getTime();
              return aDate - bDate;
            }
            if (a.destinationArrivalDateTime) {
              return -1;
            }
            if (b.destinationArrivalDateTime) {
              return 1;
            }
            return 0;
          });
        });
        break;
      // 総所要時間ソートボタン押下時sort処理
      case SortCondition.DURATION:
        response.data?.roundtripBounds?.forEach((roundtripBounds) => {
          roundtripBounds.travelSolutions?.sort((a, b) => {
            if (a.duration && b.duration) {
              return a.duration - b.duration;
            }
            if (a.duration) {
              return -1;
            }
            if (b.duration) {
              return 1;
            }
            return 0;
          });
        });
        break;
      default:
        break;
    }
    return response;
  }
}
