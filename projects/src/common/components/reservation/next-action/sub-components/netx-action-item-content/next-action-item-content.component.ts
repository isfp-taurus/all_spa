import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

@Component({
  selector: 'asw-next-action-item-content',
  templateUrl: './next-action-item-content.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextActionItemContentComponent implements OnInit {
  @ViewChild('template', { static: true })
  template!: TemplateRef<unknown>;

  @Input() title = '';
  @Input() titleAria = '';
  @Input() titleClass = '';
  @Input() content = '';
  @Input() contentClass = '';

  viewContainerRef = inject(ViewContainerRef);

  ngOnInit(): void {
    this.viewContainerRef.createEmbeddedView(this.template);
  }
}
