/**
 *
 * @param baseDate 選択可能な開始日
 * @param lastDate 選択可能な最終日
 * @param previousSectionDate 前区間の日付
 * @param maxDates 選択可能最大日、選択可能日数の両方が未選択又は両方が指定された場合、選択可能日数を優先する
 * @param isRoundTrip 往復同時選択フラグ
 * @param itemName 項目名文言
 */
export type DateSelectorParts = {
  baseDate?: Date;
  lastDate?: Date;
  previousSectionDate?: Date;
  maxDates?: number;
  isRoundTrip?: boolean;
  itemName?: string;
};

export type DayStatus = (typeof DayStatus)[keyof typeof DayStatus];
export const DayStatus = {
  NONE: 0,
  PREVIOUS_SELECTED: 1,
  SELECTED: 2,
  SELECTED_FROM: 3,
  SELECTED_SECTION: 4,
  SELECTED_TO: 5,
  DISABLE: 6,
  HIDE: 7,
} as const;

export type MonthStatus = (typeof MonthStatus)[keyof typeof MonthStatus];
export const MonthStatus = { NONE: 0, INITIAL_MONTH: 1, LAST_MONTH: 2 } as const;

export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];
export const DayOfWeek = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 } as const;

export type WeeklyName = {
  shortName: string;
  fullName: string;
};
export type MonthName = {
  shortName: string;
  fullName: string;
};

export type DateInformation = {
  id: string;
  num: number;
  week: number;
  WeeklyName: string;
  status: DayStatus;
  isFirst: boolean;
  isLast: boolean;
  isHoliday: boolean;
  title: string;
  yearNum: number;
  monthNum: number;
  time: number;
  isPrevious: boolean;
};

export type WeekInformation = {
  date: DateInformation[];
};

export type MonthInformation = {
  id: string;
  yearNum: number;
  dispName: string;
  selectName: string;
  //monthName: MonthName;
  subDispName: string;
  monthStatus: MonthStatus;
  monthNum: number;
  maxNum: number;
  week: WeekInformation[];
  enabled: boolean;
  previousEnabled: boolean;
  nextEnabled: boolean;
};

export type YearInformation = {
  yearNum: number;
  month: MonthInformation[];
};

export type DateSection = {
  fromDate: Date;
  toDate: Date;
  year: YearInformation[];
};
