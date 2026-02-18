import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  QueryList,
  ViewChildren,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { Parent } from '../../../components/base-ui-components/base-ui.component';
import { SelectGroupComponent } from '../../../components/base-ui-components/form/select/select-group.component';
import { SelectComponent } from '../../../components/base-ui-components/form/select/select.component';

/**
 * [SharedUI] 日付プルダウン（年月）
 *
 * @extends {SelectGroupComponent}
 * @implements {OnInit}
 */
@Component({
  selector: 'asw-select-date-ym',
  templateUrl: './select-date-ym.component.html',
  providers: [{ provide: Parent, useExisting: forwardRef(() => SelectDateYmComponent) }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDateYmComponent extends SelectGroupComponent implements OnInit, AfterViewInit {
  /**
   * 年月プルダウンの表示タイプ
   * - ym: 年・月の順で表示する
   * - my: 月・年の順で表示する（デフォルト）
   */
  @Input()
  public displayType: 'ym' | 'my' = 'my';

  /**
   * 年プルダウンの選択値の最小年～最大年の日付範囲
   * - （必須）最小年・最大年の順で指定する
   *   - 例：[2022, 2099]
   */
  @Input()
  public yearRange?: number[];

  /**
   * 年月プルダウンの初期値
   * - 指定する際は、yyyyMM形式で指定する
   *   - 例：202204
   */
  @Input()
  public set defaultYm(value: string) {
    this.data = value;
  }

  /** 年のラベル */
  public yearLabel = 'label.yearPulldown';

  /** 月のラベル */
  public monthLabel = 'label.monthPulldown';

  /** 年未選択のラベル */
  public yearsEmpty = 'label.year';

  /** 月未選択のラベル */
  public monthsEmpty = 'label.month';

  /** 年プルダウンの選択値一覧 */
  public years!: string[];

  /** 月プルダウンの選択値一覧 */
  public months!: string[];

  /**
   * group内のselect
   */
  @ViewChildren('select')
  public selectChildren!: QueryList<SelectComponent>;

  /**
   * OnInit
   * - 年月プルダウンの選択値一覧を取得する
   */
  public ngOnInit() {
    this.months = this._getMonths();
    this.yearRange && (this.years = this._getYears(this.yearRange));
  }

  /**
   * AfterViewInit
   * - groupData設定
   */
  public ngAfterViewInit() {
    this.convertAndSetGroupData();
  }

  /**
   * group内の全てのselect取得
   *
   * @override
   * @readonly
   */
  public override get selects(): SelectComponent[] {
    const children = this.selectChildren ? this.selectChildren.toArray() : [];
    return <Array<SelectComponent>>children;
  }

  /**
   * `change`イベント
   *
   * @override
   * @param event
   */
  public override onChangeHandle(event?: Event) {
    let date = '';
    this.selects.forEach((select) => {
      if (this.displayType === 'ym') {
        date = date + select.selected;
      } else {
        date = select.selected + date;
      }
    });
    this.data = date;
    this.onChange(event);
    this.triggerGroupValidState();
  }

  /**
   * 年月の分割
   * （例：'202302'→['2023', '02']）
   *
   * @override
   * @param value
   * @returns
   */
  public override convertData(value: string): string[] {
    if (value && value.length === 6) {
      const year = value.substring(0, 4);
      const month = value.substring(4, 6);
      if (this.displayType === 'ym') {
        return [year, month];
      } else {
        return [month, year];
      }
    } else {
      return ['', ''];
    }
  }

  /**
   * 月プルダウンの選択値一覧取得
   *
   * @returns
   */
  private _getMonths(): string[] {
    const monthsArray = [this.monthsEmpty];
    for (let i = 1; i <= 12; i++) {
      monthsArray.push(i.toString().padStart(2, '0'));
    }
    return monthsArray;
  }

  /**
   * 年プルダウンの選択値一覧取得
   *
   * @returns
   */
  private _getYears(yearRange: Array<number>): string[] {
    const yearsArray = [this.yearsEmpty];
    if (this.yearRange) {
      if (yearRange && yearRange.length > 0) {
        yearsArray.push(yearRange[0].toString());
        for (let i = 1; i <= this.yearRange[1] - this.yearRange[0]; i++) {
          yearsArray.push((this.yearRange[0] + i).toString());
        }
      }
    }
    return yearsArray;
  }
}
