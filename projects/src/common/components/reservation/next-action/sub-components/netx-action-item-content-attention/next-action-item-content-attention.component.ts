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
  selector: 'asw-next-action-item-content-attention',
  templateUrl: './next-action-item-content-attention.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextActionItemContentAttentionComponent implements OnInit {
  @ViewChild('template', { static: true })
  template!: TemplateRef<unknown>;

  @Input() canBeClicked = false;
  @Input() attentionMessage = '';

  viewContainerRef = inject(ViewContainerRef);

  ngOnInit(): void {
    this.viewContainerRef.createEmbeddedView(this.template);
  }
}
