import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortModalComponent } from './sort-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from '@lib/components';
import { SortModalService } from './sort-modal.service';
import { BaseModalModule } from '../base-modal/base-modal.module';
import { StaticMsgModule } from '@lib/pipes';

/**
 * ソート条件モーダルModule
 */
@NgModule({
  declarations: [SortModalComponent],
  imports: [CommonModule, BaseModalModule, FormsModule, ReactiveFormsModule, ButtonModule, StaticMsgModule],
  exports: [SortModalComponent],
  providers: [SortModalService],
})
export class SortModalModule {}
