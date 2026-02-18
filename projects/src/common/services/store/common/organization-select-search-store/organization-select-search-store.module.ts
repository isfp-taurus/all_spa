import { NgModule } from '@angular/core';
import { OrganizationSelectSearchStoreModule } from '@common/store';
import { EffectsModule } from '@ngrx/effects';
import { OrganizationSelectSearchStoreService } from './organization-select-search-store.service';

@NgModule({
  providers: [OrganizationSelectSearchStoreService],
  imports: [OrganizationSelectSearchStoreModule, EffectsModule.forRoot()],
})
export class OrganizationSelectSearchStoreServiceModule {}
