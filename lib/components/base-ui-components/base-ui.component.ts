import { ContentChildren, Directive, Input, Optional, QueryList } from '@angular/core';
import { v4 } from 'uuid';

/**
 * 親Component
 * @abstract
 */
export abstract class Parent {}

/**
 * 子Component
 * @abstract
 */
export abstract class Child {}

/**
 * [BaseUI] ベースとなるComponent
 *
 * @abstract
 */
@Directive()
export abstract class BaseUIComponent {
  /**
   * `id`属性
   * - デフォルト：自動生成uuid
   */
  @Input()
  public id = `${v4()}`;

  /**
   * デフォルトの親Component
   */
  public parent: BaseUIComponent;

  @ContentChildren(Child)
  public contentChildren!: QueryList<Child>;
  /** `<ng-content>`の子Component取得 */
  public get children(): Array<Child> {
    return this.contentChildren ? this.contentChildren.toArray() : [];
  }

  /**
   * コンストラクタ（親Component指定）
   */
  constructor(@Optional() parent: Parent) {
    this.parent = <BaseUIComponent>parent;
  }
}
