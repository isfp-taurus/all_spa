import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { SupportClass } from '../../../components/support-class/support-class';

/**
 * [BaseUI] tab
 * タブアイテム
 *
 * @param title 選択に表示する名前
 * @param disable タブの無効フラグ(表示制御用)
 * */
@Component({
  selector: 'asw-tabs-item',
  templateUrl: './tabs-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabItemComponent extends SupportClass {
  destroy() {}

  @ViewChild(TemplateRef, { static: true })
  public content!: TemplateRef<any>;

  @Input()
  public title = 'title';
  // trueの場合タブに表示しない、条件により表示する用
  @Input()
  public disable = false;
}
