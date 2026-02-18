import { DOCUMENT } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  defaultGoshokaiNetLoginDynamicParams,
  GoshokaiNetLoginDynamicParams,
  ReservationFunctionIdType,
  ReservationPageIdType,
} from '@common/interfaces';
import { SupportPageComponent } from '@lib/components/support-class';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService, PageInitService } from '@lib/services';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'asw-goshokai-net-login-cont',
  templateUrl: './goshokai-net-login-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoshokaiNetLoginContComponent extends SupportPageComponent implements AfterViewInit {
  override autoInitEnd = false;
  pageId: string = ReservationPageIdType.GOSHOKAI_NET_LOGIN;
  functionId: string = ReservationFunctionIdType.LOGIN;

  public dynamicSubject = new BehaviorSubject<GoshokaiNetLoginDynamicParams>(defaultGoshokaiNetLoginDynamicParams());

  constructor(
    private _common: CommonLibService,
    private _pageInitService: PageInitService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _staticMsg: StaticMsgPipe,
    private _title: Title,
    @Inject(DOCUMENT) private _document: Document
  ) {
    super(_common, _pageInitService);
  }
  ngAfterViewInit(): void {
    this._changeDetectorRef.detectChanges();
  }

  reload(): void {}
  init(): void {
    this.params = this.dynamicSubject.asObservable();
    const reffer = this._document.referrer;
    this.dynamicSubject.next({
      isJapaneseSite: this._common.isJapaneseOffice(),
    });
    this.setPageTitle();
  }
  destroy(): void {}

  /**
   * タイトルをセット
   */
  setPageTitle() {
    // タブバーに画面タイトルを設定する
    this.forkJoinService(
      'GoshokaiNetTitle',
      [this._staticMsg.get('label.introduce.title'), this._staticMsg.get('label.aswPageTitle')],
      ([str1, str2]) => {
        this._title.setTitle(str1 + str2);
      }
    );
  }
}
