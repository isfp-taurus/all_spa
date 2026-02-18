import { Component, Input } from '@angular/core';
import { PlanListBoundReturn } from '@common/interfaces';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

/**
 * plan-list-bound-info
 * バウンド情報
 */
@Component({
  selector: 'asw-plan-list-bound-info',
  templateUrl: './plan-list-bound-info.component.html',
  styleUrls: ['plan-list-bound-info.component.scss'],
  providers: [],
})
export class PlanListBoundInfoComponent extends SupportComponent {
  /* 表示用プランリスト */
  @Input()
  public boundList: Array<PlanListBoundReturn> = [];
  /* 表示用プランリスト */
  @Input()
  public isValid: boolean = false;

  constructor(private _common: CommonLibService) {
    super(_common);
  }

  init(): void {}
  reload(): void {}
  destroy(): void {}
}
