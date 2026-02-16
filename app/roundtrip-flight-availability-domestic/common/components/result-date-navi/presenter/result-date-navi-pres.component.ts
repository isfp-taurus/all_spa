import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ResultDateNavi, ResultDateNaviStateEnum } from '../../../interfaces';

/**
 * 7日間カレンダーPresComponent
 */
@Component({
  selector: 'asw-result-date-navi-pres',
  templateUrl: './result-date-navi-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultDateNaviPresComponent {
  /**
   * 7日間カレンダー
   */
  @Input()
  public sevenDayCalendar?: Array<ResultDateNavi>;

  /**
   * 往復種別
   */
  @Input()
  public type?: 'out' | 'return';

  /**
   * 出発日ボタンイベント
   */
  @Output()
  public selectCalendar$: EventEmitter<string> = new EventEmitter<string>();

  /**
   * 選択済み出発日かどうかを判定する
   * @param calendar カレンダー日付
   * @returns
   */
  public isSelected(calendar: ResultDateNavi): boolean {
    return calendar.state === ResultDateNaviStateEnum.SELECTED;
  }

  /**
   * ステップ初期値を取得する
   * @returns ステップ初期値
   */
  public selectedInit(): number {
    if (this.sevenDayCalendar) {
      let initNumber = 0;
      this.sevenDayCalendar.forEach((calendar: ResultDateNavi, index: number) => {
        if (calendar.state === ResultDateNaviStateEnum.SELECTED) {
          initNumber = index + 1;
        }
      });
      const calcArrayRight = [6, 7];
      const calcArrayCenter = [3, 4, 5];
      if (calcArrayRight.includes(initNumber)) {
        return 4;
      } else if (calcArrayCenter.includes(initNumber)) {
        return initNumber - 2;
      } else {
        return 0;
      }
    }
    return 0;
  }

  /**
   * 利用不可出発日かどうかを判定する
   * @param calendar カレンダー日付
   * @returns
   */
  public isDisabled(calendar: ResultDateNavi): boolean {
    return calendar.state === ResultDateNaviStateEnum.DISABLED;
  }

  /**
   * 出発日ボタン押下処理
   * @param calendar カレンダー日付
   */
  public selectCalendar(calendar: ResultDateNavi) {
    if (!this.isDisabled(calendar)) {
      this.selectCalendar$.emit(calendar.date);
    }
  }

  /**
   * カルーセル初期位置の設定
   */
  public calcCarouselPostion() {
    let initPosition: 'left' | 'center' | 'right' = 'center';
    this.sevenDayCalendar?.forEach((value: ResultDateNavi, index: number) => {
      if (this.isSelected(value)) {
        if (index === 0 || index === 1) {
          initPosition = 'left';
        } else if (index === 5 || index === 6) {
          initPosition = 'right';
        }
      }
    });
    return initPosition;
  }
}
