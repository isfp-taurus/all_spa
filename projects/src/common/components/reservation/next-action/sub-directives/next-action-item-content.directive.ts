import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[aswNextActionItemContent]',
})
export class NextActionItemContentDirective {
  itemTemplate: TemplateRef<unknown>;

  constructor(private templateRef: TemplateRef<unknown>) {
    this.itemTemplate = this.templateRef;
  }
}
