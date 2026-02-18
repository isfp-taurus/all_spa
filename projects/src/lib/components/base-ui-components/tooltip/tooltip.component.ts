import { Component, Input, ChangeDetectionStrategy, forwardRef } from '@angular/core';
import { BaseUIComponent } from '../base-ui.component';

/**
 * [BaseUI] tootip
 *
 * @extends {BaseUIComponent}
 */
@Component({
  selector: 'asw-tooltip',
  templateUrl: './tooltip.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent extends BaseUIComponent {
  @Input()
  public iconImage!: string;
  @Input()
  public tooltipContent?: string;
  @Input()
  public tooltipTop = 0;
  @Input()
  public tooltipDisplayType: 'tap' | 'hover' = 'tap';
  @Input()
  public displayAreaClass = 'l-core-contents__inner';
}
