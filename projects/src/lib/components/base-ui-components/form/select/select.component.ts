import { ChangeDetectionStrategy, Component, forwardRef, HostBinding, Input } from '@angular/core';
import { Child } from '../../base-ui.component';
import { BaseInputComponent } from '../base-input.component';
import { SelectGroupComponent } from './select-group.component';

/**
 * [BaseUI] select
 *
 * @extends {BaseInputComponent}
 */
@Component({
  selector: 'asw-select',
  templateUrl: './select.component.html',
  providers: [{ provide: Child, useExisting: forwardRef(() => SelectComponent) }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent extends BaseInputComponent {
  /** selected（選択）状態 */
  @Input()
  public get selected(): string {
    return this.data;
  }
  public set selected(value: string) {
    this.data = value;
    this.markForCheck();
  }

  /** 親Component指定 */
  public override parent!: SelectGroupComponent;

  /** groupの場合のエラー状態 */
  private _groupInvalid = false;

  /** 親Componentがselect groupの場合、親Componentにgroup用のclassを追加 */
  @HostBinding('class.c-select-group__item')
  public get isSelectGroup(): boolean {
    return !!this.parent?.groupData;
  }

  /**
   * `change`イベント
   *
   * @param event
   */
  public onChangeHandle(event?: Event) {
    this.onChange(event);
    if (!!this.parent?.groupData) {
      this.parent.onChangeHandle(event);
    }
  }

  /**
   * `blur`イベント
   *
   * @param event
   */
  public onBlurHandle(event?: Event) {
    this.onBlur(event);
    if (!!this.parent?.groupData) {
      this.parent.onBlurHandle(event);
    }
  }

  /**
   * groupの場合のエラー状態
   */
  public get isGroupInvalid(): boolean {
    return this._groupInvalid;
  }

  public set isGroupInvalid(isGroupInvalid: boolean) {
    this._groupInvalid = isGroupInvalid;
    this.markForCheck();
  }
}
