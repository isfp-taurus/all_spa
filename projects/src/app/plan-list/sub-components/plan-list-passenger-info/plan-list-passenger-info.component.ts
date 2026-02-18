import { Component, Input } from '@angular/core';
import { PlanListNumPerType } from '@common/interfaces';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

/**
 * plan-list-passenger-info
 * 有料サービスサマリ
 */
@Component({
  selector: 'asw-plan-list-passenger-info',
  templateUrl: './plan-list-passenger-info.component.html',
  styleUrls: ['plan-list-passenger-info.component.scss'],
  providers: [],
})
export class PlanListPassengerInfoComponent extends SupportComponent {
  /* 当該プラン有効/無効 */
  @Input()
  public isValid: boolean = false;
  /* 搭乗者人数差分 */
  @Input()
  public diffPassenger: boolean = false;
  /* 最新搭乗者 */
  @Input()
  public curPassenger: PlanListNumPerType = {};
  /* 登録時搭乗者 */
  @Input()
  public prePassenger: PlanListNumPerType = {};

  /* 大人 */
  ADT: number = 0;
  /* ヤングアダルト */
  B15: number = 0;
  /* 小児 */
  CHD: number = 0;
  /* 幼児 */
  INF: number = 0;

  constructor(private _common: CommonLibService) {
    super(_common);
  }

  init(): void {
    if (this.isValid) {
      this.ADT = this.curPassenger.ADT ? this.curPassenger.ADT : this.prePassenger.ADT ?? 0;
      this.B15 = this.curPassenger.B15 ? this.curPassenger.B15 : this.prePassenger.B15 ?? 0;
      this.CHD = this.curPassenger.CHD ? this.curPassenger.CHD : this.prePassenger.CHD ?? 0;
      this.INF = this.curPassenger.INF ? this.curPassenger.INF : this.prePassenger.INF ?? 0;
    } else {
      this.ADT = this.prePassenger.ADT ?? 0;
      this.B15 = this.prePassenger.B15 ?? 0;
      this.CHD = this.prePassenger.CHD ?? 0;
      this.INF = this.prePassenger.INF ?? 0;
    }
  }
  reload(): void {}
  destroy(): void {}
}
