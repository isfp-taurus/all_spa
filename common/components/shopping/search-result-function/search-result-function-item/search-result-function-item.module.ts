import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchResultFunctionItemComponent } from './search-result-function-item.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [SearchResultFunctionItemComponent],
  imports: [CommonModule, TranslateModule, ReactiveFormsModule],
  exports: [SearchResultFunctionItemComponent],
})
export class SearchResultFunctionItemModule {}
