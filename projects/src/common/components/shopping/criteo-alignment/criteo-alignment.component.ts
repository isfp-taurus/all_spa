import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CriteoAlignmentInfo } from './criteo-alignment.state';

/**
 * criteo連携情報
 */
@Component({
  selector: 'asw-criteo-alignment',
  templateUrl: './criteo-alignment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CriteoAlignmentComponent {
  @Input() criteoAlignmentInfo: CriteoAlignmentInfo = {};

  constructor() {}
}
