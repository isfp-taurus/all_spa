import { NgModule } from '@angular/core';
import { PageLeaveGuard } from './page-leave.guard';
import { DialogConfirmModule } from '../dialog-confirm';

@NgModule({
  imports: [DialogConfirmModule],
  providers: [PageLeaveGuard],
})
export class PageLeaveModule {}
