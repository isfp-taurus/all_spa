import { NgModule } from '@angular/core';
import { CommonLibModule } from '@lib/services';
import { HeaderService } from './header.service';

@NgModule({
  providers: [HeaderService],
  imports: [CommonLibModule],
})
export class HeaderServiceModule {}
