/**
 * モーダル画面表示用のコンポーネント
 */
import { OverlayRef } from '@angular/cdk/overlay';
import {
  Component,
  Input,
  ViewChild,
  ViewContainerRef,
  Type,
  ChangeDetectionStrategy,
  AfterViewInit,
} from '@angular/core';
import {
  SupportModalBlockComponent,
  SupportModalUiComponent,
  SupportModalIdSubComponent,
  SupportModalIdComponent,
} from '../../../components/support-class';
import { CommonLibService, ModalService } from '../../../services';
import { ModalIdTemplateComponent } from './modal-id-template.component';
import {
  LModalBgClassType,
  LModalBodyClassType,
  LModalClassType,
  LModalContentsClassType,
  LModalContentsWidthType,
  LModalFooterClassType,
  LModalHeaderClassType,
  LModalInnerClassType,
  ModalType,
  ModalTypeClassValue,
} from './modal.state';

/**
 * モーダル画面表示用のコンポーネント
 */
@Component({
  selector: 'asw-modal-base',
  templateUrl: './modal-base.component.html',
  styleUrls: ['./modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalBaseComponent extends SupportModalUiComponent implements AfterViewInit {
  constructor(___common: CommonLibService, private _modalService: ModalService) {
    super(___common);
  }

  //デザインで適用するクラス
  public lmodalClass: LModalClassType = LModalClassType.TYPE1;
  public lmodalBgClass: LModalBgClassType = LModalBgClassType.TYPE1;
  public lmodalInnerClass: LModalInnerClassType = LModalInnerClassType.TYPE1;
  public lmodalContentsClass: LModalContentsClassType = LModalContentsClassType.TYPE1;
  public lmodalContentsClassWidth: LModalContentsWidthType = LModalContentsWidthType.NONE;
  public lmodalHeaderClass: LModalHeaderClassType = LModalHeaderClassType.TYPE1;
  public lmodalBodyClass: LModalBodyClassType = LModalBodyClassType.TYPE1;
  public lmodalFooterClass: LModalFooterClassType = LModalFooterClassType.TYPE1;

  @ViewChild('view', { read: ViewContainerRef }) view!: ViewContainerRef;

  @Input()
  public overlayRef!: OverlayRef;

  /**
   * focus要素
   */
  public focusElement?: any;

  @Input()
  public modalWidth: LModalContentsWidthType | null = null;

  public close = (value?: any, isCallbackRestricted?: boolean) => {
    if (this.closeEvent && !isCallbackRestricted) {
      this.closeEvent(value);
    }
    if (this.modalClose) {
      this.modalClose(value);
    }
    if (this.focusElement) {
      this.focusElement.focus();
    }
    this.overlayRef.dispose();
  };

  /**
   * モーダル起動後に背景のタップ時の閉じる機能友好を切り替えるための処理
   * @param value
   */
  public setCloseBackEnable = (value: boolean) => {
    this.closeBackEnable = value;
  };

  @Input()
  public block!: Type<SupportModalBlockComponent>;

  @Input()
  public closeBackEnable = false;

  @Input()
  public payload: any = null;

  @Input()
  public idPayload: {
    header: Type<SupportModalIdSubComponent> | null;
    footer: Type<SupportModalIdSubComponent> | null;
    content: Type<SupportModalIdComponent>;
  } | null = null;

  public _modalType: ModalType = ModalType.TYPE1;
  @Input()
  get modalType() {
    return this._modalType;
  }
  set modalType(value: ModalType) {
    this._modalType = value;
    this.lmodalClass = ModalTypeClassValue[value].lmodalClass;
    this.lmodalBgClass = ModalTypeClassValue[value].lmodalBgClass;
    this.lmodalInnerClass = ModalTypeClassValue[value].lmodalInnerClass;
    this.lmodalContentsClassWidth = ModalTypeClassValue[value].LModalContentsClassWidth;
    this.lmodalContentsClass = ModalTypeClassValue[value].lmodalContentsClass;
    this.lmodalHeaderClass = ModalTypeClassValue[value].lmodalHeaderClass;
    this.lmodalBodyClass = ModalTypeClassValue[value].lmodalBodyClass;
    this.lmodalFooterClass = ModalTypeClassValue[value].lmodalFooterClass;
    if (this.modalWidth === null) {
      this.modalWidth = this.lmodalContentsClassWidth;
    }
  }

  @Input()
  public closeEvent: ((value?: any) => void) | null = null;

  //処理待ち用
  @Input()
  public modalClose!: (value?: any) => void;

  public isShadow = false;

  //instance
  private _instance!: SupportModalBlockComponent;

  reload(): void {}
  init(): void {}
  destroy(): void {
    this._modalService.closeModal();
  }

  // コンテンツ初期化後の処理
  ngAfterViewInit(): void {
    this._modalService.openModal();
    // viewに展開
    const componentRef = this.view.createComponent(this.block);
    this._instance = componentRef.instance;
    // 展開したクラスに情報を詰めていく
    this._instance.payload = this.payload;
    this._instance.close = this.close;
    this._instance.setCloseBackEnable = this.setCloseBackEnable;
    this._instance.lmodalContentsClassWithWidth = this.lmodalContentsClass + ' ' + this.modalWidth;
    this._instance.lmodalHeaderClass = this.lmodalHeaderClass;
    this._instance.lmodalBodyClass = this.lmodalBodyClass;
    this._instance.lmodalFooterClass = this.lmodalFooterClass;
    this._instance.modalType = this.modalType;
    if (this.idPayload && this.block === ModalIdTemplateComponent) {
      // ID付きモーダルの場合情報を追加
      (this._instance as ModalIdTemplateComponent).header = this.idPayload.header;
      (this._instance as ModalIdTemplateComponent).footer = this.idPayload.footer;
      (this._instance as ModalIdTemplateComponent).content = this.idPayload.content;
      (this._instance as ModalIdTemplateComponent).onClickCloseBack = this.onEscapeEvent;
    }
    //HTMLに埋め込んだViewContainerRefの初期化タイミングがView更新後のためAfterViewInitでcreateComponentを行う必要がある。
    //通常 子⇒親の順でView更新されますが、親のView更新後にコンポーネントを作成しているため子コンポーネントのView更新がされない
    //そのため子のView更新（detectChanges）を明示的に行う必要がある
    componentRef.hostView.detectChanges();

    //フォーカス処理
    const el2 = document.activeElement;
    if (el2 && 'blur' in el2) {
      (el2 as HTMLElement).blur(); //ボタン等からフォーカスを外しておく(エンター押下でもう一度タブが開いてしまったりするので)
    }
    this.focusToButton();
  }

  // 背景のオーバーレイを押したとき
  onEscapeEvent() {
    if (this.closeBackEnable) {
      this.close();
    }
  }
}
