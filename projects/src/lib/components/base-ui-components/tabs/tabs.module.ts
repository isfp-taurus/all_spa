import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabComponent } from './tabs.component';
import { TabItemComponent } from './tabs-item.component';

@NgModule({
  imports: [CommonModule],
  declarations: [TabComponent, TabItemComponent],
  exports: [TabComponent, TabItemComponent],
})
export class TabModule {}
