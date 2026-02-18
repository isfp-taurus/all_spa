import { NgModule } from '@angular/core';
import { CommonLibModule } from '../common-lib/common-lib.module';
import { InitialInfluxService } from './initial-influx.service';

@NgModule({
  providers: [InitialInfluxService],
  imports: [CommonLibModule],
})
export class InitialInfluxServiceModule {}
