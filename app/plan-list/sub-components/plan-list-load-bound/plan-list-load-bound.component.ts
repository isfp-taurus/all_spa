import { Component } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

/**
 * plan-list-plan-load
 * 遅延ロード
 */
@Component({
  selector: 'asw-plan-list-load-bound',
  templateUrl: './plan-list-load-bound.component.html',
  styleUrls: ['./plan-list-load-bound.component.scss'],
  providers: [],
})
export class PlanListLoadBoundComponent extends SupportComponent {
  constructor(_common: CommonLibService) {
    super(_common);
  }

  /* 繰り返し指定回数 */
  loop_bound: number = 2;
  /* 指定回数用配列 */
  arrayNumberLength(number: number): Array<number> {
    return [...Array(number)];
  }

  init(): void {}
  reload(): void {}
  destroy(): void {}
}
