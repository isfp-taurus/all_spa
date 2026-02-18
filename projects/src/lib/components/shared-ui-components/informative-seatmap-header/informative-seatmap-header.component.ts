import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderService } from '../../../services';
import { CommonConstants } from '@conf/app.constants';

/**
 * S03-P030_シートマップ（参照）画面用ヘッダー
 */
@Component({
  selector: 'asw-informative-seatmap-header',
  templateUrl: './informative-seatmap-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InformativeSeatmapHeaderComponent {
  public logoFilePath = CommonConstants.LOGO_FILE_PATH;
  constructor(public headerService: HeaderService) {}
}
