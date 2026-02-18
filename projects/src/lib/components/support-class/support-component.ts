/**
 * コンポーネントで共通して持つ親クラス
 *
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SupportClass } from './support-class';
import { CommonLibService } from '../../services';
import { LoginStatusType } from '../../interfaces';
/**
 * SupportComponent コンポーネントで共通して持つ親クラス
 * 必要なクラスでextendsして使用する
 */
@Component({
  template: '',
})
export abstract class SupportComponent extends SupportClass implements OnInit {
  constructor(private __common: CommonLibService) {
    super();
  }

  abstract reload(): void;

  private _loginStatusToReload: LoginStatusType | null = null;
  ngOnInit(): void {
    this.init();
    // ログイン時再描画
    this.subscribeService(
      'SupportComponentgetAswContextObservable',
      this.__common.aswContextStoreService.getAswContext$(),
      (state) => {
        if (this._loginStatusToReload !== null && this._loginStatusToReload !== state.loginStatus) {
          // 再描画
          this._reload();
        }
        this._loginStatusToReload = state.loginStatus;
      }
    );
  }

  // リロード処理
  protected _reload() {
    this.reload();
  }

  /**
   * ngOnInit時に呼ばれる処理、継承先のコンポーネントで使用するngOnInitの代替
   */
  abstract init(): void;
}
