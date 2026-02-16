import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { AppConstants } from '@conf/app.constants';

@Component({
  selector: 'asw-seatmap-facility',
  templateUrl: './seatmap-facility.component.html',
  styleUrls: ['./seatmap-facility.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeatmapFacilityComponent extends SupportComponent {
  public readonly availableFacility: string[] = ['LA', 'GF', 'GN', 'BA', 'ST'];

  /** 設備コード */
  @Input() set codes(value: string[] | undefined) {
    this._codes = value ?? [];
    this.reload();
  }
  get codes(): string[] {
    return this._codes;
  }
  private _codes: string[] = [];

  /** 列数 */
  @Input() set numberOfColumn(value: number | undefined) {
    this._numberOfColumn = value;
    this.reload();
  }
  get numberOfColumn(): number | undefined {
    return this._numberOfColumn;
  }
  private _numberOfColumn: number | undefined;

  // 適用されるhtmlクラス名
  public htmlClass: string = 'p-seatmap__facility';
  public class: string = '';

  /** 画像ファイルパス定数用 */
  public appConstants = AppConstants;

  reload(): void {
    if (this.codes && this.numberOfColumn) {
      this.htmlClass += ' ' + `p-seatmap__facility--${Math.floor(this.numberOfColumn / this.codes.length)}col`;
    }
  }
  init(): void {}
  destroy(): void {}
}
