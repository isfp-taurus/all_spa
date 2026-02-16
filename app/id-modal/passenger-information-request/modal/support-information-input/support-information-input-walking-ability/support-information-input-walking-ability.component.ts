import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { SupportInformationInputWalkingAbilityModel } from '@common/interfaces';
import { SupportComponent } from '@lib/components/support-class';
import { ValidationErrorInfo } from '@lib/interfaces';
import { CommonLibService } from '@lib/services';

/**
 * サポート情報入力モーダル
 */
@Component({
  selector: 'asw-support-information-input-walking-ability',
  templateUrl: './support-information-input-walking-ability.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportInformationInputWalkingAbilityComponent extends SupportComponent {
  constructor(private _common: CommonLibService, public changeDetectorRef: ChangeDetectorRef) {
    super(_common);
  }

  @Input()
  set data(value: SupportInformationInputWalkingAbilityModel) {
    this._data = value;
  }
  get data(): SupportInformationInputWalkingAbilityModel {
    return this._data;
  }
  private _data: SupportInformationInputWalkingAbilityModel = {
    code: '',
  };
  @Output()
  dataChange = new EventEmitter<SupportInformationInputWalkingAbilityModel>();

  @Input()
  set master(value: Array<{ code: string; name: string }>) {
    this._master = value;
  }
  get master(): Array<{ code: string; name: string }> {
    return this._master;
  }
  private _master: Array<{ code: string; name: string }> = [];

  public code = '';

  public error: ValidationErrorInfo | null = null;

  /**
   * 初期表示処理
   */

  init(): void {
    this.refresh();
  }

  reload(): void {}

  destroy(): void {
    this.apply();
  }

  apply() {
    const value: SupportInformationInputWalkingAbilityModel = { code: this.code };
    this.data = value;
    this.dataChange.emit(value);
  }
  refresh() {
    this.code = this.data.code;
    this.changeDetectorRef.markForCheck();
  }

  /**
   * 歩行程度変更処理
   * @param code 歩行程度コード（SSRコード）
   */
  changeCode(code: string) {
    this.code = code;
  }

  /**
   * エラー判定
   * @returns 判定結果
   */
  public isError() {
    if (this.code === '') {
      this.error = {
        errorMsgId: 'E0002',
        params: {
          key: 0,
          value: 'label.walking.ability',
        },
      };
      return true;
    }
    return false;
  }
}
