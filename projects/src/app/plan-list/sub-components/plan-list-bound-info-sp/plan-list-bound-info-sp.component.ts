import { Component, Input } from '@angular/core';
import { PlanListBoundReturn } from '@common/interfaces';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

/**
 * plan-list-bound-info-sp
 * バウンド情報(SP版)
 */
@Component({
  selector: 'asw-plan-list-bound-info-sp',
  templateUrl: './plan-list-bound-info-sp.component.html',
  styleUrls: ['plan-list-bound-info-sp.component.scss'],
  providers: [],
})
export class PlanListBoundInfoSpComponent extends SupportComponent {
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
