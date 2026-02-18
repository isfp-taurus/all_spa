import { Component } from '@angular/core';
import { CommonLibService } from '@lib/services';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { SortCondition, SortConditionOutput, sortConditionValueMap } from './sort-condition.state';
import { Subject } from 'rxjs/internal/Subject';

@Component({
  selector: 'asw-sort-condition-modal',
  templateUrl: './sort-condition-modal.component.html',
})
export class SortConditionModalComponent extends SupportModalBlockComponent {
  reload(): void {}
  init(): void {
    if (this.payload && this.payload.data && this.payload.data.selectedSortCondition) {
      this.selectedSortCondition = this.payload.data.selectedSortCondition;
    } else {
      this.selectedSortCondition = SortCondition.CPD_RANK;
    }
    this.subject = this.payload.subject;
    let pageId = this.common.aswCommonStoreService.getPageId();

    if (pageId === 'P034') {
      //リストに追加
      this._itemList = [
        { value: SortCondition.CPD_RANK, label: sortConditionValueMap.get(SortCondition.CPD_RANK)?.label! },
        {
          value: SortCondition.PriceDifference,
          label: sortConditionValueMap.get(SortCondition.PriceDifference)?.label!,
        },
        { value: SortCondition.DEPARTURE_TIME, label: sortConditionValueMap.get(SortCondition.DEPARTURE_TIME)?.label! },
        { value: SortCondition.ARRIVAL_TIME, label: sortConditionValueMap.get(SortCondition.ARRIVAL_TIME)?.label! },
        { value: SortCondition.DURATION, label: sortConditionValueMap.get(SortCondition.DURATION)?.label! },
      ];
    } else if (pageId === 'P030') {
      //リストに追加
      this._itemList = [
        { value: SortCondition.CPD_RANK, label: sortConditionValueMap.get(SortCondition.CPD_RANK)?.label! },
        { value: SortCondition.DEPARTURE_TIME, label: sortConditionValueMap.get(SortCondition.DEPARTURE_TIME)?.label! },
        { value: SortCondition.ARRIVAL_TIME, label: sortConditionValueMap.get(SortCondition.ARRIVAL_TIME)?.label! },
        { value: SortCondition.DURATION, label: sortConditionValueMap.get(SortCondition.DURATION)?.label! },
      ];
    }
  }
  destroy(): void {}

  /** 選択中のソート条件 */
  public selectedSortCondition!: SortCondition;

  /** モーダル外部にデータを渡すSubject */
  private subject!: Subject<SortConditionOutput>;

  /** ソート条件リスト */
  private _itemList: Array<{
    value: SortCondition;
    label: string;
  }> = [];

  public get itemList() {
    return this._itemList;
  }

  constructor(private common: CommonLibService) {
    super(common);
  }

  /** モーダルを閉じる */
  closeModal() {
    this.close();
  }

  /** ソート条件を呼び出し元に返してモーダルを閉じる */
  public applyModal(data: SortCondition) {
    this.subject.next({
      selectedSortCondition: data,
    });
    this.closeModal();
  }

  /** モーダルの選択をキャンセルして閉じる */
  cancelModal() {
    this.closeModal();
  }
}
