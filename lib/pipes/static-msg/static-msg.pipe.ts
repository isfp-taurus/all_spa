import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { MasterJsonKeyPrefix } from '@conf/asw-master.config';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { MetaUrlPipe } from '../meta-url/meta-url.pipe';
import { PopupIndicatorPipe } from '../popup-indicator/popup-indicator.pipe';
import { LinkStylePipe } from '../link-style/link-style.pipe';

@Pipe({
  name: 'staticMsg',
  pure: false,
})
export class StaticMsgPipe extends TranslatePipe implements PipeTransform {
  constructor(
    private _translate: TranslateService,
    private _meta: MetaUrlPipe,
    private _popup: PopupIndicatorPipe,
    private _linkStyle: LinkStylePipe,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_translate, _changeDetectorRef);
  }

  /**
   * 静的文言出力用のPIPE
   * translate、metaURL、popuoIndicatorをまとめたパイプ
   *
   * @param {string} str 処理対象文字列
   * @param {Object} interpolateParams プレースホルダ設定
   * @param {string} arg popuoIndicatorの画像の色
   * @returns {string} 変換された文字列
   */
  override transform(
    str: string,
    interpolateParams?: Object,
    arg: 'primary' | 'white' | 'black' | 'ado_blue' | 'ado_red' = 'primary'
  ): string {
    // prefixの自動付与 m_list_dataなどMasterJsonKeyPrefixに含まないものも考慮してm_で判定
    let key = str.startsWith('m_') ? str : MasterJsonKeyPrefix.STATIC + str;
    const temp = super.transform(key, interpolateParams);
    const setStyle = key.includes(MasterJsonKeyPrefix.DYNAMIC)
      ? this._linkStyle.transform(temp)
      : this._linkStyle.transform(temp, 'static');
    const temp2 = this._popup.transform(setStyle, arg);
    const temp3 = this._meta.transform(temp2);

    return temp3;
  }

  /**
   * 言語変換 コンポーネント用 変更検知するためObservableで返却する
   * @param {string} str 処理対象文字列
   * @param {Object} interpolateParams プレースホルダ設定
   * @param {string} arg popuoIndicatorの画像の色
   * @returns {string} 変換された文字列のObservable
   */
  public get(
    str: string,
    interpolateParams?: Object,
    arg: 'primary' | 'white' | 'black' | 'ado_blue' | 'ado_red' = 'primary'
  ): Observable<string> {
    // prefixの自動付与 m_list_dataなどMasterJsonKeyPrefixに含まないものも考慮してm_で判定
    const key = str.startsWith('m_') ? str : MasterJsonKeyPrefix.STATIC + str;

    return this._translate.get(key, interpolateParams).pipe(
      map((str) => this._popup.transform(str, arg)),
      map((str) => this._meta.transform(str))
    );
  }
}
