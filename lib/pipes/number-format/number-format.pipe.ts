import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberFormat',
  pure: false,
})
export class NumberFormatPipe implements PipeTransform {
  constructor() {}

  /**
   * 数値フォーマット
   *
   * @param {number} value 数値
   * @param {string} delimiter 区切り文字
   * @returns {string}
   */
  transform(value: number, delimiter: string): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
  }
}
