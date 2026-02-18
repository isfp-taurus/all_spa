import { NgModule } from '@angular/core';
import { ModalService } from './modal.service';
import { Overlay } from '@angular/cdk/overlay';
// import { ModalModule } from '../../components';

@NgModule({
  imports: [],
  providers: [ModalService, Overlay],
})
export class ModalServiceModule {}
