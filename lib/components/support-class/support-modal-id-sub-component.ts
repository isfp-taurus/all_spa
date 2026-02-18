/**
 * IDありモーダル画面用のベースコンポーネント ヘッダーフッター用
 */
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonLibService } from '../../services';
import { Subject } from 'rxjs/internal/Subject';
import { SupportComponent } from './support-component';
import { isVisible } from '@lib/helpers';

/**
 * IDありモーダル画面用のベースコンポーネント ヘッダーフッター用
 *
 * モーダル画面のHTMLのルール
 * --------------基本構成-----------------------------
 * <div #modalContents  [class]="lmodalContentsClassWithWidth" aria-modal="true" role="dialog" aria-labelledby=(モーダルのタイトル)>
 *  <div #modalHead [class]="lmodalHeaderClass">
 *    （モーダルのヘッダ部分のHMML）
 *  </div>
 *
 *  <div #modalBody [class]="lmodalBodyClass">
 *    （モーダルのメイン部分のHMML）
 *  </div>
 *
 *  <div #modalFooter [class]="lmodalFooterClass" >
 *   (モーダルのフッタ部分のHMML）
 *  </div>
 * </div>
 * ---------------------------------------------------
 *
 * ・（モーダルのヘッダ部分のHMML）または、(モーダルのメイン部分のHMML）に入るHTMLを記載してください
 * ・モーダル表示時に指定したpayloadがクラス内のpayloadに代入されます
 * ・close処理はモーダル表示時に上書きされモーダルを閉じる処理が代入されます。
 *
 */
@Component({
  template: '',
})
export abstract class SupportModalIdSubComponent extends SupportComponent implements OnInit, AfterViewInit {
  constructor(private ___common: CommonLibService) {
    super(___common);
  }

  public payload: any = null;
  public contentInitFlag$: Subject<boolean> = new Subject<boolean>();

  ngAfterViewInit(): void {
    // id=modalTitle が指定されている、かつ可視化されている、かつ tabIndex が付与されていない場合、tabIndex を付与する
    const element = document.querySelector('#modalTitle');
    if (element && isVisible(element) && !element.hasAttribute('tabIndex')) {
      element.setAttribute('tabindex', '0');
    }
    this.contentInitFlag$.next(true);
  }

  // モーダルを閉じる処理、modal.componentから処理をもらう
  public close: (value?: any, isCallbackRestricted?: boolean) => void = () => {};
  // 画面からの手動リサイズ用、modal.componentから処理をもらう
  public resizeForce: () => void = () => {};
  // 画面のスクロール情報を取得、modal.componentから処理をもらう
  public getScrollParam: () => { scrollTop: number; maxScroll: number } = () => {
    return {
      scrollTop: 0,
      maxScroll: 0,
    };
  };
  // 画面のスクロール値を設定、modal.componentから処理をもらう
  public setScroll: (scroll: number) => void = () => {};
  // 画面の背景クリック時の画面クローズ許可設定を変更、modal.componentから処理をもらう
  public setCloseBackEnable: (value: boolean) => void = (value: boolean) => {};
}
