import {
  ChangeDetectorRef,
  Directive,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { BehaviorSubject, Observable, Subscription, distinctUntilChanged, skipWhile } from 'rxjs';

/**
 * 何かしらの条件によって表示を切り替えるようなディレクティブの基底クラス
 * @export
 * @class BaseIfDirective
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Directive({
  selector: '[aswNgBaseIf], [aswNgBaseIfElse]',
})
export abstract class BaseIfDirective implements OnInit, OnDestroy, OnChanges {
  protected _subscription = new Subscription();
  /**
   * 表示条件の変更を管理するためのBehaviorSubject
   * @protected
   * @type {BehaviorSubject<boolean>}
   * @memberof BaseIfDirective
   */
  protected _conditionSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * 表示条件を取得するためのObservable
   * @type {Observable<boolean>}
   * @memberof BaseIfDirective
   */
  public condition$: Observable<boolean> = this._conditionSubject.asObservable().pipe(distinctUntilChanged());

  /**
   * @returns {boolean}
   * @memberof BaseIfDirective
   */
  public get condition(): boolean {
    return this._conditionSubject.getValue();
  }

  /**
   * @param {boolean} condition
   * @returns {void}
   * @memberof BaseIfDirective
   */
  public set condition(condition: boolean) {
    this._conditionSubject.next(condition);
  }

  /**
   * 表示条件がfalseの場合に表示するテンプレート
   * @protected
   * @type {TemplateRef<any>}
   * @memberof BaseIfDirective
   */
  protected _elseTemplateRef!: TemplateRef<any>;

  /**
   * @memberof BaseIfDirective
   */
  public get elseTemplateRef(): TemplateRef<any> {
    return this._elseTemplateRef;
  }

  /**
   * @memberof BaseIfDirective
   */
  public set elseTemplateRef(elseTemplateRef: TemplateRef<any>) {
    const isValidTemplate = elseTemplateRef instanceof TemplateRef;
    if (isValidTemplate) {
      this._elseTemplateRef = elseTemplateRef;
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * 埋め込みビューのデータバインディングコンテキスト
   * @protected
   * @type {any}
   * @memberof BaseIfDirective
   */
  protected _context: any = {};

  /**
   * @memberof BaseIfDirective
   */
  public get context(): any {
    return this._context;
  }

  /**
   * @memberof BaseIfDirective
   */
  public set context(context: any) {
    this._context = context;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Creates an instance of BaseIfDirective.
   * @param {TemplateRef<any>} _templateRef
   * @param {ViewContainerRef} _viewContainerRef
   * @param {ChangeDetectorRef} _changeDetectorRef
   * @memberof BaseIfDirective
   */
  public constructor(
    protected _templateRef: TemplateRef<any>,
    protected _viewContainerRef: ViewContainerRef,
    protected _changeDetectorRef: ChangeDetectorRef
  ) {}

  /**
   * @memberof BaseIfDirective
   */
  public ngOnInit() {
    this.init();
    // conditionの値を監視して、Viewの切り替えを行う
    this._subscription.add(this.condition$.pipe().subscribe(() => this._updateViewContainerRef()));
  }

  /**
   * @memberof BaseIfDirective
   */
  public ngOnDestroy() {
    this.destroy();
    this._viewContainerRef.detach();
    this._conditionSubject.complete();
    this._subscription.unsubscribe();
  }

  /**
   *
   * @param {SimpleChanges} changes
   * @memberof BaseIfDirective
   */
  public ngOnChanges(changes: SimpleChanges) {}

  /**
   * conditionに応じてviewの切り替えを行うメソッド
   * @protected
   * @memberof BaseIfDirective
   */
  protected _updateViewContainerRef(): void {
    this._viewContainerRef.clear();
    if (this.condition) {
      this._viewContainerRef.createEmbeddedView(this._templateRef, this.context);
    } else {
      if (this.elseTemplateRef) {
        this._viewContainerRef.createEmbeddedView(this.elseTemplateRef, this.context);
      }
    }

    this._changeDetectorRef.markForCheck();
  }

  /**
   * ngOnInit時に呼ばれる処理、継承先のコンポーネントで使用するngOnInitの代替
   */
  abstract init(): void;

  /**
   * ngOnDestroy時に呼ばれる処理、継承先のコンポーネントで使用するngOnDestroyの代替
   */
  abstract destroy(): void;
}
