import { Component, Input } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

/**
 * plan-list-bound-service
 * 有料サービスサマリ
 */
@Component({
  selector: 'asw-plan-list-bound-service',
  templateUrl: './plan-list-bound-service.component.html',
  styleUrls: ['./plan-list-bound-service.component.scss'],
  providers: [],
})
export class PlanListBoundServiceComponent extends SupportComponent {
  /* 当該プラン有効/無効 */
  @Input()
  public isValid: boolean = false;
  /* 当該バウンド_手荷物 */
  @Input()
  public isBaggage: boolean = false;
  /* 当該バウンド_ラウンジ */
  @Input()
  public isLounge: boolean = false;
  /* 当該バウンド_機内食 */
  @Input()
  public isMeal: boolean = false;
  /* 手荷物差分 */
  @Input()
  public diffBaggage: boolean = false;
  /* ラウンジ差分 */
  @Input()
  public diffLounge: boolean = false;
  /* 機内食差分 */
  @Input()
  public diffMeal: boolean = false;

  constructor(private _common: CommonLibService) {
    super(_common);
  }

  init(): void {}
  reload(): void {}
  destroy(): void {}
}
