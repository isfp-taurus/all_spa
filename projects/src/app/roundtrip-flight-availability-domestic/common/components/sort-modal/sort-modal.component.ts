import { OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ModalType, BaseModalComponent } from '../base-modal/base-modal.component';
import { SortOption, SortOrder } from '../../interfaces';

/** 静的文言鍵 */
const TRANSLATE_KEY = {
  RECOMMENDED: 'label.recommendedOrder',
  DEPARTURE_TIME_ORDER: 'label.departureTimeOrder',
  ARRIVAL_TIME_ORDER: 'label.arrivalTimeOrder',
  FLIGHT_DURATION_ORDER: 'label.flightDurationOrder',
  SORT_DISPLAY_TITLE: 'label.sortDisplay.title',
};

/** モーダル種別 */
const MODAL_TYPE = '03';

/**
 * ソート条件モーダルComponent
 */
@Component({
  selector: 'asw-sort-modal',
  templateUrl: './sort-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortModalComponent {
  /**
   * overlayRef
   */
  public overlayRef?: OverlayRef;

  /**
   * タイトル
   */
  public title = TRANSLATE_KEY.SORT_DISPLAY_TITLE;

  /**
   * モーダル種別
   */
  public modalType: ModalType = MODAL_TYPE;

  /**
   * focus要素
   */
  public focusElement?: any;

  /**
   * ソート種別
   */
  public sortOrder?: SortOrder;

  /**
   * ソートオプション
   */
  public sortOptions: Array<SortOption> = [
    {
      sortName: TRANSLATE_KEY.RECOMMENDED,
      sortOrder: SortOrder.RECCOMENDED,
    },
    {
      sortName: TRANSLATE_KEY.DEPARTURE_TIME_ORDER,
      sortOrder: SortOrder.DEPARTURE_TIME,
    },
    {
      sortName: TRANSLATE_KEY.ARRIVAL_TIME_ORDER,
      sortOrder: SortOrder.ARRIVAL_TIME,
    },
    {
      sortName: TRANSLATE_KEY.FLIGHT_DURATION_ORDER,
      sortOrder: SortOrder.FIGHT_DURATION,
    },
  ];

  @ViewChild(BaseModalComponent)
  public baseModal!: BaseModalComponent;

  @Output()
  public buttonClick$: EventEmitter<SortOption> = new EventEmitter<SortOption>();

  /**
   * ソートボタン押下処理
   * @param option ソートオプション
   */
  public sort(option: SortOption) {
    this.buttonClick$.emit(option);
  }

  /**
   * モーダルを閉じる
   */
  public close() {
    this.baseModal.close();
  }
}
