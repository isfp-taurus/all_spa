import { OverlayRef } from '@angular/cdk/overlay';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FareOptionList, FareOptionValue } from '../../interfaces';
import { BaseModalComponent, ModalType } from '../../components/base-modal/base-modal.component';
import { MasterDataService } from '../../services/master-data.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * 運賃オプションモーダルComponent
 */
@Component({
  selector: 'asw-fare-option-modal',
  templateUrl: './fare-option-modal.component.html',
})
export class FareOptionModalComponent implements OnInit {
  /**
   * overlayRef
   */
  public overlayRef?: OverlayRef;

  /**
   * モーダル種別
   */
  public modalType: ModalType = '02';

  /**
   * フッタ有無
   */
  public hasFooter = true;

  /**
   * focus要素
   */
  public focusElement?: any;

  /**
   * 運賃オプション情報
   */
  public fareOptions?: FareOptionList[];

  /**
   * 現在運賃オプション
   */
  public currentFareoption?: string;

  /**
   * 運賃フォームコントロール
   */
  public fareFormControl: FormControl;

  @Output()
  public buttonClick$: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild(BaseModalComponent)
  public baseModal!: BaseModalComponent;

  constructor(private _masterDataService: MasterDataService, private _translateSvc: TranslateService) {
    this.fareFormControl = new FormControl();
    this.fareOptions = this._masterDataService.getFareOptionList('2');
    this._translateSvc.onLangChange.subscribe(() => {
      this.fareOptions = this._masterDataService.getFareOptionList('2');
    });
  }

  /**
   * 初期化処理
   */
  public ngOnInit(): void {
    this.fareFormControl.setValue(this.currentFareoption);
  }

  /**
   * 運賃オプションモーダル適用ボタン押下処理
   */
  public apply() {
    this.buttonClick$.emit(this.fareFormControl?.value);
  }

  /**
   * 運賃オプションモーダル閉じるボタン押下処理
   */
  public close() {
    this.baseModal.close();
  }

  /**
   * 運賃プロパティ取得
   * @param fareOptionValue 運賃オプション
   * @param displayType 表示タイプ
   * @returns
   */
  public getFareProperty(fareOptionValue?: FareOptionValue | string, displayType?: 'label' | 'description'): string {
    if (typeof fareOptionValue !== 'string') {
      let property = '';
      switch (displayType) {
        case 'label':
          property = fareOptionValue?.PD_940 || property;
          break;
        case 'description':
          property = fareOptionValue?.PD_003 || property;
          break;
      }
      return property;
    } else {
      return '';
    }
  }
}
