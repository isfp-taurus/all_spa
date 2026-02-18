import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
} from '@angular/core';
import { SupportClass } from '../../../components/support-class';
import { TabItemComponent } from './tabs-item.component';

/**
 * [BaseUI] tab
 * タブコンポーネント
 *
 * 動的に追加する場合updateTab()をコールすること
 *
 * @param id HTMLに設定するID
 * @param activeNum 有効なtabの番号
 * 使い方　asw-tab-itemをmetaに記載する
 * <asw-tab #tabListComponent >
 *     <asw-tab-item title="タブ1">
 *         <ssn-sample-page-child1 #tabComponent1></ssn-sample-page-child1>
 *     </asw-tab-item>
 *     <asw-tab-item title="タブ2">
 *         <ssn-sample-page-child2></ssn-sample-page-child2>
 *     </asw-tab-item>
 *     <asw-tab-item title="タブ3" [disable]="tuikaTabDisable">
 *         <ssn-sample-page-child2></ssn-sample-page-child2>
 *     </asw-tab-item>
 * </asw-tab>
 *
 *
 */
@Component({
  selector: 'asw-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent extends SupportClass implements AfterContentInit {
  constructor(private _changeDetector: ChangeDetectorRef) {
    super();
  }

  destroy() {}

  @ContentChildren(TabItemComponent) tabs!: QueryList<TabItemComponent>;

  public tabComponentList: Array<{ title: string; component: any }> = [];

  public _activeNum = 0;

  @Input()
  public id: string = 'TabComponent';

  @Input()
  set activeNum(index: number) {
    this._activeNum = index; //コンテンツの初期化より早く設定される可能性があるため判定しない、範囲外を設定したとしても特に問題なし
    this.selectEvent.emit(index);
  }
  get activeNum() {
    return this._activeNum;
  }

  @Output()
  selectEvent = new EventEmitter<number>();

  ngAfterContentInit(): void {
    this.subscribeService(
      'TabComponent-ngAfterContentInit',
      this.tabs.changes,
      (state: QueryList<TabItemComponent>) => {
        this.updateTab();
      }
    );
    this.updateTab();
  }

  public updateTab() {
    this.tabComponentList = this.tabs
      .toArray()
      .filter((data) => data.disable === false)
      .map((data) => {
        return { title: data.title, component: data.content };
      });
    this._changeDetector.markForCheck();
  }

  tabClick(index: number) {
    if (index < this.tabComponentList.length && index !== this.activeNum) {
      this.activeNum = index;
    }
  }
}
