import { Pipe, PipeTransform, Renderer2 } from '@angular/core';
import { matchedRegexPattern } from '../../helpers';

/**
 * テキストリンク用スタイル適用処理Pipe
 *
 * @implements PipeTransform
 */
@Pipe({
  name: 'linkStyle',
})
export class LinkStylePipe implements PipeTransform {
  constructor(private _renderer: Renderer2) {}

  /**
   * 変換処理
   *
   * @param value 対象文言
   * @param msgType 文言の種類（static：静的文言／default：上記以外（動的文言、エラー文言））
   * @returns
   */
  transform(value: string, msgType: 'static' | 'default' = 'default'): string {
    // aタグが含まれている場合のみ変換処理を行う
    const isNeedTransform = matchedRegexPattern(value, '<a\\s+');
    if (!isNeedTransform) {
      return value;
    }

    // スタイルclass名（静的文言の場合）
    const classStatic = 'c-text-link';
    // スタイルclass名（静的文言以外の場合）
    const classDefault = 'c-underline-link';

    const transformTarget = this._renderer.createElement('ng-template');
    this._renderer.setProperty(transformTarget, 'innerHTML', value);
    // 変換対象に含まれるすべてのaタグを検索
    const aElement = transformTarget.querySelectorAll('a');
    (aElement as Array<any>).forEach((value) => {
      const currentClassName = value.className;
      // class属性が存在し、かつclass属性の値が「c-text-link」または「c-underline-link」以外の場合、文言の種類に応じたスタイルを付与する
      if (currentClassName) {
        if (!(currentClassName.includes(classStatic) || currentClassName.includes(classDefault))) {
          this._renderer.addClass(value, msgType === 'static' ? classStatic : classDefault);
        }
      } else {
        // class属性が存在しない場合、文言の種類に応じたスタイルを付与する
        this._renderer.addClass(value, msgType === 'static' ? classStatic : classDefault);
      }
    });
    return transformTarget.innerHTML;
  }
}
