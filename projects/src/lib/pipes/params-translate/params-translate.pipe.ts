import { Pipe, PipeTransform } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ReplaceParam } from '../../interfaces';
import { MasterJsonKeyPrefix } from '@conf/asw-master.config';

/** 埋め込み文字のタイプ */
type TranslateParams = {
  [key: string]: string | number;
};

/**
 * 埋め込み文字列の置換Pipe
 *
 * @extends TranslatePipe
 * @implements PipeTransform
 *
 * @example 使い方
 * ```
 *   translateKey | paramsTranslate: arg1:args2...
 *   translateKey | paramsTranslate: [arg1, args2...]
 * ```
 * - 言語ごとの`json`ファイル
 * ```json
 * {
 *   "replace.key1": "キー1",
 *   "replace.key2": "キー2",
 *   "test.message": "【テスト{{0}}】1番目：{{1}}、2番目：{{2}}"
 * }
 * ```
 * - html側のpipe利用（下記どちらも同じ結果）
 * ```html
 *   <!-- argsは1つのみ指定、typeはReplaceParam[] -->
 *   {{
 *     'test.message'
 *       | paramsTranslate
 *         : [
 *             { key: '0', value: 1 },
 *             { key: '1', value: 'replace.key1', translateFlg: true },
 *             { key: '2', value: 'replace.key2', translateFlg: true }
 *           ]
 *   }}
 *   <!-- argsを複数指定、typeはReplaceParam -->
 *   {{
 *     'test.message'
 *       | paramsTranslate
 *         : { key: '0', value: 1 }
 *         : { key: '1', value: 'replace.key1', translateFlg: true }
 *         : { key: '2', value: 'replace.key2', translateFlg: true }
 *   }}
 * ```
 * - pipe後の結果：`【テスト1】1番目：キー1、2番目：キー2`
 */
@Pipe({
  name: 'paramsTranslate',
  pure: false,
})
export class ParamsTranslatePipe extends TranslatePipe implements PipeTransform {
  /**
   * 変換処理
   *
   * @override
   * @param value 置換対象の文言キー
   * @param args 埋め込み文字列置換用情報
   * @returns 変換後値
   */
  override transform(value: string, ...args: (ReplaceParam | ReplaceParam[])[]): string {
    let params: TranslateParams = {};

    // 引数がある場合、引数分処理する
    args.forEach((arg) => {
      // 引数がReplaceParams[]の場合
      if (Array.isArray(arg)) {
        arg.forEach((replaceParam) => {
          params = { ...this._setTranslateParams(replaceParam), ...params };
        });
        // 引数がReplaceParamsの場合
      } else {
        params = { ...this._setTranslateParams(arg), ...params };
      }
    });
    if (value) {
      return super.transform(value, params);
    }
    return value;
  }

  /**
   * 埋め込み文字の設定
   *
   * @param data 埋め込み文字列置換用情報
   * @returns
   */
  private _setTranslateParams(data: ReplaceParam): TranslateParams {
    const params: TranslateParams = {};
    const { dontTranslate, key, value } = data;
    // paramのkeyのvalueが翻訳必要な場合
    if (!dontTranslate && typeof value === 'string') {
      params[key] = super.transform(value.startsWith('m_') ? value : `${MasterJsonKeyPrefix.STATIC}${value}`);
    } else {
      params[key] = data.value;
    }
    return params;
  }
}
