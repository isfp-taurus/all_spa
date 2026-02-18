import {
  AfterContentInit,
  AfterViewChecked,
  ApplicationRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  inject,
  Input,
  NgZone,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NextActionItemContentDirective } from '../../sub-directives/next-action-item-content.directive';
import { NextActionItemContentAttentionDirective } from '../../sub-directives/next-action-item-content-attention.directive';

@Component({
  selector: 'asw-next-action-item',
  templateUrl: './next-action-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextActionItemComponent implements OnInit, AfterContentInit {
  @ViewChild('template', { static: true })
  template!: TemplateRef<unknown>;
  @ViewChild('templateCanBeClicked', { static: true })
  templateCanBeClicked!: TemplateRef<unknown>;
  @ViewChild('templateCantBeClicked', { static: true })
  templateCantBeClicked!: TemplateRef<unknown>;

  displayedTemplate!: TemplateRef<unknown>;

  @ContentChildren(NextActionItemContentDirective)
  contentList!: QueryList<NextActionItemContentDirective>;
  @ContentChildren(NextActionItemContentAttentionDirective)
  contentAttentionList!: QueryList<NextActionItemContentAttentionDirective>;

  @Input() set canBeClicked(canBeClicked: boolean) {
    this.displayedTemplate = canBeClicked ? this.templateCanBeClicked : this.templateCantBeClicked;
  }
  @Input() title = '';
  @Input() titleAria = '';
  @Input() textContent = '';
  @Input() itemId = '';

  @Output() clickNextAction = new EventEmitter();

  viewContainerRef = inject(ViewContainerRef);

  private ngZone = inject(NgZone);

  private _contentInitialized = false;

  get hasContentList() {
    if (!this._contentInitialized) {
      return false;
    }
    return this.contentList?.length > 0;
  }

  get hasContentAttentionList() {
    if (!this._contentInitialized) {
      return false;
    }
    return this.contentAttentionList?.length > 0;
  }

  ngOnInit(): void {
    this.viewContainerRef.createEmbeddedView(this.template);
  }

  ngAfterContentInit(): void {
    this.ngZone.runOutsideAngular(() => {
      queueMicrotask(() => {
        this.ngZone.run(() => {
          this._contentInitialized = true;
        });
      });
    });
  }

  onClick() {
    this.clickNextAction.emit();
  }
}
