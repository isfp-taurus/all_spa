import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Directive, Input, ViewContainerRef, TemplateRef, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { isCurrentDeviceType } from '../../helpers';
import { DeviceType } from '../../interfaces';
import { Subscription } from 'rxjs';

/**
 * DeviceIfDirective
 *
 * Simple form with shorthand syntax:
 *
 * ```
 * <div *aswDeviceIf="'pc'">Content to render 「'pc' | 'sp' | 'tb' | 'notPc' | 'notSp' | 'notTb'」.</div>
 * ```
 */
@Directive({
  selector: '[aswDeviceIf]',
})
export class DeviceIfDirective implements OnInit, OnDestroy {
  /**
   * デバイス種類の指定
   *
   * Simple form with shorthand syntax:
   *
   * ```
   * <div *aswDeviceIf="'pc'">DeviceType to render:「'pc' | 'sp' | 'tb' | 'notPc' | 'notSp' | 'notTb'」.</div>
   * ```
   */
  @Input()
  set aswDeviceIf(device: DeviceType) {
    this._deviceType = device;
  }

  /**
   * _subscription
   */
  private _subscription = new Subscription();

  /**
   * デバイス種別
   */
  private _deviceType?: DeviceType;

  constructor(
    private _observer: BreakpointObserver,
    private _viewContainer: ViewContainerRef,
    private _template: TemplateRef<any>,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  /**
   * 初期化処理
   */
  public ngOnInit(): void {
    this._subscription.add(
      this._observer
        .observe(['(min-width: 1025px)', '(min-width: 768px) and (max-width: 1024px)', '(max-width: 767px)'])
        .subscribe((state: BreakpointState) => {
          if (state.matches && this._deviceType) {
            this._updateView(this._deviceType);
            this._changeDetectorRef.markForCheck();
          }
        })
    );
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  /**
   * View更新
   * @param deviceCss デバイス種別
   */
  private _updateView(device: DeviceType) {
    const isShow = this._isShow(device);
    if (isShow && this._viewContainer.length === 0) {
      this._viewContainer.createEmbeddedView(this._template);
    } else if (!isShow && this._viewContainer.length > 0) {
      this._viewContainer.clear();
    }
  }

  /**
   * 表示可否
   * @param device デバイス種別
   * @returns
   */
  private _isShow(device: DeviceType): boolean {
    return isCurrentDeviceType(device);
  }
}
