import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * [BaseUI] ポップアップインジケータ
 */
@Component({
  selector: 'asw-indicator-popup',
  templateUrl: './indicator-popup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicatorPopupComponent {
  /**
   * 画像の色
   * - デフォルト：primary
   */
  @Input()
  public color: 'primary' | 'white' | 'black' | 'ado_blue' | 'ado_red' = 'primary';

  /** 画像のサイズ（px） */
  public sizePx = '16';

  /**
   * ポップアップインジケータ用画像ファイル生成
   */
  public get getIndicatorSrc() {
    return `assets/images/icon_external_${this.color}_${this.sizePx}.svg`;
  }
}
