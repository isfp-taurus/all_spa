/**
 * IDありモーダル画面用のベースコンポーネント メインコンテンツ用
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonLibService, PageInitService } from '../../services';
import { AswCommonType, DynamicParams, LogType } from '../../interfaces';
import { SupportModalIdSubComponent } from './support-modal-id-sub-component';
import { AswCommonState } from '../../store';
import { asapScheduler } from 'rxjs/internal/scheduler/asap';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { filter, take } from 'rxjs/operators';
import { NavigationEnd, Router, RouterEvent, Event } from '@angular/router';

/**
 * IDありモーダル画面用のベースコンポーネント メインコンテンツ用
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
 * ・（モーダルのメイン部分のHMML）に入るHTMLを記載してください
 * ・モーダル表示時に指定したpayloadがクラス内のpayloadに代入されます
 * ・close処理はモーダル表示時に上書きされモーダルを閉じる処理が代入されます。
 * ・subPageIdにページID、subFunctionIdに部品IDをセットしてください、起動時にstoreに書き込み、モーダルを閉じる際にはクリアします。
 * ・headerRef、footerRefにはモーダル表示の際にヘッダーフッターに指定したコンポーネントが代入されます。
 */
@Component({
  template: '',
})
export abstract class SupportModalIdComponent extends SupportModalIdSubComponent implements OnInit, OnDestroy {
  constructor(private ____common: CommonLibService, private __pageInitService: PageInitService) {
    super(____common);
  }

  public abstract subPageId: string;
  public abstract subFunctionId: string;
  public params: Observable<DynamicParams> = of({});
  public pageViewInitParam: any = {};
  public headerRef: SupportModalIdSubComponent | null = null; //ヘッダー画面
  public footerRef: SupportModalIdSubComponent | null = null; //フッター画面
  public autoInitEnd: boolean = true; //画面初期化完了をテンプレート側でするか、独自のタイミングがある場合falseにする

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

  override ngOnInit(): void {
    this.__pageInitService.startInit();
    super.ngOnInit();
    const updateValue: Partial<AswCommonState> = {
      [AswCommonType.SUB_PAGE_ID]: this.subPageId,
      [AswCommonType.SUB_FUNCTION_ID]: this.subFunctionId,
    };
    asapScheduler.schedule(() => {
      this.____common.aswCommonStoreService.updateAswCommon(updateValue);
      this.__pageInitService.subDynamicInit(this.params);
      if (this.autoInitEnd) {
        this.__pageInitService.endInit();
      }
      /**
       *  pageViewInitログ出力
       */
      this.subscribeService(
        'loggerDatadogServiceInit',
        this.____common.aswCommonStoreService.getAswCommon$().pipe(
          filter((data) => data.subPageId === this.subPageId && data.subFunctionId === this.subFunctionId),
          take(1)
        ),
        () => {
          this.____common.loggerDatadogService.info(LogType.PAGE_VIEW, this.pageViewInitParam);
        }
      );
    });
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    const updateValue: Partial<AswCommonState> = {
      [AswCommonType.SUB_PAGE_ID]: '',
      [AswCommonType.SUB_FUNCTION_ID]: '',
    };
    //注意喚起エリアをクリア
    this.____common.errorsHandlerService.clearRetryableError('subPage');
    this.____common.alertMessageStoreService.removeAllSubAlertMessage();
    this.____common.aswCommonStoreService.updateAswCommon(updateValue);

    this.clearDynamicMessageId();
  }

  override _reload() {
    super._reload();
  }

  public clearDynamicMessageId() {
    this.____common.dynamicContentService.clearDynamicContent('subPage');
  }
}
