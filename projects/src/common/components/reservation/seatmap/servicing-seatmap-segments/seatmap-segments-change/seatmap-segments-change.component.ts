import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { GetOrderResponseData, Type1 } from 'src/sdk-servicing';
import { AppConstants } from '@conf/app.constants';

@Component({
  selector: 'asw-seatmap-segments-change',
  templateUrl: './seatmap-segments-change.component.html',
  styleUrls: ['./seatmap-segments-change.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeatmapSegmentsChangeComponent extends SupportComponent {
  /** 全セグメント情報 */
  @Input() allSegmentInfo?: Array<Type1>;

  /** 表示対象セグメントID */
  @Input() displayTargetSegmentId?: string;

  /** PNR情報 */
  @Input() pnrInfo?: GetOrderResponseData;

  @Output() clickSegment = new EventEmitter<string>();

  /** 画像ファイルパス定数用 */
  public appConstants = AppConstants;

  reload(): void {}
  init(): void {}
  destroy(): void {}

  /**
   * セグメントのクリックイベント
   * @param segmentId セグメントID
   */
  onClickSegment(segmentId?: string) {
    if (!!segmentId) {
      //選択中セグメント・スキップセグメントは押下不可にする
      if (this.displayTargetSegmentId === segmentId || !this.isEligible(segmentId)) {
        return;
      } else {
        this.clickSegment.emit(segmentId);
      }
    }
  }

  /**
   * 特定のセグメントが座席申込できるかどうか判定
   * @param segmentId セグメントID
   * @returns 判定結果
   */
  isEligible(segmentId?: string): boolean | undefined {
    return this.pnrInfo?.orderEligibilities?.seatmap?.[segmentId || '']?.isEligible;
  }

  /**
   * ngStyleで動的に背景画像をバインド
   */
  getBackgroundImage() {
    return `url(${this.appConstants.IMG.R01_P070_S01_U__SEGMENTS__ICON_CHECK_PRIMARY_20})`;
  }
}
