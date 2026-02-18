import { BooleanInput, coerceBooleanProperty, coerceCssPixelValue } from '@angular/cdk/coercion';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { ANIMATION_PAGE_LOADING, ANIMATION_PAGE_PROMOTION_LOADING } from './page-loading.animation.config';
import { AswContextStoreService, AswMasterService } from '../../../services';

/**
 * プロモーション画像タイプ
 */
interface PromotionImageType {
  /** プロモーション画像のURLリスト（sp, tab, pc順） */
  imageUrls: string[];
  /** プロモーション画像のalt文言キー */
  promotionAltMsgKey: string;
}

/**
 * [SharedUI] ローディング画面
 *
 * @implements OnInit
 */
@Component({
  selector: 'asw-page-loading',
  templateUrl: './page-loading.component.html',
  styleUrls: ['./page-loading.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLoadingComponent implements OnInit {
  public options!: AnimationOptions;

  public optionsPromotion!: AnimationOptions;

  public promotionImageList: PromotionImageType[] = [];

  private _loading = false;
  @Input()
  public get loading(): boolean {
    return this._loading;
  }
  public set loading(value: BooleanInput) {
    this._loading = coerceBooleanProperty(value);
    this._changePageTop(this._loading);
    this._keyFucHandle(this._loading);
    this._changeDetectorRef.markForCheck();
  }

  private _promotion = false;
  @Input()
  public get promotion(): boolean {
    return this._promotion;
  }
  public set promotion(value: BooleanInput) {
    this._promotion = coerceBooleanProperty(value);
    if (this._loading) {
      const classList = this._document.documentElement!.classList;
      this._promotion ? classList.add('asw-cdk-global-scrollblock') : classList.remove('asw-cdk-global-scrollblock');
    }
    this._changeDetectorRef.markForCheck();
  }

  private _listenTabFuc?: () => void;

  @ViewChild('loadingRef')
  public loadingRef?: ElementRef;

  @ViewChild('loadingPromotionRef')
  public loadingPromotionRef?: ElementRef;

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _changeDetectorRef: ChangeDetectorRef,
    private _masterSvc: AswMasterService,
    private _contextSvc: AswContextStoreService,
    private _renderer: Renderer2
  ) {
    this.options = {
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: ANIMATION_PAGE_LOADING,
    };
    this.optionsPromotion = {
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: ANIMATION_PAGE_PROMOTION_LOADING,
    };
  }

  public ngOnInit(): void {
    // プロモーション画像情報を取得する
    const baseUrl = this._masterSvc.getMPropertyByKey('application', 'promotion.loading.image.server');
    const imagePath = this._masterSvc.getMPropertyByKey('application', 'promotion.loading.image.path');
    const { lang } = this._contextSvc.aswContextData;
    if (baseUrl && imagePath) {
      let promotionImageList: PromotionImageType[] = [];
      for (let i = 1; i < 4; i++) {
        const promotionImageInfo: PromotionImageType = {
          imageUrls: this._getImageUrls(`${baseUrl}${imagePath}`, lang, `0${i}`),
          promotionAltMsgKey: `alt.promotionImage.0${i}`,
        };
        promotionImageList.push(promotionImageInfo);
      }
      this.promotionImageList = promotionImageList;
    }
  }

  private _getImageUrls(url: string, lang: string, num: string): string[] {
    const deviceTypes = ['sp', 'tab', 'pc'];
    const imageUrls = deviceTypes.map((device) => {
      return url
        .replace(/{{device}}/g, device)
        .replace(/{{lang}}/g, lang)
        .replace(/{{num}}/g, num);
    });
    return imageUrls;
  }

  private _changePageTop(isLoading: boolean) {
    const containerEl = this._document.getElementById('anchor-page-top');
    let root = this._document.documentElement!;
    const documentClassList = root.classList;
    if (this.promotion) {
      root = containerEl!;
    }
    if (isLoading) {
      // ローディング中のスタイル設定
      root.classList.add('asw-page-loading');

      // プロモーションモード時、スクロールバー表示できるように対応（既存cdkスタイル上書き）
      if (this.promotion) {
        documentClassList.add('asw-cdk-global-scrollblock');
        this.loadingPromotionRef?.nativeElement.focus();
      } else {
        this.loadingRef?.nativeElement.focus();
      }
    } else {
      // ローディング解除後、ローディング関連のスタイルをクリア
      documentClassList.remove('asw-page-loading');
      containerEl!.classList.remove('asw-page-loading');
      documentClassList.remove('asw-cdk-global-scrollblock');

      // ロード終了後にフォーカスを戻す
      containerEl?.focus();
    }
  }

  private _keyFucHandle(isLoading: boolean) {
    if (isLoading) {
      // ローディング中のkeyイベントを監視し、tab key(keyCode:9)とenter key(keyCode:13)とspace key(keyCode:32)を無効化にする
      this._listenTabFuc = this._renderer.listen('document', 'keydown', (event) => {
        if (event.keyCode === 9 || event.keyCode === 13 || event.keyCode === 32) {
          event.preventDefault();
          event.stopPropagation();
        }
      });
    } else if (this._listenTabFuc) {
      // listenerを削除
      this._listenTabFuc();
    }
  }
}
