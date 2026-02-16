import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FlightDetailHeader,
  FlightDetailSegment,
} from '@app/roundtrip-flight-availability-international/presenter/roundtrip-flight-availability-international-pres.state';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { DateFormatModule } from '@lib/pipes';
import { CommonLibService } from '@lib/services';
import { FlightDetailModule } from './flight-detail.module';
import { StaticMsgModule } from '@lib/pipes';

/**
 * フライト詳細部をモーダルで開くためのコンポーネント
 * 共通部品のmodalServiceで呼び出しでインスタンス作成のため
 * payloadで値渡し かつ スタンドアロンコンポーネントとする
 *
 * @param payload : FlightSummary(フライトサマリ部描画用データ)
 * */
@Component({
  standalone: true,
  selector: 'asw-flight-detail-modal',
  templateUrl: './flight-detail-modal.component.html',
  imports: [CommonModule, StaticMsgModule, FlightDetailModule, DateFormatModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightDetailModalComponent extends SupportModalBlockComponent {
  /** フライト詳細ヘッダ */
  public flightDetailHeader!: FlightDetailHeader;
  /** フライト詳細セグメント */
  public flightDetailSegment!: FlightDetailSegment[];

  constructor(protected _common: CommonLibService) {
    super(_common);
  }

  reload(): void {}

  init(): void {
    /** 呼び出し元からフライト詳細ヘッダを受け取る */
    this.flightDetailHeader = this.payload.flightDetailHeader;
    this.flightDetailSegment = this.payload.flightDetailSegment;
    //モーダル内部品の高さを再設定して、スクロールに対応させる
    this.resize();
  }

  destroy(): void {}

  /** モーダル内の部品イベントでモーダルを閉じる */
  public closeModal() {
    this.close();
  }

  /**
   * 時間、時刻の日付文字列
   *
   * @param data 時間/時刻
   * @returns
   */
  public dateString(data: string | undefined): string {
    const date = Number(data);
    const hours = String(Math.trunc(date / 3600)).padStart(2, '0');
    const min = String(Math.trunc((date % 3600) / 60)).padStart(2, '0');
    return hours + ':' + min;
  }
}
