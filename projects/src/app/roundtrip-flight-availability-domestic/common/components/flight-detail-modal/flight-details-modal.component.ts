import { OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { BaseModalComponent, ModalType } from '../base-modal/base-modal.component';
import { RoundtripFppItemBoundDetailsDataType } from '../../sdk';
import { getFormatHourTime } from '../../helpers';
import { AirBounDisplayType } from '../../interfaces';

/** 静的文言鍵 */
const TRANSLATE_KEY = {
  TITLE: 'label.flghtDetails.title',
};

/**
 * フライト詳細モーダルComponent
 */
@Component({
  selector: 'asw-flight-details-modal',
  templateUrl: './flight-details-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightDetailsModalComponent {
  /**
   * overlayRef
   */
  public overlayRef?: OverlayRef;

  /**
   * タイトル
   */
  public title = TRANSLATE_KEY.TITLE;

  /**
   * モーダル種別
   */
  public modalType: ModalType = '04';

  /**
   * フッタ有無
   */
  public hasFooter = false;

  /**
   * AirBound表示タイプ
   */
  public airBoundInfo?: Array<AirBounDisplayType>;

  /**
   * focus要素
   */
  public focusElement?: any;

  /**
   * バウンド
   */
  public bound?: RoundtripFppItemBoundDetailsDataType;

  /**
   * ACVに設定されたキャビンクラス
   */
  public acvCabinClass?: string;

  @ViewChild(BaseModalComponent)
  public baseModal!: BaseModalComponent;

  @Output()
  public buttonClick$: EventEmitter<void> = new EventEmitter<void>();

  /**
   * 所要時間（日付フォーマット部品取り込み待ち）
   * @returns
   */
  public getSegmentRequiredTime(): string {
    if (this.bound?.duration) {
      return getFormatHourTime(this.bound.duration);
    }
    return '';
  }

  /**
   * セグメント情報
   * @returns
   */
  public get segments() {
    return (this.bound as any).flights || (this.bound as RoundtripFppItemBoundDetailsDataType).segments;
  }
}
