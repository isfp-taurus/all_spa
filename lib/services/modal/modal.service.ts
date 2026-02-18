/**
 * モーダル画面を表示サービス
 *
 */
import { BlockScrollStrategy, Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Injectable, Type } from '@angular/core';
import {
  SupportModalIdSubComponent,
  SupportModalIdComponent,
  SupportModalBlockComponent,
  SupportClass,
} from '../../components/support-class';
import { ModalBaseComponent, ModalIdTemplateComponent, ModalType } from '../../components';
import { ModalBlockParts, ModalIdParts } from './modal-part.state.';
import { Subject } from 'rxjs/internal/Subject';

/**
 * モーダル画面を表示サービス
 *
 * @param defaultBlockPart モーダルのデフォルトデータ作成 @see ModalBlockParts
 * @param defaultIdPart ID付きモーダルのデフォルトデータ作成 @see ModalBlockParts
 * @param showSubModal モーダル画面の表示
 * @param showSubPageModal ID付きモーダル画面の表示
 *
 */
@Injectable()
export class ModalService extends SupportClass {
  private modalOpenSubject = new Subject<void>();
  private modalCloseSubject = new Subject<void>();
  public onModalOpen$ = this.modalOpenSubject.asObservable();
  public onModalClose$ = this.modalCloseSubject.asObservable();

  destroy(): void {}

  constructor(private _overlay: Overlay) {
    super();
  }

  /**
   * モーダルのデフォルトデータ作成
   * @param block : 表示するコンテンツ
   * @param id : HTMLに設定するID
   * @returns モーダル情報
   * @see ModalBlockParts
   */
  public defaultBlockPart(block: Type<SupportModalBlockComponent>, id: string = block.name): ModalBlockParts {
    return {
      id: id,
      block: block,
      closeBackEnable: false,
      type: ModalType.TYPE1,
    };
  }
  /**
   * ID付きモーダルのデフォルトデータ作成
   * @param content : メインコンテンツ
   * @param header  : ヘッダー
   * @param footer  : フッター
   * @param id : HTMLに設定するID（画面IDではない）
   * @returns 画面ID付きモーダル情報
   * @see ModalIdParts
   */
  public defaultIdPart(
    content: Type<SupportModalIdComponent>,
    header?: Type<SupportModalIdSubComponent>,
    footer?: Type<SupportModalIdSubComponent>,
    id: string = content.name
  ): ModalIdParts {
    return {
      id: id,
      content: content,
      header: header,
      footer: footer,
      closeBackEnable: false,
      type: ModalType.TYPE1,
    };
  }

  /**
   * モーダルを開いた際にイベントを発生させる
   */
  public openModal(): void {
    this.modalOpenSubject.next();
  }
  /**
   * モーダルを閉じた時にイベントを発生させる
   */
  public closeModal(): void {
    this.modalCloseSubject.next();
  }

  /**
   * モーダル画面の表示
   * @param modalParts : モーダル情報 @see ModalBlockParts
   * @param holder : DialogRefを受け取りたい場合に設定されるコンポーネント
   * @returns async closeの引数に指定したデータ
   */
  public async showSubModal(modalParts: ModalBlockParts, holder?: DialogRefHolder) {
    const positionStrategy = this._overlay.position().global().centerHorizontally().centerVertically();

    const overlayRef = this._overlay.create({
      positionStrategy: positionStrategy,
      hasBackdrop: true,
      scrollStrategy: this._overlay.scrollStrategies.block(),
    });
    const dialogPortal = new ComponentPortal(ModalBaseComponent);
    const dialogRef = overlayRef.attach(dialogPortal);
    dialogRef.instance.block = modalParts.block;
    dialogRef.instance.overlayRef = overlayRef;
    dialogRef.instance.focusElement = document.activeElement;
    dialogRef.instance.closeBackEnable = modalParts.closeBackEnable;
    if (modalParts.modalWidth !== undefined) {
      dialogRef.instance.modalWidth = modalParts.modalWidth;
    }
    dialogRef.instance.modalType = modalParts.type;
    dialogRef.instance.closeEvent = modalParts.closeEvent ? modalParts.closeEvent : null;
    if (modalParts.id) {
      dialogRef.instance.id = modalParts.id;
    }

    if (modalParts.payload) {
      dialogRef.instance.payload = modalParts.payload;
    }
    if (holder) {
      holder.setDialogRef(dialogRef);
    }

    //処理待ち用の実装
    const subject = new Subject();
    dialogRef.instance.modalClose = this.getWaitSubject(subject);
    return await this.waitEvent(subject);
  }

  /**
   * ID付きモーダル画面の表示
   * @param modalParts : ID付きモーダル情報 @see ModalIdParts
   * @returns async closeの引数に指定したデータ
   */
  public async showSubPageModal(modalParts: ModalIdParts) {
    const positionStrategy = this._overlay.position().global().centerHorizontally().centerVertically();

    const overlayRef = this._overlay.create({
      positionStrategy: positionStrategy,
      hasBackdrop: true,
      scrollStrategy: this._overlay.scrollStrategies.block(),
    });
    const dialogPortal = new ComponentPortal(ModalBaseComponent);
    const dialogRef = overlayRef.attach(dialogPortal);
    dialogRef.instance.block = ModalIdTemplateComponent;
    dialogRef.instance.idPayload = {
      header: modalParts.header ? modalParts.header : null,
      footer: modalParts.footer ? modalParts.footer : null,
      content: modalParts.content,
    };
    dialogRef.instance.overlayRef = overlayRef;
    dialogRef.instance.closeBackEnable = modalParts.closeBackEnable;
    if (modalParts.modalWidth !== undefined) {
      dialogRef.instance.modalWidth = modalParts.modalWidth;
    }
    dialogRef.instance.modalType = modalParts.type;
    dialogRef.instance.closeEvent = modalParts.closeEvent ? modalParts.closeEvent : null;
    if (modalParts.id) {
      dialogRef.instance.id = modalParts.id;
    }

    if (modalParts.payload) {
      dialogRef.instance.payload = modalParts.payload;
    }

    //処理待ち用の実装 こっちで返して処理待ちしたい人はどうぞみたいな感じにしてもいい
    const subject = new Subject();
    dialogRef.instance.modalClose = this.getWaitSubject(subject);
    return await this.waitEvent(subject);
  }
}

/**
 * モーダル画面を開いた際に、開いた側においてモーダル画面を操作したい場合に、モーダル画面を保持するためのインタフェース
 * ModalService.showSubModal()にて、引数に設定された場合には、DailogRefを保持することができる
 */
export interface DialogRefHolder {
  setDialogRef(ref: ComponentRef<ModalBaseComponent>): void;
}
