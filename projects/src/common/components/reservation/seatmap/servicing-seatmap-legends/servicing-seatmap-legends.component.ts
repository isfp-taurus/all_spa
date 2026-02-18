import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { createLegendList } from '@common/helper/common/seatmap.helper';
import { SeatLegendDisplayInformation } from '@common/interfaces/servicing-seatmap';

@Component({
  selector: 'asw-servicing-seatmap-legends',
  templateUrl: './servicing-seatmap-legends.component.html',
  styleUrls: ['./servicing-seatmap-legends.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicingSeatmapLegendsComponent extends SupportComponent implements OnChanges {
  constructor(private _common: CommonLibService) {
    super(_common);
  }
  /** 表示対象セグメントのキャビン */
  @Input() cabin: string = '';

  /** 後ろ向き座席を含むかどうか */
  @Input() isContainedRearFacingSeat: boolean = false;

  /** 有料ASR席を含むかどうか */
  @Input() isContainedPaidAsrSeat: boolean = false;

  /** カウチ席を含むかどうか */
  @Input() isContainedCouchSeat: boolean = false;

  /** 凡例を表示するための情報のリスト */
  seatmapLegends: SeatLegendDisplayInformation[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    // 「表示対象セグメントのキャビン、後ろ向き座席を含むかどうか、有料ASR席を含むかどうか」のいずれかに変更があった場合、凡例リストを再生成する
    if (
      changes['cabin'] ||
      changes['isContainedRearFacingSeat'] ||
      changes['isContainedPaidAsrSeat'] ||
      changes['isContainedCouchSeat']
    ) {
      if (this.cabin) {
        const isEconomy = this.cabin === 'eco';
        this.seatmapLegends = createLegendList(
          this.isContainedRearFacingSeat,
          isEconomy,
          this.isContainedPaidAsrSeat,
          this.isContainedCouchSeat,
          false
        );
      }
    }
  }

  reload(): void {}
  init(): void {}
  destroy(): void {}
}
