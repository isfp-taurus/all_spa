import { Pipe, PipeTransform, Renderer2 } from '@angular/core';
import { MasterJsonKeyPrefix } from '@conf/asw-master.config';
import { matchedRegexPattern } from '../../helpers';
import { TranslateService } from '@ngx-translate/core';

/**
 * 文言内のポップアップインジケータ付与Pipe
 *
 * @implements {PipeTransform}
 */
@Pipe({
  name: 'popupIndicator',
})
export class PopupIndicatorPipe implements PipeTransform {
  /** 画像のサイズ（px） */
  private _sizePx = '16';
  /** a開始タグ（検索用） */
  private _aTagStartPattern = '<a\\s+';
  /** 別ウィンドウで開く案内文言キー */
  private _openLinkAltKey = `${MasterJsonKeyPrefix.STATIC}alt.openLinkInNewTab`;
  /** 始め丸括弧の文言キー */
  private _frontParenthesis = `${MasterJsonKeyPrefix.STATIC}label.frontParenthesis`;
  /** 終わり丸括弧の文言キー */
  private _rearParenthesis = `${MasterJsonKeyPrefix.STATIC}label.rearParenthesis`;

  constructor(private _translateSvc: TranslateService, private _renderer: Renderer2) {}

  /**
   * 変換処理
   *
   * @param {string} value 翻訳済みの付与対象文言
   * @param {('primary' | 'white' | 'black' | 'ado_blue' | 'ado_red')} [arg='primary'] 画像の色
   * @returns {string} 変換後値
   */
  transform(value: string, arg: 'primary' | 'white' | 'black' | 'ado_blue' | 'ado_red' = 'primary'): string {
    const isNeedTransform = matchedRegexPattern(value, this._aTagStartPattern);
    // aタグが含まれている場合のみ変換処理を行う
    if (!isNeedTransform) {
      return value;
    }
    const transformTarget = this._renderer.createElement('ng-template');
    this._renderer.setProperty(transformTarget, 'innerHTML', value);
    // 変換対象に含まれるすべてのaタグを検索
    const aElement = transformTarget.querySelectorAll('a');
    (aElement as Array<any>).forEach((value) => {
      const currentTarget = value.target;
      // target="_blank"属性が存在する場合、リンクの後ろにポップアップインジケータを付与する
      if (currentTarget && currentTarget === '_blank') {
        // 別ウィンドウで開く案内文言を翻訳
        const openLinkLabel = this._translateSvc.instant(this._openLinkAltKey);
        // aタグラベルにポップアップインジケータ要素を付与
        const currentLabel = value.innerHTML;
        value.innerHTML = `${currentLabel}${this._getPopupIndicatorElement(openLinkLabel, arg)}`;
        const currentAriaLabel = value.ariaLabel;
        // ariaLabel属性が存在する場合、設定値の後ろに括弧付きの別ウィンドウで開く案内文言を付与する
        if (currentAriaLabel) {
          // 始め丸括弧の文言を翻訳
          const frontLabel = this._translateSvc.instant(this._frontParenthesis);
          // 終わり丸括弧の文言を翻訳
          const rearLabel = this._translateSvc.instant(this._rearParenthesis);
          // 括弧付きの別ウィンドウで開く案内文言を付与したあとの文言でariaLabel属性を再設定
          this._renderer.setAttribute(
            value,
            'aria-label',
            `${currentAriaLabel}${frontLabel}${openLinkLabel}${rearLabel}`
          );
        }
      }
    });
    return transformTarget.innerHTML;
  }

  /**
   * ポップアップインジケータ要素生成
   *
   * @param {string} altLabel alt文言
   * @param {string} arg 画像の色
   * @returns {string}
   */
  private _getPopupIndicatorElement(altLabel: string, arg: string): string {
    const popupIndicatorElement = this._renderer.createElement('ng-template');
    const popupIndicatorHtml = `<img class="c-text-link-external" src="assets/images/icon_external_${arg}_${this._sizePx}.svg" width="${this._sizePx}" height="${this._sizePx}" alt="">`;
    this._renderer.setProperty(popupIndicatorElement, 'innerHTML', popupIndicatorHtml);
    this._renderer.setAttribute(popupIndicatorElement.querySelector('img'), 'alt', altLabel);
    return popupIndicatorElement.innerHTML;
  }
}
