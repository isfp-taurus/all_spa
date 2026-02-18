import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ModalService } from '../../../services';
import { Subscription, filter, fromEvent, throttleTime } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { BOTTOM_FLOAT_URLS, BottomFloatUrlType, CHANGE_CONTAINER_COLOR_URLS } from '@common/helper';
import { isSP, isTB } from '../../../helpers';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'asw-basic-page-layout',
  templateUrl: './basic-page-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicPageLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  @ContentChild(HeaderComponent) headerComponent!: HeaderComponent;
  @ViewChild('belowHeaderContents') belowHeaderContents!: ElementRef;
  @ViewChild('outsideContents') outsideContents!: ElementRef;
  /** モーダルを表示した際にl-containerクラスのaria-hiddenを切り替える */
  public isAriaHidden = false;
  private modalOpenSubscription?: Subscription;
  private modalCloseSubscription?: Subscription;
  private toggleHeaderSubscription?: Subscription;
  private resizeSubscription?: Subscription;
  private isTB = false;
  private isSP = false;
  public isChangeContainerColor = false;

  constructor(
    private _modalService: ModalService,
    private _changeDetector: ChangeDetectorRef,
    private _router: Router,
    @Inject(DOCUMENT) private _document: Document,
    private _renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.isTB = isTB();
    this.isSP = isSP();
    this.modalOpenSubscription = this._modalService.onModalOpen$.subscribe(() => {
      this.isAriaHidden = true;
      this._changeDetector.detectChanges();
    });
    this.modalCloseSubscription = this._modalService.onModalClose$.subscribe(() => {
      this.isAriaHidden = false;
      this._changeDetector.detectChanges();
    });
    // 画面リサイズ検知
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(throttleTime(500))
      .subscribe(() => {
        this.isTB = isTB();
        this.isSP = isSP();
        this._changeDetector.markForCheck();

        this.updatePaddingForBottomFloat();
      });
    // URL変更検知
    this._router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const currentUrl = this._router.url;
      //queryParam(URLの?のパラメタ)を除去
      const tempUrlRemoveForParam = currentUrl.includes('?')
        ? currentUrl.substring(0, currentUrl.indexOf('?'))
        : currentUrl;
      //Fragment(URLの#のパラメタ)を除去
      const tempUrlRemoveForFragment = tempUrlRemoveForParam.includes('#')
        ? tempUrlRemoveForParam.substring(0, tempUrlRemoveForParam.indexOf('#'))
        : tempUrlRemoveForParam;
      this.updatePaddingForBottomFloat();
      this.isChangeContainerColor = CHANGE_CONTAINER_COLOR_URLS.includes(tempUrlRemoveForFragment);
      this._changeDetector.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    // ヘッダーが開いてるときは裏のコンテンツをフォーカス不可にする
    if (this.headerComponent) {
      this.toggleHeaderSubscription = this.headerComponent.menuOpenEvent.subscribe((isOpen) => {
        if (isOpen) {
          this.belowHeaderContents.nativeElement.setAttribute('inert', '');
          this.outsideContents.nativeElement.setAttribute('inert', '');
        } else {
          this.belowHeaderContents.nativeElement.removeAttribute('inert');
          this.outsideContents.nativeElement.removeAttribute('inert');
        }
      });
    }
  }

  /**
   * フローティングナビ変更イベント
   */
  private updatePaddingForBottomFloat(): void {
    const currentUrl = this._router.url;
    const matchData = BOTTOM_FLOAT_URLS.find((data) => data.url === currentUrl);
    this.adjustContainerPadding(matchData ? this.getAdjustedFloatHeight(matchData) : null);
    this._changeDetector.detectChanges();
  }

  private getAdjustedFloatHeight(matchData: BottomFloatUrlType): number {
    if (this.isTB) return matchData.float_height_tb;
    if (this.isSP) return matchData.float_height_sp;
    return matchData.float_height_pc;
  }

  private adjustContainerPadding(height: number | null): void {
    const containerEl = this._document.getElementsByClassName('l-container')[0];
    if (!containerEl) return;
    if (height !== null) {
      this._renderer.setStyle(containerEl, 'padding-bottom', `${(height + 8).toString()}px`);
    } else {
      this._renderer.removeStyle(containerEl, 'padding-bottom');
    }
  }

  ngOnDestroy(): void {
    this.modalOpenSubscription?.unsubscribe();
    this.modalCloseSubscription?.unsubscribe();
    this.toggleHeaderSubscription?.unsubscribe();
    this.resizeSubscription?.unsubscribe();
  }
}
