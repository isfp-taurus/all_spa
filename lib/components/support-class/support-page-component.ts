/**
 * 画面IDをもつページで共通して持つ親クラス
 *
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AswCommonType, DynamicParams, LogType } from '../../interfaces';
import { CommonLibService, PageInitService } from '../../services';
import { AswCommonState } from '../../store';
import { of } from 'rxjs/internal/observable/of';
import { filter, take } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { SupportComponent } from './support-component';

/**
 * ページで共通して持つ親クラス
 */
@Component({
  template: '',
})
export abstract class SupportPageComponent extends SupportComponent implements OnInit, OnDestroy {
  constructor(private ___common: CommonLibService, private __pageInitService: PageInitService) {
    super(___common);
  }

  abstract pageId: string;
  abstract functionId: string;
  public params: Observable<DynamicParams> = of({});
  public pageViewInitParam: any = {};
  public autoInitEnd: boolean = true; //画面初期化完了をテンプレート側でするか、独自のタイミングがある場合falseにする

  override ngOnInit(): void {
    this.__pageInitService.startInit();
    super.ngOnInit();
    const updateValue: Partial<AswCommonState> = {
      [AswCommonType.PAGE_ID]: this.pageId,
      [AswCommonType.FUNCTION_ID]: this.functionId,
      [AswCommonType.IS_ENABLED_LOGIN]: this.___common.aswCommonStoreService.aswCommonData.isEnabledLogin ?? false,
      [AswCommonType.IS_UPGRADE]: this.___common.aswCommonStoreService.aswCommonData.isUpgrade ?? false,
    };
    this.___common.aswCommonStoreService.updateAswCommon(updateValue);
    if (this.autoInitEnd) {
      this.__pageInitService.endInit(this.params);
    }
    /**
     *  pageViewInitログ出力
     */
    this.subscribeService(
      'loggerDatadogServiceInit',
      this.___common.aswCommonStoreService.getAswCommon$().pipe(
        filter((data) => data.pageId === this.pageId && data.functionId === this.functionId),
        take(1)
      ),
      () => {
        this.___common.loggerDatadogService.info(LogType.PAGE_VIEW, this.pageViewInitParam);
      }
    );
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    //注意喚起エリアをクリア
    this.___common.errorsHandlerService.clearRetryableError('page');
    this.___common.alertMessageStoreService.removeAllAlertMessage();
    this.clearDynamicMessageId();
  }

  override _reload() {
    this.___common.alertMessageStoreService.removeAllAlertMessage();
    super._reload();
  }

  public clearDynamicMessageId() {
    this.___common.dynamicContentService.clearDynamicContent('page');
  }
}
