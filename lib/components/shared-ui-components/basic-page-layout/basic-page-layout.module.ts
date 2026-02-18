import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasicPageLayoutComponent } from './basic-page-layout.component';
import { SemiFixedAreaDirectiveModule } from '@lib/directives';

@NgModule({
  imports: [CommonModule, SemiFixedAreaDirectiveModule],
  declarations: [BasicPageLayoutComponent],
  exports: [BasicPageLayoutComponent],
})
export class BasicPageLayoutModule {}
