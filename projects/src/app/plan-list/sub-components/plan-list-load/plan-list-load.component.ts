import { Component } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

/**
 * plan-list-plan-load
 * 遅延ロード
 */
@Component({
  selector: 'asw-plan-list-load',
  templateUrl: './plan-list-load.component.html',
  styleUrls: ['./plan-list-load.component.scss'],
  providers: [],
})
export class PlanListLoadComponent extends SupportComponent {
  constructor(_common: CommonLibService) {
    super(_common);
  }

  /* 繰り返し指定回数 */
  loop_bound: number = 2;
  /* 繰り返し指定回数 */
  loop_list: number = 4;
  /* 指定回数用配列 */
  arrayNumberLength(number: number): Array<number> {
    return [...Array(number)];
  }

  init(): void {}
  reload(): void {}
  destroy(): void {}
}
