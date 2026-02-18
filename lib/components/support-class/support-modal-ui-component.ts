/**
 * モーダルコンポーネントUIで共通して持つ親クラス
 *
 */
import { Component, Input } from '@angular/core';
// import { uniqueId } from '../../helpers';
import { SupportComponent } from './support-component';

/**
 * モーダルコンポーネントUIで共通して持つ親クラス
 *
 * 使い方
 * ・一番外側の要素に[id]=modalId、(keydown)=keyDownModalEvent($event)を指定する
 * ・modalIdは自動でユニークIDが付与されますが、自身でセットすることも可能です
 * ・onEscapeEventにはEscキーが押された場合の処理を記載する
 *
 * 主な機能
 * ・TABキー移動制御
 * ・ESCキー押下のイベント着火（onEscapeEvent）
 *
 */
@Component({
  template: '',
})
export abstract class SupportModalUiComponent extends SupportComponent {
  // DOMアクセスをするため、複数設置時などの場合、ユニークなIDを付与する必要がある、外部からの設定も可能
  public _id = 'modal';
  @Input()
  public get id() {
    return this._id;
  }
  public set id(value: string) {
    this._id = value;
    this.modalId = value + 'ModalBaseComponent';
  }
  public modalId = 'modalModalBaseComponent';

  /**
   * モーダル内のフォーカス可能な要素を取得
   * @returns フォーカス可能な要素
   */
  protected getInteractiveElArray() {
    const el = document.getElementById(this.modalId);
    const tagStr =
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, [tabindex="0"], [contenteditable]';

    if (el) {
      const elements = el.querySelectorAll<HTMLElement>(tagStr);
      return Array.from(elements).filter((elm) => elm.offsetHeight !== 0); //フォーカスの当たるキーがheight=0なわけがないので0の場合非表示として除外
    }
    return [];
  }

  /**
   * 先頭、または最後にフォーカスを充てる
   * @param isFirstFocus true:先頭にフォーカス false:最後にフォーカス
   * @returns
   */
  protected focusToButton(isFirstFocus = true) {
    const focusableArray = this.getInteractiveElArray();
    if (focusableArray.length === 0) {
      return;
    }
    if (focusableArray.length > 0) {
      focusableArray[isFirstFocus ? 0 : focusableArray.length - 1].focus();
    }
  }
  /**
   * ESCが押された際の処理
   * 背景クリック時と同様の処理（Escで閉じるなら、背景クリックでも閉じていいはずなので）
   *
   */
  abstract onEscapeEvent(): void;

  /**
   * モーダルのキーボードイベント モーダルのkeydownイベントに配置する
   * @param event keydownイベント時渡されるイベント
   */
  public keyDownModalEvent(event: KeyboardEvent) {
    switch (event.code) {
      case 'Escape':
        this.onEscapeEvent();
        break;
      case 'Tab': {
        // モーダル画面内にフォーカスが当たっているか検証
        const interactiveElArray = this.getInteractiveElArray();
        const focusIndex = interactiveElArray.findIndex((el) => el === document.activeElement);

        if (interactiveElArray.length === 1) {
          // フォーカス可能な要素が1つしかない場合、その要素のみフォーカス/
          event.preventDefault();
          event.stopImmediatePropagation();
          this.focusToButton(true);
          break;
        }

        if (focusIndex === 0) {
          if (event.shiftKey) {
            // 最初の要素からSHIFT TABした場合最後の要素にフォーカスを充てる
            event.preventDefault();
            event.stopImmediatePropagation();
            this.focusToButton(false);
          }
        } else if (focusIndex >= interactiveElArray.length - 1) {
          if (!event.shiftKey) {
            // 最後の要素にふれていたら1番目の要素にフォーカスをあてる
            event.preventDefault();
            event.stopImmediatePropagation();
            this.focusToButton(true);
          }
        } else if (focusIndex === -1) {
          // 画面外の要素にフォーカスがあたっていたら1番目の要素にフォーカスをあてる
          this.focusToButton(true);
        }
        break;
      }
    }
  }
}
