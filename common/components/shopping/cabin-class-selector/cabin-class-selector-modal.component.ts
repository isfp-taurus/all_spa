import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { CabinClassSelectorOutput, FlightType } from './cabin-class-selector.state';
import { Subject } from 'rxjs';
import { CommonLibService } from '@lib/services';
import { ShoppingLibService } from '@common/services';
import { CabinClassOptionList } from '@common/services/shopping/shopping-lib/shopping-lib.state';

@Component({
  selector: 'asw-cabin-class-selector-modal',
  templateUrl: './cabin-class-selector-modal.component.html',
})
export class CabinClassSelectorModalComponent extends SupportModalBlockComponent {
  constructor(private common: CommonLibService, private _shoppingLibService: ShoppingLibService) {
    super(common);
  }

  public cabinList: Array<CabinClassOptionList> = [];

  init(): void {
    //キャビンクラスリストを取得する
    const isJapanOnly = this.payload?.data?.flightType === 'domestic';
    this.cabinList = this._shoppingLibService.getCabinList(isJapanOnly);
    //呼び出し元に渡すcabinClassTypeをいれたsubjectが、payloadで渡されてきたら、設定しておく
    this._subject = this.payload.subject;

    //フライト検索画面での検索条件のキャビンクラスを保持
    this.selected = this.payload?.data?.selectedCabinClassType;

    //画面表示の選択肢を設定するメソッド呼び出し
    this.initializeCabinClassOptionList();
  }

  destroy(): void {}

  reload(): void {}

  /** formControlNameに指定する文字列 */
  public readonly FORM_GROUP_NAME = 'radioCabinClass';

  /** 表示リストタイプ(国内線用リスト(domestic)/国際線用リスト(international))*/
  private _flightType: FlightType = 'international';

  /** radioボタンのvalue値にあたる選択値を呼び出し元から設定*/
  public selected: string = '';

  /** 確定した選択肢のvalue*/
  private selectedValue: string = '';

  /** モーダル外に値を流すSubject */
  private _subject!: Subject<CabinClassSelectorOutput>;

  /** 国内線用または国際線用を呼び出し元から設定 */
  get flightType(): FlightType {
    return this._flightType;
  }
  set flightType(value: FlightType) {
    if (this._flightType !== value) {
      this._flightType = value;
    }
  }

  /** radioボタンのグループ radioボタンの入力をバインドするので選択中の要素番号としても使用する*/
  public formGroupCabinClass: FormGroup<{ radioCabinClass: FormControl }> = new FormGroup({
    radioCabinClass: new FormControl(),
  });

  //画面描画用パラメータ
  public cabinClassOptionList: Array<CabinClassOptionList> = [];

  /** 画面表示する選択肢を設定する */
  private initializeCabinClassOptionList() {
    /** 初期選択状態の設定 リストのvalue値がselectedに設定されていれば、その値が選択済みになる*/
    if (this.selected !== '') {
      this.formGroupCabinClass.setValue({ radioCabinClass: this.selected });
      this.selectedValue = this.selected;
    } else {
      //呼び出し元から値が渡されていない場合、選択肢の先頭を初期値とする
      this.formGroupCabinClass.setValue({ radioCabinClass: this.cabinClassOptionList[0].value });
      this.selectedValue = this.cabinClassOptionList[0].value;
    }
  }

  /**
   * スクロールバー表示判定
   * ヘッダーフッター、コンテンツのサイズからボディの高さを設定
   * 一定の高さ以上になるとスクロールするように制御
   */
  public override resize() {
    const scroll = this.modalBody?.nativeElement?.scrollTop ?? 0;
    if (this.modalBody) {
      this.modalBody.nativeElement.style.height = '';
      if (this.modalContents) {
        this.modalContents.nativeElement.style.height = '';
      }
      this.modalInitioalHeight = this.modalBody.nativeElement.offsetHeight;
    }
    if (this.modalContents) {
      this.modalContents.nativeElement.classList.remove('is-fullscroll-r01-p030-m09');
    }
    const minWindowHight = 375;
    let setModalBodyHeightFlag = true;
    const windowH = window.innerHeight;
    if (windowH < minWindowHight) {
      setModalBodyHeightFlag = false;
    }
    const headerH = this.modalHead ? this.modalHead.nativeElement.offsetHeight : 0;
    const footerH = this.modalFooter ? this.modalFooter.nativeElement.offsetHeight : 0;
    const isSmallScreen = window.matchMedia('(max-width: 767px)').matches;
    let margin = 0;
    margin = isSmallScreen ? 48 : 128;
    if (this.modalBody && this.modalContents) {
      if (setModalBodyHeightFlag) {
        const setVal = windowH - margin - headerH - footerH;
        this.modalSetHeight = setVal;
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
      } else {
        const setVal = windowH - margin;
        this.modalContents.nativeElement.style.height = setVal + 'px';
        this.modalContents.nativeElement.classList.add('is-fullscroll-r01-p030-m09');
        if (this.modalFooter && this.modalFooter.nativeElement.classList.hasClass('is-shadow')) {
          this.modalFooter.nativeElement.classList.remove('is-shadow');
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

  /** モーダルを閉じる */
  public closeModal() {
    this.close();
  }

  public applyCabinClassSelector() {
    //モーダル展開前の値と確定値が異なる場合、選択確定値を変更しイベントで値を返却する
    if (this.selectedValue !== this.formGroupCabinClass.value.radioCabinClass) {
      this.selectedValue = this.formGroupCabinClass.value.radioCabinClass;

      this._subject.next({
        cabinClassType: this.selectedValue,
      });
    }
    this.closeModal();
  }

  /** キャンセルボタン */
  public cancelCabinClassSelector() {
    //選択状態をモーダル展開前に戻す
    this.formGroupCabinClass.setValue({ radioCabinClass: this.selectedValue });
    this.closeModal();
  }
}
