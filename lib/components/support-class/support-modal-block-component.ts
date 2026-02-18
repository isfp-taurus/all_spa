/**
 * モーダル画面用のベースコンポーネント
 */

import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonLibService } from '../../services';
import { SupportComponent } from './support-component';
import {
  LModalBodyClassType,
  LModalContentsClassType,
  LModalContentsWidthType,
  LModalFooterClassType,
  LModalHeaderClassType,
  ModalType,
} from '../shared-ui-components/modal/modal.state';
import { Subject } from 'rxjs/internal/Subject';
import { Router, RouterEvent, Event, NavigationEnd } from '@angular/router';
import { filter, fromEvent, throttleTime, merge, debounceTime, animationFrameScheduler } from 'rxjs';
import { isVisible } from '@lib/helpers';

/**
 * モーダル画面用のベースコンポーネント
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
 *   (モーダルのメイン部分のHMML）
 *  </div>
 * </div>
 * ---------------------------------------------------
 *
 * ・この基本構成をそのままコピーし、()の部分に必要なHTMLを追加して画面を作成してください
 * ・#modalContents、#modalHead、#modalBody 、#modalFooterのタグをつけ忘れないように(スクロール制御で参照します)
 * ・最初の行、[class]="lmodalContentsClassWithWidth"の部分は組み込み元から指定したlmodalContentsClassWithWidthを設定します、指定しない場合はそのまま任意のクラスを書いてください
 * ・ヘッダーがない場合は<div #modalHead ～</div>の部分は削除してください
 * ・フッターがない場合は<div #modalFooter ～</div>の部分は削除してください
 * ・lmodalHeaderClass、lmodalBodyClass、lmodalFooterClassはモーダルの表示レイアウトなのでそのまま記載してください（適切なクラスがモーダル立ち上げ時に代入されています）
 * ・payloadにはモーダル表示時に指定した値が代入されます。
 * ・close処理はモーダル表示時に上書きされモーダルを閉じる処理が代入されます。
 * ・manualMarginには#modalHead、#modalBody、#modalFooter以外の個所、()部分以外にHTMLの記載が必要な場合、そのコンテンツの高さを代入してください（基本的に使用しない）。
 *
 * 主な機能
 * ・モーダル内のスクロール制御
 * ・タブキー移動制御
 *
 */
@Component({
  template: '',
})
export abstract class SupportModalBlockComponent extends SupportComponent implements AfterViewInit {
  constructor(private ___common: CommonLibService) {
    super(___common);
    // 1. window の resize イベントを監視
    const windowResize$ = fromEvent(window, 'resize');
    // 2.  visualViewport が存在する場合、その resize イベントも監視
    const visualViewportResize$ = window.visualViewport ? fromEvent(window.visualViewport, 'resize') : null;
    // 3. visualViewport が存在する場合は、両方のイベントを merge（統合）する
    const resizeEvents$ = visualViewportResize$ ? merge(windowResize$, visualViewportResize$) : windowResize$;
    /**
     * Safari ではキーボードがポップアップまたは非表示になると、
     * window.resize ではなく window.visualViewport.resize イベントがトリガーされるため
     * window.visualViewport の resize イベントをリッスンして共通モーダルの resize 関数を再トリガーし、
     * モーダルの高さを再計算する
     */
    this.subscribeService(
      'SupportModalBlockResize',
      resizeEvents$.pipe(debounceTime(100), throttleTime(100, animationFrameScheduler)),
      () => this.resize()
    );
  }

  @ViewChild('modalContents') modalContents!: ElementRef; //一番外側のコンテンツに割り当てる
  @ViewChild('modalHead') modalHead!: ElementRef; //ヘッダーコンテンツに割り当てる
  @ViewChild('modalFooter') modalFooter!: ElementRef; //メインコンテンツに割り当てる
  @ViewChild('modalBody') modalBody!: ElementRef; //フッターコンテンツに割り当てる

  //デザインで適用するクラス、適用すべきクラスをモーダルから渡してくれるので基本これを指定、方法は上記のコメント参照
  public lmodalContentsClassWithWidth = LModalContentsClassType.TYPE1 + ' ' + LModalContentsWidthType.NONE;
  public lmodalHeaderClass: LModalHeaderClassType = LModalHeaderClassType.TYPE1;
  public lmodalBodyClass: LModalBodyClassType = LModalBodyClassType.TYPE1;
  public lmodalFooterClass: LModalFooterClassType = LModalFooterClassType.TYPE1;
  public modalType: ModalType = ModalType.TYPE1;

  public modalInitioalHeight = 0; // モーダルの初期高さ。スクロールバーの表示判定に使用
  public modalSetHeight = 0; // モーダルの高さ。スクロールバーの表示判定に使用

  public contentInitFlag$: Subject<boolean> = new Subject<boolean>();

  override ngOnDestroy(): void {
    this._mutationObserver.disconnect();
    super.ngOnDestroy();
  }

  /**
   * ビュー初期化後処理
   */
  ngAfterViewInit(): void {
    this.resize();
    if (this.modalBody) {
      //ボディ部分が変更された場合にresizeが走る
      this._mutationObserver.observe(this.modalBody.nativeElement, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['height', 'width', 'class'], //スタイルに変更のありそうなattributeのみ監視、styleの直接指定は各画面でresizeを呼ぶこと
      });
    }

    // #modalHead と #modalContents が指定されているかを判定
    if (this.modalHead && this.modalContents) {
      const modalContentsElement = this.modalContents.nativeElement;

      // aria-modalプロパティがあるか
      const hasAriaModal = modalContentsElement.hasAttribute('aria-modal');
      // roleプロパティがあるか
      const hasRole = modalContentsElement.hasAttribute('role');
      // aria-modalに設定された値
      const ariaModalValue = modalContentsElement.getAttribute('aria-modal');
      // roleに設定された値
      const roleValue = modalContentsElement.getAttribute('role');

      // 「aria-modal=true」が指定されていない場合、「aria-modal=true」を付与
      if (!hasAriaModal || ariaModalValue !== true) {
        modalContentsElement.setAttribute('aria-modal', 'true');
      }
      // 「role='dailog'」が指定されていない場合、「role='dialog'」を付与
      if (!hasRole || roleValue !== 'dialog') {
        modalContentsElement.setAttribute('role', 'dialog');
      }

      const tagArray = ['h1', 'h2', 'h3'];
      // aria-labelledbyが指定された要素があるかを判定
      if (modalContentsElement.hasAttribute('aria-labelledby')) {
        // aria-labelledbyで指定された値を取得
        const labelledById = this.modalContents.nativeElement.getAttribute('aria-labelledby');
        // aria-labelledbyで指定された値がIDに設定された要素を取得
        const targetElement = this.modalHead.nativeElement.querySelector(`#${labelledById}`);

        // 上記要素が存在し、かつ可視化されている、かつtabIndexが付与されていない場合、「tabIndex='0'」を付与する
        if (targetElement && isVisible(targetElement) && !targetElement.hasAttribute('tabIndex')) {
          targetElement.setAttribute('tabindex', '0');
        } else if (!targetElement) {
          this.setTabIndexInModalHead(tagArray);
        }
      } else {
        this.setTabIndexInModalHead(tagArray);
      }
    }
    this.contentInitFlag$.next(true);
  }

  /**
   * 対象のタグが存在する、かつtabIndexが指定されていない、かつ可視化されている場合、当該タグにtabIndex="0"を付与
   * @param tagArray 判別対象となるタグリスト
   */
  private setTabIndexInModalHead(tagArray: string[]) {
    tagArray.forEach((tag) => {
      const element = this.modalHead.nativeElement.querySelector(tag);
      if (element && !element.hasAttribute('tabIndex') && isVisible(element)) {
        element.setAttribute('tabindex', '0');
      }
    });
  }

  /**
   * MutationObserver作成、指定したコンテンツが変更したときに起動する
   */
  private _mutationObserver = new MutationObserver(() => {
    this.resize();
  });

  public payload: any = null;
  public manualMargin = 0;

  // モーダルを閉じる処理、modal.componentから処理をもらう
  public close: (value?: any, isCallbackRestricted?: boolean) => void = () => {};

  public setCloseBackEnable: (value: boolean) => void = (value: boolean) => {};

  /**
   * URLが変更した際にモーダルを閉じる 必要なページで呼び出す
   * @param router ルーター
   */
  public closeWithUrlChange(router: Router) {
    //URL検知
    this.subscribeService(
      'ModalPageUrlChangeEvent',
      router.events.pipe(filter((e: Event): e is RouterEvent => e instanceof NavigationEnd)),
      (data) => {
        // URLが変更したらモーダルを閉じる
        // この処理でモーダルが閉じられた場合、組み込み元から指定されたモーダルを閉じる場合の処理は実行されない
        this.close('', true);
      }
    );
  }

  /**
   * スクロールバー表示判定
   * ヘッダーフッター、コンテンツのサイズからボディの高さを設定
   * 一定の高さ以上になるとスクロールするように制御
   */
  public resize() {
    const scroll = this.modalBody?.nativeElement?.scrollTop ?? 0;
    if (this.modalBody) {
      this.modalBody.nativeElement.style.height = 'auto';
      this.modalInitioalHeight = this.modalBody.nativeElement.offsetHeight;
    }
    const windowH = window.innerHeight;
    const modalH = this.modalContents ? this.modalContents.nativeElement.offsetHeight : 0;
    const headerH = this.modalHead ? this.modalHead.nativeElement.offsetHeight : 0;
    const footerH = this.modalFooter ? this.modalFooter.nativeElement.offsetHeight : 0;
    const isWindowHMatchModalH = windowH == modalH;
    const isSmallScreen = window.matchMedia('(max-width: 767px)').matches;
    const isMediumScreen = window.matchMedia('(max-width: 1024px)').matches;
    let margin = 0;
    if (this.modalType === ModalType.TYPE1) {
      margin = isSmallScreen ? 48 : 128;
    } else if (this.modalType === ModalType.TYPE2) {
      margin = isMediumScreen ? 48 : 128;
    } else if (this.modalType === ModalType.TYPE8) {
      margin = 0;
    } else if (this.modalType === ModalType.TYPE9) {
      margin = 128;
    } else {
      margin = isWindowHMatchModalH && !isSmallScreen ? 0 : 48;
    }

    const setVal = windowH - margin - headerH - footerH - this.manualMargin;
    this.modalSetHeight = setVal;
    if (this.modalBody) {
      if (setVal > this.modalInitioalHeight) {
        this.modalBody.nativeElement.style.height = this.modalInitioalHeight + 'px';
        if (this.modalFooter) {
          this.modalFooter.nativeElement.classList.remove('is-shadow');
        }
      } else {
        this.modalBody.nativeElement.style.height = setVal + 'px';
        if (this.modalFooter) {
          this.modalFooter.nativeElement.classList.add('is-shadow');
        }
      }
      //スクロールしていた場合元の位置に戻す
      const maxScroll =
        (this.modalBody.nativeElement.scrollHeight ?? 0) - (this.modalBody.nativeElement.clientHeight ?? 0);
      if (maxScroll !== 0 && scroll !== 0) {
        this.modalBody.nativeElement.scrollTop = scroll < maxScroll ? scroll : maxScroll;
      }
    }
  }

  /**
   * 現在のスクロール情報を取得する
   * @returns
   * 　@param scrollTop 現在のスクロール量
   *   @param maxScroll 最大スクロール量
   */
  public getScrollParam = () => {
    return {
      scrollTop: this.modalBody?.nativeElement?.scrollTop ?? 0,
      maxScroll:
        (this.modalBody?.nativeElement?.scrollHeight ?? 0) - (this.modalBody?.nativeElement?.clientHeight ?? 0),
    };
  };

  /**
   * 指定位置にスクロールする
   * @param scroll スクロール位置
   */
  public setScroll = (scroll: number) => {
    if (this.modalBody?.nativeElement) {
      const maxScroll =
        (this.modalBody.nativeElement.scrollHeight ?? 0) - (this.modalBody.nativeElement.clientHeight ?? 0);
      if (maxScroll !== 0) {
        this.modalBody.nativeElement.scrollTop = scroll < maxScroll ? scroll : maxScroll;
      }
    }
  };
}
