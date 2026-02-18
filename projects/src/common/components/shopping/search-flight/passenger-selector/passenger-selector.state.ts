export type PassengersCount = {
  adultCount: number;
  youngAdultCount: number;
  childCount: number;
  infantCount: number;
  companion?: boolean;
};

export interface PassengerData {
  count: PassengersCount;
  infantCountFlag: boolean;
  childAgeFlag?: boolean;
  infantAgeFlag?: boolean;
}

export const DefaultPassengersCount = {
  ADULT: 1,
  YOUNG_ADULT: 0,
  CHILD: 0,
  INFANT: 0,
} as const;

export const MaxPassengersCount = {
  ADULT: 9,
  YOUNG_ADULT: 9,
  CHILD: 8,
  INFANT: 9,
} as const;

export const OldDomesticAswMaxPassengersCount = {
  ADULT: 6,
  YOUNG_ADULT: 6,
  CHILD: 6,
  INFANT: 6,
} as const;

export const NewDomesticAswMaxPassengersCount = {
  CHILD: 9,
} as const;
