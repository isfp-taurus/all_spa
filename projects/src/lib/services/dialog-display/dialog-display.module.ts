import { NgModule } from '@angular/core';
import { DialogDisplayService } from './dialog-display.service';
import { Overlay } from '@angular/cdk/overlay';
import { DialogModule } from '../../components/base-ui-components/dialog/dialog.module';

/**
 * 確認ダイアログ表示用Module
 */
@NgModule({
  providers: [DialogDisplayService, Overlay],
  imports: [DialogModule],
})
export class DialogDisplayServiceModule {}
