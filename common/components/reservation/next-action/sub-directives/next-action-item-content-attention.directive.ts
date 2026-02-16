import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[aswNextActionItemContentAttention]',
})
export class NextActionItemContentAttentionDirective {
  itemTemplate: TemplateRef<unknown>;

  constructor(private templateRef: TemplateRef<unknown>) {
    this.itemTemplate = this.templateRef;
  }
}
