import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AswContextStoreService } from '../../../services';
import { DEBUG_LANGUAGE_SWITCH_CONFIG, LanguageDetail } from './debug-language-switch.config';
// import { AswContextType } from '../../../interfaces';

/**
 * [SharedUI] 言語切り替え処理（デバッグ用）
 */
@Component({
  selector: 'asw-debug-language-switch',
  templateUrl: './debug-language-switch.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebugLanguageSwitchComponent {
  /** 選択済み言語 */
  public selectedLang: string;

  /** 切り替え言語一覧 */
  public langDetails: LanguageDetail[];

  constructor(private _translateService: TranslateService, private _aswContext: AswContextStoreService) {
    // 切り替え言語一覧を取得する
    this.langDetails = Object.values(DEBUG_LANGUAGE_SWITCH_CONFIG);

    // 選択済み言語の初期値に、現在使用中の言語を設定する
    this.selectedLang = this._translateService.currentLang;

    // 現在使用中の言語が言語切り替え用Configに定義されてない場合、
    // 選択済み言語コードの初期値を「ja」で設定する
    if (!DEBUG_LANGUAGE_SWITCH_CONFIG[`debug_language_${this.selectedLang}`]) {
      this.selectedLang = 'ja';
    }
  }

  /**
   * 言語切り替え処理
   */
  public changeLang(): void {
    // オフィス言語更新APIを利用してサーバ側の言語情報を選択済み言語に更新する
    this._aswContext.changeLanguage(this.selectedLang, null);
  }
}
